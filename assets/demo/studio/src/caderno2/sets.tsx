import React from 'react';
import {
  Actor, Npc, basePose, Pose, FONT, Glow, SkyView, walkPose, clamp, rnd,
} from '../engine';
import { APRESENTADORA, CRIMINOSO, VIAJANTE } from './cast';

/**
 * O CADERNO DA MORTE — the two rooms and the television.
 *
 * Everything is drawn in world coordinates around the vertical frame (1080 x 1920); shots choose the camera with
 * V(cx, cy, z). The metro is built side-on: bench, window band, poles, the door at the right end. The apartment is
 * built around the TV: the screen is the only light source that moves, so the room is lit by it (cool) and by one
 * warm lamp (right), and Lucas sits between the two.
 *
 * Rules from the previous episodes that this file obeys:
 *  - text is drawn in screen space by the shot, never inside a camera group (or it scales with the world);
 *  - a screen inside the set is a clipped group with its own internal coordinates, so its content is authored once;
 *  - no character is ever placed with the hips "on" a table: the table is nearer the camera and is drawn after him.
 */

// ===================================================================================== the metro
export const METRO = {
  benchTop: 1112,
  seatFront: 1190,
  notebook: { x: 775, y: 1006, s: 0.75 },
  lucasX: 430,
  door: { x0: 960, x1: 1250, y0: 300, y1: 1200 },
  floor: 1228,
};

/** The tunnel seen through the window: darkness, girders and lights crossing fast. */
const Tunnel: React.FC<{ t: number; x0: number; x1: number; y0: number; y1: number; seed: number }> = ({ t, x0, x1, y0, y1, seed }) => {
  const w = x1 - x0;
  const h = y1 - y0;
  const lights = Array.from({ length: 7 }).map((_, i) => {
    const speed = 190 + rnd(seed, i) * 260;
    const x = x0 + (((rnd(seed + 1, i) * w - t * speed) % (w + 240)) + w + 240) % (w + 240) - 120;
    return { x, i, y: y0 + h * (0.2 + rnd(seed + 2, i) * 0.55), r: 16 + rnd(seed + 3, i) * 30 };
  });
  return (
    <g>
      <rect x={x0} y={y0} width={w} height={h} fill="#070C10" />
      {Array.from({ length: 9 }).map((_, i) => {
        const gx = x0 + (((rnd(seed + 4, i) * w - t * 110) % (w + 120)) + w + 120) % (w + 120) - 60;
        return <rect key={`g${i}`} x={gx} y={y0} width={16} height={h} fill="#10181E" opacity={0.8} />;
      })}
      {lights.map(({ x, i, y, r }) => (
        <g key={`l${i}`} opacity={0.75}>
          <rect x={x} y={y - 3} width={r * 2.6} height={6} rx={3} fill="#DCEBEA" opacity={0.55} />
          <circle cx={x} cy={y} r={r} fill="#EAF6F2" opacity={0.12} />
        </g>
      ))}
      <rect x={x0} y={y0} width={w} height={h} fill="#081018" opacity={0.35} />
    </g>
  );
};

