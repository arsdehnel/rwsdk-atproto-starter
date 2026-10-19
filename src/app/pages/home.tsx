import { env } from "cloudflare:workers";
import type { RequestInfo } from "rwsdk/worker";
import { BuildingContent } from "@/components/building-content/building-content";
import { HeaderContent } from "@/components/header-content/header-content";
import { HeaderNav } from "@/components/header-nav/header-nav";
import { LoggedInUser } from "@/components/logged-in-user/logged-in-user";
import { LoginForm } from "@/components/login-form/login-form";
import { RunItContent } from "@/components/run-it-content/run-it-content";
import { SeriesList } from "@/components/series-list/series-list";
import { StatusPicker } from "@/components/status-picker/status-picker";
import { statusStore } from "@/lib/status-store";
import type { AppContext } from "@/worker";

export async function Home({ ctx }: RequestInfo<AppContext>) {
	const did = ctx.session?.did ?? null;
	const { ATPROTO_PDS_URL: pdsUrl } = env;

	let userHandle: string | null = null;
	// Current status comes from the in-memory Tap store, not a direct PDS read.
	// On a fresh worker start the store is empty, so this will be null until the
	// first pick fires a webhook. Post 6 fixes that with D1.
	const currentStatus = did ? (statusStore.get(did)?.status ?? null) : null;

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
							currentStep={5}
							postUrl="https://arsdehnel.com/posts/rwsdk-atproto-05-tap-sync"
						/>
					}
					seriesContent={<SeriesList currentStep={5} />}
					runItContent={
						<RunItContent
							commandLines={[
								"git clone https://github.com/arsdehnel/rwsdk-atproto-starter",
								"git checkout post/05-tap-sync",
								"pnpm install",
								"pnpm docker:up",
								"pnpm dev",
							]}
							explanation={
								<p className="prose">
									Log in with{" "}
									<code className="inlineCode">alice.devnet.test</code> /{" "}
									<code className="inlineCode">alice-devnet-pass</code>. Open{" "}
									<a href="http://127.0.0.1:5173" className="link">
										127.0.0.1:5173
									</a>
									, not <code className="inlineCode">localhost:5173</code>. The
									OAuth redirect URI is registered as{" "}
									<code className="inlineCode">
										http://127.0.0.1:5173/oauth/callback
									</code>{" "}
									— after the PDS approves access it sends the browser back to
									that exact address.
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
							<h2 className="sectionTitle">Your status</h2>
							<p className="prose">
								Pick an emoji. Just like the last step's version it gets written
								to your PDS as an{" "}
								<code className="inlineCode">xyz.statusphere.status</code>{" "}
								record. Unlike that version, though, we've got Tap setup now to
								pick it up from the firehose and delivers it to the feed below —
								no PDS read involved.
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
			</main>
		</div>
	);
}
