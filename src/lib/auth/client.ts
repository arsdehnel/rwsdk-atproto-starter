import { env } from "cloudflare:workers";
import type {
	NodeSavedSession,
	NodeSavedState,
} from "@atproto/oauth-client-node";
import {
	buildAtprotoLoopbackClientMetadata,
	NodeOAuthClient,
} from "@atproto/oauth-client-node";

// Use globalThis so the client and its token stores survive across
// hot-reloads in dev. In production, the Worker isolate keeps them alive
// for the lifetime of the instance.
const globalAuth = globalThis as unknown as {
	atprotoClient: NodeOAuthClient | null;
	stateStore: Map<string, NodeSavedState>;
	sessionStore: Map<string, NodeSavedSession>;
};

globalAuth.atprotoClient ??= null;
globalAuth.stateStore ??= new Map();
globalAuth.sessionStore ??= new Map();

export const SCOPE = "atproto";

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
		...(pdsUrl.startsWith("http:") ? { allowHttp: true } : {}),

		clientMetadata: buildAtprotoLoopbackClientMetadata({
			scope: SCOPE,
			redirect_uris: ["http://127.0.0.1:5173/oauth/callback"],
		}),

		// stateStore and sessionStore are in-memory for now. This means OAuth
		// tokens are lost on Worker restart and aren't shared across isolates.
		// Post 4 (authenticated writes) will need a durable store here, keyed
		// by DID — separate from the DO session which is keyed by session ID.
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

		sessionStore: {
			async get(key) {
				return globalAuth.sessionStore.get(key);
			},
			async set(key, value) {
				globalAuth.sessionStore.set(key, value);
			},
			async del(key) {
				globalAuth.sessionStore.delete(key);
			},
		},
	});

	return globalAuth.atprotoClient;
}