export const MetroCar: React.FC<{ t: number; door?: number; man?: { x: number; walk: number } | null; notebook?: boolean }> = ({ t, door = 0, man = null, notebook = false }) => {
  const D = METRO.door;
  const slide = 112 * clamp(door);
  return (
    <g>
      <rect x={-900} y={-500} width={3000} height={3000} fill="#12181C" />
      {/* ceiling and its two strip lights */}
      <rect x={-900} y={-500} width={3000} height={700} fill="#1B2328" />
      <path d="M -900 150 L 2100 150 L 2100 210 L -900 210 Z" fill="#0E1418" opacity={0.55} />
      {[34, 96].map((y, i) => (
        <g key={i}>
          <rect x={-700} y={y} width={2600} height={16} rx={8} fill="#DCEBE4" opacity={0.9} />
          <rect x={-700} y={y} width={2600} height={16} rx={8} fill="#FFFFFF" opacity={0.35} />
          <Glow x={540} y={y + 8} r={620} o={0.1} />
        </g>
      ))}
      {/* upper wall, route strip, poster */}
      <rect x={-900} y={200} width={3000} height={420} fill="#26343A" />
      <rect x={-900} y={200} width={3000} height={420} fill="#000" opacity={0.16} />
      <g opacity={0.8}>
        <path d="M -700 492 L 2100 492" stroke="#4E5F63" strokeWidth={7} />
        {Array.from({ length: 13 }).map((_, i) => (
          <g key={i}>
            <circle cx={-650 + i * 200} cy={492} r={i === 4 ? 9 : 6} fill={i === 4 ? '#E8B45C' : '#93A6A6'} />
            <text x={-650 + i * 200} y={522} textAnchor="middle" fontFamily={FONT.ui} fontSize={15} fill="#93A6A6" opacity={0.7}>
              {['—', '—', '—', '—', 'CENTRO', '—', '—', '—', '—', '—', '—', '—', '—'][i]}
            </text>
          </g>
        ))}
      </g>
      <g transform="translate(-420 300) rotate(-1)">
        <rect x={0} y={0} width={230} height={140} rx={5} fill="#3A2F3E" stroke="#171219" strokeWidth={5} />
        <rect x={12} y={12} width={206} height={92} fill="#6C4A5C" />
        <circle cx={116} cy={54} r={26} fill="#E8B45C" opacity={0.8} />
        <path d="M 24 96 L 78 52 L 118 78 L 162 40 L 204 70 L 204 102 L 24 102 Z" fill="#2E2033" />
        <text x={116} y={130} textAnchor="middle" fontFamily={FONT.ui} fontSize={13} fill="#C9B8C6" letterSpacing={3}>CINEMA · 21H</text>
      </g>
      {/* window band */}
      <g>
        <rect x={-900} y={576} width={3000} height={384} fill="#1E2A2E" />
        <Tunnel t={t} x0={-620} x1={1520} y0={606} y1={930} seed={11} />
        {Array.from({ length: 9 }).map((_, i) => (
          <rect key={i} x={-620 + i * 267} y={600} width={11} height={336} fill="#39474C" />
        ))}
        <rect x={-620} y={600} width={2140} height={10} fill="#4A5A5F" />
        <rect x={-620} y={926} width={2140} height={12} fill="#3A474C" />
        <rect x={-620} y={600} width={2140} height={336} fill="#B8E0EA" opacity={0.05} />
      </g>
      {/* grab rail */}
      <path d="M 120 556 L 1520 556" stroke="#9AA8AC" strokeWidth={13} strokeLinecap="round" />
      <path d="M 120 551 L 1520 551" stroke="#E6F0EE" strokeWidth={4} opacity={0.6} strokeLinecap="round" />
      {/* bench: back, cushion, front face — a low metro bench, its top at 1112 */}
      <rect x={-600} y={930} width={1420} height={182} fill="#2B3B3F" />
      <rect x={-600} y={930} width={1420} height={182} fill="#000" opacity={0.18} />
      <path d="M -600 1112 L 820 1112 L 820 1196 L -600 1196 Z" fill="#34575A" />
      {Array.from({ length: 7 }).map((_, i) => (
        <path key={i} d={`M ${-560 + i * 200} 1116 L ${-560 + i * 200} 1188`} stroke="#254448" strokeWidth={5} />
      ))}
      <path d="M -600 1112 L 820 1112" stroke="#4E7476" strokeWidth={15} />
      <path d="M -600 1112 L 820 1112" stroke="#8FB3AE" strokeWidth={4} opacity={0.45} />
      <path d="M -600 1190 L 820 1190 L 820 1228 L -600 1228 Z" fill="#1C2A2E" />
      {/* the abandoned notebook, between the bench and the man who walks away from it */}
      {notebook ? <NotebookClosed x={METRO.notebook.x} y={METRO.notebook.y} s={METRO.notebook.s} rot={-6} /> : null}
      {/* floor and its reflections */}
      <rect x={-900} y={1228} width={3000} height={900} fill="#161D21" />
      <rect x={-900} y={1240} width={3000} height={6} fill="#3E565A" opacity={0.4} />
      {[0, 1].map((i) => (
        <rect key={i} x={-400 + i * 620} y={1250} width={520} height={280} fill="#DCEBE4" opacity={0.035} />
      ))}
      {/* poles */}
      {[170, 880].map((x, i) => (
        <g key={i}>
          <rect x={x - 9} y={150} width={18} height={1080} rx={9} fill="#7E8C92" />
          <rect x={x - 9} y={150} width={6} height={1080} rx={3} fill="#D6E2E2" opacity={0.55} />
          <rect x={x - 13} y={1170} width={26} height={16} rx={6} fill="#5C6A70" />
        </g>
      ))}
      {/* the door at the right end: two panels slide apart; beyond them, the platform */}
      <g>
        <rect x={D.x0 - 34} y={D.y0 - 26} width={D.x1 - D.x0 + 68} height={D.y1 - D.y0 + 30} fill="#3A474C" />
        <rect x={D.x0} y={D.y0} width={D.x1 - D.x0} height={D.y1 - D.y0} fill="#0A1014" />
        {/* platform light and a station pillar, only visible as the doors part */}
        <rect x={D.x0 + 120} y={D.y0 + 220} width={50} height={700} fill="#26343A" />
        <Glow x={D.x0 + 145} y={D.y0 + 210} r={160} o={0.16} />
        {[0, 1].map((sd) => (
          <g key={sd} transform={`translate(${sd === 0 ? -slide : slide} 0)`}>
            <rect x={sd === 0 ? D.x0 : D.x0 + (D.x1 - D.x0) / 2} y={D.y0} width={(D.x1 - D.x0) / 2} height={D.y1 - D.y0} fill="#2E3A3E" stroke="#172125" strokeWidth={5} />
            <rect x={(sd === 0 ? D.x0 : D.x0 + (D.x1 - D.x0) / 2) + 22} y={D.y0 + 74} width={(D.x1 - D.x0) / 2 - 44} height={300} rx={10} fill="#0B1216" />
            <rect x={(sd === 0 ? D.x0 : D.x0 + (D.x1 - D.x0) / 2) + 22} y={D.y0 + 74} width={(D.x1 - D.x0) / 2 - 44} height={300} rx={10} fill="#8FB7C4" opacity={0.05} />
            <rect x={(sd === 0 ? D.x0 : D.x0 + (D.x1 - D.x0) / 2) + 24} y={D.y0 + 430} width={(D.x1 - D.x0) / 2 - 48} height={20} rx={10} fill="#59696E" />
          </g>
        ))}
        <circle cx={(D.x0 + D.x1) / 2} cy={D.y0 - 46} r={13} fill={door > 0.55 ? '#E8B45C' : '#8A2E36'} opacity={0.9} />
      </g>
      {/* the man who left it: a calm walk to the door, a coat that does not hurry */}
      {man ? (
        <Actor
          look={VIAJANTE}
          rimId="rimBlue"
          pose={walkPose(man.x, man.walk, METRO.floor, 1.05, { yaw: 0.86, tilt: 3, headTilt: 1.5, expr: 'cold' }, 1)}
        />
      ) : null}
      <rect x={-900} y={-500} width={3000} height={900} fill="#05080A" opacity={0.08} />
    </g>
  );
};

// ===================================================================================== the apartment
export const AP = {
  tv: { x: 540, y: 1000, w: 450 }, // screen top-left; h = w * 0.5625
  tableTop: 1618,
  notebook: { x: 470, y: 1728, s: 0.78 },
  lucas: { x: 470, y: 1555, scale: 1.15 },
  lamp: { x: 1024, y: 1260 },
  window: { x: 55, y: 330, w: 330, h: 560 },
};

