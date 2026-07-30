# OAuth Setup — L'arte del Dolce ERP

This document describes how to configure Google and Apple social login for the Laravel API and React frontend.

## Environment variables

### Backend (`larte-backend/.env`)

```env
APP_URL=http://127.0.0.1:8000
FRONTEND_URL=http://localhost:5173

# Default role assigned to new OAuth users (must exist in roles table)
OAUTH_DEFAULT_ROLE=viewer

# Google OAuth — required for Google sign-in (see Google Cloud Console setup below)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI="${APP_URL}/api/auth/google/callback"

# Apple Sign In
APPLE_CLIENT_ID=
APPLE_TEAM_ID=
APPLE_KEY_ID=
# Option A: pre-generated client secret (JWT)
APPLE_CLIENT_SECRET=
# Option B: private key (.p8 contents, use \n for newlines in .env)
APPLE_PRIVATE_KEY=
APPLE_REDIRECT_URI="${APP_URL}/api/auth/apple/callback"
```

### Frontend (`.env` at project root)

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## API routes

| Method | URI | Description |
|--------|-----|-------------|
| GET | `/api/auth/providers` | Returns `{ google: bool, apple: bool }` — configured state |
| GET | `/api/auth/google/redirect` | Redirects to Google consent screen |
| GET | `/api/auth/google/callback` | Handles Google callback, redirects to frontend with token |
| GET | `/api/auth/apple/redirect` | Redirects to Apple consent screen |
| GET | `/api/auth/apple/callback` | Handles Apple callback, redirects to frontend with token |

After successful OAuth, the backend redirects to:

```
{FRONTEND_URL}/auth/callback?token={sanctum_token}
```

On error:

```
{FRONTEND_URL}/auth/callback?error={message}
```

## Google Cloud Console

1. Create a project at https://console.cloud.google.com/
2. Enable **Google+ API** / **Google Identity** services
3. **Credentials → Create OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs:
     - `http://127.0.0.1:8000/api/auth/google/callback` (local)
     - `https://your-api-domain.com/api/auth/google/callback` (production)
4. Copy **Client ID** → `GOOGLE_CLIENT_ID`
5. Copy **Client secret** → `GOOGLE_CLIENT_SECRET`

## Apple Developer Console

1. Sign in at https://developer.apple.com/account/
2. **Certificates, Identifiers & Profiles → Identifiers**
   - Create a **Services ID** (this is `APPLE_CLIENT_ID`)
   - Enable **Sign In with Apple**
   - Configure return URL: `{APP_URL}/api/auth/apple/callback`
3. Create a **Sign In with Apple** key
   - Note **Key ID** → `APPLE_KEY_ID`
   - Download `.p8` file → contents go in `APPLE_PRIVATE_KEY`
4. Note your **Team ID** → `APPLE_TEAM_ID`
5. Generate client secret (JWT) or let `socialiteproviders/apple` generate it from the private key

## Frontend flow

1. User clicks **Google** or **Apple** on `/login`
2. Browser navigates to `/api/auth/{provider}/redirect`
3. Provider authenticates user
4. Backend creates/finds user, issues Sanctum token
5. Frontend `/auth/callback` stores token, loads `/user`, redirects to `/dashboard`

## Troubleshooting

### "Social login is not configured" on the login page

This toast appears when `GET /api/auth/providers` reports `google: false` or `apple: false`. Fix it on the **backend**:

1. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `larte-backend/.env`
2. Ensure `APP_URL` matches your running API (e.g. `http://127.0.0.1:8000`)
3. Set `GOOGLE_REDIRECT_URI="${APP_URL}/api/auth/google/callback"` (or an explicit URI)
4. Register the same redirect URI in Google Cloud Console → OAuth client → Authorized redirect URIs
5. Restart the Laravel server after changing `.env`

Verify configuration:

```bash
curl http://127.0.0.1:8000/api/auth/providers
# Expected when Google is configured: {"success":true,"data":{"google":true,"apple":false},...}
```

If the providers request fails (network/API down), the login page still allows OAuth redirect attempts; the backend validates credentials and returns an error redirect when misconfigured.

## Notes

- OAuth users are created with role `OAUTH_DEFAULT_ROLE` (default: `viewer`) if they don't exist
- Existing users are matched by email
- Password reset email links point to `{FRONTEND_URL}/reset-password?token=...&email=...`
- Social buttons show a toast if the provider is not configured (`GET /api/auth/providers` returns `false`). If the providers check fails due to network/API errors, buttons still attempt redirect and the backend enforces configuration.
