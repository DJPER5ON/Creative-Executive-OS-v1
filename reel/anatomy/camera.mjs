// Isometric anatomy of a cinema camera rig: body on a baseplate and 15 mm
// rails, a turned prime lens with focus ring, matte box, top handle, EVF,
// battery and side monitor, with the P mark on the body. Generic design, no
// manufacturer marks.
//
//   node anatomy/camera.mjs
import { figure } from "./common.mjs";
import * as G from "./kit/lathe.mjs";

const BODY = { x: -80, y: -60, w: 160, d: 120, r: 8 };
const BODY_H = 140;
const LENS_Z = 72;

const f = figure("camera", {
  fit: [
    [-110, -190, -45],
    [110, 260, -45],
    [-110, -190, 200],
    [110, 260, 200],
    [-120, 230, 140],
  ],
  azimuth: 36,
});
const { P, k, S, L, D, at, add, markOnSide, markOnTop, anchor } = f;

// ---------------------------------------------------------------- rig: rails + baseplate
const PLATE = { x: -95, y: -80, w: 190, d: 150, r: 6 };
add("rig", "shadow", `<path class="iso-halo" d="${k.haloOf({ x: -110, y: -170, w: 220, d: 420, r: 20 }, -45, 20, P)}"/>`);
for (const x of [-40, 40]) {
  const F = G.frameAlong([x, -170, -32], [0, 1, 0]);
  add("rig", "rail", S(G.disc(0, 410, 7.5, F, P), { tone: "mid" }));
  add("rig", "rail end", S(G.disc(410, 418, 9, F, P), { tone: "mid" }));
}
add("rig", "rail block", S(k.slabOf({ x: -60, y: -40, w: 120, d: 60, r: 4 }, -40, 18, P, 3, 0.6), { tone: "mid", className: "pl-ink" }));
add("rig", "baseplate", S(k.slabOf(PLATE, -22, 22, P, 4, 0.8), { tone: "mid", className: "pl-ink" }));
add("rig", "plate holes", D([[-70, 40], [-35, 40], [0, 40], [35, 40], [70, 40]].map(([x, y]) => at([x, y, 0])), { size: 1.2 }));

// ---------------------------------------------------------------- body
add("body", "battery", S(k.slabOf({ x: -62, y: -112, w: 124, d: 52, r: 6 }, 12, 100, P, 4, 0.8), { tone: "mid" }));
add("body", "battery seam", L(k.sideSeam({ x: -62, y: -112, w: 124, d: 52, r: 6 }, 60, P, 4), { tone: "lo" }));
add("body", "body", S(k.slabOf(BODY, 0, BODY_H, P, 6, 1.2), { tone: "mid", className: "pl-ink" }));
add("body", "body seam", L(k.sideSeam(BODY, 40, P, 6), { tone: "lo" }));
add("body", "vents", L([0, 1, 2, 3, 4].map((i) => k.lineOnTop([BODY.x + 20, BODY.y + 20 + i * 8], [BODY.x + 70, BODY.y + 20 + i * 8], BODY_H, P)).join(""), { tone: "lo" }));
add("body", "side mark", markOnSide([BODY.x + BODY.w, 2], 112, "right", 70, "#C6FF33"));
add("body", "rec", S(k.cylinder(52, -34, 8, BODY_H, 5, P, 24), { tone: "hi", lit: true, className: "pl-lime" }));
add("body", "top label", k.faceTextSvg(k.topMatrix([BODY.x + 18, BODY.y + 100], BODY_H, P, "x"), "PER5ON · 4.5K S35", { size: 8, tone: "hi" }));

// ---------------------------------------------------------------- top: handle + EVF
for (const y of [-30, 30]) add("top", "handle post", S(k.cylinder(0, y, 7, BODY_H, 34, P, 20), { tone: "mid" }));
add("top", "handle", S(k.slabOf({ x: -10, y: -55, w: 20, d: 110, r: 8 }, BODY_H + 34, 12, P, 4, 0.6), { tone: "mid", className: "pl-ink" }));
{
  const F = G.frameAlong([-62, -60, BODY_H - 10], [0, -1, 0]);
  add("top", "evf", S(G.solidOf([[0, 15], [52, 15], [52, 21], [78, 23]], F, P), { tone: "mid" }));
}

// ---------------------------------------------------------------- side monitor (on the +x side)
const MON = { x: BODY.x + BODY.w + 22, y: -20, w: 8, d: 104, r: 2 };
add("monitor", "monitor arm", S(k.cylinder(BODY.x + BODY.w + 10, 30, 5, BODY_H, 24, P, 16), { tone: "mid" }));
add("monitor", "monitor", S(k.slabOf(MON, BODY_H + 18, 70, P, 2, 0.4), { tone: "mid", className: "pl-ink" }));

// ---------------------------------------------------------------- lens (turned, along +y)
const LF = G.frameAlong([0, BODY.y + BODY.d, LENS_Z], [0, 1, 0]);
add("lens", "mount", S(G.disc(0, 8, 44, LF, P), { tone: "mid", className: "pl-ink" }));
add("lens", "barrel", S(G.solidOf([[8, 36], [58, 36], [58, 40], [86, 40], [86, 36], [128, 36], [128, 46], [146, 46]], LF, P), { tone: "mid", className: "pl-ink" }));
add("lens", "focus ring", L(G.ribsOf(LF, 60, 84, 40, 64, P), { tone: "lo" }));
add("lens", "focus marks", L(G.arcOf(LF, 100, 36, P), { tone: "mid" }));
add("lens", "front glass", L(G.circleOf(LF, 146, 40, P, 64), { tone: "mid" }) + `<g class="pl-glow">${L(G.circleOf(LF, 146, 30, P, 64), { tone: "lit" })}</g>`);

// ---------------------------------------------------------------- matte box
add("matte box", "matte box", S(G.prismOf(LF, [[-64, -50], [64, -50], [64, 50], [-64, 50]], 150, 186, P), { tone: "mid", className: "pl-ink" }));
add("matte box", "flag", S(k.slabOf({ x: -64, y: BODY.y + BODY.d + 150, w: 128, d: 50, r: 2 }, LENS_Z + 50, 3, P, 2), { tone: "mid", className: "pl-ink" }));

anchor("rig", [40, 230, -32]);
anchor("body", [BODY.x + BODY.w, BODY.y, 90]);
anchor("top", [10, -55, BODY_H + 46]);
anchor("monitor", [MON.x + MON.w, MON.y + MON.d, BODY_H + 60]);
anchor("lens", [36, BODY.y + BODY.d + 70, LENS_Z]);
anchor("matte box", [64, BODY.y + BODY.d + 186, LENS_Z]);
void markOnTop;
f.save();