const WallClock: React.FC<{ x: number; y: number; r?: number; hh: number; mm: number; t: number }> = ({ x, y, r = 54, hh, mm, t }) => {
  const ha = ((hh % 12) + mm / 60) * 30;
  const ma = mm * 6;
  const sa = (t * 6) % 360;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r + 8} fill="#0E1016" opacity={0.55} />
      <circle r={r} fill="#E9E2D2" stroke="#1A1B22" strokeWidth={6} />
      {Array.from({ length: 12 }).map((_, i) => (
        <path key={i} transform={`rotate(${i * 30})`} d={`M 0 ${-r + 8} L 0 ${-r + (i % 3 ? 14 : 19)}`} stroke="#3A3440" strokeWidth={i % 3 ? 3 : 5} strokeLinecap="round" />
      ))}
      <path d={`M 0 0 L ${Math.sin((ha * Math.PI) / 180) * r * 0.52} ${-Math.cos((ha * Math.PI) / 180) * r * 0.52}`} stroke="#1A1B22" strokeWidth={8} strokeLinecap="round" />
      <path d={`M 0 0 L ${Math.sin((ma * Math.PI) / 180) * r * 0.76} ${-Math.cos((ma * Math.PI) / 180) * r * 0.76}`} stroke="#1A1B22" strokeWidth={6} strokeLinecap="round" />
      <path d={`M 0 8 L ${Math.sin((sa * Math.PI) / 180) * r * 0.82} ${-Math.cos((sa * Math.PI) / 180) * r * 0.82}`} stroke="#B4433E" strokeWidth={2.6} strokeLinecap="round" />
      <circle r={6} fill="#1A1B22" />
    </g>
  );
};

export const ApartmentBack: React.FC<{ t: number; tvOn?: number; clock?: [number, number] }> = ({ t, tvOn = 0, clock = [21, 7] }) => (
  <g>
    <rect x={-900} y={-600} width={3000} height={3200} fill="#0E0D16" />
    <rect x={-900} y={-600} width={3000} height={2050} fill="#1B1C28" />
    <rect x={-900} y={-600} width={3000} height={2050} fill="#000" opacity={0.08} />
    {/* floor */}
    <rect x={-900} y={1450} width={3000} height={1200} fill="#14121C" />
    <path d="M -900 1450 L 2100 1450" stroke="#2A2638" strokeWidth={7} />
    {Array.from({ length: 8 }).map((_, i) => (
      <path key={i} d={`M ${-800 + i * 380} 1450 L ${-1400 + i * 620} 2400`} stroke="#1C1926" strokeWidth={2} opacity={0.55} />
    ))}
    {/* window onto the night city, left */}
    <g>
      <rect x={AP.window.x - 18} y={AP.window.y - 18} width={AP.window.w + 36} height={AP.window.h + 36} fill="#242432" />
      <SkyView id="cadWin" clip={`M ${AP.window.x} ${AP.window.y} h ${AP.window.w} v ${AP.window.h} h ${-AP.window.w} Z`}
               box={{ x: AP.window.x, y: AP.window.y, w: AP.window.w, h: AP.window.h }} t={t}
               sun={{ x: AP.window.x + AP.window.w * 0.68, y: AP.window.y + AP.window.h * 0.28 }} sunR={24} night />
      <path d={`M ${AP.window.x} ${AP.window.y + AP.window.h / 2} H ${AP.window.x + AP.window.w} M ${AP.window.x + AP.window.w / 2} ${AP.window.y} V ${AP.window.y + AP.window.h}`} stroke="#242432" strokeWidth={10} />
      <rect x={AP.window.x - 14} y={AP.window.y + AP.window.h + 12} width={AP.window.w + 28} height={16} rx={4} fill="#2E2E3C" />
      {/* curtains */}
      <path d={`M ${AP.window.x - 52} ${AP.window.y - 40} Q ${AP.window.x - 4} ${AP.window.y + 180} ${AP.window.x - 26} ${AP.window.y + AP.window.h + 40} L ${AP.window.x - 74} ${AP.window.y + AP.window.h + 40} L ${AP.window.x - 74} ${AP.window.y - 40} Z`} fill="#3A2530" />
      <path d={`M ${AP.window.x + AP.window.w + 52} ${AP.window.y - 40} Q ${AP.window.x + AP.window.w + 4} ${AP.window.y + 180} ${AP.window.x + AP.window.w + 26} ${AP.window.y + AP.window.h + 40} L ${AP.window.x + AP.window.w + 74} ${AP.window.y + AP.window.h + 40} L ${AP.window.x + AP.window.w + 74} ${AP.window.y - 40} Z`} fill="#3A2530" />
      <path d={`M ${AP.window.x - 48} ${AP.window.y - 30} L ${AP.window.x - 64} ${AP.window.y + 40}`} stroke="#51323F" strokeWidth={4} opacity={0.7} />
    </g>
    {/* TV console and the set */}
    <g>
      <rect x={500} y={1256} width={530} height={26} rx={6} fill="#2A2432" />
      <rect x={520} y={1282} width={490} height={92} rx={8} fill="#211D2A" />
      <rect x={520} y={1282} width={490} height={10} fill="#332C3E" />
      <rect x={548} y={1374} width={22} height={66} fill="#191622" />
      <rect x={960} y={1374} width={22} height={66} fill="#191622" />
      <rect x={590} y={1254} width={350} height={6} rx={3} fill="#3A3444" />
      <circle cx={965} cy={1246} r={6} fill={tvOn > 0.2 ? '#E8B45C' : '#3A3444'} />
    </g>
    {/* wall clock */}
    <WallClock x={930} y={900} r={46} hh={clock[0]} mm={clock[1]} t={t} />
    {/* a framed poster, right */}
    <g transform="translate(1080 690) rotate(0.6)">
      <rect x={-95} y={-135} width={190} height={270} fill="#23202E" stroke="#0F0D16" strokeWidth={6} />
      <rect x={-77} y={-117} width={154} height={200} fill="#2C3A48" />
      <circle cx={0} cy={-40} r={40} fill="#E8B45C" opacity={0.55} />
      <path d="M -77 60 L -20 6 L 20 36 L 77 -16 L 77 83 L -77 83 Z" fill="#17222C" />
      <text x={0} y={118} textAnchor="middle" fontFamily={FONT.ui} fontSize={14} fill="#8C8298" letterSpacing={3}>CINEMA</text>
    </g>
    {/* lamp: the one warm source */}
    <g>
      <rect x={AP.lamp.x - 6} y={AP.lamp.y + 90} width={12} height={280} fill="#2A2430" />
      <ellipse cx={AP.lamp.x} cy={AP.lamp.y + 372} rx={74} ry={16} fill="#1C1824" />
      <path d={`M ${AP.lamp.x - 82} ${AP.lamp.y + 96} L ${AP.lamp.x + 82} ${AP.lamp.y + 96} L ${AP.lamp.x + 54} ${AP.lamp.y - 20} L ${AP.lamp.x - 54} ${AP.lamp.y - 20} Z`} fill="#D8A25C" />
      <path d={`M ${AP.lamp.x - 78} ${AP.lamp.y + 92} L ${AP.lamp.x + 78} ${AP.lamp.y + 92} L ${AP.lamp.x + 50} ${AP.lamp.y - 14} L ${AP.lamp.x - 50} ${AP.lamp.y - 14} Z`} fill="#F3CE94" opacity={0.85} />
      <Glow x={AP.lamp.x} y={AP.lamp.y + 120} r={520} o={0.22} />
      <path d={`M ${AP.lamp.x - 60} ${AP.lamp.y + 100} L ${AP.lamp.x - 260} 1650 L ${AP.lamp.x + 260} 1650 L ${AP.lamp.x + 60} ${AP.lamp.y + 100} Z`} fill="url(#g3cone)" opacity={0.14} />
    </g>
    {tvOn > 0 ? <Glow x={AP.tv.x + AP.tv.w / 2} y={AP.tv.y + 130} r={720} kind="cool" o={0.16 * tvOn} /> : null}
  </g>
);

