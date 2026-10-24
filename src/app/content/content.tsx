import type { RequestInfo } from "rwsdk/worker";
import { LoggedInUser, LoginForm, PdsFeedViewer } from "@/app/components";
import { getOAuthClient } from "@/app/lib/auth-client";
import type { AppContext } from "@/worker";

export async function PostContent({ ctx }: RequestInfo<AppContext>) {
	let did = ctx.session?.did ?? null;
	let userHandle: string | null = null;
	let repoDescription: unknown = null;
	let repoDescriptionEndpoint: string | null = null;

	if (did) {
		try {
			const oauthClient = await getOAuthClient();
			const oauthSession = await oauthClient.restore(did);
			const userPdsUrl = oauthSession.serverMetadata.issuer;
			repoDescriptionEndpoint = `${userPdsUrl}/xrpc/com.atproto.repo.describeRepo?repo=${did}`;
			const res = await fetch(repoDescriptionEndpoint);
			const data = (await res.json()) as { handle?: string };
			repoDescription = data;
			userHandle = data.handle ?? null;
		} catch (err) {
			console.log(`Error fetching session for did ${did}: ${err}`);
			// this will force the user to re-login which might not be great but is better than an error
			did = null;
		}
	}

	return (
		<>
			{did ? (
				<>
					<LoggedInUser did={did} userHandle={userHandle} />

					<section className="section">
						<h2 className="sectionTitle">Your local PDS</h2>
						<p className="prose">
							Fetched live from your local PDS. The{" "}
							<code className="inlineCode">serviceEndpoint</code> in the DID
							document confirms you're talking to the local dev stack and not
							production.
						</p>
						<PdsFeedViewer
							endpoint={repoDescriptionEndpoint ?? ""}
							records={repoDescription}
						/>
					</section>
				</>
			) : (
				<>
					<section className="section">
						<h2 className="sectionTitle">Sign in with AT Protocol</h2>
						<p className="prose">
							Enter your handle to authenticate via AT Protocol OAuth. You'll be
							redirected to your PDS to approve access, then back here.
						</p>
						<LoginForm />
					</section>

					<section className="section">
						<h2 className="sectionTitle">Live from the AT Protocol</h2>
						<p className="prose">
							Sign in above to see your recent posts pulled live from your PDS.
						</p>
					</section>
				</>
			)}
		</>
	);
}
