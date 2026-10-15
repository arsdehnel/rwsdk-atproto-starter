import { env } from "cloudflare:workers";
import type { RequestInfo } from "rwsdk/worker";
import { sessionStore } from "@/lib/auth/session-store";
import { getOAuthClient } from "@/lib/auth/client";

export async function get({ request, response }: RequestInfo) {
  const client = await getOAuthClient();
  const { session } = await client.callback(new URL(request.url).searchParams);

  await sessionStore.save(response.headers, { did: session.did });

  // Register the user's repo with Tap so it tracks their records on the
  // firehose. Without this, Tap won't deliver webhook events for this DID.
  try {
    await fetch(`${env.ATPROTO_TAP_URL}/repos/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dids: [session.did] }),
    });
  } catch {
    // Tap may not be running (e.g. production deploy without local devnet).
    // Non-fatal: the app works without it, the feed just won't update live.
  }

  response.headers.set("Location", "/");
  return new Response(null, { status: 302, headers: response.headers });
}
