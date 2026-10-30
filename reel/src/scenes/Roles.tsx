import React from "react";
import { AbsoluteFill, Series, useCurrentFrame } from "remotion";
import { accentFor, BEAT, C, Cut, fgFor, flicker, SANS, slam, TopBar } from "../theme";

export const ROLE_FRAMES = BEAT;

const ROLES: { a: string; b: string; bg: string; mark: "circle" | "square" | "triangle" }[] = [
  { a: "Creative", b: "Director", bg: C.violet, mark: "circle" },
  { a: "Motion", b: "Designer", bg: C.lime, mark: "square" },
  { a: "Creative", b: "Consultant", bg: C.black, mark: "triangle" },
];

const Mark: React.FC<{ kind: string; color: string }> = ({ kind, color }) => (
  <svg width={34} height={34} viewBox="0 0 34 34" style={{ marginLeft: 10, marginBottom: 70 }}>
    {kind === "circle" && <circle cx={17} cy={17} r={15} fill={color} />}
    {kind === "square" && <rect x={3} y={3} width={28} height={28} fill={color} />}
    {kind === "triangle" && <path d="M17,2 L32,31 L2,31 Z" fill={color} />}
  </svg>
);

const Role: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const r = ROLES[i];
  const fg = fgFor(r.bg);
  return (
    <Cut flash={accentFor(r.bg)} sound={i === 0 ? "hit" : "tick"} volume={i === 0 ? 0.6 : 0.8} seed={`role${i}`}>
    <AbsoluteFill style={{ backgroundColor: r.bg }}>
      <TopBar left="Role" right={`0${i + 1} / 03`} color={fg} />
      <div style={{ position: "absolute", top: 700, left: 90, fontFamily: SANS, fontWeight: 700, fontSize: 84, color: fg, opacity: flicker(frame) }}>
        I’m your
      </div>
      <div
        style={{
          position: "absolute",
          top: 830,
          left: 84,
          display: "flex",
          alignItems: "flex-end",
          fontFamily: SANS,
          fontSize: 150,
          letterSpacing: -5,
          lineHeight: 1.02,
          color: fg,
          transformOrigin: "left center",
          ...slam(frame, 0, 8),
        }}
      >
        <div>
          <div style={{ fontWeight: 300 }}>{r.a}</div>
          <div style={{ fontWeight: 700 }}>{r.b}</div>
        </div>
        <Mark kind={r.mark} color={accentFor(r.bg)} />
      </div>
    </AbsoluteFill>
    </Cut>
  );
};

export const Roles = () => (
  <Series>
    {ROLES.map((r, i) => (
      <Series.Sequence key={r.b} name={`${r.a} ${r.b}`} durationInFrames={ROLE_FRAMES}>
        <Role i={i} />
      </Series.Sequence>
    ))}
  </Series>
);
