import { Client, type DatetimeString } from "@atproto/lex";
import type { RequestInfo } from "rwsdk/worker";
import type { AppContext } from "@/worker";
import statusSchema from "@/lexicons/xyz/statusphere/status";
import { getOAuthClient } from "@/lib/auth/client";
import type { OAuthSession } from "@atproto/oauth-client-node";
import { db } from "@/db/db";
import { statuses } from "@/db/schema";
import { pushToSseClients } from "@/lib/status-store";

type SetStatusRequest = {
	status: string;
};

export async function post({
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
		const res = await lexClient.put(
			statusSchema,
			{ status, createdAt },
			{ rkey: "self" },
		);

		// We already have the data — don't wait for the relay.
		// On conflict, preserve the existing handle (Tap maintains it); only update status.
		await db
			.insert(statuses)
			.values({
				did,
				handle: null,
				status,
				updatedAt: new Date().toISOString(),
			})
			.onConflictDoUpdate({
				target: statuses.did,
				set: { status, updatedAt: new Date().toISOString() },
			});

		const allStatuses = await db.select().from(statuses);
		pushToSseClients(allStatuses);

		return Response.json({ success: true, uri: res.uri });
	} catch {
		return Response.json({ error: "db_write_failed" }, { status: 500 });
	}
}
