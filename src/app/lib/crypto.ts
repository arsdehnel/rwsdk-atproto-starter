// AES-256-GCM encryption helpers for KV-stored OAuth state and session data.
// Web Crypto is available natively in the workerd runtime — no dependencies needed.
//
// Storage format: base64( [12-byte IV] + [AES-GCM ciphertext] )
// The IV is randomly generated per-write so identical plaintexts produce
// different ciphertexts. Including it in the stored value means the decryption
// key is the only thing needed to recover the plaintext.

const IV_BYTES = 12;
const INFO = new TextEncoder().encode("oauth-kv-encryption");

// Derives an AES-256-GCM key from an arbitrary string secret via HKDF-SHA-256.
// HKDF tolerates secrets that aren't uniformly random bytes (e.g. base64 strings
// or passphrases) and makes it easy to rotate to a new key format later.
async function deriveKey(secret: string): Promise<CryptoKey> {
	const raw = new TextEncoder().encode(secret);
	const keyMaterial = await crypto.subtle.importKey("raw", raw, "HKDF", false, [
		"deriveKey",
	]);
	return crypto.subtle.deriveKey(
		{ name: "HKDF", hash: "SHA-256", salt: new Uint8Array(0), info: INFO },
		keyMaterial,
		{ name: "AES-GCM", length: 256 },
		false,
		["encrypt", "decrypt"],
	);
}

export async function kvEncrypt(
	plaintext: string,
	secret: string,
): Promise<string> {
	const key = await deriveKey(secret);
	const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
	const encoded = new TextEncoder().encode(plaintext);
	const ciphertext = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		key,
		encoded,
	);

	const combined = new Uint8Array(IV_BYTES + ciphertext.byteLength);
	combined.set(iv);
	combined.set(new Uint8Array(ciphertext), IV_BYTES);
	return btoa(Array.from(combined, (b) => String.fromCharCode(b)).join(""));
}

export async function kvDecrypt(
	stored: string,
	secret: string,
): Promise<string> {
	const key = await deriveKey(secret);
	const combined = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
	const iv = combined.slice(0, IV_BYTES);
	const ciphertext = combined.slice(IV_BYTES);
	const plaintext = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv },
		key,
		ciphertext,
	);
	return new TextDecoder().decode(plaintext);
}

// Parses a JSON array of encryption keys from a Wrangler secret.
// Index 0 is the current key (used for encryption); subsequent entries are
// previous keys tried in order during decryption to support zero-downtime
// key rotation.
export function parseKeyRing(raw: string | undefined): string[] {
	if (raw === undefined)
		throw new Error("Encryption key ring secret is not configured");
	const keys = JSON.parse(raw) as string[];
	if (!Array.isArray(keys) || keys.length === 0) {
		throw new Error("Encryption key ring must be a non-empty JSON array");
	}
	return keys;
}
