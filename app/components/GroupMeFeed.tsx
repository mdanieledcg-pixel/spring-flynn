"use client";

import { useEffect, useState } from "react";

type GroupMeMsg = {
  id: string;
  name: string;
  text: string | null;
  created_at: number; // unix seconds
};

export default function GroupMeFeed({ refreshSeconds = 30 }: { refreshSeconds?: number }) {
  const [msgs, setMsgs] = useState<GroupMeMsg[]>([]);
  const [err, setErr] = useState<string>("");

  async function load() {
    setErr("");
    const res = await fetch("/api/groupme/messages", { cache: "no-store" });
    const json = await res.json();

    if (!res.ok) {
      setErr(json?.error || "Failed to load GroupMe messages");
      return;
    }

    const list = json?.response?.messages ?? [];
    const parsed: GroupMeMsg[] = list.map((m: any) => ({
      id: m.id,
      name: m.name,
      text: m.text,
      created_at: m.created_at,
    }));

    setMsgs(parsed);
  }

  useEffect(() => {
    load();
    const id = setInterval(load, refreshSeconds * 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSeconds]);

  return (
    <div style={{ marginTop: 12 }}>
      {err ? (
        <div style={{ color: "#ffb3b3", fontWeight: 800 }}>{err}</div>
      ) : null}

      <div style={{ display: "grid", gap: 10, maxHeight: 520, overflow: "auto", paddingRight: 6 }}>
        {msgs.map((m) => (
          <div
            key={m.id}
            style={{
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: 12,
              padding: 12,
              background: "rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontWeight: 900, color: "#fff" }}>{m.name}</div>
              <div style={{ opacity: 0.8, color: "#fff", fontSize: 12 }}>
                {new Date(m.created_at * 1000).toLocaleString()}
              </div>
            </div>
            <div style={{ marginTop: 6, color: "#f2f2f2", whiteSpace: "pre-wrap", lineHeight: 1.4 }}>
              {m.text || ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
