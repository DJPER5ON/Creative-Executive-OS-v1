import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, interpolate, Series, staticFile, useCurrentFrame } from "remotion";
import { BEAT, C, Cut, fgFor, MONO, SANS, slam } from "../theme";
import { GEAR } from "./Gear";

/** One gear shot per beat; two passes, the second on swapped backgrounds. */
export const SHOT_FRAMES = BEAT;
const PASSES = [GEAR, GEAR.map((g, i) => ({ ...g, bg: [C.black, C.lime, C.violet, C.white][i % 4] }))];
export const BRAND_WORLD_FRAMES = PASSES.length * GEAR.length * SHOT_FRAMES;
/** Where the loop starts in the music: the drop (beat 36). */
const MUSIC_FROM = 36 * BEAT;

/**
 * A gear shot: the logo on a piece of kit, the action word on top, and a
 * negative flash mid-shot (the frame inverts to monochrome for two frames).
 */
export const GearShot: React.FC<{ i: number; bg: string; scale?: number; word?: boolean; still?: boolean }> = ({ i, bg, scale = 0.84, word = true, still = false }) => {
  const live = useCurrentFrame();
  // A still is drawn as the shot looks once the word has landed, before the flash.
  const frame = still ? 6 : live;
  const { Art, word: label } = GEAR[i];
  const fg = fgFor(bg);
  const negative = frame === 7 || frame === 8;
  return (
    <AbsoluteFill style={{ backgroundColor: bg, filter: negative ? "invert(1) grayscale(1) contrast(1.2)" : undefined }}>
      <div style={{ position: "absolute", inset: 0, scale: scale * interpolate(frame, [0, SHOT_FRAMES], [1.06, 1]), translate: "0 70px" }}>
        <Art />
      </div>
      {word ? (
        <>
          <div style={{ position: "absolute", top: 130, left: 90, right: 90, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 26, letterSpacing: 3, color: fg, opacity: 0.8 }}>
            <span>PER5ON</span>
            <span>{String(i + 1).padStart(2, "0")} / {String(GEAR.length).padStart(2, "0")}</span>
          </div>
          <div style={{ position: "absolute", top: 180, width: "100%", textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 150, letterSpacing: -6, color: fg, ...slam(frame, 0, 5) }}>
            {label}
            <span style={{ color: bg === C.lime ? C.violet : C.lime }}>.</span>
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

/** Short looping brand-world reel: the P mark across the gear, cut on the beat. */
export const BrandWorld: React.FC<{ music: boolean }> = ({ music }) => (
  <AbsoluteFill style={{ backgroundColor: C.black }}>
    {music ? (
      <Audio
        src={staticFile("music/forward-pulse.wav")}
        trimBefore={MUSIC_FROM}
        volume={(f) => interpolate(f, [0, 3, BRAND_WORLD_FRAMES - 10, BRAND_WORLD_FRAMES], [0, 0.95, 0.95, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
    ) : null}
    <Series>
      {PASSES.flatMap((pass, p) =>
        pass.map((g, i) => (
          <Series.Sequence key={`${p}-${g.id}`} name={`${g.word} ${p + 1}`} durationInFrames={SHOT_FRAMES}>
            <Cut flash={i % 2 ? C.white : C.lime} sound={null} shake={12} seed={`bw${p}${i}`}>
              <GearShot i={i} bg={g.bg} />
            </Cut>
          </Series.Sequence>
        )),
      )}
    </Series>
  </AbsoluteFill>
);

/** A still for the grid: one gear shot as it looks once the word has landed. */
export const GearStill: React.FC<{ i: number; bg: string }> = ({ i, bg }) => <GearShot i={i} bg={bg} still />;

/** The same still for a 4:5 feed post: the full 9:16 design scaled to fit, on its own colour. */
export const GearPost: React.FC<{ i: number; bg: string }> = ({ i, bg }) => (
  <AbsoluteFill style={{ backgroundColor: bg }}>
    <div style={{ position: "absolute", width: 1080, height: 1920, left: 0, top: 0, scale: 1350 / 1920, transformOrigin: "50% 0" }}>
      <GearShot i={i} bg={bg} still />
    </div>
  </AbsoluteFill>
);
