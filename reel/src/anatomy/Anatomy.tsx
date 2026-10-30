import React from "react";
import { useCurrentFrame } from "remotion";
import { LOGO_PATH } from "../logo-path";
import { draw, IN_OUT, MONO, prog, SANS } from "../theme";

/**
 * Hairline "anatomy" diagrams, one per discipline. Each draws on over ~22
 * frames from its own frame 0, inside an 800 × 800 viewBox.
 */
export type AnatomyProps = { fg: string; accent: string; size?: number; speed?: number };

const HAIR = 1.5;
const LINE = 3;

const Frame: React.FC<{ size: number; children: React.ReactNode }> = ({ size, children }) => (
  <svg width={size} height={size} viewBox="0 0 800 800" style={{ overflow: "visible" }}>
    {children}
  </svg>
);

const T: React.FC<{
  x: number;
  y: number;
  fill: string;
  o: number;
  anchor?: "start" | "middle" | "end";
  size?: number;
  children: React.ReactNode;
}> = ({ x, y, fill, o, anchor = "start", size = 26, children }) => (
  <text
    x={x}
    y={y}
    fill={fill}
    opacity={o}
    textAnchor={anchor}
    style={{ fontFamily: MONO, fontSize: size, letterSpacing: 2 }}
  >
    {children}
  </text>
);

const useP = (speed = 1) => {
  const f = useCurrentFrame() * speed;
  return (a: number, b: number) => prog(f, a, b, IN_OUT);
};

