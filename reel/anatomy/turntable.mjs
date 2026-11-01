// Isometric anatomy of a DJ turntable, built with the Anatomy kit (kit/iso-kit.mjs).
// Writes src/anatomy/figures/turntable.json: every part as an SVG string in
// painter's order, grouped into assemblies so the reel can build it part by
// part and pull it apart. Generic design, no brand marks.
//
//   node anatomy/turntable.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { LIME_CSS } from "./common.mjs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "../src/anatomy/figures/turntable.json");
// The P mark, read from the reel's traced logo module.
const LOGO = readFileSync(join(HERE, "../src/logo-path.ts"), "utf8").match(/LOGO_PATH =\s*"([^"]+)"/)[1];

/** The P mark laid flat on a horizontal face, `size` world units wide, centred on `at`. */
const markOnTop = (at, z, size, fill) =>
  `<g transform="${k.topMatrix(at, z, P, "x")}"><g transform="scale(${size / 875}) translate(-437.5 -433.5)"><path d="${LOGO}" fill="${fill}" fill-rule="evenodd"/></g></g>`;

const WIDTH = 760;
const HEIGHT = 760;

// World units ≈ 1 mm. x right, y back, z up.
const PLINTH = { x: -225, y: -175, w: 450, d: 350, r: 14 };
const PLINTH_H = 44;
const FOOT_H = 14;
const PLATTER = [-40, 0];
const PLATTER_R = 150;
const PLATTER_H = 16;
const MAT_H = 2;
const RECORD_R = 150;
const RECORD_H = 2;
const LABEL_R = 46;
const TOP = 0;
const PLATTER_TOP = TOP + 6 + PLATTER_H;
const RECORD_Z = PLATTER_TOP + MAT_H;
const PIVOT = [165, -110];
const ARM_Z = RECORD_Z + 30;

