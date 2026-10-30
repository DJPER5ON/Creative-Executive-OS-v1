import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Logo } from "../Logo";
import { BEAT, C, Cut, flicker, Guides, IN_OUT, Label, prog, SANS, slam } from "../theme";

export const NAME_CARD_FRAMES = 4 * BEAT;
/** The alias lands on beat 3 of the card; the melt starts 20 frames before. */
const MORPH_FRAMES = 20;
export const MORPH_LAND = 3 * BEAT;
const MORPH = MORPH_LAND - MORPH_FRAMES;

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

/** Name card: logo on construction guides, then the name melting into PER5ON. */
export const EndCard = () => {
  const frame = useCurrentFrame();
  const morph = interpolate(frame, [MORPH, MORPH_LAND], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const landed = frame >= MORPH_LAND;
  const punch = interpolate(frame, [MORPH_LAND - 2, MORPH_LAND + 2, MORPH_LAND + 10], [1, 1.08, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Cut flash={C.lime} sound={null} shake={26} seed="end">
      <AbsoluteFill style={{ backgroundColor: C.black }}>
        <Guides color={C.white} xs={[90, 990]} ys={[740, 1000]} opacity={0.3} fadeOutAt={MORPH} />
        <div style={{ position: "absolute", top: 330, left: 540, translate: "-50% 0" }}>
          <Logo size={320} color={C.white} outline={prog(frame, 0, 10, IN_OUT)} fill={prog(frame, 8, 14)} />
        </div>
        <div style={{ position: "absolute", top: 730, left: 0, right: 0, height: 270, ...slam(frame, 4, 8), scale: punch }}>
          <Morph
            p={morph}
            style={{ width: "100%", height: "100%", fontFamily: SANS, color: C.white, textAlign: "center" }}
            from={
              <div style={{ fontSize: 120, letterSpacing: -4, lineHeight: 1.02 }}>
                <div style={{ fontWeight: 300 }}>Elmohanad</div>
                <div style={{ fontWeight: 700 }}>Karoum</div>
              </div>
            }
            to={<div style={{ fontSize: 210, fontWeight: 700, letterSpacing: -9, lineHeight: 1 }}>PER5ON</div>}
          />
        </div>
        <Label
          color={C.white}
          style={{ position: "absolute", top: 1040, width: "100%", textAlign: "center", fontSize: 34, opacity: landed ? 0 : flicker(frame, 10) }}
        >
          aka DJPER5ON
        </Label>
      </AbsoluteFill>
    </Cut>
  );
};
