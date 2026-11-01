import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BEAT, C, MONO, SANS, slam } from "../theme";
import camera from "./figures/camera.json";
import cdj from "./figures/cdj.json";
import { ISO_CSS } from "./figures/iso-css";
import laptop from "./figures/laptop.json";
import { LIME_CSS } from "./figures/lime-css";
import turntable from "./figures/turntable.json";

/**
 * Isometric figures built with the Anatomy kit (anatomy/*.mjs), animated like
 * a figure being made: parts drop in one by one with a live parts counter,
 * the assemblies lift apart with callouts, then close again.
 */
type Fig = {
  width: number;
  height: number;
  rise: number;
  groups: string[];
  anchors: Record<string, [number, number]>;
  parts: { group: string; label: string; svg: string }[];
};

type Spec = {
  fig: Fig;
  number: string;
  title: string;
  /** How far each assembly lifts in the exploded view, in world units. */
  lift: Record<string, number>;
  callouts: Record<string, string>;
  headlines: [[string, string], [string, string], [string, string]];
  readout: string;
};

export const FIGURES: Record<"turntable" | "cdj" | "camera" | "laptop", Spec> = {
  turntable: {
    fig: turntable as unknown as Fig,
    number: "01",
    title: "TURNTABLE",
    lift: { base: 0, controls: 0, platter: 70, slipmat: 150, record: 225, tonearm: 285 },
    callouts: {
      record: "RECORD · PER5ON LP",
      slipmat: "SLIPMAT · FELT",
      platter: "PLATTER · DIRECT DRIVE",
      tonearm: "TONEARM · S-SHAPE",
      controls: "PITCH ±8%",
      base: "PLINTH · DAMPED",
    },
    headlines: [["The anatomy", "of a set."], ["Every part", "has a purpose."], ["Built by", "PER5ON."]],
    readout: "DIRECT DRIVE · 33⅓",
  },
  cdj: {
    fig: cdj as unknown as Fig,
    number: "02",
    title: "MEDIA PLAYER",
    lift: { chassis: 0, display: 120, controls: 60, jog: 190 },
    callouts: {
      jog: "JOG WHEEL · ON-JOG DISPLAY",
      display: "WAVEFORM · 112.5 BPM",
      controls: "TEMPO ±16% · HOT CUES",
      chassis: "CHASSIS · USB / LINK",
    },
    headlines: [["Where the", "music lives."], ["Every cue", "is a decision."], ["Played by", "PER5ON."]],
    readout: "PLAYER 1 · LINK ON",
  },
  camera: {
    fig: camera as unknown as Fig,
    number: "03",
    title: "CINEMA CAMERA",
    lift: { rig: 0, body: 50, monitor: 120, top: 170, lens: 90, "matte box": 140 },
    callouts: {
      "matte box": "MATTE BOX · FLAG",
      lens: "PRIME 35MM · FOCUS RING",
      body: "S35 SENSOR · 4.5K",
      top: "TOP HANDLE · EVF",
      monitor: "MONITOR · 7 IN",
      rig: "15MM RAILS · BASEPLATE",
    },
    headlines: [["Every frame", "starts here."], ["Lens, light,", "intention."], ["Shot by", "PER5ON."]],
    readout: "24 FPS · 180° SHUTTER",
  },
  laptop: {
    fig: laptop as unknown as Fig,
    number: "04",
    title: "EDIT SUITE",
    lift: { lid: 120, base: 0, keys: 60 },
    callouts: {
      lid: "TIMELINE · PER5ON_REEL_v12",
      keys: "SHORTCUTS · J K L",
      base: "UNIBODY · 14 IN",
    },
    headlines: [["Where ideas", "get cut."], ["Every frame,", "on the beat."], ["Edited by", "PER5ON."]],
    readout: "30 S · 112.5 BPM",
  },
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Callouts: labels stacked in the left/right gutters (never on top of each other), leader lines to each assembly. */
const Callouts: React.FC<{ spec: Spec; apart: number }> = ({ spec, apart }) => {
  const F = spec.fig;
  const GAP = 30;
  const items = F.groups
    .filter((g) => F.anchors[g] && spec.callouts[g])
    .map((g) => {
      const [x, y0] = F.anchors[g];
      const y = y0 - (spec.lift[g] ?? 0) * apart * F.rise;
      return { g, x, y, right: x > F.width / 2, ly: y };
    });
  for (const right of [false, true]) {
    const side = items.filter((i) => i.right === right).sort((a, b) => a.y - b.y);
    for (let i = 1; i < side.length; i++) side[i].ly = Math.max(side[i].ly, side[i - 1].ly + GAP);
  }
  return (
    <>
      {items.map(({ g, x, y, right, ly }) => {
        const lx = right ? F.width - 4 : 4;
        const knee = right ? Math.max(x + 16, F.width - 150) : Math.min(x - 16, 150);
        return (
          <g key={g} opacity={apart}>
            <circle cx={x} cy={y} r={3.5} fill="#f2f2ef" stroke="#26262a" strokeWidth={1.2} />
            <path d={`M${x},${y} L${knee},${ly} L${lx},${ly}`} fill="none" stroke="#26262a" strokeWidth={0.9} />
            <text x={lx} y={ly - 6} textAnchor={right ? "end" : "start"} fill="#26262a" stroke="#f2f2ef" strokeWidth={5} paintOrder="stroke" strokeLinejoin="round" style={{ fontFamily: MONO, fontSize: 14, letterSpacing: 1.2 }}>
              {spec.callouts[g]}
            </text>
          </g>
        );
      })}
    </>
  );
};

/** A figure. `built` 0..1 assembles it; `apart` 0..1 explodes it. */
export const IsoFigure: React.FC<{ spec: Spec; built: number; apart: number; size: number; callouts?: boolean }> = ({
  spec,
  built,
  apart,
  size,
  callouts = false,
}) => {
  const F = spec.fig;
  const shown = built * F.parts.length;
  return (
    <div className="iso" data-theme="light" style={{ width: size, height: size }}>
      <style>{ISO_CSS + LIME_CSS}</style>
      <svg viewBox={`0 0 ${F.width} ${F.height}`} width={size} height={size} className="iso-svg" style={{ overflow: "visible" }}>
        {F.parts.map((p, i) => {
          const t = Math.max(0, Math.min(1, shown - i));
          if (t <= 0) return null;
          const drop = (1 - Easing.out(Easing.cubic)(t)) * 70 * F.rise;
          const lift = (spec.lift[p.group] ?? 0) * apart * F.rise;
          return <g key={i} transform={`translate(0 ${-(drop + lift)})`} opacity={Math.min(1, t * 2)} dangerouslySetInnerHTML={{ __html: p.svg }} />;
        })}
        {callouts ? <Callouts spec={spec} apart={apart} /> : null}
      </svg>
    </div>
  );
};

/** The turntable figure, kept for the reel's montage. */
export const TurntableFigure: React.FC<{ built: number; apart: number; size: number; callouts?: boolean }> = (props) => (
  <IsoFigure spec={FIGURES.turntable} {...props} />
);
export const PART_COUNT = FIGURES.turntable.fig.parts.length;

export const ANATOMY_FRAMES = 16 * BEAT;
const ASSEMBLE = [6, 6 * BEAT];
const EXPLODE = [8 * BEAT, 10 * BEAT];
const CLOSE = [14 * BEAT, 15 * BEAT];

/** Standalone post: one figure made in front of you, over the intro of the track. */
export const AnatomyPost: React.FC<{ music: boolean; figure: keyof typeof FIGURES }> = ({ music, figure }) => {
  const frame = useCurrentFrame();
  const spec = FIGURES[figure];
  const total = spec.fig.parts.length;
  const built = interpolate(frame, ASSEMBLE, [0, 1], clamp);
  const apart = interpolate(frame, [EXPLODE[0], EXPLODE[1], CLOSE[0], CLOSE[1]], [0, 1, 1, 0], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) });
  const count = Math.round(built * total);
  const ink = "#18181a";
  const stage = frame < EXPLODE[0] ? 0 : frame < CLOSE[0] ? 1 : 2;
  const headline = spec.headlines[stage];
  const headlineAt = [0, EXPLODE[0], CLOSE[0]][stage];
  return (
    <AbsoluteFill style={{ backgroundColor: "#f2f2ef" }}>
      {music ? (
        <Audio src={staticFile("music/forward-pulse.wav")} volume={(f) => interpolate(f, [0, 4, ANATOMY_FRAMES - 12, ANATOMY_FRAMES], [0, 0.95, 0.95, 0], clamp)} />
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
        <div style={{ color: stage === 2 ? C.violet : ink }}>{headline[1]}</div>
      </div>
      <div style={{ position: "absolute", top: 600, left: 80 }}>
        <IsoFigure spec={spec} built={built} apart={apart} size={920} callouts />
      </div>
      {/* card furniture: fig number, title, readout, live parts counter */}
      <div style={{ position: "absolute", top: 140, left: 70, right: 70, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 24, letterSpacing: 3, color: ink, opacity: 0.75 }}>
        <span>
          FIG. {spec.number} — {spec.title}
        </span>
        <span>PER5ON</span>
      </div>
      <div style={{ position: "absolute", top: 1560, left: 70, right: 70, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 24, letterSpacing: 3, color: ink, opacity: 0.75 }}>
        <span>{apart > 0.05 ? `ASSEMBLIES · ${spec.fig.groups.length}` : spec.readout}</span>
        <span>
          {String(count).padStart(2, "0")} / {total} PARTS
        </span>
      </div>
      <div style={{ position: "absolute", top: 1610, left: 70, right: 70, height: 4, backgroundColor: "#e0e0dc" }}>
        <div style={{ width: `${built * 100}%`, height: "100%", backgroundColor: C.lime }} />
      </div>
    </AbsoluteFill>
  );
};

/** The original turntable post, kept under its composition id. */
export const AnatomyTurntable: React.FC<{ music: boolean }> = ({ music }) => <AnatomyPost music={music} figure="turntable" />;
