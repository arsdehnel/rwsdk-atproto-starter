import type { RequestInfo } from "rwsdk/worker";
import { BlueskyFeed } from "@/components/bluesky-feed/bluesky-feed";
import { BuildingContent } from "@/components/building-content/building-content";
import { HeaderNav } from "@/components/header-nav/header-nav";
import { LoginForm } from "@/components/login-form/login-form";
import { RunItContent } from "@/components/run-it-content/run-it-content";
import { SeriesList } from "@/components/series-list/series-list";
import type { AppContext } from "@/worker";
import { BuildingContent } from "@/components/building-content/building-content";
import { HeaderContent } from "@/components/header-content/header-content";
import { HeaderNav } from "@/components/header-nav/header-nav";
import { RunItContent } from "@/components/run-it-content/run-it-content";
import { SeriesList } from "@/components/series-list/series-list";
import { postConfig } from "@/components/post-config/post-config";
import { PostContent } from "@/components/post-content/post-content";

export async function Home({ ctx }: RequestInfo<AppContext>) {
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
		<div className="container">
			<header className="header">
				<div className="header-content">
					<h1 className="title">rwsdk + AT Protocol</h1>
					<p className="subtitle">
						A starter kit for building{" "}
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
								You'll be redirected to Bluesky to approve access, then back
								here.
							</p>
							<LoginForm />
						</section>

						<section className="section">
							<h2 className="sectionTitle">Live from the AT Protocol</h2>
							<p className="prose">
								Sign in above to see your recent posts pulled live from your
								PDS.
							</p>
						</section>
					</>
				)}
			</main>
		</div>
	);
}
