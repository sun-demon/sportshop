# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY frontend/classic-app/package*.json ./
RUN npm install

# Copy shared-types as a local package (without symlink)
COPY shared-types ./shared-types-temp
WORKDIR /app/shared-types-temp
RUN npm install && npm run build 2>/dev/null || echo "No build script"
WORKDIR /app

# Install shared-types as local dependency
RUN npm install ./shared-types-temp

# Copy frontend source (but exclude any shared-types symlink first)
COPY frontend/classic-app/ ./frontend-src

# Remove any existing shared-types directory/symlink and copy types manually
RUN rm -rf ./frontend-src/src/shared-types 2>/dev/null || true && \
    mkdir -p ./frontend-src/src/shared-types && \
    cp -r ./shared-types-temp/* ./frontend-src/src/shared-types/ 2>/dev/null || true

# Move to working directory
WORKDIR /app/frontend-src

# Build frontend
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/frontend-src/dist /usr/share/nginx/html

# Create nginx config with API proxy
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
    location /auth { \
        proxy_pass http://api-gateway:3000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
    location /products { \
        proxy_pass http://api-gateway:3000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
    location /orders { \
        proxy_pass http://api-gateway:3000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
