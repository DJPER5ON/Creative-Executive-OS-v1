import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BEAT, C, MONO, SANS, slam } from "../theme";
import figure from "./figures/turntable.json";
import { ISO_CSS } from "./figures/iso-css";
import { LIME_CSS } from "./figures/lime-css";

/**
 * The isometric turntable built with the Anatomy kit (anatomy/turntable.mjs),
 * animated like a figure being made: parts drop in one by one with a live
 * parts counter, the assemblies lift apart with callouts, then close again.
 */
type Fig = {
  width: number;
  height: number;
  rise: number;
  groups: string[];
  anchors: Record<string, [number, number]>;
  parts: { group: string; label: string; svg: string }[];
};
const F = figure as unknown as Fig;
export const PART_COUNT = F.parts.length;

/** How far each assembly lifts in the exploded view, in world units. */
const LIFT: Record<string, number> = { base: 0, controls: 0, platter: 70, slipmat: 150, record: 225, tonearm: 285 };
const CALLOUTS: Record<string, string> = {
  record: "RECORD · PER5ON LP",
  slipmat: "SLIPMAT · FELT",
  platter: "PLATTER · DIRECT DRIVE",
  tonearm: "TONEARM · S-SHAPE",
  controls: "PITCH ±8%",
  base: "PLINTH · DAMPED",
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** The figure itself. `built` 0..1 assembles it; `apart` 0..1 explodes it. */
export const TurntableFigure: React.FC<{ built: number; apart: number; size: number; callouts?: boolean }> = ({ built, apart, size, callouts = false }) => {
  const shown = built * PART_COUNT;
  return (
    <div className="iso" data-theme="light" style={{ width: size, height: size }}>
      <style>{ISO_CSS + LIME_CSS}</style>
      <svg viewBox={`0 0 ${F.width} ${F.height}`} width={size} height={size} className="iso-svg" style={{ overflow: "visible" }}>
        {F.parts.map((p, i) => {
          const t = Math.max(0, Math.min(1, shown - i));
          if (t <= 0) return null;
          const drop = (1 - Easing.out(Easing.cubic)(t)) * 70 * F.rise;
          const lift = LIFT[p.group] * apart * F.rise;
          return <g key={i} transform={`translate(0 ${-(drop + lift)})`} opacity={Math.min(1, t * 2)} dangerouslySetInnerHTML={{ __html: p.svg }} />;
        })}
        {callouts
          ? F.groups.map((g) => {
              const [x, y] = F.anchors[g];
              const ly = y - LIFT[g] * apart * F.rise;
              const right = x > F.width / 2;
              const lx = right ? F.width - 10 : 10;
              return (
                <g key={g} opacity={apart}>
                  <circle cx={x} cy={ly} r={3} fill="none" stroke="#26262a" strokeWidth={1} />
                  <path d={`M${x},${ly} L${lx},${ly}`} stroke="#26262a" strokeWidth={0.8} />
                  <text x={lx} y={ly - 6} textAnchor={right ? "end" : "start"} fill="#26262a" style={{ fontFamily: MONO, fontSize: 15, letterSpacing: 1.5 }}>
                    {CALLOUTS[g]}
                  </text>
                </g>
              );
            })
          : null}
      </svg>
    </div>
  );
};

export const ANATOMY_FRAMES = 16 * BEAT;
const ASSEMBLE = [6, 6 * BEAT];
const EXPLODE = [8 * BEAT, 10 * BEAT];
const CLOSE = [14 * BEAT, 15 * BEAT];

/** Standalone post: the turntable made in front of you, Anatomy-style, over the intro of the track. */
export const AnatomyTurntable: React.FC<{ music: boolean }> = ({ music }) => {
  const frame = useCurrentFrame();
  const built = interpolate(frame, ASSEMBLE, [0, 1], clamp);
  const apart = interpolate(frame, [EXPLODE[0], EXPLODE[1], CLOSE[0], CLOSE[1]], [0, 1, 1, 0], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) });
  const count = Math.round(built * PART_COUNT);
  const ink = "#18181a";
  const headline = frame < EXPLODE[0] ? ["The anatomy", "of a set."] : frame < CLOSE[0] ? ["Every part", "has a purpose."] : ["Built by", "PER5ON."];
  const headlineAt = frame < EXPLODE[0] ? 0 : frame < CLOSE[0] ? EXPLODE[0] : CLOSE[0];
  return (
    <AbsoluteFill style={{ backgroundColor: "#f2f2ef" }}>
      {music ? (
        <Audio
          src={staticFile("music/forward-pulse.wav")}
          volume={(f) => interpolate(f, [0, 4, ANATOMY_FRAMES - 12, ANATOMY_FRAMES], [0, 0.95, 0.95, 0], clamp)}
        />
      ) : null}
      {/* faint drafting grid, like the figure's paper */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.5 }}>
        {Array.from({ length: 28 }, (_, i) => (
          <line key={`h${i}`} x1={0} x2={1080} y1={i * 72} y2={i * 72} stroke="#e4e4e0" strokeWidth={1} />
        ))}
        {Array.from({ length: 16 }, (_, i) => (
          <line key={`v${i}`} y1={0} y2={1920} x1={i * 72} x2={i * 72} stroke="#e4e4e0" strokeWidth={1} />
        ))}
      </svg>
      <div style={{ position: "absolute", top: 230, width: "100%", textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 96, lineHeight: 1.02, letterSpacing: -4, color: ink, ...slam(frame, headlineAt, 7) }}>
        <div>{headline[0]}</div>
        <div style={{ color: frame >= CLOSE[0] ? "#7D39EB" : ink }}>{headline[1]}</div>
      </div>
      <div style={{ position: "absolute", top: 640, left: 50 }}>
        <TurntableFigure built={built} apart={apart} size={980} callouts />
      </div>
      {/* card furniture: fig number, title, hint, live readout */}
      <div style={{ position: "absolute", top: 140, left: 70, right: 70, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 24, letterSpacing: 3, color: ink, opacity: 0.75 }}>
        <span>FIG. 01 — TURNTABLE</span>
        <span>PER5ON</span>
      </div>
      <div style={{ position: "absolute", top: 1560, left: 70, right: 70, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 24, letterSpacing: 3, color: ink, opacity: 0.75 }}>
        <span>{apart > 0.05 ? "ASSEMBLIES · 6" : "DIRECT DRIVE · 33⅓"}</span>
        <span>
          {String(count).padStart(2, "0")} / {PART_COUNT} PARTS
        </span>
      </div>
      <div style={{ position: "absolute", top: 1610, left: 70, right: 70, height: 4, backgroundColor: "#e0e0dc" }}>
        <div style={{ width: `${built * 100}%`, height: "100%", backgroundColor: C.lime }} />
      </div>
    </AbsoluteFill>
  );
};
