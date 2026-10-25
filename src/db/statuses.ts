import { eq, sql } from "drizzle-orm";
import db from "@/db/db";
import { statuses } from "@/db/schema";

export async function upsertStatus(
	did: string,
	atUri: string,
	status: string,
	rev: string,
) {
	const writeDb = await db.getWriter();
	try {
		await writeDb
			.insert(statuses)
			.values({ did, atUri, status, rev, receivedAt: new Date().toISOString() })
			.onConflictDoUpdate({
				target: statuses.atUri,
				set: { status, rev },
				// Only overwrite if the incoming rev is newer than what's stored.
				// COALESCE handles rows that predate the rev column (treats NULL as oldest).
				// TIDs are lexicographically sortable by time, so string comparison is correct.
				setWhere: sql`excluded.rev > COALESCE(${statuses.rev}, '')`,
			});
	} catch (err) {
		const cause = err instanceof Error ? err.cause : undefined;
		console.error(
			"[upsertStatus] failed:",
			cause instanceof Error ? cause.message : err,
		);
		throw err;
	}
}

export async function deleteStatus(atUri: string) {
	const writeDb = await db.getWriter();
	try {
		await writeDb.delete(statuses).where(eq(statuses.atUri, atUri));
	} catch (err) {
		const cause = err instanceof Error ? err.cause : undefined;
		console.error(
			"[deleteStatus] failed:",
			cause instanceof Error ? cause.message : err,
		);
		throw err;
	}
}
