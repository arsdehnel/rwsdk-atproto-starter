import { env } from "cloudflare:workers";
import { defineDurableSession } from "rwsdk/auth";
import type { BrowserSession } from "@/app/durable-objects/browser-sessions";

// Extracted to its own module to avoid a circular import:
// worker.tsx imports the OAuth route handlers, and those handlers
// need sessionStore — so sessionStore can't live in worker.tsx.
// wrangler types generates DurableObjectNamespace without the type parameter.
// The cast tells TypeScript the namespace holds BrowserSession instances.
export const sessionStore = defineDurableSession({
	secretKey: env.BROWSER_SESSION_SIGNING_KEY,
	sessionDurableObject:
		env.DO_BROWSER_SESSION as DurableObjectNamespace<BrowserSession>,
});
