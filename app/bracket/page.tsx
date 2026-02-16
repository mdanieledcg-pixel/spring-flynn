import { createClient } from "@supabase/supabase-js";

type PlayerRow = {
  name: string;
  handicap_index: number | null;
};

type Team = {
  seed: number;
  players: { name: string; index: number | null }[]; // 2 players
};

function fmtIndex(n: number | null) {
  return typeof n === "number" ? n.toFixed(1) : "-";
}

function make32SeedBracket(teams: Team[]) {
  const bySeed = new Map<number, Team>();
  teams.forEach((t) => bySeed.set(t.seed, t));

  const getTeam = (seed: number): Team => {
    const t = bySeed.get(seed);
    if (t) return t;
    return {
      seed,
      players: [
        { name: "TBD", index: null },
        { name: "TBD", index: null },
      ],
    };
  };

  const r32Pairs: Array<[number, number]> = [
    [1, 32],
    [16, 17],
    [8, 25],
    [9, 24],
    [4, 29],
    [13, 20],
    [5, 28],
    [12, 21],
    [2, 31],
    [15, 18],
    [7, 26],
    [10, 23],
    [3, 30],
    [14, 19],
    [6, 27],
    [11, 22],
  ];

  const r32 = r32Pairs.map(([a, b], i) => ({
    id: `R32-${i + 1}`,
    a: getTeam(a),
    b: getTeam(b),
  }));

  const winner = (matchId: string) => ({
    seed: 0,
    players: [{ name: `Winner of ${matchId}`, index: null }, { name: "", index: null }],
  });

  const r16 = Array.from({ length: 8 }).map((_, i) => ({
    id: `R16-${i + 1}`,
    a: winner(r32[i * 2].id),
    b: winner(r32[i * 2 + 1].id),
  }));

  const qf = Array.from({ length: 4 }).map((_, i) => ({
    id: `QF-${i + 1}`,
    a: winner(r16[i * 2].id),
    b: winner(r16[i * 2 + 1].id),
  }));

  const sf = Array.from({ length: 2 }).map((_, i) => ({
    id: `SF-${i + 1}`,
    a: winner(qf[i * 2].id),
    b: winner(qf[i * 2 + 1].id),
  }));

  const final = [
    {
      id: "Final",
      a: winner(sf[0].id),
      b: winner(sf[1].id),
    },
  ];

  return { r32, r16, qf, sf, final };
}

function TeamLine({ team }: { team: Team }) {
  const isTbd = team.players[0]?.name === "TBD";
  const left = team.seed ? `#${team.seed}` : "";

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ fontWeight: 900, color: "#fff" }}>
        {left} {isTbd ? "TBD" : ""}
      </div>

      {!isTbd ? (
        <div style={{ color: "#f0f0f0", lineHeight: 1.5 }}>
          <div>
            {team.players[0].name} <span style={{ opacity: 0.9 }}>({fmtIndex(team.players[0].index)})</span>
          </div>
          <div>
            {team.players[1].name} <span style={{ opacity: 0.9 }}>({fmtIndex(team.players[1].index)})</span>
          </div>
        </div>
      ) : (
        <div style={{ color: "#e8e8e8", opacity: 0.9, lineHeight: 1.5 }}>
          <div>Player 1 (-)</div>
          <div>Player 2 (-)</div>
        </div>
      )}
    </div>
  );
}

function MatchCard({ title, a, b }: { title: string; a: Team; b: Team }) {
  const isPlaceholder = a.seed === 0 || b.seed === 0;

  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 12,
        padding: 12,
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <div style={{ fontSize: 12, letterSpacing: 0.6, opacity: 0.85, marginBottom: 10, color: "#fff" }}>
        {title}
      </div>

      {isPlaceholder ? (
        <div style={{ color: "#f0f0f0", lineHeight: 1.6 }}>
          <div style={{ fontWeight: 800 }}>{a.players[0].name}</div>
          <div style={{ opacity: 0.75, margin: "6px 0" }}>vs</div>
          <div style={{ fontWeight: 800 }}>{b.players[0].name}</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          <TeamLine team={a} />
          <div style={{ opacity: 0.7, color: "#fff", fontWeight: 800 }}>vs</div>
          <TeamLine team={b} />
        </div>
      )}
    </div>
  );
}

export default async function BracketPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Only known team today:
  const knownNames = ["Bobby Taylor", "Dan Bevis"];
  const { data } = await supabase
    .from("players")
    .select("name,handicap_index")
    .in("name", knownNames);

  const rows = (data ?? []) as PlayerRow[];
  const idxByName = new Map(rows.map((r) => [r.name, r.handicap_index]));

  const teams: Team[] = [
    {
      seed: 1,
      players: [
        { name: "Bobby Taylor", index: idxByName.get("Bobby Taylor") ?? null },
        { name: "Dan Bevis", index: idxByName.get("Dan Bevis") ?? null },
      ],
    },
  ];

  const bracket = make32SeedBracket(teams);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900 }}>Bracket</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <a href="/" style={{ textDecoration: "none", border: "1px solid #ddd", padding: "10px 14px", borderRadius: 10 }}>
            ← Home
          </a>
          <a href="/roster" style={{ textDecoration: "none", border: "1px solid #ddd", padding: "10px 14px", borderRadius: 10 }}>
            Roster →
          </a>
        </div>
      </div>

      <p style={{ marginTop: 10, color: "#666" }}>
        32 teams. Only Seed #1 is known right now. Remaining teams will populate after the blind draw.
      </p>

      <div
        style={{
          marginTop: 14,
          borderRadius: 14,
          overflowX: "auto",
          border: "1px solid #eee",
        }}
      >
        <div
          style={{
            minWidth: 1100,
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 14,
            padding: 14,
            background: "linear-gradient(135deg, #111, #2b2b2b)",
            color: "#fff",
          }}
        >
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 4 }}>Round of 32</div>
            {bracket.r32.map((m) => (
              <MatchCard key={m.id} title={m.id} a={m.a} b={m.b} />
            ))}
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 4 }}>Round of 16</div>
            {bracket.r16.map((m) => (
              <MatchCard key={m.id} title={m.id} a={m.a} b={m.b} />
            ))}
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 4 }}>Quarterfinals</div>
            {bracket.qf.map((m) => (
              <MatchCard key={m.id} title={m.id} a={m.a} b={m.b} />
            ))}
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 4 }}>Semifinals</div>
            {bracket.sf.map((m) => (
              <MatchCard key={m.id} title={m.id} a={m.a} b={m.b} />
            ))}
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 4 }}>Final</div>
            {bracket.final.map((m) => (
              <MatchCard key={m.id} title={m.id} a={m.a} b={m.b} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
