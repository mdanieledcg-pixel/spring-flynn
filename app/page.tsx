import Countdown from "./components/Countdown";
import GroupMeFeed from "./components/GroupMeFeed";


export default function Home() {
  const TOURNAMENT = {
    blindDrawDate: "March 31, 2026",
    blindDrawTime: "8:00 PM",
    blindDrawLocation: "Franzones Pizzeria & Sportsbar",
  };

  const SCHEDULE = [
    { round: "Round 1", dates: "April 1 – Apr 26", notes: ["GAP", "Easter, Apr 5", "Horrible weather"] },
    { round: "Round 2", dates: "Apr 27 – May 10", notes: ["GAP", "Mother’s Day, May 10"] },
    { round: "Quarterfinals", dates: "May 11 – June 7", notes: ["Member-Member Weekend", "MDW, May 22–25"] },
    { round: "Semifinals", dates: "June 8 – June 28", notes: ["Juneteenth, June 19", "Fathers Day, June 21"] },
    { round: "Championship", dates: "June 29 – July 19", notes: ["4th of July"] },
  ];

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 980, margin: "0 auto" }}>
  
  <header style={{ marginBottom: 24 }}>

  <h1 style={{
    fontSize: 38,
    fontWeight: 900,
    marginBottom: 10
  }}>
    2026 Spring Flynn
  </h1>

  {/* BLIND DRAW FEATURE CARD */}
  <div
    style={{
      background: "linear-gradient(135deg, #111, #2b2b2b)",
      color: "white",
      padding: 20,
      borderRadius: 14,
      boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
      display: "flex",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 14,
      alignItems: "center"
    }}
  >
    <div>
      <div style={{
        fontSize: 13,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        opacity: 0.8
      }}>
        Blind Draw
      </div>

      <div style={{
        fontSize: 26,
        fontWeight: 800,
        marginTop: 4
      }}>
        March 31, 2026 · 8:00 PM
      </div>

      <div style={{
        fontSize: 16,
        opacity: 0.9,
        marginTop: 4
      }}>
        Franzones Pizzeria & Sportsbar
      </div>
      <Countdown targetIso="2026-03-31T20:00:00-04:00" />
    </div>

   <div style={{ display: "grid", gap: 10 }}>
  <a
    href="/roster"
    style={{
      background: "white",
      color: "#111",
      padding: "12px 16px",
      borderRadius: 10,
      textDecoration: "none",
      fontWeight: 800,
      textAlign: "center",
    }}
  >
    View Roster →
  </a>

  <a
    href="/bracket"
    style={{
      background: "rgba(255,255,255,0.14)",
      color: "white",
      padding: "12px 16px",
      borderRadius: 10,
      textDecoration: "none",
      fontWeight: 800,
      textAlign: "center",
      border: "1px solid rgba(255,255,255,0.22)",
    }}
  >
    View Bracket →
  </a>
</div>

  </div>

</header>


{/* RULES + GROUPME */}
<style>{`
  /* MOBILE DEFAULT: GroupMe on top, Rules below */
  .rules-layout {
    display: grid;
    grid-template-areas:
      "groupme"
      "rules";
    grid-template-columns: 1fr;
    gap: 20px;
    align-items: start;
    margin-top: 22px;
  }

  /* DESKTOP: Rules left, GroupMe right */
  @media (min-width: 980px) {
    .rules-layout {
      grid-template-areas: "rules groupme";
      grid-template-columns: minmax(0, 1fr) 360px;
      gap: 24px;
    }
  }

  /* Mobile: keep GroupMe smaller */
  .groupme-compact {
    max-height: 320px;
    overflow: hidden;
  }

  @media (min-width: 980px) {
    .groupme-compact {
      max-height: none;
      overflow: visible;
    }
  }
`}</style>

