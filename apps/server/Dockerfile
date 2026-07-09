FROM oven/bun:1.1.13

WORKDIR /app

COPY package.json ./
RUN bun install --production

COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "server.ts"]
