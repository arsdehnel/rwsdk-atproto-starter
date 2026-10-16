import type { RequestInfo } from "rwsdk/worker";

import { BlueskyFeed } from "@/components/bluesky-feed/bluesky-feed";
import { HeaderNav } from "@/components/header-nav/header-nav";

const ENDPOINT =
	"https://bsky.social/xrpc/com.atproto.repo.listRecords?repo=bsky.app&collection=app.bsky.feed.post&limit=3";

const buildingContent = (
	<>
		<p className="prose">
			You're on Post 1 of a{" "}
			<a
				href="https://arsdehnel.com/posts"
				target="_blank"
				rel="noreferrer"
				className="link"
			>
				blog series
			</a>{" "}
			that builds a real AT Protocol app from scratch — one step at a time. By
			the end the series covers:
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
				accounts or a local devnet
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
				</a>{" "}
				and{" "}
				<a
					href="https://github.com/bluesky-social/jetstream"
					target="_blank"
					rel="noreferrer"
					className="link"
				>
					Jetstream
				</a>{" "}
				— no polling
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
				Full local devnet via{" "}
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
		</ul>
	</>
);

const seriesContent = (
	<>
		<ol className="seriesList">
			<li>
				<strong>Your First AT Protocol Read</strong> — you are here
			</li>
			<li>AT Protocol OAuth with rwsdk and Cloudflare Workers</li>
			<li>Local Development with Docker Compose</li>
			<li>Lexicons and Writing to Your PDS</li>
			<li>Reacting to Changes with Tap and Jetstream</li>
			<li>Persistence with D1 and Drizzle</li>
			<li>Building a Feed — You're an AppView Now</li>
			<li>Where to Go From Here</li>
		</ol>
		<p className="prose">
			Each post has a corresponding branch in this repo. Check out{" "}
			<code className="inlineCode">post/02-oauth</code> to keep going, or read
			the full series at{" "}
			<a
				href="https://arsdehnel.com/posts"
				target="_blank"
				rel="noreferrer"
				className="link"
			>
				arsdehnel.com/posts
			</a>
			.
		</p>
	</>
);

const runItContent = (
	<>
		<div className="codeBlock">
			<span className="codePrompt">$</span>
			<code>git clone https://github.com/arsdehnel/rwsdk-atproto-starter</code>
		</div>
		<div className="codeBlock">
			<span className="codePrompt">$</span>
			<code>git checkout post/01-first-read</code>
		</div>
		<div className="codeBlock">
			<span className="codePrompt">$</span>
			<code>pnpm install && pnpm dev</code>
		</div>
		<p className="prose">
			Open{" "}
			<a href="http://localhost:5173" className="link">
				localhost:5173
			</a>{" "}
			— the feed above is fetched live from{" "}
			<code className="inlineCode">bsky.social</code> on every request.
		</p>
	</>
);

export async function Home(_: RequestInfo) {
	const response = await fetch(ENDPOINT);
	const records = await response.json();

	return (
		<div className="container">
			<header className="header">
				<div className="header-content">
					<h1 className="title">rwsdk + AT Protocol</h1>
					<p className="subtitle">
						A step-by-step walkthrough of creating a starter kit for building{" "}
						<a
							href="https://atproto.com"
							target="_blank"
							rel="noreferrer"
							className="link"
						>
							AT Protocol
						</a>{" "}
						apps on{" "}
						<a
							href="https://rwsdk.dev"
							target="_blank"
							rel="noreferrer"
							className="link"
						>
							RedwoodSDK
						</a>{" "}
						and{" "}
						<a
							href="https://developers.cloudflare.com/workers"
							target="_blank"
							rel="noreferrer"
							className="link"
						>
							Cloudflare Workers
						</a>
						.
					</p>
				</div>
				<HeaderNav
					buildingContent={buildingContent}
					seriesContent={seriesContent}
					runItContent={runItContent}
				/>
			</header>

			<main>
				<section className="section">
					<h2 className="sectionTitle">Live from the AT Protocol</h2>
					<BlueskyFeed endpoint={ENDPOINT} records={records} />
				</section>
			</main>
		</div>
	);
}
