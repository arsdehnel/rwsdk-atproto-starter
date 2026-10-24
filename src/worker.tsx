import { render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";
import oauthCallback from "@/app/api/oauth-callback";
import oauthClientMetadata from "@/app/api/oauth-client-metadata";
import oauthLogin from "@/app/api/oauth-login";
import oauthLogout from "@/app/api/oauth-logout";
import { Document } from "@/app/document";
import { setCommonHeaders } from "@/app/headers";
import { sessionStore } from "@/app/lib/session";
import { Home } from "@/app/pages/home";
import status from "./app/api/status";

export type AppContext = {
	session: { did: string | null } | null;
};

export default defineApp([
	setCommonHeaders(),
	async ({ ctx, request }) => {
		ctx.session = await sessionStore.load(request);
	},
	route("/oauth/login", oauthLogin),
	route("/oauth/callback", oauthCallback),
	route("/oauth/logout", oauthLogout),
	route("/client-metadata.json", oauthClientMetadata),
	route("/status", status),
	render(Document, [route("/", Home)]),
]);
