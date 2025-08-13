# civisense_backend (Scaffold)
Simple Django scaffold for CiviLens backend.

## Setup (development)
1. Create virtual environment:
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # mac/linux
   source venv/bin/activate

2. Install requirements:
   pip install -r requirements.txt

3. Create `.env` from `.env.example` and fill values (especially MONGO_URI and SECRET_KEY).

4. Run migrations (Djongo may not require migrations for simple models, but run anyway):
   python manage.py makemigrations
   python manage.py migrate

5. Create superuser:
   python manage.py createsuperuser

6. Run server:
   python manage.py runserver

## Notes
- This scaffold intentionally uses standard Django views returning JsonResponse for API endpoints.
- JWT helpers are in `core/jwt_utils.py`. Refresh tokens stored in DB model `users.RefreshToken`.
- OCR and ML integrations are left as placeholders; use management commands to run background jobs.
