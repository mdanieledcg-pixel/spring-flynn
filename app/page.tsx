import { createClient } from "@supabase/supabase-js";

type Player = {
  id: string;
  name: string;
  handicap_index: number | null;
};

type SeededPlayer = {
  seed: number;
  name: string;
  handicap_index: number | null;
};

const TOURNAMENT = {
  blindDrawDate: "TBD",
  blindDrawLocation: "TBD",
};

const SCHEDULE = [
  { round: "Rd 1", dates: "April 1 – Apr 26", notes: ["GAP", "Easter, Apr 5", "Horrible weather"] },
  { round: "Rd 2", dates: "Apr 27 – May 10", notes: ["GAP", "Mother’s Day, May 10"] },
  { round: "QF", dates: "May 11 – June 7", notes: ["Member-Member Weekend", "MDW, May 22–25"] },
  { round: "SF", dates: "June 8 – June 28", notes: ["Juneteenth, June 19", "Fathers Day, June 21"] },
  { round: "Final", dates: "June 29 – July 19", notes: ["4th of July"] },
];

function generateSeededBracket(players: SeededPlayer[]) {
  // Standard single-elim pairing: 1vN, 2vN-1, ...
  const n = players.length;
  const pairs: Array<{ a: SeededPlayer; b: SeededPlayer | null }> = [];
  for (let i = 0; i < Math.floor(n / 2); i++) {
    pairs.push({ a: players[i], b: players[n - 1 - i] });
  }
  if (n % 2 === 1) {
    pairs.push({ a: players[Math.floor(n / 2)], b: null }); // bye
  }
  return pairs;
}

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("players")
    .select("id,name,handicap_index")
    .order("name", { ascending: true });

  const roster = (data ?? []) as Player[];

  // Seed by lowest handicap_index first (nulls go to bottom)
  const seeded: SeededPlayer[] = roster
    .slice()
    .sort((a, b) => {
      const ai = a.handicap_index;
      const bi = b.handicap_index;
      if (ai === null && bi === null) return a.name.localeCompare(b.name);
      if (ai === null) return 1;
      if (bi === null) return -1;
      if (ai !== bi) return ai - bi;
      return a.name.localeCompare(b.name);
    })
    .map((p, idx) => ({
      seed: idx + 1,
      name: p.name,
      handicap_index: p.handicap_index,
    }));

  const bracketPairs = generateSeededBracket(seeded);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 980, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 800, margin: 0 }}>Spring-Flynn</h1>
          <p style={{ marginTop: 8, color: "#555" }}>
            Blind Draw: <b>{TOURNAMENT.blindDrawDate}</b> · Location: <b>{TOURNAMENT.blindDrawLocation}</b>
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <a
            href="/roster"
            style={{
              padding: "10px 14px",
              border: "1px solid #ddd",
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            View Roster →
          </a>
        </div>
      </header>

      {/* BRACKET */}
      <section style={{ marginTop: 22, padding: 16, border: "1px solid #eee", borderRadius: 14 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Bracket</h2>
        <p style={{ marginTop: 8, color: "#555" }}>
          Auto-seeded from roster by lowest handicap index (null/blank indexes seed last).
        </p>

        {error ? (
          <p style={{ color: "crimson", marginTop: 10 }}>
            Bracket error: {error.message}
          </p>
        ) : seeded.length === 0 ? (
          <p style={{ marginTop: 10 }}>
            No players found. Add players in Supabase (or use /roster/add) and refresh.
          </p>
        ) : (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "grid", gap: 10 }}>
              {bracketPairs.map((m, i) => (
                <div
                  key={i}
                  style={{
                    padding: 12,
                    border: "1px solid #eee",
                    borderRadius: 12,
                    display: "grid",
                    gridTemplateColumns: "1fr 60px 1fr",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      #{m.a.seed} {m.a.name}
                    </div>
                    <div style={{ color: "#666", fontSize: 13 }}>
                      Index: {typeof m.a.handicap_index === "number" ? m.a.handicap_index.toFixed(1) : "-"}
                    </div>
                  </div>

                  <div style={{ textAlign: "center", color: "#777", fontWeight: 700 }}>vs</div>

                  <div>
                    {m.b ? (
                      <>
                        <div style={{ fontWeight: 700 }}>
                          #{m.b.seed} {m.b.name}
                        </div>
                        <div style={{ color: "#666", fontSize: 13 }}>
                          Index: {typeof m.b.handicap_index === "number" ? m.b.handicap_index.toFixed(1) : "-"}
                        </div>
                      </>
                    ) : (
                      <div style={{ color: "#777", fontWeight: 700 }}>BYE</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p style={{ marginTop: 10, color: "#777", fontSize: 13 }}>
              Note: This is a seeding preview based on roster. Team formation happens at the blind draw.
            </p>
          </div>
        )}
      </section>

      {/* SCHEDULE */}
      <section style={{ marginTop: 22, padding: 16, border: "1px solid #eee", borderRadius: 14 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Expected Schedule</h2>

        <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
          {SCHEDULE.map((r) => (
            <div key={r.round} style={{ padding: 12, border: "1px solid #f0f0f0", borderRadius: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 800 }}>{r.round}</div>
                <div style={{ color: "#555" }}>{r.dates}</div>
              </div>
              {r.notes?.length ? (
                <ul style={{ marginTop: 10, marginBottom: 0, color: "#555" }}>
                  {r.notes.map((n, idx) => (
                    <li key={idx}>{n}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* RULES */}
      <section style={{ marginTop: 22, padding: 16, border: "1px solid #eee", borderRadius: 14 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Flynn Rules</h2>

        <ol style={{ marginTop: 12, color: "#333", lineHeight: 1.45 }}>
          <li>Follow USGA rules.</li>
          <li>
            85% handicap allowance.
            <ul style={{ marginTop: 8 }}>
              <li>Hole handicap caps out at 1.5 strokes per hole</li>
            </ul>
          </li>
          <li>
            Teams will be determined by blind draw on a date TBD. Each team will consist of one A player and one B
            player.
            <ul style={{ marginTop: 8 }}>
              <li>The A-player field will be capped at 32 players as of the draw date.</li>
              <li>
                Defending champions may return as a predetermined team. The lowest-handicap player on that team will be
                designated as the B player.
              </li>
            </ul>
          </li>
          <li>
            Seedings will be based on combined team handicap at the time of the blind draw, with defending champions
            seeded #1.
          </li>
          <li>
            Root rule will be determined within each matchup. Players are encouraged to agree upon it prior to teeing
            off on Hole 1 to avoid disputes.
          </li>
          <li>If you post a picture of a ball out of bounds make sure there are 2 stakes</li>
          <li>$130 entry per person to be paid before tournament starts</li>
          <li>
            Match Scheduling Rules
            <ul style={{ marginTop: 8 }}>
              <li>Matches must be played within 3–4 weeks (per round schedule below). Early play encouraged.</li>
              <li>
                Commissioner may grant extensions for weather or act of God if both teams made a good faith effort.
              </li>
              <li>
                If a match isn’t played:
                <ul style={{ marginTop: 8 }}>
                  <li>
                    Good faith by both teams: Coin flip decides winner. Winner advances; no round payout. Prize money
                    rolls to next round.
                  </li>
                  <li>
                    Bad faith by one team: That team forfeits (Commissioner decision). Opponent advances; no round payout.
                    Prize money rolls forward.
                    <ul style={{ marginTop: 8 }}>
                      <li>
                        Bad faith examples: non-responsive, long unavailability, or similar situations determined by
                        Commissioner.
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ol>
      </section>

      <footer style={{ marginTop: 26, color: "#888", fontSize: 12 }}>
        Tip: Update Blind Draw date/location in <code>app/page.tsx</code> (TOURNAMENT constants).
      </footer>
    </main>
  );
}
