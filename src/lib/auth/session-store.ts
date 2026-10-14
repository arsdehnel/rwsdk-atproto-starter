import { defineDurableSession } from "rwsdk/auth";
import { env } from "cloudflare:workers";
import type { UserSession } from "@/sessions/UserSession";

// Extracted to its own module to avoid a circular import:
// worker.tsx imports the OAuth route handlers, and those handlers
// need sessionStore — so sessionStore can't live in worker.tsx.
// wrangler types generates DurableObjectNamespace without the type parameter.
// The cast tells TypeScript the namespace holds UserSession instances.
export const sessionStore = defineDurableSession({
  sessionDurableObject: env.USER_SESSION_DO as DurableObjectNamespace<UserSession>,
});
