import { db } from "@/db/db";
import { statuses } from "@/db/schema";
import { sseClients } from "@/lib/status-store";

export async function get(): Promise<Response> {
  const encoder = new TextEncoder();
  // Fetch current state before opening the stream so the client gets an
  // immediate snapshot without needing to wait for the next webhook.
  const initialStatuses = await db.select().from(statuses);

  let ctrl: ReadableStreamDefaultController<Uint8Array>;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      ctrl = controller;
      sseClients.add(ctrl);

      ctrl.enqueue(
        encoder.encode(`event: statuses\ndata: ${JSON.stringify(initialStatuses)}\n\n`),
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
