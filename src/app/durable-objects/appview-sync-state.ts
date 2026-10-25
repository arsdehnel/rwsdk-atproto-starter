import { desc, eq } from "drizzle-orm";
import { SyncedStateServer } from "rwsdk/use-synced-state/worker";
import db from "@/db/db";
import { statuses, users } from "@/db/schema";

export type StatusEntry = {
	did: string;
	handle: string | null;
	status: string;
	updatedAt: string;
};

export class AppViewSyncState extends SyncedStateServer {
	constructor(...args: ConstructorParameters<typeof SyncedStateServer>) {
		super(...args);
		// Seed statusMap from D1 before serving any requests. Runs once on cold
		// start (new deploy, eviction, first-ever instance). Skipped when the DO
		// already has state in memory from a previous warm request.
		args[0].blockConcurrencyWhile(async () => {
			if (this.getState("statusMap")) return;
			await this.seedFromD1();
		});
	}

	updateStatus(did: string, status: string, handle: string | null) {
		const current = (this.getState("statusMap") ?? {}) as Record<
			string,
			StatusEntry
		>;
		current[did] = { did, handle, status, updatedAt: new Date().toISOString() };
		this.setState(current, "statusMap");
	}

	removeStatus(did: string) {
		const current = (this.getState("statusMap") ?? {}) as Record<
			string,
			StatusEntry
		>;
		delete current[did];
		this.setState(current, "statusMap");
	}

	private async seedFromD1() {
		const readDb = await db.getReader();
		const rows = await readDb
			.select({
				did: statuses.did,
				status: statuses.status,
				receivedAt: statuses.receivedAt,
				handle: users.handle,
			})
			.from(statuses)
			.leftJoin(users, eq(statuses.did, users.did))
			.orderBy(desc(statuses.receivedAt));

		// Build a latest-status-per-user map. Rows are ordered newest-first so
		// the first entry for each DID is the current status.
		const map: Record<string, StatusEntry> = {};
		for (const row of rows) {
			if (!map[row.did]) {
				map[row.did] = {
					did: row.did,
					handle: row.handle ?? null,
					status: row.status,
					updatedAt: row.receivedAt,
				};
			}
		}

		this.setState(map, "statusMap");
	}
}
