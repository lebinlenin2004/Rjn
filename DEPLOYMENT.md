# RJN Deployment Guide

This project deploys as two services:

- Frontend: Vercel, from the React/Vite repository root.
- Backend: Render, from the separate backend repository where `manage.py` is at the repository root.

Do not commit `.env` files. Put all production secrets in the Render and Vercel dashboards.

## 1. Push The Backend To GitHub

Use the backend repository, currently:

```text
https://github.com/lebinlenin2004/rjn_Python.git
```

Make sure these backend files are at the repository root:

```text
manage.py
requirements.txt
Procfile
render.yaml
.python-version
rjn_backend/
shop/
templates/
```

Push the latest backend changes before creating the Render service.

## 2. Create The Backend Web Service On Render

1. Open Render.
2. Click New +.
3. Choose Web Service.
4. Connect the backend GitHub repository: `rjn_Python`.
5. Use these settings:

```text
Name: rjn-python
Runtime: Python
Branch: main
Root Directory: leave empty
Build Command: pip install -r requirements.txt && python manage.py collectstatic --noinput --clear
Start Command: python manage.py migrate && gunicorn rjn_backend.wsgi:application --bind 0.0.0.0:$PORT
Health Check Path: /health/
```

If Render detects `render.yaml`, you can also deploy using the blueprint. The same commands are already defined in that file.

## 3. Add Backend Environment Variables On Render

In the Render backend service, open Environment and add:

```env
SECRET_KEY=generate-a-long-random-secret
DEBUG=False
PYTHON_VERSION=3.13.5
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
CSRF_TRUSTED_ORIGINS=https://your-render-service.onrender.com,https://your-frontend.vercel.app
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=0

DATABASE_URL=your-postgres-connection-string

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

Render automatically provides `RENDER_EXTERNAL_HOSTNAME`, and the Django settings add that hostname to `ALLOWED_HOSTS`. You do not need to manually add the Render domain to `ALLOWED_HOSTS`, but you must include it in `CSRF_TRUSTED_ORIGINS`.

## 4. Choose A Database

You have two good options:

Option A: Render PostgreSQL

1. In Render, create a PostgreSQL database.
2. Copy the Internal Database URL.
3. Paste it into the backend service as `DATABASE_URL`.

Option B: Supabase PostgreSQL

1. Open Supabase.
2. Go to Project Settings > Database.
3. Copy the PostgreSQL connection string.
4. Paste it into Render as `DATABASE_URL`.

Do not use a localhost database URL in production.

## 5. Deploy The Backend

Click Manual Deploy > Deploy latest commit.

After deploy finishes, test:

```text
https://your-render-service.onrender.com/health/
https://your-render-service.onrender.com/api/products/
https://your-render-service.onrender.com/admin/
```

Expected results:

```text
/health/ -> {"status": "ok"}
/api/products/ -> JSON response
/admin/ -> Django admin login page
```

## 6. Create Admin User On Render

After the backend deploy succeeds, open the Render service Shell and run:

```bash
python manage.py createsuperuser
```

Then open:

```text
https://your-render-service.onrender.com/admin/
```

## 7. Deploy Frontend On Vercel

1. Import the frontend repository in Vercel.
2. Use the React/Vite repository root.
3. Confirm these settings:

```text
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

4. Add this Vercel environment variable:

```env
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
```

5. Deploy the frontend.

## 8. Final Backend Update

After Vercel gives you the real frontend URL, update Render:

```env
CORS_ALLOWED_ORIGINS=https://your-real-vercel-url.vercel.app
CSRF_TRUSTED_ORIGINS=https://your-render-service.onrender.com,https://your-real-vercel-url.vercel.app
FRONTEND_URL=https://your-real-vercel-url.vercel.app
```

Redeploy the Render backend after changing these variables.

## 9. Quick Production Tests

1. Open the Vercel frontend URL.
2. Register a new user and verify the email.
3. Log in.
4. Add a product to cart.
5. Checkout and confirm the order email arrives.
6. Log in to Django admin and change order status.
7. Confirm the status update email arrives.

If the frontend says the backend returned HTML instead of JSON, check `VITE_API_BASE_URL`. It must end with `/api` and point to the Render backend, not Vercel.

## Troubleshooting Render

If deploy fails during build, check:

```text
requirements.txt exists at repo root
Build Command uses pip install -r requirements.txt
Python runtime is selected
```

If deploy starts but the site gives 400 Bad Request, check:

```text
RENDER_EXTERNAL_HOSTNAME is present automatically
CSRF_TRUSTED_ORIGINS includes https://your-render-service.onrender.com
```

If database connection fails, check:

```text
DATABASE_URL is a real PostgreSQL URL
DATABASE_URL is not localhost
```
