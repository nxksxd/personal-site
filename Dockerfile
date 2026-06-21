# syntax=docker/dockerfile:1

# --- Stage 1: build the frontend (Vite SPA) ---
FROM node:22-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Relative API base so the SPA calls the same origin that serves it.
ENV VITE_API_URL="/"
RUN npm run build

# --- Stage 2: backend runtime (FastAPI serves API + built SPA) ---
FROM python:3.12-slim AS runtime
WORKDIR /app/backend

COPY backend/pyproject.toml ./
COPY backend/app ./app
RUN pip install --no-cache-dir .

# Built frontend; main.py serves it from ../../dist (i.e. /app/dist).
COPY --from=frontend /app/dist /app/dist

# SQLite lives here; mount a persistent volume at /data to keep data.
ENV DATA_DIR=/data
EXPOSE 8000

# Honor $PORT when the platform injects one (Render/Railway), else 8000.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
