import React from 'react';
import { clamp, lerp, rnd } from '../anim';
import { makeRoom, Room } from '../room';
import { RoomShell, Pendant, pendantLight, WallLight, stand } from '../furnish';
import { Glow, Cone, Dust } from '../light';
import { FONT } from '../fonts';
import { FRAME } from '../anim';
import { Npc } from '../npc';

// The casino: a red-and-gold room in one-point perspective, chandeliers over the felt, a bar in the back left, and the
// roulette table in the foreground. The wheel is drawn from the same numbers in both views (top-down for inserts, the
// squashed one on the table), so the ball can be followed across a cut.

export const GS = {
  gold: '#E7B45C',
  goldD: '#A87B34',
  goldL: '#FFD894',
  felt: '#1C5C46',
  feltD: '#123F31',
  feltL: '#2A7458',
  wood: '#4A2B25',
  woodD: '#2E1A18',
  woodL: '#6B4034',
  wall: '#43101F',
  wall2: '#58182A',
  carpet: '#2A1020',
  ink: '#120A12',
  cream: '#F6E9CF',
  red: '#C4303A',
  black: '#191219',
  chipRed: '#C9402F',
  chipBlue: '#2C5D8A',
  chipGold: '#C99A3E',
  neon: '#FF4E6B',
};

export const CASINO = makeRoom({ x: 960, y: 545 }, { x0: 360, x1: 1560, y0: 290, y1: 770 }, 3.2);
export const casinoStand = (u: number, w: number, k = 0.62) => stand(CASINO, u, w, k);

const ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const rad = (d: number) => (d * Math.PI) / 180;
const P = (r: number, a: number) => `${(r * Math.cos(rad(a))).toFixed(2)} ${(r * Math.sin(rad(a))).toFixed(2)}`;
const wedge = (r0: number, r1: number, a0: number, a1: number) =>
  `M ${P(r1, a0)} A ${r1} ${r1} 0 0 1 ${P(r1, a1)} L ${P(r0, a1)} A ${r0} ${r0} 0 0 0 ${P(r0, a0)} Z`;

