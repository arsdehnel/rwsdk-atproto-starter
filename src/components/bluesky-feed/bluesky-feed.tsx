"use client";

import styles from "./bluesky-feed.module.css";

export function BlueskyFeed({ endpoint, records }: { endpoint: string; records: unknown }) {
  return (
    <>
      <a href={endpoint} target="_blank" rel="noreferrer" className={styles.endpointLink}>
        {endpoint}
      </a>
      <pre className={styles.jsonBlock}>{JSON.stringify(records, null, 2)}</pre>
    </>
  );
}
