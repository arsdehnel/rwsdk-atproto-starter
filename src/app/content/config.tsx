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
	post: 4,
	slug: "deploy-prep",
	pr: 103,
	nextPost: {
		series: 2,
		post: 5,
		slug: "next-steps",
		description: (
			<>
				Almost done. <strong>Step 5: Next Steps</strong> is the deployed,
				production-ready final state of the full application
			</>
		),
	},
	goingDeeper: {
		explanation: (
			<p className="prose">
				This post prepares the app for production deployment — wiring up
				Cloudflare secrets, configuring production environment variables, and
				deploying to a live Workers URL.
			</p>
		),
		links: [
			{
				url: "https://developers.cloudflare.com/workers/wrangler/commands/#secret",
				label: "Wrangler secrets",
				note: "How to manage secrets for production deployments",
			},
			{
				url: "https://developers.cloudflare.com/workers/wrangler/configuration/#environments",
				label: "Wrangler environments",
				note: "Configuring dev, staging, and production environments",
			},
			{
				url: "https://developers.cloudflare.com/workers/",
				label: "Cloudflare Workers deployment docs",
				note: "Deploying and managing your Worker in production",
			},
		],
	} satisfies GoingDeeperContent,
};
