<<<<<<< HEAD
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

=======
import type { RequestInfo } from "rwsdk/worker";
import { getOAuthClient } from "@/app/lib/auth-client";
import { sessionStore } from "@/app/lib/session";

async function get({ request, response }: RequestInfo) {
	const client = await getOAuthClient();
	const { session } = await client.callback(new URL(request.url).searchParams);

	await sessionStore.save(response.headers, { did: session.did });
>>>>>>> d83ff43 (feat: initial post 2 functionality)
	response.headers.set("Location", "/");
	return new Response(null, { status: 302, headers: response.headers });
}

export default {
	get,
};