// ---------------------------------------------------------------- the room
/** The room behind the table: gold panels, the sign, the bar, chandeliers, a haze and a few patrons in silhouette. */
export const Casino: React.FC<{ t: number; id?: string; sign?: number; patrons?: number; veil?: number }> = ({ t, id = 'cas', sign = 1, patrons = 1, veil = 0.5 }) => {
  const B = CASINO.back;
  const lights = [pendantLight(CASINO, 0.3, 0.5), pendantLight(CASINO, 0.5, 0.5), pendantLight(CASINO, 0.7, 0.5)];
  return (
    <g>
      <RoomShell r={CASINO} id={id} floor="tiles" wall={GS.wall} side={GS.wall2} floorC={GS.carpet} ceiling="#1A0A14" lines="#170812" />
      {/* gold panel mouldings on the back wall */}
      {[
        [410, 320, 300, 300],
        [1360, 320, 300, 300],
        [410, 640, 300, 100],
        [1360, 640, 300, 100],
      ].map(([x, y, w, h], i) => (
        <g key={`pm${i}`}>
          <rect x={x} y={y} width={w} height={h} fill="none" stroke={GS.goldD} strokeWidth={4} opacity={0.65} />
          <rect x={x + 10} y={y + 10} width={w - 20} height={h - 20} fill="none" stroke={GS.goldD} strokeWidth={2} opacity={0.45} />
        </g>
      ))}
      {/* the sign */}
      <g opacity={sign}>
        <rect x={700} y={330} width={520} height={150} rx={18} fill="#1E0810" stroke={GS.goldD} strokeWidth={5} />
        <text x={960} y={438} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={92} fill={GS.goldL} letterSpacing={10}>
          CASSINO
        </text>
        <rect x={726} y={452} width={468} height={7} rx={4} fill={GS.neon} opacity={0.85} />
        <circle cx={960} cy={330} r={44} fill={GS.goldD} stroke={GS.ink} strokeWidth={4} />
        <circle cx={960} cy={330} r={30} fill="#1E0810" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <rect key={a} x={958} y={306} width={4} height={48} fill={GS.goldL} transform={`rotate(${a} 960 330)`} opacity={0.9} />
        ))}
        <Glow x={960} y={400} r={420} o={0.35} />
      </g>
      <WallLight r={CASINO} u={0.12} v={0.45} w={0.02} o={0.5} />
      <WallLight r={CASINO} u={0.88} v={0.45} w={0.02} o={0.5} />
      {/* the bar in the back left: a counter, bottles lit from behind */}
      <g>
        <polygon points={CASINO.Q([[0.02, 0.62, 0.05], [0.2, 0.62, 0.05], [0.2, 0.72, 0.05], [0.02, 0.72, 0.05]])} fill={GS.woodD} />
        {Array.from({ length: 11 }).map((_, i) => {
          const u = 0.035 + i * 0.015;
          const p = CASINO.P(u, 0.63, 0.05);
          const k = CASINO.s(0.05) / CASINO.s(0.5);
          return (
            <g key={`bt${i}`}>
              <rect x={p.x - 6 * k} y={p.y - 60 * k - rnd(3, i) * 26} width={12 * k} height={60 * k + rnd(3, i) * 26} rx={4} fill={i % 3 ? '#C98A3A' : '#7A9E5A'} opacity={0.85} />
              <rect x={p.x - 4 * k} y={p.y - 54 * k - rnd(3, i) * 26} width={3 * k} height={24 * k} fill="#FFE2A8" opacity={0.6} />
            </g>
          );
        })}
        <Glow x={CASINO.P(0.1, 0.62, 0.05).x} y={CASINO.P(0.1, 0.62, 0.05).y - 30} r={230} o={0.3} />
      </g>
      {/* three people at the far table — real rigs, not silhouettes: the review's "clientes parecem sombras
          genéricas" was exactly this, three dark domes with a rim. At this distance the face is 20 px, so what
          carries them is silhouette and colour: a grey bob, a bald head, a ponytail. */}
      {patrons > 0
        ? [
            // the staff in the background, never the same faces as the clients at the table: a duplicated palette
            // is what makes a crowd read as a recoloured template
            { id: 'waiter' as const, x: 556, feet: 764, s: 0.40, face: 1 as const },
            { id: 'guard' as const, x: 700, feet: 772, s: 0.38, face: -1 as const },
            { id: 'guard2' as const, x: 1288, feet: 768, s: 0.39, face: -1 as const },
          ].map((p, i) => (
            <g key={`pa${i}`} opacity={Math.min(1, patrons * 1.15)}>
              <ellipse cx={p.x} cy={p.feet} rx={52 * p.s * 2.4} ry={13 * p.s * 2.4} fill="#000" opacity={0.35} />
              <Npc t={t} place={{ id: p.id, x: p.x, y: p.feet - 140 * p.s, scale: p.s, facing: p.face, yaw: p.face * 0.55 }} />
            </g>
          ))
        : null}
      {/* the floor in front of the near plane: the room's carpet runs to the camera */}
      <rect x={-1400} y={B.y1 + (545 - B.y0)} width={5200} height={2600} fill="#200C18" />
      {Array.from({ length: 26 }).map((_, i) => (
        <path key={`ft${i}`} d={`M ${-1200 + i * 170} 1265 L ${-700 + i * 190} 2600`} stroke="#2C1222" strokeWidth={3} />
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <path key={`fh${i}`} d={`M -1400 ${1330 + i * 110} L 3600 ${1330 + i * 110}`} stroke="#2C1222" strokeWidth={3} />
      ))}
      {[0, 1, 2].map((i) => (
        <Pendant key={`pd${i}`} r={CASINO} u={[0.3, 0.5, 0.7][i]} w={0.5} v={0.2} t={t + i * 9} cone={0.22} glow={0.5} />
      ))}
      <Dust t={t} seed={11} x0={300} y0={380} w={1400} h={900} n={50} o={0.5} />
      {veil > 0 ? (
        <g opacity={0.55 * veil}>
          {lights.map(([x, y, r], i) => (
            <Glow key={`gl${i}`} x={x} y={y - 260} r={r * 0.8} o={0.22} />
          ))}
        </g>
      ) : null}
    </g>
  );
};

