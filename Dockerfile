# Multi-stage Dockerfile for CertiChain Fullstack App
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and package definitions
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm install --prefix server
RUN npm install --prefix client

# Copy source files
COPY server ./server
COPY client ./client

# Generate Prisma Client & Build TypeScript
RUN cd server && npx prisma generate && npm run build
RUN npm run build --prefix client

# Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY --from=builder /app/server/package*.json ./server/
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/prisma ./server/prisma
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 5000

CMD ["node", "server/dist/app.js"]
