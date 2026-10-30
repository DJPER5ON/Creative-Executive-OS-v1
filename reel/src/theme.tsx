import { loadFont } from "@remotion/fonts";
import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";

export const C = {
  black: "#000000",
  violet: "#7D39EB",
  lime: "#C6FF33",
  white: "#FFFFFF",
};

// Foreground (text + hairline) color for each background.
export const fgFor = (bg: string) =>
  bg === C.lime || bg === C.white ? C.black : C.white;
// Accent color that stays readable on each background.
export const accentFor = (bg: string) =>
  bg === C.black || bg === C.violet ? C.lime : bg === C.lime ? C.violet : C.violet;

export const SANS = "Inter Tight";
export const MONO = "JetBrains Mono";

for (const w of ["300", "400", "700"]) {
  loadFont({ family: SANS, url: staticFile(`fonts/inter-tight-latin-${w}-normal.woff2`), weight: w });
}
for (const w of ["400", "500"]) {
  loadFont({ family: MONO, url: staticFile(`fonts/jetbrains-mono-latin-${w}-normal.woff2`), weight: w });
}

export const EASE = Easing.bezier(0.16, 1, 0.3, 1);
export const IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
/** Overshoots its target slightly before settling — for bold, punchy entrances. */
export const BACK = Easing.bezier(0.34, 1.7, 0.5, 1);

/** One beat in frames: 112.5 BPM at 30 fps. Scene lengths sit on this grid. */
export const BEAT = 16;

export type SfxName = "hit" | "whoosh" | "zap" | "type" | "tick" | "clap" | "riser" | "boom" | "shutter";

/** Lets a composition switch every sound effect off, e.g. for a silent export. */
export const SfxEnabled = React.createContext(true);

/** A sound effect from public/sfx, starting at frame `at` of the current sequence. */
export const Sfx: React.FC<{ name: SfxName; at?: number; volume?: number; durationInFrames?: number }> = ({
  name,
  at = 0,
  volume = 0.8,
  durationInFrames,
}) =>
  React.useContext(SfxEnabled) ? (
    <Sequence from={at} durationInFrames={durationInFrames} layout="none" name={`sfx:${name}`}>
      <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
    </Sequence>
  ) : null;

/**
 * A hard cut with the reference's flicker: a two-frame flash of `flash`, a
 * dropped frame, then the scene, with a short decaying camera shake and a
 * sound on the cut.
 */
export const Cut: React.FC<{
  children: React.ReactNode;
  flash?: string;
  sound?: SfxName | null;
  volume?: number;
  shake?: number;
  seed?: string;
}> = ({ children, flash = C.white, sound = "hit", volume = 0.7, shake = 18, seed = "cut" }) => {
  const frame = useCurrentFrame();
  const decay = Math.max(0, 1 - frame / 8);
  const dx = (random(`${seed}x${frame}`) - 0.5) * 2 * shake * decay;
  const dy = (random(`${seed}y${frame}`) - 0.5) * 2 * shake * decay;
  const flashOn = frame === 0 || frame === 1 || frame === 4;
  const dropped = frame === 2;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ translate: `${dx}px ${dy}px`, scale: 1 + 0.03 * decay, opacity: dropped ? 0 : 1 }}>
        {children}
      </AbsoluteFill>
      {flashOn ? <AbsoluteFill style={{ backgroundColor: flash, opacity: frame === 4 ? 0.5 : 1 }} /> : null}
      {sound ? <Sfx name={sound} volume={volume} /> : null}
    </AbsoluteFill>
  );
};

