import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Logo } from "../Logo";
import { BEAT, C, Cut, flicker, Guides, IN_OUT, Label, prog, SANS, Sfx, slam } from "../theme";

/** The alias lands on beat 5 of the end card; the melt starts 20 frames before. */
const MORPH_FRAMES = 20;
const MORPH = 5 * BEAT - MORPH_FRAMES;

/**
 * Liquid morph between two pieces of text: each side blurs out or in while the
 * container's alpha threshold fuses the blurred shapes into one solid blob.
 */
const Morph: React.FC<{ from: React.ReactNode; to: React.ReactNode; p: number; style?: React.CSSProperties }> = ({
  from,
  to,
  p,
  style,
}) => {
  const blurOut = p <= 0 ? 0 : Math.min(14 / Math.max(1 - p, 0.001) - 14, 90);
  const blurIn = p >= 1 ? 0 : Math.min(14 / Math.max(p, 0.001) - 14, 90);
  const layer: React.CSSProperties = { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" };
  const morphing = p > 0 && p < 1;
  return (
    <div style={{ position: "relative", ...style, filter: morphing ? "url(#goo)" : undefined }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="goo">
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140" />
        </filter>
      </svg>
      <div style={{ ...layer, opacity: Math.pow(1 - p, 0.4), filter: blurOut > 0.1 ? `blur(${blurOut}px)` : undefined }}>{from}</div>
      <div style={{ ...layer, opacity: Math.pow(p, 0.4), filter: blurIn > 0.1 ? `blur(${blurIn}px)` : undefined }}>{to}</div>
    </div>
  );
};

/** Logo, name morphing into PER5ON, handle, availability — then holds so it can be read. */
export const EndCard = () => {
  const frame = useCurrentFrame();
  const rest = flicker(frame, 20);
  const morph = interpolate(frame, [MORPH, MORPH + MORPH_FRAMES], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const after = frame >= MORPH + MORPH_FRAMES;
  // A small punch-in on the beat the alias lands.
  const punch = interpolate(frame, [MORPH + MORPH_FRAMES - 2, MORPH + MORPH_FRAMES + 2, MORPH + MORPH_FRAMES + 10], [1, 1.08, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Cut flash={C.lime} sound="boom" volume={0.9} shake={26} seed="end">
      <AbsoluteFill style={{ backgroundColor: C.black }}>
        <Sfx name="hit" at={10} volume={0.5} />
        <Sfx name="tick" at={20} volume={0.7} />
        <Sfx name="whoosh" at={MORPH - 6} volume={0.6} />
        <Sfx name="zap" at={MORPH + 4} volume={0.4} />
        <Sfx name="hit" at={MORPH + MORPH_FRAMES} volume={0.85} />
        <Guides color={C.white} xs={[90, 990]} ys={[740, 1000]} opacity={0.3} fadeOutAt={60} />
        <div style={{ position: "absolute", top: 330, left: 540, translate: "-50% 0" }}>
          <Logo size={320} color={C.white} outline={prog(frame, 0, 14, IN_OUT)} fill={prog(frame, 10, 18)} />
        </div>
        <div style={{ position: "absolute", top: 730, left: 0, right: 0, height: 270, ...slam(frame, 10, 9), scale: punch }}>
          <Morph
            p={morph}
            style={{ width: "100%", height: "100%", fontFamily: SANS, color: C.white, textAlign: "center" }}
            from={
              <div style={{ fontSize: 120, letterSpacing: -4, lineHeight: 1.02 }}>
                <div style={{ fontWeight: 300 }}>Elmohanad</div>
                <div style={{ fontWeight: 700 }}>Karoum</div>
              </div>
            }
            to={
              <div style={{ fontSize: 210, fontWeight: 700, letterSpacing: -9, lineHeight: 1 }}>
                PER<span style={{ color: C.lime }}>5</span>ON
              </div>
            }
          />
        </div>
        <div style={{ position: "absolute", top: 1030, width: "100%", textAlign: "center", opacity: rest }}>
          <Label color={C.white} style={{ fontSize: 34, opacity: after ? flicker(frame, MORPH + MORPH_FRAMES) : 1 }}>
            {after ? "Elmohanad Karoum" : "aka DJPER5ON"}
          </Label>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 88, letterSpacing: -2, color: C.lime, marginTop: 50 }}>
            @djper5on
          </div>
        </div>
        <Label
          color={C.white}
          style={{ position: "absolute", top: 1360, width: "100%", textAlign: "center", fontSize: 30, lineHeight: 1.6, opacity: 0.85 * rest }}
        >
          Available for creative projects
          <br />& collaborations
        </Label>
      </AbsoluteFill>
    </Cut>
  );
};
