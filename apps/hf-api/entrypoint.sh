#!/bin/bash
set -e

# Preload the model
python preload_model.py

# Debug: Show current directory and files
echo "Current working directory:"
pwd
echo "Files in current directory:"
ls -l
echo "Files in apps/hf-api:"
ls -l ./apps/hf-api || true

# Start the server
export PYTHONPATH="$(dirname "$0")/../.."
exec uvicorn app:app --host 0.0.0.0 --port ${PORT:-7860}