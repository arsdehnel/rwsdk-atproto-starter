import { env } from "cloudflare:workers";
import type {
	NodeSavedSession,
	NodeSavedState,
} from "@atproto/oauth-client-node";
import {
	buildAtprotoLoopbackClientMetadata,
	NodeOAuthClient,
} from "@atproto/oauth-client-node";

// Use globalThis so the NodeOAuthClient singleton survives hot-reloads in dev.
// In production, the Worker isolate keeps it alive for its lifetime.
const globalAuth = globalThis as unknown as {
	atprotoClient: NodeOAuthClient | null;
	stateStore: Map<string, NodeSavedState>;
};

globalAuth.atprotoClient ??= null;
globalAuth.stateStore ??= new Map();

export const SCOPE = "atproto repo:xyz.statusphere.status";

export async function getOAuthClient(): Promise<NodeOAuthClient> {
	if (globalAuth.atprotoClient) return globalAuth.atprotoClient;

	const { ATPROTO_PDS_URL: pdsUrl, ATPROTO_PLC_URL: plcUrl } = env;

	globalAuth.atprotoClient = new NodeOAuthClient({
		// Passing a string URL instead of AtprotoHandleResolverNode avoids
		// pulling in undici, which is not available in the workerd runtime.
		// In devnet, point at the local PDS so it can resolve .test handles.
		handleResolver: pdsUrl || "https://bsky.social",

		// Override the default plc.directory with the local PLC so did:plc:* DIDs
		// issued by the devnet resolve correctly instead of 404ing on plc.directory.
		...(plcUrl ? { plcDirectoryUrl: plcUrl } : {}),

		// Allow http:// OAuth metadata and token endpoints. Required when running
		// against a local PDS with PDS_DEV_MODE=true (which serves over plain HTTP).
		...(pdsUrl?.startsWith("http:") ? { allowHttp: true } : {}),

		clientMetadata: buildAtprotoLoopbackClientMetadata({
			scope: SCOPE,
			redirect_uris: ["http://127.0.0.1:5173/oauth/callback"],
		}),

		// stateStore: is still in memory as this only needs to live long enough for
		//   the login itself to complete
		stateStore: {
			async get(key) {
				return globalAuth.stateStore.get(key);
			},
			async set(key, value) {
				globalAuth.stateStore.set(key, value);
			},
			async del(key) {
				globalAuth.stateStore.delete(key);
			},
		},

		// sessionStore: KV keyed by DID. OAuth tokens persist across Worker restarts
		// and isolate evictions — users stay logged in after a dev server restart or
		// a production cold start.
		sessionStore: {
			async get(did: string): Promise<NodeSavedSession | undefined> {
				const raw = await env.KV_OAUTH_TOKENS.get(did);
				return raw ? (JSON.parse(raw) as NodeSavedSession) : undefined;
			},
			async set(did: string, value: NodeSavedSession): Promise<void> {
				await env.KV_OAUTH_TOKENS.put(did, JSON.stringify(value));
			},
			async del(did: string): Promise<void> {
				await env.KV_OAUTH_TOKENS.delete(did);
			},
		},
	});

	return globalAuth.atprotoClient;
}