// ---------------------------------------------------------------- the wheel
export type BallState = { a: number; d: number; hop?: number }; // angle (deg), distance as a fraction of r

/** The wheel, top-down (squash 1) or on the table (squash ~0.4). The ball rides outside the group so it stays round. */
export const Wheel: React.FC<{ x: number; y: number; r: number; spin: number; ball?: BallState; t?: number; squash?: number; numbers?: number; glow?: number; rim?: string }> = ({
  x, y, r, spin, ball, squash = 1, numbers = 1, glow = 1, rim = GS.wood,
}) => {
  const step = 360 / 37;
  const bx = ball ? x + r * ball.d * Math.cos(rad(ball.a)) : 0;
  const by = ball ? y + r * ball.d * Math.sin(rad(ball.a)) * squash - (ball.hop ?? 0) * r * 0.18 : 0;
  return (
    <g>
      <ellipse cx={x} cy={y + r * 0.1 * squash} rx={r * 1.08} ry={r * 0.9 * squash} fill="#000" opacity={0.4} />
      <g transform={`translate(${x} ${y}) scale(1 ${squash})`}>
        <circle r={r} fill={rim} stroke={GS.ink} strokeWidth={6} />
        <circle r={r * 0.955} fill={GS.goldD} stroke={GS.ink} strokeWidth={3} />
        <circle r={r * 0.9} fill={GS.woodD} stroke={GS.ink} strokeWidth={3} />
        <g transform={`rotate(${spin})`}>
          {ORDER.map((n, i) => {
            const a0 = -90 + i * step;
            const a1 = a0 + step;
            const c = n === 0 ? GS.felt : RED.has(n) ? GS.red : GS.black;
            return <path key={n} d={wedge(r * 0.56, r * 0.88, a0, a1)} fill={c} stroke={GS.goldD} strokeWidth={1.6} />;
          })}
          {numbers > 0
            ? ORDER.map((n, i) => {
                const mid = -90 + (i + 0.5) * step;
                return (
                  <g key={`nn${n}`} transform={`rotate(${mid + 90}) translate(0 ${-r * 0.62}) rotate(180)`} opacity={numbers}>
                    <text textAnchor="middle" fontFamily={FONT.ui} fontSize={r * 0.085} fill={GS.cream} y={r * 0.03}>
                      {n}
                    </text>
                  </g>
                );
              })
            : null}
        </g>
        {/* the turret and its deflectors */}
        <circle r={r * 0.5} fill={GS.woodL} stroke={GS.ink} strokeWidth={4} />
        <circle r={r * 0.42} fill={GS.gold} stroke={GS.ink} strokeWidth={3} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <path key={`df${a}`} d={`M 0 ${-r * 0.18} L ${r * 0.08} ${-r * 0.4} L 0 ${-r * 0.46} L ${-r * 0.08} ${-r * 0.4} Z`} fill={GS.goldL} stroke={GS.ink} strokeWidth={2} transform={`rotate(${a})`} />
        ))}
        <circle r={r * 0.1} fill={GS.goldL} stroke={GS.ink} strokeWidth={3} />
        <circle r={r * 0.05} fill={GS.ink} />
        <ellipse cx={-r * 0.45} cy={-r * 0.55} rx={r * 0.22} ry={r * 0.12} fill="#fff" opacity={0.08} transform={`rotate(-30)`} />
      </g>
      {ball ? (
        <g>
          <circle cx={bx} cy={by + r * 0.03} r={r * 0.075} fill="#000" opacity={0.35} />
          <circle cx={bx} cy={by} r={r * 0.062} fill="#FBF6EA" stroke="#C9BFA8" strokeWidth={2} />
          <circle cx={bx - r * 0.02} cy={by - r * 0.02} r={r * 0.022} fill="#fff" />
        </g>
      ) : null}
      {glow > 0 ? <Glow x={x} y={y} r={r * 1.9} o={0.16 * glow} /> : null}
    </g>
  );
};

