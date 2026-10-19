import { render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";

import { Document } from "@/app/document";
import { setCommonHeaders } from "@/app/headers";
import { Home } from "@/app/pages/home";
import { post as oauthLogin } from "@/app/api/oauth-login";
import { get as oauthCallback } from "@/app/api/oauth-callback";
import { post as oauthLogout } from "@/app/api/oauth-logout";
import { get as oauthClientMetadata } from "@/app/api/oauth-client-metadata";
import { post as setStatus } from "@/app/api/status";
import { sessionStore } from "@/lib/auth/session-store";

export { UserSession } from "@/sessions/UserSession";

export type AppContext = {
	session: { did: string | null } | null;
};

export default defineApp([
	setCommonHeaders(),
	async ({ ctx, request }) => {
		ctx.session = await sessionStore.load(request);
	},
	route("/oauth/login", { post: oauthLogin }),
	route("/oauth/callback", { get: oauthCallback }),
	route("/oauth/logout", { post: oauthLogout }),
	route("/client-metadata.json", { get: oauthClientMetadata }),
	route("/status", { post: setStatus }),
	render(Document, [route("/", Home)]),
]);
