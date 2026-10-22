import { eq } from "drizzle-orm";
import type { RequestInfo } from "rwsdk/worker";
import { LoggedInUser } from "@/components/logged-in-user/logged-in-user";
import { LoginForm } from "@/components/login-form/login-form";
import { StatusFeed } from "@/components/status-feed/status-feed";
import { StatusPicker } from "@/components/status-picker/status-picker";
import { db } from "@/db/db";
import { statuses } from "@/db/schema";
import { getOAuthClient } from "@/lib/auth/client";
import type { AppContext } from "@/worker";

export async function PostContent({ ctx }: RequestInfo<AppContext>) {
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
		try {
			const oauthClient = await getOAuthClient();
			const oauthSession = await oauthClient.restore(did);
			const userPdsUrl = oauthSession.serverMetadata.issuer;
			const res = await fetch(
				`${userPdsUrl}/xrpc/com.atproto.repo.describeRepo?repo=${did}`,
			);
			const data = (await res.json()) as { handle?: string };
			userHandle = data.handle ?? null;
		} catch (err) {
			console.log(`Error fetching session for did ${did}: ${err}`);
			// this will force the user to re-login which might not be great but is better than an error
			did = null;
		}
	}

	return (
		<>
			{did ? (
				<>
					<LoggedInUser did={did} userHandle={userHandle} />

					<section className="section">
						<h2 className="sectionTitle">Your status</h2>
						<p className="prose">
							Pick an emoji again, it still gets written to your PDS as an{" "}
							<code className="inlineCode">xyz.statusphere.status</code> record,
							and Tap still picks it up from the firehose and delivers it to the
							worker and your browser.
						</p>
						<p className="prose">
							Once you've picked one, try restarting the worker (
							<code className="inlineCode">pnpm dev</code>) and refreshing the
							page. Your status survives now as it's written to D1.
						</p>
						<StatusPicker currentStatus={currentStatus} />
					</section>

					<section className="section">
						<h2 className="sectionTitle">
							Live from Tap but with D1 persistence
						</h2>
						<p className="prose">
							Just like Step 5's architecture, the event flows through from PDS
							to Relay to Tap back to your local host but now that data will be
							saved to D1 while also being pushed to this UI via server-side
							events.
							<ol>
								<li>
									The write goes to your PDS, which emits a firehose event
								</li>
								<li>
									Tap subscribes to the firehose, filters for{" "}
									<code className="inlineCode">xyz.statusphere.status</code>{" "}
									records
								</li>
								<li>
									Tap delivers the events to{" "}
									<code className="inlineCode">POST /webhooks/tap</code>
								</li>
								<li>
									The worker upserts into D1 and updates the in-memory store
								</li>
								<li>
									The worker pushes the new list to all open SSE connections
								</li>
							</ol>
						</p>
						<StatusFeed initialStatuses={await db.select().from(statuses)} />
					</section>
				</>
			) : (
				<section className="section">
					<h2 className="sectionTitle">Sign in with AT Protocol</h2>
					<p className="prose">
						Enter your handle to authenticate via AT Protocol OAuth. Once
						authenticated you'll come back here and be able to select your
						status and view the demo.
					</p>
					<LoginForm />
				</section>
			)}
		</>
	);
}
