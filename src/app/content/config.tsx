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
	post: 5,
	slug: "next-steps",
	pr: 104,
	goingDeeper: {
		explanation: (
			<p className="prose">
				This is the production-ready starting point — the complete app from the
				series, deployed to Cloudflare Workers with real AT Protocol OAuth, D1
				persistence, and a live AppView.
			</p>
		),
		links: [
			{
				url: "https://atproto.com/guides/overview",
				label: "AT Protocol overview",
				note: "The full AT Protocol developer documentation",
			},
			{
				url: "https://developers.cloudflare.com/workers/",
				label: "Cloudflare Workers docs",
				note: "Everything you need to run and scale your Worker in production",
			},
			{
				url: "https://github.com/arsdehnel/rwsdk-atproto-starter",
				label: "rwsdk-atproto-starter on GitHub",
				note: "The source repo for this series — fork it to start your own app",
			},
		],
	} satisfies GoingDeeperContent,
};
