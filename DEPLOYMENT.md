# RJN Deployment Guide

This project deploys as two services:

- Frontend: Vercel, from the repository root.
- Backend: Railway, from the `rjnBackend` folder.

Do not commit `.env` files. Put all production secrets in the Railway and Vercel dashboards.

## 1. Push The Project To GitHub

Vercel and Railway both work best when connected to a GitHub repository.

```bash
git add .
git commit -m "Prepare RJN for deployment"
git push
```

## 2. Deploy Backend On Railway

1. Open Railway and create a new project from the GitHub repository.
2. Set the backend service root directory to `rjnBackend`.
3. Add a PostgreSQL database service in the same Railway project.
4. Generate a public domain for the backend service. Your backend domain is `https://rjnpython-production.up.railway.app`.
5. Add these variables to the backend service:

```env
SECRET_KEY=generate-a-long-random-secret
DEBUG=False
ALLOWED_HOSTS=rjnpython-production.up.railway.app
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
CSRF_TRUSTED_ORIGINS=https://rjnpython-production.up.railway.app,https://your-frontend.vercel.app
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=0

DATABASE_URL=${{Postgres.DATABASE_URL}}

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=product-images

FRONTEND_URL=https://your-frontend.vercel.app
DEFAULT_FROM_EMAIL=RJN Foods <your-email@gmail.com>

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
```

If Railway does not expose `Postgres.DATABASE_URL`, use the Railway PostgreSQL connection string shown in the PostgreSQL service variables.

The backend start command is already in `rjnBackend/Procfile`. It runs migrations, collects static files, then starts Gunicorn.

## 3. Create Admin User On Railway

After the backend deploy succeeds, run this in the Railway backend service shell:

```bash
python manage.py createsuperuser
```

Then open:

```text
https://rjnpython-production.up.railway.app/admin/
```

## 4. Deploy Frontend On Vercel

1. Import the same GitHub repository in Vercel.
2. Use the repository root as the frontend root directory.
3. Vercel should detect Vite automatically.
4. Confirm these settings:

```text
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

5. Add this Vercel environment variable:

```env
VITE_API_BASE_URL=https://rjnpython-production.up.railway.app/api
```

6. Deploy the frontend.

## 5. Final Backend Update

After Vercel gives you the real frontend URL, update Railway:

```env
CORS_ALLOWED_ORIGINS=https://your-real-vercel-url.vercel.app
CSRF_TRUSTED_ORIGINS=https://rjnpython-production.up.railway.app,https://your-real-vercel-url.vercel.app
FRONTEND_URL=https://your-real-vercel-url.vercel.app
```

Redeploy the Railway backend after changing these variables.

## 6. Quick Production Tests

1. Open the Vercel frontend URL.
2. Register a new user and verify the email.
3. Log in.
4. Add a product to cart.
5. Checkout and confirm the order email arrives.
6. Log in to Django admin and change order status.
7. Confirm the status update email arrives.

If the frontend says the backend returned HTML instead of JSON, check `VITE_API_BASE_URL`. It must end with `/api` and point to the Railway backend, not Vercel.

## Troubleshooting Railway Database Errors

If Railway logs show this:

```text
connection to server at "127.0.0.1", port 5432 failed: Connection refused
```

then the backend is still using a local database URL, such as:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/rjn
```

Do not use `localhost` for Railway. In the Railway backend service, set `DATABASE_URL` to a reference variable from the Railway PostgreSQL service:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

If your PostgreSQL service has a different name, choose `Add Reference Variable` in Railway, select the PostgreSQL service, then select `DATABASE_URL`.

After changing `DATABASE_URL`, redeploy the backend.
