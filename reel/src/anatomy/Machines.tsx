import React from "react";
import { useCurrentFrame } from "remotion";
import { draw } from "../theme";
import { AnatomyProps, Frame, HAIR, LINE, T, useP } from "./Anatomy";

/**
 * Hairline anatomy of the machines behind the work — camera, decks, mixer,
 * synth, mic — for the fast-cut outro. Generic designs, no brand marks. Each
 * draws on in ~8 frames at speed 1 inside an 800 × 800 viewBox.
 */

/** A leader line from a part to its label, with a node on the part. */
const Callout: React.FC<{ x: number; y: number; lx: number; ly: number; label: string; fg: string; o: number }> = ({
  x,
  y,
  lx,
  ly,
  label,
  fg,
  o,
}) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={6} fill="none" stroke={fg} strokeWidth={HAIR} />
    <path d={`M${x},${y} L${lx},${ly} L${lx + (lx < x ? -40 : 40)},${ly}`} fill="none" stroke={fg} strokeWidth={HAIR} />
    <T x={lx + (lx < x ? -48 : 48)} y={ly + 8} fill={fg} o={1} anchor={lx < x ? "end" : "start"} size={22}>
      {label}
    </T>
  </g>
);

export const CinemaCamera: React.FC<AnatomyProps> = ({ fg, accent, size = 800, speed }) => {
  const p = useP(speed);
  const body = p(0, 6);
  const parts = p(2, 8);
  const labels = p(4, 10);
  const frame = useCurrentFrame();
  return (
    <Frame size={size}>
      {/* body */}
      <rect x={250} y={300} width={300} height={220} rx={10} fill="none" stroke={fg} strokeWidth={LINE} {...draw(body)} />
      {/* lens + matte box */}
      <rect x={140} y={340} width={110} height={140} fill="none" stroke={fg} strokeWidth={LINE} {...draw(parts)} />
      <path d="M140,330 L60,290 L60,530 L140,490 Z" fill="none" stroke={fg} strokeWidth={LINE} {...draw(parts)} />
      {[360, 395, 430, 460].map((y) => (
        <line key={y} x1={150} x2={240} y1={y} y2={y} stroke={fg} strokeWidth={HAIR} opacity={0.5 * parts} />
      ))}
      {/* top handle, EVF, battery, baseplate */}
      <path d="M300,300 L300,250 L500,250 L500,300" fill="none" stroke={fg} strokeWidth={LINE} {...draw(parts)} />
      <rect x={550} y={260} width={120} height={70} rx={8} fill="none" stroke={fg} strokeWidth={LINE} {...draw(parts)} />
      <rect x={550} y={380} width={60} height={120} fill="none" stroke={fg} strokeWidth={HAIR} {...draw(parts)} />
      <rect x={230} y={520} width={360} height={30} fill="none" stroke={fg} strokeWidth={HAIR} {...draw(parts)} />
      {/* sensor */}
      <rect x={275} y={360} width={70} height={52} fill="none" stroke={accent} strokeWidth={LINE} opacity={parts} />
      <circle cx={520} cy={330} r={9} fill={accent} opacity={Math.floor(frame / 4) % 2 ? 0.3 : 1} />
      <Callout x={100} y={300} lx={140} ly={180} label="MATTE BOX" fg={fg} o={labels} />
      <Callout x={310} y={386} lx={330} ly={660} label="S35 SENSOR" fg={fg} o={labels} />
      <Callout x={610} y={295} lx={690} ly={180} label="EVF" fg={fg} o={labels} />
      <Callout x={195} y={480} lx={140} ly={640} label="PRIME 35MM" fg={fg} o={labels} />
      <T x={400} y={740} fill={fg} o={labels} anchor="middle">CINEMA CAMERA · 4.5K · 24 FPS</T>
    </Frame>
  );
};

