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
	post: 4,
	slug: "atp-writes",
	pr: 100,
	nextPost: {
		series: 1,
		post: 5,
		slug: "tap-sync",
		description: (
			<>
				With writes working, <strong>Step 5: Tap Sync</strong> connects to the
				AT Protocol firehose to index status records from other users in real
				time
			</>
		),
	},
	goingDeeper: {
		explanation: (
			<p className="prose">
				This post adds authenticated writes — creating and deleting records on
				your PDS using AT Protocol lexicons and XRPC. KV is introduced to
				persist OAuth tokens across Worker restarts.
			</p>
		),
		links: [
			{
				url: "https://atproto.com/guides/lexicon",
				label: "AT Protocol lexicon guide",
				note: "How schemas define the records and endpoints of the protocol",
			},
			{
				url: "https://atproto.com/specs/xrpc",
				label: "XRPC spec",
				note: "The HTTP API layer built on top of lexicons",
			},
			{
				url: "https://developers.cloudflare.com/kv/",
				label: "Cloudflare KV docs",
				note: "Used here to durably store OAuth session tokens",
			},
		],
	} satisfies GoingDeeperContent,
};