// ---------------------------------------------------------------- the layout on the felt
// The betting cloth, in table space: a trapezoid that runs away from the camera, so the grid reads in perspective.
const LAY = { fx0: -540, fx1: 470, nx0: -628, nx1: 592, fy: -46, ny: 92 };

/** Where number n sits on the cloth (table-local coordinates). */
export const betSpot = (n: number) => {
  const col = n === 0 ? -1 : Math.floor((n - 1) / 3);
  const row = n === 0 ? 1 : 2 - ((n - 1) % 3);
  const u = n === 0 ? 0.035 : (col + 1.5) / 13;
  const v = (row + 0.5) / 3;
  return {
    x: lerp(lerp(LAY.fx0, LAY.fx1, u), lerp(LAY.nx0, LAY.nx1, u), v),
    y: lerp(LAY.fy, LAY.ny, v),
  };
};

const BetCloth: React.FC<{ hot?: number; hotP?: number }> = ({ hot = 23, hotP = 1 }) => {
  const line = (u0: number, u1: number, v: number) => {
    const a = { x: lerp(LAY.fx0, LAY.fx1, u0), y: lerp(LAY.fy, LAY.ny, v) };
    const b = { x: lerp(LAY.fx0, LAY.fx1, u1), y: lerp(LAY.fy, LAY.ny, v) };
    return { a, b };
  };
  const cols = [0, ...Array.from({ length: 13 }).map((_, i) => (i + 1) / 13)];
  return (
    <g>
      <polygon points={`${LAY.fx0} ${LAY.fy} ${LAY.fx1} ${LAY.fy} ${LAY.nx1} ${LAY.ny} ${LAY.nx0} ${LAY.ny}`} fill={GS.feltD} opacity={0.55} />
      {[0, 1 / 3, 2 / 3, 1].map((v, i) => {
        const l = line(0, 1, v);
        return <path key={`hl${i}`} d={`M ${l.a.x} ${l.a.y} L ${l.b.x} ${l.b.y}`} stroke={GS.gold} strokeWidth={1.6} opacity={0.55} />;
      })}
      {cols.map((u, i) => {
        const a = { x: lerp(LAY.fx0, LAY.fx1, u), y: LAY.fy };
        const b = { x: lerp(LAY.nx0, LAY.nx1, u), y: LAY.ny };
        return <path key={`vl${i}`} d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} stroke={GS.gold} strokeWidth={1.4} opacity={0.45} />;
      })}
      {/* the red and black cells: without them the layout is a green grid with white lines, and a roulette table
          that could be a bingo card costs the shot its location in one glance */}
      {Array.from({ length: 36 }).map((_, k) => {
        const n = k + 1;
        const col = Math.floor((n - 1) / 3);
        const row = 2 - ((n - 1) % 3);
        const u0 = (col + 1) / 13, u1 = (col + 2) / 13;
        const v0 = row / 3, v1 = (row + 1) / 3;
        const pt = (u: number, v: number) => ({
          x: lerp(lerp(LAY.fx0, LAY.fx1, u), lerp(LAY.nx0, LAY.nx1, u), v),
          y: lerp(LAY.fy, LAY.ny, v),
        });
        const q = [pt(u0, v0), pt(u1, v0), pt(u1, v1), pt(u0, v1)];
        const red = RED.has(n);
        return (
          <polygon
            key={`cell${n}`}
            points={q.map((r) => `${r.x} ${r.y}`).join(' ')}
            fill={red ? '#8A2230' : '#17131A'}
            opacity={red ? 0.62 : 0.5}
          />
        );
      })}
      {Array.from({ length: 36 }).map((_, k) => {
        const n = k + 1;
        const p = betSpot(n);
        return (
          <text key={`nb${n}`} x={p.x} y={p.y + 5} textAnchor="middle" fontFamily={FONT.ui} fontSize={15} fill={GS.cream} opacity={0.8}>
            {n}
          </text>
        );
      })}
      {hot > 0 && hotP > 0
        ? (() => {
            const p = betSpot(hot);
            const q = betSpot(hot);
            return (
              <g opacity={hotP}>
                <circle cx={q.x} cy={q.y} r={26} fill={GS.goldL} opacity={0.28} />
                <circle cx={q.x} cy={q.y} r={26} fill="none" stroke={GS.goldL} strokeWidth={3} />
                <text x={p.x} y={p.y + 7} textAnchor="middle" fontFamily={FONT.ui} fontSize={19} fill="#FFF3D2">
                  {hot}
                </text>
              </g>
            );
          })()
        : null}
    </g>
  );
};

