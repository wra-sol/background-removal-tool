# ---- Bun & Node Stage ----
FROM oven/bun:1.1.13 as bun-build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --production
COPY . .

# Expose the port
EXPOSE 3000

# Start the Bun server
CMD ["bun", "server.ts"]
