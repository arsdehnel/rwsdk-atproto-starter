import { Client } from "@atproto/lex";
import type { RequestInfo } from "rwsdk/worker";
<<<<<<< HEAD
import {
	LoggedInUser,
	LoginForm,
	StatusBoard,
	StatusSection,
} from "@/app/components";
import { getOAuthClient } from "@/app/lib/auth-client";
import statusSchema from "@/lexicons/xyz/statusphere/status";
import type { AppContext } from "@/worker";
import { postConfig } from "./config";

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
				const result = await lexClient.list(statusSchema, {
					limit: 1,
					reverse: true,
				});
				currentStatus = (result.records[0]?.value.status as string) ?? null;
			} catch {
				// No status record yet so we can start fresh.
			}
		} catch (err) {
			console.log(`Error fetching session for did ${did}: ${err}`);
			// this will force the user to re-login which might not be great but is better than an error
			did = null;
		}
	}

=======
import { LoggedInUser, LoginForm, PdsFeedViewer } from "@/app/components";
import type { AppContext } from "@/worker";

export async function PostContent({ ctx }: RequestInfo<AppContext>) {
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
>>>>>>> d83ff43 (feat: initial post 2 functionality)
	return (
		<>
			{did ? (
				<>
					<LoggedInUser did={did} userHandle={userHandle} />
					<section className="section">
<<<<<<< HEAD
						<h2 className="sectionTitle">Set your status</h2>
						<p className="prose">
							Pick an emoji. It gets written to your local PDS as a new{" "}
							<code className="inlineCode">xyz.statusphere.status</code> record
							using <code className="inlineCode">create</code>. Each pick
							appends a new TID-keyed record but we're just showing the latest
							here.
						</p>
						<StatusSection
							did={did}
							currentStatus={currentStatus}
							listRecordsEndpoint={statusRecordsEndpoint ?? ""}
							initialRecords={statusRecords}
						/>
						<StatusBoard />
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
=======
						<h2 className="sectionTitle">Your recent posts</h2>
						<PdsFeedViewer
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
							You'll be redirected to Bluesky to approve access, then back here.
						</p>
						<LoginForm />
					</section>
					<section className="section">
						<h2 className="sectionTitle">Live from the AT Protocol</h2>
						<p className="prose">
							Sign in above to see your recent posts pulled live from your PDS.
						</p>
					</section>
				</>
>>>>>>> d83ff43 (feat: initial post 2 functionality)
			)}

			<section className="section">
				<h2 className="sectionTitle">Review the changes</h2>
				<p className="prose">
					Take a look at the{" "}
					<a
						className="link-inline"
						href={`https://arsdehnel.com/posts/rwsdk-atp-s${postConfig.series}-p${postConfig.post}-${postConfig.slug}`}
					>
						blog post
					</a>{" "}
					for this step or dive into the{" "}
					<a
						className="link-inline"
						href={`https://github.com/arsdehnel/rwsdk-atproto-starter/pull/${postConfig.pr}`}
					>
						pull request
					</a>{" "}
					to see the exact changes made.
				</p>
			</section>

			<section className="section">
				<h2 className="sectionTitle">Up Next</h2>
				<p className="prose">
					{postConfig.nextPost.description} (
					<a
						className="link-inline"
						href={`https://arsdehnel.com/posts/rwsdk-atp-s${postConfig.nextPost.series}-p${postConfig.nextPost.post}-${postConfig.nextPost.slug}`}
					>
						Blog Post
					</a>{" "}
					|{" "}
					<a
						className="link-inline"
						href={`https://github.com/arsdehnel/rwsdk-atproto-starter/tree/post/series-${postConfig.nextPost.series}/0${postConfig.nextPost.post}-${postConfig.nextPost.slug}/`}
					>
						Git Branch
					</a>
					).
				</p>
			</section>
		</>
	);
}
