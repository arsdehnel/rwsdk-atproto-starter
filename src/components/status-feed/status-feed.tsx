"use client";

import { useEffect, useState } from "react";
import type { StatusEntry } from "@/lib/status-store";

interface StatusFeedProps {
	initialStatuses: StatusEntry[];
}

export function StatusFeed({ initialStatuses }: StatusFeedProps) {
	const [statuses, setStatuses] = useState<StatusEntry[]>(initialStatuses);

	useEffect(() => {
		const es = new EventSource("/api/statuses/sse");
		es.addEventListener("statuses", (e) => {
			setStatuses(JSON.parse(e.data) as StatusEntry[]);
		});
		return () => es.close();
	}, []);

	if (statuses.length === 0) {
		return (
			<p style={{ fontSize: "0.875rem", color: "#71717a" }}>
				No statuses yet. Pick one above — it'll appear here via Tap webhook.
			</p>
		);
	}

	return (
		<ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
			{statuses.map((entry) => (
				<li
					key={entry.did}
					style={{
						display: "flex",
						alignItems: "center",
						gap: "0.75rem",
						padding: "0.5rem 0",
						borderBottom: "1px solid #f4f4f5",
					}}
				>
					<span style={{ fontSize: "1.5rem" }}>{entry.status}</span>
					<span style={{ fontSize: "0.875rem", color: "#3f3f46" }}>
						{entry.handle ? `@${entry.handle}` : `${entry.did.slice(0, 20)}…`}
					</span>
					<span
						style={{
							marginLeft: "auto",
							fontSize: "0.75rem",
							color: "#a1a1aa",
						}}
					>
						{new Date(entry.updatedAt).toLocaleTimeString()}
					</span>
				</li>
			))}
		</ul>
	);
}
