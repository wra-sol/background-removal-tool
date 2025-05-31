#!/bin/bash
set -e

# Preload the model
python preload_model.py

# Start the server
exec uvicorn apps.hf-api.app:app --host 0.0.0.0 --port ${PORT:-7860}