"use client";

import styles from "./bluesky-feed.module.css";

export function BlueskyFeed({
	endpoint,
	records,
}: {
	endpoint: string;
	records: unknown;
}) {
	return (
		<>
			<p className="prose">
				This data was fetched server-side with a single{" "}
				<code className="inlineCode">fetch</code> call — no auth, no SDK, no
				secrets. Open the URL in a browser and you'll see the same thing.
			</p>
			<a
				href={endpoint}
				target="_blank"
				rel="noreferrer"
				className={styles.endpointLink}
			>
				{endpoint}
			</a>
			<pre className={styles.jsonBlock}>{JSON.stringify(records, null, 2)}</pre>
		</>
	);
}
