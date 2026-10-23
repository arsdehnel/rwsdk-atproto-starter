import { Client } from "@atproto/lex";
import type { RequestInfo } from "rwsdk/worker";
import { LoggedInUser } from "@/components/logged-in-user/logged-in-user";
import { LoginForm } from "@/components/login-form/login-form";
import { StatusSection } from "@/components/status-section/status-section";
import statusSchema from "@/lexicons/xyz/statusphere/status";
import { getOAuthClient } from "@/lib/auth/client";
import type { AppContext } from "@/worker";

export async function PostContent({ ctx }: RequestInfo<AppContext>) {
	let did = ctx.session?.did ?? null;
	let userHandle: string | null = null;
	let currentStatus: string | null = null;
	let statusRecords: unknown = null;
	let statusRecordsEndpoint: string | null = null;

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

			statusRecordsEndpoint = `${userPdsUrl}/xrpc/com.atproto.repo.listRecords?repo=${did}&collection=xyz.statusphere.status`;
			const listRes = await fetch(statusRecordsEndpoint);
			statusRecords = await listRes.json();

			// Read the current status record back from the PDS.
			// This is the "read your own writes" anti-pattern — fine for a demo,
			// but Post 5 covers how the real ecosystem handles this with AppViews.
			try {
				const lexClient = new Client(oauthSession);
				const result = await lexClient.list(statusSchema, { limit: 1, reverse: true });
				currentStatus = (result.records[0]?.value.status as string) ?? null;
			} catch {
				// No status record yet so we can start fresh.
			}

		} catch( err ) {
			console.log( `Error fetching session for did ${ did }: ${ err }`)
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
							Pick an emoji. It gets written to your local PDS as a new{" "}
							<code className="inlineCode">xyz.statusphere.status</code> record
							using <code className="inlineCode">create</code>. Each pick appends
							a new TID-keyed record — matching how the lexicon is declared.
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
		</>
	);
}
