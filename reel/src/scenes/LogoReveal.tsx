import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Logo } from "../Logo";
import { C, draw, EASE, IN_OUT, prog, Sfx } from "../theme";

export const LOGO_REVEAL_FRAMES = 180;

/**
 * Logo-only reveal, no text: hairline construction draws in, the mark traces
 * itself, fills with a lime pulse, the guides retract and the logo holds.
 * Adapts to any frame size.
 */
export const LogoReveal = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2;
  const s = Math.min(width, height) * 0.62; // logo size
  const h = s / 2;

  const axes = prog(frame, 0, 20, IN_OUT);
  const rings = prog(frame, 6, 30, IN_OUT);
  const box = prog(frame, 12, 32, IN_OUT);
  const trace = prog(frame, 18, 62, IN_OUT);
  const fill = prog(frame, 60, 72, EASE);
  const pulse = prog(frame, 60, 96, EASE);
  const retract = prog(frame, 84, 108, IN_OUT);
  const settle = prog(frame, 60, 100, EASE);
  const guides = 1 - retract;
  const reach = Math.max(width, height);

  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <Sfx name="whoosh" at={4} volume={0.5} />
      <Sfx name="type" at={20} volume={0.25} durationInFrames={40} />
      <Sfx name="boom" at={60} volume={0.9} />
      <Sfx name="zap" at={60} volume={0.35} />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <g stroke={C.white} strokeWidth={1.5} fill="none" opacity={0.35 * guides}>
          <line x1={cx - reach * axes} x2={cx + reach * axes} y1={cy} y2={cy} />
          <line x1={cx} x2={cx} y1={cy - reach * axes} y2={cy + reach * axes} />
          <line x1={cx - h * 1.25} y1={cy + h * 1.05} x2={cx + h * 1.25} y2={cy - h * 1.05} strokeDasharray="4 10" opacity={rings} />
          <circle cx={cx} cy={cy} r={h * 1.12} {...draw(rings)} />
          <circle cx={cx} cy={cy} r={h * 0.64} {...draw(rings)} />
          <rect x={cx - h} y={cy - h} width={s} height={s} {...draw(box)} />
        </g>
        {[-h, h].flatMap((dx) =>
          [-h, h].map((dy) => (
            <rect
              key={`${dx}${dy}`}
              x={cx + dx - 8}
              y={cy + dy - 8}
              width={16}
              height={16}
              fill={C.black}
              stroke={C.white}
              strokeWidth={1.5}
              opacity={0.6 * box * guides}
            />
          )),
        )}
        <circle cx={cx} cy={cy} r={10 * rings * (1 - fill)} fill={C.lime} />
        <circle
          cx={cx}
          cy={cy}
          r={h * (0.9 + 1.4 * pulse)}
          fill="none"
          stroke={C.lime}
          strokeWidth={3}
          opacity={pulse > 0 ? 1 - pulse : 0}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: cx,
          top: cy,
          translate: "-50% -50%",
          scale: interpolate(settle, [0, 1], [1, 0.94]),
        }}
      >
        <Logo size={s} color={C.white} outline={trace} fill={fill} />
      </div>
    </AbsoluteFill>
  );
};
