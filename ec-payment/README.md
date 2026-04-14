# EC Payment API

A simple FastAPI-based payment and order management API with static data for demonstration purposes.

## Features

- **Hello World Endpoint**: Simple greeting endpoint
- **Payments API**: Get a list of all payments with detailed information
- **Orders API**: Get a list of all orders with items and customer details
- **Interactive Documentation**: Automatic API documentation with Swagger UI
- **Type Safety**: Full Pydantic model validation and serialization

## Requirements

- Python 3.14+
- Poetry (for dependency management)

## Installation

1. Clone the repository and navigate to the project directory:
```bash
cd /Users/hanggi/projects/ecommerce/ec-payment
```

2. Install dependencies using Poetry:
```bash
poetry install
```

## Running the Application

Start the FastAPI development server:

```bash
poetry run uvicorn src.ec_payment.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **Application**: http://localhost:8000
- **Interactive API Documentation (Swagger UI)**: http://localhost:8000/docs
- **Alternative API Documentation (ReDoc)**: http://localhost:8000/redoc

## API Endpoints

### 1. Hello World
- **URL**: `GET /`
- **Description**: Simple greeting endpoint
- **Response**: 
```json
{
  "message": "Hello World from EC Payment API!"
}
```

### 2. Get All Payments
- **URL**: `GET /payments`
- **Description**: Retrieve all payments with detailed information
- **Response**: Array of payment objects with fields:
  - `id`: Unique payment identifier
  - `order_id`: Associated order ID
  - `amount`: Payment amount (Decimal)
  - `currency`: Currency code (USD, EUR, etc.)
  - `status`: Payment status (pending, completed, failed, cancelled)
  - `method`: Payment method (credit_card, debit_card, paypal, bank_transfer)
  - `created_at`: Payment creation timestamp
  - `updated_at`: Last update timestamp
  - `description`: Optional payment description

### 3. Get All Orders
- **URL**: `GET /orders`
- **Description**: Retrieve all orders with items and customer details
- **Response**: Array of order objects with fields:
  - `id`: Unique order identifier
  - `customer_id`: Customer identifier
  - `items`: Array of order items (id, name, quantity, price)
  - `total_amount`: Total order amount (Decimal)
  - `currency`: Currency code
  - `status`: Order status (pending, processing, shipped, delivered, cancelled)
  - `created_at`: Order creation timestamp
  - `updated_at`: Last update timestamp
  - `shipping_address`: Optional shipping address
  - `notes`: Optional order notes

## Testing the API

You can test the API endpoints using curl:

```bash
# Test hello world endpoint
curl http://localhost:8000/

# Test payments endpoint
curl http://localhost:8000/payments

# Test orders endpoint
curl http://localhost:8000/orders
```

Or visit the interactive documentation at http://localhost:8000/docs to test the endpoints directly in your browser.

## Project Structure

```
src/ec_payment/
├── __init__.py          # Package initialization
├── main.py              # FastAPI application and endpoints
├── models.py            # Pydantic data models
└── data.py              # Static data for payments and orders
```

## Data Models

The API uses the following main data models:

- **Payment**: Represents a payment transaction
- **Order**: Represents a customer order
- **OrderItem**: Represents individual items within an order
- **PaymentStatus**: Enum for payment statuses
- **PaymentMethod**: Enum for payment methods
- **OrderStatus**: Enum for order statuses

All models include proper validation, type hints, and documentation using Pydantic.

## Development

The application uses:
- **FastAPI**: Modern, fast web framework for building APIs
- **Pydantic**: Data validation and serialization
- **Uvicorn**: ASGI server for running the application
- **Poetry**: Dependency management and packaging

For development, the server runs with auto-reload enabled, so changes to the code will automatically restart the server.