import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Logo } from "../Logo";
import { C, EASE, Guides, IN_OUT, Label, prog, SANS } from "../theme";

/** Logo, name, alias, handle, availability — holds still so it can be read. */
export const EndCard = () => {
  const frame = useCurrentFrame();
  const name = prog(frame, 10, 20, EASE);
  const rest = prog(frame, 18, 28, EASE);
  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <Guides color={C.white} xs={[90, 990]} ys={[740, 1000]} opacity={0.3} fadeOutAt={60} />
      <div style={{ position: "absolute", top: 330, left: 540, translate: "-50% 0" }}>
        <Logo size={320} color={C.white} outline={prog(frame, 0, 14, IN_OUT)} fill={prog(frame, 10, 18)} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 740,
          width: "100%",
          textAlign: "center",
          fontFamily: SANS,
          fontSize: 120,
          letterSpacing: -4,
          lineHeight: 1.02,
          color: C.white,
          opacity: name,
          translate: `0 ${interpolate(name, [0, 1], [30, 0])}px`,
        }}
      >
        <div style={{ fontWeight: 300 }}>Elmohanad</div>
        <div style={{ fontWeight: 700 }}>Karoum</div>
      </div>
      <div style={{ position: "absolute", top: 1030, width: "100%", textAlign: "center", opacity: rest }}>
        <Label color={C.white} style={{ fontSize: 34 }}>aka DJPER5ON</Label>
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
  );
};
