import React from "react";
import { AbsoluteFill, Series, useCurrentFrame } from "remotion";
import { DISCIPLINES } from "../anatomy/Anatomy";
import { accentFor, BEAT, C, Cut, draw, fgFor, IN_OUT, prog, SANS, slam } from "../theme";

export const MANIFESTO_FRAMES = 2 * BEAT;

const Headline: React.FC<{ a: string; b: string; color: string; accent: string; top: number }> = ({ a, b, color, accent, top }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top,
        width: "100%",
        textAlign: "center",
        fontFamily: SANS,
        fontWeight: 700,
        fontSize: 150,
        letterSpacing: -5,
        lineHeight: 1.02,
        color,
        ...slam(frame, 0, 9),
      }}
    >
      <div>{a}</div>
      <div>
        {b}
        <span style={{ color: accent }}>.</span>
      </div>
    </div>
  );
};

/** "One mind." — a single node with orbit hairlines. */
const OneMind = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, 0, 20, IN_OUT);
  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g stroke={C.white} strokeWidth={1.5} fill="none" opacity={0.4}>
          <circle cx={540} cy={1150} r={160} {...draw(p)} />
          <circle cx={540} cy={1150} r={260} {...draw(p)} />
        </g>
        <circle cx={540} cy={1150} r={36 * p} fill={C.lime} />
      </svg>
      <Headline a="One" b="mind" color={C.white} accent={C.lime} top={420} />
    </AbsoluteFill>
  );
};

/** "Multiple disciplines." — every anatomy diagram at once. */
const Multiple = () => {
  const frame = useCurrentFrame();
  // Strobe through the palette for the first frames, like a montage of every discipline.
  const strobe = [C.lime, C.black, C.white, C.violet, C.lime, C.black];
  const bg = frame < strobe.length ? strobe[frame] : C.violet;
  const fg = fgFor(bg);
  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <div style={{ position: "absolute", top: 720, left: 90, right: 90, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "40px 50px" }}>
        {DISCIPLINES.map(({ name, Diagram }) => (
          <Diagram key={name.join()} fg={fg} accent={accentFor(bg)} size={210} speed={1.6} />
        ))}
      </div>
      <Headline a="Multiple" b="disciplines" color={fg} accent={C.lime} top={300} />
    </AbsoluteFill>
  );
};

/** "Endless possibilities." — hairlines radiating out past the frame. */
const Endless = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, 0, 24, IN_OUT);
  return (
    <AbsoluteFill style={{ backgroundColor: C.lime }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g stroke={C.black} strokeWidth={1.5} opacity={0.35} transform={`rotate(${frame * 0.6} 540 1180)`}>
          {Array.from({ length: 36 }, (_, i) => {
            const a = (i / 36) * Math.PI * 2;
            return (
              <line key={i} x1={540 + Math.cos(a) * 90} y1={1180 + Math.sin(a) * 90} x2={540 + Math.cos(a) * (90 + 900 * p)} y2={1180 + Math.sin(a) * (90 + 900 * p)} />
            );
          })}
        </g>
        <circle cx={540} cy={1180} r={90} fill="none" stroke={C.black} strokeWidth={3} {...draw(p)} />
      </svg>
      <Headline a="Endless" b="possibilities" color={C.black} accent={C.violet} top={360} />
    </AbsoluteFill>
  );
};

export const Manifesto = () => (
  <Series>
    <Series.Sequence name="One mind" durationInFrames={MANIFESTO_FRAMES}>
      <Cut flash={C.white} sound="hit" seed="one">
        <OneMind />
      </Cut>
    </Series.Sequence>
    <Series.Sequence name="Multiple disciplines" durationInFrames={MANIFESTO_FRAMES}>
      <Cut flash={C.lime} sound="zap" volume={0.6} seed="multi">
        <Multiple />
      </Cut>
    </Series.Sequence>
    <Series.Sequence name="Endless possibilities" durationInFrames={MANIFESTO_FRAMES}>
      <Cut flash={C.violet} sound="hit" seed="endless">
        <Endless />
      </Cut>
    </Series.Sequence>
  </Series>
);
