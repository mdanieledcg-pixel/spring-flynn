import { createClient } from "@supabase/supabase-js";
import { PAIRINGS } from "../lib/pairings";

type PlayerRow = {
  name: string;
  handicap_index: number | null;
};

type Team = {
  seed: number;
  playerA: string;
  playerB: string;
};

type Match = {
  id: string;
  a: Team;
  b: Team;
  aScore?: string | number | null;
bScore?: string | number | null;
  winnerSeed?: number | null;
};

function make32SeedBracket(teams: Team[]) {
  const bySeed = new Map<number, Team>();
  teams.forEach((t) => bySeed.set(t.seed, t));

  const getTeam = (seed: number): Team => {
    const t = bySeed.get(seed);
    if (t) return t;

    return {
      seed,
      playerA: "TBD",
      playerB: "",
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

  const r32: Match[] = r32Pairs.map(([a, b], i) => {
  const matchNumber = i + 1;
    
    
  // Pasternack / Weychert win 4 and 3
  if (matchNumber === 6) {
    return {
      id: `R32-${matchNumber}`,
      a: getTeam(a),
      b: getTeam(b),
      aScore: "4 and 3",
      bScore: null,
      winnerSeed: 13,
    };
  }
    
  // Kingkiner / McHale win 1 Up
  if (matchNumber === 11) {
    return {
      id: `R32-${matchNumber}`,
      a: getTeam(a),
      b: getTeam(b),
      aScore: "1 Up",
      bScore: null,
      winnerSeed: 7,
    };
  }

  
    
    // Dolan / Davis win 4 and 3
  if (matchNumber === 7) {
    return {
      id: `R32-${matchNumber}`,
      a: getTeam(a),
      b: getTeam(b),
      aScore: null,
      bScore: "4 and 3",
      winnerSeed: 28,
    };
  }

  // Murray / Daniele win 1 Up
  if (matchNumber === 8) {
    return {
      id: `R32-${matchNumber}`,
      a: getTeam(a),
      b: getTeam(b),
      aScore: "1 Up",
      bScore: null,
      winnerSeed: 12,
    };
  }
    
  // Rosato / Sessa win 1 Up
  if (matchNumber === 9) {
    return {
      id: `R32-${matchNumber}`,
      a: getTeam(a),
      b: getTeam(b),
      aScore: "1 Up",
      bScore: null,
      winnerSeed: 2,
    };
  }
    
  // Morse / Sheahan win first matchup 1 Up
  if (matchNumber === 15) {
    return {
      id: `R32-${matchNumber}`,
      a: getTeam(a),
      b: getTeam(b),
      aScore: "1 Up",
      bScore: null,
      winnerSeed: 6,
    };
  }

  return {
    id: `R32-${matchNumber}`,
    a: getTeam(a),
    b: getTeam(b),
    aScore: null,
    bScore: null,
    winnerSeed: null,
  };
});

const getMatchWinner = (match: Match): Team => {
  if (typeof match.winnerSeed === "number") {
    if (match.a.seed === match.winnerSeed) return match.a;
    if (match.b.seed === match.winnerSeed) return match.b;
  }

  return {
    seed: 0,
    playerA: `Winner of ${match.id}`,
    playerB: "",
  };
};

 const r16: Match[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `R16-${i + 1}`,
  a: getMatchWinner(r32[i * 2]),
  b: getMatchWinner(r32[i * 2 + 1]),
  aScore: null,
  bScore: null,
  winnerSeed: null,
}));

const qf: Match[] = Array.from({ length: 4 }).map((_, i) => ({
  id: `QF-${i + 1}`,
  a: getMatchWinner(r16[i * 2]),
  b: getMatchWinner(r16[i * 2 + 1]),
  aScore: null,
  bScore: null,
  winnerSeed: null,
}));

const sf: Match[] = Array.from({ length: 2 }).map((_, i) => ({
  id: `SF-${i + 1}`,
  a: getMatchWinner(qf[i * 2]),
  b: getMatchWinner(qf[i * 2 + 1]),
  aScore: null,
  bScore: null,
  winnerSeed: null,
}));

const final: Match[] = [
  {
    id: "FINAL",
    a: getMatchWinner(sf[0]),
    b: getMatchWinner(sf[1]),
    aScore: null,
    bScore: null,
    winnerSeed: null,
  },
];

  return { r32, r16, qf, sf, final };
}

