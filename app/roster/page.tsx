import { PAIRINGS } from "@/app/lib/pairings";

type Player = {
  id: string;
  name: string;
  handicap_index?: number | null;
  phone_number?: string | null;
};

function getPhoneDigits(phone: string) {
  return phone.replace(/\D/g, "");
}

function getPhoneHref(phone: string) {
  const digits = getPhoneDigits(phone);
  return digits ? `sms:${digits}` : "#";
}

function formatPhoneNumber(phone?: string | null) {
  if (!phone) return "-";

  const digits = getPhoneDigits(phone);

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return phone;
}

function formatHandicapIndex(value?: number | null) {
  return typeof value === "number" ? value.toFixed(1) : "-";
}

function isDefendingChamp(name: string) {
  return name === "Dan Bevis" || name === "Bobby Taylor";
}

export default async function RosterPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  try {
    const res = await fetch(
      `${url}/rest/v1/players?select=id,name,handicap_index,phone_number&order=handicap_index.asc.nullslast`,
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
          <h1>Roster</h1>
          <p style={{ color: "red" }}>Error: {text}</p>
          <a href="/">← Back</a>
        </main>
      );
    }

    const players = (await res.json()) as Player[];

    const danName = "Dan Bevis";
    const filtered = players.filter((p) => p.name !== danName);
    const aPlayers = filtered.slice(0, 32);
    const bPlayers = filtered.slice(32);

    const dan = players.find((p) => p.name === danName);
    if (dan) {
      bPlayers.unshift(dan);
    }

    return (
      <main
        style={{
          padding: "32px 20px",
          fontFamily: "system-ui",
          maxWidth: 980,
          margin: "0 auto",
          color: "#111",
        }}
      >
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            marginBottom: 20,
          }}
        >
          Roster
        </h1>
        
<a href="/" className="top-back-button">
  ← Back to Home
</a>
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: "#ffffff",
          }}
        >
          <div className="roster-header">
            <div>Player</div>
            <div className="hi-header">
              <span className="hi-mobile">HI</span>
              <span className="hi-desktop">Handicap Index</span>
            </div>
            <div className="phone-header">Phone</div>
          </div>

          <div className="section-label">A Players</div>

          {aPlayers.map((player, index) => (
            <div
              key={player.id}
              className="roster-row"
              style={{
                backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9",
                borderBottom: "1px solid #eee",
              }}
            >
              <div className="player-cell">
                <div className="player-name">{player.name}</div>
                {isDefendingChamp(player.name) && (
                  <div className="champ-note">(Defending Champ)</div>
                )}
              </div>

              <div className="hi-cell">
                {formatHandicapIndex(player.handicap_index)}
              </div>

              <div className="phone-cell">
                {player.phone_number ? (
                  <a
                    href={getPhoneHref(player.phone_number)}
                    className="phone-link"
                  >
                    {formatPhoneNumber(player.phone_number)}
                  </a>
                ) : (
                  "-"
                )}
              </div>
            </div>
          ))}

          <div className="section-label">B Players</div>

          {bPlayers.map((player, index) => (
            <div
              key={player.id}
              className="roster-row"
              style={{
                backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9",
                borderBottom:
                  index === bPlayers.length - 1 ? "none" : "1px solid #eee",
              }}
            >
              <div className="player-cell">
                <div className="player-name">{player.name}</div>
                {isDefendingChamp(player.name) && (
                  <div className="champ-note">(Defending Champ)</div>
                )}
              </div>

              <div className="hi-cell">
                {formatHandicapIndex(player.handicap_index)}
              </div>

              <div className="phone-cell">
                {player.phone_number ? (
                  <a
                    href={getPhoneHref(player.phone_number)}
                    className="phone-link"
                  >
                    {formatPhoneNumber(player.phone_number)}
                  </a>
                ) : (
                  "-"
                )}
              </div>
            </div>
          ))}
     <div className="pairings-break" />

<div className="section-label">Official Pairings</div>

<div className="pairings-header">
  <div className="pairings-seed">Seed</div>
  <div>A Player</div>
  <div>B Player</div>
</div>

{PAIRINGS.map(({ seed, playerA, playerB }, index) => (
  <div
    key={seed}
    className="pairings-row"
    style={{
      backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9",
      borderBottom: index === 31 ? "none" : "1px solid #eee",
    }}
  >
    <div className="pairings-seed">{seed}</div>
    <div className="pairings-player">{playerA}</div>
    <div className="pairings-player pairings-b">{playerB}</div>
  </div>
))}
        </div>

