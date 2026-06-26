import { decodeProtectedHeader, importX509, jwtVerify } from 'jose';

// Runs on Vercel's Edge runtime: low cold-start latency and, crucially, native
// streaming so we can pipe the upstream SSE response straight back to the
// browser token-by-token. The model API key lives only here — it is read from a
// server-only env var (no VITE_ prefix) and never reaches the client bundle.
export const config = { runtime: 'edge' };

// Google's public x509 certs for Firebase ID tokens. Verifying against these
// lets us authenticate the learner without a service-account credential — we
// only need the (public) project id to check the issuer/audience claims.
const CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

interface CertCache {
  keys: Record<string, string>;
  expiresAt: number;
}

// Cached across invocations while the edge isolate stays warm.
let certCache: CertCache | null = null;

function parseMaxAge(cacheControl: string | null): number {
  const match = cacheControl?.match(/max-age=(\d+)/);
  return match ? Number(match[1]) : 3600;
}

async function getGoogleCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (certCache && certCache.expiresAt > now) return certCache.keys;

  const res = await fetch(CERTS_URL);
  if (!res.ok) throw new Error(`Failed to fetch signing certs (${res.status})`);
  const keys = (await res.json()) as Record<string, string>;
  certCache = { keys, expiresAt: now + parseMaxAge(res.headers.get('cache-control')) * 1000 };
  return keys;
}

/**
 * Verify a Firebase Auth ID token the way the Admin SDK would: RS256 signature
 * against Google's rotating certs, plus issuer/audience pinned to the project.
 * Throws on any failure; returns the decoded claims (incl. `sub` = uid) on success.
 */
async function verifyFirebaseToken(token: string, projectId: string) {
  const { kid } = decodeProtectedHeader(token);
  if (!kid) throw new Error('Token is missing a key id');

  const certs = await getGoogleCerts();
  const pem = certs[kid];
  if (!pem) throw new Error('Token signed by an unknown key');

  const key = await importX509(pem, 'RS256');
  const { payload } = await jwtVerify(token, key, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });
  if (!payload.sub) throw new Error('Token is missing a subject');
  return payload;
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return jsonError('Method not allowed', 405);

  const apiKey = process.env.AI_TUTOR_API_KEY;
  if (!apiKey) return jsonError('The tutor is not configured on the server.', 503);

  // Gate the proxy behind a signed-in Firebase user so random callers can't
  // burn credits. Set TUTOR_REQUIRE_AUTH=false only for local experimentation.
  if (process.env.TUTOR_REQUIRE_AUTH !== 'false') {
    // The project id isn't a secret (it's already in the client bundle), so fall
    // back to the VITE_-prefixed copy to avoid asking for a duplicate env var.
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
    if (!projectId) {
      return jsonError(
        'Server is missing FIREBASE_PROJECT_ID (or VITE_FIREBASE_PROJECT_ID), which is needed to verify your sign-in.',
        500,
      );
    }

    const match = (req.headers.get('authorization') ?? '').match(/^Bearer (.+)$/i);
    if (!match) return jsonError('Sign in to use the tutor.', 401);
    try {
      await verifyFirebaseToken(match[1], projectId);
    } catch {
      return jsonError('Your session is invalid or expired. Sign in again.', 401);
    }
  }

  const baseUrl = (process.env.AI_TUTOR_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');

  const body = await req.text();
  if (!body) return jsonError('Empty request body.', 400);

  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body,
    });
  } catch {
    return jsonError('Could not reach the tutor service.', 502);
  }

  // Pass the (streaming) upstream response straight through unchanged so the
  // client's existing SSE parser keeps working as-is.
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'text/event-stream',
      'Cache-Control': 'no-store',
    },
  });
}
