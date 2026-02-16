import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.GROUPME_ACCESS_TOKEN;
  const groupId = process.env.GROUPME_GROUP_ID;

  if (!token || !groupId) {
    return NextResponse.json(
      { error: "Missing GROUPME_ACCESS_TOKEN or GROUPME_GROUP_ID" },
      { status: 500 }
    );
  }

  const url = new URL(`https://api.groupme.com/v3/groups/${groupId}/messages`);
  url.searchParams.set("limit", "20");

  const res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      "X-Access-Token": token,
    },
    // keep fresh
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: "GroupMe API error", status: res.status, data },
      { status: res.status }
    );
  }

  // GroupMe wraps responses in { response: ... } per their docs.
  return NextResponse.json(data);
}
