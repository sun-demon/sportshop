FROM node:20-alpine

WORKDIR /app

# Install workspace dependencies first for better layer caching.
COPY frontend/mfe-app/package*.json ./frontend/mfe-app/
COPY frontend/mfe-app/packages/host/package.json ./frontend/mfe-app/packages/host/
COPY frontend/mfe-app/packages/catalog/package.json ./frontend/mfe-app/packages/catalog/
COPY frontend/mfe-app/packages/orders/package.json ./frontend/mfe-app/packages/orders/
RUN npm ci --prefix ./frontend/mfe-app

# Copy the rest of the source after dependencies are installed.
COPY frontend/mfe-app ./frontend/mfe-app

WORKDIR /app/frontend/mfe-app
