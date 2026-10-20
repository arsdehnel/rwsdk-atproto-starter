export type StatusEntry = {
	did: string;
	handle: string | null;
	status: string;
	updatedAt: string;
};

// Active SSE client controllers. Per-isolate in-memory — ephemeral by design.
export const sseClients = new Set<
	ReadableStreamDefaultController<Uint8Array>
>();

export function pushToSseClients(allStatuses: StatusEntry[]): void {
	const encoder = new TextEncoder();
	const msg = encoder.encode(
		`event: statuses\ndata: ${JSON.stringify(allStatuses)}\n\n`,
	);
	for (const ctrl of [...sseClients]) {
		try {
			ctrl.enqueue(msg);
		} catch {
			// Client disconnected
			sseClients.delete(ctrl);
		}
	}
}