/**
 * The table nearer the camera than Lucas: drawn after him, so it covers his lap and his hidden forearms. Its far edge
 * crosses him at 1618 (below the chest, above the hip), which is where a table in front of a seated person reads.
 */
export const ApartmentTable: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <ellipse cx={470} cy={1970} rx={540} ry={84} fill="#000" opacity={0.35} />
    <path d="M 120 1618 L 820 1618 L 930 1842 Q 470 1892 10 1842 Z" fill="#2C2028" stroke="#120C10" strokeWidth={6} />
    <path d="M 120 1618 L 820 1618" stroke="#5A4038" strokeWidth={13} />
    <path d="M 150 1642 L 790 1642" stroke="#7A5A48" strokeWidth={2} opacity={0.45} />
    <path d="M 30 1812 Q 470 1862 910 1812 L 924 1842 Q 470 1892 16 1842 Z" fill="#211820" />
    <rect x={150} y={1860} width={30} height={230} fill="#1C1418" />
    <rect x={790} y={1860} width={30} height={230} fill="#1C1418" />
    {/* the mug and the papers that were already there */}
    <g transform="translate(806 1602)">
      <ellipse cx={0} cy={4} rx={36} ry={9} fill="#000" opacity={0.3} />
      <rect x={-28} y={-50} width={56} height={54} rx={8} fill="#E9E2D2" />
      <path d="M 26 -38 q 22 2 18 18 q -4 12 -18 10" stroke="#E9E2D2" strokeWidth={7} fill="none" />
      <ellipse cx={0} cy={-50} rx={24} ry={5} fill="#4A2E22" />
      <path d={`M -8 -58 q ${Math.sin(t / 14) * 5} -16 0 -28`} stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.18} strokeLinecap="round" />
    </g>
    <g transform="translate(216 1596) rotate(-3)">
      <rect x={-80} y={-54} width={160} height={108} fill="#E6DCC6" opacity={0.9} />
      {Array.from({ length: 4 }).map((_, i) => (
        <path key={i} d={`M -60 ${-32 + i * 20} L ${40 + (i % 2) * 20} ${-32 + i * 20}`} stroke="#9A907E" strokeWidth={3} opacity={0.5} />
      ))}
    </g>
  </g>
);

/** Lucas's chair back, in front of the table? Kept out: the table reads best alone. */
export const Chair: React.FC = () => (
  <g opacity={0.9}>
    <rect x={380} y={1760} width={170} height={26} rx={8} fill="#241A20" />
    <rect x={398} y={1786} width={18} height={150} fill="#1A1218" />
    <rect x={514} y={1786} width={18} height={150} fill="#1A1218" />
  </g>
);

// ===================================================================================== the television
export type TvKind = 'off' | 'studio' | 'photo' | 'live' | 'after';

/**
 * The screen, authored in a 450 x 253 box and scaled into the set. The content is clipped to the glass; scanlines and
 * a moving band sit above it, so it always reads as a transmission and never as a drawing of a room.
 */
