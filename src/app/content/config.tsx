export type GoingDeeperContent = {
	links: {
		url: string;
		label: string;
		note?: string;
	}[];
	explanation: React.ReactNode;
};

export const postConfig = {
	series: 1,
	post: 1,
	slug: "get-started",
	nextPost: {
		series: 1,
		post: 2,
		slug: "atp-oauth",
		description: (
			<>
				Now that we've established a basic ATP interaction we're ready to dive
				into <strong>Step 2: AT Proto OAuth</strong>
			</>
		),
	},
	goingDeeper: {
		explanation: (
			<p className="prose">
				This post starts from an RWSDK starter kit and reads live data from the
				AT Protocol using XRPC and the{" "}
				<code className="inlineCode">app.bsky.feed.getTimeline</code> lexicon.
			</p>
		),
		links: [
			{
				url: "https://atproto.com/guides/overview",
				label: "AT Protocol overview",
				note: "The protocol spec — data model, DIDs, lexicons, and repos",
			},
			{
				url: "https://docs.bsky.app/docs/api/app-bsky-feed-get-timeline",
				label: "app.bsky.feed.getTimeline",
				note: "The lexicon used to fetch the feed in this post",
			},
			{
				url: "https://developers.cloudflare.com/workers/",
				label: "Cloudflare Workers docs",
				note: "The runtime this app runs on",
			},
			{
				url: "https://rwsdk.com/",
				label: "RedwoodSDK",
				note: "Server-first React, running on the Cloudflare platform",
			},
		],
	} satisfies GoingDeeperContent,
};
