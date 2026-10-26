interface BuildingContentProps {
	currentStep: number;
	postUrl: string;
}

export function BuildingContent({
	currentStep,
	postUrl,
}: BuildingContentProps) {
	return (
		<>
			<p className="prose">
				You're on{" "}
				<a href={postUrl} target="_blank" rel="noreferrer" className="link">
					Post {currentStep}
				</a>{" "}
				of a blog series that builds a real AT Protocol app from scratch — one
				step at a time. By the end the series covers:
			</p>
			<ul className="featureList">
				<li>
					AT Protocol OAuth login against real{" "}
					<a
						href="https://bsky.app"
						target="_blank"
						rel="noreferrer"
						className="link"
					>
						Bluesky
					</a>{" "}
					accounts or a local dev stack
				</li>
				<li>
					Read and write records using a typed{" "}
					<a
						href="https://atproto.com/specs/lexicon"
						target="_blank"
						rel="noreferrer"
						className="link"
					>
						lexicon
					</a>{" "}
					client
				</li>
				<li>
					React to record changes with{" "}
					<a
						href="https://www.npmjs.com/package/@atproto/tap"
						target="_blank"
						rel="noreferrer"
						className="link"
					>
						Tap
					</a>
					— no polling
				</li>
				<li>
					Manage stateful compute with{" "}
					<a
						href="https://developers.cloudflare.com/durable-objects/"
						target="_blank"
						rel="noreferrer"
						className="link"
					>
						Durable Objects
					</a>{" "}
					for sessions, OAuth tokens, and live sync
				</li>
				<li>
					Persist indexed data with{" "}
					<a
						href="https://developers.cloudflare.com/d1"
						target="_blank"
						rel="noreferrer"
						className="link"
					>
						Cloudflare D1
					</a>{" "}
					and{" "}
					<a
						href="https://orm.drizzle.team"
						target="_blank"
						rel="noreferrer"
						className="link"
					>
						Drizzle
					</a>
				</li>
				<li>
					Full local dev stack via{" "}
					<a
						href="https://docs.docker.com/compose"
						target="_blank"
						rel="noreferrer"
						className="link"
					>
						Docker Compose
					</a>{" "}
					so you never test against production
				</li>
				<li>
					Deploy to Cloudflare Workers with a production-ready three-environment
					wrangler config
				</li>
			</ul>
			<p className="prose">
				The{" "}
				<a
					href="https://arsdehnel.github.io/rwsdk-atproto-starter/"
					target="_blank"
					rel="noreferrer"
					className="link"
				>
					series overview
				</a>{" "}
				maps every post and branch if you want to see the full picture before
				diving in.
			</p>
		</>
	);
}
