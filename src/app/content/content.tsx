import type { RequestInfo } from "rwsdk/worker";
import { LoggedInUser, LoginForm, PdsFeedViewer } from "@/app/components";
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
					<LoggedInUser did={did} userHandle={userHandle} />
					<section className="section">
						<h2 className="sectionTitle">Your recent posts</h2>
						<PdsFeedViewer
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
