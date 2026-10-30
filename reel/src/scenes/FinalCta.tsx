import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, Cut, SANS, slam } from "../theme";

/** The last frame: the availability line, big and bold, and a DM prompt. Nothing else. */
export const FinalCta = () => {
  const frame = useCurrentFrame();
  const line: React.CSSProperties = { fontFamily: SANS, fontWeight: 700, fontSize: 132, letterSpacing: -6, lineHeight: 0.98 };
  const lines: [string, string][] = [
    ["Available", C.lime],
    ["for creative", C.white],
    ["projects &", C.white],
    ["collaborations.", C.white],
  ];
  return (
    <Cut flash={C.lime} sound={null} shake={22} seed="final">
      <AbsoluteFill style={{ backgroundColor: C.black }}>
        <div style={{ position: "absolute", top: 500, width: "100%", textAlign: "center" }}>
          {lines.map(([text, color], k) => (
            <div key={text} style={{ ...line, color, ...slam(frame, k * 3, 8) }}>
              {text}
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", top: 1100, width: "100%", display: "flex", justifyContent: "center", ...slam(frame, 16, 8) }}>
          <div
            style={{
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 76,
              letterSpacing: -1,
              color: C.black,
              backgroundColor: C.lime,
              padding: "18px 48px 22px",
              borderRadius: 999,
            }}
          >
            DMs open →
          </div>
        </div>
      </AbsoluteFill>
    </Cut>
  );
};
