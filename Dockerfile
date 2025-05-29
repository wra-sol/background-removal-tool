# ---- Bun & Node Stage ----
FROM oven/bun:1.1.13 as bun-build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --production
COPY . .

# ---- Final Stage ----
FROM python:3.11-slim
WORKDIR /app

# Copy the app from bun-build stage
COPY --from=bun-build /app /app

# Copy Bun binary from the bun-build stage
COPY --from=bun-build /usr/local/bin/bun /usr/local/bin/bun

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libgl1 \
        libglib2.0-0 \
        build-essential \
        git \
        && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

ENV PATH="/usr/local/bin:$PATH"

# Expose the port
EXPOSE 3000

# Start the Bun server
CMD ["bun", "server.ts"]
