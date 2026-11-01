import React from "react";
import { AbsoluteFill, interpolate, Series, useCurrentFrame } from "remotion";
import { AnatomyProps } from "../anatomy/Anatomy";
import { CinemaCamera } from "../anatomy/Machines";
import { FlightCase, MediaPlayer, Mixer, Turntable, Vinyl } from "../brand/Gear";
import { accentFor, BEAT, C, Cut, fgFor, SANS, slam, TopBar } from "../theme";

/** Half-beat cuts, like the reference's fast montage. */
export const MONTAGE_CUT = BEAT / 2;

// The camera stays a hairline anatomy drawing; the rest are the logo on the gear.
const SHOTS: { word: string; bg: string; Diagram?: React.FC<AnatomyProps>; Gear?: React.FC }[] = [
  { word: "Shoot", bg: C.black, Diagram: CinemaCamera },
  { word: "Spin", bg: C.violet, Gear: Turntable },
  { word: "Play", bg: C.black, Gear: MediaPlayer },
  { word: "Mix", bg: C.lime, Gear: Mixer },
  { word: "Press", bg: C.violet, Gear: Vinyl },
  { word: "Tour", bg: C.lime, Gear: FlightCase },
];
export const MONTAGE_FRAMES = SHOTS.length * MONTAGE_CUT;

const Shot: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const { word, bg, Diagram, Gear } = SHOTS[i];
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
