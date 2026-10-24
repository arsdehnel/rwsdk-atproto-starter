export const postConfig = {
	series: 1,
	step: 3,
	postUrl: "https://arsdehnel.com/posts/rwsdk-atp-1-03-local-dev",
	commandLines: [
		"git clone https://github.com/arsdehnel/rwsdk-atproto-starter",
		"git checkout post/series-1/03-local-dev",
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
			And try it with your own public account which won't work because we're
			local-only now
		</p>
	),
};
