<<<<<<< HEAD
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
	post: 2,
	slug: "d1-persistence",
	pr: 101,
	nextPost: {
		series: 2,
		post: 3,
		slug: "appview-features",
		description: (
			<>
				With records stored in D1,{" "}
				<strong>Step 3: AppView Features</strong> builds AppView-style
				aggregations — surfacing community status data from the database
			</>
		),
	},
	goingDeeper: {
		explanation: (
			<p className="prose">
				This post adds D1 as a relational store for status records synced from
				the Tap firehose. Drizzle ORM manages the schema and queries, and
				records are upserted from the webhook handler.
			</p>
		),
		links: [
			{
				url: "https://developers.cloudflare.com/d1/",
				label: "Cloudflare D1 docs",
				note: "The SQLite-based relational database used here",
			},
			{
				url: "https://orm.drizzle.team/docs/overview",
				label: "Drizzle ORM docs",
				note: "Schema definition and query builder used with D1",
			},
			{
				url: "https://atproto.com/specs/lexicon",
				label: "Lexicon spec",
				note: "The schema format for the status records being stored",
			},
		],
	} satisfies GoingDeeperContent,
=======
export const postConfig = {
	series: 1,
	step: 5,
	postUrl: "https://arsdehnel.com/posts/rwsdk-atproto-1-05-tap-sync",
	commandLines: [
		"git clone https://github.com/arsdehnel/rwsdk-atproto-starter",
		"git checkout post/series-1/05-tap-sync",
		"pnpm install",
		"pnpm docker:up",
		"pnpm dev",
	],
	explanation: (
		<p className="prose">
			Open{" "}
			<a href="http://127.0.0.1:5173" className="link">
				127.0.0.1:5173
			</a>{" "}
			and log in with any of the three seeded accounts:
			<ul>
				<li>
					<code className="inlineCode">alice.devnet.test</code> /{" "}
					<code className="inlineCode">alice-devnet-pass</code>
				</li>
				<li>
					<code className="inlineCode">bob.devnet.test</code> /{" "}
					<code className="inlineCode">bob-devnet-pass</code>
				</li>
				<li>
					<code className="inlineCode">carol.devnet.test</code> /{" "}
					<code className="inlineCode">carol-devnet-pass</code>
				</li>
			</ul>
			Then set your status and note the update as the Tap's webhook comes in and
			is processed.
		</p>
	),
>>>>>>> d83ff43 (feat: initial post 2 functionality)
};
