FROM node:20-slim AS builder

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY CardAppBE/package*.json ./
COPY CardAppBE/prisma ./prisma/

RUN npm ci

RUN npx prisma generate

COPY CardAppBE/ .

RUN npx nest build

# ─── Production image ────────────────────────────────────────────────────────

FROM node:20-slim AS production

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY CardAppBE/package*.json ./
COPY CardAppBE/prisma ./prisma/

RUN npm ci --omit=dev && npx prisma generate

COPY --from=builder /app/dist ./dist

RUN mkdir -p uploads

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
