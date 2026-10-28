import { DurableObject, env } from "cloudflare:workers";
import type { NodeSavedSession } from "@atproto/oauth-client-node";
import { kvDecrypt, kvEncrypt, parseKeyRing } from "@/app/lib/crypto";

export class OAuthToken extends DurableObject {
	private tokenData: NodeSavedSession | undefined = undefined;
	private locked = false;
	private lockQueue: Array<() => void> = [];
	private lockAcquiredAtTimestamp: number | undefined = undefined;

	async getToken() {
		if (!this.tokenData) {
			const rawTokenData = await this.ctx.storage.get<string>("tokenData");
			if (!rawTokenData) return undefined;

			const keys = parseKeyRing(env.OAUTH_TOKEN_KV_ENCRYPTION_KEYS);
			let plaintext: string | undefined;
			let needsReencryption = false;

			for (let i = 0; i < keys.length; i++) {
				try {
					plaintext = await kvDecrypt(rawTokenData, keys[i]);
					needsReencryption = i > 0;
					break;
				} catch {
					if (i === keys.length - 1)
						throw new Error(`Token decryption failed, no more keys to try`);
				}
			}

			if (!plaintext) {
				throw new Error(
					`Token decryption failed, no decrypted value determined`,
				);
			}

			this.tokenData = JSON.parse(plaintext) as NodeSavedSession;

			// Re-encrypt with current key so this entry migrates off the old key.
			if (needsReencryption) {
				const encrypted = await kvEncrypt(
					JSON.stringify(this.tokenData),
					keys[0],
				);
				await this.ctx.storage.put<string>("tokenData", encrypted);
			}
		}
		return this.tokenData;
	}

	async setToken(tokenData: NodeSavedSession) {
		this.tokenData = tokenData;
		const keys = parseKeyRing(env.OAUTH_TOKEN_KV_ENCRYPTION_KEYS);
		const encrypted = await kvEncrypt(JSON.stringify(tokenData), keys[0]);
		await this.ctx.storage.put<string>("tokenData", encrypted);
	}

	async deleteToken() {
		this.tokenData = undefined;
		await this.ctx.storage.delete("tokenData");
	}

	async acquireLock(): Promise<void> {
		// if it has been locked for more than 30 seconds force-release it
		if (
			this.lockAcquiredAtTimestamp &&
			Date.now() - this.lockAcquiredAtTimestamp > 30_000
		) {
			this.locked = false;
			this.lockAcquiredAtTimestamp = undefined;
		}
		if (this.locked) {
			await new Promise<void>((resolve) => this.lockQueue.push(resolve));
			return;
		}
		this.locked = true;
		this.lockAcquiredAtTimestamp = Date.now();
	}

	async releaseLock(): Promise<void> {
		const next = this.lockQueue.shift();
		if (next) {
			this.lockAcquiredAtTimestamp = Date.now();
			next(); // transfer ownership, don't flip locked to false
		} else {
			this.locked = false;
			this.lockAcquiredAtTimestamp = undefined;
		}
	}
}
