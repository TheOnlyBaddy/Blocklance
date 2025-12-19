import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth"

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase App
const app = initializeApp(firebaseConfig)

// Initialize Auth
export const auth = getAuth(app)

// Configure Google Auth Provider
export const provider = new GoogleAuthProvider()
provider.setCustomParameters({
  prompt: 'select_account', // Forces account selection even when one account is available
  login_hint: 'user@example.com' // Optional: pre-fill email if known
})

// Add scopes for Google OAuth
provider.addScope('profile')
provider.addScope('email')

// For better compatibility with Firebase Auth
provider.addScope('https://www.googleapis.com/auth/userinfo.email')
provider.addScope('https://www.googleapis.com/auth/userinfo.profile')

// Export auth functions
export { signInWithRedirect, getRedirectResult }

export default app
