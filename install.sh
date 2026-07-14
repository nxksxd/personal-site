#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${REPO_DIR:-/opt/personal-site}"
REPO_URL="${REPO_URL:-https://github.com/nxksxd/personal-site.git}"

if [[ $EUID -ne 0 ]]; then
  echo "Run as root: sudo bash install.sh" >&2
  exit 1
fi

command -v docker >/dev/null || { echo "Docker is required: https://docs.docker.com/engine/install/" >&2; exit 1; }
docker compose version >/dev/null || { echo "Docker Compose plugin is required" >&2; exit 1; }

if [[ -d "$REPO_DIR/.git" ]]; then
  git -C "$REPO_DIR" pull --ff-only
else
  git clone "$REPO_URL" "$REPO_DIR"
fi

cd "$REPO_DIR"
if [[ ! -f .env ]]; then
  cp .env.example .env
  JWT_SECRET=$(python3 -c 'import secrets; print(secrets.token_urlsafe(48))')
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
  chmod 600 .env
  echo "Created $REPO_DIR/.env with a generated JWT secret. Review it before continuing."
fi

docker compose up -d --build
docker compose ps
printf '\nSite: http://<server-ip>:${PORT:-8000}\nData: Docker volume personal-site-data\n'
