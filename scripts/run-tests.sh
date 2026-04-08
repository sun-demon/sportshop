#!/bin/bash

# Load environment variables from .env
set -a
source services/auth/.env
set +a

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Running Sportshop API tests...${NC}"

# Check if newman is installed
if ! command -v newman &> /dev/null; then
    echo -e "${RED}❌ newman is not installed. Install with: npm install -g newman${NC}"
    exit 1
fi

# Run Postman tests with Newman
newman run postman/Sportshop.postman_collection.json \
    --env-var "baseUrl=http://localhost:3000" \
    --env-var "baseUrlAuth=http://localhost:3001" \
    --env-var "baseUrlProduct=http://localhost:3002" \
    --env-var "baseUrlOrder=http://localhost:3003" \
    --env-var "adminEmail=admin@test.com" \
    --env-var "adminPassword=$ADMIN_PASSWORD" \
    --reporters cli,json \
    --reporter-json-export test-results.json \
    --timeout-request 5000

# Check exit code
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
else
    echo -e "${RED}❌ Some tests failed. Check test-results.json for details.${NC}"
    exit 1
fi
