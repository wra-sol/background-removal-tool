#!/bin/bash
set -e

# Preload the model
python preload_model.py

# Start the server
exec uvicorn app:app --host :: --port 7860 