// ---------------------------------------------------------------- the table
/**
 * The roulette table in the foreground, drawn around its centre (x, y): rail, felt, cloth, wheel and a chip tray.
 * `wheelSpin`/`ball` drive the wheel; `hot` is the number lit for the shot.
 */
export const RouletteTable: React.FC<{
  x?: number; y?: number; w?: number; t: number; wheelSpin: number; ball?: BallState; hot?: number; hotP?: number;
  chips?: React.ReactNode; children?: React.ReactNode; scale?: number; dealerSide?: number;
  /** the wheel's local x. Default `dealerSide * w * 0.3`: the right end. On this cloth that puts its rim over the
      26 cell (the second bet), so a close shot of that bet passes 0.40w to clear it. */
  wheelX?: number;
}> = ({ x = 960, y = 1560, w = 1400, t, wheelSpin, ball, hot = 0, hotP = 1, chips, children, scale = 1, dealerSide = 1, wheelX }) => {
  const D = w * 0.27;
  const W = w / 2;
  const T = w * 0.055; // the far edge is narrower: the table runs away from the camera
  const fy = -D / 2;
  const ny = D / 2;
  const outer = `M ${-W - 30} ${ny + 30} L ${W + 30} ${ny + 30} L ${W - T + 30} ${fy - 30} L ${-W + T - 30} ${fy - 30} Z`;
  const felt = `M ${-W} ${ny} L ${W} ${ny} L ${W - T} ${fy} L ${-W + T} ${fy} Z`;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <defs>
        <radialGradient id="feltLight" cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="#4A9A78" stopOpacity={0.45} />
          <stop offset="100%" stopColor="#0C2A20" stopOpacity={0.55} />
        </radialGradient>
      </defs>
      <ellipse cx={0} cy={ny + 70} rx={w * 0.58} ry={D * 0.34} fill="#000" opacity={0.45} />
      {/* the table's near face, under the rail */}
      <path d={`M ${-W - 30} ${ny + 30} L ${W + 30} ${ny + 30} L ${W + 16} ${ny + 150} Q 0 ${ny + 196} ${-W - 16} ${ny + 150} Z`} fill={GS.wood} stroke={GS.ink} strokeWidth={5} />
      <path d={`M ${-W - 14} ${ny + 96} L ${W + 14} ${ny + 96}`} stroke={GS.goldD} strokeWidth={4} opacity={0.65} />
      {/* the far rail stands up off the felt: its face catches the room's light */}
      <path d={`M ${-W + T - 30} ${fy - 54} L ${W - T + 30} ${fy - 54} L ${W - T + 30} ${fy + 4} L ${-W + T - 30} ${fy + 4} Z`} fill={GS.woodL} stroke={GS.ink} strokeWidth={4} />
      <path d={`M ${-W + T - 30} ${fy - 54} L ${W - T + 30} ${fy - 54}`} stroke={GS.goldL} strokeWidth={3} opacity={0.5} />
      {/* the rail's top surface, then the felt */}
      <path d={outer} fill={GS.woodL} stroke={GS.ink} strokeWidth={5} />
      <path d={outer} fill="none" stroke={GS.goldD} strokeWidth={2} opacity={0.4} />
      <path d={felt} fill={GS.felt} stroke={GS.feltD} strokeWidth={4} />
      <path d={felt} fill="url(#feltLight)" opacity={0.5} />
      {/* the rail's shadow falls a little onto the felt */}
      <path d={`M ${-W + 14} ${ny - 16} L ${W - 14} ${ny - 16} L ${W - T - 10} ${fy + 18} L ${-W + T + 10} ${fy + 18} Z`} fill="#000" opacity={0.18} />
      <BetCloth hot={hot} hotP={hotP} />
      <g transform={`translate(${wheelX ?? dealerSide * w * 0.3} ${-4})`}>
        <Wheel x={0} y={0} r={w * 0.115} spin={wheelSpin} ball={ball} squash={0.4} t={t} />
      </g>
      {/* the chip tray in the rail at the dealer's end: stacks seen edge-on, four strata each. The first version
          drew four tall rounded rectangles with a shine bar, which read as coloured UI pills, not as chips. */}
      <g transform={`translate(${dealerSide * -w * 0.36} ${fy - 10})`}>
        <rect x={-84} y={-14} width={168} height={40} rx={7} fill={GS.woodD} stroke={GS.ink} strokeWidth={3} />
        {[GS.chipRed, GS.chipBlue, GS.chipGold, '#3E7A4E'].map((c, i) => (
          <g key={i} transform={`translate(${-62 + i * 42} 14)`}>
            {[0, 1, 2, 3].map((k) => (
              <ellipse key={k} cx={0} cy={-k * 5} rx={15} ry={5.5} fill={c} stroke={GS.ink} strokeWidth={1.6} />
            ))}
            <ellipse cx={0} cy={-15} rx={15} ry={5.5} fill={c} stroke={GS.cream} strokeWidth={1.6} />
            <path d="M -15 -15 Q 0 -22 15 -15" stroke="#fff" strokeWidth={1.6} fill="none" opacity={0.35} />
          </g>
        ))}
      </g>
      {chips}
      {children}
      <Glow x={0} y={-D * 0.2} r={w * 0.5} o={0.1} />
    </g>
  );
};

