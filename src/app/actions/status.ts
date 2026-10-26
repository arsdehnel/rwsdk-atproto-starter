"use server";

import { Client, type DatetimeString } from "@atproto/lex";
import type { OAuthSession } from "@atproto/oauth-client-node";
import { requestInfo } from "rwsdk/worker";
import { getOAuthClient } from "@/app/lib/auth-client";
import statusSchema from "@/lexicons/xyz/statusphere/status";
import type { AppContext } from "@/worker";

export type SetStatusResult =
	| { success: true; uri: string; createdAt: string }
	| { success: false; error: "unauthorized" | "session_expired" | "failed" };

export async function setStatus(status: string): Promise<SetStatusResult> {
	const { ctx } = requestInfo as unknown as { ctx: AppContext };
	const did = ctx.session?.did;

	if (!did) {
		return { success: false, error: "unauthorized" };
	}

	let oauthSession: OAuthSession;
	try {
		const oauthClient = await getOAuthClient();
		oauthSession = await oauthClient.restore(did);
	} catch {
		return { success: false, error: "session_expired" };
	}

	const lexClient = new Client(oauthSession);
	const createdAt = new Date().toISOString() as DatetimeString;
	try {
		const res = await lexClient.create(statusSchema, { status, createdAt });
		return { success: true, uri: res.uri, createdAt };
	} catch {
		// Token expired or revoked after restore() succeeded — treat same as session_expired.
		return { success: false, error: "session_expired" };
	}
}
