#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${REPO_DIR:-/opt/personal-site}"
REPO_URL="${REPO_URL:-https://github.com/nxksxd/personal-site.git}"
BRANCH="${BRANCH:-main}"
PORT="${PORT:-8000}"

if [[ $EUID -ne 0 ]]; then
  exec sudo -E bash "$0" "$@"
fi

if ! command -v apt-get >/dev/null; then
  echo "Supported OS: Ubuntu or Debian." >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl git python3

if ! command -v docker >/dev/null || ! docker compose version >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

if [[ -d "$REPO_DIR/.git" ]]; then
  git -C "$REPO_DIR" fetch origin "$BRANCH"
  git -C "$REPO_DIR" checkout "$BRANCH"
  git -C "$REPO_DIR" reset --hard "origin/$BRANCH"
else
  rm -rf "$REPO_DIR"
  git clone --branch "$BRANCH" --single-branch "$REPO_URL" "$REPO_DIR"
fi

cd "$REPO_DIR"
if [[ ! -f .env ]]; then
  cp .env.example .env
  JWT_SECRET=$(python3 -c 'import secrets; print(secrets.token_urlsafe(48))')
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
  chmod 600 .env
fi

PORT="$PORT" docker compose up -d --build --remove-orphans

for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:$PORT/health" >/dev/null; then
    SERVER_IP=$(curl -fsS --max-time 3 https://api.ipify.org || hostname -I | awk '{print $1}')
    echo
    echo "Installed current $BRANCH version: $(git rev-parse --short HEAD)"
    echo "Site: http://$SERVER_IP:$PORT"
    echo "Data: Docker volume personal-site-data"
    exit 0
  fi
  sleep 2
done

docker compose ps
docker compose logs --tail=100 personal-site
echo "Installation failed: health check did not pass." >&2
exit 1
