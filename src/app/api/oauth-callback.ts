import type { RequestInfo } from "rwsdk/worker";
import { sessionStore } from "@/lib/auth/session-store";
import { getOAuthClient } from "@/lib/auth/client";

export async function get({ request, response }: RequestInfo) {
	const client = await getOAuthClient();
	const { session } = await client.callback(new URL(request.url).searchParams);

	await sessionStore.save(response.headers, { did: session.did });
	response.headers.set("Location", "/");
	return new Response(null, { status: 302, headers: response.headers });
}
