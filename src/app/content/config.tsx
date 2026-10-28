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
	post: 3,
	slug: "local-dev",
	pr: 99,
	nextPost: {
		series: 1,
		post: 4,
		slug: "atp-writes",
		description: (
			<>
				With a local dev stack running,{" "}
				<strong>Step 4: ATP Writes</strong> adds authenticated record creation
				and deletion using AT Protocol lexicons
			</>
		),
	},
	goingDeeper: {
		explanation: (
			<p className="prose">
				This post sets up a local dev environment with a full AT Protocol stack
				— PDS, Bluesky AppView, and Tap — running in Docker Compose. OAuth
				works against the local PDS rather than bsky.social.
			</p>
		),
		links: [
			{
				url: "https://atproto.com/guides/self-hosting",
				label: "AT Protocol self-hosting guide",
				note: "Running your own PDS",
			},
			{
				url: "https://github.com/bluesky-social/atproto",
				label: "atproto monorepo",
				note: "Source for the PDS, AppView, and related services",
			},
			{
				url: "https://docs.docker.com/compose/",
				label: "Docker Compose docs",
				note: "Orchestrating the local dev stack",
			},
		],
	} satisfies GoingDeeperContent,
};
