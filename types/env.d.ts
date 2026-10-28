declare namespace Cloudflare {
	interface Env {
		ATPROTO_PDS_URL?: string;
		ATPROTO_PLC_URL?: string;
		ATPROTO_TAP_URL?: string;
		// Public HTTPS URL of your deployed worker, e.g. https://yourapp.workers.dev
		// Required in production — used for OAuth client metadata and redirect URIs.
		// Omit in local dev to use the loopback client instead.
		APP_URL?: string;
	}
}
