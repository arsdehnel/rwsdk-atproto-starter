import { eq, sql } from "drizzle-orm";
import { db } from "@/db/db";
import { users } from "@/db/schema";

// Returns the stored handle for a DID if we've seen this user before, null otherwise.
// Used by the webhook handler to skip HTTP resolution for known users.
export async function getUserHandle(did: string): Promise<string | null> {
	const rows = await db
		.select({ handle: users.handle })
		.from(users)
		.where(eq(users.did, did))
		.limit(1);
	return rows[0]?.handle ?? null;
}

// Upserts a user record by DID. Safe to call from both the OAuth callback
// (DID only, handle unknown) and the Tap webhook (DID + resolved handle).
// On conflict, handle is updated only if the incoming value is non-null —
// COALESCE preserves the existing handle rather than overwriting it with null.
export async function upsertUser(did: string, handle?: string | null) {
	try {
		await db
			.insert(users)
			.values({
				did,
				handle: handle ?? null,
				updatedAt: new Date().toISOString(),
			})
			.onConflictDoUpdate({
				target: users.did,
				set: {
					handle: sql`COALESCE(excluded.handle, ${users.handle})`,
					updatedAt: new Date().toISOString(),
				},
			});
	} catch (err) {
		const cause = err instanceof Error ? err.cause : undefined;
		console.error(
			"[upsertUser] failed:",
			cause instanceof Error ? cause.message : err,
		);
		throw err;
	}
}
