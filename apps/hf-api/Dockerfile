FROM python:3.11-slim

WORKDIR /code

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libgl1 \
        libglib2.0-0 \
        build-essential \
        git \
    && rm -rf /var/lib/apt/lists/*

# Copy only the requirements file first
COPY requirements.txt ./
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app code (excluding other requirements.txt files)
COPY app.py ./
COPY preload_model.py ./
COPY entrypoint.sh ./

# Set up model cache directory
ENV TRANSFORMERS_CACHE=/code/model_cache
ENV HF_HOME=/code/model_cache
RUN mkdir -p /code/model_cache && chmod 755 /code/model_cache

EXPOSE 7860
ENTRYPOINT ["./entrypoint.sh"]