import { createClient } from "@supabase/supabase-js";
import { PAIRINGS } from "../lib/pairings";

type PlayerRow = {
  name: string;
  handicap_index: number | null;
};

type Team = {
  seed: number;
  name: string;
  combinedHandicap: number | null;
};

type Match = {
  id: string;
  a: Team;
  b: Team;
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
      name: "TBD",
      combinedHandicap: null,
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

  const r32: Match[] = r32Pairs.map(([a, b], i) => ({
    id: `R32-${i + 1}`,
    a: getTeam(a),
    b: getTeam(b),
  }));

  const winner = (matchId: string): Team => ({
    seed: 0,
    name: `Winner of ${matchId}`,
    combinedHandicap: null,
  });

  const r16: Match[] = Array.from({ length: 8 }).map((_, i) => ({
    id: `R16-${i + 1}`,
    a: winner(r32[i * 2].id),
    b: winner(r32[i * 2 + 1].id),
  }));

  const qf: Match[] = Array.from({ length: 4 }).map((_, i) => ({
    id: `QF-${i + 1}`,
    a: winner(r16[i * 2].id),
    b: winner(r16[i * 2 + 1].id),
  }));

  const sf: Match[] = Array.from({ length: 2 }).map((_, i) => ({
    id: `SF-${i + 1}`,
    a: winner(qf[i * 2].id),
    b: winner(qf[i * 2 + 1].id),
  }));

  const final: Match[] = [
    {
      id: "Final",
      a: winner(sf[0].id),
      b: winner(sf[1].id),
    },
  ];

  return { r32, r16, qf, sf, final };
}

function TeamLine({ team }: { team: Team }) {
  const isPlaceholder = team.seed === 0 || team.name === "TBD";

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ fontWeight: 900, color: "#fff", fontSize: 13 }}>
        {team.seed ? `#${team.seed}` : ""}
      </div>

      <div style={{ color: "#f4f4f4", lineHeight: 1.35 }}>
        {isPlaceholder ? (
          <div style={{ fontWeight: 800 }}>{team.name}</div>
        ) : (
          <div style={{ fontWeight: 800 }}>
            {team.name} <span style={{ opacity: 0.9 }}>({fmtIndex(team.combinedHandicap)})</span>
          </div>
        )}
      </div>
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
        background: "rgba(255,255,255,0.04)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: 0.7,
          opacity: 0.82,
          marginBottom: 10,
          color: "#fff",
          fontWeight: 800,
        }}
      >
        {title}
      </div>

      {isPlaceholder ? (
        <div style={{ color: "#f0f0f0", lineHeight: 1.6 }}>
          <div style={{ fontWeight: 800 }}>{a.name}</div>
          <div style={{ opacity: 0.7, margin: "6px 0", fontWeight: 700 }}>vs</div>
          <div style={{ fontWeight: 800 }}>{b.name}</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          <TeamLine team={a} />
          <div style={{ opacity: 0.68, color: "#fff", fontWeight: 800 }}>vs</div>
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

  const playerNames = PAIRINGS.flatMap((p) => [p.playerA, p.playerB]);

  const { data, error } = await supabase
    .from("players")
    .select("name,handicap_index")
    .in("name", playerNames);

  if (error) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1>Bracket</h1>
        <p style={{ color: "red" }}>Error: {error.message}</p>
        <a href="/">← Back</a>
      </main>
    );
  }

  const rows = (data ?? []) as PlayerRow[];
  const idxByName = new Map(rows.map((r) => [r.name, r.handicap_index]));

  const teams: Team[] = PAIRINGS.map((pairing) => {
    const aIndex = idxByName.get(pairing.playerA) ?? null;
    const bIndex = idxByName.get(pairing.playerB) ?? null;

    return {
      seed: pairing.seed,
      name: `${pairing.playerA} / ${pairing.playerB}`,
      combinedHandicap:
        typeof aIndex === "number" && typeof bIndex === "number"
          ? aIndex + bIndex
          : null,
    };
  });

  const bracket = make32SeedBracket(teams);

  return (
    <main
      style={{
        padding: 24,
        fontFamily: "system-ui",
        maxWidth: 1280,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900 }}>Spring Flynn Bracket</h1>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href="/"
            style={{
              textDecoration: "none",
              border: "1px solid #ddd",
              padding: "10px 14px",
              borderRadius: 10,
              color: "#111",
              background: "#fff",
              fontWeight: 700,
            }}
          >
            ← Home
          </a>

          <a
            href="/roster"
            style={{
              textDecoration: "none",
              border: "1px solid #ddd",
              padding: "10px 14px",
              borderRadius: 10,
              color: "#111",
              background: "#fff",
              fontWeight: 700,
            }}
          >
            Roster →
          </a>
        </div>
      </div>

      <p style={{ marginTop: 10, color: "#666", fontWeight: 500 }}>
        32 seeded teams with combined team handicap from A player + B player.
      </p>

      <div
        style={{
          marginTop: 14,
          borderRadius: 14,
          overflowX: "auto",
          border: "1px solid #e7e1d7",
          background: "#111",
        }}
      >
        <div
          style={{
            minWidth: 1200,
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(220px, 1fr))",
            gap: 14,
            padding: 14,
            background: "linear-gradient(135deg, #111, #2b2b2b)",
            color: "#fff",
          }}
        >
          <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 4 }}>Round of 32</div>
            {bracket.r32.map((m) => (
              <MatchCard key={m.id} title={m.id} a={m.a} b={m.b} />
            ))}
          </div>

          <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 4 }}>Round of 16</div>
            {bracket.r16.map((m) => (
              <MatchCard key={m.id} title={m.id} a={m.a} b={m.b} />
            ))}
          </div>

          <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 4 }}>Quarterfinals</div>
            {bracket.qf.map((m) => (
              <MatchCard key={m.id} title={m.id} a={m.a} b={m.b} />
            ))}
          </div>

          <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 4 }}>Semifinals</div>
            {bracket.sf.map((m) => (
              <MatchCard key={m.id} title={m.id} a={m.a} b={m.b} />
            ))}
          </div>

          <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
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
