import React from "react";
import { AbsoluteFill, interpolate, Series, useCurrentFrame } from "remotion";
import { AnatomyProps, Branding } from "../anatomy/Anatomy";
import { CinemaCamera, Mixer, StudioMic, Synth, Turntable } from "../anatomy/Machines";
import { accentFor, BEAT, C, Cut, fgFor, SANS, slam, TopBar } from "../theme";

/** Half-beat cuts, like the reference's fast montage. */
export const MONTAGE_CUT = BEAT / 2;

const SHOTS: { word: string; bg: string; Diagram: React.FC<AnatomyProps> }[] = [
  { word: "Shoot", bg: C.black, Diagram: CinemaCamera },
  { word: "Spin", bg: C.violet, Diagram: Turntable },
  { word: "Mix", bg: C.lime, Diagram: Mixer },
  { word: "Compose", bg: C.white, Diagram: Synth },
  { word: "Record", bg: C.black, Diagram: StudioMic },
  { word: "Design", bg: C.violet, Diagram: Branding },
];
export const MONTAGE_FRAMES = SHOTS.length * MONTAGE_CUT;

const Shot: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const { word, bg, Diagram } = SHOTS[i];
  const fg = fgFor(bg);
  const accent = accentFor(bg);
  return (
    <Cut flash={i % 2 ? C.white : C.lime} sound={null} shake={14} seed={`shot${i}`}>
      <AbsoluteFill style={{ backgroundColor: bg }}>
        <TopBar left="Tools" right={`0${i + 1} / 0${SHOTS.length}`} color={fg} />
        <div style={{ position: "absolute", top: 330, left: 160, scale: interpolate(frame, [0, MONTAGE_CUT], [1.08, 1]) }}>
          <Diagram fg={fg} accent={accent} size={760} speed={2.6} />
        </div>
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
