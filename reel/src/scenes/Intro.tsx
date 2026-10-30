import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Logo } from "../Logo";
import { C, EASE, Guides, IN_OUT, Label, prog, SANS, Typewriter } from "../theme";

/** Logo draws itself in on hairline guides, then "Hello." types out. */
export const Intro = () => {
  const frame = useCurrentFrame();
  const settle = prog(frame, 26, 38, IN_OUT);
  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <Guides color={C.white} xs={[240, 840]} ys={[660, 1260]} />
      <Label color={C.white} style={{ position: "absolute", top: 1278, left: 256, opacity: 0.6 * prog(frame, 10, 20) }}>
        X 240 · Y 1260
      </Label>
      <div
        style={{
          position: "absolute",
          left: 540,
          top: interpolate(settle, [0, 1], [960, 700]),
          translate: "-50% -50%",
          scale: interpolate(settle, [0, 1], [1, 0.42]),
        }}
      >
        <Logo size={600} color={C.white} outline={prog(frame, 0, 22, IN_OUT)} fill={prog(frame, 16, 26)} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 940,
          width: "100%",
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 190,
          letterSpacing: -6,
          color: C.white,
          opacity: prog(frame, 32, 34, EASE),
        }}
      >
        <Typewriter
          text="Hello."
          start={33}
          cps={0.7}
          render={(s) => (
            <>
              {s.replace(".", "")}
              {s.endsWith(".") ? <span style={{ color: C.lime }}>.</span> : null}
            </>
          )}
        />
      </div>
    </AbsoluteFill>
  );
};
