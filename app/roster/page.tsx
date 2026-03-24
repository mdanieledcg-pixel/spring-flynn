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
      `${url}/rest/v1/players?select=id,name,handicap_index,phone_number&order=name.asc`,
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
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Roster</h1>

        {players.length === 0 ? (
          <p>No players found.</p>
        ) : (
          <ul style={{ paddingLeft: 20 }}>
            {players.map((player) => (
              <li key={player.id} style={{ marginBottom: 8 }}>
                <strong>{player.name}</strong>
                {player.handicap_index !== null &&
                player.handicap_index !== undefined
                  ? ` — HI: ${player.handicap_index}`
                  : ""}
              </li>
            ))}
          </ul>
        )}

        <a href="/">← Back</a>
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
