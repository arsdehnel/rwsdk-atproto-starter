"use client";

import { useState } from "react";
import { PdsFeedViewer, StatusPicker } from "@/app/components";

interface StatusSectionProps {
	did: string;
	currentStatus: string | null;
	listRecordsEndpoint: string;
	initialRecords: unknown;
}

export function StatusSection({
	did,
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
			<StatusPicker
				currentStatus={currentStatus}
				onSuccess={handleSuccess}
				did={did}
			/>
			<h2 className="sectionTitle">View your status records</h2>
			<p className="prose">
				The write used OAuth and the lex client. The read doesn't since{" "}
				<code style={{ fontSize: "0.8rem" }}>com.atproto.repo.listRecords</code>{" "}
				is public. This updates automatically after each pick.
			</p>
			<PdsFeedViewer endpoint={listRecordsEndpoint} records={records} />
		</>
	);
}