const cubic = (t: number, a: number, b: number, c: number, d: number) =>
  (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c + t ** 3 * d;

export const MotionGraphics: React.FC<AnatomyProps> = ({ fg, accent, size = 800, speed }) => {
  const p = useP(speed);
  const axes = p(0, 8);
  const curve = p(4, 20);
  const handles = p(10, 18);
  const labels = p(14, 22);
  const t = p(8, 26);
  const dx = cubic(t, 100, 380, 360, 700);
  const dy = cubic(t, 680, 680, 120, 100);
  return (
    <Frame size={size}>
      <g stroke={fg} strokeWidth={HAIR} fill="none" opacity={0.5}>
        <path d="M100,100 L100,680 L700,680" {...draw(axes)} />
        {[250, 400, 550].map((x) => (
          <line key={x} x1={x} x2={x} y1={100} y2={680} strokeDasharray="4 8" opacity={axes} />
        ))}
      </g>
      <path d="M100,680 C380,680 360,120 700,100" stroke={fg} strokeWidth={LINE} fill="none" {...draw(curve)} />
      <g stroke={fg} strokeWidth={HAIR} opacity={handles}>
        <line x1={100} y1={680} x2={380} y2={680} />
        <line x1={700} y1={100} x2={360} y2={120} />
        <circle cx={380} cy={680} r={10} fill="none" />
        <circle cx={360} cy={120} r={10} fill="none" />
      </g>
      <circle cx={dx} cy={dy} r={16} fill={accent} opacity={curve > 0 ? 1 : 0} />
      {[100, 700].map((x) => (
        <rect
          key={x}
          x={x - 12}
          y={748}
          width={24}
          height={24}
          transform={`rotate(45 ${x} 760)`}
          fill={x === 700 && t > 0.98 ? accent : "none"}
          stroke={fg}
          strokeWidth={HAIR}
          opacity={axes}
        />
      ))}
      <line x1={100} x2={100 + 600 * t} y1={760} y2={760} stroke={fg} strokeWidth={HAIR} opacity={0.5} />
      <T x={100} y={80} fill={fg} o={labels}>VALUE</T>
      <T x={700} y={720} fill={fg} o={labels} anchor="end">TIME</T>
      <T x={400} y={40} fill={fg} o={labels} anchor="middle">CUBIC-BEZIER(.16, 1, .3, 1)</T>
    </Frame>
  );
};

export const UIUX: React.FC<AnatomyProps> = ({ fg, accent, size = 800, speed }) => {
  const p = useP(speed);
  const phone = p(0, 12);
  const grid = p(6, 14);
  const blocks = [p(8, 14), p(10, 16), p(12, 18), p(14, 20)];
  const tap = p(18, 26);
  const labels = p(14, 22);
  const cols = [270, 350, 450, 530];
  return (
    <Frame size={size}>
      <rect x={230} y={60} width={340} height={680} rx={44} stroke={fg} strokeWidth={LINE} fill="none" {...draw(phone)} />
      <g stroke={fg} strokeWidth={HAIR} opacity={0.4 * grid}>
        {cols.map((x) => (
          <line key={x} x1={x} x2={x} y1={90} y2={710} strokeDasharray="4 8" />
        ))}
      </g>
      <g stroke={fg} strokeWidth={HAIR} fill="none">
        <rect x={270} y={120} width={260} height={36} rx={8} opacity={blocks[0]} />
        <rect x={270} y={186} width={260} height={180} rx={14} opacity={blocks[1]} />
        <line x1={270} y1={186} x2={530} y2={366} opacity={0.5 * blocks[1]} />
        <line x1={530} y1={186} x2={270} y2={366} opacity={0.5 * blocks[1]} />
        <rect x={270} y={396} width={120} height={150} rx={14} opacity={blocks[2]} />
        <rect x={410} y={396} width={120} height={150} rx={14} opacity={blocks[2]} />
      </g>
      <rect x={270} y={600} width={260} height={64} rx={32} fill={accent} opacity={blocks[3]} />
      <circle cx={430} cy={632} r={20 + 60 * tap} stroke={fg} strokeWidth={HAIR} fill="none" opacity={(1 - tap) * blocks[3]} />
      <path
        d="M430,632 l0,52 l14,-14 l12,26 l10,-5 l-12,-25 l20,0 z"
        fill={fg}
        stroke={fg === "#000000" ? "#FFFFFF" : "#000000"}
        strokeWidth={2}
        opacity={tap > 0 ? 1 : 0}
      />
      <g stroke={fg} strokeWidth={HAIR} opacity={labels}>
        <line x1={230} x2={570} y1={30} y2={30} />
        <line x1={230} x2={230} y1={20} y2={40} />
        <line x1={570} x2={570} y1={20} y2={40} />
        <line x1={600} x2={640} y1={632} y2={632} />
      </g>
      <T x={400} y={18} fill={fg} o={labels} anchor="middle">375 × 812</T>
      <T x={650} y={640} fill={fg} o={labels}>44PT</T>
      <T x={200} y={300} fill={fg} o={labels} anchor="end">8PT</T>
      <T x={200} y={330} fill={fg} o={labels} anchor="end">GRID</T>
    </Frame>
  );
};

export const Branding: React.FC<AnatomyProps> = ({ fg, accent, size = 800, speed }) => {
  const p = useP(speed);
  const guides = p(0, 12);
  const outline = p(4, 22);
  const fill = p(20, 28);
  const labels = p(14, 22);
  return (
    <Frame size={size}>
      <g stroke={fg} strokeWidth={HAIR} fill="none" opacity={0.45}>
        <circle cx={400} cy={400} r={330} {...draw(guides)} />
        <circle cx={400} cy={400} r={190} {...draw(guides)} />
        <rect x={100} y={100} width={600} height={600} {...draw(guides)} />
        <line x1={400} y1={40} x2={400} y2={760} {...draw(guides)} />
        <line x1={40} y1={400} x2={760} y2={400} {...draw(guides)} />
        <line x1={150} y1={700} x2={650} y2={100} strokeDasharray="4 8" opacity={guides} />
      </g>
      {[100, 700].flatMap((x) =>
        [100, 700].map((y) => (
          <rect key={`${x}${y}`} x={x - 8} y={y - 8} width={16} height={16} fill="none" stroke={fg} strokeWidth={HAIR} opacity={guides} />
        )),
      )}
      <g transform="translate(100 100) scale(0.6857)">
        <path
          d={LOGO_PATH}
          fillRule="evenodd"
          fill={fg}
          fillOpacity={fill}
          stroke={fg}
          strokeWidth={2.2}
          vectorEffect="non-scaling-stroke"
          {...draw(outline)}
        />
      </g>
      <circle cx={400} cy={400} r={10} fill={accent} opacity={labels} />
      <T x={720} y={90} fill={fg} o={labels}>R 330</T>
      <T x={100} y={740} fill={fg} o={labels}>CONSTRUCTION</T>
      <T x={700} y={740} fill={fg} o={labels} anchor="end">50° AXIS</T>
    </Frame>
  );
};

export const Strategy: React.FC<AnatomyProps> = ({ fg, accent, size = 800, speed }) => {
  const p = useP(speed);
  const nodes = [
    { x: 130, y: 400, r: 46, label: "INSIGHT", at: 0 },
    { x: 400, y: 220, r: 34, label: "IDEA", at: 6 },
    { x: 400, y: 580, r: 34, label: "STORY", at: 8 },
    { x: 670, y: 400, r: 56, label: "IMPACT", at: 14 },
  ];
  const edges: [number, number, number][] = [
    [0, 1, 3], [0, 2, 5], [1, 3, 10], [2, 3, 12], [1, 2, 8],
  ];
  const sats = [
    [250, 130], [560, 140], [250, 690], [560, 680], [130, 220], [700, 640],
  ];
  const labels = p(14, 22);
  return (
    <Frame size={size}>
      <g stroke={fg} strokeWidth={HAIR} opacity={0.4}>
        {sats.map(([x, y], i) => {
          const near = nodes.reduce((a, n) => (Math.hypot(n.x - x, n.y - y) < Math.hypot(a.x - x, a.y - y) ? n : a));
          return <line key={i} x1={near.x} y1={near.y} x2={x} y2={y} {...draw(p(6 + i, 16 + i))} />;
        })}
      </g>
      {sats.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={8} fill="none" stroke={fg} strokeWidth={HAIR} opacity={0.5 * p(14 + i, 18 + i)} />
      ))}
      {edges.map(([a, b, at], i) => (
        <line
          key={i}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke={fg}
          strokeWidth={i === 4 ? HAIR : LINE}
          {...(i === 4 ? { strokeDasharray: "4 8", opacity: p(at, at + 6) } : draw(p(at, at + 8)))}
        />
      ))}
      {nodes.map((n, i) => (
        <g key={n.label}>
          <circle
            cx={n.x}
            cy={n.y}
            r={n.r * p(n.at, n.at + 6)}
            fill={i === 3 ? accent : "transparent"}
            stroke={fg}
            strokeWidth={LINE}
          />
          <T x={n.x} y={n.y + n.r + 44} fill={fg} o={labels} anchor="middle">{n.label}</T>
        </g>
      ))}
    </Frame>
  );
};

