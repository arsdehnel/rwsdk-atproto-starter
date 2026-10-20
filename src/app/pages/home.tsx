import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import type { RequestInfo } from "rwsdk/worker";
import { HeaderContent } from "@/components/header-content/header-content";
import { LoginForm } from "@/components/login-form/login-form";
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
							<h2 className="sectionTitle">Your status</h2>
							<p className="prose">
								Pick an emoji. It gets written to your PDS as an{" "}
								<code className="inlineCode">xyz.statusphere.status</code>{" "}
								record, then Tap picks it up from the firehose and delivers it
								to the feed below — no PDS read required.
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
						This feed is public — no login required. It shows every indexed
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
						does exactly this at scale — you just built a tiny version of it.
					</p>
					<StatusFeed initialStatuses={await db.select().from(statuses)} />
				</section>

				<section className="section">
					<h2 className="sectionTitle">What you're building</h2>
					<p className="prose">
						You're on Post 2 of a{" "}
						<a
							href="https://arsdehnel.com/posts"
							target="_blank"
							rel="noreferrer"
							className="link"
						>
							blog series
						</a>{" "}
						that builds a real AT Protocol app from scratch — one step at a
						time. By the end the series covers:
					</p>
					<ul className="featureList">
						<li>
							AT Protocol OAuth login against real{" "}
							<a
								href="https://bsky.app"
								target="_blank"
								rel="noreferrer"
								className="link"
							>
								Bluesky
							</a>{" "}
							accounts or a local devnet
						</li>
						<li>
							Read and write records using a typed{" "}
							<a
								href="https://atproto.com/specs/lexicon"
								target="_blank"
								rel="noreferrer"
								className="link"
							>
								lexicon
							</a>{" "}
							client
						</li>
						<li>
							React to record changes with{" "}
							<a
								href="https://www.npmjs.com/package/@atproto/tap"
								target="_blank"
								rel="noreferrer"
								className="link"
							>
								Tap
							</a>{" "}
							and{" "}
							<a
								href="https://github.com/bluesky-social/jetstream"
								target="_blank"
								rel="noreferrer"
								className="link"
							>
								Jetstream
							</a>{" "}
							— no polling
						</li>
						<li>
							Persist indexed data with{" "}
							<a
								href="https://developers.cloudflare.com/d1"
								target="_blank"
								rel="noreferrer"
								className="link"
							>
								Cloudflare D1
							</a>{" "}
							and{" "}
							<a
								href="https://orm.drizzle.team"
								target="_blank"
								rel="noreferrer"
								className="link"
							>
								Drizzle
							</a>
						</li>
						<li>
							Full local devnet via{" "}
							<a
								href="https://docs.docker.com/compose"
								target="_blank"
								rel="noreferrer"
								className="link"
							>
								Docker Compose
							</a>{" "}
							so you never test against production
						</li>
					</ul>
				</section>

				<section className="section">
					<h2 className="sectionTitle">The series</h2>
					<ol className="seriesList">
						<li>
							<a
								href="https://arsdehnel.com/posts/rwsdk-atproto-01-first-read"
								target="_blank"
								rel="noreferrer"
								className="link"
							>
								Your First AT Protocol Read
							</a>
						</li>
						<li>AT Protocol OAuth with rwsdk and Cloudflare Workers</li>
						<li>Local Development with Docker Compose</li>
						<li>Lexicons and Writing to Your PDS</li>
						<li>Reacting to Changes with Tap</li>
						<li>Persistence with D1 and Drizzle</li>
						<li>
							<strong>Building a Feed — You're an AppView Now</strong> — you are
							here
						</li>
						<li>Where to Go From Here</li>
					</ol>
					<p className="prose">
						Each post has a corresponding branch in this repo. Check out{" "}
						<code className="inlineCode">post/06-d1-drizzle</code> to keep
						going, or read the full series at{" "}
						<a
							href="https://arsdehnel.com/posts"
							target="_blank"
							rel="noreferrer"
							className="link"
						>
							arsdehnel.com/posts
						</a>
						.
					</p>
				</section>

				<section className="section">
					<h2 className="sectionTitle">Run it yourself</h2>
					<div className="codeBlock">
						<span className="codePrompt">$</span>
						<code>
							git clone https://github.com/arsdehnel/rwsdk-atproto-starter
						</code>
					</div>
					<div className="codeBlock">
						<span className="codePrompt">$</span>
						<code>git checkout post/07-appview</code>
					</div>
					<div className="codeBlock">
						<span className="codePrompt">$</span>
						<code>
							pnpm install && pnpm docker:up && pnpm migrate:dev && pnpm dev
						</code>
					</div>
					<p className="prose">
						Open{" "}
						<a href="http://127.0.0.1:5173" className="link">
							127.0.0.1:5173
						</a>
						, not <code className="inlineCode">localhost:5173</code>. The OAuth
						redirect URI is registered as{" "}
						<code className="inlineCode">
							http://127.0.0.1:5173/oauth/callback
						</code>
						.
					</p>
					<p className="prose">
						To see the multi-user feed in action: sign in as{" "}
						<code className="inlineCode">alice.devnet.test</code> /{" "}
						<code className="inlineCode">alice-devnet-pass</code> in a normal
						window and set a status. Open an incognito window, sign in as{" "}
						<code className="inlineCode">bob.devnet.test</code> /{" "}
						<code className="inlineCode">bob-devnet-pass</code>, and set a
						different status. Then open a third window (no login) — both
						statuses appear in the status board below.
					</p>
					<p className="prose">
						If you see duplicate rows for the same user, the devnet was likely
						restarted and recreated the account with a new DID. This only
						happens in the local Docker devnet — real AT Protocol DIDs are
						permanent. Clear the local database and re-run migrations:
					</p>
					<div className="codeBlock">
						<span className="codePrompt">$</span>
						<code>rm -rf .wrangler/state/v3/d1 && pnpm migrate:dev</code>
					</div>
				</section>
			</main>
		</div>
	);
}
