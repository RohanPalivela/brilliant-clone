/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  /** When 'true', connect Auth + Firestore to the local emulator (e2e only). */
  readonly VITE_USE_FIREBASE_EMULATOR?: string;
  /** Turn the in-app AI tutor on ('true') or off. The model key lives server-side. */
  readonly VITE_AI_TUTOR_ENABLED?: string;
  /** Override the tutor proxy path (defaults to /api/tutor). */
  readonly VITE_AI_TUTOR_ENDPOINT?: string;
  /** Chat model slug for the tutor (defaults to gpt-4o-mini). */
  readonly VITE_AI_TUTOR_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
