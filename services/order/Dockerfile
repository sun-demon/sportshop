# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY services/order/package*.json ./
COPY services/order/prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY services/order/src ./src
COPY services/order/tsconfig.json ./
COPY services/order/nest-cli.json ./

# Copy shared-types
COPY shared-types ./shared-types

# Create symlink to shared-types from ./src
RUN ln -s ../shared-types ./src/shared-types

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript (NestJS build)
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy built application (NestJS builds to dist/)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs
USER nodejs

EXPOSE 3003

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
