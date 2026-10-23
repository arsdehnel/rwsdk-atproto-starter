import { DurableObject } from "cloudflare:workers";
import type { DurableObjectMethods } from "rwsdk/auth";

interface SessionData {
	did: string | null;
}

export class BrowserSession
	extends DurableObject
	implements DurableObjectMethods<SessionData, Partial<SessionData>>
{
	private session: SessionData | undefined = undefined;

	async getSession() {
		if (!this.session) {
			this.session = (await this.ctx.storage.get<SessionData>("session")) ?? {
				did: null,
			};
		}
		return { value: this.session };
	}

	async saveSession(data: Partial<SessionData>): Promise<SessionData> {
		this.session = { did: data.did ?? null };
		await this.ctx.storage.put("session", this.session);
		return this.session;
	}

	async revokeSession() {
		await this.ctx.storage.delete("session");
		this.session = undefined;
	}
}
