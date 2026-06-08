# Personal site backend

FastAPI + SQLAlchemy + SQLite backend that powers authentication and content
(posts, projects, socials) for the personal site. Replaces the previous
client-side `localStorage` model so published content is shared across all
visitors and protected by real authentication (bcrypt password hashing + JWT).

## Run locally

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e .

# JWT_SECRET must be set to a strong random value in production.
JWT_SECRET=dev-secret DATA_DIR=./data uvicorn app.main:app --reload --port 8000
```

The API is then available at `http://localhost:8000` and interactive docs at
`http://localhost:8000/docs`.

## Environment variables

| Variable       | Default                  | Description                                            |
| -------------- | ------------------------ | ------------------------------------------------------ |
| `JWT_SECRET`   | `dev-insecure-...`       | Secret used to sign JWTs. **Set this in production.**  |
| `DATABASE_URL` | derived from `DATA_DIR`  | Full SQLAlchemy URL. Overrides `DATA_DIR` when set.    |
| `DATA_DIR`     | `/data` then `./data`    | Directory for the SQLite file (use a persistent disk). |
| `CORS_ORIGINS` | `*`                      | Comma-separated list of allowed frontend origins.      |

## Endpoints

- `GET  /api/health` — smoke check.
- `GET  /api/auth/status` — whether an admin account exists yet.
- `POST /api/auth/setup` — create the first admin (only when none exist).
- `POST /api/auth/login` — obtain a JWT.
- `GET/POST/DELETE /api/auth/users` — manage admins (auth required).
- `GET /api/posts|projects|socials` — public reads.
- `POST/PUT/DELETE /api/posts|projects|socials/...` — writes (auth required).
- `POST /api/reset` — restore default seed content (auth required).

Default content is seeded automatically on first startup when the tables are
empty.
