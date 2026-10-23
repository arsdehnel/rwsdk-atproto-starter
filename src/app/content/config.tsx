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
	post: 2,
	slug: "atp-oauth",
	nextPost: {
		series: 1,
		post: 3,
		slug: "local-dev",
		description: (
			<>
				With OAuth in place, <strong>Step 3: Local Dev Setup</strong> wires up
				a full local AT Protocol stack so you can develop and test without
				hitting production
			</>
		),
	},
	goingDeeper: {
		explanation: (
			<p className="prose">
				This post adds AT Protocol OAuth so the feed is fetched on behalf of
				the logged-in user. The AT Protocol uses a OAuth 2.0 + PKCE flow with
				a few protocol-specific extensions for identity resolution.
			</p>
		),
		links: [
			{
				url: "https://atproto.com/specs/oauth",
				label: "AT Protocol OAuth spec",
				note: "The full OAuth 2.0 profile used by atproto clients",
			},
			{
				url: "https://atproto.com/guides/identity",
				label: "AT Protocol identity guide",
				note: "How DIDs and handles map to authorization servers",
			},
			{
				url: "https://developers.cloudflare.com/durable-objects/",
				label: "Cloudflare Durable Objects",
				note: "Used here to persist OAuth state across the login flow",
			},
		],
	} satisfies GoingDeeperContent,
};
