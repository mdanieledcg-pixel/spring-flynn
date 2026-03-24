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
          <h1>Roster</h1>
          <p style={{ color: "red" }}>Error: {text}</p>
          <a href="/">← Back</a>
        </main>
      );
    }

    const players = (await res.json()) as Player[];

    const danName = "Dan Bevis";
    const filtered = players.filter((p) => p.name !== danName);
    const aPlayers = filtered.slice(0, 32);
    const bPlayers = filtered.slice(32);

    const dan = players.find((p) => p.name === danName);
    if (dan) {
      bPlayers.unshift(dan);
    }

    return (
      <main
        style={{
          padding: "32px 20px",
          fontFamily: "system-ui",
          maxWidth: 700,
          margin: "0 auto",
          color: "#111",
        }}
      >
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            marginBottom: 20,
            color: "#111",
          }}
        >
          Roster
        </h1>

        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: "#ffffff",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 80px",
              padding: "12px 16px",
              fontWeight: 700,
              backgroundColor: "#eaeaea",
              color: "#000",
              fontSize: 14,
            }}
          >
            <div>Name</div>
            <div style={{ textAlign: "right" }}>HI</div>
          </div>

          {aPlayers.map((player, index) => (
            <div
              key={player.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px",
                padding: "12px 16px",
                borderBottom: "1px solid #eee",
                fontSize: 16,
                color: "#111",
                backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9",
              }}
            >
              <div style={{ fontWeight: 500 }}>{player.name}</div>
              <div
                style={{
                  textAlign: "right",
                  fontWeight: 600,
                }}
              >
                {player.handicap_index ?? "-"}
              </div>
            </div>
          ))}

          <div
            style={{
              padding: "10px 16px",
              backgroundColor: "#ddd",
              fontWeight: 700,
              fontSize: 13,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#111",
            }}
          >
            B Players
          </div>

          {bPlayers.map((player, index) => (
            <div
              key={player.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px",
                padding: "12px 16px",
                borderBottom:
                  index === bPlayers.length - 1 ? "none" : "1px solid #eee",
                fontSize: 16,
                color: "#111",
                backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9",
              }}
            >
              <div style={{ fontWeight: 500 }}>{player.name}</div>
              <div
                style={{
                  textAlign: "right",
                  fontWeight: 600,
                }}
              >
                {player.handicap_index ?? "-"}
              </div>
            </div>
          ))}
        </div>

        <a href="/" style={{ marginTop: 16, display: "inline-block" }}>
          ← Back
        </a>
      </main>
    );
  } catch (err) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1>Roster</h1>
        <p style={{ color: "red" }}>
          Error: {err instanceof Error ? err.message : "Unknown error"}
        </p>
        <a href="/">← Back</a>
      </main>
    );
  }
}
