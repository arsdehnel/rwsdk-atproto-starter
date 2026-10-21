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