export const CreativeWriting: React.FC<AnatomyProps> = ({ fg, accent, size = 800, speed }) => {
  const p = useP(speed);
  const frame = useCurrentFrame();
  const guides = p(0, 10);
  const glyphA = p(4, 10);
  const glyphG = p(8, 14);
  const labels = p(10, 18);
  // Inter Tight metrics at 290px: cap ≈ 169, x-height ≈ 222, baseline 380, descender ≈ 438.
  const metrics: [number, string][] = [[169, "CAP"], [222, "X-HEIGHT"], [380, "BASELINE"], [438, "DESCENDER"]];
  const lines = [640, 560, 600, 380];
  const typed = lines.map((_, i) => p(12 + i * 4, 18 + i * 4));
  const caretX = 80 + lines[3] * typed[3] + 12;
  const caretOn = typed[3] < 1 || Math.floor(frame / 8) % 2 === 0;
  return (
    <Frame size={size}>
      <g stroke={fg} strokeWidth={HAIR} opacity={0.5}>
        {metrics.map(([y]) => (
          <line key={y} x1={80} x2={80 + 640 * guides} y1={y} y2={y} strokeDasharray={y === 380 ? undefined : "4 8"} />
        ))}
      </g>
      {metrics.map(([y, l]) => (
        <T key={l} x={720} y={y - 10} fill={fg} o={labels} anchor="end" size={20}>{l}</T>
      ))}
      <text x={96} y={380} fill={fg} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 290, letterSpacing: -8 }}>
        <tspan fillOpacity={glyphA}>A</tspan>
        <tspan fillOpacity={glyphG}>g</tspan>
      </text>
      <T x={80} y={505} fill={fg} o={labels} size={20}>BODY COPY</T>
      {lines.map((w, i) => (
        <rect key={i} x={80} y={540 + i * 50} width={w * typed[i]} height={18} rx={9} fill={fg} opacity={0.85} />
      ))}
      <rect x={260} y={590} width={170 * typed[1]} height={18} rx={9} fill={accent} />
      <rect x={caretX} y={680} width={4} height={36} fill={accent} opacity={typed[0] > 0 && caretOn ? 1 : 0} />
    </Frame>
  );
};

