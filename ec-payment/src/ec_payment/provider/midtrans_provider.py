from midtransclient import Snap, CoreApi
from typing import Any
import os
import logging

from ec_payment.core.interfaces import PaymentProvider
from ec_payment.model.payment import PaymentMethod, PaymentStatus

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

server_key = os.getenv("MIDTRANS_SERVER_KEY")
if server_key is None:
    raise ValueError("MIDTRANS_SERVER_KEY environment variable is not set.")

# Initialize Midtrans clients
snap = Snap(is_production=False, server_key=server_key)
core_api = CoreApi(is_production=False, server_key=server_key)


class MidtransProvider(PaymentProvider):
    def create_payment(
        self, order_id: str, amount: int, customer: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Create a payment transaction using Midtrans Snap API

        Args:
            order_id: Unique order identifier
            amount: Payment amount in smallest currency unit
            customer: Customer details dictionary

        Returns:
            dict containing transaction response from Midtrans
        """
        try:
            param = {
                "transaction_details": {"order_id": order_id, "gross_amount": amount},
                "customer_details": customer,
            }

            logger.info(
                f"Creating Midtrans transaction for order_id: {order_id}, amount: {amount}"
            )

            # Create transaction and return the response
            transaction_response = snap.create_transaction(param)

            logger.info(
                f"Midtrans transaction created successfully for order_id: {order_id}"
            )
            return transaction_response

        except Exception as e:
            logger.error(
                f"Failed to create Midtrans transaction for order_id: {order_id}, error: {str(e)}"
            )
            raise Exception(f"Failed to create payment transaction: {str(e)}")

    def handle_webhook(self, payload: dict[str, Any]) -> dict[str, Any]:
        """
        Handle Midtrans webhook notifications

        Args:
            payload: Webhook payload from Midtrans

        Returns:
            dict containing processed webhook response
        """
        try:
            # Process webhook payload
            order_id = payload.get("order_id")
            transaction_status = payload.get("transaction_status")
            fraud_status = payload.get("fraud_status")

            logger.info(
                f"Processing webhook for order_id: {order_id}, status: {transaction_status}"
            )

            # Return processed webhook data
            return {
                "order_id": order_id,
                "transaction_status": transaction_status,
                "fraud_status": fraud_status,
                "processed": True,
            }

        except Exception as e:
            logger.error(f"Failed to process webhook: {str(e)}")
            raise Exception(f"Failed to process webhook: {str(e)}")

    def get_status(self, order_id: str) -> dict[str, Any]:
        """
        Get transaction status from Midtrans

        Args:
            order_id: Order identifier to check status for

        Returns:
            dict containing transaction status information
        """
        try:
            logger.info(f"Getting transaction status for order_id: {order_id}")

            # Get transaction status from Midtrans
            status_response = core_api.transactions.status(order_id)

            logger.info(f"Retrieved transaction status for order_id: {order_id}")
            return status_response

        except Exception as e:
            logger.error(
                f"Failed to get transaction status for order_id: {order_id}, error: {str(e)}"
            )
            raise Exception(f"Failed to get transaction status: {str(e)}")

    def get_status_name(self, status: str) -> PaymentStatus:
        match status:
            case "settlement":
                return PaymentStatus.COMPLETED
            case "pending":
                return PaymentStatus.PENDING
            case "failure":
                return PaymentStatus.FAILED
            case "cancel":
                return PaymentStatus.CANCELLED
            case _:
                logger.error(f"Unknown transaction status: {status}")

        return PaymentStatus.PENDING

    def get_payment_method(self, payment_type: str) -> PaymentMethod:
        match payment_type:
            case "gopay":
                return PaymentMethod.EWALLET
            case "credit_card":
                return PaymentMethod.CREDIT_CARD
            case "debit_card":
                return PaymentMethod.DEBIT_CARD
            case "paypal":
                return PaymentMethod.PAYPAL
            case "bank_transfer":
                return PaymentMethod.BANK_TRANSFER
            case _:
                logger.error(f"Unknown payment type: {payment_type}")

        return PaymentMethod.EWALLET

class Customer:
    """Customer data class for Midtrans transactions"""

    def __init__(self, first_name: str, last_name: str, email: str, phone: str):
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.phone = phone

    def to_dict(self) -> dict[str, Any]:
        """Convert customer object to dictionary"""
        return {
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "phone": self.phone,
        }
