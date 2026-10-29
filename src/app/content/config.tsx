export type GoingDeeperContent = {
	links: {
		url: string;
		label: string;
		note?: string;
	}[];
	explanation: React.ReactNode;
};

export const postConfig = {
	series: 2,
	post: 3,
	slug: "appview-features",
	pr: 102,
	nextPost: {
		series: 2,
		post: 4,
		slug: "deploy-prep",
		description: (
			<>
				The app is feature-complete.{" "}
				<strong>Step 4: Deploy Prep</strong> wires up production secrets and
				environment config to get ready for Cloudflare Workers deployment
			</>
		),
	},
	goingDeeper: {
		explanation: (
			<p className="prose">
				This post adds AppView-style features — reading the community's status
				records from D1 rather than directly from individual PDSs. This is the
				pattern real AppViews use to serve aggregated data at scale.
			</p>
		),
		links: [
			{
				url: "https://atproto.com/guides/glossary#app-view",
				label: "AT Protocol AppView concept",
				note: "How AppViews aggregate and serve data from the firehose",
			},
			{
				url: "https://developers.cloudflare.com/d1/",
				label: "Cloudflare D1 docs",
				note: "The database powering the aggregated status feed",
			},
			{
				url: "https://atproto.com/specs/did",
				label: "DID spec",
				note: "How user identities are resolved across the network",
			},
		],
	} satisfies GoingDeeperContent,
};