export const MusicProduction: React.FC<AnatomyProps> = ({ fg, accent, size = 800, speed }) => {
  const p = useP(speed);
  const grid = p(0, 10);
  const head = p(6, 30);
  const labels = p(10, 18);
  const steps = 16;
  const rows = 6;
  const x0 = 80, x1 = 720, y0 = 200, y1 = 560;
  const cw = (x1 - x0) / steps;
  const ch = (y1 - y0) / rows;
  // Kick on 1/5/9/13, snare on 5/13, hats on odd steps, a short melody on top.
  const notes: [number, number][] = [
    [0, 5], [4, 5], [8, 5], [12, 5], [4, 4], [12, 4],
    ...[0, 2, 4, 6, 8, 10, 12, 14].map((s) => [s, 3] as [number, number]),
    [0, 0], [3, 1], [6, 0], [7, 2], [10, 1], [11, 0], [14, 2],
  ];
  const headX = x0 + (x1 - x0) * head;
  return (
    <Frame size={size}>
      <g stroke={fg} strokeWidth={HAIR} opacity={0.35}>
        {Array.from({ length: steps + 1 }, (_, i) => (
          <line key={`v${i}`} x1={x0 + i * cw} x2={x0 + i * cw} y1={y0} y2={y0 + (y1 - y0) * grid} strokeWidth={i % 4 === 0 ? 2.5 : HAIR} />
        ))}
        {Array.from({ length: rows + 1 }, (_, i) => (
          <line key={`h${i}`} x1={x0} x2={x0 + (x1 - x0) * grid} y1={y0 + i * ch} y2={y0 + i * ch} />
        ))}
      </g>
      {notes.map(([s, r], i) => {
        const x = x0 + s * cw;
        const lit = headX > x;
        return (
          <rect
            key={i}
            x={x + 4}
            y={y0 + r * ch + 6}
            width={cw - 8}
            height={ch - 12}
            rx={4}
            fill={lit ? accent : "none"}
            stroke={fg}
            strokeWidth={HAIR}
            opacity={grid}
          />
        );
      })}
      <line x1={headX} x2={headX} y1={y0 - 40} y2={y1 + 40} stroke={fg} strokeWidth={LINE} opacity={head > 0 && head < 1 ? 1 : 0} />
      {[0, 1, 2, 3].map((b) => (
        <T key={b} x={x0 + b * 4 * cw + 6} y={y0 - 16} fill={fg} o={labels}>{b + 1}</T>
      ))}
      <T x={x0} y={y1 + 80} fill={fg} o={labels}>128 BPM</T>
      <T x={x1} y={y1 + 80} fill={fg} o={labels} anchor="end">4/4 · 16 STEPS</T>
      {["LEAD", "", "", "HAT", "SNR", "KCK"].map((l, i) => (
        <T key={i} x={x0 - 14} y={y0 + i * ch + ch / 2 + 8} fill={fg} o={labels} anchor="end" size={18}>{l}</T>
      ))}
    </Frame>
  );
};

export const SoundDesign: React.FC<AnatomyProps> = ({ fg, accent, size = 800, speed }) => {
  const p = useP(speed);
  const wave = p(0, 16);
  const env = p(8, 22);
  const labels = p(14, 22);
  const pts: string[] = [];
  for (let i = 0; i <= 300; i++) {
    const x = 80 + (640 * i) / 300;
    const u = i / 300;
    const amp = 150 * Math.min(1, u * 6) * Math.exp(-u * 1.6);
    const y = 280 + amp * (0.7 * Math.sin(u * 60) + 0.3 * Math.sin(u * 170));
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const adsr: [number, number][] = [[80, 700], [190, 480], [300, 570], [560, 570], [720, 700]];
  return (
    <Frame size={size}>
      <line x1={80} x2={720} y1={280} y2={280} stroke={fg} strokeWidth={HAIR} opacity={0.4} strokeDasharray="4 8" />
      <path d={pts.join("")} stroke={fg} strokeWidth={2.5} fill="none" {...draw(wave)} />
      <g stroke={fg} strokeWidth={HAIR} opacity={0.4}>
        <path d="M80,460 L80,700 L720,700" fill="none" {...draw(env)} />
        {adsr.slice(1, 4).map(([x], i) => (
          <line key={i} x1={x} x2={x} y1={460} y2={700} strokeDasharray="4 8" opacity={env} />
        ))}
      </g>
      <path d={"M" + adsr.map(([x, y]) => `${x},${y}`).join(" L")} stroke={accent} strokeWidth={LINE + 1} fill="none" {...draw(env)} />
      {adsr.slice(1, 4).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={9} fill={fg} opacity={env} />
      ))}
      {[["A", 135], ["D", 245], ["S", 430], ["R", 640]].map(([l, x]) => (
        <T key={l} x={x as number} y={745} fill={fg} o={labels} anchor="middle">{l}</T>
      ))}
      <T x={80} y={80} fill={fg} o={labels}>20 HZ</T>
      <T x={720} y={80} fill={fg} o={labels} anchor="end">20 KHZ</T>
      <T x={400} y={80} fill={fg} o={labels} anchor="middle">−6 DB</T>
    </Frame>
  );
};

export const DISCIPLINES: { name: [string, string]; Diagram: React.FC<AnatomyProps> }[] = [
  { name: ["Motion", "Graphics"], Diagram: MotionGraphics },
  { name: ["UI/UX", "Design"], Diagram: UIUX },
  { name: ["", "Branding"], Diagram: Branding },
  { name: ["Creative", "Writing"], Diagram: CreativeWriting },
  { name: ["Creative", "Strategy"], Diagram: Strategy },
  { name: ["Music", "Production"], Diagram: MusicProduction },
  { name: ["Sound", "Design"], Diagram: SoundDesign },
];
