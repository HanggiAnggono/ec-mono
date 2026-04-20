from datetime import datetime
from decimal import Decimal
import json
import logging

from fastapi import HTTPException
from midtransclient.error_midtrans import MidtransAPIError
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, desc, select

from ec_payment.dto.payment_dto import (
    CreatePaymentRequestDTO,
    CreatePaymentResponseDTO,
    PaymentStatusResponseDTO,
    PaymentWebhookRequestDTO,
)
from ec_payment.model.payment import Payment, PaymentStatus
from ec_payment.provider.midtrans_provider import MidtransProvider

logger = logging.getLogger(__name__)


class PaymentService:
    def __init__(self):
        self.payment_provider = MidtransProvider()

    def create_payment(
        self, create_payment_request: CreatePaymentRequestDTO, db: Session
    ) -> CreatePaymentResponseDTO:
        try:
            logger.info(
                f"Processing payment creation for order_id: {create_payment_request.order_id}"
            )

            customer_dict = create_payment_request.customer.model_dump()
            transaction_response = self.payment_provider.create_payment(
                order_id=create_payment_request.order_id,
                amount=create_payment_request.amount,
                customer=customer_dict,
            )

            transaction_token = transaction_response.get("token", "")
            redirect_url = transaction_response.get("redirect_url")

            payment = Payment(
                order_id=create_payment_request.order_id,
                amount=Decimal(create_payment_request.amount),
                currency="IDR",
                status=PaymentStatus.PENDING,
                method=None,
                transaction_id="",
                description=create_payment_request.description,
                payment_url=redirect_url,
                meta=json.dumps(transaction_response),
            )
            db.add(payment)
            db.commit()
            db.refresh(payment)

            logger.info(
                f"Payment created successfully for order_id: {create_payment_request.order_id}"
            )

            return CreatePaymentResponseDTO(
                success=True,
                transaction_token=transaction_token,
                redirect_url=redirect_url,
                order_id=create_payment_request.order_id,
                message="Payment transaction created successfully",
                error=None,
            )
        except IntegrityError as e:
            db.rollback()
            logger.error(
                f"Failed to persist payment for order_id: {create_payment_request.order_id}, error: {str(e)}"
            )
            return CreatePaymentResponseDTO(
                success=False,
                transaction_token=None,
                redirect_url=None,
                order_id=create_payment_request.order_id,
                message="Failed to persist payment transaction",
                error=str(e),
            )
        except Exception as e:
            db.rollback()
            logger.error(
                f"Failed to create payment for order_id: {create_payment_request.order_id}, error: {str(e)}"
            )
            return CreatePaymentResponseDTO(
                success=False,
                transaction_token=None,
                redirect_url=None,
                order_id=create_payment_request.order_id,
                message="Failed to create payment transaction",
                error=str(e),
            )

    def handle_webhook(self, request: PaymentWebhookRequestDTO, db: Session):
        status = self.payment_provider.get_status_name(request.transaction_status)
        method = self.payment_provider.get_payment_method(request.payment_type)
        payment = db.exec(
            select(Payment).where(
                (Payment.order_id == request.order_id)
                | (Payment.transaction_id == request.transaction_id)
            )
        ).first()

        if payment is None:
            payment = Payment(
                status=status,
                currency=request.currency,
                order_id=request.order_id,
                amount=Decimal(request.gross_amount),
                transaction_id=request.transaction_id,
                method=method,
                description="",
                meta=request.model_dump_json(),
            )
            db.add(payment)
        else:
            payment.status = status
            payment.currency = request.currency
            payment.amount = Decimal(request.gross_amount)
            payment.transaction_id = request.transaction_id
            payment.method = method
            payment.updated_at = request.transaction_time
            payment.meta = request.model_dump_json()

        db.commit()
        db.refresh(payment)
        return payment

    def get_status(
        self, order_id: str, db: Session, refresh: bool = False
    ) -> PaymentStatusResponseDTO:
        payment = db.exec(
            select(Payment).where(Payment.order_id == order_id).order_by(desc(Payment.created_at))
        ).first()

        if payment is None:
            raise HTTPException(status_code=404, detail="Payment not found")

        if not refresh and not payment.transaction_id:
            return self._build_local_status_response(payment)

        try:
            status = self.payment_provider.get_status(
                reference_id=payment.transaction_id or payment.order_id
            )
            self._apply_remote_status(payment, status)
            db.add(payment)
            db.commit()
            db.refresh(payment)
            return PaymentStatusResponseDTO.model_validate(status)
        except MidtransAPIError as e:
            if "404" in str(e):
                return self._build_local_status_response(payment)
            raise HTTPException(
                status_code=502, detail="Failed to fetch payment status from Midtrans"
            )
        except Exception:
            raise HTTPException(status_code=500, detail="Failed to fetch payment status")

    def _build_local_status_response(self, payment: Payment) -> PaymentStatusResponseDTO:
        return PaymentStatusResponseDTO(
            status_code="200",
            transaction_id=payment.transaction_id or payment.id,
            gross_amount=float(payment.amount),
            currency=payment.currency,
            order_id=payment.order_id,
            payment_type=self._map_payment_type(payment),
            signature_key="",
            transaction_status=self._map_payment_status(payment.status),
            fraud_status="accept",
            status_message="Payment status returned from local record",
            merchant_id="",
            transaction_type="snap",
            issuer="",
            acquirer="",
            transaction_time=payment.created_at,
            settlement_time=payment.updated_at
            if payment.status == PaymentStatus.COMPLETED
            else None,
            expiry_time=None,
        )

    def _map_payment_status(self, status: PaymentStatus) -> str:
        match status:
            case PaymentStatus.COMPLETED:
                return "settlement"
            case PaymentStatus.FAILED:
                return "failure"
            case PaymentStatus.CANCELLED:
                return "cancel"
            case _:
                return "pending"

    def _apply_remote_status(self, payment: Payment, status: dict):
        payment.transaction_id = status.get("transaction_id") or payment.transaction_id
        payment.currency = status.get("currency") or payment.currency
        payment.amount = Decimal(str(status.get("gross_amount", payment.amount)))
        payment.status = self.payment_provider.get_status_name(
            status.get("transaction_status", "pending")
        )

        payment_type = status.get("payment_type")
        if payment_type:
            payment.method = self.payment_provider.get_payment_method(payment_type)

        payment.updated_at = datetime.now()
        payment.meta = json.dumps(status)

    def _map_payment_type(self, payment: Payment) -> str:
        if payment.method is None:
            return "other"

        if payment.method.value == "ewallet":
            try:
                payload = json.loads(payment.meta) if payment.meta else {}
            except json.JSONDecodeError:
                payload = {}
            return payload.get("payment_type", "other")

        return payment.method.value
