import { createClient } from "@supabase/supabase-js";

type Player = {
  id: string;
  name: string;
  ghin: string | null;
  handicap_index: number | null;
  phone_number: string | null;
};

export default async function RosterPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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

      <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
        <a href="/roster/add" style={{ textDecoration: "none" }}>➕ Add Player</a>
        <a href="/" style={{ textDecoration: "none" }}>← Home</a>
      </div>

      <table style={{ marginTop: 16, width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Name</th>
            <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>GHIN</th>
            <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Index</th>
            <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Phone</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <tr key={p.id}>
              <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{p.name}</td>
              <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{p.ghin ?? "-"}</td>
              <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>
                {typeof p.handicap_index === "number" ? p.handicap_index.toFixed(1) : "-"}
              </td>
              <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{p.phone_number ?? "-"}</td>
            </tr>
          ))}
          {players.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: 10 }}>No players yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