// ---------------------------------------------------------------- chips
export const Chip: React.FC<{ x: number; y: number; r?: number; c?: string; label?: string; sq?: number; rot?: number }> = ({
  x, y, r = 30, c = GS.chipRed, label = '100', sq = 0.62, rot = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <ellipse cx={0} cy={r * 0.24} rx={r * 1.02} ry={r * 0.52 * sq} fill="#000" opacity={0.35} />
    <g transform={`scale(1 ${sq})`}>
      <circle r={r} fill={c} stroke="#F2E4C8" strokeWidth={3} />
      <circle r={r * 0.66} fill="none" stroke="#F2E4C8" strokeWidth={2.4} strokeDasharray={`${r * 0.34} ${r * 0.24}`} />
      <circle r={r * 0.52} fill={c} stroke="#F2E4C8" strokeWidth={2} opacity={0.95} />
    </g>
    <text y={r * 0.24} textAnchor="middle" fontFamily={FONT.ui} fontSize={r * 0.62} fill="#FBF3E2">
      {label}
    </text>
  </g>
);

/** A stack of chips seen at the table's angle. */
export const ChipStack: React.FC<{ x: number; y: number; n: number; r?: number; c?: string; label?: string }> = ({ x, y, n, r = 28, c = GS.chipRed, label = '100' }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => (
      <rect key={i} x={x - r} y={y - i * r * 0.34 - r * 0.62} width={r * 2} height={r * 0.34} rx={r * 0.22} fill={i % 2 ? c : '#00000022'} stroke={GS.cream} strokeWidth={1.5} opacity={i % 2 ? 1 : 0.4} />
    ))}
    <Chip x={x} y={y - n * r * 0.34} r={r} c={c} label={label} sq={0.5} />
  </g>
);

/** Cash: a banded brick of notes, seen edge on. */
export const CashBrick: React.FC<{ x: number; y: number; w?: number; rot?: number; thick?: number }> = ({ x, y, w = 190, rot = 0, thick = 26 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2} y={-thick / 2} width={w} height={thick} rx={4} fill="#7E9C6A" stroke="#2C3A24" strokeWidth={2.5} />
    <rect x={-w / 2} y={-thick / 2 + 3} width={w} height={4} fill="#A8C48E" opacity={0.7} />
    <rect x={-18} y={-thick / 2 - 2} width={36} height={thick + 4} fill="#E8D9A8" stroke="#2C3A24" strokeWidth={2} />
    <text x={0} y={thick * 0.22} textAnchor="middle" fontFamily={FONT.ui} fontSize={11} fill="#4A3A1A">
      100
    </text>
  </g>
);

