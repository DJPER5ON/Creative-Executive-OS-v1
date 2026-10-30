import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, draw, EASE, IN_OUT, Label, prog, SANS } from "../theme";

const SWAP = 50;

/** Hairline selection box with corner handles, like a design tool. */
const Selection: React.FC<{ p: number; w: number; h: number; color: string }> = ({ p, w, h, color }) => (
  <svg width={w + 40} height={h + 40} style={{ position: "absolute", left: -20, top: -20, overflow: "visible" }}>
    <rect x={20} y={20} width={w} height={h} fill="none" stroke={color} strokeWidth={2} {...draw(p)} />
    {[20, 20 + w].flatMap((x) =>
      [20, 20 + h].map((y) => (
        <rect key={`${x}${y}`} x={x - 9} y={y - 9} width={18} height={18} fill={C.violet} stroke={color} strokeWidth={2} opacity={p} />
      )),
    )}
  </svg>
);

/** "Creativity is my playground. And I love to play." on a hairline target. */
export const Philosophy = () => {
  const frame = useCurrentFrame();
  const rings = prog(frame, 0, 24, IN_OUT);
  const first = frame < SWAP;
  const t = first ? frame : frame - SWAP;
  const line1 = prog(t, 0, 10, EASE);
  const line2 = prog(t, 8, 18, EASE);
  const sel = prog(frame, 16, 30, IN_OUT);
  const text: React.CSSProperties = { fontFamily: SANS, letterSpacing: -4, lineHeight: 1.05, color: C.white };
  return (
    <AbsoluteFill style={{ backgroundColor: C.violet }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g stroke={C.white} strokeWidth={1.5} fill="none" opacity={0.35}>
          {[180, 330, 480].map((r) => (
            <circle key={r} cx={540} cy={960} r={r} {...draw(rings)} />
          ))}
          <line x1={540} x2={540} y1={960 - 620 * rings} y2={960 + 620 * rings} />
          <line x1={540 - 620 * rings} x2={540 + 620 * rings} y1={960} y2={960} />
        </g>
      </svg>
      <Label color={C.white} style={{ position: "absolute", top: 200, left: 90, opacity: 0.8 }}>
        Philosophy
      </Label>
      <div style={{ position: "absolute", top: 780, width: "100%", textAlign: "center" }}>
        {first ? (
          <>
            <div style={{ ...text, fontWeight: 300, fontSize: 104, opacity: line1, translate: `0 ${interpolate(line1, [0, 1], [40, 0])}px` }}>
              Creativity is my
            </div>
            <div style={{ position: "relative", display: "inline-block", marginTop: 14 }}>
              <div style={{ ...text, fontWeight: 700, fontSize: 140, color: C.lime, opacity: line2, padding: "0 10px" }}>
                playground.
              </div>
              <Selection p={sel} w={780} h={150} color={C.white} />
            </div>
          </>
        ) : (
          <>
            <div style={{ ...text, fontWeight: 300, fontSize: 104, opacity: line1, translate: `0 ${interpolate(line1, [0, 1], [40, 0])}px` }}>
              And I love
            </div>
            <div style={{ ...text, fontWeight: 700, fontSize: 150, marginTop: 14, opacity: line2, translate: `0 ${interpolate(line2, [0, 1], [40, 0])}px` }}>
              to play<span style={{ color: C.lime }}>.</span>
            </div>
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};
