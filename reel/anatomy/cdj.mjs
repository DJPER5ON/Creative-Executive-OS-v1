// Isometric anatomy of a pro DJ media player (CDJ-style layout: screen up top,
// big jog wheel, play/cue bottom left, tempo fader on the right), with the P
// mark where a maker's badge would sit. Generic design, no manufacturer marks.
//
//   node anatomy/cdj.mjs
import { feet, figure } from "./common.mjs";

const BODY = { x: -165, y: -235, w: 330, d: 470, r: 14 };
const BODY_H = 70;
const TOP = 0;
const JOG = [12, 62];
const JOG_R = 104;

const f = figure("cdj", {
  fit: [
    [BODY.x, BODY.y, -BODY_H - 10],
    [BODY.x + BODY.w, BODY.y + BODY.d, -BODY_H - 10],
    [BODY.x, BODY.y, 40],
    [BODY.x + BODY.w, BODY.y + BODY.d, 30],
    [BODY.x + BODY.w, BODY.y, 40],
    [BODY.x, BODY.y + BODY.d, 20],
  ],
  azimuth: 38,
});
const { P, k, at, S, L, D, add, markOnTop, anchor } = f;

// ---------------------------------------------------------------- chassis
add("chassis", "shadow", `<path class="iso-halo" d="${k.haloOf(BODY, -BODY_H - 10, BODY_H, P)}"/>`);
feet(f, BODY, 36, 20, -BODY_H - 10, 10, "chassis");
add("chassis", "body", S(k.slabOf(BODY, -BODY_H, BODY_H, P, 10, 1.6), { tone: "mid", className: "pl-ink" }));
add("chassis", "top plate seam", L(k.sideSeam(BODY, -10, P, 10), { tone: "lo" }));
add("chassis", "panel groove", L(k.planOutline(k.insetPlan(BODY, 9), TOP, P, 10), { tone: "lo" }));
const screws = k.corners(BODY, 18);
add("chassis", "panel screws", D(screws.map(([x, y]) => at([x, y, TOP])), { size: 0.6 }));

// ---------------------------------------------------------------- screen (raised hood at the back)
const HOOD = { x: -140, y: -222, w: 280, d: 128, r: 8 };
add("display", "screen hood", S(k.slabOf(HOOD, TOP, 22, P, 6, 1), { tone: "mid", className: "pl-ink" }));
const GLASS = k.insetPlan(HOOD, 10);
add("display", "screen", S(k.slabOf(GLASS, 22, 1, P, 4), { tone: "lo", crease: "none", className: "pl-ink" }));
// waveform: two lanes of lime bars, the playhead, track text
const bars = [];
for (let i = 0; i < 58; i++) {
  const x = GLASS.x + 8 + i * 4.3;
  const h = 6 + 18 * Math.abs(Math.sin(i * 0.57) * Math.cos(i * 0.21 + 1));
  bars.push(k.lineOnTop([x, GLASS.y + 62 - h / 2], [x, GLASS.y + 62 + h / 2], 23.1, P));
}
add("display", "waveform", `<g class="pl-glow">${L(bars.join(""), { tone: "lit" })}</g>`);
add("display", "playhead", L(k.lineOnTop([GLASS.x + 120, GLASS.y + 38], [GLASS.x + 120, GLASS.y + 86], 23.2, P), { tone: "lit" }));
add("display", "track", `<g class="pl-glow">${k.faceTextSvg(k.topMatrix([GLASS.x + 8, GLASS.y + 18], 23.1, P, "x"), "PER5ON — FORWARD PULSE", { size: 9, tone: "hi" })}</g>`);

add("display", "bpm", `<g class="pl-glow">${k.faceTextSvg(k.topMatrix([GLASS.x + GLASS.w - 8, GLASS.y + 18], 23.1, P, "x"), "112.5", { size: 11, tone: "hi", anchor: "end" })}</g>`);