export const TvScreen: React.FC<{ t: number; f: number; x: number; y: number; w: number; kind: TvKind; power?: number; anchorTalk?: number; criminal?: number; content?: React.ReactNode }> = ({
  t, f, x, y, w, kind, power = 1, anchorTalk = 0, criminal = 0, content,
}) => {
  const SW = 450, SH = 253;
  const h = w * (SH / SW);
  const k = w / SW;
  const p = clamp(power);
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      {/* bezel */}
      <rect x={-13} y={-13} width={SW + 26} height={SH + 26} rx={9} fill="#0A0A10" stroke="#2A2A36" strokeWidth={3} />
      <rect x={-13} y={SH + 8} width={SW + 26} height={5} rx={2} fill="#1A1A24" />
      <circle cx={SW / 2} cy={SH + 15} r={2.2} fill={p > 0.1 ? '#E8B45C' : '#333'} />
      <clipPath id="cadTvClip">
        <rect x={0} y={0} width={SW} height={SH} rx={3} />
      </clipPath>
      <g clipPath="url(#cadTvClip)">
        <rect width={SW} height={SH} fill="#05060A" />
        <g opacity={p}>
          {content}
          {!content && kind === 'studio' ? <NewsStudio t={t} f={f} talk={anchorTalk} /> : null}
          {!content && kind === 'photo' ? <Mugshot t={t} /> : null}
          {!content && kind === 'live' ? <Standoff t={t} f={f} criminal={criminal} /> : null}
          {!content && kind === 'after' ? <Aftermath t={t} /> : null}
        </g>
        {/* transmission: scanlines and a travelling bright band */}
        <rect width={SW} height={SH} fill="url(#cadTvScan)" opacity={0.35} />
        <rect x={0} y={((t * 0.9) % (SH + 60)) - 60} width={SW} height={28} fill="#DCEBFF" opacity={0.05} />
        <path d={`M -20 ${SH} L ${SW * 0.5} ${SH * 0.42} L ${SW * 0.62} ${SH * 0.42} L -20 ${SH}`} fill="#FFFFFF" opacity={0.025} />
      </g>
      <rect x={-13} y={-13} width={SW + 26} height={SH + 26} rx={9} fill="none" stroke="#000" strokeWidth={2} opacity={0.6} />
      <defs>
        <pattern id="cadTvScan" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="1.4" fill="#000" opacity="0.35" />
        </pattern>
      </defs>
    </g>
  );
};

const Bug: React.FC<{ x?: number; y?: number; live?: boolean; right?: string }> = ({ x = 10, y = 10, live = true, right = '21:07' }) => (
  <g>
    {live ? (
      <g>
        <rect x={x} y={y} width={13} height={13} rx={2} fill="#C0303C" />
        <circle cx={x + 6.5} cy={y + 6.5} r={3.4} fill="#E9E2D2" />
        <text x={x + 20} y={y + 11} fontFamily={FONT.ui} fontSize={11} fill="#E9E2D2" letterSpacing={1}>AO VIVO</text>
      </g>
    ) : null}
    <text x={440} y={y + 11} textAnchor="end" fontFamily={FONT.ui} fontSize={10} fill="#E9E2D2" opacity={0.85}>{right}</text>
  </g>
);

const LowerThird: React.FC<{ line1: string; line2: string; red?: boolean }> = ({ line1, line2, red = true }) => (
  <g>
    <rect x={0} y={196} width={450} height={29} fill={red ? '#B22633' : '#20283A'} />
    <rect x={0} y={225} width={450} height={28} fill="#E9E2D2" />
    <text x={12} y={217} fontFamily={FONT.ui} fontSize={16} fill="#F6EFE3" letterSpacing={1}>{line1}</text>
    <text x={12} y={245} fontFamily={FONT.ui} fontSize={13} fill="#20283A" letterSpacing={1}>{line2}</text>
  </g>
);

/** The live studio: the anchor behind the desk, the channel's blue wall, one red column. */
const NewsStudio: React.FC<{ t: number; f: number; talk: number }> = ({ t, f, talk }) => {
  const pose: Pose = {
    ...basePose, x: 292, y: 250, scale: 0.54, yaw: -0.05, tilt: 0, headTilt: 1.5,
    expr: 'determined', talk, blink: f > 0 && Math.floor(f / 26) % 7 === 0 ? 1 : 0,
    armL: { a: 34, b: -88 }, armR: { a: 36, b: -92 },
  };
  return (
    <g>
      <rect width={450} height={253} fill="#16233A" />
      <rect width={450} height={253} fill="url(#cadNewsBg)" />
      <defs>
        <linearGradient id="cadNewsBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1C3152" />
          <stop offset="60%" stopColor="#15243C" />
          <stop offset="100%" stopColor="#2A1622" />
        </linearGradient>
      </defs>
      {/* the map wall: a few city lines and dots */}
      <g opacity={0.35} stroke="#6E8FB8" strokeWidth={1.2} fill="none">
        <path d="M 20 40 L 110 70 L 150 40 L 240 60 L 300 30" />
        <path d="M 30 120 L 120 100 L 200 130 L 290 100 L 420 120" />
        <path d="M 60 170 L 160 150 L 250 176" />
        {[[110, 70], [240, 60], [200, 130], [420, 120], [60, 170]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={3} fill="#A9C6FF" />)}
      </g>
      <rect x={392} y={0} width={58} height={253} fill="#7A1826" opacity={0.55} />
      <rect x={0} y={0} width={450} height={40} fill="#0A101C" opacity={0.5} />
      <Bug />
      <text x={430} y={24} textAnchor="end" fontFamily={FONT.ui} fontSize={10} fill="#A9C6FF" letterSpacing={2}>CANAL 7</text>
      <Actor look={APRESENTADORA} pose={pose} rimId="rimBlue" shadow={0} />
      {/* desk, drawn after her: it covers her lap and hands */}
      <path d="M 120 232 Q 292 214 452 236 L 452 253 L 100 253 Z" fill="#101A2A" />
      <path d="M 120 232 Q 292 214 452 236" stroke="#4A6A9E" strokeWidth={4} fill="none" />
      <rect x={150} y={232} width={120} height={9} rx={4} fill="#C0303C" opacity={0.8} />
      <text x={292} y={250} textAnchor="middle" fontFamily={FONT.ui} fontSize={11} fill="#8FA6BC" letterSpacing={4}>PLANTÃO</text>
      <LowerThird line1="PLANTÃO · O CASO KIRA" line2="MORTES EM SÉRIE · AUTORIDADES INVESTIGAM" />
    </g>
  );
};

