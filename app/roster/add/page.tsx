"use client";

import { useState } from "react";

export default function AddPlayerPage() {
  const [name, setName] = useState("");
  const [ghin, setGhin] = useState("");
  const [index, setIndex] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Saving...");

    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        ghin: ghin || null,
        handicap_index: index ? Number(index) : null,
        phone_number: phone || null,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setStatus(`Error: ${json.error || "Failed"}`);
      return;
    }

    setStatus("Saved! Go back to roster.");
    setName("");
    setGhin("");
    setIndex("");
    setPhone("");
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 520 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Add Player</h1>

      <form onSubmit={onSubmit} style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 10 }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          GHIN (optional)
          <input
            value={ghin}
            onChange={(e) => setGhin(e.target.value)}
            style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 10 }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Handicap Index (optional)
          <input
            value={index}
            onChange={(e) => setIndex(e.target.value)}
            inputMode="decimal"
            style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 10 }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Phone Number (optional)
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            placeholder="e.g. 555-555-1234"
            style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 10 }}
          />
        </label>

        <button
          type="submit"
          style={{ padding: "10px 14px", border: "1px solid #ddd", borderRadius: 10, cursor: "pointer" }}
        >
          Save
        </button>
      </form>

      <p style={{ marginTop: 12 }}>{status}</p>

      <div style={{ marginTop: 18 }}>
        <a href="/roster" style={{ textDecoration: "none" }}>
          ← Back to Roster
        </a>
      </div>
    </main>
  );
}
