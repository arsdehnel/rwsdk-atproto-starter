"use client";

import { useState } from "react";
import styles from "./login-form.module.css";

export function LoginForm() {
	const [handle, setHandle] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);

		const res = await fetch("/oauth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ handle }),
		});

		const data = (await res.json()) as { redirectUrl?: string; error?: string };
		if (data.redirectUrl) {
			window.location.href = data.redirectUrl;
		} else {
			setError(data.error ?? "Login failed. Check your handle and try again.");
			setLoading(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className={styles.form}>
			<div className={styles.inputRow}>
				<input
					type="text"
					value={handle}
					onChange={(e) => setHandle(e.target.value)}
					placeholder="your.bsky.social"
					disabled={loading}
					className={styles.input}
					aria-label="Bluesky handle"
				/>
				<button
					type="submit"
					disabled={loading || !handle.trim()}
					className={styles.button}
				>
					{loading ? "Redirecting…" : "Sign in with Bluesky"}
				</button>
			</div>
			{error && <p className={styles.error}>{error}</p>}
		</form>
	);
}