function TeamRow({
  team,
  bold = false,
  score = null,
}: {
  team: Team;
  bold?: boolean;
  score?: string | number | null;
}) {
  const isPlaceholder = team.seed === 0 || team.playerA === "TBD";

  return (
    <div className={`teamRow ${bold ? "winnerLike" : ""}`}>
      <div className="teamSeed">{team.seed ? team.seed : ""}</div>

      <div className={`teamNames ${isPlaceholder ? "placeholder" : ""}`}>
        <div className="playerLine">{team.playerA || "\u00A0"}</div>
        {team.playerB ? <div className="playerLine">{team.playerB}</div> : <div className="playerLine emptyLine">\u00A0</div>}
      </div>

      {score !== null && score !== undefined ? <div className="teamScore">{score}</div> : null}    </div>
  );
}

function MatchCard({
  match,
  compact = false,
}: {
  match: Match;
  compact?: boolean;
}) {
  const isPlaceholder = match.a.seed === 0 || match.b.seed === 0;

  const showScores =
  (match.aScore !== null && match.aScore !== undefined) ||
  (match.bScore !== null && match.bScore !== undefined)
    ? typeof match.winnerSeed === "number"
    : false;

  return (
    <div className={`matchCard ${compact ? "compact" : ""}`}>
      {showScores && (
        <div className="matchHeader">
          <span>Final</span>
        </div>
      )}

      <div className={`matchBody ${showScores ? "" : "noHeader"}`}>
        {isPlaceholder ? (
          <>
            <TeamRow team={match.a} bold score={showScores ? match.aScore : null} />
            <TeamRow team={match.b} score={showScores ? match.bScore : null} />
          </>
        ) : (
          <>
            <TeamRow
              team={match.a}
              bold={
                typeof match.winnerSeed === "number"
                  ? match.winnerSeed === match.a.seed
                  : false
              }
              score={showScores ? match.aScore : null}
            />
            <TeamRow
              team={match.b}
              bold={
                typeof match.winnerSeed === "number"
                  ? match.winnerSeed === match.b.seed
                  : false
              }
              score={showScores ? match.bScore : null}
            />
          </>
        )}
      </div>
    </div>
  );
}

