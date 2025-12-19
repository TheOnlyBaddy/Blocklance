# Blocklance Backend

Express + MongoDB backend with Firebase and MetaMask authentication.

## Quick Start
1. Create `.env` (see below) and run:
```
npm install
npm run dev
```

## .env example
```
MONGO_URI=
PORT=4000

# Frontend origin for CORS (Windsurf dev)
CORS_ORIGIN=http://localhost:3000

JWT_SECRET=
JWT_EXPIRES_IN=1h

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

MODE=mock
```
For `FIREBASE_PRIVATE_KEY`, replace real newlines with `\n`.

## Frontend Integration (Windsurf)
- Frontend base URL: `http://localhost:3000`
- Backend base URL: `http://localhost:4000`
- CORS: Set `CORS_ORIGIN=http://localhost:3000` in `.env` (already shown above).

### Endpoints and headers
- Firebase login
  - POST `http://localhost:4000/api/auth/firebase-login`
  - Headers: `Authorization: Bearer <FIREBASE_ID_TOKEN>`
  - Response 200: `{ "user": { ... }, "message": "Authenticated via Firebase" }`
- MetaMask nonce
  - POST `http://localhost:4000/api/auth/metamask/nonce`
  - Body: `{ "walletAddress": "0xAbc..." }`
  - Response 200: `{ "walletAddress": "0xAbc...", "nonce": "random-12345" }`
- MetaMask verify
  - POST `http://localhost:4000/api/auth/metamask/verify`
  - Body: `{ "walletAddress": "0xAbc...", "signature": "0x..." }`
  - Response 200: `{ "token": "<backend_jwt>", "user": { ... } }`
- Logout (placeholder)
  - POST `http://localhost:4000/api/auth/logout`
  - Response 200: `{ "message": "Logged out (placeholder)" }`

### Authorization model
- Firebase-protected routes: send `Authorization: Bearer <FIREBASE_ID_TOKEN>`.
- MetaMask-protected routes: after verify, send `Authorization: Bearer <BACKEND_JWT>`.

## Security Notes
- Verify Firebase tokens server-side.
- Never store raw private keys.
- Use HTTPS, secure cookies; rotate JWT secret.
- Require nonce expiry and single-use for MetaMask.

## Troubleshooting

### ERR_BLOCKED_BY_CLIENT Error in Frontend

If you see `ERR_BLOCKED_BY_CLIENT` errors in the browser console when using Firebase authentication, this is caused by ad blockers blocking Google Analytics requests. **This does not affect authentication** - it's just console noise.

**Fix in Frontend:** Disable Firebase Analytics in your frontend Firebase config:

```javascript
// In your frontend firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Don't initialize analytics - it's optional and causes these errors
// Only import/use getAnalytics if you actually need it
```

See `FRONTEND_FIREBASE_FIX.md` for detailed solutions.
