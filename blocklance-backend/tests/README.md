# Manual Test Steps

## Prerequisites
- Create a `.env` file at the project root based on README instructions.
- Ensure MongoDB Atlas URI works and IP access is allowed.
- Provide Firebase Admin credentials via env or `GOOGLE_APPLICATION_CREDENTIALS`.

## Run
```
npm install
npm run dev
```

## Healthcheck
- GET http://localhost:4000/health → `{ "status": "ok" }`

## Firebase Login
- Obtain a Firebase ID token from your frontend or Firebase CLI.
- POST http://localhost:4000/api/auth/firebase-login
  - Headers: `Authorization: Bearer <FIREBASE_ID_TOKEN>`
- Expect 200 with `{ user, message: "Authenticated via Firebase" }`

## MetaMask Nonce
- POST http://localhost:4000/api/auth/metamask/nonce
  - Body: `{ "walletAddress": "0xAbc..." }`
- Expect 200 with `{ walletAddress, nonce }`

## MetaMask Verify
- Have the wallet sign the `nonce` string returned above.
- POST http://localhost:4000/api/auth/metamask/verify
  - Body: `{ "walletAddress": "0xAbc...", "signature": "0x..." }`
- Expect 200 with `{ token, user }`

> Note: If signature fails or nonce expired/used, expect relevant 4xx error.



