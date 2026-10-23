import { parseTapEvent, type TapEvent } from "@atproto/tap";
import type { LexValue } from "@atproto/lex";
import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import type { RequestInfo } from "rwsdk/worker";
import { db } from "@/db/db";
import { statuses } from "@/db/schema";
import { sseClients, type StatusEntry } from "@/lib/status-store";

function pushToSseClients(allStatuses: StatusEntry[]) {
	const encoder = new TextEncoder();
	const msg = encoder.encode(
		`event: statuses\ndata: ${JSON.stringify(allStatuses)}\n\n`,
	);
	for (const ctrl of [...sseClients]) {
		try {
			ctrl.enqueue(msg);
		} catch {
			// Client disconnected
			sseClients.delete(ctrl);
		}
	}
}

export async function post({ request }: RequestInfo): Promise<Response> {
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
		await db.delete(statuses).where(eq(statuses.did, event.did));
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

		await db
			.insert(statuses)
			.values({
				did: event.did,
				handle,
				status,
				updatedAt: new Date().toISOString(),
			})
			.onConflictDoUpdate({
				target: statuses.did,
				set: { handle, status, updatedAt: new Date().toISOString() },
			});
	}

	const allStatuses = await db.select().from(statuses);
	pushToSseClients(allStatuses);
	return new Response("ok");
}
