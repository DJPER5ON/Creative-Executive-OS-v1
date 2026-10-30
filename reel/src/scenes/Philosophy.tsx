import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BEAT, C, Cut, draw, IN_OUT, Label, prog, SANS, Sfx, slam } from "../theme";

const SWAP = 3 * BEAT;

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
  const sel = prog(frame, 16, 30, IN_OUT);
  const text: React.CSSProperties = { fontFamily: SANS, letterSpacing: -4, lineHeight: 1.05, color: C.white };
  return (
    <Cut flash={C.lime} sound="hit" volume={0.6} seed="philo">
    <AbsoluteFill style={{ backgroundColor: C.violet, scale: first ? 1 : 1.04 }}>
      <Sfx name="hit" at={SWAP} volume={0.55} />
      <Sfx name="zap" at={SWAP} volume={0.35} />
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
            <div style={{ ...text, fontWeight: 300, fontSize: 104, ...slam(t, 0, 8) }}>
              Creativity is my
            </div>
            <div style={{ position: "relative", display: "inline-block", marginTop: 14 }}>
              <div style={{ ...text, fontWeight: 700, fontSize: 140, color: C.lime, padding: "0 10px", ...slam(t, 6, 8) }}>
                playground.
              </div>
              <Selection p={sel} w={780} h={150} color={C.white} />
            </div>
          </>
        ) : (
          <>
            <div style={{ ...text, fontWeight: 300, fontSize: 104, ...slam(t, 0, 8) }}>
              And I love
            </div>
            <div style={{ ...text, fontWeight: 700, fontSize: 150, marginTop: 14, ...slam(t, 6, 8) }}>
              to play<span style={{ color: C.lime }}>.</span>
            </div>
          </>
        )}
      </div>
      {frame === SWAP || frame === SWAP + 1 ? <AbsoluteFill style={{ backgroundColor: C.lime }} /> : null}
    </AbsoluteFill>
    </Cut>
  );
};
