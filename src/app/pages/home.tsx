import { env } from "cloudflare:workers";
import type { RequestInfo } from "rwsdk/worker";
import { BlueskyFeed } from "@/components/bluesky-feed/bluesky-feed";
import { BuildingContent } from "@/components/building-content/building-content";
import { HeaderNav } from "@/components/header-nav/header-nav";
import { LoginForm } from "@/components/login-form/login-form";
import { RunItContent } from "@/components/run-it-content/run-it-content";
import { SeriesList } from "@/components/series-list/series-list";
import type { AppContext } from "@/worker";
import { LoggedInUser } from "@/components/logged-in-user/logged-in-user";
import { HeaderContent } from "@/components/header-content/header-content";

export async function Home({ ctx }: RequestInfo<AppContext>) {
	const did = ctx.session?.did ?? null;
	const { ATPROTO_PDS_URL: pdsUrl } = env;

	let userHandle: string | null = null;
	let repoDescription: unknown = null;
	let repoDescriptionEndpoint: string | null = null;

	if (did) {
		// Fetch from the local PDS. describeRepo returns the DID document
		// (including serviceEndpoint) which proves the local stack works end-to-end.
		repoDescriptionEndpoint = `${pdsUrl}/xrpc/com.atproto.repo.describeRepo?repo=${did}`;
		const res = await fetch(repoDescriptionEndpoint);
		const data = (await res.json()) as { handle?: string };
		repoDescription = data;
		userHandle = data.handle ?? null;
	}

	return (
		<div className="container">
			<header className="header">
				<HeaderContent />
				<HeaderNav
					buildingContent={
						<BuildingContent
							currentStep={3}
							postUrl="https://arsdehnel.com/posts/rwsdk-atproto-03-local-dev-setup"
						/>
					}
					seriesContent={<SeriesList currentStep={3} />}
					runItContent={
						<RunItContent
							commandLines={[
								"git clone https://github.com/arsdehnel/rwsdk-atproto-starter",
								"git checkout post/03-devnet",
								"pnpm install",
								"pnpm docker:up",
								"pnpm dev",
							]}
							explanation={
								<p className="prose">
						Log in with <code className="inlineCode">alice.devnet.test</code> /{" "}
						<code className="inlineCode">alice-devnet-pass</code>. Open{" "}
						<a href="http://127.0.0.1:5173" className="link">
							127.0.0.1:5173
						</a>
						, not <code className="inlineCode">localhost:5173</code>. The OAuth
						redirect URI is registered as{" "}
						<code className="inlineCode">
							http://127.0.0.1:5173/oauth/callback
						</code>{" "}
						— after the PDS approves access it sends the browser back to that
						exact address.
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
							<h2 className="sectionTitle">Your local PDS</h2>
							<p className="prose">
								Fetched live from your local PDS. The{" "}
								<code className="inlineCode">serviceEndpoint</code> in the DID
								document confirms you're talking to the devnet, not production.
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
								Enter your handle to authenticate via AT Protocol OAuth. You'll
								be redirected to your PDS to approve access, then back here.
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
