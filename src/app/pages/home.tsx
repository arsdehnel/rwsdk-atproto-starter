import type { RequestInfo } from "rwsdk/worker";
import { BlueskyFeed } from "@/components/bluesky-feed/bluesky-feed";
import { BuildingContent } from "@/components/building-content/building-content";
import { HeaderNav } from "@/components/header-nav/header-nav";
import { LoginForm } from "@/components/login-form/login-form";
import { RunItContent } from "@/components/run-it-content/run-it-content";
import { SeriesList } from "@/components/series-list/series-list";
import type { AppContext } from "@/worker";
import { LoggedInUser } from "@/components/logged-in-user/logged-in-user";

export async function Home({ ctx, request }: RequestInfo<AppContext>) {
	const did = ctx.session?.did ?? null;
	const { hostname, port } = new URL(request.url);

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
			{hostname.includes("localhost") && (
				<div className="localhost-warning">
					Warning, you should be using{" "}
					<a href={`http://127.0.0.1:${port}/`}>http://127.0.0.1:{port}/</a>{" "}
					instead of locahost.
				</div>
			)}
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
							currentStep={2}
							postUrl="https://arsdehnel.com/posts/rwsdk-atproto-02-atproto-oauth"
						/>
					}
					seriesContent={<SeriesList currentStep={2} />}
					runItContent={
						<RunItContent
							commandLines={[
								"git clone https://github.com/arsdehnel/rwsdk-atproto-starter",
								"git checkout post/02-atproto-oauth",
								"pnpm install",
								"pnpm dev",
							]}
							explanation={
								<p className="prose">
									Open{" "}
									<a href="http://127.0.0.1:5173" className="link">
										127.0.0.1:5173
									</a>{" "}
									, log into your own AT Protocol account, and see your latest
									Bluesky posts.
								</p>
							}
						/>
					}
				/>
			</header>

			<main>
				{did ? (
					<>
						<LoggedInUser did={did} userHandle={userHandle} />

						<section className="section">
							<h2 className="sectionTitle">Your recent posts</h2>
							<p className="prose">
								While technically you don't need to have logged in for us to
								fetch your posts this does help show we used the login flow to
								figure out who you are and your DID so we can go fetch your
								posts.
							</p>
							<BlueskyFeed
								endpoint={`https://bsky.social/xrpc/com.atproto.repo.listRecords?repo=${did}&collection=app.bsky.feed.post&limit=5`}
								records={userRecords}
							/>
						</section>

						<section className="section">
							<h2 className="sectionTitle">Up next</h2>
							<p className="prose">
								With Auth handled we need to take a post to get a{" "}
								<strong>Local Dev Setup</strong> established (
								<a
									className="link-inline"
									href="https://arsdehnel.com/posts/rwsdk-atproto-03-local-dev-setup"
								>
									Blog Post
								</a>{" "}
								|{" "}
								<a
									className="link-inline"
									href="https://github.com/arsdehnel/rwsdk-atproto-starter/tree/post/03-local-dev-setup"
								>
									Git Branch
								</a>
								). If you want to see the code we added here in Step 2 take a
								look at{" "}
								<a
									className="link-inline"
									href="https://github.com/arsdehnel/rwsdk-atproto-starter/pull/9"
								>
									the PR for these changes
								</a>
								.
							</p>
						</section>
					</>
				) : (
					<section className="section">
						<h2 className="sectionTitle">Log in with Atmosphere</h2>
						<p className="prose">
							Enter your ATP handle to authenticate via OAuth. You'll be
							redirected to the OAuth provider indicated by your PDS. Log in
							and/or approve access, then you'll be sent back here.
						</p>
						<LoginForm />
					</section>
				)}
			</main>
		</div>
	);
}
