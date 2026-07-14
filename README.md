# nxksxd — персональный сайт

Личный сайт-визитка с проектами, новостями и защищённой админ-панелью.

## Быстрый деплой на новый VPS

Требования: Ubuntu/Debian, Docker Engine и Docker Compose plugin.

```bash
sudo apt update && sudo apt install -y git docker.io docker-compose-plugin python3
sudo systemctl enable --now docker
sudo mkdir -p /opt/personal-site
sudo git clone https://github.com/nxksxd/personal-site.git /opt/personal-site
cd /opt/personal-site
sudo bash install.sh
```

После установки сайт доступен на `http://IP-СЕРВЕРА:8000`.

Скрипт установки:

- клонирует или обновляет репозиторий;
- создаёт `.env` из `.env.example`;
- генерирует секрет для JWT;
- собирает актуальную версию frontend и backend;
- запускает контейнер с автоматическим перезапуском;
- сохраняет базу SQLite и загруженные файлы в Docker volume `personal-site-data`.

Перед публикацией через домен настройте reverse proxy (например, Nginx) на `127.0.0.1:8000`.

## Обновление существующего VPS

```bash
cd /opt/personal-site
sudo git pull --ff-only
sudo docker compose up -d --build
sudo docker compose ps
```

Обновление не удаляет volume с данными. Не выполняйте `docker compose down -v`, если нужно сохранить базу и загрузки.

## Возможности

- Главная страница с блоками проектов и последних новостей.
- Разделы `/projects` и `/news`.
- Страница отдельного проекта `/projects/<id>`.
- Админ-панель `/admin`.
- Управление проектами, новостями, категориями, соцсетями и пользователями.
- Авторизация по JWT.
- Светлая и тёмная темы.
- Загрузка изображений.
- Адаптивная вёрстка.

## Стек

- React + TypeScript + Vite.
- FastAPI + SQLite.
- Docker Compose.
- Один контейнер: FastAPI отдаёт API и собранный frontend.

## Переменные окружения

Скопируйте `.env.example` в `.env` только при ручной настройке:

```bash
cp .env.example .env
```

Основные параметры:

- `JWT_SECRET` — длинный случайный секрет для JWT; обязателен в production.
- `APP_ENV` — `production` или `dev`.
- `DATA_DIR` — каталог данных, по умолчанию `/data`.
- `PORT` — внешний порт Docker, по умолчанию `8000`.
- `CORS_ORIGINS` — разрешённые origin через запятую; для одного контейнера обычно можно оставить `*`.

Не коммитьте `.env` в GitHub.

## Локальная разработка

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
JWT_SECRET=dev-secret APP_ENV=dev DATA_DIR=./data uvicorn app.main:app --reload --port 8000
```

Frontend в другом терминале:

```bash
npm ci
npm run dev
```

Проверка production-сборки:

```bash
npm run build
```

Запуск контейнера локально:

```bash
cp .env.example .env
# Для локального запуска поменяйте APP_ENV=dev и задайте JWT_SECRET
sudo docker compose up -d --build
```

## Структура

```text
src/                 frontend React/TypeScript
backend/app/         FastAPI API и модели
public/              статические файлы
Dockerfile           production-сборка frontend + backend
docker-compose.yml   запуск на VPS
install.sh           установка и обновление на VPS
```

## Диагностика

```bash
sudo docker compose ps
sudo docker compose logs -f personal-site
curl http://127.0.0.1:8000/health
```

Если сайт не запускается, проверьте Docker, содержимое `.env` и права на каталог установки. Секреты и JWT не публикуйте в чат или GitHub.

## Лицензия

MIT

## Версия

`1.0.0`

Актуальный исходный код и скрипт установки: [github.com/nxksxd/personal-site](https://github.com/nxksxd/personal-site).

Прямая команда установки из репозитория после клонирования:

```bash
cd /opt/personal-site && sudo bash install.sh
```

Если нужен вариант «одной командой» через `curl`, его можно добавить позже; текущий способ безопаснее: сначала код сохраняется локально, затем запускается проверяемый скрипт из конкретной версии репозитория.
```bash
# Альтернатива после проверки репозитория:
curl -fsSL https://raw.githubusercontent.com/nxksxd/personal-site/main/install.sh | sudo bash
```

Для этой команды скрипт использует значения по умолчанию `/opt/personal-site` и репозиторий `nxksxd/personal-site`.
