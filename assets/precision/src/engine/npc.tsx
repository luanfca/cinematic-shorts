import React from 'react';
import { Actor, basePose, Expr, Look, Pose } from './rig';

/**
 * The secondary cast.
 *
 * Before this file the casino had "patrons": three dark blobs at the back of the room, and any shot that needed a
 * second person fell back on Pip with a different colour. Neither is a character: a blob has no face to hold a
 * look, and a recoloured Pip reads as the hero's twin. Every entry here is a full rig with its own skin, hair,
 * clothes and glasses, so the room is populated by people who stay the same people from shot to shot.
 *
 * Rules that keep them from turning into a crowd of clones:
 *  - no two share a silhouette: hair shape, jacket colour and build all differ;
 *  - the croupier is one fixed identity (`croupier`), never redrawn per episode;
 *  - staff and security are dressed as staff and security, not as villains: no black coats, no hoods, no shadows
 *    over the eyes. The guards are there to be noticed in a later episode, not to menace this one;
 *  - skin tones are spread across the palette and paired with different hair, so nobody reads as a recolour.
 */

export type NpcId =
  | 'croupier'
  | 'vera' | 'tomas' | 'lia' | 'beto' | 'rita' | 'caio' | 'nadia'
  | 'waiter' | 'guard' | 'guard2'
  // 5 MINUTOS · ep. 2 — the man who has the same power (identity permanent)
  | 'homem';

const DEEP = { skin: '#8E5B3C', skinShade: '#74482E' };
const MID = { skin: '#C98E68', skinShade: '#B07A58' };
const TAN = { skin: '#E8C39B', skinShade: '#D0A87E' };
const PALE = { skin: '#F6EFE3', skinShade: '#E2D3BE' };
const OLIVE = { skin: '#B98A62', skinShade: '#9E7050' };

export const NPC: Record<NpcId, Look> = {
  // THE CROUPIER — one identity for the whole series: black vest, white shirt, bow tie, combed hair.
  croupier: {
    ...PALE, hand: PALE.skin, jacket: '#22242E', jacketShade: '#171922', accent: '#C0303C',
    limb: '#EDE4D2', line: '#0D0E13', shoe: '#12131A', face: '#1D2033', hair: '#2A1E1A', extra: 'dealer',
  },

  // clients
  vera: { ...PALE, hand: PALE.skin, jacket: '#8C3B4A', jacketShade: '#712E3B', accent: '#E9C46A', limb: '#F0E6D6', line: '#1A1016', shoe: '#2E2226', face: '#1D2033', hair: '#B9B2AE', extra: 'bob' },
  tomas: { ...OLIVE, hand: OLIVE.skin, jacket: '#5B6B4A', jacketShade: '#4A583C', accent: '#D9A24A', limb: '#3A3446', line: '#14180F', shoe: '#2A2218', face: '#1D2033', hair: '#241812', extra: 'beard' },
  lia: { ...TAN, hand: TAN.skin, jacket: '#2F7E7A', jacketShade: '#256460', accent: '#F2A65A', limb: '#33303E', line: '#101A19', shoe: '#E4D6C0', face: '#1D2033', hair: '#3B2418', extra: 'ponytail' },
  beto: { ...MID, hand: MID.skin, jacket: '#7A5A3A', jacketShade: '#64492F', accent: '#C9B07A', limb: '#38302C', line: '#160F0B', shoe: '#241A14', face: '#1D2033', hair: '#6E6258', extra: 'balding' },
  rita: { ...DEEP, hand: DEEP.skin, jacket: '#5E3A6E', jacketShade: '#4C2E5A', accent: '#E9C46A', limb: '#2E2536', line: '#120B14', shoe: '#241A2A', face: '#1D2033', hair: '#1A1012', extra: 'longhair' },
  caio: { ...TAN, hand: TAN.skin, jacket: '#B4653A', jacketShade: '#96522E', accent: '#EDE0C4', limb: '#40363A', line: '#1A1010', shoe: '#2A2024', face: '#1D2033', hair: '#3A3A3E', extra: 'cap' },
  nadia: { ...DEEP, hand: DEEP.skin, jacket: '#3E4A5C', jacketShade: '#303A49', accent: '#C9D4E0', limb: '#2C2E38', line: '#0E1016', shoe: '#1A1C22', face: '#1D2033', hair: '#141014', extra: 'buzz' },

  // the house
  waiter: { ...TAN, hand: TAN.skin, jacket: '#2C3A4A', jacketShade: '#222E3B', accent: '#8FB3C9', limb: '#E8DFC9', line: '#0E1218', shoe: '#16181E', face: '#1D2033', hair: '#2A1C14', extra: 'staff', apron: true, bulk: 0.97 },
  guard: { ...MID, hand: MID.skin, jacket: '#26303C', jacketShade: '#1C242E', accent: '#7E93A8', limb: '#22262E', line: '#0A0C10', shoe: '#0E1014', face: '#1D2033', hair: '#1C1614', extra: 'security', bulk: 1.16 },
  guard2: { ...PALE, hand: PALE.skin, jacket: '#2B3644', jacketShade: '#1F2833', accent: '#8FA6BC', limb: '#22262E', line: '#0A0C10', shoe: '#0E1014', face: '#1D2033', hair: '#2E1E1A', extra: 'security', bulk: 0.95, earpiece: true },

  // THE STRANGER — a casino winner in his forties: charcoal overcoat, dark shirt, greying hair, no props. He must
  // read as an ordinary client at first glance; the coat's silhouette is the only thing that sets him apart.
  homem: {
    skin: '#B08A66', skinShade: '#997454', hand: '#B08A66', jacket: '#1E222B', jacketShade: '#151922',
    accent: '#5A6270', limb: '#20242C', sleeve: '#30353F', line: '#0B0C10', shoe: '#101116', face: '#171A22', hair: '#4A4340',
    extra: 'coat',
  },
};

