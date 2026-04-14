from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import List, Optional
from uuid import uuid4
from sqlmodel import Field, SQLModel


class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class PaymentMethod(str, Enum):
    EWALLET = "ewallet"
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    PAYPAL = "paypal"
    BANK_TRANSFER = "bank_transfer"

class Payment(SQLModel, table=True):
    id: str = Field(default=uuid4().__str__(), primary_key=True, description="Unique payment identifier")
    order_id: str = Field(..., description="Associated order identifier")
    transaction_id: str = Field(..., description="Transaction identifier")
    amount: Decimal = Field(..., description="Payment amount", gt=0)
    currency: str = Field(..., description="Currency code (e.g., USD, EUR)")
    status: PaymentStatus = Field(..., description="Payment status")
    method: PaymentMethod | None = Field(default=None, description="Payment method used")
    created_at: datetime = Field(default=datetime.now(), description="Payment creation timestamp")
    updated_at: datetime | None = Field(default=None, description="Payment last update timestamp")
    description: Optional[str] = Field(None, description="Payment description", max_length=500)
    meta: Optional[str] = Field(default=None, description="Additional metadata", max_length=2000)
    payment_url: Optional[str] = Field(default=None, description="Payment URL")


