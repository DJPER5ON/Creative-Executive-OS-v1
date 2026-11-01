import React from "react";
import { AbsoluteFill, interpolate, Series, useCurrentFrame } from "remotion";
import { AnatomyProps } from "../anatomy/Anatomy";
import { FIGURES, IsoFigure } from "../anatomy/AnatomyTurntable";
import { FlightCase, Mixer } from "../brand/Gear";
import { accentFor, BEAT, C, Cut, fgFor, SANS, slam, TopBar } from "../theme";

/** Half-beat cuts, like the reference's fast montage. */
export const MONTAGE_CUT = BEAT / 2;

// Camera, turntable, player and laptop are the isometric Anatomy-kit figures
// (the same ones as the FIG. posts); mixer and flight case are the logo on the gear.
const SHOTS: { word: string; bg: string; Diagram?: React.FC<AnatomyProps>; Gear?: React.FC; iso?: keyof typeof FIGURES }[] = [
  { word: "Shoot", bg: C.lime, iso: "camera" },
  { word: "Spin", bg: C.black, iso: "turntable" },
  { word: "Play", bg: C.violet, iso: "cdj" },
  { word: "Mix", bg: C.lime, Gear: Mixer },
  { word: "Edit", bg: C.violet, iso: "laptop" },
  { word: "Tour", bg: C.black, Gear: FlightCase },
];
export const MONTAGE_FRAMES = SHOTS.length * MONTAGE_CUT;

const Shot: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const { word, bg, Diagram, Gear, iso } = SHOTS[i];
  const fg = fgFor(bg);
  const accent = accentFor(bg);
  return (
    <Cut flash={i % 2 ? C.white : C.lime} sound={null} shake={14} seed={`shot${i}`}>
      <AbsoluteFill style={{ backgroundColor: bg }}>
        <TopBar left="Tools" right={`0${i + 1} / 0${SHOTS.length}`} color={fg} />
        {Diagram ? (
          <div style={{ position: "absolute", top: 330, left: 160, scale: interpolate(frame, [0, MONTAGE_CUT], [1.08, 1]) }}>
            <Diagram fg={fg} accent={accent} size={760} speed={2.6} />
          </div>
        ) : null}
        {iso ? (
          <div style={{ position: "absolute", top: 300, left: 130, scale: interpolate(frame, [0, MONTAGE_CUT], [1.06, 1]) }}>
            <IsoFigure spec={FIGURES[iso]} built={1} apart={0.35 * Math.sin((Math.min(frame, MONTAGE_CUT) / MONTAGE_CUT) * Math.PI)} size={820} />
          </div>
        ) : null}
        {Gear ? (
          <div style={{ position: "absolute", inset: 0, scale: 0.55 * interpolate(frame, [0, MONTAGE_CUT], [1.08, 1]), translate: "0 -185px" }}>
            <Gear />
          </div>
        ) : null}
        <div
          style={{
            position: "absolute",
            top: 1130,
            width: "100%",
            textAlign: "center",
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 150,
            letterSpacing: -6,
            color: fg,
            ...slam(frame, 0, 5),
          }}
        >
          {word}
          <span style={{ color: accent }}>.</span>
        </div>
      </AbsoluteFill>
    </Cut>
  );
};

/** Fast cuts through the tools of the trade, one per half beat. */
export const Montage = () => (
  <Series>
    {SHOTS.map((s, i) => (
      <Series.Sequence key={s.word} name={s.word} durationInFrames={MONTAGE_CUT}>
        <Shot i={i} />
      </Series.Sequence>
    ))}
  </Series>
);
