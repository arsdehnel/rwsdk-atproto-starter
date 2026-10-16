import type { RequestInfo } from "rwsdk/worker";

import { BlueskyFeed } from "@/components/bluesky-feed/bluesky-feed";
import { BuildingContent } from "@/components/building-content/building-content";
import { HeaderNav } from "@/components/header-nav/header-nav";
import { RunItContent } from "@/components/run-it-content/run-it-content";
import { SeriesList } from "@/components/series-list/series-list";

const ENDPOINT =
	"https://bsky.social/xrpc/com.atproto.repo.listRecords?repo=bsky.app&collection=app.bsky.feed.post&limit=3";

export async function Home(_: RequestInfo) {
	const response = await fetch(ENDPOINT);
	const records = await response.json();

	return (
		<div className="container">
			<header className="header">
				<div className="header-content">
					<h1 className="title">rwsdk + AT Protocol</h1>
					<p className="subtitle">
						A step-by-step walkthrough of creating a starter kit for building{" "}
						<a
							href="https://atproto.com"
							target="_blank"
							rel="noreferrer"
							className="link"
						>
							AT Protocol
						</a>{" "}
						apps on{" "}
						<a
							href="https://rwsdk.dev"
							target="_blank"
							rel="noreferrer"
							className="link"
						>
							RedwoodSDK
						</a>{" "}
						and{" "}
						<a
							href="https://developers.cloudflare.com/workers"
							target="_blank"
							rel="noreferrer"
							className="link"
						>
							Cloudflare Workers
						</a>
						.
					</p>
				</div>
				<HeaderNav
					buildingContent={
						<BuildingContent
							currentStep={1}
							postUrl="https://arsdehnel.com/posts/rwsdk-atproto-01-first-read"
						/>
					}
					seriesContent={<SeriesList currentStep={1} />}
					runItContent={
						<RunItContent
							commandLines={[
								"git clone https://github.com/arsdehnel/rwsdk-atproto-starter",
								"git checkout post/01-first-read",
								"pnpm install",
								"pnpm dev",
							]}
							explanation={
								<p className="prose">
									Open{" "}
									<a href="http://localhost:5173" className="link">
										localhost:5173
									</a>{" "}
									— the feed is fetched live from{" "}
									<code className="inlineCode">bsky.social</code> on every
									request.
								</p>
							}
						/>
					}
				/>
			</header>

			<main>
				<section className="section">
					<h2 className="sectionTitle">Live from the AT Protocol</h2>
					<BlueskyFeed endpoint={ENDPOINT} records={records} />
				</section>
			</main>
		</div>
	);
}
