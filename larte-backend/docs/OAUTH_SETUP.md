# OAuth Setup — L'arte del Dolce ERP

This document describes how to configure Google and Apple social login for the Laravel API and React frontend.

## Environment variables

### Backend (`larte-backend/.env`)

```env
APP_URL=http://127.0.0.1:8000
FRONTEND_URL=http://localhost:5173

# Default role assigned to new OAuth users (must exist in roles table)
OAUTH_DEFAULT_ROLE=viewer

# Google OAuth
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

## Notes

- OAuth users are created with role `OAUTH_DEFAULT_ROLE` (default: `viewer`) if they don't exist
- Existing users are matched by email
- Password reset email links point to `{FRONTEND_URL}/reset-password?token=...&email=...`
- Social buttons show a toast if the provider is not configured (`GET /api/auth/providers` returns `false`)
