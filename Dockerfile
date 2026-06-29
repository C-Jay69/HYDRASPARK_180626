FROM oven/bun:1.3-slim AS builder

WORKDIR /app

# Copy workspace files
COPY package.json bun.lock ./
COPY packages/web/package.json ./packages/web/

# Install all deps
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build frontend
RUN cd packages/web && bun run build

# --- Production image ---
FROM oven/bun:1.3-slim

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./
COPY --from=builder /app/packages/web/package.json ./packages/web/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/web/node_modules ./packages/web/node_modules
COPY --from=builder /app/packages/web/src ./packages/web/src
COPY --from=builder /app/packages/web/dist ./packages/web/dist
COPY --from=builder /app/.env.example ./.env.example

EXPOSE 3020

CMD ["bun", "packages/web/src/server.ts"]
