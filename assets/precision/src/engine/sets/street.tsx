import React from 'react';
import { clamp, lerp, rnd } from '../anim';
import { NightSky, Skyline, Stars, Bokeh } from '../kit';
import { Glow, Dust } from '../light';
import { FONT } from '../fonts';

// The street outside: a wet night, the casino's marquee doing all the lighting, the road carrying its colour back up.
// Laid out in world coordinates rather than a room, because the camera walks down this one.

export const ST = {
  sky0: '#070A18',
  sky1: '#131B38',
  build: '#101426',
  buildL: '#1A2140',
  stone: '#231B2A',
  stoneL: '#33263A',
  gold: '#E7B45C',
  goldL: '#FFD894',
  neon: '#FF4E6B',
  neonC: '#6BE3FF',
  warm: '#FFC27A',
  road: '#0C0F1C',
  wet: '#1A2036',
  ink: '#0A0710',
};

/** A block of buildings behind the street, with a few windows lit. */
const Blocks: React.FC<{ y: number; t: number }> = ({ y, t }) => (
  <g>
    <Skyline y={y} seed={7} color={ST.build} h={230} />
    <Skyline y={y - 20} seed={19} color="#161B33" h={150} />
    {Array.from({ length: 26 }).map((_, i) => {
      const x = -300 + rnd(31, i) * 2500;
      const yy = y - 40 - rnd(32, i) * 180;
      const on = 0.35 + 0.3 * Math.sin(t / (30 + i) + i);
      return <rect key={i} x={x} y={yy} width={7 + rnd(33, i) * 8} height={10} fill={ST.warm} opacity={on * 0.5} />;
    })}
  </g>
);

/** The casino front: stone, gold trim, the marquee and its neon, glass doors spilling warm light. */
export const CasinoFront: React.FC<{ x?: number; y?: number; s?: number; t: number; lit?: number; signOn?: number }> = ({ x = 0, y = 0, s = 1, t, lit = 1, signOn = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* the building */}
    <rect x={-520} y={-560} width={1040} height={660} fill={ST.stone} stroke={ST.ink} strokeWidth={6} />
    <rect x={-470} y={-520} width={940} height={40} fill={ST.stoneL} opacity={0.8} />
    {/* gold pilasters */}
    {[-430, -300, 300, 430].map((px) => (
      <g key={px}>
        <rect x={px - 16} y={-500} width={32} height={600} fill={ST.gold} opacity={0.55} />
        <rect x={px - 16} y={-500} width={8} height={600} fill={ST.goldL} opacity={0.4} />
      </g>
    ))}
    {/* the marquee box */}
    <rect x={-250} y={-430} width={500} height={150} rx={10} fill="#160810" stroke={ST.gold} strokeWidth={6} />
    <text x={0} y={-330} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={86} fill="#FFE7C2" letterSpacing={8}>
      CASSINO
    </text>
    <rect x={-224} y={-306} width={448} height={6} rx={3} fill={ST.neon} opacity={0.9 * signOn} />
    {/* neon outline around the sign */}
    <rect x={-262} y={-442} width={524} height={174} rx={14} fill="none" stroke={ST.neon} strokeWidth={6} opacity={0.85 * signOn} />
    <rect x={-262} y={-442} width={524} height={174} rx={14} fill="none" stroke={ST.neon} strokeWidth={18} opacity={0.18 * signOn} />
    {/* the wheel emblem, turning slowly */}
    <g transform={`translate(0 -520) rotate(${t * 0.4})`} opacity={signOn}>
      <circle r={64} fill="#160810" stroke={ST.gold} strokeWidth={6} />
      {Array.from({ length: 12 }).map((_, i) => (
        <path key={i} d="M 0 -20 L 10 -52 L 0 -60 L -10 -52 Z" fill={i % 2 ? ST.neon : ST.goldL} transform={`rotate(${i * 30})`} opacity={0.9} />
      ))}
      <circle r={14} fill={ST.goldL} />
    </g>
    {/* doors: warm light through glass */}
    <g>
      <rect x={-170} y={-270} width={340} height={370} fill="#2A1A12" stroke={ST.gold} strokeWidth={5} />
      <rect x={-150} y={-252} width={300} height={336} fill="#3A2416" opacity={0.85} />
      {[-150, -50, 50].map((dx) => (
        <rect key={dx} x={dx} y={-252} width={4} height={336} fill={ST.gold} opacity={0.7} />
      ))}
      <rect x={-150} y={-252} width={300} height={336} fill={`url(#${'stDoor'})`} opacity={0.9} />
      <path d="M -150 -252 L 150 -252 L 240 40 L -240 40 Z" fill={ST.warm} opacity={0.12 * lit} style={{ mixBlendMode: 'screen' }} />
      <rect x={-36} y={-60} width={72} height={8} rx={4} fill={ST.goldL} opacity={0.9} />
    </g>
    <defs>
      <linearGradient id="stDoor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFD9A0" stopOpacity={0.35} />
        <stop offset="70%" stopColor="#FFB46A" stopOpacity={0.16} />
        <stop offset="100%" stopColor="#FF9A4A" stopOpacity={0.05} />
      </linearGradient>
    </defs>
    {/* the marquee's spill on the stone and the pavement */}
    <ellipse cx={0} cy={30} rx={640} ry={120} fill={ST.neon} opacity={0.09 * lit} filter="url(#blur10)" />
    <Glow x={0} y={-360} r={520} o={0.28 * lit} />
  </g>
);