/** The five-minute dial, as the power's mark on screen: 37 notches, a hand sweeping back. Drawn in screen space. */
export const MinuteDial: React.FC<{ x: number; y: number; r: number; p: number; s?: number }> = ({ x, y, r, p, s = 5 }) => (
  <g transform={`translate(${x} ${y})`} opacity={0.9}>
    <circle r={r} fill="none" stroke={GS.goldL} strokeWidth={3} opacity={0.5} />
    {Array.from({ length: 12 }).map((_, i) => (
      <rect key={i} x={-1.5} y={-r} width={3} height={r * 0.16} fill={GS.goldL} opacity={i < p * 12 ? 0.95 : 0.28} transform={`rotate(${i * 30})`} />
    ))}
    <path d={`M 0 0 L 0 ${-r * 0.72}`} stroke={GS.goldL} strokeWidth={4} strokeLinecap="round" transform={`rotate(${-360 * (1 - p) + 90})`} />
    <text y={r * 1.35} textAnchor="middle" fontFamily={FONT.ui} fontSize={r * 0.34} fill={GS.goldL}>
      {`-0${Math.floor(p)}:${String(Math.round((p % 1) * 60)).padStart(2, '0')}`}
    </text>
  </g>
);

/** The 5:00 HUD mark of the power, screen-space: a ring of 37 ticks, the hand sweeping back, the readout. */
export const PowerHud: React.FC<{ x: number; y: number; p: number; size?: number }> = ({ x, y, p, size = 1 }) => {
  const r = 74 * size;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r * 1.14} fill="#0B0816" opacity={0.55} />
      <circle r={r} fill="none" stroke={GS.cream} strokeWidth={3} opacity={0.7} />
      {Array.from({ length: 37 }).map((_, i) => {
        const on = i / 37 <= p;
        return <rect key={i} x={-1.2 * size} y={-r - 9 * size} width={2.4 * size} height={8 * size} fill={on ? GS.goldL : '#6B5A4A'} opacity={on ? 1 : 0.5} transform={`rotate(${(i * 360) / 37})`} />;
      })}
      <path d={`M 0 0 L 0 ${-r * 0.76}`} stroke={GS.goldL} strokeWidth={4 * size} strokeLinecap="round" transform={`rotate(${-90 + 360 * (1 - p)})`} />
      <circle r={6 * size} fill={GS.goldL} />
      <text y={r * 1.5} textAnchor="middle" fontFamily={FONT.ui} fontSize={30 * size} fill={GS.goldL} letterSpacing={3 * size}>
        {`-${String(Math.floor((1 - p) * 5)).padStart(1, '0')}:${String(Math.floor((((1 - p) * 5) % 1) * 60)).padStart(2, '0')}`}
      </text>
    </g>
  );
};

/** A clean plate of the room for close shots: dark, warm, with the bokeh of the room's lights. */
export const CasinoBokeh: React.FC<{ t: number; x0?: number; y0?: number; w?: number; h?: number; n?: number }> = ({ t, x0 = -200, y0 = -200, w = 2300, h = 1900, n = 16 }) => (
  <g filter="url(#blur6)">
    {Array.from({ length: n }).map((_, i) => (
      <circle key={i} cx={x0 + rnd(21, i) * w + Math.sin(t / 50 + i) * 10} cy={y0 + rnd(22, i) * h} r={10 + rnd(23, i) * 30} fill={i % 4 ? GS.goldL : GS.neon} opacity={0.1 + rnd(24, i) * 0.16} />
    ))}
  </g>
);

/** The width of the visible world at a camera zoom, for laying out a wide shot without guessing. */
export const visible = (z: number) => ({ w: FRAME.w / z, h: FRAME.h / z });
