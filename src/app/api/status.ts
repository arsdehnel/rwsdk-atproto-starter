import { Client, type DatetimeString } from "@atproto/lex";
import type { OAuthSession } from "@atproto/oauth-client-node";
import type { RequestInfo } from "rwsdk/worker";
import { getOAuthClient } from "@/app/lib/auth-client";
import statusSchema from "@/lexicons/xyz/statusphere/status";
import type { AppContext } from "@/worker";

type SetStatusRequest = {
	status: string;
};

async function post({
	request,
	ctx,
}: RequestInfo<AppContext>): Promise<Response> {
	const did = ctx.session?.did;
	if (!did) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { status } = (await request.json()) as SetStatusRequest;

	if (!status || typeof status !== "string") {
		return Response.json({ error: "Status is required" }, { status: 400 });
	}

	let oauthSession: OAuthSession;
	try {
		const oauthClient = await getOAuthClient();
		oauthSession = await oauthClient.restore(did);
	} catch {
		// OAuth session is gone (expired, deleted, or migrated storage).
		// Signal the client to clear the HTTP session and re-authenticate.
		return Response.json({ error: "session_expired" }, { status: 401 });
	}

	const lexClient = new Client(oauthSession);
	const createdAt = new Date().toISOString() as DatetimeString;
	try {
		const res = await lexClient.create(statusSchema, { status, createdAt });
		return Response.json({ success: true, uri: res.uri });
	} catch {
		// Token expired or revoked after restore() succeeded — treat same as session_expired.
		return Response.json({ error: "session_expired" }, { status: 401 });
	}
}

export default { post };
