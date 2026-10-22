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
							Pick an emoji. It gets written to your PDS as an{" "}
							<code className="inlineCode">xyz.statusphere.status</code> record
							and then replicated to our D1 AppView database.
						</p>
						<p className="prose">
							Then to make the demo more meaningful open another window and log
							in as Bob to see how two users can see each others' statuses.
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
					status, one row per user, sourced from D1. Tap delivers a webhook for
					each record write; the worker upserts into D1; this page reads from
					D1.
				</p>
				<p className="prose">
					That's the AppView pattern: subscribe to the firehose, index what you
					care about, serve your own query interface. Bluesky's{" "}
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
		</>
	);
}