add("display", "badge", markOnTop([BODY.x + 40, BODY.y + 20], 22, 26, "#C6FF33"));
add("display", "usb slot", S(k.slabOf({ x: 98, y: -86, w: 46, d: 10, r: 2 }, TOP, 3, P, 2), { tone: "lo", crease: "none", className: "pl-ink" }));

// ---------------------------------------------------------------- hot cue pads and loop buttons
for (let i = 0; i < 4; i++) {
  const pad = { x: -140 + i * 52, y: -82, w: 42, d: 24, r: 4 };
  add("controls", "hot cue", S(k.slabOf(pad, TOP, 5, P, 3, 0.5), { tone: "hi", lit: i === 0, className: i === 0 ? "pl-lime" : undefined }));
}
for (let i = 0; i < 3; i++) add("controls", "loop", S(k.cylinder(-128 + i * 34, -42, 9, TOP, 4, P, 20), { tone: "mid" }));

// ---------------------------------------------------------------- jog wheel
const [jx, jy] = JOG;
add("jog", "jog well", L(k.ring(jx, jy, JOG_R + 8, TOP, P, 96), { tone: "lo" }));
add("jog", "jog ring", S(k.cylinder(jx, jy, JOG_R, TOP, 14, P, 112, 1.2), { tone: "mid", className: "pl-ink" }));
add("jog", "jog knurl", L(k.knurl(jx, jy, JOG_R, TOP + 3, TOP + 12, 180, P, 0.25), { tone: "lo" }));
add("jog", "jog platter", S(k.cylinder(jx, jy, JOG_R - 16, TOP + 14, 3, P, 96), { tone: "hi" }));
const t = k.radialTicks(jx, jy, JOG_R - 18, 60, 5, TOP + 17, [3, 7], P);
add("jog", "platter marks", L(t.minor, { tone: "lo" }) + L(t.major, { tone: "mid" }));
add("jog", "centre display", S(k.cylinder(jx, jy, 42, TOP + 17, 3, P, 64), { tone: "lo", className: "pl-ink" }));
add("jog", "centre mark", markOnTop([jx, jy], TOP + 20, 56, "#C6FF33"));
add("jog", "position dot", D([at([jx + 34, jy - 18, TOP + 20.2])], { size: 1.6, tone: "hi" }));

// ---------------------------------------------------------------- transport + tempo
add("controls", "cue", S(k.cylinder(-133, 145, 22, TOP, 8, P, 40, 0.8), { tone: "hi" }) + L(k.ring(-133, 145, 16, TOP + 8, P, 32), { tone: "mid" }));
add("controls", "play", S(k.cylinder(-133, 200, 22, TOP, 8, P, 40, 0.8), { tone: "hi", lit: true, className: "pl-lime" }));
const slot = { x: 128, y: -10, w: 12, d: 200, r: 6 };
add("controls", "tempo slot", S(k.slabOf(slot, TOP - 2, 2, P, 4), { tone: "lo", crease: "none" }) + L(k.planOutline(slot, TOP, P, 4), { tone: "lo" }));
const tt = k.topTicks(slot.y + 8, slot.y + slot.d - 8, 9, 5, slot.x - 14, TOP, [5, 9], P, "y");
add("controls", "tempo scale", L(tt.minor, { tone: "lo" }) + L(tt.major, { tone: "mid" }));
add("controls", "tempo fader", S(k.slabOf({ x: slot.x - 8, y: slot.y + 84, w: slot.w + 16, d: 24, r: 3 }, TOP, 16, P, 3, 0.6), { tone: "hi" }));
add("controls", "tempo range", S(k.slabOf({ x: 120, y: 205, w: 30, d: 18, r: 3 }, TOP, 4, P, 2), { tone: "mid" }));

anchor("chassis", [BODY.x + BODY.w, BODY.y + BODY.d * 0.75, -BODY_H / 2]);
anchor("display", [HOOD.x + HOOD.w, HOOD.y + 20, 22]);
anchor("controls", [slot.x + slot.w, slot.y + slot.d * 0.6, TOP]);
anchor("jog", [jx - JOG_R * 0.75, jy + JOG_R * 0.6, TOP + 14]);
f.save();
