export const postConfig = {
	series: 1,
	step: 2,
	postUrl: "https://arsdehnel.com/posts/rwsdk-atp-1-02-atp-oauth",
	commandLines: [
		"git clone https://github.com/arsdehnel/rwsdk-atproto-starter",
		"git checkout post/series-1/02-atp-oauth",
		"pnpm install",
		"pnpm dev",
	],
	explanation: (
		<p className="prose">
			Open{" "}
			<a href="http://127.0.0.1:5173" className="link">
				127.0.0.1:5173
			</a>{" "}
			— the feed is fetched live from{" "}
			<code className="inlineCode">bsky.social</code> on every request but now
			specifically for you, the logged in user.
		</p>
	),
};
