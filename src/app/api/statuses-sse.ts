import { db } from "@/db/db";
import { statuses } from "@/db/schema";
import { sseClients } from "@/lib/status-store";

export async function get(): Promise<Response> {
	const encoder = new TextEncoder();
	// Fetch current state before opening the stream so the client gets an
	// immediate snapshot without needing to wait for the next webhook.
	const initialStatuses = await db.select().from(statuses);

	let ctrl: ReadableStreamDefaultController<Uint8Array>;
	let heartbeat: ReturnType<typeof setInterval>;

	const stream = new ReadableStream<Uint8Array>({
		start(controller) {
			ctrl = controller;
			sseClients.add(ctrl);

			// Short retry so reconnects happen in ~100ms rather than the default 3s.
			// In local dev the Vite proxy doesn't flush SSE events to the browser,
			// so updates arrive on reconnect rather than on push. 100ms makes that
			// invisible in practice.
			ctrl.enqueue(encoder.encode(`retry: 100\n\n`));
			ctrl.enqueue(
				encoder.encode(
					`event: statuses\ndata: ${JSON.stringify(initialStatuses)}\n\n`,
				),
			);

			// Heartbeat keeps the connection alive and evicts stale controllers.
			heartbeat = setInterval(() => {
				try {
					ctrl.enqueue(encoder.encode(`:ping\n\n`));
				} catch {
					sseClients.delete(ctrl);
					clearInterval(heartbeat);
				}
			}, 1000);
		},
		cancel() {
			sseClients.delete(ctrl);
			clearInterval(heartbeat);
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
