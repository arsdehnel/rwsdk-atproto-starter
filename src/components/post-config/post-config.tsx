export const postConfig = {
	step: 4,
	postUrl: "https://arsdehnel.com/posts/rwsdk-atproto-04-atproto-writes",
	commandLines: [
		"git clone https://github.com/arsdehnel/rwsdk-atproto-starter",
		"git checkout post/04-atproto-writes",
		"pnpm install",
		"pnpm docker:up",
		"pnpm dev",
	],
	explanation: (
		<p className="prose">
			Log in with{" "}
			<code className="inlineCode">alice.devnet.test</code> /{" "}
			<code className="inlineCode">alice-devnet-pass</code> on{" "}
			<a href="http://127.0.0.1:5173" className="link">
				127.0.0.1:5173
			</a>{" "}
			again. Then set your status and see the UI update and the PDS-fetched
			data show the result.
		</p>
	),
};
