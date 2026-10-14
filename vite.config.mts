import { defineConfig } from "vite";
import { redwood } from "rwsdk/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import type { Plugin } from "vite";

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
	plugins: [
		patchAtprotoRedirectError(),
		cloudflare({
			viteEnvironment: { name: "worker" },
		}),
		redwood(),
	],
});
