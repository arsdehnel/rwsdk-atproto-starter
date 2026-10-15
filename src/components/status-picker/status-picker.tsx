"use client";

import { useState } from "react";

const EMOJIS = [
  "👍", "👎", "💙", "🔥", "😆",
  "😢", "🤔", "😴", "🎉", "🤩",
  "😭", "🥳", "😤", "💀", "✨",
  "👀", "🙏", "📚", "💻", "🍕",
];

interface StatusPickerProps {
  currentStatus?: string | null;
  onSuccess?: () => void;
}

export function StatusPicker({ currentStatus, onSuccess }: StatusPickerProps) {
  const [selected, setSelected] = useState<string | null>(currentStatus ?? null);
  const [loading, setLoading] = useState(false);

  async function handleSelect(emoji: string) {
    setLoading(true);
    setSelected(emoji);

    try {
      const res = await fetch("/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: emoji }),
      });

      if (res.status === 401) {
        // OAuth session is gone — clear the HTTP session and return to login.
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "/oauth/logout";
        document.body.appendChild(form);
        form.submit();
        return;
      }

      if (!res.ok) throw new Error("Failed to update status");
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
      <p style={{ marginBottom: "0.5rem", color: "#71717a", fontSize: "0.875rem" }}>
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
              border: selected === emoji ? "2px solid #3b82f6" : "2px solid transparent",
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
