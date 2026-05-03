import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    app_name: str = "My FastAPI App"
    database_url: str = os.getenv("DATABASE_URL")  # pyright: ignore[reportAssignmentType]
    midtrans_server_key: str = os.getenv("MIDTRANS_SERVER_KEY")  # pyright: ignore[reportAssignmentType]
    midtrans_client_key: str = os.getenv("MIDTRANS_CLIENT_KEY")  # pyright: ignore[reportAssignmentType]


settings = Settings()
