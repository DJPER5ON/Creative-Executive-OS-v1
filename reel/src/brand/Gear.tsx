import React from "react";
import { useCurrentFrame } from "remotion";
import { LOGO_PATH } from "../logo-path";
import { C, MONO, SANS } from "../theme";

/**
 * The P mark applied to the gear of the trade — original vector drawings of a
 * record, turntable, media player, mixer, flight case, studio monitor,
 * headphones and a phone profile. Each fills a 1080 × 1920 frame, centred on
 * y ≈ 900, and moves with the frame (spinning platters, meters, a pumping woofer).
 */

const RPM_33 = (33.333 / 60) * 360 / 30; // degrees per frame at 30 fps

/** The logo at a given centre and size, optionally rotated or skewed onto a surface. */
export const Mark: React.FC<{ cx: number; cy: number; size: number; color: string; rotate?: number; transform?: string; opacity?: number }> = ({
  cx,
  cy,
  size,
  color,
  rotate = 0,
  transform = "",
  opacity = 1,
}) => {
  const s = size / 875;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rotate}) ${transform} scale(${s}) translate(-437.5 -433.5)`} opacity={opacity}>
      <path d={LOGO_PATH} fill={color} fillRule="evenodd" />
    </g>
  );
};

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    {children}
  </svg>
);

/** Fine monospace label, as on gear faceplates. */
const Tag: React.FC<{ x: number; y: number; children: React.ReactNode; color?: string; size?: number; anchor?: "start" | "middle" | "end"; opacity?: number }> = ({
  x,
  y,
  children,
  color = C.white,
  size = 20,
  anchor = "start",
  opacity = 0.7,
}) => (
  <text x={x} y={y} fill={color} opacity={opacity} textAnchor={anchor} style={{ fontFamily: MONO, fontSize: size, letterSpacing: 3 }}>
    {children}
  </text>
);

// ---------------------------------------------------------------- record

export const Vinyl: React.FC<{ label?: string }> = ({ label = C.lime }) => {
  const f = useCurrentFrame();
  const spin = f * RPM_33 * 2;
  const cx = 540;
  const cy = 900;
  return (
    <Svg>
      <defs>
        <radialGradient id="vinyl" cx="50%" cy="50%" r="50%">
          <stop offset="0.3" stopColor="#151515" />
          <stop offset="1" stopColor="#060606" />
        </radialGradient>
        <path id="labelRing" d={`M ${cx - 118} ${cy} a 118 118 0 1 1 236 0 a 118 118 0 1 1 -236 0`} />
      </defs>
      <circle cx={cx + 14} cy={cy + 22} r={470} fill="#000" opacity={0.5} style={{ filter: "blur(22px)" }} />
      <circle cx={cx} cy={cy} r={470} fill="url(#vinyl)" />
      {Array.from({ length: 46 }, (_, i) => (
        <circle key={i} cx={cx} cy={cy} r={190 + i * 6} fill="none" stroke="#1f1f1f" strokeWidth={i % 9 === 0 ? 2.2 : 0.8} />
      ))}
      {/* Light catching the grooves: two soft wedges that stay put while the record turns */}
      <path d={`M${cx},${cy} L${cx + 470 * Math.cos(-1.1)},${cy + 470 * Math.sin(-1.1)} A470,470 0 0,1 ${cx + 470 * Math.cos(-0.75)},${cy + 470 * Math.sin(-0.75)} Z`} fill="#fff" opacity={0.07} />
      <path d={`M${cx},${cy} L${cx + 470 * Math.cos(2.05)},${cy + 470 * Math.sin(2.05)} A470,470 0 0,1 ${cx + 470 * Math.cos(2.4)},${cy + 470 * Math.sin(2.4)} Z`} fill="#fff" opacity={0.05} />
      <g transform={`rotate(${spin} ${cx} ${cy})`}>
        <circle cx={cx} cy={cy} r={168} fill={label} />
        <circle cx={cx} cy={cy} r={168} fill="none" stroke="#000" strokeOpacity={0.2} strokeWidth={2} />
        <Mark cx={cx} cy={cy - 6} size={150} color={C.black} />
        <text fill={C.black} style={{ fontFamily: MONO, fontSize: 17, letterSpacing: 4 }}>
          <textPath href="#labelRing" startOffset="2%">
            PER5ON · FORWARD PULSE · SIDE A · 33⅓ RPM · ELMOHANAD KAROUM ·
          </textPath>
        </text>
      </g>
      <circle cx={cx} cy={cy} r={9} fill="#0b0b0b" />
      <circle cx={cx} cy={cy} r={9} fill="none" stroke="#333" strokeWidth={1.5} />
      <Tag x={90} y={1500} color={C.white}>12" · 180G · PRESSING 001</Tag>
      <Tag x={990} y={1500} anchor="end">PER5ON / LP</Tag>
    </Svg>
  );
};

// ---------------------------------------------------------------- turntable (top view)

export const Turntable: React.FC = () => {
  const f = useCurrentFrame();
  const spin = f * RPM_33 * 2;
  const pcx = 470;
  const pcy = 900;
  return (
    <Svg>
      <defs>
        <linearGradient id="plinth" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a2a2a" />
          <stop offset="1" stopColor="#141414" />
        </linearGradient>
        <radialGradient id="platterMetal" cx="50%" cy="50%" r="50%">
          <stop offset="0.85" stopColor="#3a3a3a" />
          <stop offset="1" stopColor="#5a5a5a" />
        </radialGradient>
      </defs>
      <rect x={70} y={470} width={940} height={860} rx={34} fill="#000" opacity={0.55} style={{ filter: "blur(24px)" }} transform="translate(10 18)" />
      <rect x={70} y={470} width={940} height={860} rx={34} fill="url(#plinth)" />
      <rect x={86} y={486} width={908} height={828} rx={26} fill="none" stroke="#3a3a3a" strokeWidth={1.5} />
      {/* platter with strobe dots */}
      <circle cx={pcx} cy={pcy} r={372} fill="url(#platterMetal)" />
      <g transform={`rotate(${spin} ${pcx} ${pcy})`}>
        {Array.from({ length: 120 }, (_, i) => {
          const a = (i / 120) * Math.PI * 2;
          return <circle key={i} cx={pcx + 360 * Math.cos(a)} cy={pcy + 360 * Math.sin(a)} r={3} fill="#9a9a9a" />;
        })}
        {/* felt slipmat with the mark */}
        <circle cx={pcx} cy={pcy} r={340} fill="#0b0b0b" />
        <circle cx={pcx} cy={pcy} r={340} fill="none" stroke="#1d1d1d" strokeWidth={2} />
        <Mark cx={pcx} cy={pcy} size={430} color={C.white} />
        <circle cx={pcx} cy={pcy} r={300} fill="none" stroke={C.lime} strokeWidth={2} strokeDasharray="2 14" />
      </g>
      <circle cx={pcx} cy={pcy} r={10} fill="#c8c8c8" />
      {/* tonearm */}
      <circle cx={890} cy={590} r={56} fill="#2f2f2f" stroke="#4a4a4a" strokeWidth={2} />
      <circle cx={890} cy={590} r={30} fill="#3c3c3c" />
      <circle cx={915} cy={520} r={30} fill="#4a4a4a" />
      <path d="M890,590 L860,1060 L770,1130" fill="none" stroke="#cfcfcf" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={730} y={1110} width={70} height={42} rx={6} fill={C.lime} transform="rotate(-38 765 1131)" />
      <circle cx={930} cy={1000} r={14} fill="#2b2b2b" stroke="#4a4a4a" strokeWidth={2} />
      {/* pitch fader */}
      <rect x={940} y={760} width={20} height={380} rx={8} fill="#0d0d0d" />
      {Array.from({ length: 17 }, (_, i) => (
        <line key={i} x1={968} x2={i % 4 === 0 ? 990 : 980} y1={770 + i * 22.5} y2={770 + i * 22.5} stroke="#5a5a5a" strokeWidth={1.5} />
      ))}
      <rect x={926} y={930} width={48} height={30} rx={4} fill="#d9d9d9" />
      {/* start/stop, 33/45, target light */}
      <rect x={110} y={1200} width={140} height={90} rx={10} fill="#3a3a3a" stroke="#555" strokeWidth={2} />
      <Tag x={180} y={1255} anchor="middle" size={18}>START·STOP</Tag>
      <rect x={280} y={1240} width={70} height={42} rx={6} fill={C.lime} />
      <rect x={364} y={1240} width={70} height={42} rx={6} fill="#3a3a3a" />
      <Tag x={315} y={1268} anchor="middle" size={18} color={C.black} opacity={0.9}>33</Tag>
      <Tag x={399} y={1268} anchor="middle" size={18}>45</Tag>
      <circle cx={130} cy={520} r={16} fill="#3a3a3a" />
      <circle cx={130} cy={520} r={7} fill={C.lime} />
      <Tag x={90} y={1440}>DIRECT DRIVE · 33⅓ / 45</Tag>
    </Svg>
  );
};

// ---------------------------------------------------------------- media player (CDJ-style, generic)

export const MediaPlayer: React.FC = () => {
  const f = useCurrentFrame();
  const spin = f * 9;
  const jx = 540;
  const jy = 1080;
  const bars = Array.from({ length: 96 }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 0.61) * Math.cos(i * 0.23 + 1)));
  const head = (f * 3) % 96;
  return (
    <Svg>
      <rect x={90} y={300} width={900} height={1250} rx={30} fill="#000" opacity={0.55} style={{ filter: "blur(24px)" }} transform="translate(10 18)" />
      <rect x={90} y={300} width={900} height={1250} rx={30} fill="#1b1b1b" />
      <rect x={104} y={314} width={872} height={1222} rx={22} fill="none" stroke="#333" strokeWidth={1.5} />
      {/* screen */}
      <rect x={190} y={380} width={700} height={300} rx={10} fill="#050505" stroke="#333" strokeWidth={2} />
      <Tag x={214} y={420} size={18} opacity={0.9}>PER5ON — FORWARD PULSE</Tag>
      <Tag x={866} y={420} size={18} anchor="end" color={C.lime} opacity={1}>112.5 BPM</Tag>
      {bars.map((h, i) => (
        <rect key={i} x={214 + i * 6.9} y={540 - h * 80} width={4.6} height={h * 160} fill={i < head ? C.lime : "#4a4a4a"} />
      ))}
      <line x1={214 + head * 6.9} x2={214 + head * 6.9} y1={450} y2={640} stroke={C.white} strokeWidth={2} />
      <Tag x={214} y={665} size={16}>A · KEY 4A · −02:41</Tag>
      {/* jog wheel */}
      <circle cx={jx} cy={jy} r={330} fill="#111" stroke="#2c2c2c" strokeWidth={4} />
      <g transform={`rotate(${spin} ${jx} ${jy})`}>
        {Array.from({ length: 72 }, (_, i) => {
          const a = (i / 72) * Math.PI * 2;
          return <line key={i} x1={jx + 300 * Math.cos(a)} y1={jy + 300 * Math.sin(a)} x2={jx + 322 * Math.cos(a)} y2={jy + 322 * Math.sin(a)} stroke="#3a3a3a" strokeWidth={3} />;
        })}
        <circle cx={jx + 250} cy={jy} r={8} fill={C.lime} />
      </g>
      <circle cx={jx} cy={jy} r={270} fill="#202020" />
      <circle cx={jx} cy={jy} r={150} fill="#050505" stroke={C.lime} strokeWidth={3} />
      <Mark cx={jx} cy={jy} size={190} color={C.lime} rotate={spin} />
      {/* cue / play */}
      <circle cx={190} cy={1440} r={48} fill="#151515" stroke="#ff9d2e" strokeWidth={4} />
      <circle cx={320} cy={1440} r={48} fill="#151515" stroke={C.lime} strokeWidth={4} />
      <Tag x={190} y={1447} anchor="middle" size={18}>CUE</Tag>
      <path d="M306,1422 L342,1440 L306,1458 Z" fill={C.lime} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={560 + i * 100} y={1408} width={78} height={60} rx={8} fill={i === 0 ? C.lime : "#2a2a2a"} />
      ))}
      <Tag x={90} y={1640} opacity={0.6}>PLAYER 1 · LINK ON</Tag>
    </Svg>
  );
};

// ---------------------------------------------------------------- mixer

export const Mixer: React.FC = () => {
  const f = useCurrentFrame();
  const chans = [250, 430, 650, 830];
  const level = (c: number) => Math.max(0, Math.min(12, Math.round(7 + 5 * Math.sin(f * 0.6 + c * 1.7))));
  return (
    <Svg>
      <rect x={120} y={250} width={840} height={1320} rx={26} fill="#000" opacity={0.55} style={{ filter: "blur(24px)" }} transform="translate(10 18)" />
      <rect x={120} y={250} width={840} height={1320} rx={26} fill="#1d1d1d" />
      <rect x={134} y={264} width={812} height={1292} rx={18} fill="none" stroke="#353535" strokeWidth={1.5} />
      <Mark cx={210} cy={330} size={70} color={C.white} />
      <Tag x={260} y={338} size={20} opacity={0.85}>PER5ON · 4CH</Tag>
      {chans.map((x, c) => (
        <g key={x}>
          {[440, 560, 680].map((y, k) => (
            <g key={y}>
              <circle cx={x} cy={y} r={38} fill="#2c2c2c" stroke="#454545" strokeWidth={2} />
              <line x1={x} y1={y} x2={x + 28 * Math.cos(-2.2 + (c + k) * 0.6)} y2={y + 28 * Math.sin(-2.2 + (c + k) * 0.6)} stroke={C.white} strokeWidth={4} strokeLinecap="round" />
            </g>
          ))}
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x={x - 70} y={1180 - i * 26} width={14} height={18} rx={2} fill={i < level(c) ? (i > 9 ? "#ff5a4f" : C.lime) : "#2a2a2a"} />
          ))}
          <rect x={x - 8} y={860} width={16} height={340} rx={8} fill="#0c0c0c" />
          <rect x={x - 34} y={940 + 70 * Math.abs(Math.sin(c * 1.3))} width={68} height={40} rx={6} fill="#d6d6d6" />
        </g>
      ))}
      <line x1={340} x2={740} y1={1430} y2={1430} stroke="#0c0c0c" strokeWidth={16} strokeLinecap="round" />
      <rect x={520 + 120 * Math.sin(f * 0.25)} y={1410} width={44} height={40} rx={6} fill={C.lime} />
      <Tag x={540} y={1500} anchor="middle" size={18}>CROSSFADER</Tag>
    </Svg>
  );
};

// ---------------------------------------------------------------- flight case

export const FlightCase: React.FC = () => (
  <Svg>
    <defs>
      <linearGradient id="alu" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#3b3b3b" />
        <stop offset="0.5" stopColor="#2a2a2a" />
        <stop offset="1" stopColor="#1a1a1a" />
      </linearGradient>
      <pattern id="ply" width="12" height="12" patternUnits="userSpaceOnUse">
        <rect width="12" height="12" fill="#161616" />
        <path d="M0 12 L12 0" stroke="#1d1d1d" strokeWidth="2" />
      </pattern>
    </defs>
    <rect x={90} y={460} width={900} height={900} rx={14} fill="#000" opacity={0.55} style={{ filter: "blur(24px)" }} transform="translate(10 18)" />
    <rect x={90} y={460} width={900} height={900} rx={14} fill="url(#ply)" />
    {/* aluminium extrusions */}
    <rect x={90} y={460} width={900} height={36} fill="url(#alu)" />
    <rect x={90} y={1324} width={900} height={36} fill="url(#alu)" />
    <rect x={90} y={460} width={36} height={900} fill="url(#alu)" />
    <rect x={954} y={460} width={36} height={900} fill="url(#alu)" />
    <rect x={90} y={890} width={900} height={22} fill="url(#alu)" />
    {[
      [90, 460],
      [890, 460],
      [90, 1260],
      [890, 1260],
    ].map(([x, y]) => (
      <rect key={`${x}${y}`} x={x} y={y} width={100} height={100} rx={18} fill="#4a4a4a" stroke="#5c5c5c" strokeWidth={2} />
    ))}
    {[300, 780].map((x) => (
      <g key={x}>
        <rect x={x - 46} y={872} width={92} height={58} rx={8} fill="#5a5a5a" stroke="#777" strokeWidth={2} />
        <circle cx={x} cy={901} r={10} fill="#2a2a2a" />
      </g>
    ))}
    <Mark cx={540} cy={680} size={260} color={C.white} />
    <text x={540} y={1150} textAnchor="middle" fill={C.white} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 150, letterSpacing: 10 }}>
      PER5ON
    </text>
    <Tag x={540} y={1220} anchor="middle" color={C.lime} opacity={1} size={24}>
      FRAGILE · DECKS · DOHA → WORLD
    </Tag>
  </Svg>
);

// ---------------------------------------------------------------- studio monitor

export const Monitor: React.FC = () => {
  const f = useCurrentFrame();
  const pump = 1 + 0.025 * Math.max(0, Math.cos(((f % 16) / 16) * Math.PI * 2)) ** 6;
  return (
    <Svg>
      <rect x={250} y={360} width={580} height={1180} rx={36} fill="#000" opacity={0.55} style={{ filter: "blur(24px)" }} transform="translate(10 18)" />
      <rect x={250} y={360} width={580} height={1180} rx={36} fill="#1c1c1c" />
      <rect x={266} y={376} width={548} height={1148} rx={28} fill="none" stroke="#333" strokeWidth={2} />
      <circle cx={540} cy={600} r={96} fill="#111" stroke="#3a3a3a" strokeWidth={6} />
      <circle cx={540} cy={600} r={42} fill="#2a2a2a" />
      <circle cx={540} cy={600} r={16} fill="#555" />
      <g transform={`translate(540 1030) scale(${pump}) translate(-540 -1030)`}>
        <circle cx={540} cy={1030} r={230} fill="#101010" stroke="#3a3a3a" strokeWidth={8} />
        {[200, 170, 140].map((r) => (
          <circle key={r} cx={540} cy={1030} r={r} fill="none" stroke="#222" strokeWidth={2} />
        ))}
        <circle cx={540} cy={1030} r={78} fill="#1e1e1e" />
      </g>
      <rect x={490} y={1380} width={100} height={70} rx={8} fill={C.lime} />
      <Mark cx={540} cy={1415} size={52} color={C.black} />
      <circle cx={760} cy={1470} r={8} fill={C.lime} />
      <Tag x={540} y={1650} anchor="middle">NEARFIELD · 8" · PER5ON STUDIO</Tag>
    </Svg>
  );
};

// ---------------------------------------------------------------- headphones

export const Headphones: React.FC = () => (
  <Svg>
    <path d="M250,1050 C250,520 830,520 830,1050" fill="none" stroke="#000" strokeWidth={70} opacity={0.5} style={{ filter: "blur(20px)" }} transform="translate(8 16)" />
    <path d="M250,1050 C250,520 830,520 830,1050" fill="none" stroke="#202020" strokeWidth={58} strokeLinecap="round" />
    <path d="M250,1050 C250,540 830,540 830,1050" fill="none" stroke="#3a3a3a" strokeWidth={4} />
    <path d="M300,1000 C310,640 770,640 780,1000" fill="none" stroke="#111" strokeWidth={30} strokeLinecap="round" />
    {[250, 830].map((x, i) => (
      <g key={x}>
        <rect x={x - 26} y={960} width={52} height={130} rx={14} fill="#3a3a3a" />
        <ellipse cx={x} cy={1200} rx={150} ry={190} fill="#141414" stroke="#333" strokeWidth={6} />
        <ellipse cx={x} cy={1200} rx={118} ry={156} fill="#1e1e1e" />
        {i === 1 ? <Mark cx={x} cy={1200} size={150} color={C.lime} /> : <Mark cx={x} cy={1200} size={150} color={C.white} opacity={0.85} />}
      </g>
    ))}
    <Tag x={540} y={1520} anchor="middle">CLOSED-BACK · 50MM · PER5ON</Tag>
  </Svg>
);

// ---------------------------------------------------------------- phone profile (generic social UI)

export const PhoneProfile: React.FC = () => {
  const tiles = [C.lime, C.black, C.violet, C.white, C.violet, C.lime, C.black, C.lime, C.violet];
  return (
    <Svg>
      <rect x={250} y={250} width={580} height={1220} rx={70} fill="#000" opacity={0.55} style={{ filter: "blur(24px)" }} transform="translate(10 18)" />
      <rect x={250} y={250} width={580} height={1220} rx={70} fill="#0d0d0d" stroke="#3a3a3a" strokeWidth={6} />
      <rect x={474} y={276} width={132} height={34} rx={17} fill="#000" />
      <Tag x={300} y={360} size={20} opacity={0.9}>9:41</Tag>
      <circle cx={360} cy={500} r={70} fill={C.black} stroke={C.lime} strokeWidth={6} />
      <Mark cx={360} cy={500} size={96} color={C.white} />
      {[
        ["48", "posts"],
        ["12.4K", "followers"],
        ["311", "following"],
      ].map(([n, l], i) => (
        <g key={l}>
          <text x={510 + i * 105} y={492} textAnchor="middle" fill={C.white} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30 }}>
            {n}
          </text>
          <text x={510 + i * 105} y={524} textAnchor="middle" fill={C.white} opacity={0.6} style={{ fontFamily: SANS, fontSize: 18 }}>
            {l}
          </text>
        </g>
      ))}
      <text x={290} y={620} fill={C.white} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32 }}>
        PER5ON
      </text>
      <text x={290} y={656} fill={C.white} opacity={0.75} style={{ fontFamily: SANS, fontSize: 22 }}>
        Creative director · motion · music
      </text>
      <text x={290} y={688} fill={C.lime} style={{ fontFamily: SANS, fontSize: 22 }}>
        @djper5on · Doha
      </text>
      <rect x={290} y={716} width={240} height={54} rx={12} fill={C.lime} />
      <text x={410} y={751} textAnchor="middle" fill={C.black} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22 }}>
        Message
      </text>
      <rect x={546} y={716} width={240} height={54} rx={12} fill="#262626" />
      <text x={666} y={751} textAnchor="middle" fill={C.white} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22 }}>
        Follow
      </text>
      {tiles.map((t, i) => (
        <g key={i}>
          <rect x={272 + (i % 3) * 180} y={800 + Math.floor(i / 3) * 180} width={176} height={176} fill={t} />
          <Mark cx={360 + (i % 3) * 180} cy={888 + Math.floor(i / 3) * 180} size={70} color={t === C.lime || t === C.white ? C.black : t === C.violet ? C.lime : C.white} />
        </g>
      ))}
    </Svg>
  );
};

export const GEAR: { id: string; word: string; Art: React.FC; bg: string }[] = [
  { id: "turntable", word: "Spin", Art: Turntable, bg: C.violet },
  { id: "player", word: "Play", Art: MediaPlayer, bg: C.black },
  { id: "mixer", word: "Mix", Art: Mixer, bg: C.lime },
  { id: "vinyl", word: "Press", Art: Vinyl, bg: C.black },
  { id: "case", word: "Tour", Art: FlightCase, bg: C.violet },
  { id: "monitor", word: "Feel", Art: Monitor, bg: C.lime },
  { id: "headphones", word: "Listen", Art: Headphones, bg: C.violet },
  { id: "profile", word: "Connect", Art: PhoneProfile, bg: C.lime },
];
