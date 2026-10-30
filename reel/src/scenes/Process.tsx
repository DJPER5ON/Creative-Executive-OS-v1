import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, EASE, IN_OUT, Label, prog, SANS } from "../theme";

/** "From the first idea → to the final frame." on a hairline timeline. */
export const Process = () => {
  const frame = useCurrentFrame();
  const top = prog(frame, 0, 22, IN_OUT);
  const bottom = prog(frame, 30, 56, IN_OUT);
  const l1 = prog(frame, 6, 16, EASE);
  const l2 = prog(frame, 32, 42, EASE);
  const counter = Math.round(interpolate(frame, [0, 60], [1, 900], { extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill style={{ backgroundColor: C.white }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <circle cx={540} cy={340} r={22} fill="none" stroke={C.black} strokeWidth={3} opacity={top > 0 ? 1 : 0} />
        <line x1={540} x2={540} y1={362} y2={362 + 300 * top} stroke={C.black} strokeWidth={1.5} />
        <circle cx={540} cy={680} r={8} fill="none" stroke={C.black} strokeWidth={1.5} opacity={top} />
        <circle cx={540} cy={1060} r={8} fill="none" stroke={C.black} strokeWidth={1.5} opacity={bottom > 0 ? 1 : 0} />
        <line x1={540} x2={540} y1={1068} y2={1068 + 250 * bottom} stroke={C.black} strokeWidth={1.5} />
        <circle cx={540} cy={1340} r={24 * bottom} fill={C.violet} />
      </svg>
      <Label color={C.black} style={{ position: "absolute", top: 270, width: "100%", textAlign: "center" }}>
        First idea
      </Label>
      <Label color={C.black} style={{ position: "absolute", top: 1380, width: "100%", textAlign: "center", opacity: bottom }}>
        Final frame
      </Label>
      <Label color={C.black} style={{ position: "absolute", top: 200, right: 90, opacity: 0.7 }}>
        Frame {String(counter).padStart(4, "0")}
      </Label>
      <div style={{ position: "absolute", top: 740, width: "100%", textAlign: "center", fontFamily: SANS, color: C.black, letterSpacing: -4 }}>
        <div style={{ fontWeight: 300, fontSize: 92, opacity: l1, translate: `0 ${interpolate(l1, [0, 1], [30, 0])}px` }}>
          From the first idea
        </div>
        <div style={{ fontWeight: 700, fontSize: 98, marginTop: 10, opacity: l2, translate: `0 ${interpolate(l2, [0, 1], [30, 0])}px` }}>
          to the <span style={{ color: C.violet }}>final frame.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
