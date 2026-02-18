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

  async function load(signal?: AbortSignal) {
    try {
      setErr("");

      const res = await fetch("/api/groupme/messages", {
        cache: "no-store",
        signal,
        headers: { "accept": "application/json" },
      });

      // Avoid hanging / throwing if response isn't JSON
      const text = await res.text();
      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = null;
      }

      if (!res.ok) {
        setErr(json?.error || `Failed to load GroupMe messages (${res.status})`);
        return;
      }

      const list = json?.response?.messages ?? [];
      const parsed: GroupMeMsg[] = list.map((m: any) => ({
        id: String(m.id),
        name: String(m.name ?? ""),
        text: m.text ?? "",
        created_at: Number(m.created_at ?? 0),
      }));

      setMsgs(parsed);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setErr("Failed to load GroupMe messages");
    }
  }

  useEffect(() => {
    // Delay until client is fully mounted (prevents any weird hydration timing)
    let intervalId: any = null;

    const controller = new AbortController();
    const run = () => {
      // Hard timeout so it can never “hang”
      const c = new AbortController();
      const timeout = setTimeout(() => c.abort(), 8000);

      load(c.signal).finally(() => clearTimeout(timeout));
    };

    run();
    intervalId = setInterval(run, Math.max(10, refreshSeconds) * 1000);

    return () => {
      controller.abort();
      if (intervalId) clearInterval(intervalId);
    };
  }, [refreshSeconds]);

  return (
    <div style={{ marginTop: 12 }}>
      {err ? <div style={{ color: "#ffb3b3", fontWeight: 800 }}>{err}</div> : null}

      <div style={{ display: "grid", gap: 10, maxHeight: 520, overflow: "auto", paddingRight: 6 }}>
        {msgs.map((m) => (
          <div
            key={m.id}
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              borderRadius: 12,
              padding: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontWeight: 900, color: "#fff" }}>{m.name}</div>
              <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: 700 }}>
                {m.created_at ? new Date(m.created_at * 1000).toLocaleString() : ""}
              </div>
            </div>

            <div
              style={{
                marginTop: 6,
                color: "rgba(255,255,255,0.92)",
                whiteSpace: "pre-wrap",
                lineHeight: 1.4,
              }}
            >
              {m.text || ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
