FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifests and schema first for better layer caching
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Generate Prisma client before compiling TypeScript
RUN npx prisma generate

COPY . .

RUN npx nest build

# ─── Production image ────────────────────────────────────────────────────────

FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

# Production deps only, then regenerate Prisma client for this OS/arch.
# Remove the linux-musl (OpenSSL 1.1) binary so only the OpenSSL 3.x one remains.
RUN npm ci --omit=dev && npx prisma generate && \
    rm -f /app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node

# Bake the correct engine path into the image so it's always honoured
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/node_modules/.prisma/client/libquery_engine-linux-musl-openssl-3.0.x.so.node

# Compiled output from builder stage
COPY --from=builder /app/dist ./dist

# Persist uploaded images across restarts (mount a volume over this in prod)
RUN mkdir -p uploads

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
