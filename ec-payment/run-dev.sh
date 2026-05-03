#!/bin/bash
PYTHONPATH=src python3 -m uvicorn ec_payment.main:app --host 0.0.0.0 --port 8000 --reload --reload-dir src
