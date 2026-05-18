FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

COPY CardAppBE/package*.json ./
COPY CardAppBE/prisma ./prisma/

RUN npm ci

RUN npx prisma generate

COPY CardAppBE/ .

RUN npx nest build

# ─── Production image ────────────────────────────────────────────────────────

FROM node:20-alpine AS production

RUN apk add --no-cache openssl

WORKDIR /app

COPY CardAppBE/package*.json ./
COPY CardAppBE/prisma ./prisma/

RUN npm ci --omit=dev && npx prisma generate

COPY --from=builder /app/dist ./dist

RUN mkdir -p uploads

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
