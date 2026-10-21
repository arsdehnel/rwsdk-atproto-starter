import type { RequestInfo } from "rwsdk/worker";

import { BlueskyFeed } from "@/components/bluesky-feed/bluesky-feed";
import type { AppContext } from "@/worker";

const ENDPOINT =
	"https://bsky.social/xrpc/com.atproto.repo.listRecords?repo=bsky.app&collection=app.bsky.feed.post&limit=3";

export async function PostContent(_: RequestInfo<AppContext>) {
	const response = await fetch(ENDPOINT);
	const records = await response.json();

	return (
		<>
			<section className="section">
				<h2 className="sectionTitle">Live reads from the AT Protocol</h2>
				<BlueskyFeed endpoint={ENDPOINT} records={records} />
			</section>

			<section className="section">
				<h2 className="sectionTitle">Up Next</h2>
				<p className="prose">
					Now that we've established a basic ATP interaction we're ready to dive
					into <strong>Step 2: AT Proto OAuth</strong> (
					<a
						className="link-inline"
						href="https://arsdehnel.com/posts/rwsdk-atproto-02-atproto-oauth"
					>
						Blog Post
					</a>{" "}
					|{" "}
					<a
						className="link-inline"
						href="https://github.com/arsdehnel/rwsdk-atproto-starter/tree/post/02-atproto-oauth"
					>
						Git Branch
					</a>
					).
				</p>
			</section>
		</>
	);
}
