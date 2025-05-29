# ---- Bun & Node Stage ----
FROM oven/bun:1.1.13 as bun-build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --production
COPY . .

# ---- Python Stage ----
FROM python:3.11-slim as python-build
WORKDIR /app
COPY --from=bun-build /app /app
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        git \
        libgl1 \
        libglib2.0-0 \
        && rm -rf /var/lib/apt/lists/*
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ---- Final Stage ----
FROM python:3.11-slim
WORKDIR /app
COPY --from=python-build /app /app
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libgl1 \
        libglib2.0-0 \
        && rm -rf /var/lib/apt/lists/*
# Install Bun
RUN curl -fsSL https://bun.sh/install | bash && \
    mv /root/.bun/bin/bun /usr/local/bin/bun
ENV PATH="/usr/local/bin:$PATH"
# Expose the port
EXPOSE 3000
# Start the Bun server
CMD ["bun", "server.ts"] 