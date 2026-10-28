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
	post: 5,
	slug: "tap-sync",
	pr: 75,
	nextPost: {
		series: 2,
		post: 1,
		slug: "production-oauth",
		description: (
			<>
				Series 1 is complete.{" "}
				<strong>Series 2, Step 1: Production OAuth</strong> starts the move to
				production by swapping the loopback OAuth client for one that works
				with any AT Protocol PDS
			</>
		),
	},
	goingDeeper: {
		explanation: (
			<p className="prose">
				This post connects to Tap — a firehose relay for the AT Protocol — and
				syncs status updates from other users in real time using
				server-sent events.
			</p>
		),
		links: [
			{
				url: "https://atproto.com/specs/event-stream",
				label: "AT Protocol event stream spec",
				note: "The firehose protocol that Tap relays",
			},
			{
				url: "https://github.com/bluesky-social/jetstream",
				label: "Jetstream (Tap is based on this)",
				note: "Filtered event stream for the AT Protocol",
			},
			{
				url: "https://developers.cloudflare.com/workers/runtime-apis/server-sent-events/",
				label: "Cloudflare Workers SSE docs",
				note: "How the live status feed is pushed to the browser",
			},
		],
	} satisfies GoingDeeperContent,
};
