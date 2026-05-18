FROM node:20 AS builder

WORKDIR /app

COPY CardAppBE/package*.json ./
COPY CardAppBE/prisma ./prisma/

RUN npm ci

# Explicitly generate the musl+OpenSSL3 binary (Render build env is musl-based)
RUN PRISMA_CLI_BINARY_TARGETS=linux-musl-openssl-3.0.x npx prisma generate

COPY CardAppBE/ .

RUN npx nest build

# ─── Production image ────────────────────────────────────────────────────────

FROM node:20-alpine AS production

RUN apk add --no-cache openssl

WORKDIR /app

COPY CardAppBE/package*.json ./
COPY CardAppBE/prisma ./prisma/

RUN npm ci --omit=dev

# Copy the pre-built musl+OpenSSL3 Prisma binary from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

COPY --from=builder /app/dist ./dist

RUN mkdir -p uploads

EXPOSE 3001

# Bypass Prisma's OpenSSL auto-detection — force the correct musl+OpenSSL3 binary
CMD ["/bin/sh", "-c", "PRISMA_QUERY_ENGINE_LIBRARY=/app/node_modules/.prisma/client/libquery_engine-linux-musl-openssl-3.0.x.so.node node dist/src/main"]
