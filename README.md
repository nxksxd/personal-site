# nxksxd — персональный сайт

Личный сайт-визитка с проектами, новостями и защищённой админ-панелью.

## Установка на новый VPS одной командой

Поддерживаются Ubuntu и Debian. Команда сама установит Docker, скачает текущую версию ветки `main`, соберёт сайт, запустит контейнер и проверит `/health`:

```bash
curl -fsSL https://raw.githubusercontent.com/nxksxd/personal-site/main/install.sh | sudo bash
```

После установки команда напечатает адрес сайта и установленный commit. Повторный запуск обновляет код строго до актуального `origin/main`, пересобирает контейнер и сохраняет данные.

Скрипт:

- устанавливает Git, Docker Engine и Docker Compose;
- клонирует репозиторий в `/opt/personal-site`;
- создаёт `.env` и случайный `JWT_SECRET`;
- собирает текущие frontend и backend из `main`;
- запускает контейнер с автоматическим перезапуском;
- сохраняет SQLite и загрузки в Docker volume `personal-site-data`;
- завершает работу с ошибкой, если сайт не прошёл health check.

Перед публикацией через домен настройте reverse proxy на `127.0.0.1:8000`.

Важно: эта команда переносит актуальный код сайта. Содержимое текущей базы — проекты, новости, пользователи и загруженные изображения — хранится отдельно от GitHub. Для полного переноса существующих данных нужен экспорт volume со старого VPS и импорт на новый.

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
