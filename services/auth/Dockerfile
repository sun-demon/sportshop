# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY services/auth/package*.json ./
COPY services/auth/prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY services/auth/src ./src
COPY services/auth/tsconfig.json ./

# Copy shared-types
COPY shared-types ./shared-types

# Create symlink to shared-types from ./src
RUN ln -s ../shared-types ./src/shared-types

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs
USER nodejs

EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