/** A street lamp: the post, the head, the cone and the pool of light on the wet ground. */
export const StreetLamp: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <defs>
      <linearGradient id="stlRim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={ST.warm} stopOpacity={0.55} />
        <stop offset="0.55" stopColor={ST.warm} stopOpacity={0.16} />
        <stop offset="1" stopColor={ST.warm} stopOpacity={0.03} />
      </linearGradient>
    </defs>
    <rect x={-9} y={-560} width={18} height={560} fill="#141826" />
    <rect x={-9} y={-560} width={5} height={560} fill="url(#stlRim)" />
    <path d="M 0 -560 Q 0 -620 60 -620" stroke="#141826" strokeWidth={12} fill="none" />
    <ellipse cx={66} cy={-614} rx={34} ry={14} fill="#1B2032" />
    <ellipse cx={66} cy={-606} rx={24} ry={8} fill={ST.warm} />
    <Glow x={66} y={-600} r={260} o={0.45} />
    <path d="M 40 -600 L 92 -600 L 260 40 L -130 40 Z" fill={ST.warm} opacity={0.07} style={{ mixBlendMode: 'screen' }} />
    <ellipse cx={66} cy={36} rx={210} ry={34} fill={ST.warm} opacity={0.1} />
    {Math.sin(t / 30) > 0.9 ? <circle cx={66} cy={-604} r={10} fill="#fff" opacity={0.8} /> : null}
  </g>
);