const P = k.fitProjection(
  [...k.boxCorners(PLINTH, -PLINTH_H - FOOT_H, 0), [PIVOT[0], PIVOT[1], ARM_Z + 20], [PLATTER[0] - PLATTER_R, 0, 140]],
  WIDTH,
  HEIGHT,
  { pad: 40, azimuth: 40, elevation: 32 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);

/** @type {{group: string, label: string, svg: string}[]} */
const parts = [];
const add = (group, label, svg) => parts.push({ group, label, svg });

// ---------------------------------------------------------------- base
add("base", "shadow", `<path class="iso-halo" d="${k.haloOf(PLINTH, -PLINTH_H - FOOT_H, PLINTH_H, P)}"/>`);
const feet = k.corners(PLINTH, 40).sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
for (const [x, y] of feet) {
  add("base", "foot", S(k.cylinder(x, y, 30, -PLINTH_H - FOOT_H, 4, P, 40), { tone: "lo" }) + S(k.cylinder(x, y, 26, -PLINTH_H - FOOT_H + 4, FOOT_H - 4, P, 40, 0.6), { tone: "mid" }));
}
add("base", "plinth", S(k.slabOf(PLINTH, -PLINTH_H, PLINTH_H, P, 10, 1.6), { tone: "mid" }));
add("base", "plinth seam", L(k.sideSeam(PLINTH, -PLINTH_H / 2, P, 10), { tone: "lo" }));
add("base", "top groove", L(k.planOutline(k.insetPlan(PLINTH, 8), TOP, P, 10), { tone: "lo" }));
const screws = k.corners(PLINTH, 16);
add("base", "badge", markOnTop([PLINTH.x + 70, PLINTH.y + 50], TOP, 50, "var(--anatomy-hi)"));
add("base", "corner screws", L(screws.map(([x, y]) => k.ring(x, y, 3.2, TOP, P, 16)).join(""), { tone: "lo" }) + D(screws.map(([x, y]) => at([x, y, TOP])), { size: 0.6 }));

// ---------------------------------------------------------------- controls (back of the deck, drawn before the platter)
const target = [-195, -140];
add("controls", "target light", S(k.cylinder(target[0], target[1], 9, TOP, 5, P, 24), { tone: "mid" }) + S(k.cylinder(target[0], target[1], 4, TOP + 5, 26, P, 20), { tone: "mid", crease: "none" }) + S(k.cylinder(target[0], target[1], 6, TOP + 31, 6, P, 24), { tone: "hi", lit: true }));

// ---------------------------------------------------------------- platter
const [px, py] = PLATTER;
add("platter", "bearing", S(k.cylinder(px, py, 40, TOP, 6, P, 48), { tone: "lo" }));
add("platter", "platter", S(k.cylinder(px, py, PLATTER_R, TOP + 6, PLATTER_H, P, 96, 1.2), { tone: "mid" }));
add("platter", "strobe dots", L(k.knurl(px, py, PLATTER_R, TOP + 9, TOP + 14, 160, P, 0.2), { tone: "lo" }) + L(k.sideArc(px, py, PLATTER_R, TOP + 16, P, 80), { tone: "faint" }));

// ---------------------------------------------------------------- slipmat
add("slipmat", "slipmat", S(k.cylinder(px, py, PLATTER_R - 4, PLATTER_TOP, MAT_H, P, 96), { tone: "lo", crease: "none" }));

// ---------------------------------------------------------------- record
add("record", "vinyl", S(k.cylinder(px, py, RECORD_R - 6, RECORD_Z, RECORD_H, P, 96), { tone: "hi", crease: "lo" }));
const grooves = [];
for (let r = LABEL_R + 8; r < RECORD_R - 12; r += 7) grooves.push(k.ring(px, py, r, RECORD_Z + RECORD_H, P, 96));
add("record", "grooves", L(grooves.join(""), { tone: "faint" }));
add("record", "run-out", L(k.ring(px, py, LABEL_R + 4, RECORD_Z + RECORD_H, P, 64), { tone: "lo" }));
add("record", "label", S(k.cylinder(px, py, LABEL_R, RECORD_Z + RECORD_H, 0.4, P, 64), { tone: "hi", lit: true, className: "pl-lime" }));
add("record", "label mark", markOnTop([px - 2, py - 8], RECORD_Z + RECORD_H + 0.4, 52, "#000"));
add("record", "label text", k.faceTextSvg(k.topMatrix([px, py + 32], RECORD_Z + RECORD_H + 0.4, P, "x"), "PER5ON · 33⅓", { size: 6, tone: "hi", anchor: "middle" }));
add("record", "spindle", S(k.cylinder(px, py, 3.6, RECORD_Z + RECORD_H, 14, P, 20), { tone: "mid" }));

// ---------------------------------------------------------------- controls in front of the platter
const start = { x: -205, y: 95, w: 70, d: 52, r: 6 };
add("controls", "start / stop", S(k.slabOf(start, TOP, 7, P, 4, 0.8), { tone: "hi", lit: true, className: "pl-lime" }) + L(k.planOutline(k.insetPlan(start, 6), TOP + 7, P, 4), { tone: "faint" }));
for (const [i, label] of ["33", "45"].entries()) {
  const b = { x: -120 + i * 46, y: 128, w: 36, d: 22, r: 4 };
  add("controls", `${label} rpm`, S(k.slabOf(b, TOP, 5, P, 3, 0.5), { tone: "mid" }) + k.faceTextSvg(k.topMatrix([b.x + b.w / 2, b.y + b.d / 2 + 3], TOP + 5, P, "x"), label, { size: 9, tone: "lo", anchor: "middle" }));
}
const slot = { x: 168, y: -30, w: 14, d: 170, r: 6 };
add("controls", "pitch slot", S(k.slabOf(slot, TOP - 2, 2, P, 4), { tone: "lo", crease: "none" }) + L(k.planOutline(slot, TOP, P, 4), { tone: "lo" }));
const pt = k.topTicks(slot.y + 6, slot.y + slot.d - 6, 8, 5, slot.x + slot.w + 4, TOP, [5, 10], P, "y");
add("controls", "pitch scale", L(pt.minor, { tone: "lo" }) + L(pt.major, { tone: "mid" }));
add("controls", "pitch fader", S(k.slabOf({ x: slot.x - 8, y: slot.y + 70, w: slot.w + 16, d: 22, r: 3 }, TOP, 14, P, 3, 0.6), { tone: "hi", lit: true }));

// ---------------------------------------------------------------- tonearm
const [ax, ay] = PIVOT;
add("tonearm", "arm base", S(k.cylinder(ax, ay, 40, TOP, 6, P, 56, 0.8), { tone: "mid" }) + L(k.ring(ax, ay, 33, TOP + 6, P, 48), { tone: "lo" }));
add("tonearm", "height ring", S(k.cylinder(ax, ay, 26, TOP + 6, 12, P, 48), { tone: "mid" }) + L(k.knurl(ax, ay, 26, TOP + 8, TOP + 16, 60, P), { tone: "lo" }));
add("tonearm", "pillar", S(k.cylinder(ax, ay, 12, TOP + 18, ARM_Z - TOP - 18, P, 28), { tone: "mid", crease: "none" }));
const rest = [ax + 20, ay + 120];
add("tonearm", "arm rest", S(k.cylinder(rest[0], rest[1], 6, TOP, ARM_Z - 6, P, 20), { tone: "mid", crease: "none" }) + S(k.cylinder(rest[0], rest[1], 8, ARM_Z - 6, 4, P, 20), { tone: "mid" }));
add("tonearm", "cue lever", S(k.slabOf({ x: ax - 52, y: ay + 20, w: 10, d: 30, r: 3 }, TOP, 20, P, 3, 0.4), { tone: "mid" }));
add("tonearm", "gimbal", S(k.cylinder(ax, ay, 16, ARM_Z - 6, 12, P, 32, 0.6), { tone: "mid" }));
// Counterweight behind the pivot, along the arm axis.
const dir = [(px + 60 - ax), (py + 70 - ay)];
const len = Math.hypot(dir[0], dir[1]);
const u = [dir[0] / len, dir[1] / len];
const cw = [ax - u[0] * 40, ay - u[1] * 40];
add("tonearm", "counterweight", S(k.cylinder(cw[0], cw[1], 16, ARM_Z - 8, 16, P, 36, 0.6), { tone: "mid" }) + L(k.knurl(cw[0], cw[1], 16, ARM_Z - 6, ARM_Z + 6, 40, P), { tone: "lo" }));
const head = [px + 60, py + 70];
add("tonearm", "arm", L(k.segment([ax, ay, ARM_Z + 4], [head[0] - u[0] * 18, head[1] - u[1] * 18, ARM_Z - 4], P), { tone: "hi" }) + L(k.segment([ax, ay, ARM_Z + 6], [head[0] - u[0] * 18, head[1] - u[1] * 18, ARM_Z - 2], P), { tone: "hi" }));
const shell = { x: head[0] - 12, y: head[1] - 10, w: 30, d: 20, r: 3 };
add("tonearm", "headshell", S(k.slabOf(shell, ARM_Z - 12, 8, P, 3, 0.6), { tone: "hi", lit: true, className: "pl-lime" }));
add("tonearm", "stylus", L(k.segment([head[0], head[1], ARM_Z - 12], [head[0], head[1], RECORD_Z + RECORD_H], P), { tone: "lit" }) + D([at([head[0], head[1], RECORD_Z + RECORD_H])], { size: 0.8, tone: "hi" }));

const json = {
  width: WIDTH,
  height: HEIGHT,
  // Screen px per world unit of height: a part lifted by z moves up z * rise.
  rise: k.screenRise(1, P),
  groups: ["base", "controls", "platter", "slipmat", "record", "tonearm"],
  // Screen points for callout labels in the exploded view, one per group.
  anchors: {
    base: at([PLINTH.x + PLINTH.w, PLINTH.y + PLINTH.d * 0.7, -PLINTH_H / 2]),
    controls: at([slot.x + slot.w, slot.y + slot.d, TOP]),
    platter: at([px + PLATTER_R * 0.7, py + PLATTER_R * 0.7, TOP + 14]),
    slipmat: at([px - PLATTER_R * 0.7, py + PLATTER_R * 0.7, PLATTER_TOP + 1]),
    record: at([px + RECORD_R * 0.7, py - RECORD_R * 0.7, RECORD_Z]),
    tonearm: at([ax, ay, ARM_Z + 10]),
  },
  parts,
};
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(json));
writeFileSync(join(dirname(OUT), "iso-css.ts"), `// Generated by anatomy/turntable.mjs from the Anatomy kit's ISO_CSS (MIT).\nexport const ISO_CSS = ${JSON.stringify(k.ISO_CSS)};\n`);
// Lime accent for the parts marked pl-lime (label, start button, headshell).
writeFileSync(join(dirname(OUT), "lime-css.ts"), `export const LIME_CSS = ${JSON.stringify(LIME_CSS)};\n`);
// A standalone preview page for checking the drawing in a browser (light paper theme).
writeFileSync(join(HERE, "turntable-preview.html"), `<!doctype html><meta charset="utf-8"><style>${k.ISO_CSS}${LIME_CSS}</style><body class="iso" data-theme="light" style="margin:0;background:#f2f2ef">${k.figureSvg({ width: WIDTH, height: HEIGHT, label: "Turntable", body: parts.map((p) => p.svg) })}</body>`);
console.log(`turntable: ${parts.length} parts`);
