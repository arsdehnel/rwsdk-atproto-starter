import type { RequestInfo } from "rwsdk/worker";
import { getOAuthClient, SCOPE } from "@/app/lib/auth-client";

async function post({ request }: RequestInfo) {
	const { handle } = (await request.json()) as { handle?: string };

	if (!handle) {
		return Response.json({ error: "Handle is required" }, { status: 400 });
	}

	const client = await getOAuthClient();
	const authUrl = await client.authorize(handle, { scope: SCOPE });
	return Response.json({ redirectUrl: authUrl.toString() });
}

export default { post };
