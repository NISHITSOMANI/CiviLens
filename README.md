# CiviLens

## Overview
Full‑stack civic engagement platform for India. Citizens can discover government schemes, submit complaints, discuss, and chat with an AI assistant. Admins can triage complaints, assign to officials, and monitor analytics.

## Tech Stack
- Frontend: React + Vite + Tailwind + shadcn-ui
- Backend: Django (CSRF‑exempt API) + MongoDB Atlas via `pymongo`
- Auth: JWT (access/refresh) stored in MongoDB
- Email: SMTP notifications on complaint assignment

## Features
- Citizen portal
  - Browse schemes (search, filters, categories)
  - Submit complaints with region metadata
  - Discussions and comments
  - Document uploads
  - Chat with the CiviLens AI Assistant
- Admin panel
  - Dashboard stats
  - Manage complaints (status, assignee, heatmap)
  - Assign complaints to officials by email (SMTP)
  - Manage users
- Regions & analytics: state normalization and heatmaps; sentiment endpoints

## Architecture
- `CiviLens_backend/`
  - `civisense_backend/`: Django project (settings, asgi)
  - `db_connection.py`: Mongo client/DB bootstrap
  - `adminpanel/`, `complaints/`, `chat/`, `regions/`, etc.: Feature apps with CSRF‑exempt views calling MongoDB using `pymongo`
  - Auth endpoints: `register`, `login`, `refresh`, `logout` (JWT)
- `frontend/`
  - Vite React app (React Query for API calls)
  - `src/services/api/*`: API wrappers
  - `src/pages/*`: Screens for citizen and admin flows

## Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB Atlas cluster (connection string)
- SMTP provider (e.g., Brevo)

## Backend Setup (Django + MongoDB)
1) Create venv and install
```powershell
cd CiviLens_backend
python -m venv .venv
. .venv/Scripts/Activate.ps1
pip install -r requirements.txt
```
2) Env vars (PowerShell examples)
```powershell
# Mongo
$env:MONGODB_URI="mongodb+srv://<user>:<pass>@<cluster>/?retryWrites=true&w=majority"
$env:MONGODB_DB_NAME="civelens"

# JWT
$env:JWT_SECRET="your_jwt_secret"
$env:JWT_ACCESS_TTL_SECONDS="900"
$env:JWT_REFRESH_TTL_SECONDS="1209600"

# Frontend base
$env:FRONTEND_BASE_URL="http://localhost:5173"

# SMTP (Brevo)
$env:EMAIL_HOST="smtp-relay.brevo.com"
$env:EMAIL_PORT="587"
$env:EMAIL_HOST_USER="8537e3002@smtp-brevo.com"
$env:EMAIL_HOST_PASSWORD="<brevo_app_password>"
$env:EMAIL_USE_TLS="true"
$env:EMAIL_FROM="sem2.university2555@gmail.com"
$env:EMAIL_DEBUG="true"  # optional verbose logs
```
3) Run server
```powershell
python manage.py runserver 0.0.0.0:8000
```
Notes
- Uses direct `pymongo` queries; no Django ORM.
- JWT access/refresh tokens persisted in MongoDB.
- CSRF exempt for API endpoints.

## Frontend Setup (Vite + React)
1) Install & run
```powershell
cd frontend
npm install
npm run dev
```
2) Frontend env
Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
```
3) TypeScript
- `frontend/tsconfig.app.json` includes JS/TS files and excludes build directories.
- `frontend/tsconfig.json` sets `strict: true`.

## Key Endpoints (Overview)
- Auth: register, login, refresh, logout
- Complaints: list, create, detail, patch (status/assignee), heatmap
- Chat: messages, send
- Regions: list
- Admin: users, stats

## SMTP Notifications (Assignments)
- When admin sets `assignee` to an email on a complaint, backend sends email via SMTP.
- Code: `_send_assignment_email_safe()` in `CiviLens_backend/complaints/views.py`.
- Required: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS`, `EMAIL_FROM` (or `SMTP_SENDER`).
- Optional: `EMAIL_DEBUG=true` for detailed logs.
Brevo quick start (PowerShell):
```powershell
$env:EMAIL_HOST="smtp-relay.brevo.com"
$env:EMAIL_PORT="587"
$env:EMAIL_HOST_USER="8537e3002@smtp-brevo.com"
$env:EMAIL_HOST_PASSWORD="<brevo_app_password>"
$env:EMAIL_USE_TLS="true"
$env:EMAIL_FROM="sem2.university2555@gmail.com"
$env:EMAIL_DEBUG="true"
```

## Development Scripts
Backend (from `CiviLens_backend/`):
```powershell
. .venv/Scripts/Activate.ps1
python manage.py runserver 0.0.0.0:8000
```
Frontend (from `frontend/`):
```bash
npm run dev
```
Format/lint (if configured):
```bash
npm run lint
npm run format
```

## Deployment Notes
- Provide all environment variables on the host.
- Ensure Mongo Atlas and SMTP are reachable from the deployment.
- Frontend can be built via `npm run build` and hosted on static hosting, pointing to the backend via `VITE_API_BASE_URL`.

## Troubleshooting
- CORS or 401s: verify `FRONTEND_BASE_URL`, tokens in requests, and JWT refresh flow.
- TypeScript inputs: `tsconfig.app.json` includes `src/**/*.ts|tsx|js|jsx|d.ts` and excludes `node_modules`, `dist`, `build`.
- SMTP not sending: enable `EMAIL_DEBUG`, verify sender is authorized in provider.
- Mongo network: confirm Atlas IP allowlist and credentials.
