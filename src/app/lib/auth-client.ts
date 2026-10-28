import { env } from "cloudflare:workers";
import type {
	NodeSavedSession,
	NodeSavedState,
} from "@atproto/oauth-client-node";
import {
	buildAtprotoLoopbackClientMetadata,
	NodeOAuthClient,
} from "@atproto/oauth-client-node";
import { kvDecrypt, kvEncrypt, parseKeyRing } from "./crypto";

// Use globalThis so the NodeOAuthClient singleton survives hot-reloads in dev.
// In production, the Worker isolate keeps it alive for its lifetime.
const globalAuth = globalThis as unknown as {
	atprotoClient: NodeOAuthClient | null;
};

globalAuth.atprotoClient ??= null;

export const SCOPE = "atproto repo:xyz.statusphere.status";

export async function getOAuthClient(): Promise<NodeOAuthClient> {
	if (globalAuth.atprotoClient) return globalAuth.atprotoClient;

	const {
		ATPROTO_PDS_URL: pdsUrl,
		ATPROTO_PLC_URL: plcUrl,
		APP_URL: appUrl,
	} = env;

	globalAuth.atprotoClient = new NodeOAuthClient({
		// Passing a string URL instead of AtprotoHandleResolverNode avoids
		// pulling in undici, which is not available in the workerd runtime.
		// In local dev, point at the local PDS so it can resolve .test handles.
		handleResolver: pdsUrl || "https://bsky.social",

		// Override the default plc.directory with the local PLC so did:plc:* DIDs
		// issued by the local dev stack resolve correctly instead of 404ing on plc.directory.
		...(plcUrl ? { plcDirectoryUrl: plcUrl } : {}),

		// Allow http:// OAuth metadata and token endpoints. Required when running
		// against a local PDS with PDS_DEV_MODE=true (which serves over plain HTTP).
		...(pdsUrl?.startsWith("http:") ? { allowHttp: true } : {}),

		// In production (APP_URL set), use a discoverable client ID — the client_id
		// IS the URL of this metadata document, which authorization servers fetch to
		// verify our identity. In local dev, use the loopback client (a well-known
		// special case recognized by bsky.social and other AT Protocol PDS instances).
		clientMetadata: appUrl
			? {
					client_id: `${appUrl}/client-metadata.json`,
					scope: SCOPE,
					redirect_uris: [`${appUrl}/oauth/callback`],
					response_types: ["code"],
					grant_types: ["authorization_code", "refresh_token"],
					token_endpoint_auth_method: "none",
					application_type: "web",
					dpop_bound_access_tokens: true,
				}
			: buildAtprotoLoopbackClientMetadata({
					scope: SCOPE,
					redirect_uris: ["http://127.0.0.1:5173/oauth/callback"],
				}),

		// stateStore: ephemeral KV with a 10-minute TTL. OAuth state only needs to
		// survive the seconds between the authorization redirect and the callback.
		// The TTL prevents stale entries from accumulating. Values are encrypted at
		// rest with AES-256-GCM using the first key in OAUTH_STATE_KV_ENCRYPTION_KEYS.
		// Previous keys in the ring are tried on decrypt to support zero-downtime
		// key rotation; no re-encryption is needed since entries expire within 10 minutes.
		stateStore: {
			async get(key: string): Promise<NodeSavedState | undefined> {
				const raw = await env.KV_OAUTH_STATE.get(key);
				if (!raw) return undefined;
				const keys = parseKeyRing(env.OAUTH_STATE_KV_ENCRYPTION_KEYS);
				for (let i = 0; i < keys.length; i++) {
					try {
						const plaintext = await kvDecrypt(raw, keys[i]);
						return JSON.parse(plaintext) as NodeSavedState;
					} catch {
						if (i === keys.length - 1)
							throw new Error(`Token could not be decrypted`);
					}
				}
			},
			async set(key: string, value: NodeSavedState): Promise<void> {
				const keys = parseKeyRing(env.OAUTH_STATE_KV_ENCRYPTION_KEYS);
				const encrypted = await kvEncrypt(JSON.stringify(value), keys[0]);
				await env.KV_OAUTH_STATE.put(key, encrypted, {
					expirationTtl: 600, // 10 minutes
				});
			},
			async del(key: string): Promise<void> {
				await env.KV_OAUTH_STATE.delete(key);
			},
		},

		// sessionStore: DO with custom storage methods to handle propagation lag
		//   and token refresh lock problems
		sessionStore: {
			async get(did: string): Promise<NodeSavedSession | undefined> {
				const doStub = await env.DO_OAUTH_TOKEN.getByName(did);
				return await doStub.getToken();
			},
			async set(did: string, value: NodeSavedSession): Promise<void> {
				const doStub = await env.DO_OAUTH_TOKEN.getByName(did);
				await doStub.setToken(value);
			},
			async del(did: string): Promise<void> {
				const doStub = await env.DO_OAUTH_TOKEN.getByName(did);
				await doStub.deleteToken();
			},
		},

		requestLock: async (did, fn) => {
			const doStub = await env.DO_OAUTH_TOKEN.getByName(did);
			await doStub.acquireLock();
			try {
				return await fn();
			} finally {
				await doStub.releaseLock();
			}
		},
	});

	return globalAuth.atprotoClient;
}
