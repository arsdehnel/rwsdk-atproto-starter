import { Client } from "@atproto/lex";
import { env } from "cloudflare:workers";
import type { RequestInfo } from "rwsdk/worker";
import { StatusSection } from "@/components/status-section/status-section";
import { getOAuthClient } from "@/lib/auth/client";
import statusSchema from "@/lexicons/xyz/statusphere/status";
import { HeaderContent } from "@/components/header-content/header-content";
import { BuildingContent } from "@/components/building-content/building-content";
import { HeaderNav } from "@/components/header-nav/header-nav";
import { LoginForm } from "@/components/login-form/login-form";
import { RunItContent } from "@/components/run-it-content/run-it-content";
import { SeriesList } from "@/components/series-list/series-list";
import type { AppContext } from "@/worker";
import { LoggedInUser } from "@/components/logged-in-user/logged-in-user";

export async function Home({ ctx }: RequestInfo<AppContext>) {
	const did = ctx.session?.did ?? null;
	const { ATPROTO_PDS_URL: pdsUrl } = env;

	let userHandle: string | null = null;
	let currentStatus: string | null = null;
	let statusRecords: unknown = null;
	let statusRecordsEndpoint: string | null = null;

	if (did) {
		// Resolve the user's handle from the local PDS.
		const res = await fetch(
			`${pdsUrl}/xrpc/com.atproto.repo.describeRepo?repo=${did}`,
		);
		const data = (await res.json()) as { handle?: string };
		userHandle = data.handle ?? null;

		// Fetch the status collection directly — listRecords is a public endpoint,
		// no auth needed. This is what the raw record looks like in the PDS.
		statusRecordsEndpoint = `${pdsUrl}/xrpc/com.atproto.repo.listRecords?repo=${did}&collection=xyz.statusphere.status`;
		const listRes = await fetch(statusRecordsEndpoint);
		statusRecords = await listRes.json();

		// Read the current status record back from the PDS.
		// This is the "read your own writes" anti-pattern — fine for a demo,
		// but Post 5 covers how the real ecosystem handles this with AppViews.
		try {
			const oauthClient = await getOAuthClient();
			const oauthSession = await oauthClient.restore(did);
			const lexClient = new Client(oauthSession);
			const record = await lexClient.get(statusSchema, { rkey: "self" });
			currentStatus = (record.value.status as string) ?? null;
		} catch {
			// No status record yet, or session expired — start fresh.
		}
	}

	return (
		<div className="container">
			<header className="header">
				<HeaderContent />
				<HeaderNav
					buildingContent={
						<BuildingContent
							currentStep={4}
							postUrl="https://arsdehnel.com/posts/rwsdk-atproto-04-atproto-writes"
						/>
					}
					seriesContent={<SeriesList currentStep={4} />}
					runItContent={
						<RunItContent
							commandLines={[
								"git clone https://github.com/arsdehnel/rwsdk-atproto-starter",
								"git checkout post/04-atproto-writes",
								"pnpm install",
								"pnpm docker:up",
								"pnpm dev",
							]}
							explanation={
								<p className="prose">
									Log in with{" "}
									<code className="inlineCode">alice.devnet.test</code> /{" "}
									<code className="inlineCode">alice-devnet-pass</code> on{" "}
									<a href="http://127.0.0.1:5173" className="link">
										127.0.0.1:5173
									</a>{" "}
									again. Then set your status and see the UI update and the
									PDS-fetched data show the result.
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
								Pick an emoji. It gets written to your local PDS as an{" "}
								<code className="inlineCode">xyz.statusphere.status</code>{" "}
								record using <code className="inlineCode">put</code> with{" "}
								<code className="inlineCode">rkey: "self"</code>. One record per
								user, replaced wholesale each time.
							</p>
							<StatusSection
								currentStatus={currentStatus}
								listRecordsEndpoint={statusRecordsEndpoint ?? ""}
								initialRecords={statusRecords}
							/>
						</section>
					</>
				) : (
					<section className="section">
						<h2 className="sectionTitle">Sign in with AT Protocol</h2>
						<p className="prose">
							Enter your handle to authenticate via AT Protocol OAuth. You'll be
							redirected to your local PDS to approve access, then back here.
						</p>
						<LoginForm />
					</section>
				)}
			</main>
		</div>
	);
}
