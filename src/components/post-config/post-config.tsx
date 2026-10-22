export const postConfig = {
	step: 2,
	postUrl: "https://arsdehnel.com/posts/rwsdk-atproto-02-atproto-oauth",
	commandLines: [
		"git clone https://github.com/arsdehnel/rwsdk-atproto-starter",
		"git checkout post/02-atproto-oauth",
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
