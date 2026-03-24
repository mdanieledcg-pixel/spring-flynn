import { createClient } from "@supabase/supabase-js";

type Player = {
  id: string;
  name: string;
  /*ghin: string | null; */
  handicap_index: number | null;
  phone_number: string | null;
};

export default async function RosterPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Roster</h1>
        <p style={{ color: "crimson" }}>Error: Missing NEXT_PUBLIC_SUPABASE_URL</p>
        <a href="/">← Back</a>
      </main>
    );
  }

  if (!key) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Roster</h1>
        <p style={{ color: "crimson" }}>Error: Missing NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
        <a href="/">← Back</a>
      </main>
    );
  }

  try {
    const supabase = createClient(url, key);

    const { data, error } = await supabase
      .from("players")
      .select("id,name,ghin,handicap_index,phone_number")
      .order("name", { ascending: true });

    if (error) {
      return (
        <main style={{ padding: 24, fontFamily: "system-ui" }}>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Roster</h1>
          <p style={{ color: "crimson" }}>Error: {error.message}</p>
          <a href="/">← Back</a>
        </main>
      );
    }

    const players = (data ?? []) as Player[];

    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Roster</h1>
        {players.length === 0 ? (
          <p>No players found.</p>
        ) : (
          <ul>
            {players.map((player) => (
              <li key={player.id}>
                {player.name}
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