<section className="rules-layout">
  {/* GROUPME (TOP on mobile, RIGHT on desktop) */}
  <aside style={{ gridArea: "groupme", alignSelf: "start" }}>
    {/* If you want sticky on desktop later, we can add it after this compiles */}
    <div
      className="groupme-compact"
      style={{
        border: "1px solid #eee",
        borderRadius: 14,
        padding: 18,
      }}
    >
      <h3 style={{ marginTop: 0, fontSize: 20, fontWeight: 900 }}>GroupMe Live Feed</h3>

      <div style={{ marginTop: 8 }}>
        <GroupMeFeed refreshSeconds={30} />
      </div>

      <a
        href="PASTE_GROUPME_LINK_HERE"
        target="_blank"
        style={{
          display: "block",
          marginTop: 14,
          border: "1px solid #ddd",
          padding: "12px 14px",
          borderRadius: 10,
          textDecoration: "none",
          fontWeight: 900,
          textAlign: "center",
        }}
      >
        Open GroupMe →
      </a>
    </div>
  </aside>

  {/* RULES */}
  <div
    style={{
      padding: 20,
      border: "1px solid #eee",
      borderRadius: 14,
      minWidth: 0,
      gridArea: "rules",
    }}
  >
    <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>Flynn Rules</h2>

    <div style={{ marginTop: 16, lineHeight: 1.7, fontSize: 16 }}>
      <div><b>1</b>&nbsp;&nbsp;Follow USGA rules.</div>

      <div style={{ marginTop: 10 }}><b>2</b>&nbsp;&nbsp;85% handicap allowance.</div>
      <div style={{ paddingLeft: 28 }}><b>2.1</b>&nbsp;&nbsp;Hole handicap caps out at 1.5 strokes per hole</div>

      <div style={{ marginTop: 10 }}>
        <b>3</b>&nbsp;&nbsp;Teams will be determined by blind draw on a date TBD. Each team will consist of one A player and one B player.
      </div>
      <div style={{ paddingLeft: 28 }}><b>3.1</b>&nbsp;&nbsp;The A-player field will be capped at 32 players as of the draw date.</div>
      <div style={{ paddingLeft: 28 }}><b>3.2</b>&nbsp;&nbsp;Defending champions may return as a predetermined team. The lowest-handicap player on that team will be designated as the B player.</div>

      <div style={{ marginTop: 10 }}>
        <b>4</b>&nbsp;&nbsp;Seedings will be based on combined team handicap at the time of the blind draw, with defending champions seeded #1.
      </div>

      <div style={{ marginTop: 10 }}>
        <b>5</b>&nbsp;&nbsp;Root rule will be determined within each matchup. Players are encouraged to agree upon it prior to teeing off on Hole 1 to avoid disputes.
      </div>

      <div style={{ marginTop: 10 }}>
        <b>6</b>&nbsp;&nbsp;If you post a picture of a ball out of bounds make sure there are 2 stakes
      </div>

      <div style={{ marginTop: 10 }}>
        <b>7</b>&nbsp;&nbsp;$130 entry per person to be paid before tournament starts
      </div>

      <div style={{ marginTop: 10 }}><b>8</b>&nbsp;&nbsp;Match Scheduling Rules</div>
      <div style={{ paddingLeft: 28 }}><b>8.1</b>&nbsp;&nbsp;Matches must be played within 3–4 weeks (per round schedule below). Early play encouraged.</div>
      <div style={{ paddingLeft: 28 }}><b>8.2</b>&nbsp;&nbsp;Commissioner may grant extensions for weather or act of God if both teams made a good faith effort.</div>
      <div style={{ paddingLeft: 28 }}><b>8.3</b>&nbsp;&nbsp;If a match isn’t played:</div>
      <div style={{ paddingLeft: 48 }}><b>8.4</b>&nbsp;&nbsp;Good faith by both teams: Coin flip decides winner. Winner advances; no round payout. Prize money rolls to next round.</div>
      <div style={{ paddingLeft: 48 }}><b>8.5</b>&nbsp;&nbsp;Bad faith by one team: That team forfeits (Commissioner decision). Opponent advances; no round payout. Prize money rolls forward.</div>
      <div style={{ paddingLeft: 48 }}><b>8.6</b>&nbsp;&nbsp;Bad faith examples: non-responsive, long unavailability, or similar situations determined by Commissioner.</div>
    </div>
  </div>
</section>



{/* EXPECTED SCHEDULE */}
<section
  style={{
    marginTop: 24,
    padding: 22,
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 14
  }}
>
  <h2
    style={{
      margin: 0,
      fontSize: 28,
      fontWeight: 900,
      color: "#f5f5f5"
    }}
  >
    Expected Schedule
  </h2>

  <div style={{ marginTop: 20, display: "grid", gap: 18 }}>
    {SCHEDULE.map((r) => (
      <div
        key={r.round}
        style={{
          padding: 20,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.03)"
        }}
      >
        {/* Round Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#ffffff"
            }}
          >
            {r.round}
          </div>

          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "#ffffff"
            }}
          >
            {r.dates}
          </div>
        </div>

        {/* Notable Dates */}
        {r.notes?.length ? (
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#dcdcdc",
                marginBottom: 8,
                letterSpacing: 0.4
              }}
            >
              Notable Dates
            </div>

            <ul
              style={{
                margin: 0,
                paddingLeft: 20,
                lineHeight: 1.8,
                fontSize: 16,
                color: "#e8e8e8"
              }}
            >
              {r.notes.map((n, idx) => (
                <li key={idx}>{n}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    ))}
  </div>
</section>


    </main>
  );
}
