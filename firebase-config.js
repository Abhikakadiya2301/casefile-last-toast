export const firebaseConfig = {
  apiKey: "PASTE_FIREBASE_API_KEY",
  authDomain: "PASTE_FIREBASE_AUTH_DOMAIN",
  projectId: "PASTE_FIREBASE_PROJECT_ID",
  appId: "PASTE_FIREBASE_APP_ID"
};

export const firebaseConfigured = Object.values(firebaseConfig).every(
  value => value && !String(value).startsWith("PASTE_")
);
