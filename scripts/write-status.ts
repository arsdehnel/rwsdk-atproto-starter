// Writes carol's status directly to the PDS, bypassing the local app entirely.
// The update reaches other windows only via the Tap relay — demonstrating the relay path.
//
// Usage: pnpm write-status

const PDS_URL = "http://localhost:3000";
const TAP_URL = "http://localhost:2480";
const HANDLE = "carol.devnet.test";
const PASSWORD = "carol-devnet-pass";

const EMOJIS = [
	"👍",
	"👎",
	"💙",
	"🔥",
	"😆",
	"😢",
	"🤔",
	"😴",
	"🎉",
	"🤩",
	"😭",
	"🥳",
	"😤",
	"💀",
	"✨",
	"👀",
	"🙏",
	"📚",
	"💻",
	"🍕",
];
const STATUS = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

async function main() {
	// Step 1: Authenticate directly with the PDS (no local app involved)
	const sessionRes = await fetch(
		`${PDS_URL}/xrpc/com.atproto.server.createSession`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ identifier: HANDLE, password: PASSWORD }),
		},
	);

	if (!sessionRes.ok) {
		console.error("Auth failed:", await sessionRes.text());
		process.exit(1);
	}

	const session = (await sessionRes.json()) as {
		accessJwt: string;
		did: string;
	};
	console.log(`Authenticated as ${HANDLE} (${session.did})`);

	// Step 2: Register with the local tap as the app handles this for app-based logins
	const repoRes = await fetch(`${TAP_URL}/repos/add`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ dids: [session.did] }),
	});
	if (!repoRes.ok) {
		console.error("Repo registration failed:", await repoRes.text());
		process.exit(1);
	}
	console.log(`Repo registered`);

	// Step 3: Write the status record directly to carol's PDS repo
	const writeRes = await fetch(`${PDS_URL}/xrpc/com.atproto.repo.putRecord`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.accessJwt}`,
		},
		body: JSON.stringify({
			repo: session.did,
			collection: "xyz.statusphere.status",
			rkey: "self",
			record: {
				$type: "xyz.statusphere.status",
				status: STATUS,
				createdAt: new Date().toISOString(),
			},
		}),
	});

	if (!writeRes.ok) {
		console.error("Write failed:", await writeRes.text());
		process.exit(1);
	}

	const result = await writeRes.json();
	console.log("Written to PDS:", result);
	console.log(
		"Watch alice's window — the update arrives via Tap, not the optimistic path.",
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