function Connector({
  side,
  variant = "short",
}: {
  side: "left" | "right";
  variant?: "short" | "medium" | "long";
}) {
  return <div className={`connector ${side} ${variant}`} />;
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
  const byName = new Map(rows.map((r) => [r.name, r]));

  const teams: Team[] = PAIRINGS.map((pairing) => {
    const aExists = byName.get(pairing.playerA);
    const bExists = byName.get(pairing.playerB);

    return {
      seed: pairing.seed,
      playerA: aExists ? pairing.playerA : pairing.playerA,
      playerB: bExists ? pairing.playerB : pairing.playerB,
    };
  });

  const bracket = make32SeedBracket(teams);

  const leftR32 = bracket.r32.slice(0, 8);
  const rightR32 = bracket.r32.slice(8);

  const leftR16 = bracket.r16.slice(0, 4);
  const rightR16 = bracket.r16.slice(4);

  const leftQF = bracket.qf.slice(0, 2);
  const rightQF = bracket.qf.slice(2);

  const leftSF = bracket.sf.slice(0, 1);
  const rightSF = bracket.sf.slice(1);

  return (
    <main className="page">
      <div className="topBar">
        <h1>Spring Flynn Bracket</h1>

        <div className="navButtons">
          <a href="/">← Home</a>
          <a href="/roster">Roster →</a>
        </div>
      </div>

      <p className="subText">32 seeded teams.</p>

      <div className="boardWrap">
        <div className="board">
          <div className="regionTitle leftTitle">LEFT</div>
          <div className="regionTitle rightTitle">RIGHT</div>

          <div className="leftSide">
            <div className="round round32">
              {leftR32.map((m) => (
                <div key={m.id} className="cardSlot">
                  <MatchCard match={m} />
                  <Connector side="left" variant="short" />
                </div>
              ))}
            </div>

            <div className="round round16">
              {leftR16.map((m) => (
                <div key={m.id} className="cardSlot offset16">
                  <MatchCard match={m} />
                  <Connector side="left" variant="medium" />
                </div>
              ))}
            </div>

            <div className="round round8">
              {leftQF.map((m) => (
                <div key={m.id} className="cardSlot offset8">
                  <MatchCard match={m} />
                  <Connector side="left" variant="long" />
                </div>
              ))}
            </div>

            <div className="round round4">
              {leftSF.map((m) => (
                <div key={m.id} className="cardSlot offset4">
                  <MatchCard match={m} compact />
                  <Connector side="left" variant="long" />
                </div>
              ))}
            </div>
          </div>

          <div className="centerColumn">
            <div className="finalSlot">
              <div className="finalLabel">CHAMPIONSHIP</div>
              <MatchCard match={bracket.final[0]} compact />
            </div>
          </div>

          <div className="rightSide">
            <div className="round round4">
              {rightSF.map((m) => (
                <div key={m.id} className="cardSlot offset4 rightCard">
                  <Connector side="right" variant="long" />
                  <MatchCard match={m} compact />
                </div>
              ))}
            </div>

            <div className="round round8">
              {rightQF.map((m) => (
                <div key={m.id} className="cardSlot offset8 rightCard">
                  <Connector side="right" variant="long" />
                  <MatchCard match={m} />
                </div>
              ))}
            </div>

            <div className="round round16">
              {rightR16.map((m) => (
                <div key={m.id} className="cardSlot offset16 rightCard">
                  <Connector side="right" variant="medium" />
                  <MatchCard match={m} />
                </div>
              ))}
            </div>

            <div className="round round32">
              {rightR32.map((m) => (
                <div key={m.id} className="cardSlot rightCard">
                  <Connector side="right" variant="short" />
                  <MatchCard match={m} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .page {
          padding: 24px;
          font-family: system-ui;
          max-width: 1760px;
          margin: 0 auto;
          color: #111;
          background: #efefef;
          min-height: 100vh;
        }

        .topBar {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .topBar h1 {
          margin: 0;
          font-size: 34px;
          font-weight: 900;
        }

        .navButtons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .navButtons a {
          text-decoration: none;
          border: 1px solid #d7d7d7;
          padding: 10px 14px;
          border-radius: 10px;
          color: #111;
          background: #fff;
          font-weight: 700;
        }

        .subText {
          margin: 10px 0 18px;
          color: #666;
          font-weight: 500;
        }

        .boardWrap {
          overflow-x: auto;
          border-radius: 14px;
          border: 1px solid #ddd;
          background: #ececec;
        }

        .board {
          min-width: 1640px;
          padding: 28px 28px 36px;
          display: grid;
          grid-template-columns: 1fr 280px 1fr;
          gap: 14px;
          position: relative;
          background: #ececec;
        }

        .regionTitle {
          position: absolute;
          top: 10px;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: 0.02em;
          color: #222;
        }

        .leftTitle {
          left: 28px;
        }

        .rightTitle {
          right: 28px;
        }

        .leftSide,
        .rightSide {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 20px;
          align-items: start;
          margin-top: 44px;
        }

        .round {
          display: flex;
          flex-direction: column;
        }

        .round32 {
          padding-top: 0;
        }

        .round16 {
          padding-top: 96px;
        }

        .round8 {
          padding-top: 192px;
        }

        .round4 {
          padding-top: 384px;
        }

        .cardSlot {
          position: relative;
          margin-bottom: 18px;
        }

        .offset16 {
          margin-bottom: 116px;
        }

        .offset8 {
          margin-bottom: 248px;
        }

        .offset4 {
          margin-bottom: 0;
        }

        .rightCard {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 12px;
          flex-shrink: 0;
        }

        .matchCard {
          width: 260px;
          min-width: 260px;
          max-width: 260px;
          background: #f7f7f7;
          border: 1px solid #d2d2d2;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .matchCard.compact {
          width: 260px;
          min-width: 260px;
          max-width: 260px;
        }

        .matchHeader {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          padding: 7px 10px;
          font-size: 11px;
          font-weight: 800;
          color: #3a3a3a;
          background: #fafafa;
          min-height: 30px;
        }

        .matchBody {
          border-top: 1px solid #ececec;
        }

        .matchBody.noHeader {
          border-top: none;
        }

       .teamRow {
          position: relative;
          display: grid;
          grid-template-columns: 22px minmax(0, 1fr);
          gap: 6px;
          align-items: start;
          padding: 8px 56px 8px 10px;
          background: #f3f3f3;
        }

        .winnerLike {
          color: #222;
          font-weight: 900;
        }

        .teamSeed {
          font-size: 13px;
          color: #666;
          font-weight: 800;
          text-align: left;
          justify-self: start;
        }

        .teamNames {
          min-width: 0;
        }

        .playerLine {
          font-size: 14px;
          font-weight: 900;
          color: #222;
          line-height: 1.15;
          text-align: left;
          white-space: normal;
        }

        .playerLine + .playerLine {
          margin-top: 2px;
        }

        .teamNames.placeholder .playerLine {
          color: #666;
          font-weight: 700;
        }

        .emptyLine {
          visibility: hidden;
        }

       .teamScore {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
          font-weight: 800;
          color: #444;
          white-space: nowrap;
        }        

        .connector {
          position: absolute;
          top: 50%;
          width: 20px;
          height: 2px;
          background: #c9c9c9;
          transform: translateY(-50%);
        }

        .connector.left {
          right: -18px;
        }

        .connector.right {
          left: -18px;
          position: relative;
          top: auto;
          transform: none;
        }

        .connector.short {
          width: 18px;
        }

        .connector.medium {
          width: 22px;
        }

        .connector.long {
          width: 26px;
        }

        .centerColumn {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 44px;
        }

        .finalSlot {
          width: 100%;
          max-width: 100%;
        }

        .finalLabel {
          text-align: center;
          font-size: 14px;
          font-weight: 900;
          margin-bottom: 12px;
          color: #222;
          letter-spacing: 0.04em;
        }

    @media (max-width: 1100px) {
  .page {
    padding: 14px;
  }

  .topBar h1 {
    font-size: 26px;
  }

  .subText {
    margin: 8px 0 14px;
    font-size: 14px;
  }

  .boardWrap {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    border-radius: 14px;
  }

  .board {
    min-width: 1580px;
    padding: 22px 20px 28px;
    display: grid;
    grid-template-columns: 1fr 280px 1fr;
    gap: 14px;
  }

  .leftSide,
  .rightSide {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 18px;
    align-items: start;
    margin-top: 44px;
  }

  .centerColumn {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 44px;
  }

  .regionTitle {
    position: absolute;
    top: 10px;
    font-size: 18px;
  }

  .leftTitle {
    left: 20px;
  }

  .rightTitle {
    right: 20px;
  }

  .rightCard {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    flex-shrink: 0;
  }

  .matchCard,
  .matchCard.compact {
    width: 260px;
    min-width: 260px;
    max-width: 260px;
  }

  .teamRow {
    grid-template-columns: 24px minmax(0, 1fr);
    gap: 8px;
    align-items: center;
    padding: 9px 10px 9px 10px;
  }

  .teamSeed {
    font-size: 11px;
    text-align: left;
    justify-self: start;
  }

  .playerLine {
    font-size: 12px;
    line-height: 1.1;
    white-space: normal;
    overflow: hidden;
    text-overflow: clip;
  }
}
      `}</style>
    </main>
  );
}
