import { env } from "cloudflare:workers";
import type { OAuthSession } from "@atproto/oauth-client-node";
import type { RequestInfo } from "rwsdk/worker";
import { getOAuthClient } from "@/app/lib/auth-client";
import { sessionStore } from "@/app/lib/session";
import { upsertUser } from "@/db/users";

async function get({ request, response }: RequestInfo) {
	const client = await getOAuthClient();
	let session: OAuthSession | undefined;
	try {
		({ session } = await client.callback(new URL(request.url).searchParams));
	} catch {
		response.headers.set("Location", "/oauth/login");
		return new Response(null, { status: 302, headers: response.headers });
	}

	await sessionStore.save(response.headers, { did: session.did });
	await upsertUser(session.did);

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

export default {
	get,
};
