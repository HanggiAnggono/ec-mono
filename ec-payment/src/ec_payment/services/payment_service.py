from decimal import Decimal
import json
from fastapi import Depends
from sqlmodel import Session, desc
from typing import Dict, Any
import logging

from ec_payment.dto.payment_dto import CreatePaymentRequestDTO, CreatePaymentResponseDTO, CustomerDTO, PaymentWebhookRequestDTO
from ec_payment.provider.midtrans_provider import MidtransProvider
from ec_payment.model.payment import Payment, PaymentMethod, PaymentStatus
from ec_payment.model.db import get_session

# Set up logging
logger = logging.getLogger(__name__)


class PaymentService:
    def __init__(self):
        """Initialize PaymentService with MidtransProvider"""
        self.payment_provider = MidtransProvider()

    def create_payment(self, create_payment_request: CreatePaymentRequestDTO, db: Session) -> CreatePaymentResponseDTO:

        """
        Create a payment transaction using the configured payment provider

        Args:
            create_payment_request: Payment request DTO containing order details

        Returns:
            CreatePaymentResponseDTO: Response containing transaction details
        """
        try:
            logger.info(f"Processing payment creation for order_id: {create_payment_request.order_id}")

            # Convert CustomerDTO to dictionary for Midtrans
            customer_dict = create_payment_request.customer.model_dump()

            # Create payment using Midtrans provider
            transaction_response = self.payment_provider.create_payment(
                order_id=create_payment_request.order_id,
                amount=create_payment_request.amount,
                customer=customer_dict
            )

            # Extract relevant information from Midtrans response
            transaction_token = transaction_response.get('token', '')
            redirect_url = transaction_response.get('redirect_url')

            # Create a new Payment record with a 'pending' status
            payment = Payment(
                order_id=create_payment_request.order_id,
                amount=Decimal(create_payment_request.amount),
                currency="IDR",  # Assuming IDR, or get from request
                status=PaymentStatus.PENDING,
                method=None, # Placeholder, will be updated by webhook
                transaction_id=transaction_token, # Using token as initial transaction_id
                description=create_payment_request.description,
                payment_url=redirect_url,
                meta=json.dumps(transaction_response)
            )
            db.add(payment)
            db.commit()

            logger.info(f"Payment created successfully for order_id: {create_payment_request.order_id}")

            return CreatePaymentResponseDTO(
                success=True,
                transaction_token=transaction_token,
                redirect_url=redirect_url,
                order_id=create_payment_request.order_id,
                message="Payment transaction created successfully",
                error=None
            )

        except Exception as e:
            logger.error(f"Failed to create payment for order_id: {create_payment_request.order_id}, error: {str(e)}")

            return CreatePaymentResponseDTO(
                success=False,
                transaction_token=None,
                redirect_url=None,
                order_id=create_payment_request.order_id,
                message="Failed to create payment transaction",
                error=str(e)
            )

    def handle_webhook(
        self,
        request: PaymentWebhookRequestDTO,
        db: Session
    ):
        # create payment with ORM here
        # publish a payment created event
        status = self.payment_provider.get_status_name(request.transaction_status)
        method = self.payment_provider.get_payment_method(request.payment_type)
        payment = Payment(
            status=status,
            currency=request.currency,
            order_id=request.order_id,
            amount=Decimal(request.gross_amount),
            transaction_id=request.transaction_id,
            method=method,
            description=""
        )

        db.add(payment)
        db.commit()
        db.refresh(payment)
        return payment

    def get_status(self, order_id: str):
        status = self.payment_provider.get_status(order_id=order_id)
        return status