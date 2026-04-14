from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI
from sqlmodel import Session

from ec_payment.config import Settings
from ec_payment.dto.payment_dto import CreatePaymentRequestDTO, PaymentStatusResponseDTO, PaymentWebhookRequestDTO
from ec_payment.services.payment_service import PaymentService
from ec_payment.model.db import create_db_and_tables, get_session
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up...")
    create_db_and_tables()
    yield
    logger.info("Shutting down...")

app = FastAPI(
    title="EC Payment API",
    description="A simple payment and order management API",
    version="0.1.0",
    lifespan=lifespan
)

payment_svc = PaymentService()

@app.get("/")
async def hello_world():
    """Simple hello world endpoint"""
    return {"message": "Ok"}


@app.post("/create-payment")
async def create_transaction(payment_request: CreatePaymentRequestDTO, db: Session = Depends(get_session)):
    """Create Transaction"""
    resp = payment_svc.create_payment(payment_request, db)
    return resp

@app.post("/handle-webhook")
async def handle_webhook(webhook_request: PaymentWebhookRequestDTO, db: Session = Depends(get_session)):
  """Handle Webhook"""
  payment = payment_svc.handle_webhook(webhook_request, db)
  return payment


@app.get("/transaction/{order_id}", response_model=PaymentStatusResponseDTO)
async def get_transaction(order_id: str):
    order = payment_svc.get_status(order_id=order_id)
    return order