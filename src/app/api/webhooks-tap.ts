import { env } from "cloudflare:workers";
import type { LexValue } from "@atproto/lex";
import { parseTapEvent, type TapEvent } from "@atproto/tap";
import type { RequestInfo } from "rwsdk/worker";
import { deleteStatus, upsertStatus } from "@/db/statuses";
import { getUserHandle, upsertUser } from "@/db/users";

type DidDocument = {
	service?: Array<{ id: string; type: string; serviceEndpoint: string }>;
};

// Resolve a DID to its AT Protocol handle by looking up the DID document
// and calling describeRepo against the user's actual PDS.
// Returns null if resolution fails at any step (best-effort).
async function resolveHandle(did: string): Promise<string | null> {
	try {
		let didDoc: DidDocument;
		if (did.startsWith("did:plc:")) {
			const plcUrl = env.ATPROTO_PLC_URL || "https://plc.directory";
			const res = await fetch(`${plcUrl}/${did}`);
			if (!res.ok) return null;
			didDoc = (await res.json()) as DidDocument;
		} else if (did.startsWith("did:web:")) {
			const domain = did.slice("did:web:".length);
			const res = await fetch(`https://${domain}/.well-known/did.json`);
			if (!res.ok) return null;
			didDoc = (await res.json()) as DidDocument;
		} else {
			return null;
		}

		const pdsService = didDoc.service?.find(
			(s) =>
				s.type === "AtprotoPersonalDataServer" &&
				(s.id === "#atproto_pds" || s.id.endsWith("#atproto_pds")),
		);
		if (!pdsService?.serviceEndpoint) return null;

		const res = await fetch(
			`${pdsService.serviceEndpoint}/xrpc/com.atproto.repo.describeRepo?repo=${did}`,
		);
		if (!res.ok) return null;
		const data = (await res.json()) as { handle?: string };
		return data.handle ?? null;
	} catch {
		return null;
	}
}

async function post({ request }: RequestInfo): Promise<Response> {
	// Tap forwards the same Basic auth credentials it uses for its own API.
	// Value format: Basic base64(admin:<TAP_ADMIN_PASSWORD>)
	const expected = `Basic ${btoa(`admin:${env.WEBHOOK_TAP_SECRET}`)}`;
	const actual = request.headers.get("Authorization") ?? "";
	if (actual !== expected) {
		return new Response("Unauthorized", { status: 401 });
	}

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

	const atUri = `at://${event.did}/${event.collection}/${event.rkey}`;

	if (event.action === "delete") {
		await deleteStatus(atUri);
		const stub = env.DO_APPVIEW_SYNC_STATE.getByName("appViewSyncState");
		await stub.removeStatus(event.did);
	} else {
		const status = event.record?.status as string;

		// Use the stored handle from D1 if we've seen this user before —
		// avoids two HTTP requests (PLC + describeRepo) on every event.
		// Falls back to full resolution for new users or previously-failed lookups.
		const handle =
			(await getUserHandle(event.did)) ?? (await resolveHandle(event.did));

		await upsertUser(event.did, handle);
		await upsertStatus(event.did, atUri, status, event.rev);

		const stub = env.DO_APPVIEW_SYNC_STATE.getByName("appViewSyncState");
		await stub.updateStatus(event.did, status, handle);
	}

	return new Response("ok");
}

export default { post };
