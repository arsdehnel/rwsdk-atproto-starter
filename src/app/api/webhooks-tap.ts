import { parseTapEvent, type TapEvent } from "@atproto/tap";
import type { LexValue } from "@atproto/lex";
import { env } from "cloudflare:workers";
import type { RequestInfo } from "rwsdk/worker";
import { sseClients, statusStore, type StatusEntry } from "@/lib/status-store";

function pushToSseClients(statuses: StatusEntry[]) {
  const encoder = new TextEncoder();
  const msg = encoder.encode(
    `event: statuses\ndata: ${JSON.stringify(statuses)}\n\n`,
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

export async function post({ request }: RequestInfo): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  let event: TapEvent;
  try {
    event = parseTapEvent(body as LexValue);
  } catch {
    // Malformed event — Tap will retry, but we don't want to block on bad data.
    return new Response("Unrecognized event", { status: 400 });
  }

  if (event.type !== "record" || event.collection !== "xyz.statusphere.status") {
    return new Response("ok");
  }

  if (event.action === "delete") {
    statusStore.delete(event.did);
  } else {
    const status = (event.record?.status as string) ?? "";

    // Resolve the handle — listRecords is public, no auth needed.
    let handle: string | null = null;
    try {
      const res = await fetch(
        `${env.ATPROTO_PDS_URL}/xrpc/com.atproto.repo.describeRepo?repo=${event.did}`,
      );
      const data = (await res.json()) as { handle?: string };
      handle = data.handle ?? null;
    } catch {
      // Handle resolution is best-effort; fall back to null.
    }

    statusStore.set(event.did, {
      did: event.did,
      handle,
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  pushToSseClients(Array.from(statusStore.values()));
  return new Response("ok");
}