export const Turntable: React.FC<AnatomyProps> = ({ fg, accent, size = 800, speed }) => {
  const p = useP(speed);
  const frame = useCurrentFrame();
  const body = p(0, 6);
  const parts = p(2, 8);
  const labels = p(4, 10);
  const spin = frame * 12;
  return (
    <Frame size={size}>
      <rect x={90} y={150} width={620} height={500} rx={20} fill="none" stroke={fg} strokeWidth={LINE} {...draw(body)} />
      <g transform={`rotate(${spin} 340 400)`} opacity={parts}>
        <circle cx={340} cy={400} r={200} fill="none" stroke={fg} strokeWidth={LINE} />
        {[170, 140, 110].map((r) => (
          <circle key={r} cx={340} cy={400} r={r} fill="none" stroke={fg} strokeWidth={HAIR} opacity={0.5} />
        ))}
        <circle cx={340} cy={400} r={60} fill={accent} />
        <line x1={340} y1={340} x2={340} y2={290} stroke={fg} strokeWidth={LINE} />
        <circle cx={340} cy={400} r={6} fill={fg} />
      </g>
      {/* tonearm */}
      <path d="M620,200 L620,240 L470,520 L440,540" fill="none" stroke={fg} strokeWidth={LINE} {...draw(parts)} />
      <circle cx={620} cy={200} r={22} fill="none" stroke={fg} strokeWidth={LINE} opacity={parts} />
      {/* pitch fader */}
      <rect x={640} y={380} width={30} height={220} fill="none" stroke={fg} strokeWidth={HAIR} opacity={parts} />
      <rect x={630} y={470} width={50} height={22} fill={fg} opacity={parts} />
      <Callout x={340} y={210} lx={200} ly={90} label="PLATTER 33⅓" fg={fg} o={labels} />
      <Callout x={445} y={535} lx={300} ly={720} label="STYLUS" fg={fg} o={labels} />
      <Callout x={655} y={480} lx={740} ly={720} label="PITCH ±8%" fg={fg} o={labels} />
    </Frame>
  );
};

export const Mixer: React.FC<AnatomyProps> = ({ fg, accent, size = 800, speed }) => {
  const p = useP(speed);
  const frame = useCurrentFrame();
  const body = p(0, 6);
  const parts = p(2, 8);
  const labels = p(4, 10);
  const chans = [200, 330, 470, 600];
  return (
    <Frame size={size}>
      <rect x={130} y={110} width={540} height={600} rx={16} fill="none" stroke={fg} strokeWidth={LINE} {...draw(body)} />
      {chans.map((x, c) => (
        <g key={x} opacity={parts}>
          {[170, 240, 310].map((y, k) => (
            <g key={y}>
              <circle cx={x} cy={y} r={22} fill="none" stroke={fg} strokeWidth={HAIR} />
              <line x1={x} y1={y} x2={x + 16 * Math.cos(frame / 6 + c + k)} y2={y + 16 * Math.sin(frame / 6 + c + k)} stroke={fg} strokeWidth={LINE} />
            </g>
          ))}
          <line x1={x} x2={x} y1={380} y2={590} stroke={fg} strokeWidth={HAIR} />
          <rect x={x - 22} y={430 + 60 * Math.abs(Math.sin(frame / 8 + c))} width={44} height={20} fill={c === 1 ? accent : fg} />
        </g>
      ))}
      <line x1={260} x2={540} y1={650} y2={650} stroke={fg} strokeWidth={HAIR} opacity={parts} />
      <rect x={380 + 60 * Math.sin(frame / 5)} y={636} width={40} height={28} fill={accent} opacity={parts} />
      <Callout x={200} y={170} lx={80} ly={60} label="3-BAND EQ" fg={fg} o={labels} />
      <Callout x={600} y={500} lx={730} ly={420} label="CH FADER" fg={fg} o={labels} />
      <Callout x={400} y={650} lx={520} ly={760} label="CROSSFADER" fg={fg} o={labels} />
    </Frame>
  );
};

