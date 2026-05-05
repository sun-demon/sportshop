#!/bin/bash

### Sync admin credentials from .env to Postman environment file
### Creates Postman environment from example template while preserving pretty format

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
POSTMAN_ENV_EXAMPLE="$PROJECT_ROOT/postman/Sportshop.postman_environment.example.json"
POSTMAN_ENV_FILE="$PROJECT_ROOT/postman/Sportshop.postman_environment.json"

# Output colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if example file exists
if [ ! -f "$POSTMAN_ENV_EXAMPLE" ]; then
    echo -e "${RED}❌ Postman environment example not found: $POSTMAN_ENV_EXAMPLE${NC}"
    exit 1
fi

# Read admin password from auth service .env
if [ -f "$PROJECT_ROOT/services/auth/.env" ]; then
    ADMIN_PASSWORD=$(grep ADMIN_PASSWORD "$PROJECT_ROOT/services/auth/.env" | cut -d '=' -f2)
    ADMIN_PASSWORD=$(echo "$ADMIN_PASSWORD" | sed 's/^["\x27]//;s/["\x27]$//')
fi

if [ -z "$ADMIN_PASSWORD" ]; then
    ADMIN_PASSWORD="admin123"
    echo -e "${YELLOW}⚠️ Using default admin password: admin123${NC}"
fi

# Get current timestamp
CURRENT_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

# Copy example to actual environment file
cp "$POSTMAN_ENV_EXAMPLE" "$POSTMAN_ENV_FILE"

# Update password and timestamp using Python (preserves pretty format)
python3 << EOF
import json

with open("$POSTMAN_ENV_FILE", 'r') as f:
    data = json.load(f)

# Update password
for item in data['values']:
    if item['key'] == 'adminPassword':
        item['value'] = "$ADMIN_PASSWORD"
        break

# Update timestamp
data['_postman_exported_at'] = "$CURRENT_TIMESTAMP"

# Custom formatting: outer structure pretty, values compact
with open("$POSTMAN_ENV_FILE", 'w') as f:
    f.write('{\n')
    f.write(f'  "id": "{data["id"]}",\n')
    f.write(f'  "name": "{data["name"]}",\n')
    f.write('  "values": [\n')
    
    # Write values in compact format
    for i, item in enumerate(data['values']):
        compact_item = f'    {{ "key": "{item["key"]}", "value": "{item["value"]}", "enabled": {str(item["enabled"]).lower()} }}'
        if i < len(data['values']) - 1:
            compact_item += ','
        f.write(compact_item + '\n')
    
    f.write('  ],\n')
    f.write(f'  "_postman_variable_scope": "{data["_postman_variable_scope"]}",\n')
    f.write(f'  "_postman_exported_at": "{data["_postman_exported_at"]}",\n')
    f.write(f'  "_postman_exported_using": "{data["_postman_exported_using"]}"\n')
    f.write('}\n')
EOF

echo -e "${GREEN}✅ Postman environment created from example: $POSTMAN_ENV_FILE${NC}"
