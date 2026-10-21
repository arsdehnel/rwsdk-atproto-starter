export function LocalhostWarning({
	hostname,
	port,
}: {
	hostname: string;
	port: string;
}): React.ReactNode {
	if (!hostname.includes("localhost")) {
		return null;
	}

	return (
		<div className="localhost-warning">
			Warning, you should be using{" "}
			<a href={`http://127.0.0.1:${port}/`}>http://127.0.0.1:{port}/</a> instead
			of locahost.
		</div>
	);
}
