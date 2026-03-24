import { createClient } from "@supabase/supabase-js";

type Player = {
  id: string;
  name: string;
  ghin: string | null;
  handicap_index: number | null;
  phone_number: string | null;
};

export default async function RosterPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Roster</h1>
      <p>Supabase URL present: {url ? "yes" : "no"}</p>
      <p>Supabase key present: {key ? "yes" : "no"}</p>
      <p>Supabase URL value: {url || "missing"}</p>
      <a href="/">← Back</a>
    </main>
  );
}
