import type { RequestInfo } from "rwsdk/worker";
import { BlueskyFeed } from "@/components/bluesky-feed/bluesky-feed";
import { LoginForm } from "@/components/login-form/login-form";
import type { AppContext } from "@/worker";

export async function PostContent({ ctx }: RequestInfo<AppContext>) {
	const did = ctx.session?.did ?? null;

	let userRecords = null;
	let userHandle: string | null = null;

	if (did) {
		const [recordsRes, handleRes] = await Promise.all([
			fetch(
				`https://bsky.social/xrpc/com.atproto.repo.listRecords?repo=${did}&collection=app.bsky.feed.post&limit=5`,
			),
			fetch(
				`https://bsky.social/xrpc/com.atproto.repo.describeRepo?repo=${did}`,
			),
		]);
		userRecords = await recordsRes.json();
		const handleData = (await handleRes.json()) as { handle?: string };
		userHandle = handleData.handle ?? null;
	}
	return (
		<>
			{did ? (
				<>
					<section className="section">
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "baseline",
							}}
						>
							<h2 className="sectionTitle">
								Signed in{userHandle ? ` as @${userHandle}` : ""}
							</h2>
							<form method="post" action="/oauth/logout">
								<button type="submit" className="signOutButton">
									Sign out
								</button>
							</form>
						</div>
						<p className="prose">
							<code className="inlineCode">{did}</code>
						</p>
					</section>

					<section className="section">
						<h2 className="sectionTitle">Your recent posts</h2>
						<BlueskyFeed
							endpoint={`https://bsky.social/xrpc/com.atproto.repo.listRecords?repo=${did}&collection=app.bsky.feed.post&limit=5`}
							records={userRecords}
						/>
					</section>
				</>
			) : (
				<>
					<section className="section">
						<h2 className="sectionTitle">Sign in with Bluesky</h2>
						<p className="prose">
							Enter your Bluesky handle to authenticate via AT Protocol OAuth.
							You'll be redirected to Bluesky to approve access, then back here.
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
