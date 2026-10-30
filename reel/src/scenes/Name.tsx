import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, EASE, Guides, Label, prog, SANS, Sfx, Typewriter } from "../theme";

/** "I'm Elmohanad Karoum" with a dimension line, and the stencil portrait rising. */
export const Name = () => {
  const frame = useCurrentFrame();
  const rise = prog(frame, 14, 40, EASE);
  const dim = prog(frame, 22, 34);
  const name: React.CSSProperties = { fontFamily: SANS, fontSize: 160, letterSpacing: -5, lineHeight: 1, color: C.black };
  return (
    <AbsoluteFill style={{ backgroundColor: C.white }}>
      <Sfx name="whoosh" at={12} volume={0.6} />
      <Sfx name="hit" at={30} volume={0.45} />
      <Guides color={C.black} xs={[90, 990]} ys={[300, 860]} opacity={0.25} />
      <div style={{ position: "absolute", top: 330, left: 90, fontFamily: SANS, fontWeight: 700, fontSize: 84, color: C.black }}>
        I’m
      </div>
      <div style={{ position: "absolute", top: 450, left: 84 }}>
        <div style={{ ...name, fontWeight: 300 }}>
          <Typewriter text="Elmohanad" start={2} cps={1} hideCaretAfter={11} />
        </div>
        <div style={{ ...name, fontWeight: 700, marginTop: 8 }}>
          <Typewriter text="Karoum" start={12} cps={1} />
        </div>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: dim }}>
        <g stroke={C.black} strokeWidth={1.5}>
          <line x1={90} x2={90 + 760 * dim} y1={800} y2={800} />
          <line x1={90} x2={90} y1={788} y2={812} />
          <line x1={850} x2={850} y1={788} y2={812} opacity={dim} />
        </g>
      </svg>
      <Label color={C.black} style={{ position: "absolute", top: 820, left: 90, fontSize: 34, opacity: prog(frame, 24, 32) }}>
        aka DJPER5ON · Doha, Qatar
      </Label>
      <Img
        src={staticFile("portrait-stencil-black.svg")}
        style={{
          position: "absolute",
          width: 1000,
          left: 40,
          bottom: 0,
          translate: `0 ${interpolate(rise, [0, 1], [1000, 0])}px`,
        }}
      />
    </AbsoluteFill>
  );
};