<a href="/" style={{ marginTop: 16, display: "inline-block" }}>
  ← Back
</a>
        <style>{`
          .roster-header {
            display: grid;
            grid-template-columns: 380px 110px 140px;
            padding: 12px 16px;
            font-weight: 700;
            background-color: #eaeaea;
            font-size: 14px;
            align-items: center;
            justify-content: center;
            column-gap: 0;
          }

          .roster-row {
            display: grid;
            grid-template-columns: 380px 110px 140px;
            padding: 12px 16px;
            font-size: 16px;
            align-items: center;
            justify-content: center;
            column-gap: 0;
          }

          .player-cell {
            min-width: 0;
            padding-right: 10px;
          }

          .player-name {
            font-weight: 500;
            line-height: 1.2;
          }

          .champ-note {
            margin-top: 3px;
            font-size: 12px;
            color: red;
            line-height: 1.2;
          }

          .hi-header,
          .hi-cell {
            text-align: center;
          }

          .phone-header {
            text-align: center;
          }

          .phone-cell {
            text-align: right;
          }

          .phone-link {
            color: #0070f3;
            text-decoration: none;
            font-weight: 500;
          }

          .section-label {
            padding: 10px 16px;
            background-color: #d4d4d4;
            font-weight: 700;
            font-size: 13px;
            text-transform: uppercase;
            text-align: center;
          }

          .hi-mobile {
            display: none;
          }

          .hi-desktop {
            display: inline;
          }

          @media (max-width: 700px) {
            .roster-header {
              grid-template-columns: minmax(0, 190px) 42px 130px;
              font-size: 13px;
              padding: 10px 12px;
              column-gap: 2px;
            }

            .roster-row {
              grid-template-columns: minmax(0, 190px) 42px 130px;
              padding: 10px 12px;
              font-size: 14px;
              column-gap: 2px;
            }

            .player-cell {
              padding-right: 6px;
            }

            .section-label {
              padding: 9px 12px;
              font-size: 12px;
            }

            .hi-mobile {
              display: inline;
            }

            .hi-desktop {
              display: none;
            }

            .champ-note {
              font-size: 11px;
            }

            .phone-header {
              text-align: center;
            }

            .phone-cell {
              text-align: right;
            }
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

@media (max-width: 700px) {
  .top-back-button {
    width: 100%;
    text-align: center;
    margin-bottom: 14px;
  }
}
          .pairings-break {
  height: 14px;
  background: #efefef;
  border-top: 1px solid #dcdcdc;
  border-bottom: 1px solid #dcdcdc;
}

.pairings-header {
  display: grid;
  grid-template-columns: 80px minmax(0, 1fr) minmax(0, 1fr);
  padding: 12px 16px;
  font-weight: 700;
  background-color: #eaeaea;
  font-size: 14px;
  align-items: center;
  column-gap: 24px;
}

.pairings-row {
  display: grid;
  grid-template-columns: 80px minmax(0, 1fr) minmax(0, 1fr);
  padding: 12px 16px;
  font-size: 16px;
  align-items: center;
  column-gap: 24px;
}

.pairings-seed {
  text-align: center;
  font-weight: 700;
}

.pairings-player {
  min-width: 0;
  text-align: left;
}

.pairings-b {
  text-align: left;
}

@media (max-width: 700px) {
  .pairings-break {
    height: 10px;
  }

  .pairings-header {
    grid-template-columns: 46px minmax(0, 1fr) minmax(0, 1fr);
    padding: 10px 12px;
    font-size: 13px;
    column-gap: 10px;
  }

  .pairings-row {
    grid-template-columns: 46px minmax(0, 1fr) minmax(0, 1fr);
    padding: 10px 12px;
    font-size: 14px;
    column-gap: 10px;
  }

  .pairings-seed {
    text-align: center;
    font-weight: 700;
  }

  .pairings-player,
  .pairings-b {
    overflow-wrap: anywhere;
    word-break: break-word;
    line-height: 1.2;
  }
}
        `}</style>
      </main>
    );
  } catch (err) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1>Roster</h1>
        <p style={{ color: "red" }}>
          Error: {err instanceof Error ? err.message : "Unknown error"}
        </p>
        <a
  href="/"
  style={{
    marginTop: 16,
    display: "inline-block",
    paddingBottom: 12,
  }}
>
  ← Back
</a>
      </main>
    );
  }
}