export const Synth: React.FC<AnatomyProps> = ({ fg, accent, size = 800, speed }) => {
  const p = useP(speed);
  const frame = useCurrentFrame();
  const body = p(0, 6);
  const parts = p(2, 8);
  const labels = p(4, 10);
  const white = Array.from({ length: 14 }, (_, k) => k);
  const lit = Math.floor(frame / 2) % 14;
  return (
    <Frame size={size}>
      <rect x={60} y={260} width={680} height={320} rx={14} fill="none" stroke={fg} strokeWidth={LINE} {...draw(body)} />
      {white.map((k) => (
        <rect key={k} x={90 + k * 44} y={420} width={42} height={140} fill={k === lit ? accent : "none"} stroke={fg} strokeWidth={HAIR} opacity={parts} />
      ))}
      {white
        .filter((k) => ![2, 6, 9, 13].includes(k))
        .map((k) => (
          <rect key={k} x={90 + k * 44 + 30} y={420} width={26} height={84} fill={fg} opacity={parts} />
        ))}
      {Array.from({ length: 8 }, (_, k) => (
        <g key={k} opacity={parts}>
          <circle cx={120 + k * 76} cy={330} r={22} fill="none" stroke={fg} strokeWidth={HAIR} />
          <line x1={120 + k * 76} y1={330} x2={120 + k * 76 + 15 * Math.cos(k + frame / 7)} y2={330 + 15 * Math.sin(k + frame / 7)} stroke={fg} strokeWidth={LINE} />
        </g>
      ))}
      <path d="M120,200 Q200,120 280,200 T440,200 T600,200 T700,200" fill="none" stroke={accent} strokeWidth={LINE} {...draw(parts)} />
      <Callout x={120} y={330} lx={90} ly={680} label="OSC / FILTER" fg={fg} o={labels} />
      <Callout x={600} y={490} lx={700} ly={680} label="49 KEYS" fg={fg} o={labels} />
      <T x={400} y={110} fill={fg} o={labels} anchor="middle">ANALOG SYNTH · SAW → LPF 24DB</T>
    </Frame>
  );
};

export const StudioMic: React.FC<AnatomyProps> = ({ fg, accent, size = 800, speed }) => {
  const p = useP(speed);
  const body = p(0, 6);
  const parts = p(2, 8);
  const labels = p(4, 10);
  return (
    <Frame size={size}>
      <rect x={320} y={120} width={160} height={300} rx={80} fill="none" stroke={fg} strokeWidth={LINE} {...draw(body)} />
      {[180, 220, 260, 300, 340].map((y) => (
        <line key={y} x1={335} x2={465} y1={y} y2={y} stroke={fg} strokeWidth={HAIR} opacity={0.5 * parts} />
      ))}
      <circle cx={400} cy={250} r={44} fill="none" stroke={accent} strokeWidth={LINE} opacity={parts} />
      <path d="M260,300 Q260,480 400,480 Q540,480 540,300" fill="none" stroke={fg} strokeWidth={LINE} {...draw(parts)} />
      <line x1={400} y1={480} x2={400} y2={640} stroke={fg} strokeWidth={LINE} {...draw(parts)} />
      <rect x={300} y={640} width={200} height={26} rx={6} fill="none" stroke={fg} strokeWidth={LINE} opacity={parts} />
      <Callout x={444} y={250} lx={640} ly={170} label='1" CAPSULE' fg={fg} o={labels} />
      <Callout x={530} y={380} lx={660} ly={460} label="SHOCK MOUNT" fg={fg} o={labels} />
      <Callout x={330} y={300} lx={150} ly={320} label="CARDIOID" fg={fg} o={labels} />
      <T x={400} y={730} fill={fg} o={labels} anchor="middle">CONDENSER · 48V PHANTOM</T>
    </Frame>
  );
};

export const MACHINES: { label: string; Diagram: React.FC<AnatomyProps> }[] = [
  { label: "Camera", Diagram: CinemaCamera },
  { label: "Decks", Diagram: Turntable },
  { label: "Mixer", Diagram: Mixer },
  { label: "Synth", Diagram: Synth },
  { label: "Mic", Diagram: StudioMic },
];
