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
	post: 1,
	slug: "production-oauth",
	pr: 78,
	nextPost: {
		series: 2,
		post: 2,
		slug: "d1-persistence",
		description: (
			<>
				With production OAuth in place,{" "}
				<strong>Step 2: D1 Persistence</strong> adds D1 as a relational store
				for status records synced from the AT Protocol firehose
			</>
		),
	},
	goingDeeper: {
		explanation: (
			<p className="prose">
				This post swaps the loopback OAuth client for one that works against
				production PDS instances. It introduces Web Crypto for signing client
				assertions and adapts the OAuth metadata endpoint for public deployment.
			</p>
		),
		links: [
			{
				url: "https://atproto.com/specs/oauth",
				label: "AT Protocol OAuth spec",
				note: "The full OAuth 2.0 profile — including the confidential client flow used here",
			},
			{
				url: "https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto",
				label: "Web Crypto API (SubtleCrypto)",
				note: "Used to generate and sign the client's private key",
			},
			{
				url: "https://developers.cloudflare.com/kv/",
				label: "Cloudflare KV docs",
				note: "Persists OAuth state and session tokens across isolates",
			},
		],
	} satisfies GoingDeeperContent,
};