/** Style for a headline that slams in: oversized, blurred and low, then overshoots into place. */
export const slam = (frame: number, start = 0, dur = 9): React.CSSProperties => {
  const p = interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: BACK,
  });
  const blur = interpolate(frame, [start, start + dur * 0.6], [16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return {
    opacity: frame < start ? 0 : 1,
    scale: interpolate(p, [0, 1], [1.4, 1]),
    translate: `0 ${interpolate(p, [0, 1], [120, 0])}px`,
    filter: blur > 0.1 ? `blur(${blur}px)` : undefined,
  };
};

/** Opacity for a flicker-on: blinks on/off for a few frames, then stays on. */
export const flicker = (frame: number, start = 0) => {
  const f = frame - start;
  if (f < 0) return 0;
  return [1, 0, 1, 1, 0, 1][f] ?? 1;
};

/** 0 → 1 progress between two frames, eased and clamped. */
export const prog = (frame: number, from: number, to: number, easing = EASE) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** Props that make an SVG stroke draw itself on as p goes 0 → 1. */
export const draw = (p: number) => ({
  pathLength: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1 - p,
});

/** Text that types on character by character, with a lime caret. */
export const Typewriter: React.FC<{
  text: string;
  start: number;
  cps?: number; // characters per frame
  caret?: string;
  hideCaretAfter?: number;
  style?: React.CSSProperties;
  render?: (shown: string) => React.ReactNode;
  sound?: boolean;
}> = ({ text, start, cps = 0.6, caret = C.lime, hideCaretAfter, style, render, sound = true }) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.min(text.length, Math.floor((frame - start) * cps)));
  const shown = text.slice(0, n);
  const blinkOn = Math.floor(frame / 8) % 2 === 0 || n < text.length;
  const caretVisible =
    frame >= start && blinkOn && (hideCaretAfter === undefined || frame < hideCaretAfter);
  return (
    <span style={{ whiteSpace: "pre", ...style }}>
      {sound ? <Sfx name="type" at={start} volume={0.55} durationInFrames={Math.ceil(text.length / cps)} /> : null}
      {render ? render(shown) : shown}
      <span
        style={{
          display: "inline-block",
          width: "0.06em",
          height: "0.9em",
          marginLeft: "0.04em",
          verticalAlign: "-0.08em",
          background: caret,
          opacity: caretVisible ? 1 : 0,
        }}
      />
    </span>
  );
};

/** Small monospace label used for annotations and counters. */
export const Label: React.FC<{
  children: React.ReactNode;
  color: string;
  style?: React.CSSProperties;
}> = ({ children, color, style }) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: 28,
      letterSpacing: 2,
      textTransform: "uppercase",
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

/**
 * Full-frame hairline construction guides: two horizontals and two verticals
 * that draw in from the frame edges, with node circles at the intersections.
 */
export const Guides: React.FC<{
  color: string;
  start?: number;
  xs?: number[];
  ys?: number[];
  opacity?: number;
  fadeOutAt?: number;
}> = ({ color, start = 0, xs = [140, 940], ys = [760, 1160], opacity = 0.35, fadeOutAt }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, start + 18, IN_OUT);
  const out = fadeOutAt === undefined ? 1 : 1 - prog(frame, fadeOutAt, fadeOutAt + 10);
  const nodes = prog(frame, start + 12, start + 22);
  return (
    <svg
      width={1080}
      height={1920}
      style={{ position: "absolute", inset: 0, opacity: opacity * out }}
    >
      {ys.map((y) => (
        <line key={`h${y}`} x1={0} x2={1080 * p} y1={y} y2={y} stroke={color} strokeWidth={1.5} />
      ))}
      {xs.map((x) => (
        <line key={`v${x}`} x1={x} x2={x} y1={0} y2={1920 * p} stroke={color} strokeWidth={1.5} />
      ))}
      {xs.flatMap((x) =>
        ys.map((y) => (
          <circle
            key={`n${x}-${y}`}
            cx={x}
            cy={y}
            r={7 * nodes}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
          />
        )),
      )}
    </svg>
  );
};

/** Top bar used on most scenes: section name left, counter right. */
export const TopBar: React.FC<{ left: string; right?: string; color: string }> = ({
  left,
  right,
  color,
}) => (
  <div
    style={{
      position: "absolute",
      top: 200,
      left: 90,
      right: 90,
      display: "flex",
      justifyContent: "space-between",
    }}
  >
    <Label color={color}>{left}</Label>
    {right ? <Label color={color}>{right}</Label> : null}
  </div>
);
