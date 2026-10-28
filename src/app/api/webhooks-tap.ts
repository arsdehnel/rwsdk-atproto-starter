import { env } from "cloudflare:workers";
import type { LexValue } from "@atproto/lex";
import { parseTapEvent, type TapEvent } from "@atproto/tap";
import type { RequestInfo } from "rwsdk/worker";

async function post({ request }: RequestInfo): Promise<Response> {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return new Response("Bad request", { status: 400 });
	}

	let event: TapEvent;
	try {
		event = parseTapEvent(body as LexValue);
	} catch {
		// Malformed event — Tap will retry in production, locally it shouldn't fail since we control the sources, but we don't want to block on bad data.
		return new Response("Unrecognized event", { status: 400 });
	}

	if (
		event.type !== "record" ||
		event.collection !== "xyz.statusphere.status"
	) {
		return new Response("ok");
	}

	if (event.action === "delete") {
		const stub = env.DO_APPVIEW_SYNC_STATE.getByName("appViewSyncState");
		await stub.removeStatus(event.did);
	} else {
		const status = (event.record?.status as string) ?? "";

		// Resolve the handle — describeRepo is public, no auth needed.
		let handle: string | null = null;
		try {
			const res = await fetch(
				`${env.ATPROTO_PDS_URL}/xrpc/com.atproto.repo.describeRepo?repo=${event.did}`,
			);
			const data = (await res.json()) as { handle?: string };
			handle = data.handle ?? null;
		} catch {
			// Handle resolution is best-effort; fall back to null.
		}

		const stub = env.DO_APPVIEW_SYNC_STATE.getByName("appViewSyncState");
		await stub.updateStatus(event.did, status, handle);
	}

	return new Response("ok");
}

export default { post };
