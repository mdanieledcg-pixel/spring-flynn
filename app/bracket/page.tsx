import { PAIRINGS } from "../lib/pairings";

type Player = {
  name: string;
  handicap_index?: number | null;
};

type BracketTeam = {
  seed: number;
  playerA: string;
  playerB: string;
  combinedHandicap: number;
};

type PairBlock = {
  top: BracketTeam;
  bottom: BracketTeam;
};

const LEFT_R32_ORDER = [1, 32, 16, 17, 8, 25, 9, 24, 4, 29, 13, 20, 5, 28, 12, 21];
const RIGHT_R32_ORDER = [2, 31, 15, 18, 7, 26, 10, 23, 3, 30, 14, 19, 6, 27, 11, 22];

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

function getHandicap(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function buildEmptyTeam(seed: number): BracketTeam {
  return {
    seed,
    playerA: "",
    playerB: "",
    combinedHandicap: 0,
  };
}

function formatTeamLabel(team: BracketTeam) {
  if (!team.playerA || !team.playerB) return "";
  return `${team.playerA} / ${team.playerB} (${team.combinedHandicap.toFixed(1)})`;
}

function chunkIntoPairs(teams: BracketTeam[]): PairBlock[] {
  const pairs: PairBlock[] = [];
  for (let i = 0; i < teams.length; i += 2) {
    pairs.push({
      top: teams[i],
      bottom: teams[i + 1],
    });
  }
  return pairs;
}

function TeamRow({
  seed,
  label,
  rightSide = false,
}: {
  seed: number;
  label: string;
  rightSide?: boolean;
}) {
  return (
    <div className={`teamRow ${rightSide ? "rightSide" : ""}`}>
      {!rightSide && <div className="seed">({seed})</div>}
      <div className="teamNameLine">
        <span className="teamLabel">{label || "\u00A0"}</span>
      </div>
      {rightSide && <div className="seed">({seed})</div>}
    </div>
  );
}

function MatchPair({
  topTeam,
  bottomTeam,
  rightSide = false,
  className = "",
}: {
  topTeam: { seed: number; label: string };
  bottomTeam: { seed: number; label: string };
  rightSide?: boolean;
  className?: string;
}) {
  return (
    <div className={`matchPair ${rightSide ? "rightSide" : ""} ${className}`}>
      <TeamRow seed={topTeam.seed} label={topTeam.label} rightSide={rightSide} />
      <TeamRow seed={bottomTeam.seed} label={bottomTeam.label} rightSide={rightSide} />
      <div className="pairConnector" />
    </div>
  );
}

function SideRound({
  label,
  pairs,
  rightSide = false,
  roundClass,
}: {
  label: string;
  pairs: PairBlock[];
  rightSide?: boolean;
  roundClass: string;
}) {
  return (
    <div className={`roundCol ${roundClass}`}>
      <div className="roundLabel">{label}</div>
      <div className="roundStack">
        {pairs.map((pair, index) => (
          <MatchPair
            key={`${label}-${index}-${pair.top.seed}-${pair.bottom.seed}`}
            topTeam={{ seed: pair.top.seed, label: formatTeamLabel(pair.top) }}
            bottomTeam={{ seed: pair.bottom.seed, label: formatTeamLabel(pair.bottom) }}
            rightSide={rightSide}
          />
        ))}
      </div>
    </div>
  );
}

function EmptyPairRound({
  label,
  pairCount,
  rightSide = false,
  roundClass,
}: {
  label: string;
  pairCount: number;
  rightSide?: boolean;
  roundClass: string;
}) {
  return (
    <div className={`roundCol ${roundClass}`}>
      <div className="roundLabel">{label}</div>
      <div className="roundStack">
        {Array.from({ length: pairCount }).map((_, index) => (
          <div key={`${label}-${index}`} className={`matchPair ${rightSide ? "rightSide" : ""}`}>
            <div className={`advanceOnly ${rightSide ? "rightSide" : ""}`} />
            <div className={`advanceOnly ${rightSide ? "rightSide" : ""}`} />
            <div className="pairConnector" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function BracketPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  try {
    const res = await fetch(
      `${url}/rest/v1/players?select=name,handicap_index&order=handicap_index.asc.nullslast`,
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
          <h1>Bracket</h1>
          <p style={{ color: "red" }}>Error: {text}</p>
          <a href="/">← Back</a>
        </main>
      );
    }

    const players = (await res.json()) as Player[];

    const playerMap = new Map<string, Player>();
    for (const player of players) {
      playerMap.set(normalizeName(player.name), player);
    }

    const teamsBySeed = new Map<number, BracketTeam>();

    for (const pairing of PAIRINGS) {
      const a = playerMap.get(normalizeName(pairing.playerA));
      const b = playerMap.get(normalizeName(pairing.playerB));

      teamsBySeed.set(pairing.seed, {
        seed: pairing.seed,
        playerA: pairing.playerA,
        playerB: pairing.playerB,
        combinedHandicap: getHandicap(a?.handicap_index) + getHandicap(b?.handicap_index),
      });
    }

    const leftTeams = LEFT_R32_ORDER.map((seed) => teamsBySeed.get(seed) ?? buildEmptyTeam(seed));
    const rightTeams = RIGHT_R32_ORDER.map((seed) => teamsBySeed.get(seed) ?? buildEmptyTeam(seed));

    const leftPairs = chunkIntoPairs(leftTeams);
    const rightPairs = chunkIntoPairs(rightTeams);

    const mobileTeams = [...LEFT_R32_ORDER, ...RIGHT_R32_ORDER].map(
      (seed) => teamsBySeed.get(seed) ?? buildEmptyTeam(seed)
    );

    return (
      <main className="bracketPage">
        <a href="/" className="topBackButton">
          ← Back to Home
        </a>

        <div className="header">
          <h1>Spring Flynn Bracket</h1>
          <p>Round of 32 • Sweet 16 • Elite 8 • Final 4 • Championship</p>
        </div>

        <div className="desktopBracket">
          <div className="leftHalf">
            <SideRound label="ROUND OF 32" pairs={leftPairs} roundClass="r32" />
            <EmptyPairRound label="SWEET 16" pairCount={4} roundClass="s16" />
            <EmptyPairRound label="ELITE 8" pairCount={2} roundClass="e8" />
            <EmptyPairRound label="FINAL 4" pairCount={1} roundClass="f4" />
          </div>

          <div className="centerCol">
            <div className="centerTop">
              <div className="roundLabel">FINAL</div>
              <div className="finalLine" />
            </div>

            <div className="centerMiddle">
              <div className="championshipLabel">CHAMPIONSHIP</div>
              <div className="championshipBox" />
            </div>

            <div className="centerBottom">
              <div className="championText">CHAMPION</div>
              <div className="championLine" />
            </div>
          </div>

          <div className="rightHalf">
            <EmptyPairRound label="FINAL 4" pairCount={1} rightSide roundClass="f4" />
            <EmptyPairRound label="ELITE 8" pairCount={2} rightSide roundClass="e8" />
            <EmptyPairRound label="SWEET 16" pairCount={4} rightSide roundClass="s16" />
            <SideRound label="ROUND OF 32" pairs={rightPairs} rightSide roundClass="r32" />
          </div>
        </div>

        <div className="mobileBracket">
          <div className="mobileRoundLabel">ROUND OF 32</div>
          {mobileTeams.map((team) => (
            <div key={`mobile-${team.seed}`} className="mobileTeamRow">
              <div className="seed">({team.seed})</div>
              <div className="teamNameLine mobileLine">
                <span className="teamLabel">{formatTeamLabel(team) || "\u00A0"}</span>
              </div>
            </div>
          ))}

          <div className="mobileSpacerLabel">SWEET 16</div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`m-s16-${i}`} className="mobileAdvanceLine" />
          ))}

          <div className="mobileSpacerLabel">ELITE 8</div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`m-e8-${i}`} className="mobileAdvanceLine" />
          ))}

          <div className="mobileSpacerLabel">FINAL 4</div>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={`m-f4-${i}`} className="mobileAdvanceLine" />
          ))}

          <div className="mobileSpacerLabel">CHAMPIONSHIP</div>
          <div className="mobileChampionshipBox" />
          <div className="championText mobileChampionText">CHAMPION</div>
          <div className="championLine" />
        </div>

        <style>{`
          .bracketPage {
            min-height: 100vh;
            padding: 28px 20px 56px;
            font-family: system-ui;
            max-width: 1900px;
            margin: 0 auto;
            color: #111;
            background: #f3eee3;
          }

          .topBackButton {
            display: inline-block;
            margin-bottom: 18px;
            padding: 8px 14px;
            background: #fff;
            border: 1px solid #d5d5d5;
            border-radius: 8px;
            text-decoration: none;
            color: #111;
            font-weight: 600;
          }

          .header {
            text-align: center;
            margin-bottom: 24px;
          }

          .header h1 {
            margin: 0;
            font-size: 42px;
            line-height: 1.05;
            font-weight: 900;
          }

          .header p {
            margin: 8px 0 0;
            font-size: 15px;
            font-weight: 700;
          }

          .desktopBracket {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 300px minmax(0, 1fr);
            gap: 10px;
            align-items: start;
          }

          .leftHalf,
          .rightHalf {
            display: grid;
            grid-template-columns: 1.45fr 1.05fr 0.82fr 0.72fr;
            gap: 18px;
            align-items: start;
          }

          .roundCol {
            min-width: 0;
          }

          .roundLabel,
          .championshipLabel {
            text-align: center;
            font-size: 13px;
            font-weight: 900;
            letter-spacing: 0.05em;
            margin-bottom: 16px;
          }

          .roundStack {
            display: flex;
            flex-direction: column;
          }

          .r32 .matchPair {
            min-height: 122px;
            margin-bottom: 0;
          }

          .s16 .matchPair {
            min-height: 244px;
            margin-bottom: 0;
          }

          .e8 .matchPair {
            min-height: 488px;
            margin-bottom: 0;
          }

          .f4 .matchPair {
            min-height: 976px;
            margin-bottom: 0;
          }

          .matchPair {
            position: relative;
            display: grid;
            grid-template-rows: 32px 32px;
            row-gap: 28px;
            align-content: center;
          }

          .teamRow {
            display: grid;
            grid-template-columns: 54px minmax(0, 1fr);
            gap: 10px;
            align-items: end;
          }

          .teamRow.rightSide {
            grid-template-columns: minmax(0, 1fr) 54px;
          }

          .seed {
            font-size: 18px;
            font-weight: 800;
            text-align: center;
            line-height: 1;
            white-space: nowrap;
          }

          .teamNameLine,
          .advanceOnly,
          .finalLine {
            position: relative;
            border-bottom: 4px solid #111;
            height: 0;
            width: 100%;
            align-self: end;
          }

          .teamLabel {
            display: block;
            font-size: 17px;
            font-weight: 800;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding-bottom: 4px;
            line-height: 1.05;
          }

          .pairConnector {
            position: absolute;
            top: 17px;
            bottom: 17px;
            right: -18px;
            width: 18px;
            border-right: 4px solid #111;
            pointer-events: none;
          }

          .pairConnector::before,
          .pairConnector::after {
            content: "";
            position: absolute;
            right: 0;
            width: 18px;
            border-top: 4px solid #111;
          }

          .pairConnector::before {
            top: 0;
          }

          .pairConnector::after {
            bottom: 0;
          }

          .matchPair.rightSide .pairConnector {
            right: auto;
            left: -18px;
            border-right: 0;
            border-left: 4px solid #111;
          }

          .matchPair.rightSide .pairConnector::before,
          .matchPair.rightSide .pairConnector::after {
            right: auto;
            left: 0;
          }

          .centerCol {
            display: grid;
            grid-template-rows: auto 1fr auto;
            align-self: stretch;
            padding-top: 0;
          }

          .centerTop {
            padding-top: 0;
          }

          .centerMiddle {
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .centerBottom {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
          }

          .finalLine {
            margin-top: 28px;
          }

          .championshipLabel {
            margin-bottom: 16px;
          }

          .championshipBox {
            width: 100%;
            height: 96px;
            border: 4px solid #111;
            background: transparent;
            margin-bottom: 26px;
          }

          .championText {
            font-size: 34px;
            font-weight: 900;
            line-height: 1;
            margin-bottom: 12px;
            text-align: center;
          }

          .championLine {
            width: 100%;
            border-bottom: 4px solid #111;
          }

          .mobileBracket {
            display: none;
            max-width: 760px;
            margin: 0 auto;
          }

          .mobileRoundLabel,
          .mobileSpacerLabel {
            font-size: 14px;
            font-weight: 900;
            letter-spacing: 0.05em;
            margin: 18px 0 12px;
          }

          .mobileTeamRow {
            display: grid;
            grid-template-columns: 50px minmax(0, 1fr);
            gap: 10px;
            align-items: center;
            margin-bottom: 14px;
          }

          .mobileLine {
            border-bottom-width: 3px;
          }

          .mobileAdvanceLine {
            border-bottom: 3px solid #111;
            margin-bottom: 20px;
          }

          .mobileChampionshipBox {
            height: 62px;
            border: 3px solid #111;
            margin-bottom: 16px;
          }

          .mobileChampionText {
            font-size: 24px;
          }

          @media (max-width: 1100px) {
            .desktopBracket {
              display: none;
            }

            .mobileBracket {
              display: block;
            }

            .topBackButton {
              width: 100%;
              text-align: center;
            }

            .bracketPage {
              padding: 22px 14px 46px;
            }

            .header h1 {
              font-size: 30px;
            }

            .header p {
              font-size: 13px;
            }

            .teamLabel {
              font-size: 15px;
            }

            .seed {
              font-size: 15px;
            }
          }

          @media print {
            .mobileBracket {
              display: none !important;
            }

            .desktopBracket {
              display: grid !important;
            }

            .bracketPage {
              background: white;
              padding: 12px 12px 20px;
            }

            .header {
              margin-bottom: 14px;
            }

            .header h1 {
              font-size: 28px;
            }

            .header p {
              font-size: 11px;
            }

            .desktopBracket {
              grid-template-columns: minmax(0, 1fr) 220px minmax(0, 1fr);
              gap: 8px;
            }

            .leftHalf,
            .rightHalf {
              gap: 10px;
            }

            .roundLabel,
            .championshipLabel {
              font-size: 10px;
              margin-bottom: 10px;
            }

            .r32 .matchPair {
              min-height: 76px;
            }

            .s16 .matchPair {
              min-height: 152px;
            }

            .e8 .matchPair {
              min-height: 304px;
            }

            .f4 .matchPair {
              min-height: 608px;
            }

            .matchPair {
              grid-template-rows: 20px 20px;
              row-gap: 16px;
            }

            .teamRow {
              grid-template-columns: 30px minmax(0, 1fr);
              gap: 5px;
            }

            .teamRow.rightSide {
              grid-template-columns: minmax(0, 1fr) 30px;
            }

            .seed {
              font-size: 11px;
            }

            .teamLabel {
              font-size: 11px;
              padding-bottom: 2px;
            }

            .teamNameLine,
            .advanceOnly,
            .finalLine,
            .championLine {
              border-bottom-width: 2px;
            }

            .pairConnector {
              top: 10px;
              bottom: 10px;
              right: -8px;
              width: 8px;
              border-right-width: 2px;
            }

            .pairConnector::before,
            .pairConnector::after {
              width: 8px;
              border-top-width: 2px;
            }

            .matchPair.rightSide .pairConnector {
              left: -8px;
              border-left-width: 2px;
            }

            .championshipBox {
              border-width: 2px;
              height: 52px;
              margin-bottom: 12px;
            }

            .championText {
              font-size: 18px;
              margin-bottom: 8px;
            }

            .finalLine {
              margin-top: 18px;
            }

            @page {
              size: landscape;
              margin: 0.3in;
            }
          }
        `}</style>
      </main>
    );
  } catch (err) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1>Bracket</h1>
        <p style={{ color: "red" }}>
          Error: {err instanceof Error ? err.message : "Unknown error"}
        </p>
        <a href="/">← Back</a>
      </main>
    );
  }
}
