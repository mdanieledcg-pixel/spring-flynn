type Player = {
  id: string;
  name: string;
  handicap_index?: number | null;
  phone_number?: string | null;
};

function getPhoneHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `sms:${digits}` : "#";
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

        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: "#ffffff",
          }}
        >
          {/* HEADER */}
          <div className="roster-header">
            <div>Player</div>
            <div className="hi-header">
              <span className="hi-mobile">HI</span>
              <span className="hi-desktop">Handicap Index</span>
            </div>
            <div className="phone-header">Phone</div>
          </div>

          {/* A PLAYERS */}
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
                <div style={{ fontWeight: 500 }}>{player.name}</div>
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
                    style={{
                      color: "#0070f3",
                      textDecoration: "none",
                      fontWeight: 500,
                    }}
                  >
                    {player.phone_number}
                  </a>
                ) : (
                  "-"
                )}
              </div>
            </div>
          ))}

          {/* B PLAYERS */}
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
                <div style={{ fontWeight: 500 }}>{player.name}</div>
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
                    style={{
                      color: "#0070f3",
                      textDecoration: "none",
                      fontWeight: 500,
                    }}
                  >
                    {player.phone_number}
                  </a>
                ) : (
                  "-"
                )}
              </div>
            </div>
          ))}
        </div>

        <a href="/" style={{ marginTop: 16, display: "inline-block" }}>
          ← Back
        </a>

        <style>{`
          .roster-header {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 120px 130px;
            padding: 12px 16px;
            font-weight: 700;
            background-color: #eaeaea;
            font-size: 14px;
            align-items: center;
            column-gap: 8px;
          }

          .roster-row {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 120px 130px;
            padding: 12px 16px;
            font-size: 16px;
            align-items: center;
            column-gap: 8px;
          }

          .player-cell {
            min-width: 0;
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

          .phone-header,
          .phone-cell {
            text-align: center;
          }

          .section-label {
            padding: 10px 16px;
            background-color: #d4d4d4;
            font-weight: 700;
            font-size: 13px;
            text-transform: uppercase;
          }

          .hi-mobile {
            display: none;
          }

          .hi-desktop {
            display: inline;
          }

          @media (max-width: 700px) {
            .roster-header {
              grid-template-columns: minmax(0, 1fr) 56px 96px;
              font-size: 13px;
              padding: 10px 12px;
            }

            .roster-row {
              grid-template-columns: minmax(0, 1fr) 56px 96px;
              padding: 10px 12px;
              font-size: 14px;
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
        <a href="/">← Back</a>
      </main>
    );
  }
}
