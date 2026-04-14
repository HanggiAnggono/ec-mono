from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field
from typing import Literal, Optional, Dict, Any


class CustomerDTO(BaseModel):
    first_name: str = Field(..., description="Customer first name")
    last_name: str = Field(..., description="Customer last name")
    email: str = Field(..., description="Customer email address")
    phone: str = Field(..., description="Customer phone number")


class CreatePaymentRequestDTO(BaseModel):
    order_id: str = Field(..., description="Unique order identifier")
    amount: int = Field(..., description="Payment amount in smallest currency unit (e.g., cents)")
    customer: CustomerDTO = Field(..., description="Customer details")
    description: Optional[str] = Field(None, description="Payment description")


class CreatePaymentResponseDTO(BaseModel):
    success: bool = Field(..., description="Whether the payment creation was successful")
    transaction_token: Optional[str] = Field(None, description="Midtrans transaction token")
    redirect_url: Optional[str] = Field(None, description="Payment redirect URL")
    order_id: str = Field(..., description="Order identifier")
    message: Optional[str] = Field(None, description="Response message")
    error: Optional[str] = Field(None, description="Error message if any")

class PaymentWebhookRequestDTO(BaseModel):
    transaction_time: datetime = Field(...)
    transaction_status: str = Field(...)
    transaction_id: str = Field(...)
    status_message: str = Field(...)
    status_code: str = Field(...)
    signature_key: str = Field(...)
    settlement_time: datetime = Field(...)
    payment_type: str = Field(...)
    order_id: str = Field(..., description="Order identifier")
    merchant_id: str = Field(...)
    gross_amount: float = Field(...)
    fraud_status: str = Field(...)
    currency: str = Field(..., description="Currency code")


class PaymentStatusResponseDTO(BaseModel):
    """
    A Pydantic model representing a detailed payment transaction response.
    """
    status_code: str = Field(..., description="HTTP status code equivalent for the transaction result.")
    transaction_id: str = Field(..., description="Unique ID for the transaction (UUID format).")

    # Use float or Decimal for monetary values
    gross_amount: float = Field(..., description="The gross amount of the transaction.")

    currency: Currency = Field(..., description="Currency code in ISO 4217 format.")
    order_id: str = Field(..., description="Unique ID for the merchant's order (UUID format).")
    payment_type: PaymentType = Field(..., description="The payment method used.")
    signature_key: str = Field(..., description="Hashed signature for verifying data integrity.")
    transaction_status: TransactionStatus = Field(..., description="The final status of the transaction.")
    fraud_status: Literal["accept", "deny", "challenge"] = Field(..., description="Result of the fraud detection analysis.")
    status_message: str = Field(..., description="A human-readable message about the status.")
    merchant_id: str = Field(..., description="The unique identifier for the merchant.")
    transaction_type: str = Field(..., description="Type of transaction processing.")
    issuer: str = Field(..., description="The party that issued the payment instrument.")
    acquirer: str = Field(..., description="The payment processor that acquired the transaction.")

    # Dates are parsed automatically into datetime objects if format is correct
    transaction_time: datetime = Field(..., description="The time the transaction was initiated.")
    settlement_time: datetime = Field(..., description="The time the transaction was successfully settled.")
    expiry_time: datetime = Field(..., description="The time the payment request would have expired.")

# 1. Define specific ENUMS for certain fields
class Currency(str, Enum):
    IDR = "IDR"
    # Add other currencies if supported

class PaymentType(str, Enum):
    QRIS = "qris"
    # Add other payment types

class TransactionStatus(str, Enum):
    SETTLEMENT = "settlement"
    PENDING = "pending"
    FAILURE = "failure"