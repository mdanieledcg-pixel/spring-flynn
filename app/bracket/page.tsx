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

function TeamLine({
  team,
  rightSide = false,
}: {
  team: BracketTeam;
  rightSide?: boolean;
}) {
  const label = formatTeamLabel(team);

  if (rightSide) {
    return (
      <div className="teamLineWrap rightSide">
        <div className="teamLine">
          <span className="teamText">{label || "\u00A0"}</span>
        </div>
        <div className="seed">({team.seed})</div>
      </div>
    );
  }

  return (
    <div className="teamLineWrap">
      <div className="seed">({team.seed})</div>
      <div className="teamLine">
        <span className="teamText">{label || "\u00A0"}</span>
      </div>
    </div>
  );
}

function LeftBracketRound({
  teams,
  label,
  roundClass,
}: {
  teams: BracketTeam[];
  label: string;
  roundClass: string;
}) {
  return (
    <div className={`roundCol ${roundClass}`}>
      <div className="roundLabel">{label}</div>
      <div className="roundStack">
        {teams.map((team, index) => {
          const isTop = index % 2 === 0;
          return (
            <div key={`${roundClass}-${team.seed}`} className="matchSlot">
              <TeamLine team={team} />
              <div className={`connector left ${isTop ? "top" : "bottom"}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RightBracketRound({
  teams,
  label,
  roundClass,
}: {
  teams: BracketTeam[];
  label: string;
  roundClass: string;
}) {
  return (
    <div className={`roundCol ${roundClass}`}>
      <div className="roundLabel">{label}</div>
      <div className="roundStack">
        {teams.map((team, index) => {
          const isTop = index % 2 === 0;
          return (
            <div key={`${roundClass}-${team.seed}`} className="matchSlot">
              <div className={`connector right ${isTop ? "top" : "bottom"}`} />
              <TeamLine team={team} rightSide />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyLinesRound({
  label,
  count,
  side,
  className,
}: {
  label: string;
  count: number;
  side: "left" | "right";
  className: string;
}) {
  return (
    <div className={`roundCol ${className}`}>
      <div className="roundLabel">{label}</div>
      <div className="roundStack">
        {Array.from({ length: count }).map((_, index) => {
          const isTop = index % 2 === 0;
          return (
            <div key={`${className}-${index}`} className="matchSlot">
              {side === "left" ? (
                <>
                  <div className="advanceLine" />
                  <div className={`connector left ${isTop ? "top" : "bottom"}`} />
                </>
              ) : (
                <>
                  <div className={`connector right ${isTop ? "top" : "bottom"}`} />
                  <div className="advanceLine" />
                </>
              )}
            </div>
          );
        })}
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
            <LeftBracketRound teams={leftTeams} label="R32" roundClass="r32" />
            <EmptyLinesRound label="S16" count={8} side="left" className="s16" />
            <EmptyLinesRound label="E8" count={4} side="left" className="e8" />
            <EmptyLinesRound label="F4" count={2} side="left" className="f4" />
          </div>

          <div className="centerCol">
            <div className="roundLabel finalLabel">FINAL</div>
            <div className="finalMatchLine" />
            <div className="championshipLabel">CHAMPIONSHIP</div>
            <div className="championshipBox" />
            <div className="championText">CHAMPION</div>
            <div className="championLine" />
          </div>

          <div className="rightHalf">
            <EmptyLinesRound label="F4" count={2} side="right" className="f4" />
            <EmptyLinesRound label="E8" count={4} side="right" className="e8" />
            <EmptyLinesRound label="S16" count={8} side="right" className="s16" />
            <RightBracketRound teams={rightTeams} label="R32" roundClass="r32" />
          </div>
        </div>

        <div className="mobileBracket">
          <div className="mobileRoundLabel">ROUND OF 32</div>
          {mobileTeams.map((team) => (
            <div key={`mobile-${team.seed}`} className="mobileTeamRow">
              <div className="seed">({team.seed})</div>
              <div className="teamLine mobileLine">
                <span className="teamText">{formatTeamLabel(team) || "\u00A0"}</span>
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
            max-width: 1800px;
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
            grid-template-columns: minmax(0, 1fr) 280px minmax(0, 1fr);
            gap: 14px;
            align-items: start;
          }

          .leftHalf,
          .rightHalf {
            display: grid;
            grid-template-columns: 1.35fr 1fr 0.9fr 0.8fr;
            gap: 20px;
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
            margin-bottom: 18px;
          }

          .roundStack {
            display: flex;
            flex-direction: column;
          }

          .r32 .matchSlot { height: 68px; }
          .s16 .matchSlot { height: 136px; }
          .e8 .matchSlot { height: 272px; }
          .f4 .matchSlot { height: 544px; }

          .matchSlot {
            position: relative;
            display: flex;
            align-items: center;
          }

          .teamLineWrap {
            display: grid;
            grid-template-columns: 50px minmax(0, 1fr);
            gap: 10px;
            align-items: center;
            width: 100%;
          }

          .teamLineWrap.rightSide {
            grid-template-columns: minmax(0, 1fr) 50px;
          }

          .seed {
            font-size: 18px;
            font-weight: 800;
            line-height: 1;
            text-align: center;
            white-space: nowrap;
          }

          .teamLine,
          .advanceLine,
          .finalMatchLine {
            border-bottom: 4px solid #111;
            height: 0;
            width: 100%;
          }

          .teamText {
            display: block;
            font-size: 17px;
            font-weight: 800;
            line-height: 1.1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding-bottom: 4px;
          }

          .connector {
            position: absolute;
            top: 50%;
            width: 24px;
            height: 50%;
          }

          .connector.left {
            right: -12px;
            border-right: 4px solid #111;
          }

          .connector.left.top {
            border-top: 4px solid #111;
            transform: translateY(0);
          }

          .connector.left.bottom {
            border-bottom: 4px solid #111;
            transform: translateY(-100%);
          }

          .connector.right {
            left: -12px;
            border-left: 4px solid #111;
          }

          .connector.right.top {
            border-top: 4px solid #111;
            transform: translateY(0);
          }

          .connector.right.bottom {
            border-bottom: 4px solid #111;
            transform: translateY(-100%);
          }

          .centerCol {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 8px;
          }

          .finalLabel {
            margin-bottom: 26px;
          }

          .finalMatchLine {
            margin-top: 16px;
            margin-bottom: 98px;
          }

          .championshipLabel {
            margin-bottom: 18px;
          }

          .championshipBox {
            width: 100%;
            height: 86px;
            border: 4px solid #111;
            background: transparent;
            margin-bottom: 24px;
          }

          .championText {
            font-size: 34px;
            font-weight: 900;
            line-height: 1;
            margin-bottom: 12px;
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

            .teamText {
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
              grid-template-columns: minmax(0, 1fr) 210px minmax(0, 1fr);
              gap: 10px;
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

            .r32 .matchSlot { height: 42px; }
            .s16 .matchSlot { height: 84px; }
            .e8 .matchSlot { height: 168px; }
            .f4 .matchSlot { height: 336px; }

            .teamLineWrap {
              grid-template-columns: 28px minmax(0, 1fr);
              gap: 5px;
            }

            .teamLineWrap.rightSide {
              grid-template-columns: minmax(0, 1fr) 28px;
            }

            .seed {
              font-size: 11px;
            }

            .teamText {
              font-size: 11px;
              padding-bottom: 2px;
            }

            .teamLine,
            .advanceLine,
            .finalMatchLine,
            .championLine {
              border-bottom-width: 2px;
            }

            .connector.left,
            .connector.right {
              width: 12px;
            }

            .connector.left {
              right: -6px;
              border-right-width: 2px;
            }

            .connector.right {
              left: -6px;
              border-left-width: 2px;
            }

            .connector.left.top,
            .connector.right.top {
              border-top-width: 2px;
            }

            .connector.left.bottom,
            .connector.right.bottom {
              border-bottom-width: 2px;
            }

            .championshipBox {
              border-width: 2px;
              height: 48px;
              margin-bottom: 12px;
            }

            .championText {
              font-size: 18px;
              margin-bottom: 8px;
            }

            .finalMatchLine {
              margin-bottom: 54px;
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
