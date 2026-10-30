import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { DISCIPLINES } from "../anatomy/Anatomy";
import { BEAT, C, Cut, flicker, SANS, slam, TopBar } from "../theme";

export const WHEEL_FRAMES = 4 * BEAT;
/** How many names fly past before the wheel settles on the first discipline. */
export const WHEEL_TRAVEL = 3 * DISCIPLINES.length;
const STEP_DEG = 24;
const RADIUS = 430;
const CY = 960;

/** Wheel position (in items) at a frame: a fast spin that decelerates onto item 0. */
export const wheelPos = (frame: number) =>
  -WHEEL_TRAVEL *
  (1 - interpolate(frame, [4, WHEEL_FRAMES - 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));

/**
 * "And I love / to play •" anchored left, with every discipline on a 3D drum
 * to the right — spinning fast, then settling on Motion Graphics, which the
 * first service card picks up.
 */
export const Wheel = () => {
  const frame = useCurrentFrame();
  const pos = wheelPos(frame);
  const n = DISCIPLINES.length;
  const items = [];
  for (let k = Math.floor(pos) - 4; k <= Math.ceil(pos) + 4; k++) {
    const d = k - pos;
    const theta = (d * STEP_DEG * Math.PI) / 180;
    if (Math.abs(theta) > (84 * Math.PI) / 180) continue;
    const { name } = DISCIPLINES[((k % n) + n) % n];
    const centre = Math.abs(d) < 0.5;
    const settled = frame >= WHEEL_FRAMES - 8;
    items.push(
      <div
        key={k}
        style={{
          position: "absolute",
          left: 430,
          top: CY + RADIUS * Math.sin(theta) - 34,
          fontFamily: SANS,
          fontSize: 62,
          letterSpacing: -2,
          lineHeight: 1,
          whiteSpace: "nowrap",
          color: centre && settled ? C.lime : C.white,
          opacity: Math.pow(Math.cos(theta), 1.6) * (centre ? 1 : 0.55),
          rotate: `x ${-d * STEP_DEG}deg`,
          scale: 0.6 + 0.4 * Math.cos(theta),
          transformOrigin: "left center",
          filter: Math.abs(d) > 1.5 ? `blur(${Math.min(4, Math.abs(d) - 1.5) * 1.2}px)` : undefined,
        }}
      >
        {name[0] ? <span style={{ fontWeight: 300 }}>{name[0]} </span> : null}
        <span style={{ fontWeight: 700 }}>{name[1]}</span>
      </div>,
    );
  }
  return (
    <Cut flash={C.lime} sound={null} seed="wheel">
      <AbsoluteFill style={{ backgroundColor: C.violet, perspective: 1100 }}>
        <TopBar left="Disciplines" right={`0${n}`} color={C.white} />
        {/* Picker bracket around the centre row */}
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.45 }}>
          <line x1={410} x2={1000} y1={CY - 50} y2={CY - 50} stroke={C.white} strokeWidth={1.5} />
          <line x1={410} x2={1000} y1={CY + 50} y2={CY + 50} stroke={C.white} strokeWidth={1.5} />
        </svg>
        {items}
        <div style={{ position: "absolute", left: 80, top: 860, fontFamily: SANS, color: C.white, letterSpacing: -3 }}>
          <div style={{ fontWeight: 300, fontSize: 60, opacity: flicker(frame, 0) }}>And I love</div>
          <div style={{ fontWeight: 700, fontSize: 84, lineHeight: 1.1, transformOrigin: "left center", ...slam(frame, 2, 8) }}>
            to play <span style={{ color: C.lime }}>•</span>
          </div>
        </div>
      </AbsoluteFill>
    </Cut>
  );
};
