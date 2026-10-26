export function HeaderContent(): React.ReactNode {
	return (
		<div className="header-content">
			<h1 className="title">rwsdk + AT Protocol</h1>
			<p className="subtitle">
				A starter kit for building{" "}
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
				deploying to{" "}
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
	);
}
