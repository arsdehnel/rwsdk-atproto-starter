"use client";
import { useSyncedState } from "rwsdk/use-synced-state/client";
import type { StatusEntry } from "@/app/durable-objects";

import styles from "./status-board.module.css";

export function StatusBoard() {
	const [statusMap] = useSyncedState<Record<string, StatusEntry>>(
		{},
		"statusMap",
	);

	if (Object.keys(statusMap).length === 0) {
		return <p className="prose">No statuses yet.</p>;
	}

	return (
		<ul className={styles.statusBoardList}>
			{Object.entries(statusMap).map(([did, entry]) => {
				return (
					<li key={did} className={styles.statusBoardItem}>
						<span className={styles.statusBoardEmoji}>{entry.status}</span>
						<span className={styles.statusBoardHandle}>
							{entry.handle ? `@${entry.handle}` : `${entry.did.slice(0, 20)}…`}
						</span>
						<span className={styles.statusBoardTimestamp}>
							{new Date(entry.updatedAt).toLocaleTimeString()}
						</span>
					</li>
				);
			})}
		</ul>
	);
}
