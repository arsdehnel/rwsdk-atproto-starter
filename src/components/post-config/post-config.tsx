export const postConfig = {
	step: 7,
	postUrl: "https://arsdehnel.com/posts/rwsdk-atproto-07-appview",
	commandLines: [
		"git clone https://github.com/arsdehnel/rwsdk-atproto-starter",
		"git checkout post/07-appview",
		"pnpm install",
		"cp .dev.vars.example .dev.vars",
		"pnpm docker:up",
		"pnpm dev",
	],
	explanation: (
		<>
			<p className="prose">
				To see the multi-user feed in action: sign in as{" "}
				<code className="inlineCode">alice.devnet.test</code> /{" "}
				<code className="inlineCode">alice-devnet-pass</code> in a normal window
				and set a status. Open an incognito window, sign in as{" "}
				<code className="inlineCode">bob.devnet.test</code> /{" "}
				<code className="inlineCode">bob-devnet-pass</code>, and set a different
				status. Then open a third window (no login) — both statuses appear in
				the status board below.
			</p>
			<p className="prose">
				Taking it a step further open a second terminal window and run{" "}
				<code className="inlineCode">pnpm write-status</code> to mimic a PDS
				write from someone using a different UI to select their status. This is
				one of the powerful things about the Atmosphere: people can use their
				own apps and custom build UIs to consume and produce data for existing
				apps. Once you've done this Carol's status will show on all your browser
				tabs within a second or two.
			</p>
		</>
	),
};
