import { LEG_LEN } from './rig';

/**
 * World-space blocking for any scene with a roulette table.
 *
 * The delivered episode 2 had actors standing with their feet inside the tabletop: the felt is a trapezoid that
 * runs from `y - 0.135w` (far) to `y + 0.135w` (near), and every actor whose hip was picked by eye overflowed
 * 40-110 units into it. The audience reads that as "the man is standing on the green". This module is the fix made
 * permanent: one table rectangle in world coordinates, one rule per actor (behind / in front / beside), and a
 * validator the render can call before it draws a single frame.
 *
 * Conventions, in world units (y grows downward, the camera looks at the near side):
 *   · behind the table: feet at or above the FAR outer rail (`bounds.far`). The character stands on the casino
 *     floor beyond the table; the raised far rail covers his ankles, and the table must be drawn AFTER him.
 *   · in front: feet at or below the NEAR outer edge of the table's front face (`bounds.near`). Drawn after the
 *     table: he is between the camera and the felt.
 *   · beside: feet to the left or right of the tabletop's x span; any depth.
 * Anything else is a body on the felt, and `stageErrors` names it.
 *
 * A Pose's `y` is the HIP point (rig.tsx), so the feet are `pose.y + (LEG_LEN + 12) * scale` (140 of leg + the
 * shoe's sole). The table's own numbers come from `RouletteTable` (casino.tsx): D = 0.27w, rail = 30, and the
 * front face runs 196 below the near rail.
 */

export type TableBox = { x: number; y: number; w: number; scale?: number };

export type TableBounds = {
  /** world y of the far outer rail: at or above this a character stands behind the table */
  far: number;
  /** world y of the bottom of the front face: at or below this a character stands in front */
  near: number;
  /** the felt's own far and near edges, for reference and for drawing checks */
  feltFar: number;
  feltNear: number;
  minX: number;
  maxX: number;
  wheelX: number;
  wheelY: number;
  wheelR: number;
};

export const tableBounds = ({ x, y, w, scale = 1 }: TableBox): TableBounds => {
  const W = (w / 2) * scale;
  const D = w * 0.135 * scale;
  const rail = 30 * scale;
  return {
    far: y - D - rail,
    near: y + D + 196 * scale,
    feltFar: y - D,
    feltNear: y + D,
    minX: x - W - rail,
    maxX: x + W + rail,
    wheelX: x + 0.3 * w * scale,
    wheelY: y - 4 * scale,
    wheelR: 0.115 * w * scale,
  };
};

/** The ground point of a pose: hip + legs + the shoe's sole. */
export const feetOf = (a: { x: number; y: number; scale: number }) => ({
  x: a.x,
  y: a.y + (LEG_LEN + 12) * a.scale,
});

export type Stand = 'behind' | 'front' | 'beside';

export type ActorStage = {
  id: string;
  x: number;
  /** the HIP y, exactly the value the pose uses */
  y: number;
  scale: number;
  stand: Stand;
};

export type StageSpec = {
  shot: string;
  table: TableBox;
  actors: ActorStage[];
  /** the order the shot must draw in; `last` means the table covers the actors' lower body */
  tableDraw: 'last' | 'first';
  note?: string;
};

/** Every way an actor can be in the wrong place, as readable sentences. Empty means the stage is legal. */
export const stageErrors = (s: StageSpec): string[] => {
  const b = tableBounds(s.table);
  const out: string[] = [];
  for (const a of s.actors) {
    const f = feetOf(a);
    const inX = f.x > b.minX && f.x < b.maxX;
    const feet = `(${Math.round(f.x)}, ${Math.round(f.y)})`;
    if (a.stand === 'beside') {
      if (inX) out.push(`${s.shot} ${a.id}: declared beside the table but feet ${feet} are inside its span x ${Math.round(b.minX)}..${Math.round(b.maxX)}`);
      continue;
    }
    if (!inX) {
      out.push(`${s.shot} ${a.id}: declared ${a.stand} the table but feet x ${Math.round(f.x)} are outside its span ${Math.round(b.minX)}..${Math.round(b.maxX)} (use 'beside')`);
      continue;
    }
    if (a.stand === 'behind') {
      if (f.y > b.far) out.push(`${s.shot} ${a.id}: behind the table but feet y ${Math.round(f.y)} are past the far rail ${Math.round(b.far)} (on the tabletop)`);
      if (s.tableDraw !== 'last') out.push(`${s.shot}: actors stand behind the table but it is drawn first, so they would paint over the felt`);
    }
    if (a.stand === 'front' && f.y < b.near) {
      out.push(`${s.shot} ${a.id}: in front of the table but feet y ${Math.round(f.y)} are above the front face ${Math.round(b.near)} (inside the table)`);
    }
  }
  return out;
};

/** Call from a shot (cheap) and from the regression test (scripts_local/stage_test.mjs). */
export const assertStage = (s: StageSpec): void => {
  const errs = stageErrors(s);
  if (errs.length) throw new Error('BLOCKING ' + errs.join(' | '));
};
