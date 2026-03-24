type Player = {
  id: string;
  name: string;
  handicap_index?: number | null;
  phone_number?: string | null;
};

export default async function RosterPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  try {
    const res = await fetch(
      `${url}/rest/v1/players?select=id,name,handicap_index&order=handicap_index.asc.nullslast`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const text = await res.text();

      return (
        <main style={{ padding: 24, fontFamily: "system-ui" }}>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Roster</h1>
          <p style={{ color: "crimson" }}>Error: {text}</p>
          <a href="/">← Back</a>
        </main>
      );
    }

    const players = (await res.json()) as Player[];

    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
          Roster
        </h1>

        {/* Header Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            fontWeight: 700,
            marginBottom: 8,
            borderBottom: "2px solid #ccc",
            paddingBottom: 8,
          }}
        >
          <div>Name</div>
          <div>HI</div>
        </div>

        {/* Players */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {players.map((player) => (
            <div
              key={player.id}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
                background: "#fafafa",
              }}
            >
              <div style={{ fontWeight: 500 }}>{player.name}</div>
              <div style={{ textAlign: "right" }}>
                {player.handicap_index ?? "-"}
              </div>
            </div>
          ))}
        </div>

        <a href="/" style={{ display: "inline-block", marginTop: 20 }}>
          ← Back
        </a>
      </main>
    );
  } catch (err) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Roster</h1>
        <p style={{ color: "crimson" }}>
          Error: {err instanceof Error ? err.message : "Unknown error"}
        </p>
        <a href="/">← Back</a>
      </main>
    );
  }
}
