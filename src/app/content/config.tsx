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
	step: 1,
	postUrl: "https://arsdehnel.com/posts/rwsdk-atproto-01-first-read",
	goingDeeper: {
		explanation: (
			<p className="prose">
				This post reads live data from the AT Protocol using XRPC and the{" "}
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
		],
	} satisfies GoingDeeperContent,
};
