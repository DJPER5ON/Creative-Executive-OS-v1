// Isometric anatomy of a laptop: aluminium base, keyboard, trackpad, hinge and
// an open lid whose screen shows an editing timeline with the P mark. Generic
// design, no manufacturer marks.
//
//   node anatomy/laptop.mjs
import { figure } from "./common.mjs";
import * as G from "./kit/lathe.mjs";

const BASE = { x: -170, y: -115, w: 340, d: 236, r: 14 };
const BASE_H = 12;
const LID_Y = BASE.y - 2;
const LID_H = 222;

const f = figure("laptop", {
  fit: [
    [BASE.x, BASE.y, -4],
    [BASE.x + BASE.w, BASE.y, -4],
    [BASE.x, BASE.y + BASE.d, -4],
    [BASE.x + BASE.w, BASE.y + BASE.d, -4],
    [BASE.x, LID_Y - 8, BASE_H + LID_H],
    [BASE.x + BASE.w, LID_Y - 8, BASE_H + LID_H],
  ],
  azimuth: 32,
  elevation: 28,
});
const { P, k, S, L, add, markLocal, anchor } = f;

// ---------------------------------------------------------------- lid (at the back, drawn first)
const LID = { x: BASE.x + 4, y: LID_Y - 8, w: BASE.w - 8, d: 8, r: 3 };
add("lid", "lid", S(k.slabOf(LID, BASE_H, LID_H, P, 3, 0.6), { tone: "mid", className: "pl-ink" }));
// The screen, drawn on the lid's front (+y) face in its own units: x across, y down from the top edge.
{
  const W = LID.w - 24;
  const Hs = LID_H - 26;
  const tracks = [
    { y: 92, h: 18, clips: [[10, 70], [86, 60], [152, 110]], fill: "#C6FF33" },
    { y: 116, h: 18, clips: [[24, 90], [120, 40], [168, 80]], fill: "#7D39EB" },
    { y: 140, h: 18, clips: [[10, 140], [156, 120]], fill: "#e8e8e8" },
    { y: 164, h: 14, clips: [[10, 300]], fill: "#3a3a40" },
  ];
  const wave = Array.from({ length: 74 }, (_, i) => {
    const x = 12 + i * 4;
    const h = 2 + 5 * Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.19));
    return `M${x},${171 - h}L${x},${171 + h}`;
  }).join("");
  const ui = [
    `<rect x="0" y="0" width="${W}" height="${Hs}" rx="3" fill="#0d0d10"/>`,
    `<rect x="8" y="8" width="${W - 16}" height="72" rx="2" fill="#16161b"/>`,
    markLocal(W / 2, 44, 50, "#C6FF33"),
    `<text x="12" y="20" fill="#e8e8e8" font-size="7" style="font-family:monospace;letter-spacing:1px">PER5ON_REEL_v12 · 30s · 112.5 BPM</text>`,
    ...tracks.flatMap((t) => t.clips.map(([x, w]) => `<rect x="${x}" y="${t.y}" width="${w}" height="${t.h}" rx="2" fill="${t.fill}" opacity="0.9"/>`)),
    `<path d="${wave}" stroke="#C6FF33" stroke-width="1" fill="none"/>`,
    `<line x1="132" y1="84" x2="132" y2="${Hs - 6}" stroke="#ffffff" stroke-width="1.2"/>`,
    `<polygon points="128,84 136,84 132,90" fill="#ffffff"/>`,
  ].join("");
  add("lid", "screen", `<g transform="${k.sideMatrix([LID.x + 12, LID.y + LID.d], BASE_H + LID_H - 10, P, "left")}">${ui}</g>`);
}
{
  const F = G.frameAlong([BASE.x + 30, BASE.y + 2, BASE_H], [1, 0, 0]);
  add("lid", "hinge", S(G.disc(0, BASE.w - 60, 6, F, P), { tone: "mid", className: "pl-ink" }));
}

// ---------------------------------------------------------------- base
add("base", "shadow", `<path class="iso-halo" d="${k.haloOf(BASE, -4, BASE_H, P)}"/>`);
add("base", "base", S(k.slabOf(BASE, 0, BASE_H, P, 10, 1.2), { tone: "mid" }));
add("base", "keyboard well", L(k.planOutline({ x: BASE.x + 22, y: BASE.y + 22, w: BASE.w - 44, d: 108, r: 4 }, BASE_H, P, 4), { tone: "lo" }));
add("base", "trackpad", L(k.planOutline({ x: -62, y: BASE.y + 146, w: 124, d: 74, r: 6 }, BASE_H, P, 6), { tone: "mid" }));
add("base", "front notch", L(k.lineOnTop([-24, BASE.y + BASE.d], [24, BASE.y + BASE.d], BASE_H, P), { tone: "lo" }));

// ---------------------------------------------------------------- keys
const KX = BASE.x + 28;
const KY = BASE.y + 28;
for (let r = 0; r < 4; r++) {
  for (let c = 0; c < 12; c++) {
    const key = { x: KX + c * 24, y: KY + r * 24, w: 20, d: 19, r: 2.5 };
    const accent = r === 3 && c === 11;
    add("keys", "key", S(k.slabOf(key, BASE_H, 2.4, P, 2), { tone: "hi", lit: accent, className: accent ? "pl-lime" : "pl-ink" }));
  }
}
add("keys", "space bar", S(k.slabOf({ x: KX + 72, y: KY + 96, w: 140, d: 9, r: 2 }, BASE_H, 2.4, P, 2), { tone: "hi", className: "pl-ink" }));

anchor("lid", [LID.x + LID.w, LID.y, BASE_H + LID_H - 30]);
anchor("base", [BASE.x + BASE.w, BASE.y + BASE.d * 0.8, BASE_H / 2]);
anchor("keys", [KX + 11 * 24 + 20, KY + 40, BASE_H + 2]);
f.save();
