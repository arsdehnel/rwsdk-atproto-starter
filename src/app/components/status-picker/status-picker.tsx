"use client";

import { useState } from "react";
import { useSyncedState } from "rwsdk/use-synced-state/client";
import type { StatusEntry } from "@/app/durable-objects";

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

interface StatusPickerProps {
	did: string;
	currentStatus?: string | null;
	onSuccess?: () => void;
}

export function StatusPicker({
	did,
	currentStatus,
	onSuccess,
}: StatusPickerProps) {
	const [selected, setSelected] = useState<string | null>(
		currentStatus ?? null,
	);
	const [, setStatusMap] = useSyncedState<Record<string, StatusEntry>>(
		{},
		"statusMap",
	);
	const [loading, setLoading] = useState(false);

	async function handleSelect(emoji: string) {
		setLoading(true);
		setSelected(emoji);
		setStatusMap((prev) => {
			return {
				...prev,
				[did]: {
					did,
					status: emoji,
					handle: null,
					updatedAt: new Date().toISOString(),
				},
			};
		});

		try {
			const res = await fetch("/status", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: emoji }),
			});

			if (res.status === 401) {
				// OAuth session is gone — clear the HTTP session and return to login.
				// JavaScript fetch can't trigger a cookie-clearing redirect, but a form submission can
				const form = document.createElement("form");
				form.method = "POST";
				form.action = "/oauth/logout";
				document.body.appendChild(form);
				form.submit();
				return;
			}

			if (!res.ok) throw new Error("Failed to update status");

			const savedStatus = (await res.json()) as { createdAt: string };
			setStatusMap((prev) => {
				return {
					...prev,
					[did]: {
						did,
						status: emoji,
						handle: null,
						updatedAt: savedStatus.createdAt,
					},
				};
			});

			onSuccess?.();
		} catch (err) {
			console.error("Failed to update status:", err);
			setSelected(currentStatus ?? null);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div>
			{selected && (
				<p style={{ marginBottom: "0.75rem" }}>
					Current status: <span style={{ fontSize: "1.5rem" }}>{selected}</span>
				</p>
			)}
			<p
				style={{
					marginBottom: "0.5rem",
					color: "#71717a",
					fontSize: "0.875rem",
				}}
			>
				{selected ? "Change your status:" : "Pick a status:"}
			</p>
			<div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
				{EMOJIS.map((emoji) => (
					<button
						key={emoji}
						type="button"
						onClick={() => handleSelect(emoji)}
						disabled={loading}
						style={{
							fontSize: "1.5rem",
							padding: "0.5rem",
							borderRadius: "0.5rem",
							border:
								selected === emoji
									? "2px solid #3b82f6"
									: "2px solid transparent",
							background: selected === emoji ? "#eff6ff" : "transparent",
							cursor: loading ? "not-allowed" : "pointer",
							opacity: loading ? 0.5 : 1,
						}}
					>
						{emoji}
					</button>
				))}
			</div>
		</div>
	);
}
