import type { RequestInfo } from "rwsdk/worker";
import { PdsFeedViewer } from "@/app/components";
import type { AppContext } from "@/worker";
import { postConfig } from "./config";

const ENDPOINT =
	"https://bsky.social/xrpc/com.atproto.repo.listRecords?repo=bsky.app&collection=app.bsky.feed.post&limit=3";

export async function PostContent(_: RequestInfo<AppContext>) {
	const response = await fetch(ENDPOINT);
	const records = await response.json();

	return (
		<>
			<section className="section">
				<h2 className="sectionTitle">RWSDK Create App</h2>
				<p className="prose">
					This started with the base{" "}
					<code className="inlineCode">
						pnpx create-rwsdk rwsdk-atproto-starter
					</code>{" "}
					and layers on the ATP read from there.
				</p>
			</section>

			<section className="section">
				<h2 className="sectionTitle">Live reads from the AT Protocol</h2>
				<PdsFeedViewer endpoint={ENDPOINT} records={records} />
			</section>

			<section className="section">
				<h2 className="sectionTitle">Up Next</h2>
				<p className="prose">
					{postConfig.nextPost.description} (
					<a
						className="link-inline"
						href={`https://arsdehnel.com/posts/rwsdk-atp-s${postConfig.nextPost.series}-p${postConfig.nextPost.post}-${postConfig.nextPost.slug}`}
					>
						Blog Post
					</a>{" "}
					|{" "}
					<a
						className="link-inline"
						href={`https://github.com/arsdehnel/rwsdk-atproto-starter/tree/post/series-${postConfig.nextPost.series}/0${postConfig.nextPost.post}-${postConfig.nextPost.slug}/`}
					>
						Git Branch
					</a>
					).
				</p>
			</section>
		</>
	);
}
