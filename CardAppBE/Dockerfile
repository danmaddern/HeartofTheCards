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

# Production deps only, then regenerate Prisma client for this OS/arch
RUN npm ci --omit=dev && npx prisma generate

# Compiled output from builder stage
COPY --from=builder /app/dist ./dist

# Persist uploaded images across restarts (mount a volume over this in prod)
RUN mkdir -p uploads

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
