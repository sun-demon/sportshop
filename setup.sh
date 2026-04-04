#!/bin/bash

# Output colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔧 Setting up Sportshop environment...${NC}"

# Check for the presence of .env.example
if [ ! -f .env.example ]; then
echo -e "${RED}❌ .env.example not found in root directory${NC}"
exit 1
fi

# Generate JWT_SECRET (corrected command)
echo -e "${GREEN}🔑 Generating JWT_SECRET...${NC}"
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Check that the secret was generated
if [ -z "$JWT_SECRET" ]; then 
echo -e "${RED}❌ Failed to generate JWT_SECRET${NC}" 
echo -e "${YELLOW}💡 Trying alternative method...${NC}" 
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null) 
if [ -z "$JWT_SECRET" ]; then 
echo -e "${RED}❌ Please install openssl or node to generate secret${NC}" 
exit 1 
fi
fi

echo -e "${GREEN}✅ JWT_SECRET generated successfully${NC}"

# Create root .env from .env.example
echo -e "${GREEN}📝 Creating root .env from .env.example...${NC}"
sed "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" .env.example > .env

# Create .env for authentication
echo -e "${GREEN}📝 Creating auth/.env from .env.example...${NC}"
mkdir -p services/auth
if [ -f services/auth/.env.example ]; then 
sed "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" services/auth/.env.example > services/auth/.env 
echo -e "${GREEN} ✅ auth/.env created${NC}"
else 
echo -e "${RED}⚠️ services/auth/.env.example not found, skipping${NC}"
fi

# Create .env for product
echo -e "${GREEN}📝 Creating product/.env from .env.example...${NC}"
mkdir -p services/product
if [ -f services/product/.env.example ]; then 
sed "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" services/product/.env.example > services/product/.env 
echo -e "${GREEN} ✅ product/.env created${NC}"
else 
echo -e "${RED}⚠️ services/product/.env.example not found, skipping${NC}"
fi

# Create .env for order
echo -e "${GREEN}📝 Creating order/.env from .env.example...${NC}"
mkdir -p services/order
if [ -f services/order/.env.example ]; then 
sed "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" services/order/.env.example > services/order/.env 
echo -e "${GREEN} ✅ order/.env created${NC}"
else 
echo -e "${RED}⚠️ services/order/.env.example not found, skipping${NC}"
fi

echo ""
echo -e "${GREEN}✅ Environment setup complete!${NC}"
echo -e "${YELLOW}📋 JWT_SECRET: ${JWT_SECRET}${NC}"
echo ""
echo -e "Next steps:"
echo -e " ${GREEN}docker-compose up -d${NC} - Start all services"
echo -e " ${GREEN}docker-compose down -v${NC} - Stop and remove volumes"
echo -e " ${GREEN}docker-compose logs -f${NC} - View logs"
