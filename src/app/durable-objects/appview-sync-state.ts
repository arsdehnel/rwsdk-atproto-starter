import { SyncedStateServer } from "rwsdk/use-synced-state/worker";

export type StatusEntry = {
	did: string;
	handle: string | null;
	status: string;
	updatedAt: string;
};

export class AppViewSyncState extends SyncedStateServer {
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
}