/** The photo the audience must remember: the face Lucas is about to write a name under. */
const Mugshot: React.FC<{ t: number }> = ({ t }) => {
  const pose: Pose = {
    ...basePose, x: 225, y: 300, scale: 0.98, yaw: 0, tilt: 0, headTilt: -1, look: 0.05,
    expr: 'cold', blink: 0, armL: { a: 9, b: -8 }, armR: { a: 10, b: -10 },
  };
  return (
    <g>
      <rect width={450} height={253} fill="#2A3346" />
      <rect width={450} height={253} fill="url(#cadMugBg)" />
      <defs>
        <radialGradient id="cadMugBg" cx="35%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#6E82A6" stopOpacity={0.6} />
          <stop offset="100%" stopColor="#17202E" stopOpacity={0.2} />
        </radialGradient>
      </defs>
      {Array.from({ length: 5 }).map((_, i) => (
        <path key={i} d={`M 0 ${40 + i * 38} L 450 ${40 + i * 38}`} stroke="#8FA6BC" strokeWidth={1} opacity={0.15} />
      ))}
      <text x={14} y={22} fontFamily={FONT.ui} fontSize={10} fill="#C9D4E0" letterSpacing={2} opacity={0.8}>POLÍCIA CIVIL · DIVULGAÇÃO</text>
      <Actor look={CRIMINOSO} pose={pose} rimId="rimBlue" shadow={0} />
      <rect x={0} y={0} width={450} height={253} fill="#0A101C" opacity={0.08} />
      <LowerThird line1="RAFAEL MOURA" line2="34 ANOS · SUSPEITO DE SEQUESTRO" />
      <text x={438} y={190} textAnchor="end" fontFamily={FONT.ui} fontSize={10} fill="#F6EFE3" opacity={0.8}>FOTO: DIVULGAÇÃO</text>
      <rect x={0} y={((t * 2.2) % 300) - 30} width={450} height={20} fill="#DCEBFF" opacity={0.035} />
    </g>
  );
};

/**
 * The live standoff. `stage` runs 0..1: 0 the shout, ~0.1 the hand to the chest, from 0.35 the collapse. The hand
 * reaches the chest before the knees go, so the audience reads the cause before the fall.
 */
const Standoff: React.FC<{ t: number; f: number; criminal: number }> = ({ t, f, criminal }) => {
  const c = clamp(criminal);
  const pain = clamp(c / 0.14);
  const fall = clamp((c - 0.35) / 0.65);
  const pose: Pose = {
    ...basePose,
    x: 300 - 40 * fall,
    y: 250 + 108 * fall,
    scale: 0.8,
    facing: -1,
    yaw: -0.55,
    tilt: -6 * fall,
    spin: 78 * fall,
    headTilt: -2 - 14 * fall,
    expr: pain > 0.35 ? 'panic' : 'determined',
    blink: fall > 0.3 ? 0.2 : 0,
    armL: { a: 40 + 60 * fall, b: -40 },
    armR: { a: 12 + 28 * pain, b: -10 - 110 * pain },
    armFront: pain,
    handR: 'open',
  };
  return (
    <g>
      <rect width={450} height={253} fill="#101318" />
      <rect width={450} height={253} fill="url(#cadLiveBg)" />
      <defs>
        <linearGradient id="cadLiveBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1C2630" />
          <stop offset="100%" stopColor="#0A0C10" />
        </linearGradient>
      </defs>
      {/* the room: girders, a high window, the police lights outside */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={20 + i * 120} y={0} width={14} height={253} fill="#1E242C" />
      ))}
      <rect x={38} y={24} width={124} height={74} fill="#05080C" stroke="#2A3038" strokeWidth={4} />
      <rect x={42} y={28} width={116} height={66} fill="#0A1420" />
      <rect x={42} y={28} width={116} height={66} fill={Math.sin(t / 5) > 0 ? '#2A4AFF' : '#FF2A3A'} opacity={0.16} />
      <rect x={42} y={28} width={116} height={66} fill="#FF2A3A" opacity={0.06} />
      <rect x={97} y={28} width={5} height={66} fill="#080C12" />
      <rect x={42} y={58} width={116} height={5} fill="#080C12" />
      <path d="M 0 210 L 450 190" stroke="#3A3A2A" strokeWidth={16} opacity={0.9} />
      {Array.from({ length: 9 }).map((_, i) => (
        <path key={i} d={`M ${-10 + i * 58} 208 L ${16 + i * 58} 190`} stroke="#E8B45C" strokeWidth={6} opacity={0.55} />
      ))}
      {/* hostages: two silhouettes with their hands up, behind him */}
      <Npc t={t} place={{ id: 'lia', x: 92, y: 258, scale: 0.5, facing: 1, expr: 'worried', motion: 0.3, armL: { a: 162, b: -12 }, armR: { a: 168, b: -8 }, look: 0.4 }} />
      <Npc t={t} place={{ id: 'beto', x: 148, y: 266, scale: 0.44, facing: 1, expr: 'worried', motion: 0.25, armL: { a: 158, b: -16 }, armR: { a: 164, b: -10 }, look: 0.3 }} />
      <Actor look={CRIMINOSO} pose={pose} rimId="rimRed" shadow={0.2} />
      {/* the gun: a short dark shape in his near hand, pointed down and away */}
      {c < 0.5 ? (
        <g transform={`translate(${300 - 40 * fall - 6} ${250 + 108 * fall - 66}) rotate(${-18 + 20 * fall})`}>
          <rect x={-5} y={-4} width={34} height={9} rx={2} fill="#14161A" stroke="#000" strokeWidth={1.5} />
          <rect x={5} y={3} width={9} height={15} rx={3} fill="#14161A" stroke="#000" strokeWidth={1.5} />
        </g>
      ) : null}
      <rect width={450} height={253} fill="#0A101C" opacity={0.1} />
      <rect x={((t * 1.7) % 470) - 20} y={0} width={16} height={253} fill="#FFFFFF" opacity={0.04} />
      <Bug />
      <LowerThird line1="AO VIVO · REFÉNS NO CENTRO" line2="RUA SETE · POLÍCIA CERCA O QUARTEIRÃO" />
      {c > 0.55 ? <rect width={450} height={253} fill="#E9E2D2" opacity={0.06} /> : null}
    </g>
  );
};