/** A stable 0..1 seed from the id: the same person always breathes and blinks on the same rhythm. */
const hash = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
  return (h % 97) / 97;
};

/** A blink that belongs to this person alone, so a crowd never blinks together. */
const blinkAt = (t: number, s: number) => {
  const period = 3.4 + s * 2.6;
  const ph = ((t + s * 7) % period) / period;
  return ph > 0.955 ? Math.sin(((ph - 0.955) / 0.045) * Math.PI) : 0;
};

/**
 * The idle: breathing, a head that drifts, a look that wanders, and — once every several seconds, on its own
 * clock — a small gesture of the arm, as if handling a chip. No two people share a period, so the room never
 * moves in step. `amount` scales everything for people far from camera.
 */
const idle = (t: number, s: number, amount = 1) => {
  const per = 6.5 + s * 6;
  const ph = ((t + s * 11) % per) / per;
  const g = ph > 0.58 && ph < 0.74 ? Math.sin(((ph - 0.58) / 0.16) * Math.PI) : 0;
  const which = s > 0.5 ? 1 : -1;
  return {
    breath: Math.sin(t * (0.055 + s * 0.02) + s * 9) * amount,
    head: Math.sin(t * (0.024 + s * 0.011) + s * 4.4) * amount,
    look: Math.sin(t * (0.017 + s * 0.009) + s * 2.2) * amount,
    gl: which > 0 ? -26 * g * amount : -4 * g * amount,
    gr: which > 0 ? -4 * g * amount : -22 * g * amount,
  };
};

export type NpcPlace = {
  id: NpcId;
  x: number;
  y: number;
  scale?: number;
  facing?: 1 | -1;
  /** override the seed when the same person has to stand in two places in one shot */
  seed?: number;
  expr?: Expr;
  yaw?: number;
  /** 0..1: how much the person moves; 0 for someone frozen mid-action */
  motion?: number;
  glasses?: number;
  /** a fixed gaze, -1..1, overriding the wandering one: a person watching the wheel is not looking at random */
  look?: number;
  /** a fixed head tilt in degrees, added to the breathing drift */
  headTilt?: number;
  /** a fixed arm pose, replacing the idle sway: a client raising a hand to his mouth is not idling */
  armL?: { a: number; b: number };
  armR?: { a: number; b: number };
};

/** One secondary character, alive at frame `t`. */
export const Npc: React.FC<{ t: number; place: NpcPlace }> = ({ t, place }) => {
  const p = place;
  const s = p.seed ?? hash(p.id);
  const m = p.motion ?? 1;
  const d = idle(t, s, m);
  const pose: Pose = {
    ...basePose,
    x: p.x,
    y: p.y,
    scale: p.scale ?? 0.7,
    facing: p.facing ?? 1,
    yaw: p.yaw ?? (p.facing ?? 1) * 0.14,
    tilt: d.head * 1.1,
    headTilt: d.head * 2.4 + (p.headTilt ?? 0),
    look: p.look ?? d.look * 0.4,
    blink: m > 0 ? blinkAt(t, s) : 0,
    armL: p.armL ?? { a: 9 + d.breath * 1.4, b: -10 + d.gl },
    armR: p.armR ?? { a: 9 - d.breath * 1.4, b: -10 + d.gr },
    expr: p.expr ?? 'neutral',
    glasses: p.glasses ?? 0,
  };
  return <Actor pose={pose} look={NPC[p.id]} />;
};

/**
 * The crowd: draws everyone back-to-front by `y`, so the nearest person overlaps the one behind. Depth is the
 * caller's job (y and scale), because the same six people stand at different distances in every shot.
 */
export const Crowd: React.FC<{ t: number; places: NpcPlace[] }> = ({ t, places }) => (
  <g>
    {[...places].sort((a, b) => a.y - b.y).map((p, i) => (
      <Npc key={`${p.id}-${i}`} t={t} place={p} />
    ))}
  </g>
);

export default NPC;
