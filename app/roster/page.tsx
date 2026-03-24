type Player = {
  id: string;
  name: string;
  handicap_index?: number | null;
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
      <main
        style={{
          padding: "32px 20px",
          fontFamily: "system-ui",
          maxWidth: 720,
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            marginBottom: 20,
          }}
        >
          Roster
        </h1>

        <div
          style={{
            border: "1px solid #d9d9d9",
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: "#fff",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 90px",
              padding: "12px 16px",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "0.02em",
              backgroundColor: "#f5f5f5",
              borderBottom: "1px solid #d9d9d9",
            }}
          >
            <div>Name</div>
            <div style={{ textAlign: "right" }}>HI</div>
          </div>

          {players.map((player, index) => (
            <div
              key={player.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 90px",
                padding: "12px 16px",
                borderBottom:
                  index === players.length - 1 ? "none" : "1px solid #ececec",
                fontSize: 16,
                alignItems: "center",
              }}
            >
              <div>{player.name}</div>
              <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {player.handicap_index ?? "-"}
              </div>
            </div>
          ))}
        </div>

        <a
          href="/"
          style={{
            display: "inline-block",
            marginTop: 18,
            textDecoration: "none",
          }}
        >
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
