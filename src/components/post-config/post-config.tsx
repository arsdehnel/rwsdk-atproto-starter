export const postConfig = {
	step: 3,
	postUrl: "https://arsdehnel.com/posts/rwsdk-atproto-03-local-dev-setup",
	commandLines: [
		"git clone https://github.com/arsdehnel/rwsdk-atproto-starter",
		"git checkout post/03-local-dev-setup",
		"pnpm install",
		"pnpm docker:up",
		"pnpm dev",
	],
	explanation: (
		<p className="prose">
			Log in with <code className="inlineCode">alice.devnet.test</code> /{" "}
			<code className="inlineCode">alice-devnet-pass</code>. Open{" "}
			<a href="http://127.0.0.1:5173" className="link">
				127.0.0.1:5173
			</a>
			, not <code className="inlineCode">localhost:5173</code>. The OAuth
			redirect URI is registered as{" "}
			<code className="inlineCode">http://127.0.0.1:5173/oauth/callback</code> —
			after the PDS approves access it sends the browser back to that exact
			address.
		</p>
	),
};