/** The street: sky, blocks, the casino front, the wet road and its reflections, rain. */
export const Street: React.FC<{ t: number; id?: string; x?: number; s?: number; rain?: number; lit?: number; signOn?: number }> = ({ t, id = 'st', x = 0, s = 1, rain = 1, lit = 1, signOn = 1 }) => (
  <g>
    <NightSky id={`${id}sky`} horizonY={620} />
    <Stars seed={5} x0={-700} y0={-400} w={3300} h={900} t={t} n={60} o={0.7} />
    <g transform={`translate(${x} 0) scale(${s})`}>
      <Blocks y={700} t={t} />
      <CasinoFront x={0} y={760} s={1} t={t} lit={lit} signOn={signOn} />
      {/* the pavement */}
      <rect x={-1600} y={760} width={4200} height={150} fill="#171B2C" />
      <rect x={-1600} y={758} width={4200} height={5} fill="#2C3450" opacity={0.8} />
      {Array.from({ length: 22 }).map((_, i) => (
        <path key={`pv${i}`} d={`M ${-1500 + i * 190} 760 L ${-1200 + i * 230} 910`} stroke="#0F1322" strokeWidth={3} />
      ))}
      {/* the road and its wet reflections */}
      <rect x={-1600} y={906} width={4200} height={1400} fill={ST.road} />
      <rect x={-1600} y={906} width={4200} height={26} fill="#232B45" opacity={0.7} />
      {Array.from({ length: 14 }).map((_, i) => {
        const rx = -900 + i * 190 + Math.sin(t / 90 + i) * 6;
        const c = i % 3 === 0 ? ST.neon : i % 3 === 1 ? ST.gold : ST.warm;
        return <rect key={`rf${i}`} x={rx} y={930} width={26 + rnd(41, i) * 40} height={260 + rnd(42, i) * 380} fill={c} opacity={0.06 + rnd(43, i) * 0.07} rx={10} />;
      })}
      {Array.from({ length: 9 }).map((_, i) => (
        <ellipse key={`pd${i}`} cx={-1000 + i * 300} cy={1000 + rnd(51, i) * 700} rx={90 + rnd(52, i) * 120} ry={10 + rnd(53, i) * 12} fill="#3C4A6E" opacity={0.18} />
      ))}
      {/* lane dashes, running away */}
      {Array.from({ length: 7 }).map((_, i) => (
        <path key={`ln${i}`} d={`M ${-120 + i * 240} 1400 L ${-40 + i * 240} 920`} stroke="#3A4260" strokeWidth={4} opacity={0.35} />
      ))}
      {/* a car far off, two lights */}
      <g opacity={0.9}>
        <ellipse cx={-520} cy={700} rx={120} ry={26} fill="#FFE2B0" opacity={0.12} />
        <circle cx={-560} cy={700} r={7} fill="#FFF3D2" />
        <circle cx={-480} cy={700} r={7} fill="#FFF3D2" />
      </g>
      <Bokeh seed={77} n={10} x0={-700} y0={300} w={1600} h={500} t={t} o={0.12} />
      {rain > 0
        ? Array.from({ length: 70 }).map((_, i) => {
            const rx = -900 + rnd(61, i) * 2400;
            const ry = ((rnd(62, i) * 1200 + t * (26 + rnd(63, i) * 16)) % 1300) - 200;
            const l = 20 + rnd(64, i) * 34;
            return <path key={`rn${i}`} d={`M ${rx} ${ry} L ${rx - l * 0.22} ${ry + l}`} stroke="#AFC6E8" strokeWidth={2} opacity={0.16 * rain} />;
          })
        : null}
      <Dust t={t} seed={9} x0={-600} y0={300} w={1500} h={700} n={24} o={0.3} />
    </g>
  </g>
);

/** The pavement under his feet: a close insert for a walk-out, with the marquee's colour on the wet stone. */
export const WetGround: React.FC<{ t: number; y?: number }> = ({ t, y = 0 }) => (
  <g transform={`translate(0 ${y})`}>
    <rect x={-1000} y={-200} width={3000} height={1600} fill="#10131F" />
    {Array.from({ length: 30 }).map((_, i) => (
      <path key={i} d={`M ${-900 + i * 110} -200 L ${-980 + i * 120} 1300`} stroke="#1A2036" strokeWidth={3} opacity={0.7} />
    ))}
    {Array.from({ length: 16 }).map((_, i) => (
      <rect key={`w${i}`} x={-950 + i * 130 + Math.sin(t / 70 + i) * 4} y={-200} width={34} height={900} fill={i % 3 ? ST.neon : ST.gold} opacity={0.05 + rnd(71, i) * 0.05} rx={12} />
    ))}
    <ellipse cx={-200} cy={420} rx={260} ry={22} fill="#4A5578" opacity={0.2} />
    <ellipse cx={520} cy={700} rx={200} ry={18} fill="#4A5578" opacity={0.16} />
    <Glow x={300} y={-300} r={700} o={0.18} />
  </g>
);

/** Exported for the episode's cast sheet: the two set pieces in one frame. */
export const StreetScene: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Street t={t} />
    <StreetLamp x={-620} y={980} s={1.05} t={t} />
  </g>
);
