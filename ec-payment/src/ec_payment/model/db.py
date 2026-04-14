import os
from typing import Generator
from sqlalchemy import create_engine
from sqlmodel import SQLModel, Session

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///ec_payment_dev.db")

# connect_args={"check_same_thread": False} is required for SQLite
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    print("Initializing db session")
    with Session(engine) as session:
        yield session