import type { RequestInfo } from "rwsdk/worker";
import { getOAuthClient } from "@/app/lib/auth-client";
import { sessionStore } from "@/app/lib/session";

async function get({ request, response }: RequestInfo) {
	const client = await getOAuthClient();
	const { session } = await client.callback(new URL(request.url).searchParams);

	await sessionStore.save(response.headers, { did: session.did });
	response.headers.set("Location", "/");
	return new Response(null, { status: 302, headers: response.headers });
}

export default {
	get,
};
