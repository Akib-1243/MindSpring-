# MindSpring University Platform

MindSpring is a university academic quality platform with a React/Vite frontend and a Laravel API backed by MySQL. It provides a public university landing page, protected faculty tools, protected admin course and question-bank management, and read-only AI-assisted academic analysis.

## Features

- University landing page with faculty login access
- Role-based authentication for faculty and administrators
- Faculty dashboard for exam forensics and syllabus comparison
- Recent analysis history with pinned report details
- Faculty course reference panel with:
  - Course details and syllabus
  - Previous question-bank records
  - Past-paper questions
- Faculty AI assistant with read-only academic context from departments, faculty, courses, syllabi, past papers, question banks, and analysis history
- Admin academic ledger for departments, courses, faculty, and question banks
- Automatic department-level course analysis after course creation
- MySQL database and phpMyAdmin administration through Docker

## Project Structure

```text
MindSpring-/
|-- backend/    Laravel API, authentication, models, migrations, seeders
|-- frontend/   React/Vite web application
|-- workflow/   ERD, structure, and workflow reference files
`-- README.md
```

## Requirements

- Docker Desktop
- Node.js 20 or newer
- npm
- Git

## Run The Backend

From the `backend` directory:

```bash
cd backend
docker compose up -d --build
docker compose exec app php artisan migrate --seed
```

Backend services:

- API health check: http://localhost:8000/api/health
- MySQL: `localhost:3307`
- phpMyAdmin: http://localhost:8080

The Docker database uses these local development credentials:

```text
Database: relavanet
User: relavanet
Password: secret
Root password: root
```

## Run The Frontend

In a second terminal, from the `frontend` directory:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally http://localhost:5173.

Available frontend commands:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

The Vite development server proxies `/api` requests to the Laravel API. To override the API URL, create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8000/api
```

## Demo Accounts

All seeded demo accounts use the password `relavanet-demo`.

| Role | Email |
| --- | --- |
| Faculty | `faculty@relavanet.edu` |
| Faculty | `eee.faculty@relavanet.edu` |
| Admin | `admin@relavanet.edu` |

## AI Configuration

The AI integration uses an OpenAI-compatible endpoint. Copy the backend environment template and set a key when live AI responses are required:

```bash
cd backend
copy .env.example .env
```

Then configure:

```env
OPENAI_API_KEY=your-key
OPENAI_MODEL=openai/gpt-4o-mini
AI_BASE_URL=https://openrouter.ai/api/v1
```

Without a key, the application returns clear demo/configuration responses and the local academic workflow remains usable.

## Main API Routes

Authentication:

- `POST /api/faculty/login`
- `GET /api/faculty/me`
- `POST /api/faculty/logout`

Faculty:

- `GET /api/faculty/dashboard`
- `POST /api/faculty/exam/analyze`
- `POST /api/faculty/syllabus/analyze`
- `POST /api/faculty/chat`

Admin:

- `GET /api/admin/question-bank`
- `POST /api/admin/courses`
- `PUT /api/admin/courses/{course}`
- `DELETE /api/admin/courses/{course}`
- `POST /api/admin/courses/{course}/questions`
- `PUT /api/admin/courses/{course}/questions/{question}`
- `DELETE /api/admin/courses/{course}/questions/{question}`
- `POST /api/admin/faculty`

## Development Notes

- Faculty and admin routes are protected by Sanctum bearer tokens and role checks.
- Faculty course data is scoped to the authenticated faculty member in the dashboard.
- The AI assistant receives academic records as read-only context and does not have database write access.
- Course departments are selected from the database-backed departments table.
- After changing migrations or seed data, rerun `docker compose exec app php artisan migrate --seed` as needed.
