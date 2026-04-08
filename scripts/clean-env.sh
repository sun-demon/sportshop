#!/bin/bash

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Output colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧹 Cleaning up Sportshop environment...${NC}"

# Removing root .env
if [ -f .env ]; then 
    rm .env 
    echo -e "${GREEN}✅ Removed root .env${NC}"
else 
    echo -e "${YELLOW}⚠️ root .env not found${NC}"
fi

# Remove .env for auth
if [ -f services/auth/.env ]; then 
    rm services/auth/.env 
    echo -e "${GREEN}✅ Removed auth/.env${NC}"
else 
    echo -e "${YELLOW}⚠️ auth/.env not found${NC}"
fi

# Remove .env for product
if [ -f services/product/.env ]; then 
    rm services/product/.env 
    echo -e "${GREEN}✅ Removed product/.env${NC}"
else 
    echo -e "${YELLOW}⚠️ product/.env not found${NC}"
fi

# Remove .env for order
if [ -f services/order/.env ]; then 
    rm services/order/.env 
    echo -e "${GREEN}✅ Removed order/.env${NC}"
else 
    echo -e "${YELLOW}⚠️ order/.env not found${NC}"
fi

# Remove Postman environment (actual file, not template)
POSTMAN_ENV_FILE="$PROJECT_ROOT/postman/Sportshop.postman_environment.json"
if [ -f "$POSTMAN_ENV_FILE" ]; then
    rm "$POSTMAN_ENV_FILE"
    echo -e "${GREEN}✅ Removed Postman environment${NC}"
else
    echo -e "${YELLOW}⚠️ Postman environment not found${NC}"
fi

echo -e "${GREEN}✅ Cleanup complete!${NC}"
echo ""
echo -e "Next steps:"
echo -e " ${GREEN}./scripts/setup-env.sh${NC} - Recreate .env files and Postman environment"
echo -e " ${GREEN}docker-compose down -v${NC} - Remove Docker containers and volumes"
