import { env } from "cloudflare:workers";
import type {
	NodeSavedSession,
	NodeSavedState,
} from "@atproto/oauth-client-node";
import {
	buildAtprotoLoopbackClientMetadata,
	NodeOAuthClient,
} from "@atproto/oauth-client-node";
import { kvDecrypt, kvEncrypt } from "./crypto";

// Use globalThis so the NodeOAuthClient singleton survives hot-reloads in dev.
// In production, the Worker isolate keeps it alive for its lifetime.
const globalAuth = globalThis as unknown as {
	atprotoClient: NodeOAuthClient | null;
};

globalAuth.atprotoClient ??= null;

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
		...(pdsUrl.startsWith("http:") ? { allowHttp: true } : {}),

		clientMetadata: buildAtprotoLoopbackClientMetadata({
			scope: SCOPE,
			redirect_uris: ["http://127.0.0.1:5173/oauth/callback"],
		}),

		// stateStore: ephemeral KV with a 10-minute TTL. OAuth state only needs to
		// survive the seconds between the authorization redirect and the callback.
		// The TTL prevents stale entries from accumulating. Values are encrypted at
		// rest with AES-256-GCM using OAUTH_KV_ENCRYPTION_KEY.
		stateStore: {
			async get(key: string): Promise<NodeSavedState | undefined> {
				const raw = await env.OAUTH_STATE_KV.get(key);
				if (!raw) return undefined;
				const plaintext = await kvDecrypt(raw);
				return JSON.parse(plaintext) as NodeSavedState;
			},
			async set(key: string, value: NodeSavedState): Promise<void> {
				const encrypted = await kvEncrypt(JSON.stringify(value));
				await env.OAUTH_STATE_KV.put(key, encrypted, {
					expirationTtl: 600, // 10 minutes
				});
			},
			async del(key: string): Promise<void> {
				await env.OAUTH_STATE_KV.delete(key);
			},
		},

		// sessionStore: KV keyed by DID. OAuth tokens and DPoP key material persist
		// across Worker restarts and isolate evictions — users stay logged in after a
		// dev server restart or a production cold start. Values are encrypted at rest
		// with AES-256-GCM using OAUTH_KV_ENCRYPTION_KEY.
		sessionStore: {
			async get(did: string): Promise<NodeSavedSession | undefined> {
				const raw = await env.OAUTH_SESSION_KV.get(did);
				if (!raw) return undefined;
				const plaintext = await kvDecrypt(raw);
				return JSON.parse(plaintext) as NodeSavedSession;
			},
			async set(did: string, value: NodeSavedSession): Promise<void> {
				const encrypted = await kvEncrypt(JSON.stringify(value));
				await env.OAUTH_SESSION_KV.put(did, encrypted);
			},
			async del(did: string): Promise<void> {
				await env.OAUTH_SESSION_KV.delete(did);
			},
		},
	});

	return globalAuth.atprotoClient;
}
