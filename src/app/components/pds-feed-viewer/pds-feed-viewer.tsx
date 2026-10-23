"use client";

import styles from "./pds-feed-viewer.module.css";

export function PdsFeedViewer({
	endpoint,
	records,
}: {
	endpoint: string;
	records: unknown;
}) {
	return (
		<>
			<p className="prose">
				<strong>View in your browser:</strong>
				<a
					href={endpoint}
					target="_blank"
					rel="noreferrer"
					className={styles.endpointLink}
				>
					{endpoint}
				</a>
			</p>
			<pre className={styles.jsonBlock}>{JSON.stringify(records, null, 2)}</pre>
		</>
	);
}
