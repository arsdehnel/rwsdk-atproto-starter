import { env } from "cloudflare:workers";
import type { RequestInfo } from "rwsdk/worker";

import { BlueskyFeed } from "@/components/bluesky-feed/bluesky-feed";
import { LoggedInUser } from "@/components/logged-in-user/logged-in-user";
import { LoginForm } from "@/components/login-form/login-form";
import { getOAuthClient } from "@/lib/auth/client";
import type { AppContext } from "@/worker";

export async function PostContent({ ctx }: RequestInfo<AppContext>) {
	const did = ctx.session?.did ?? null;
	const { ATPROTO_PDS_URL: pdsUrl } = env;

	let userHandle: string | null = null;
	let repoDescription: unknown = null;
	let repoDescriptionEndpoint: string | null = null;

	if (did) {
		repoDescriptionEndpoint = `${pdsUrl}/xrpc/com.atproto.repo.describeRepo?repo=${did}`;
		const res = await fetch(repoDescriptionEndpoint);
		const data = (await res.json()) as { handle?: string };
		repoDescription = data;
		userHandle = data.handle ?? null;
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
						<BlueskyFeed
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
