# CiviLens Deployment Guide

This guide explains how to deploy the CiviLens application with the frontend on Vercel and backend on Render.

## Prerequisites

- Node.js (v16+)
- Python (3.9+)
- MongoDB Atlas account
- Vercel account
- Render account
- Git

## Backend Deployment (Render)

### 1. Prepare Backend

1. Install dependencies:
   ```bash
   cd CiviLens_backend
   pip install -r requirements.txt
   ```

2. Set up environment variables in `.env`:
   ```env
   DEBUG=False
   SECRET_KEY=your-secret-key
   ALLOWED_HOSTS=.onrender.com,localhost,127.0.0.1
   MONGODB_URI=your-mongodb-uri
   CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5174
   CSRF_TRUSTED_ORIGINS=https://your-vercel-app.vercel.app
   ```

### 2. Deploy to Render

1. Push your code to a GitHub repository
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - Name: `civisense-backend`
   - Region: Choose the one closest to your users
   - Branch: `main` or your preferred branch
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn civisense_backend.wsgi --log-file -`
6. Add environment variables from your `.env` file
7. Click "Create Web Service"

## Frontend Deployment (Vercel)

### 1. Prepare Frontend

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Create `.env` file:
   ```env
   VITE_API_URL=https://your-render-app.onrender.com
   ```

### 2. Deploy to Vercel

1. Push your code to a GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure the project:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. Add environment variables:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://your-render-app.onrender.com`)
7. Click "Deploy"

## Environment Variables Reference

### Backend

| Variable | Description | Example |
|----------|-------------|---------|
| `DEBUG` | Enable debug mode | `False` |
| `SECRET_KEY` | Django secret key | `your-secret-key` |
| `ALLOWED_HOSTS` | Allowed hostnames | `.onrender.com,localhost` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | `https://your-vercel-app.vercel.app` |
| `CSRF_TRUSTED_ORIGINS` | Trusted CSRF origins | `https://your-vercel-app.vercel.app` |

### Frontend

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-render-app.onrender.com` |

## Post-Deployment

1. **Verify Backend**
   - Visit `https://your-render-app.onrender.com/api/health/` (or similar endpoint)
   - Should return a 200 status

2. **Verify Frontend**
   - Visit your Vercel URL
   - Check console for any CORS or API errors
   - Test authentication flow

## Troubleshooting

### Backend Issues
- **MongoDB Connection Failed**: Check your `MONGODB_URI` and ensure your MongoDB Atlas cluster allows connections from Render's IPs
- **Static Files Not Loading**: Run `python manage.py collectstatic` locally and commit the `staticfiles` directory

### Frontend Issues
- **API Connection Failed**: Verify `VITE_API_URL` is correct and CORS is properly configured on the backend
- **Build Failures**: Check the build logs in Vercel for specific errors

## CI/CD (Optional)

For automatic deployments, set up GitHub Actions:

1. Create `.github/workflows/deploy.yml` in your repository
2. Configure it to run tests and deploy on push to main

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
