import { cloudflare } from "@cloudflare/vite-plugin";
import { redwood } from "rwsdk/vite";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

// Cloudflare Workers (workerd) rejects `redirect: "error"` in both fetch()
// and the Request() constructor. The @atproto packages use this option
// pervasively to catch unexpected redirects. Since bsky.social doesn't
// redirect DID/handle lookups, converting to "follow" is safe and is the
// recommended workaround.
function patchAtprotoRedirectError(): Plugin {
	return {
		name: "patch-atproto-redirect-error",
		transform(code: string, id: string) {
			if (id.includes("@atproto") || id.includes("atproto-labs")) {
				return code.replace(/redirect:\s*['"]error['"]/g, "redirect: 'follow'");
			}
		},
	};
}

export default defineConfig({
	server: {
		// Bind to 127.0.0.1 so the OAuth redirect URI (http://127.0.0.1:5173/oauth/callback)
		// matches the address the dev server is actually listening on.
		host: "127.0.0.1",
	},
	plugins: [
		patchAtprotoRedirectError(),
		cloudflare({
			viteEnvironment: { name: "worker" },
		}),
		redwood(),
	],
});
