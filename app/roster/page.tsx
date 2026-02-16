type Player = {
  name: string;
  ghin?: string;
  index?: number;
};

const players: Player[] = [
  { name: "Player One", ghin: "1234567", index: 8.2 },
  { name: "Player Two", ghin: "2345678", index: 12.4 },
];

export default function RosterPage() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Roster</h1>

      <table
        style={{
          marginTop: 20,
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: 10 }}>Name</th>
            <th style={{ textAlign: "left", padding: 10 }}>GHIN</th>
            <th style={{ textAlign: "left", padding: 10 }}>Index</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <tr key={p.name}>
              <td style={{ padding: 10 }}>{p.name}</td>
              <td style={{ padding: 10 }}>{p.ghin}</td>
              <td style={{ padding: 10 }}>{p.index}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 20 }}>
        <a href="/">← Back Home</a>
      </div>
    </main>
  );
}
