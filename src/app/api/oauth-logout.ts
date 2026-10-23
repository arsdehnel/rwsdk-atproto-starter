import type { RequestInfo } from "rwsdk/worker";
import { getOAuthClient } from "@/app/lib/auth-client";
import { sessionStore } from "@/app/lib/session";

async function post({ request, response }: RequestInfo) {
	const session = await sessionStore.load(request);
	if (session?.did) {
		const client = await getOAuthClient();
		await client.revoke(session.did);
	}

	await sessionStore.remove(request, response.headers);
	response.headers.set("Location", "/");
	return new Response(null, { status: 302, headers: response.headers });
}

export default { post };
