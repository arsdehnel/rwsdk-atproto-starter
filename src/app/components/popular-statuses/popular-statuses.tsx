interface PopularStatusesProps {
	statuses: { status: string; count: number }[];
}

export function PopularStatuses({ statuses }: PopularStatusesProps) {
	if (statuses.length === 0) {
		return <p className="prose">No statuses recorded yet.</p>;
	}

	return (
		<div className="popularStatusesGrid">
			{statuses.map(({ status, count }) => (
				<div key={status} className="popularStatusesItem">
					<span className="popularStatusesEmoji">{status}</span>
					<span className="popularStatusesTally">{count}</span>
				</div>
			))}
		</div>
	);
}
