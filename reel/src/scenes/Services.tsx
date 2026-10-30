import React from "react";
import { AbsoluteFill, interpolate, random, Series, useCurrentFrame } from "remotion";
import { DISCIPLINES } from "../anatomy/Anatomy";
import { accentFor, BACK, BEAT, C, Cut, fgFor, MONO, SANS, Sfx, TopBar } from "../theme";

export const SERVICE_FRAMES = 2 * BEAT;
const BGS = [C.black, C.violet, C.lime, C.white, C.black, C.violet, C.lime, C.black];
const FILM = 1; // index of Filmmaking, which gets film grain and sprockets

/**
 * The discipline names on a 3D wheel. Each card rolls the wheel one step,
 * overshooting slightly, with the neighbours tilted away above and below.
 */
const NameWheel: React.FC<{ i: number; fg: string; accent: string }> = ({ i, fg, accent }) => {
  const frame = useCurrentFrame();
  const pos = interpolate(frame, [0, 10], [i - 1, i], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: BACK });
  return (
    <div style={{ position: "absolute", top: 1180, left: 84, right: 60, perspective: 900 }}>
      {DISCIPLINES.map(({ name }, k) => {
        const d = k - pos;
        if (Math.abs(d) > 1.6) return null;
        const near = Math.max(0, 1 - Math.abs(d));
        return (
          <div
            key={name.join()}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              fontFamily: SANS,
              fontSize: 104,
              letterSpacing: -4,
              lineHeight: 1,
              whiteSpace: "nowrap",
              color: fg,
              translate: `0 ${d * 132 - 52}px`,
              rotate: `x ${-d * 38}deg`,
              scale: 0.55 + 0.45 * near,
              transformOrigin: "left center",
              opacity: Math.max(0, 1 - Math.abs(d) * 0.7),
            }}
          >
            {name[0] ? <span style={{ fontWeight: 300 }}>{name[0]} </span> : null}
            <span style={{ fontWeight: 700 }}>{name[1]}</span>
            <span style={{ color: accent, opacity: near > 0.5 ? 1 : 0 }}>.</span>
          </div>
        );
      })}
    </div>
  );
};

/** Film texture for the Filmmaking card: sprocket strips, grain and light flicker. */
const FilmFx: React.FC<{ fg: string }> = ({ fg }) => {
  const frame = useCurrentFrame();
  const holes = Array.from({ length: 22 }, (_, k) => k);
  const scroll = (frame * 14) % 96;
  const flickerLight = 0.02 + 0.05 * random(`flick${frame}`);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame} />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        {[0, 1020].map((x) => (
          <g key={x}>
            <rect x={x} y={0} width={60} height={1920} fill={C.black} opacity={0.35} />
            {holes.map((k) => (
              <rect key={k} x={x + 16} y={k * 96 - 96 + scroll} width={28} height={44} rx={6} fill={C.violet} stroke={fg} strokeWidth={1.5} opacity={0.8} />
            ))}
          </g>
        ))}
        <rect width={1080} height={1920} filter="url(#grain)" opacity={0.14} style={{ mixBlendMode: "overlay" }} />
      </svg>
      <AbsoluteFill style={{ backgroundColor: random(`lt${frame}`) > 0.5 ? C.white : C.black, opacity: flickerLight }} />
    </>
  );
};

/** One discipline: its hairline anatomy diagram, with the name on the wheel below. */
const Service: React.FC<{ i: number }> = ({ i }) => {
  const bg = BGS[i];
  const fg = fgFor(bg);
  const accent = accentFor(bg);
  const { Diagram } = DISCIPLINES[i];
  return (
    <Cut flash={i % 2 ? C.lime : C.white} sound={i === FILM ? "shutter" : "zap"} volume={0.45} shake={12} seed={`svc${i}`}>
      <AbsoluteFill style={{ backgroundColor: bg }}>
        <Sfx name="whoosh" volume={0.35} />
        <TopBar left="Disciplines" right={`0${i + 1} / 0${DISCIPLINES.length}`} color={fg} />
        <div style={{ position: "absolute", top: 270, left: 90, fontFamily: SANS, fontWeight: 400, fontSize: 52, color: fg }}>
          I bring ideas to life through
        </div>
        <div style={{ position: "absolute", top: 360, left: 220 }}>
          <Diagram fg={fg} accent={accent} size={640} speed={1.15} sound />
        </div>
        <NameWheel i={i} fg={fg} accent={accent} />
        {i === FILM ? <FilmFx fg={fg} /> : null}
        {i === FILM ? (
          <div style={{ position: "absolute", top: 1000, right: 90, fontFamily: MONO, fontSize: 26, letterSpacing: 2, color: fg, opacity: 0.8 }}>
            24 FPS · 35MM
          </div>
        ) : null}
      </AbsoluteFill>
    </Cut>
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
