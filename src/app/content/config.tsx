export const postConfig = {
	step: 1,
	postUrl: "https://arsdehnel.com/posts/rwsdk-atproto-01-first-read",
	commandLines: [
		"git clone https://github.com/arsdehnel/rwsdk-atproto-starter",
		"git checkout post/01-first-read",
		"pnpm install",
		"pnpm dev",
	],
	explanation: (
		<p className="prose">
			Open{" "}
			<a href="http://localhost:5173" className="link">
				localhost:5173
			</a>{" "}
			— the feed is fetched live from{" "}
			<code className="inlineCode">bsky.social</code> on every request.
		</p>
	),
};
