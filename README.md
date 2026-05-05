# Sportshop

Интернет-магазин спортивных товаров.

## Структура проекта

- `services/` — микросервисы 
- `frontend/classic-app/` — первая реализация (React + Context)
- `frontend/redux-app/` — реализация на Redux RTK
- `frontend/mobx-app/` — реализация на MobX
- `frontend/mfe-app/` — host + microfrontends
- `shared-types/` — общие TypeScript-типы
- `docker-compose.yml` — оркестрация контейнеров

## Быстрый старт (best practice)

```bash
make env
make up
make verify
```

Полный reset БД и чистый подъём:

```bash
make reset
```

Примечания:
- `auth` сервис на старте идемпотентно создаёт/обновляет admin из `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- `product` сервис на старте выполняет `prisma db push` + `prisma db seed`.
- После `make reset` ручной `setup-admin.sh` больше не обязателен.

## Команда

- Студент Демин Даниил (backend)
- Студент Ечин Илья (frontend)