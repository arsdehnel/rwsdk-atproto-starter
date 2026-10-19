export function LoggedInUser({
	did,
	userHandle,
}: {
	did: string;
	userHandle: string | null;
}): React.ReactNode {
	return (
		<section className="section">
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "baseline",
				}}
			>
				<h2 className="sectionTitle">
					Signed in{userHandle ? ` as @${userHandle}` : ""}
				</h2>
				<form method="post" action="/oauth/logout">
					<button type="submit" className="signOutButton">
						Sign out
					</button>
				</form>
			</div>
			<p className="prose">
				<code className="inlineCode">{did}</code>
			</p>
		</section>
	);
}
