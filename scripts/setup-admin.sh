#!/bin/bash

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Output colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Parse arguments
SKIP_POSTMAN_SYNC=false
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-postman-sync)
            SKIP_POSTMAN_SYNC=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--skip-postman-sync]"
            exit 1
            ;;
    esac
done

echo -e "${YELLOW}🔧 Setting up admin user...${NC}"

# Get admin credentials from .env (if exists)
if [ -f services/auth/.env ]; then
    ADMIN_EMAIL=$(grep ADMIN_EMAIL services/auth/.env | cut -d '=' -f2)
    ADMIN_PASSWORD=$(grep ADMIN_PASSWORD services/auth/.env | cut -d '=' -f2)
    ADMIN_NAME=$(grep ADMIN_NAME services/auth/.env | cut -d '=' -f2)
    # Remove quotes if present
    ADMIN_EMAIL=$(echo "$ADMIN_EMAIL" | sed 's/^["\x27]//;s/["\x27]$//')
    ADMIN_PASSWORD=$(echo "$ADMIN_PASSWORD" | sed 's/^["\x27]//;s/["\x27]$//')
    ADMIN_NAME=$(echo "$ADMIN_NAME" | sed 's/^["\x27]//;s/["\x27]$//')
fi

# Use credentials from .env or defaults
if [ -z "$ADMIN_EMAIL" ]; then
    ADMIN_EMAIL="admin@test.com"
fi
if [ -z "$ADMIN_PASSWORD" ]; then
    ADMIN_PASSWORD="admin123"
    echo -e "${YELLOW}⚠️ Using default password: admin123${NC}"
fi
if [ -z "$ADMIN_NAME" ]; then
    ADMIN_NAME="Administrator"
fi

# Wait auth service to be up
for i in {1..30}; do
    if curl -s http://localhost:3001/health > /dev/null; then
        break
    fi
    if [ "$i" -eq 30 ]; then
        echo -e "${RED}❌ Auth service not running. Start with: docker compose up -d${NC}"
        exit 1
    fi
    sleep 1
done

# Register admin
echo -e "${GREEN}📝 Registering admin user...${NC}"
curl -s -X POST http://localhost:3001/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\",\"name\":\"${ADMIN_NAME}\"}" > /dev/null

# Update role to admin (support both "User" and "users" table names)
echo -e "${GREEN}🔑 Setting admin role...${NC}"
docker exec auth-db psql -U sportshop -d auth_db -c \
    "UPDATE \"users\" SET role = 'admin' WHERE email = '${ADMIN_EMAIL}';" 2>/dev/null || \
docker exec auth-db psql -U sportshop -d auth_db -c \
    "UPDATE \"User\" SET role = 'admin' WHERE email = '${ADMIN_EMAIL}';" 2>/dev/null

echo -e "${GREEN}✅ Admin user ready${NC}"
echo -e "${YELLOW}📋 Email: ${ADMIN_EMAIL}${NC}"
echo -e "${YELLOW}🔐 Password: ${ADMIN_PASSWORD}${NC}"
