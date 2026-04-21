FROM python:3.11-slim

WORKDIR /app
ENV PYTHONPATH=/app/src

COPY requirements.txt .

RUN pip install --trusted-host pypi.python.org \
                --trusted-host pypi.org \
                --trusted-host files.pythonhosted.org \
                --no-cache-dir -r requirements.txt

RUN pip install debugpy

COPY . .

EXPOSE 8000

EXPOSE 5678

CMD ["python3", "-m", "debugpy", "--listen", "0.0.0.0:5678", "-m", "uvicorn", "ec_payment.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--reload-dir", "/app/src"]
