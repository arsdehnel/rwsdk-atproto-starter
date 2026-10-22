import { eq } from "drizzle-orm";
import { db } from "@/db/db";
import { statuses } from "@/db/schema";
import { pushToSseClients } from "./status-store";

type UpsertStatusInput = {
	did: string;
	/** Omit to preserve the existing handle; pass explicitly to update it. */
	handle?: string | null;
	status: string;
	/** AT Protocol commit rev (TID). Used to skip stale or duplicate writes. */
	rev: string | null;
};

/**
 * Upserts a status record and pushes the updated list to SSE clients.
 * Returns false (and skips the write) if the stored rev is the same or newer.
 */
export async function upsertStatus({
	did,
	handle,
	status,
	rev,
}: UpsertStatusInput): Promise<boolean> {
	if (rev !== null) {
		const existing = await db
			.select({ rev: statuses.rev })
			.from(statuses)
			.where(eq(statuses.did, did))
			.get();
		// TIDs are lexicographically ordered by timestamp — string comparison is correct.
		if (existing?.rev != null && existing.rev >= rev) {
			return false;
		}
	}

	await db
		.insert(statuses)
		.values({
			did,
			handle: handle ?? null,
			status,
			rev,
			updatedAt: new Date().toISOString(),
		})
		.onConflictDoUpdate({
			target: statuses.did,
			set: {
				status,
				rev,
				updatedAt: new Date().toISOString(),
				// Only update handle when the caller provides one (webhook path).
				// Omitting it here preserves whatever handle Tap last resolved.
				...(handle !== undefined ? { handle } : {}),
			},
		});

	const allStatuses = await db.select().from(statuses);
	pushToSseClients(allStatuses);
	return true;
}
