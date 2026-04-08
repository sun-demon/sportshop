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

# Get admin password from .env (if exists)
if [ -f services/auth/.env ]; then
    ADMIN_PASSWORD=$(grep ADMIN_PASSWORD services/auth/.env | cut -d '=' -f2)
    # Remove quotes if present
    ADMIN_PASSWORD=$(echo "$ADMIN_PASSWORD" | sed 's/^["\x27]//;s/["\x27]$//')
fi

# Use password from .env or default
if [ -z "$ADMIN_PASSWORD" ]; then
    ADMIN_PASSWORD="admin123"
    echo -e "${YELLOW}⚠️ Using default password: admin123${NC}"
fi

# Check if auth service is running
if ! curl -s http://localhost:3001/health > /dev/null; then
    echo -e "${RED}❌ Auth service not running. Start with: docker-compose up -d${NC}"
    exit 1
fi

# Register admin
echo -e "${GREEN}📝 Registering admin user...${NC}"
curl -s -X POST http://localhost:3001/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"admin@test.com\",\"password\":\"${ADMIN_PASSWORD}\",\"name\":\"Administrator\"}" > /dev/null

# Update role to admin (support both "User" and "users" table names)
echo -e "${GREEN}🔑 Setting admin role...${NC}"
docker exec auth-db psql -U sportshop -d auth_db -c \
    "UPDATE \"users\" SET role = 'admin' WHERE email = 'admin@test.com';" 2>/dev/null || \
docker exec auth-db psql -U sportshop -d auth_db -c \
    "UPDATE \"User\" SET role = 'admin' WHERE email = 'admin@test.com';" 2>/dev/null

echo -e "${GREEN}✅ Admin user ready${NC}"
echo -e "${YELLOW}📋 Email: admin@test.com${NC}"
echo -e "${YELLOW}🔐 Password: ${ADMIN_PASSWORD}${NC}"
