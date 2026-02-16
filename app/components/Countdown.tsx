"use client";

import { useEffect, useMemo, useState } from "react";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function Countdown({ targetIso }: { targetIso: string }) {
  const target = useMemo(() => new Date(targetIso).getTime(), [targetIso]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = target - now;

  if (Number.isNaN(target)) {
    return <div style={{ color: "#ffd7d7" }}>Countdown: invalid date</div>;
  }

  if (diff <= 0) {
    return (
      <div style={{ marginTop: 10, fontWeight: 800, fontSize: 16 }}>
        Blind Draw is live now.
      </div>
    );
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
      <div style={{ opacity: 0.85, fontSize: 14 }}>Begins in</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontWeight: 900, fontSize: 18 }}>
          {days}d
        </span>
        <span style={{ fontWeight: 900, fontSize: 18 }}>
          {pad(hours)}h
        </span>
        <span style={{ fontWeight: 900, fontSize: 18 }}>
          {pad(minutes)}m
        </span>
        <span style={{ fontWeight: 900, fontSize: 18 }}>
          {pad(seconds)}s
        </span>
      </div>
    </div>
  );
}
