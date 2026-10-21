export type StatusEntry = {
	did: string;
	handle: string | null;
	status: string;
	updatedAt: string;
};

// Module-level per-isolate state.
// Production gap: state is lost on Worker restart. Post 6 adds D1.
export const statusStore = new Map<string, StatusEntry>();

// Active SSE client controllers. Same single-isolate caveat.
export const sseClients = new Set<
	ReadableStreamDefaultController<Uint8Array>
>();