/** Minutes later, outside: tape, guards, an ambulance and a covered stretcher far off. */
const Aftermath: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect width={450} height={253} fill="#0B0E14" />
    <rect width={450} height={253} fill="url(#cadAfterBg)" />
    <defs>
      <linearGradient id="cadAfterBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1A2030" />
        <stop offset="70%" stopColor="#10141C" />
        <stop offset="100%" stopColor="#080A0E" />
      </linearGradient>
    </defs>
    {/* buildings and a wet street */}
    <rect x={0} y={0} width={450} height={150} fill="#121826" />
    {[20, 90, 150, 250, 330, 400].map((x, i) => (
      <g key={i}>
        <rect x={x} y={20 + (i % 3) * 10} width={48} height={130} fill="#0C111C" />
        {[0, 1, 2].map((k) => <rect key={k} x={x + 8 + k * 12} y={38 + (i % 3) * 10 + k * 26} width={7} height={10} fill="#E8B45C" opacity={0.25 + 0.2 * ((i + k) % 2)} />)}
      </g>
    ))}
    <rect x={0} y={150} width={450} height={103} fill="#0A0D12" />
    <rect x={0} y={150} width={450} height={103} fill="#6E8FB8" opacity={0.06} />
    {/* ambulance at the right: white box, red stripe, flashing bar */}
    <g transform="translate(320 190)">
      <rect x={-70} y={-40} width={140} height={62} rx={6} fill="#D9DCE2" />
      <rect x={-70} y={-40} width={140} height={10} fill="#B8BEC8" />
      <rect x={-70} y={-6} width={140} height={8} fill="#C0303C" />
      <rect x={-44} y={-30} width={40} height={20} rx={3} fill="#1A2230" />
      <rect x={-16} y={-46} width={32} height={8} rx={3} fill={Math.sin(t / 4) > 0 ? '#FF2A3A' : '#2A4AFF'} />
      <circle cx={-42} cy={24} r={9} fill="#14161A" />
      <circle cx={42} cy={24} r={9} fill="#14161A" />
      <Glow x={0} y={-42} r={70} kind="red" o={0.25} />
    </g>
    {/* the cordon */}
    <path d="M -10 178 L 460 206" stroke="#E8B45C" strokeWidth={10} />
    {Array.from({ length: 12 }).map((_, i) => (
      <path key={i} d={`M ${-6 + i * 40} 178 L ${10 + i * 40} 180`} stroke="#14161A" strokeWidth={9} />
    ))}
    <Npc t={t} place={{ id: 'guard', x: 110, y: 250, scale: 0.62, facing: -1, expr: 'neutral', motion: 0.5, look: 0.2 }} />
    <Npc t={t} place={{ id: 'beto', x: 250, y: 258, scale: 0.58, facing: -1, expr: 'neutral', motion: 0.4, look: -0.2 }} />
    {/* far off, under a sheet: the reason everyone is here — suggested, never shown */}
    <g transform="translate(60 226)" opacity={0.85}>
      <ellipse cx={0} cy={16} rx={58} ry={10} fill="#000" opacity={0.5} />
      <path d="M -54 14 Q -54 -10 0 -12 Q 54 -10 54 14 Z" fill="#22262E" />
      <path d="M -54 14 Q 0 24 54 14" stroke="#3A404A" strokeWidth={3} fill="none" />
    </g>
    <Bug right="21:08" />
    <LowerThird line1="PLANTÃO · SUSPEITO MORTO" line2="PARADA CARDÍACA · EQUIPE MÉDICA CONFIRMOU" />
    <rect x={((t * 2.4) % 480) - 30} y={0} width={20} height={253} fill="#FFFFFF" opacity={0.03} />
  </g>
);

