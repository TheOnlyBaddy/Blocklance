import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const hasEnvCredentials =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

if (!hasEnvCredentials) {
  console.error("❌ Firebase credentials missing in environment variables");
  throw new Error("Missing Firebase credentials");
}

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
  });
  console.log(
    `🔥 Firebase Admin initialized for project: ${process.env.FIREBASE_PROJECT_ID}`
  );
}

export default admin;
