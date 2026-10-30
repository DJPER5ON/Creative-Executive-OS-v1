import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, Cut, draw, Guides, IN_OUT, prog, SANS, Sfx, slam, Typewriter } from "../theme";

/** "Have a project in mind? Let's create something extraordinary." */
export const Cta = () => {
  const frame = useCurrentFrame();
    const box = prog(frame, 36, 50, IN_OUT);
  return (
    <Cut flash={C.white} sound="hit" volume={0.5} seed="cta">
    <AbsoluteFill style={{ backgroundColor: C.violet }}>
      <Sfx name="riser" volume={0.5} />
      <Sfx name="hit" at={32} volume={0.7} />
      <Guides color={C.white} xs={[90, 990]} ys={[640, 1360]} opacity={0.3} />
      <div style={{ position: "absolute", top: 520, left: 90, fontFamily: SANS, fontWeight: 400, fontSize: 64, color: C.white }}>
        <Typewriter text="Have a project in mind?" start={4} cps={1.1} hideCaretAfter={32} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 760,
          left: 84,
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 116,
          letterSpacing: -5,
          lineHeight: 1.04,
          color: C.white,
          transformOrigin: "left center",
          ...slam(frame, 2 * 16, 9),
        }}
      >
        <div>Let’s create</div>
        <div>something</div>
        <div style={{ position: "relative", display: "inline-block", color: C.lime }}>
          extraordinary.
          <svg width={820} height={150} style={{ position: "absolute", left: -12, top: -8, overflow: "visible" }}>
            <rect x={0} y={0} width={820} height={142} fill="none" stroke={C.white} strokeWidth={2} {...draw(box)} />
            {[0, 820].flatMap((x) =>
              [0, 142].map((y) => (
                <rect key={`${x}${y}`} x={x - 9} y={y - 9} width={18} height={18} fill={C.violet} stroke={C.white} strokeWidth={2} opacity={box} />
              )),
            )}
          </svg>
        </div>
      </div>
    </AbsoluteFill>
    </Cut>
  );
};
