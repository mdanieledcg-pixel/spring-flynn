import { createClient } from "@supabase/supabase-js";
import { PAIRINGS } from "../lib/pairings";

type PlayerRow = {
  name: string;
  handicap_index: number | null;
};

type Team = {
  seed: number;
  name: string;
};

type Match = {
  id: string;
  a: Team;
  b: Team;
  aScore?: number | null;
  bScore?: number | null;
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
      name: "TBD",
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
    aScore: null,
    bScore: null,
    winnerSeed: null,
  }));

  const winner = (matchId: string): Team => ({
    seed: 0,
    name: `Winner of ${matchId}`,
  });

  const r16: Match[] = Array.from({ length: 8 }).map((_, i) => ({
    id: `R16-${i + 1}`,
    a: winner(r32[i * 2].id),
    b: winner(r32[i * 2 + 1].id),
    aScore: null,
    bScore: null,
    winnerSeed: null,
  }));

  const qf: Match[] = Array.from({ length: 4 }).map((_, i) => ({
    id: `QF-${i + 1}`,
    a: winner(r16[i * 2].id),
    b: winner(r16[i * 2 + 1].id),
    aScore: null,
    bScore: null,
    winnerSeed: null,
  }));

  const sf: Match[] = Array.from({ length: 2 }).map((_, i) => ({
    id: `SF-${i + 1}`,
    a: winner(qf[i * 2].id),
    b: winner(qf[i * 2 + 1].id),
    aScore: null,
    bScore: null,
    winnerSeed: null,
  }));

  const final: Match[] = [
    {
      id: "FINAL",
      a: winner(sf[0].id),
      b: winner(sf[1].id),
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
  score?: number | null;
}) {
  const isPlaceholder = team.seed === 0 || team.name === "TBD";

  return (
    <div className={`teamRow ${bold ? "winnerLike" : ""}`}>
      <div className="teamSeed">{team.seed ? team.seed : ""}</div>
      <div className={`teamName ${isPlaceholder ? "placeholder" : ""}`}>{team.name}</div>
      <div className="teamScore">{typeof score === "number" ? score : ""}</div>
    </div>
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
    typeof match.aScore === "number" &&
    typeof match.bScore === "number" &&
    typeof match.winnerSeed === "number";

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
      name:
        aExists || bExists
          ? `${pairing.playerA} / ${pairing.playerB}`
          : `${pairing.playerA} / ${pairing.playerB}`,
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
          max-width: 1720px;
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
          min-width: 1580px;
          padding: 28px 28px 36px;
          display: grid;
          grid-template-columns: 1fr 260px 1fr;
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
          grid-template-columns: 1.22fr 1.12fr 1.02fr 0.96fr;
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
          padding-top: 88px;
        }

        .round8 {
          padding-top: 176px;
        }

        .round4 {
          padding-top: 352px;
        }

        .cardSlot {
          position: relative;
          margin-bottom: 18px;
        }

        .offset16 {
          margin-bottom: 108px;
        }

        .offset8 {
          margin-bottom: 234px;
        }

        .offset4 {
          margin-bottom: 0;
        }

        .rightCard {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 12px;
        }

        .matchCard {
          width: 100%;
          background: #f7f7f7;
          border: 1px solid #d2d2d2;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .matchCard.compact {
          max-width: 250px;
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
          display: grid;
          grid-template-columns: 20px minmax(0, 1fr) 22px;
          gap: 6px;
          align-items: center;
          padding: 7px 10px;
          background: #f3f3f3;
        }

        .teamRow + .teamRow {
          border-top: 1px solid #e8e8e8;
          background: #f8f8f8;
        }

        .winnerLike {
          color: #222;
          font-weight: 900;
        }

        .teamSeed {
          font-size: 11px;
          color: #666;
          font-weight: 700;
          text-align: right;
        }

        .teamName {
          font-size: 13px;
          font-weight: 800;
          color: #222;
          line-height: 1.12;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .teamName.placeholder {
          color: #666;
          font-weight: 700;
        }

        .teamScore {
          font-size: 12px;
          font-weight: 900;
          color: #222;
          text-align: right;
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
          max-width: 260px;
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
          .board {
            min-width: 100%;
            grid-template-columns: 1fr;
          }

          .regionTitle,
          .centerColumn,
          .rightSide {
            position: static;
          }

          .leftSide {
            display: block;
            margin-top: 20px;
          }

          .round16,
          .round8,
          .round4 {
            padding-top: 0;
          }

          .cardSlot,
          .offset16,
          .offset8 {
            margin-bottom: 16px;
          }

          .rightSide {
            display: none;
          }

          .matchCard.compact {
            max-width: none;
          }

          .teamRow {
            grid-template-columns: 18px minmax(0, 1fr) 18px;
            gap: 5px;
            padding: 7px 9px;
          }

          .teamName {
            font-size: 12px;
          }

          .teamSeed,
          .teamScore {
            font-size: 10px;
          }
        }
      `}</style>
    </main>
  );
}
