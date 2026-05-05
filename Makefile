.PHONY: help env up down reset restart logs ps test clean verify

help:
	@echo "Sportshop Make targets:"
	@echo "  make env      - Generate/update env files via scripts/setup-env.sh"
	@echo "  make up       - Build and start all services"
	@echo "  make down     - Stop all services"
	@echo "  make reset    - Full reset: remove volumes and rebuild"
	@echo "  make restart  - Restart all services"
	@echo "  make logs     - Follow docker compose logs"
	@echo "  make ps       - Show docker compose service status"
	@echo "  make test     - Run test helper script"
	@echo "  make clean    - Clean local environment helper script"
	@echo "  make verify   - Run quick verification script"

env:
	./scripts/setup-env.sh

up:
	docker compose up -d --build
	./scripts/setup-admin.sh

down:
	docker compose down

reset:
	docker compose down -v --remove-orphans
	docker compose up -d --build
	./scripts/setup-admin.sh

restart:
	docker compose restart
	./scripts/setup-admin.sh

logs:
	docker compose logs -f

ps:
	docker compose ps

test:
	./scripts/run-tests.sh

clean:
	./scripts/clean-env.sh

verify:
	./scripts/sync-postman-env.sh
