// Shared plumbing for the figure builds: a projection, a parts list with
// assemblies, the P mark laid onto faces, and the JSON + preview writers.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIGURES = join(HERE, "../src/anatomy/figures");
const LOGO = readFileSync(join(HERE, "../src/logo-path.ts"), "utf8").match(/LOGO_PATH =\s*"([^"]+)"/)[1];

/** Lime parts (className "pl-lime"), dark parts ("pl-ink") and lime screen graphics (inside a "pl-glow" group). */
export const LIME_CSS =
  ".iso-solid.pl-lime>.iso-fill,.iso-solid.pl-lime[data-lit]>.iso-top{fill:#C6FF33}.iso-solid.pl-lime[data-lit]>.iso-shade{fill:#A8DB22}" +
  ".iso-solid.pl-ink>.iso-fill,.iso-solid.pl-ink>.iso-top{fill:#202024}.iso-solid.pl-ink>.iso-shade{fill:#16161a}" +
  ".pl-glow .iso-line{stroke:#C6FF33;stroke-width:1.4}.pl-glow .iso-face-text{fill:#e8e8e8}";

/**
 * Start a figure. `fit` is every extreme world point; returns the projection
 * and helpers bound to it.
 */
export function figure(name, { width = 760, height = 760, fit, azimuth = 40, elevation = 30, pad = 40 }) {
  const P = k.fitProjection(fit, width, height, { pad, azimuth, elevation });
  const parts = [];
  const anchors = {};
  const groups = [];
  const at = (p) => k.iso(p, P);
  const S = (paths, style) => k.solidSvg(paths, style);
  const L = (d, style) => k.lineSvg(d, style);
  const D = (points, style) => k.dotsSvg(points, style);
  const add = (group, label, svg) => {
    if (!groups.includes(group)) groups.push(group);
    parts.push({ group, label, svg });
  };
  const markOn = (matrix, size, fill) =>
    `<g transform="${matrix}"><g transform="scale(${size / 875}) translate(-437.5 -433.5)"><path d="${LOGO}" fill="${fill}" fill-rule="evenodd"/></g></g>`;
  /** The P mark flat on a horizontal face. */
  const markOnTop = (point, z, size, fill) => markOn(k.topMatrix(point, z, P, "x"), size, fill);
  /** The P mark on a vertical face: "left" is the +y face, "right" the +x face (both face the viewer). */
  const markOnSide = (point, z, face, size, fill) => markOn(k.sideMatrix(point, z, P, face), size, fill);
  /** The P mark as plain SVG in a face's own units, centred on (cx, cy): for content built inside a face matrix. */
  const markLocal = (cx, cy, size, fill) =>
    `<g transform="translate(${cx} ${cy}) scale(${size / 875}) translate(-437.5 -433.5)"><path d="${LOGO}" fill="${fill}" fill-rule="evenodd"/></g>`;
  const anchor = (group, point) => {
    anchors[group] = at(point);
  };
  const save = () => {
    mkdirSync(FIGURES, { recursive: true });
    const json = { width, height, rise: k.screenRise(1, P), groups, anchors, parts };
    writeFileSync(join(FIGURES, `${name}.json`), JSON.stringify(json));
    writeFileSync(
      join(HERE, `${name}-preview.html`),
      `<!doctype html><meta charset="utf-8"><style>${k.ISO_CSS}${LIME_CSS}</style><body class="iso" data-theme="light" style="margin:0;background:#f2f2ef">${k.figureSvg({ width, height, label: name, body: parts.map((p) => p.svg) })}</body>`,
    );
    console.log(`${name}: ${parts.length} parts in ${groups.length} assemblies`);
  };
  return { P, k, at, S, L, D, add, markOnTop, markOnSide, markLocal, anchor, save };
}

/** Halo plus four turned feet under a plan, sorted back to front. */
export function feet({ k, P, S, add }, plan, inset, r, z0, h, group = "base") {
  const list = k.corners(plan, inset).sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
  for (const [x, y] of list) add(group, "foot", S(k.cylinder(x, y, r, z0, h, P, 32, 0.4), { tone: "mid" }));
}
