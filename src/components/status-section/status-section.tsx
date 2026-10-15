"use client";

import { useState } from "react";
import { StatusPicker } from "@/components/status-picker/status-picker";

interface StatusSectionProps {
  currentStatus: string | null;
  listRecordsEndpoint: string;
  initialRecords: unknown;
}

export function StatusSection({
  currentStatus,
  listRecordsEndpoint,
  initialRecords,
}: StatusSectionProps) {
  const [records, setRecords] = useState(initialRecords);

  function handleSuccess() {
    fetch(listRecordsEndpoint)
      .then((res) => res.json())
      .then(setRecords)
      .catch(console.error);
  }

  return (
    <>
      <StatusPicker currentStatus={currentStatus} onSuccess={handleSuccess} />

      <div style={{ marginTop: "2rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
          In your PDS
        </h3>
        <p style={{ fontSize: "0.875rem", color: "#52525b", marginBottom: "0.75rem" }}>
          The write used OAuth and the lex client. The read doesn't —{" "}
          <code style={{ fontSize: "0.8rem" }}>com.atproto.repo.listRecords</code> is
          public. This updates automatically after each pick.
        </p>
        <a
          href={listRecordsEndpoint}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: "0.8rem", wordBreak: "break-all", color: "#3b82f6" }}
        >
          {listRecordsEndpoint}
        </a>
        <pre
          style={{
            marginTop: "0.75rem",
            padding: "1rem",
            background: "#f4f4f5",
            borderRadius: "0.5rem",
            fontSize: "0.8rem",
            overflowX: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          {JSON.stringify(records, null, 2)}
        </pre>
      </div>
    </>
  );
}
