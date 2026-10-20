import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import type { RequestInfo } from "rwsdk/worker";
import { BuildingContent } from "@/components/building-content/building-content";
import { HeaderContent } from "@/components/header-content/header-content";
import { HeaderNav } from "@/components/header-nav/header-nav";
import { LoggedInUser } from "@/components/logged-in-user/logged-in-user";
import { LoginForm } from "@/components/login-form/login-form";
import { RunItContent } from "@/components/run-it-content/run-it-content";
import { SeriesList } from "@/components/series-list/series-list";
import { StatusFeed } from "@/components/status-feed/status-feed";
import { StatusPicker } from "@/components/status-picker/status-picker";
import { db } from "@/db/db";
import { statuses } from "@/db/schema";
import type { AppContext } from "@/worker";

export async function Home({ ctx }: RequestInfo<AppContext>) {
	const did = ctx.session?.did ?? null;
	const { ATPROTO_PDS_URL: pdsUrl } = env;

	let userHandle: string | null = null;
	const [currentEntry] = did
		? await db
				.select({ status: statuses.status })
				.from(statuses)
				.where(eq(statuses.did, did))
		: [];
	const currentStatus = currentEntry?.status ?? null;

	if (did) {
		// Resolve the user's handle from the PDS — this is fine, it's identity
		// metadata, not application data. Reading application data (statuses)
		// directly from the PDS is the anti-pattern this post replaces.
		const res = await fetch(
			`${pdsUrl}/xrpc/com.atproto.repo.describeRepo?repo=${did}`,
		);
		const data = (await res.json()) as { handle?: string };
		userHandle = data.handle ?? null;
	}

	return (
		<div className="container">
			<header className="header">
				<HeaderContent />
				<HeaderNav
					buildingContent={
						<BuildingContent
							currentStep={7}
							postUrl="https://arsdehnel.com/posts/rwsdk-atproto-07-appview"
						/>
					}
					seriesContent={<SeriesList currentStep={7} />}
					runItContent={
						<RunItContent
							commandLines={[
								"git clone https://github.com/arsdehnel/rwsdk-atproto-starter",
								"git checkout post/07-appview",
								"pnpm install",
								"pnpm docker:up",
								"pnpm dev",
							]}
							explanation={
								<>
									<p className="prose">
										To see the multi-user feed in action: sign in as{" "}
										<code className="inlineCode">alice.devnet.test</code> /{" "}
										<code className="inlineCode">alice-devnet-pass</code> in a
										normal window and set a status. Open an incognito window,
										sign in as{" "}
										<code className="inlineCode">bob.devnet.test</code> /{" "}
										<code className="inlineCode">bob-devnet-pass</code>, and set
										a different status. Then open a third window (no login) —
										both statuses appear in the status board below.
									</p>
									<p className="prose">
										Taking it a step further open a second terminal window and
										run <code className="inlineCode">pnpm write-status</code> to
										mimic a PDS write from someone using a different UI to
										select their status. This is one of the powerful things
										about the Atmosphere: people can use their own apps and
										custom build UIs to consume and produce data for existing
										apps. Once you've done this Carol's status will show on all
										your browser tabs within a second or two.
									</p>
								</>
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
							<h2 className="sectionTitle">Your status</h2>
							<p className="prose">
								Pick an emoji. It gets written to your PDS as an{" "}
								<code className="inlineCode">xyz.statusphere.status</code>{" "}
								record and then replicated to our D1 AppView database.
							</p>
							<p className="prose">
								Then to make the demo more meaningful open another window and
								log in as Bob to see how two users can see each others'
								statuses.
							</p>
							<StatusPicker currentStatus={currentStatus} />
						</section>
					</>
				) : (
					<section className="section">
						<h2 className="sectionTitle">Sign in with AT Protocol</h2>
						<p className="prose">
							Enter your handle to authenticate via AT Protocol OAuth. You'll be
							redirected to your PDS to approve access, then back here.
						</p>
						<LoginForm />
					</section>
				)}

				<section className="section">
					<h2 className="sectionTitle">Status board</h2>
					<p className="prose">
						This feed is public (no login required). It shows every indexed
						status, one row per user, sourced from D1. Tap delivers a webhook
						for each record write; the worker upserts into D1; this page reads
						from D1.
					</p>
					<p className="prose">
						That's the AppView pattern: subscribe to the firehose, index what
						you care about, serve your own query interface. Bluesky's{" "}
						<a
							href="https://bsky.app"
							target="_blank"
							rel="noreferrer"
							className="link"
						>
							app.bsky.app
						</a>{" "}
						does exactly this at scale. And you just built a tiny version of it!
					</p>
					<StatusFeed initialStatuses={await db.select().from(statuses)} />
				</section>
			</main>
		</div>
	);
}
