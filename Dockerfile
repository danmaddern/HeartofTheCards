FROM node:20 AS builder

WORKDIR /app

COPY CardAppBE/package*.json ./
COPY CardAppBE/prisma ./prisma/

RUN npm ci

# Generate binaries for both the build env (musl) and production env (Debian)
RUN PRISMA_CLI_BINARY_TARGETS=linux-musl-openssl-3.0.x,debian-openssl-3.0.x npx prisma generate

COPY CardAppBE/ .

RUN npx nest build

# ─── Production image ────────────────────────────────────────────────────────

FROM node:20 AS production

WORKDIR /app

COPY CardAppBE/package*.json ./
COPY CardAppBE/prisma ./prisma/

RUN npm ci --omit=dev

# Copy both generated Prisma binaries from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

COPY --from=builder /app/dist ./dist

RUN mkdir -p uploads

EXPOSE 3001

# Force Prisma to use the Debian OpenSSL 3.x binary at runtime
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node

CMD ["node", "dist/src/main"]
