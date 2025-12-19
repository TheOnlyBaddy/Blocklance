# Blocklance Frontend (Vite + React)

Production-ready scaffold for Blocklance marketplace using React, Vite, Tailwind, Framer Motion, lucide-react, Google OAuth (stub), MetaMask (stub), axios, and Recharts.

## Setup

- Node 18+
- Install deps:

```
npm install
```

- Create `.env` and set environment variables:

```
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_RPC_URL=your_rpc_provider_url
```

## Run

```
npm run dev
```

Open http://localhost:5173

## Tech

- React 18 + Vite 5
- Tailwind CSS 3
- Framer Motion 11
- lucide-react
- @react-oauth/google (placeholder integration)
- ethers / web3modal (placeholder)
- axios
- recharts

## Structure

- src/components/* (UI)
- src/pages/* (routes)
- src/data/* (mock data)
- src/styles/* (globals + glass.css)

## Integrations (stubs)

- Google OAuth: see `LoginForm.jsx`. Replace stub callbacks with real token exchange to your backend.
- MetaMask/web3: see `Payments.jsx` and wizard steps. Wire up ethers/web3modal as needed.

## TODO

- Replace all stubbed auth and wallet logic with real API/Web3 calls
- Add form validation and error states
- Add tests (unit/e2e)
- Implement theme toggle UI using `ThemeContext`
- Connect to Node/Express backend endpoints
