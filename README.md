# SAML Identity Provider

A small SAML 2.0 identity provider with a separate API and UI.

- `backend` is a NestJS API. It stores users and settings in Postgres, signs assertions, and serves the SAML endpoints.
- `frontend` is a Vite + React app. People sign in with email and password. An IdP admin manages users and the service provider from a dashboard.

The signing certificate and private key live in `backend/certs`. They are not stored in the database.

## Setup

You need Node.js, npm, and Docker.

```bash
# Postgres
cd backend
docker compose up -d
cp .env.example .env

# Signing keys (skip this if backend/certs already has the two .pem files)
mkdir -p certs
openssl req -x509 -newkey rsa:2048 \
  -keyout certs/idp-private-key.pem \
  -out certs/idp-public-cert.pem \
  -days 3650 -nodes -subj "/CN=localhost"

npm install
npx prisma migrate dev
npm run db:seed
npm run start:dev
```

In another terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

| Service | URL |
| --- | --- |
| UI | http://localhost:5174 |
| API | http://localhost:3000 |
| Postgres | localhost:55432 |

The seeded dashboard admin comes from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`. The example values are `admin@example.com` / `ChangeMe123!`. Change those, plus `JWT_SECRET` and `SESSION_SECRET`, before you use this anywhere else. Seeding again updates that admin's password. It does not overwrite an existing service-provider configuration.

There is no single logout. `SLO_URL` is not used.

## Environment

`backend/.env` (copy from `backend/.env.example`):

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. Docker Compose publishes it on `localhost:55432`. |
| `PORT` | API port. Default `3000`. |
| `PUBLIC_URL` | Base URL written into metadata and the SSO endpoint shown in Settings. |
| `FRONTEND_URL` | Where the API sends the browser after `/saml/sso`. |
| `JWT_SECRET` | Signs the admin dashboard token. |
| `SESSION_SECRET` | Express session secret. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Seeded dashboard admin. Required for `npm run db:seed`. |
| `IDP_CERT_PATH`, `IDP_KEY_PATH` | PEM files used to sign assertions. |
| `ISSUER`, `ACS_URL`, `AUDIENCE` | Defaults used only when settings are created the first time. After that, change them in the dashboard. |

`frontend/.env`:

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | API base URL. Default `http://localhost:3000`. |

## What the admin configures

Open **Administrator sign in** on the sign-in page (`/admin/login`). The dashboard has two pages:

- **Users.** Create the people who will sign in. Each account gets a UUID when it is created. That UUID is the SAML NameID (`urn:oasis:names:tc:SAML:2.0:nameid-format:persistent`). Sign-in uses email and password. First name, last name, username, and email are returned as attributes.
- **Settings.** One service provider: issuer, audience, assertion consumer URL, signing options, and the default relay state. The page also shows the SSO and metadata URLs to give that application.

`isAdmin` is only for dashboard access. The seeded account has it. Users you create in the form do not.

## Sign-in flow

1. The service provider sends the browser to `GET` or `POST /saml/sso` with a SAML `AuthnRequest`.
2. The API stores that request and redirects to `http://localhost:5174/login?requestId=...`.
3. The person enters email and password. The UI calls `POST /saml/login`.
4. The API checks the password, builds a signed SAML response, and returns `{ acsUrl, samlResponse, relayState }`.
5. The browser submits a hidden form POST to the service provider's assertion consumer URL. The API does not return the auto-post HTML itself.

NameID is the user's id. Email is also sent as a normal attribute, so the two values are different.

If someone opens `/login` with no `requestId`, the API still signs an assertion and posts it to the assertion consumer URL saved in settings. That is the IdP-initiated path. Relay state comes from the original request when there is one, otherwise from the default in settings.

## Endpoints

| Method | Path | Who |
| --- | --- | --- |
| GET, POST | `/saml/sso` | Service provider starts sign-in |
| POST | `/saml/login` | UI, after email and password |
| GET | `/metadata` | IdP metadata XML |
| POST | `/auth/admin/login` | Dashboard sign-in, returns a bearer token |
| GET | `/auth/admin/me` | Current admin |
| GET, POST | `/users` | Admin |
| GET, PATCH, DELETE | `/users/:id` | Admin |
| GET, PUT | `/settings` | Admin |

Admin requests send `Authorization: Bearer <token>`. The UI keeps that token in `localStorage` under `saml_admin_token`.