// ===================================================================================== the notebook
/** The closed notebook: matte black, a red ribbon, a white page block. No logo, no skull, no borrowed cover. */
export const NotebookClosed: React.FC<{ x: number; y: number; s?: number; rot?: number; glow?: number }> = ({ x, y, s = 1, rot = 0, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={10} cy={18} rx={116} ry={22} fill="#000" opacity={0.45} />
    {glow > 0 ? <Glow x={0} y={-130} r={300} o={0.12 * glow} /> : null}
    <rect x={-108} y={-140} width={216} height={286} rx={10} fill="#0C0C10" stroke="#000" strokeWidth={4} />
    <rect x={-108} y={-140} width={216} height={286} rx={10} fill="#1A1A20" opacity={0.55} />
    <rect x={-98} y={-132} width={196} height={266} rx={7} fill="#101014" />
    <rect x={-108} y={-140} width={26} height={286} rx={8} fill="#08080C" />
    <path d="M 74 -140 L 108 -140 L 108 146 L 74 146 Z" fill="#E8DFC9" />
    <path d="M 74 -140 L 82 -140 L 82 146 L 74 146 Z" fill="#C9BFA8" />
    <path d="M -80 -140 L 96 -140" stroke="#2E2E38" strokeWidth={4} />
    <path d="M -30 -108 Q 40 -170 96 -108" stroke="#8A2E36" strokeWidth={9} fill="none" opacity={0.9} />
    <path d="M 96 -112 L 104 -84 L 92 -88 Z" fill="#8A2E36" />
    <path d="M -84 -120 Q 10 -104 90 -132" stroke="#FFFFFF" strokeWidth={5} opacity={0.035} fill="none" />
    <rect x={-84} y={92} width={140} height={2.5} fill="#3A3A46" opacity={0.8} />
    <rect x={-84} y={102} width={96} height={2.5} fill="#3A3A46" opacity={0.55} />
  </g>
);

const HandLine: React.FC<{ text: string; x?: number; y: number; size?: number; rot?: number; anchor?: 'start' | 'middle'; color?: string }> = ({
  text, x = 0, y, size = 17, rot = 0, anchor = 'middle', color = '#232B3A',
}) => (
  <text x={x} y={y} transform={`rotate(${rot} ${x} ${y})`} textAnchor={anchor} fontFamily={FONT.hand} fontWeight={700} fontSize={size} fill={color}>
    {text}
  </text>
);

export type NotebookPage = 'rule' | 'rules' | 'rule2' | 'name' | 'blank';

/** The open notebook, authored on a 460 x 300 spread. `reveal`/`reveal2` mask each written line left-to-right (0..1). */
export const NotebookOpen: React.FC<{ x: number; y: number; s?: number; rot?: number; page: NotebookPage; reveal?: number; reveal2?: number }> = ({
  x, y, s = 1, rot = 0, page, reveal = 1, reveal2 = 1,
}) => {
  const W = 460, H = 300;
  const maskId = `cadWrite${Math.round(reveal * 1000)}_${Math.round(reveal2 * 1000)}`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse cx={10} cy={H / 2 + 26} rx={250} ry={26} fill="#000" opacity={0.45} />
      <rect x={-W / 2 - 10} y={-H / 2 - 10} width={W + 20} height={H + 20} rx={8} fill="#0C0C10" />
      {/* page block edges */}
      <rect x={-W / 2 - 6} y={-H / 2 - 4} width={W + 12} height={H + 8} rx={4} fill="#D8CDB6" />
      <rect x={-W / 2} y={-H / 2} width={W} height={H} fill="#EFE6D2" />
      <rect x={-W / 2} y={-H / 2} width={W / 2 - 3} height={H} fill="#F4ECD9" />
      <rect x={3} y={-H / 2} width={W / 2 - 3} height={H} fill="#EBE1CC" />
      <path d={`M 0 ${-H / 2} L 0 ${H / 2}`} stroke="#B9AC92" strokeWidth={4} />
      <path d={`M -4 ${-H / 2 + 10} Q -14 ${0} -4 ${H / 2 - 10}`} stroke="#000" strokeWidth={9} opacity={0.12} fill="none" />
      {page === 'rule' ? (
        <g>
          <HandLine text="A pessoa cujo nome" y={-34} size={27} />
          <HandLine text="for escrito neste" y={8} size={27} rot={-0.6} />
          <HandLine text="caderno morrerá." y={50} size={27} rot={0.4} />
          <HandLine text="—" y={96} size={22} color="#8A2E36" />
        </g>
      ) : null}
      {page === 'rules' ? (
        <g>
          {/* rule one on the left page, rule two on the right: a line never crosses the fold */}
          <HandLine text="1. Para funcionar, é preciso" x={-115} y={-60} size={16} rot={-0.4} />
          <HandLine text="saber o nome e conhecer" x={-115} y={-32} size={16} rot={0.3} />
          <HandLine text="o rosto da pessoa." x={-115} y={-5} size={16} rot={-0.3} />
          <HandLine text="2. Sem causa especificada," x={115} y={36} size={16} rot={0.2} />
          <HandLine text="a morte ocorre por ataque" x={115} y={63} size={16} rot={-0.4} />
          <HandLine text="cardíaco em 40 segundos." x={115} y={90} size={16} rot={0.3} />
        </g>
      ) : null}
      {page === 'rule2' ? (
        <g>
          <HandLine text="Sem uma causa" y={-30} size={30} />
          <HandLine text="especificada, a morte" y={12} size={30} rot={-0.6} />
          <HandLine text="ocorrerá por ataque" y={54} size={30} rot={0.3} />
          <HandLine text="cardíaco em 40 segundos." y={100} size={27} rot={-0.4} color="#8A2E36" />
        </g>
      ) : null}
      {page === 'name' ? (
        <g>
          <defs>
            <mask id={`${maskId}a`} maskUnits="userSpaceOnUse" x={-W / 2} y={-H / 2} width={W} height={H}>
              <rect x={20} y={-H / 2} width={190 * clamp(reveal)} height={H} fill="#fff" />
            </mask>
            <mask id={`${maskId}b`} maskUnits="userSpaceOnUse" x={-W / 2} y={-H / 2} width={W} height={H}>
              <rect x={20} y={-H / 2} width={190 * clamp(reveal2)} height={H} fill="#fff" />
            </mask>
          </defs>
          {/* the name goes on the right-hand page, the page a right hand actually writes on */}
          <g mask={`url(#${maskId}a)`}>
            <HandLine text="RAFAEL" x={115} y={-18} size={46} rot={-1.2} />
          </g>
          <g mask={`url(#${maskId}b)`}>
            <HandLine text="MOURA" x={115} y={42} size={46} rot={0.8} />
          </g>
          <HandLine text="—" x={115} y={90} size={20} color="#8A2E36" />
        </g>
      ) : null}
      <rect x={-W / 2} y={-H / 2} width={W} height={H} fill="#000" opacity={0.04} />
      <path d={`M -W / 2 ${-H / 2 + 20} L ${W / 2} ${-H / 2 + 8}`} stroke="#FFFFFF" strokeWidth={10} opacity={0.05} />
    </g>
  );
};

/** A black ballpoint, nib at (0,0), lying at `rot` degrees. */
export const Pen: React.FC<{ x: number; y: number; rot?: number; s?: number }> = ({ x, y, rot = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={44} cy={7} rx={62} ry={7} fill="#000" opacity={0.25} />
    <path d="M 0 0 L 18 -7 L 20 7 Z" fill="#B9BEC8" stroke="#15161A" strokeWidth={2} />
    <rect x={18} y={-7} width={24} height={14} fill="#D8DCE2" stroke="#15161A" strokeWidth={2} />
    <rect x={42} y={-9} width={92} height={18} rx={6} fill="#15161A" stroke="#000" strokeWidth={2} />
    <rect x={54} y={-4} width={44} height={4} rx={2} fill="#3A3E48" />
    <rect x={112} y={-8} width={28} height={16} rx={5} fill="#B8BEC8" stroke="#15161A" strokeWidth={2} />
    <path d="M 140 -5 L 158 0 L 140 5 Z" fill="#15161A" />
  </g>
);
