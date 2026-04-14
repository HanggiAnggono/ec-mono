from abc import ABC, abstractmethod
from typing import Dict, Any

class PaymentProvider(ABC):
    @abstractmethod
    def create_payment(self, order_id: str, amount: int, customer: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    def handle_webhook(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_status(self, order_id: str) -> Dict[str, Any]:
        pass