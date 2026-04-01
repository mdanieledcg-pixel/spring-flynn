import { PAIRINGS } from "@/app/lib/pairings";

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

function MatchSlot({
  team,
  mobile = false,
  rightSide = false,
}: {
  team: BracketTeam;
  mobile?: boolean;
  rightSide?: boolean;
}) {
  const label = formatTeamLabel(team);

  return (
    <div className={`slot ${mobile ? "mobile" : ""} ${rightSide ? "rightSide" : ""}`}>
      {!rightSide && <div className="seed">({team.seed})</div>}

      <div className="slotLine">
        <span className="slotText">{label || "\u00A0"}</span>
      </div>

      {rightSide && !mobile && <div className="seed">({team.seed})</div>}
    </div>
  );
}

function EmptyRound({
  label,
  count,
}: {
  label: string;
  count: number;
}) {
  return (
    <div className="round">
      <div className="roundLabel">{label}</div>
      <div className="roundBody">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="emptyRoundSlot">
            <div className="emptyBox" />
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
    const mobileTeams = [...LEFT_R32_ORDER, ...RIGHT_R32_ORDER].map(
      (seed) => teamsBySeed.get(seed) ?? buildEmptyTeam(seed)
    );

    return (
      <main className="bracketPage">
        <a href="/" className="top-back-button">
          ← Back to Home
        </a>

        <div className="header">
          <h1>Spring Flynn Bracket</h1>
          <p>32 Team Championship</p>
        </div>

        <div className="desktopBracket">
          <div className="side">
            <div className="round">
              <div className="roundLabel">ROUND OF 32</div>
              <div className="roundBody">
                {leftTeams.map((team) => (
                  <MatchSlot key={`left-${team.seed}`} team={team} />
                ))}
              </div>
            </div>

            <EmptyRound label="SWEET 16" count={8} />
            <EmptyRound label="ELITE 8" count={4} />
            <EmptyRound label="FINAL 4" count={2} />
          </div>

          <div className="centerCol">
            <div className="centerLabel">FINAL</div>
            <div className="finalBox" />
            <div className="centerLabel">CHAMPIONSHIP</div>
            <div className="championshipBox" />
            <div className="championLine">CHAMPION</div>
          </div>

          <div className="side">
            <EmptyRound label="FINAL 4" count={2} />
            <EmptyRound label="ELITE 8" count={4} />
            <EmptyRound label="SWEET 16" count={8} />

            <div className="round">
              <div className="roundLabel">ROUND OF 32</div>
              <div className="roundBody">
                {rightTeams.map((team) => (
                  <MatchSlot key={`right-${team.seed}`} team={team} rightSide />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mobileBracket">
          <section className="mobileSection">
            <div className="mobileRoundLabel">ROUND OF 32</div>
            {mobileTeams.map((team) => (
              <MatchSlot key={`mobile-${team.seed}`} team={team} mobile />
            ))}
          </section>

          <section className="mobileSection">
            <div className="mobileRoundLabel">SWEET 16</div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="mobileEmptySlot">
                <div className="emptyBox" />
              </div>
            ))}
          </section>

          <section className="mobileSection">
            <div className="mobileRoundLabel">ELITE 8</div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="mobileEmptySlot">
                <div className="emptyBox" />
              </div>
            ))}
          </section>

          <section className="mobileSection">
            <div className="mobileRoundLabel">FINAL 4</div>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="mobileEmptySlot">
                <div className="emptyBox" />
              </div>
            ))}
          </section>

          <section className="mobileSection">
            <div className="mobileRoundLabel">CHAMPIONSHIP</div>
            <div className="mobileEmptySlot">
              <div className="championshipBox mobileChampionship" />
            </div>
            <div className="championLine mobileChampion">CHAMPION</div>
          </section>
        </div>

        <style>{`
          .bracketPage {
            min-height: 100vh;
            padding: 32px 20px 56px;
            font-family: system-ui;
            max-width: 1800px;
            margin: 0 auto;
            color: #111;
            background: #f6f1e7;
          }

          .top-back-button {
            display: inline-block;
            margin-bottom: 18px;
            padding: 8px 14px;
            background: #ffffff;
            border: 1px solid #d5d5d5;
            border-radius: 8px;
            text-decoration: none;
            color: #111;
            font-weight: 600;
            transition: all 0.2s ease;
          }

          .top-back-button:hover {
            background: #f7f7f7;
          }

          .header {
            text-align: center;
            margin-bottom: 24px;
          }

          .header h1 {
            margin: 0;
            font-size: 36px;
            font-weight: 900;
            line-height: 1.05;
          }

          .header p {
            margin: 8px 0 0;
            font-size: 15px;
            font-weight: 700;
          }

          .desktopBracket {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 220px minmax(0, 1fr);
            gap: 18px;
            align-items: start;
          }

          .side {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 16px;
            align-items: start;
          }

          .roundLabel,
          .centerLabel,
          .mobileRoundLabel {
            text-align: center;
            font-size: 13px;
            font-weight: 900;
            letter-spacing: 0.05em;
            margin-bottom: 14px;
          }

          .roundBody {
            display: flex;
            flex-direction: column;
          }

          .slot {
            display: grid;
            grid-template-columns: 42px minmax(0, 1fr);
            gap: 8px;
            align-items: center;
            min-height: 42px;
            margin-bottom: 12px;
          }

          .slot.rightSide {
            grid-template-columns: minmax(0, 1fr) 42px;
          }

          .slot.mobile {
            grid-template-columns: 42px minmax(0, 1fr);
          }

          .seed {
            font-size: 18px;
            font-weight: 800;
            text-align: center;
            line-height: 1;
          }

          .slotLine {
            min-height: 30px;
            border-bottom: 3px solid #111;
            display: flex;
            align-items: flex-end;
            padding: 0 4px 2px;
          }

          .slotText {
            display: block;
            width: 100%;
            font-size: 18px;
            font-weight: 800;
            line-height: 1.1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .emptyRoundSlot {
            min-height: 66px;
            display: flex;
            align-items: center;
            margin-bottom: 16px;
          }

          .emptyBox {
            width: 100%;
            height: 40px;
            border: 3px solid #111;
            background: transparent;
          }

          .centerCol {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 8px;
          }

          .finalBox {
            width: 100%;
            height: 54px;
            border: 3px solid #111;
            margin-bottom: 56px;
            background: rgba(255, 255, 255, 0.25);
          }

          .championshipBox {
            width: 100%;
            height: 62px;
            border: 3px solid #111;
            margin-bottom: 16px;
            background: rgba(255, 255, 255, 0.25);
          }

          .championLine {
            width: 100%;
            border-bottom: 3px solid #111;
            text-align: center;
            padding-bottom: 6px;
            font-size: 22px;
            font-weight: 900;
            letter-spacing: 0.03em;
          }

          .mobileBracket {
            display: none;
            max-width: 760px;
            margin: 0 auto;
          }

          .mobileSection {
            margin-bottom: 24px;
          }

          .mobileRoundLabel {
            text-align: left;
            margin-bottom: 12px;
            font-size: 14px;
          }

          .mobileEmptySlot {
            margin-bottom: 12px;
          }

          .mobileChampionship {
            height: 56px;
          }

          .mobileChampion {
            margin-top: 6px;
            font-size: 18px;
          }

          @media (max-width: 1100px) {
            .desktopBracket {
              display: none;
            }

            .mobileBracket {
              display: block;
            }

            .top-back-button {
              width: 100%;
              text-align: center;
            }

            .bracketPage {
              padding: 22px 14px 46px;
            }

            .header h1 {
              font-size: 28px;
            }

            .header p {
              font-size: 13px;
              line-height: 1.35;
            }

            .slotText {
              font-size: 15px;
              white-space: nowrap;
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
              padding: 14px 14px 24px;
            }

            .header {
              margin-bottom: 12px;
            }

            .header h1 {
              font-size: 28px;
            }

            .header p {
              font-size: 11px;
              margin-top: 4px;
            }

            .desktopBracket {
              grid-template-columns: minmax(0, 1fr) 180px minmax(0, 1fr);
              gap: 10px;
            }

            .side {
              gap: 8px;
            }

            .roundLabel,
            .centerLabel {
              font-size: 10px;
              margin-bottom: 8px;
            }

            .slot {
              min-height: 28px;
              margin-bottom: 8px;
              grid-template-columns: 28px minmax(0, 1fr);
              gap: 4px;
            }

            .slot.rightSide {
              grid-template-columns: minmax(0, 1fr) 28px;
            }

            .seed {
              font-size: 11px;
            }

            .slotLine {
              min-height: 20px;
              border-bottom-width: 2px;
              padding: 0 2px 1px;
            }

            .slotText {
              font-size: 11px;
            }

            .emptyRoundSlot {
              min-height: 44px;
              margin-bottom: 10px;
            }

            .emptyBox,
            .finalBox,
            .championshipBox,
            .championLine {
              border-width: 2px;
            }

            .emptyBox {
              height: 24px;
            }

            .finalBox {
              height: 34px;
              margin-bottom: 32px;
            }

            .championshipBox {
              height: 40px;
              margin-bottom: 10px;
            }

            .championLine {
              font-size: 14px;
              padding-bottom: 4px;
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
