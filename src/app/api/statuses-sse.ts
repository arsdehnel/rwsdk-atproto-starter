import { sseClients, statusStore } from "@/lib/status-store";

export function get(): Response {
	const encoder = new TextEncoder();

	let ctrl: ReadableStreamDefaultController<Uint8Array>;

	const stream = new ReadableStream<Uint8Array>({
		start(controller) {
			ctrl = controller;
			sseClients.add(ctrl);

			// Send current state immediately so the client has something to render.
			const all = Array.from(statusStore.values());
			ctrl.enqueue(
				encoder.encode(`event: statuses\ndata: ${JSON.stringify(all)}\n\n`),
			);
		},
		cancel() {
			sseClients.delete(ctrl);
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		},
	});
}
