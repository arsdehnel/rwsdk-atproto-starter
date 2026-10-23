import { cloudflare } from "@cloudflare/vite-plugin";
import { redwood } from "rwsdk/vite";
import { defineConfig, type Plugin } from "vite";

// Cloudflare Workers (workerd) does not support `redirect: "error"` — it
// throws a TypeError at Request construction time. The @atproto packages use
// this option as an SSRF guard: they explicitly do not want to follow redirects
// on DID/handle lookups and OAuth metadata fetches, since those URLs come from
// user input.
//
// `redirect: "manual"` is the closest supported alternative: workerd returns
// the 3xx response to the caller as-is rather than following it. Because all
// of the affected atproto call sites check `response.ok` (or `response.status
// !== 200`) immediately after the fetch, a redirect surfaces as a non-ok
// response and fails — preserving the intended guard.
//
// `redirect: "follow"` would also silence the workerd TypeError, but it
// silently drops the SSRF guard by following unexpected redirects. Prefer
// "manual" unless a specific code path requires follow.
function patchAtprotoRedirectError(): Plugin {
	return {
		name: "patch-atproto-redirect-error",
		transform(code: string, id: string) {
			if (id.includes("@atproto") || id.includes("atproto-labs")) {
				return code.replace(/redirect:\s*['"]error['"]/g, "redirect: 'manual'");
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
