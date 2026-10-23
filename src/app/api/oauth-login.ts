import type { RequestInfo } from "rwsdk/worker";
import { getOAuthClient, SCOPE } from "@/app/lib/auth-client";

async function post({ request }: RequestInfo) {
	const { handle } = (await request.json()) as { handle?: string };

	if (!handle) {
		return Response.json({ error: "Handle is required" }, { status: 400 });
	}

	const client = await getOAuthClient();
<<<<<<< HEAD

	try {
		const authUrl = await client.authorize(handle, { scope: SCOPE });
		return Response.json({ redirectUrl: authUrl.toString() });
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		console.error(`[oauth-login] authorize failed for "${handle}": ${message}`);
		return Response.json(
			{
				error: "Handle not found. Make sure you're using a handle on this PDS.",
			},
			{ status: 400 },
		);
	}
=======
	const authUrl = await client.authorize(handle, { scope: SCOPE });
	return Response.json({ redirectUrl: authUrl.toString() });
>>>>>>> d83ff43 (feat: initial post 2 functionality)
}

export default { post };
