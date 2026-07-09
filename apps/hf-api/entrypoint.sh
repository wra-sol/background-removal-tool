#!/bin/bash
set -e

python preload_model.py

exec uvicorn app:app --host 0.0.0.0 --port "${PORT:-7860}"
