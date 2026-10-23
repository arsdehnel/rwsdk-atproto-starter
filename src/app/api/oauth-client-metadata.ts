import { getOAuthClient } from "@/app/lib/auth-client";

// The URL of this endpoint IS your client_id. Authorization servers fetch
// it to learn about your app. For the loopback client used in local dev,
// the client_id is http://localhost/ (a well-known special case handled by
// bsky.social), so this endpoint isn't strictly required — but it's good
// practice and will be needed when you deploy with a published client_id.
async function get() {
	const client = await getOAuthClient();
	return Response.json(client.clientMetadata);
}

export default { get };
