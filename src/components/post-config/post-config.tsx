export const postConfig = {
	step: 4,
	postUrl: "https://arsdehnel.com/posts/rwsdk-atproto-04-atproto-writes",
	commandLines: [
		"git clone https://github.com/arsdehnel/rwsdk-atproto-starter",
		"git checkout post/04-atproto-writes",
		"pnpm install",
		"cp .dev.vars.example .dev.vars",
		"pnpm docker:up",
		"pnpm dev",
	],
	explanation: (
		<p className="prose">
			The <code className="inlineCode">cp</code> step copies the local dev
			secrets file — it includes a pre-filled{" "}
			<code className="inlineCode">OAUTH_KV_ENCRYPTION_KEY</code> that's fine
			for local dev. Then log in with{" "}
			<code className="inlineCode">alice.devnet.test</code> /{" "}
			<code className="inlineCode">alice-devnet-pass</code> on{" "}
			<a href="http://127.0.0.1:5173" className="link">
				127.0.0.1:5173
			</a>{" "}
			and set your status.
		</p>
	),
};
