// In-memory session store: works for local dev, lost on Worker restart.
// Sessions are keyed by a random ID stored in a plain cookie.
// globalThis with ??= keeps the Map alive across hot-reloads in wrangler dev.
const g = globalThis as unknown as {
	sessions: Map<string, { did: string | null }>;
};
g.sessions ??= new Map();
const sessions = g.sessions;

function getSessionId(request: Request): string | null {
	const cookie = request.headers.get("cookie") ?? "";
	const match = cookie.match(/(?:^|;\s*)sid=([^;]+)/);
	return match ? match[1] : null;
}

export const sessionStore = {
	async load(request: Request) {
		const id = getSessionId(request);
		if (!id) return null;
		return sessions.get(id) ?? null;
	},
	async save(headers: Headers, data: { did: string }) {
		const id = crypto.randomUUID();
		sessions.set(id, data);
		headers.append("Set-Cookie", `sid=${id}; Path=/; HttpOnly; SameSite=Lax`);
	},
	async remove(request: Request, headers: Headers) {
		const id = getSessionId(request);
		if (id) sessions.delete(id);
		headers.append("Set-Cookie", "sid=; Path=/; HttpOnly; Max-Age=0");
	},
};
