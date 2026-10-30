import React from "react";
import { AbsoluteFill, interpolate, Series, useCurrentFrame } from "remotion";
import { DISCIPLINES } from "../anatomy/Anatomy";
import { accentFor, BottomBar, C, EASE, fgFor, prog, SANS, TopBar, Typewriter } from "../theme";

export const SERVICE_FRAMES = 36;
const BGS = [C.black, C.violet, C.lime, C.white, C.black, C.violet, C.lime];

/** One discipline: its hairline anatomy diagram plus its name. */
const Service: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const bg = BGS[i];
  const fg = fgFor(bg);
  const { name, Diagram } = DISCIPLINES[i];
  const p = prog(frame, 2, 12, EASE);
  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <TopBar left="Disciplines" right={`0${i + 1} / 07`} color={fg} />
      <div style={{ position: "absolute", top: 210, left: 90, fontFamily: SANS, fontWeight: 400, fontSize: 52, color: fg }}>
        {i === 0 ? <Typewriter text="I bring ideas to life through" start={0} cps={2} hideCaretAfter={20} /> : "I bring ideas to life through"}
      </div>
      <div style={{ position: "absolute", top: 380, left: 160 }}>
        <Diagram fg={fg} accent={accentFor(bg)} size={760} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 1250,
          left: 84,
          fontFamily: SANS,
          fontSize: 150,
          letterSpacing: -5,
          lineHeight: 1.02,
          color: fg,
          opacity: p,
          translate: `0 ${interpolate(p, [0, 1], [50, 0])}px`,
        }}
      >
        {name[0] ? <div style={{ fontWeight: 300 }}>{name[0]}</div> : null}
        <div style={{ fontWeight: 700 }}>
          {name[1]}
          <span style={{ color: accentFor(bg) }}>.</span>
        </div>
      </div>
      <BottomBar color={fg} />
    </AbsoluteFill>
  );
};

export const Services = () => (
  <Series>
    {DISCIPLINES.map((d, i) => (
      <Series.Sequence key={d.name.join(" ")} name={d.name.join(" ").trim()} durationInFrames={SERVICE_FRAMES}>
        <Service i={i} />
      </Series.Sequence>
    ))}
  </Series>
);
