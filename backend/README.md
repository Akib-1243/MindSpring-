# Relavanet Academic Quality Suite

Laravel 11 API for Relavanet University's faculty tools.

## Run with Docker

1. Start Docker Desktop.
2. From this directory run `docker compose up --build`.
3. Run migrations and demo data:

```bash
docker compose exec app php artisan migrate --seed
```

Services:

- API: `http://localhost:8000/api/health`
- MySQL: `localhost:3307`
- phpMyAdmin: `http://localhost:8080`

The seeded faculty account is `faculty@relavanet.edu` with password `relavanet-demo`. Set `OPENAI_API_KEY` in `.env` to enable live analysis. Without it, the API returns a clear configuration response so the workflow remains demoable.

## API workflow

- `POST /api/faculty/login`
- `GET /api/faculty/dashboard`
- `GET|POST /api/faculty/courses`
- `POST /api/faculty/syllabus/analyze`
- `POST /api/faculty/exam/analyze`
- `POST /api/faculty/logout`
