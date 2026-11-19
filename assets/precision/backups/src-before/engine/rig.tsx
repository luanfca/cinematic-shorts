import React from 'react';
import { lerp, easeInOut } from './anim';

// The cast, drawn entirely in code: one rig, and a costume (a Look) per character. Every character is built
// once here, so they look identical in every shot: that's the "drawn, not guessed" point. Original
// characters only: never a channel's own hero or anything that resembles a famous cartoon character.

export const C = {
  skin: '#F6EFE3',
  skinShade: '#E2D3BE',
  ink: '#1D2033',
  jacket: '#F2B33D',
  jacketShade: '#D4922A',
  shoe: '#2FB7A6',
  orange: '#FF8A3D',
  limb: '#EFE2CC',
};

/** A costume for the rig: the same body and animation, different colours and one optional extra piece. */
export type Look = {
  skin: string;
  skinShade: string;
  hand: string;
  jacket: string;
  jacketShade: string;
  accent: string;
  limb: string;
  /** An arm tone when the costume's own sleeve would vanish into the body: a dark coat on a dark set. The legs keep
   *  `limb`; only the arms use this. */
  sleeve?: string;
  line: string;
  shoe: string;
  face: string;
  hair: string;
  /** shoulder width as a fraction of the normal torso: two security men in one uniform need two silhouettes */
  bulk?: number;
  /** a coiled earpiece over the collar — the guard in front reads as staff at a glance */
  earpiece?: boolean;
  /** a light apron over the jacket — the waiter cannot be mistaken for the croupier */
  apron?: boolean;
  extra?:
    | 'hood' | 'curls' | 'bunches' | 'bob' | 'suit'
    // the secondary cast (npc.tsx): hair and clothes that read at a glance and never repeat a face
    | 'dealer' | 'staff' | 'security' | 'buzz' | 'ponytail' | 'longhair' | 'balding' | 'cap' | 'beard'
    // episode 2: the stranger's overcoat — lapels, a dark shirt and a coat skirt over the hips
    | 'coat'
    // O CADERNO DA MORTE: Lucas's side-swept fringe, a silhouette of its own (not Pip's flick)
    | 'fringe';
};
export type CastName = 'pip' | 'pipHood' | 'pipInk' | 'mo' | 'sis' | 'mom' | 'suit';
export const LOOKS: Record<CastName, Look> = {
  // A: Pip as built
  pip: { skin: C.skin, skinShade: C.skinShade, hand: C.skin, jacket: C.jacket, jacketShade: C.jacketShade, accent: C.jacketShade, limb: C.limb, line: C.ink, shoe: C.shoe, face: C.ink, hair: C.ink },
  // B: Pip in a dark hoodie with mustard drawstrings: the body goes dark and catches the rim light, the head stays the brightest thing
  pipHood: { skin: C.skin, skinShade: C.skinShade, hand: C.skin, jacket: '#2E2B3D', jacketShade: '#24212F', accent: C.jacket, limb: '#2E2B3D', line: '#121019', shoe: C.shoe, face: C.ink, hair: C.ink, extra: 'hood' },
  // C: a dark head with light features, the genre's high-contrast convention, in Pip's mustard
  pipInk: { skin: '#26232F', skinShade: '#1C1A24', hand: '#26232F', jacket: C.jacket, jacketShade: C.jacketShade, accent: C.jacketShade, limb: '#26232F', line: '#121019', shoe: C.shoe, face: '#F6EFE3', hair: '#26232F' },
  // Mo, Pip's friend: a second recurring character with his own costume (curly hair, headphones round his neck)
  mo: { skin: '#C98E68', skinShade: '#B07A58', hand: '#C98E68', jacket: '#5E6E46', jacketShade: '#4C5A38', accent: '#E9C46A', limb: '#3A3446', line: '#1A1622', shoe: '#D9534F', face: C.ink, hair: '#2A1C18', extra: 'curls' },
  // the formula's recurring cast (beats 5 and 6): Pip's little sister (draw her at about 0.7 of Pip's scale), his mum,
  // and the man in a suit who notices the power. All three are ours: plain shapes, no famous silhouettes.
  sis: { skin: C.skin, skinShade: C.skinShade, hand: C.skin, jacket: '#3E8C86', jacketShade: '#2F6E69', accent: '#F28C6A', limb: '#3A3446', line: '#14121C', shoe: '#F28C6A', face: C.ink, hair: '#3A2620', extra: 'bunches' },
  mom: { skin: C.skin, skinShade: C.skinShade, hand: C.skin, jacket: '#8A5A6A', jacketShade: '#704858', accent: '#E9C46A', limb: '#3A3446', line: '#14121C', shoe: '#5A4A6A', face: C.ink, hair: '#5A3226', extra: 'bob' },
  suit: { skin: '#D9C6AE', skinShade: '#C2AE96', hand: '#D9C6AE', jacket: '#2B2F3A', jacketShade: '#20232C', accent: '#A8323E', limb: '#2B2F3A', line: '#0E0F14', shoe: '#14151A', face: C.ink, hair: '#17141A', extra: 'suit' },
};

// ---------- the hero ----------
/** Mitten hands: open (a palm and a thumb), pointing (a fist with the index finger out), or palm (a wide mitten
    for a hand held over the mouth — at a close-up the open hand is smaller than the mouth). */
export type HandKind = 'open' | 'point' | 'palm';
export type Expr =
  | 'neutral' | 'happy' | 'smug' | 'shock' | 'worried' | 'oops' | 'cool' | 'dizzy' | 'tired'
  // episode 2's acting set: each is a distinct face at close-up, not a label
  | 'laugh' | 'euphoric' | 'greedy' | 'devastated' | 'panic' | 'suspicious' | 'cold' | 'determined';
export type Limb = { a: number; b: number }; // a: upper segment angle, b: bend of the lower segment (degrees)
export type Pose = {
  x: number;
  y: number; // hip point
  scale: number;
  facing: 1 | -1;
  tilt: number; // torso lean around the hips, degrees, + leans screen-right
  spin: number; // whole-body rotation around the chest (tumbles)
  headTilt: number;
  armL: Limb;
  armR: Limb;
  legL: Limb;
  legR: Limb;
  expr: Expr;
  blink: number; // 0 open, 1 shut
  look: number; // -1..1 horizontal eye offset
  lookY: number; // -1..1 vertical eye offset: + looks down (the felt, the chips, his own hand)
  /** 0..1 mouth articulation for a character who is speaking; 0 draws the expression's own mouth, as before.
      Drive it from the voice envelope (see `speech.json` + `talkAt`), never from a random sine: a listener reads
      the mouth against the word being heard, and a mouth flapping in silence is worse than a closed one. */
  talk: number;
  viseme?: "A"|"E"|"O"|"MBP"|"FV"|"rest";
  glasses: number; // 0..1
  yaw: number; // -1 profile facing screen-left, 0 front, 1 profile facing screen-right
  squash: number; // + squashes (landing), - stretches (jump), about the feet
  handL: HandKind;
  handR: HandKind;
  /** 0..1 — draws the NEAR arm after the head, so a hand posed at the mouth is in front of the face instead of
      behind it. A hand over the lips is a real limb, not a hand-shaped prop pasted over the character. */
  armFront: number;
  /** 0..1 — draws the FAR arm after the torso. Seated with both hands in the lap, the far arm was drawn behind
      the jacket: its sleeve surfaced at the body's edge and ended in a cuff with no hand (the Caderno1 audit,
      S14/S20/S23/S25/S28). Both hands belong in front of the body when they rest on it. */
  farFront: number;
  sway: number; // secondary motion: how far loose things (the hood's drawstrings) swing, degrees-ish
  glint?: number; // 0..1 the eyes light up in the power's colour (set it after poseAt: it isn't interpolated)
  glintColor?: string;
};

export const basePose: Pose = {
  x: 960,
  y: 700,
  scale: 1,
  facing: 1,
  tilt: 0,
  spin: 0,
  headTilt: 0,
  armL: { a: 10, b: -8 },
  armR: { a: 10, b: -8 },
  legL: { a: 5, b: 0 },
  legR: { a: -5, b: 0 },
  expr: 'neutral',
  blink: 0,
  look: 0,
  lookY: 0,
  talk: 0,
  glasses: 0,
  yaw: 0,
  squash: 0,
  handL: 'open',
  handR: 'open',
  armFront: 0,
  farFront: 0,
  sway: 0,
};

type Key = { f: number; p: Partial<Pose>; ease?: (t: number) => number };

const mixLimb = (a: Limb, b: Limb, t: number): Limb => ({ a: lerp(a.a, b.a, t), b: lerp(a.b, b.b, t) });

/** Interpolates every numeric part of a pose between keys; the face swaps (never morphs) at its key. */
export const poseAt = (f: number, keys: Key[], from: Pose = basePose): Pose => {
  // resolve each key into a full pose, carrying values forward
  const full: { f: number; p: Pose; ease?: (t: number) => number }[] = [];
  let cur = from;
  for (const k of keys) {
    cur = { ...cur, ...k.p };
    full.push({ f: k.f, p: cur, ease: k.ease });
  }
  if (f <= full[0].f) return full[0].p;
  for (let i = 0; i < full.length - 1; i++) {
    const A = full[i];
    const B = full[i + 1];
    if (f <= B.f) {
      const t = (B.ease ?? easeInOut)((f - A.f) / Math.max(1e-6, B.f - A.f));
      return {
        x: lerp(A.p.x, B.p.x, t),
        y: lerp(A.p.y, B.p.y, t),
        scale: lerp(A.p.scale, B.p.scale, t),
        facing: t < 0.5 ? A.p.facing : B.p.facing,
        tilt: lerp(A.p.tilt, B.p.tilt, t),
        spin: lerp(A.p.spin, B.p.spin, t),
        headTilt: lerp(A.p.headTilt, B.p.headTilt, t),
        armL: mixLimb(A.p.armL, B.p.armL, t),
        armR: mixLimb(A.p.armR, B.p.armR, t),
        legL: mixLimb(A.p.legL, B.p.legL, t),
        legR: mixLimb(A.p.legR, B.p.legR, t),
        expr: A.p.expr, // a face swaps when its own key lands, so hold the earlier one
        handL: A.p.handL,
        handR: A.p.handR,
        blink: lerp(A.p.blink, B.p.blink, t),
        look: lerp(A.p.look, B.p.look, t),
        lookY: lerp(A.p.lookY, B.p.lookY, t),
        talk: lerp(A.p.talk, B.p.talk, t),
        glasses: lerp(A.p.glasses, B.p.glasses, t),
        yaw: lerp(A.p.yaw, B.p.yaw, t),
        squash: lerp(A.p.squash, B.p.squash, t),
        armFront: lerp(A.p.armFront, B.p.armFront, t),
        farFront: lerp(A.p.farFront, B.p.farFront, t),
        sway: lerp(A.p.sway, B.p.sway, t),
      };
    }
  }
  return full[full.length - 1].p;
};

// body measurements (local space: hips at 0,0, y down)
const UPPER_ARM = 62;
const FORE_ARM = 58;
const THIGH = 72;
const SHIN = 68;
const SHOULDER = { x: 42, y: -108 };
const HIP = { x: 17, y: 0 };
export const HEAD = { x: 0, y: -176, r: 62 };
export const LEG_LEN = THIGH + SHIN;

const rad = (d: number) => (d * Math.PI) / 180;
type P = { x: number; y: number };
const rot = (p: P, deg: number, c: P = { x: 0, y: 0 }): P => {
  const r = rad(deg);
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  return { x: c.x + dx * Math.cos(r) - dy * Math.sin(r), y: c.y + dx * Math.sin(r) + dy * Math.cos(r) };
};

/** Joint positions in local space (before the hip translate/scale), so scenes can attach props to hands. */
export const joints = (pose: Pose) => {
  const side = (s: 1 | -1, limb: Limb, root: P, l1: number, l2: number, isLeg: boolean) => {
    // arms swing outward (away from the body) on their own side; legs swing forward in the facing direction
    const dir = isLeg ? pose.facing : s;
    const d1 = { x: dir * Math.sin(rad(limb.a)), y: Math.cos(rad(limb.a)) };
    const mid = { x: root.x + d1.x * l1, y: root.y + d1.y * l1 };
    const a2 = limb.a + limb.b;
    const d2 = { x: dir * Math.sin(rad(a2)), y: Math.cos(rad(a2)) };
    return { root, mid, end: { x: mid.x + d2.x * l2, y: mid.y + d2.y * l2 } };
  };
  const torsoRot = (p: P) => rot(p, pose.tilt);
  const sp = limbSpread(pose.yaw);
  const shL = { x: -SHOULDER.x * sp + pose.yaw * 6, y: SHOULDER.y };
  const shR = { x: SHOULDER.x * sp + pose.yaw * 6, y: SHOULDER.y };
  const armL = side(-1, pose.armL, shL, UPPER_ARM, FORE_ARM, false);
  const armR = side(1, pose.armR, shR, UPPER_ARM, FORE_ARM, false);
  const legL = side(-1, pose.legL, { x: -HIP.x * sp, y: 0 }, THIGH, SHIN, true);
  const legR = side(1, pose.legR, { x: HIP.x * sp, y: 0 }, THIGH, SHIN, true);
  const r = (o: { root: P; mid: P; end: P }) => ({ root: torsoRot(o.root), mid: torsoRot(o.mid), end: torsoRot(o.end) });
  return { armL: r(armL), armR: r(armR), legL, legR, head: torsoRot(HEAD) };
};

/** How wide the body reads as it turns: full width face-on, about 60% in profile. */
export const turnWidth = (yaw: number) => 1 - 0.4 * Math.min(1, Math.abs(yaw));
/** Shoulders and hips close up as he turns, so in profile the limbs overlap the body. */
export const limbSpread = (yaw: number) => 1 - 0.85 * Math.min(1, Math.abs(yaw));

/** Face swaps happen through a blink: two frames shut either side of each change, as in the genre. */
export const faceAt = (f: number, keys: [number, Expr][]): { expr: Expr; blink: number } => {
  let expr = keys[0][1];
  let blink = 0;
  for (let i = 0; i < keys.length; i++) {
    const [k, e] = keys[i];
    if (f >= k) expr = e;
    if (i > 0 && f >= k - 2 && f < k + 1) blink = 1;
  }
  return { expr, blink };
};

/** A local point to world space, for attaching props (the mug in Pip's hand). */
export const toWorld = (pose: Pose, p: P): P => {
  const spun = rot(p, pose.spin, { x: 0, y: -90 });
  return { x: pose.x + spun.x * pose.scale, y: pose.y + spun.y * pose.scale };
};

/** Straight-arm reach: the right arm angle (local) that points the hand at a world target. */
export const reachAngle = (pose: Pose, target: P) => {
  const sh = toWorld(pose, rot({ x: SHOULDER.x * limbSpread(pose.yaw) + pose.yaw * 6, y: SHOULDER.y }, pose.tilt));
  const world = (Math.atan2(target.x - sh.x, target.y - sh.y) * 180) / Math.PI; // 0 = straight down
  return world - pose.tilt;
};

/**
 * Two-bone IK: the arm's own {a, b} for a wrist placed at a world target. The elbow is solved from the real
 * segment lengths (62 / 58), so a hand at the mouth folds at the chest and the sleeve still leaves the correct
 * shoulder — an overlay hand at the same spot was the "terceiro braço" the director saw: two arms hanging and
 * a third one drawn over the face. `elbow` picks the branch (1 = the elbow folds down in front of the chest,
 * -1 = up beside the head; the first one is the human one for a hand raised to the face).
 */
export const armIK = (pose: Pose, side: 1 | -1, target: P, elbow: 1 | -1 = 1, rootY: number = SHOULDER.y): Limb => {
  // world -> the arm's own local frame: undo translate/scale/spin, then the torso tilt
  const un = rot({ x: (target.x - pose.x) / pose.scale, y: (target.y - pose.y) / pose.scale }, -pose.spin, { x: 0, y: -90 });
  const local = rot(un, -pose.tilt);
  const sp = limbSpread(pose.yaw);
  const root = { x: side * SHOULDER.x * sp + pose.yaw * 6, y: rootY };
  const vx = local.x - root.x;
  const vy = local.y - root.y;
  const D = Math.min(UPPER_ARM + FORE_ARM - 0.5, Math.max(4, Math.hypot(vx, vy)));
  const th = Math.atan2(side * vx, vy); // 0 = straight down, same convention as Limb.a
  const ca = Math.min(1, Math.max(-1, (UPPER_ARM * UPPER_ARM + D * D - FORE_ARM * FORE_ARM) / (2 * UPPER_ARM * D)));
  const a1 = th + elbow * Math.acos(ca);
  const mid = { x: root.x + side * Math.sin(a1) * UPPER_ARM, y: root.y + Math.cos(a1) * UPPER_ARM };
  // the reachable point along the target's own ray (equals the target when it is inside the arm's range)
  const tx = root.x + side * Math.sin(th) * D;
  const ty = root.y + Math.cos(th) * D;
  const a2 = Math.atan2(side * (tx - mid.x), ty - mid.y);
  const deg = (r: number) => (r * 180) / Math.PI;
  return { a: deg(a1), b: deg(a2) - deg(a1) };
};

/** Where the mouth is, in world space, for a pose (the head tilts, and the mouth goes with it). */
export const mouthPoint = (pose: Pose): P => {
  const m = rot({ x: 0, y: HEAD.y + 26 }, pose.headTilt, { x: 0, y: HEAD.y + 40 });
  return toWorld(pose, rot(m, pose.tilt));
};

const Face: React.FC<{ expr: Expr; blink: number; look: number; lookY?: number; talk?: number; viseme?: Pose["viseme"]; glasses: number; yaw?: number; ink?: string; glint?: number; glintColor?: string; mute?: boolean }> = ({ expr, blink, look, lookY = 0, talk = 0, viseme, glasses, yaw = 0, ink = C.ink, glint = 0, glintColor = '#8FF0FF', mute = false }) => {
  const ex = look * 7;
  const ay = Math.min(1, Math.abs(yaw));
  // A turned head COMPRESSES the face; it does not slide it sideways. The old transform was translate(yaw*30)
  // scale(1-0.28|yaw|) and, at the dealer's yaw of -0.78, it pushed the eye pair to -40 on a 62-radius head and
  // then hid the far eye: one eye pinned to the left contour of a blank white oval. That is a rig bug, not a pose.
  // Now the face narrows around the head's own centre, drifts a little, and keeps both eyes until true profile.
  const farHidden = ay > 0.9;
  const farSide = yaw > 0 ? -1 : 1; // facing screen-right hides the screen-left eye
  const faceK = 1 - 0.42 * ay;
  const faceX = yaw * 13;
  const eyeY = HEAD.y - 4;
  // heavy lids: half shut when smug or cool, more than half when tired (with dark rings under the eyes)
  const lid =
    expr === 'smug' || expr === 'cool' || expr === 'greedy' || expr === 'suspicious' ? 0.45
    : expr === 'tired' ? 0.58
    : expr === 'cold' ? 0.35
    : 0;
  const open = Math.max(0.08, 1 - Math.max(blink, lid));
  const eye = (cx: number) => {
    if (farHidden && Math.sign(cx) === farSide) return null;
    if (expr === 'happy' || expr === 'laugh') return <path d={`M ${cx - 10} ${eyeY + 3} Q ${cx} ${eyeY - 9} ${cx + 10} ${eyeY + 3}`} stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />;
    // grief squeezes the eyes: the crease closes inward, steeper than a blink
    if (expr === 'devastated') return <path d={`M ${cx - 13} ${eyeY - 1} Q ${cx} ${eyeY + 9} ${cx + 9} ${eyeY - 3}`} stroke={ink} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    if (expr === 'oops') return <path d={`M ${cx - 9} ${eyeY - 6} L ${cx + 4} ${eyeY} L ${cx - 9} ${eyeY + 6}`} transform={cx > 0 ? `translate(${2 * cx},0) scale(-1,1)` : undefined} stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    if (expr === 'dizzy') return <g stroke={ink} strokeWidth={5} strokeLinecap="round"><path d={`M ${cx - 7} ${eyeY - 7} L ${cx + 7} ${eyeY + 7} M ${cx + 7} ${eyeY - 7} L ${cx - 7} ${eyeY + 7}`} /></g>;
    // shut (a blink's middle frame, or asleep): the closed lid's curve, with the tired rings kept
    if (blink >= 0.95)
      return (
        <g>
          <path d={`M ${cx - 12} ${eyeY + 1} Q ${cx} ${eyeY + 8} ${cx + 12} ${eyeY + 1}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />
          {expr === 'tired' ? <path d={`M ${cx - 12} ${eyeY + 15} Q ${cx} ${eyeY + 22} ${cx + 12} ${eyeY + 15}`} stroke="#8C7AA6" strokeWidth={4.5} fill="none" strokeLinecap="round" opacity={0.85} /> : null}
        </g>
      );
    const big = expr === 'shock' || expr === 'euphoric' || expr === 'panic';
    const far = Math.sign(cx) === farSide;
    // the far eye narrows with the turn, so a 3/4 face keeps two eyes and still reads as turned
    const rx = (big ? 11 : 7) * (far ? 1 - 0.5 * ay : 1);
    const ry = (big ? 13 : 10) * open;
    return (
      <g>
        <ellipse cx={cx + ex} cy={eyeY + (lid ? 3 : 0)} rx={rx} ry={ry} fill={ink} />
        {big && open > 0.5 ? <circle cx={cx + ex + 3.5} cy={eyeY - 4} r={3.4} fill="#fff" /> : null}
        {lid ? <path d={expr === 'tired' ? `M ${cx - 13} ${eyeY - 1} Q ${cx} ${eyeY - 5} ${cx + 13} ${eyeY - 1}` : `M ${cx - 12} ${eyeY - 4} L ${cx + 12} ${eyeY - 2}`} stroke={ink} strokeWidth={4} strokeLinecap="round" fill="none" /> : null}
        {expr === 'tired' ? <path d={`M ${cx - 12} ${eyeY + 14} Q ${cx} ${eyeY + 21} ${cx + 12} ${eyeY + 14}`} stroke="#8C7AA6" strokeWidth={4.5} fill="none" strokeLinecap="round" opacity={0.85} /> : null}
      </g>
    );
  };
  const brows: Record<Expr, string> = {
    neutral: '',
    happy: '',
    smug: `M -34 ${eyeY - 22} L -12 ${eyeY - 20} M 12 ${eyeY - 26} L 34 ${eyeY - 30}`,
    shock: `M -32 ${eyeY - 28} Q -21 ${eyeY - 36} -10 ${eyeY - 29} M 10 ${eyeY - 29} Q 21 ${eyeY - 36} 32 ${eyeY - 28}`,
    worried: `M -32 ${eyeY - 18} L -12 ${eyeY - 26} M 12 ${eyeY - 26} L 32 ${eyeY - 18}`,
    oops: `M -32 ${eyeY - 20} L -12 ${eyeY - 16} M 12 ${eyeY - 16} L 32 ${eyeY - 20}`,
    cool: '',
    dizzy: '',
    tired: `M -33 ${eyeY - 17} Q -22 ${eyeY - 21} -11 ${eyeY - 19} M 11 ${eyeY - 19} Q 22 ${eyeY - 21} 33 ${eyeY - 17}`,
    laugh: '',
    euphoric: `M -32 ${eyeY - 30} Q -21 ${eyeY - 40} -10 ${eyeY - 32} M 10 ${eyeY - 32} Q 21 ${eyeY - 40} 32 ${eyeY - 30}`,
    greedy: `M -33 ${eyeY - 22} Q -22 ${eyeY - 29} -12 ${eyeY - 26} M 12 ${eyeY - 26} Q 22 ${eyeY - 29} 33 ${eyeY - 22}`,
    devastated: `M -34 ${eyeY - 12} Q -22 ${eyeY - 28} -10 ${eyeY - 24} M 10 ${eyeY - 24} Q 22 ${eyeY - 28} 34 ${eyeY - 12}`,
    panic: `M -32 ${eyeY - 30} Q -21 ${eyeY - 38} -10 ${eyeY - 31} M 10 ${eyeY - 31} Q 21 ${eyeY - 38} 32 ${eyeY - 30}`,
    suspicious: `M -33 ${eyeY - 18} L -12 ${eyeY - 18} M 12 ${eyeY - 18} L 33 ${eyeY - 18}`,
    cold: `M -33 ${eyeY - 18} L -12 ${eyeY - 19} M 12 ${eyeY - 19} L 33 ${eyeY - 18}`,
    determined: `M -33 ${eyeY - 24} L -12 ${eyeY - 15} M 12 ${eyeY - 15} L 33 ${eyeY - 24}`,
  };
  const mY = HEAD.y + 28;
  const mouth: Record<Expr, React.ReactNode> = {
    neutral: <path d={`M -10 ${mY} Q 0 ${mY + 4} 10 ${mY}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    happy: <path d={`M -18 ${mY - 4} Q 0 ${mY + 20} 18 ${mY - 4} Z`} fill={ink} />,
    smug: <path d={`M -12 ${mY + 2} Q 4 ${mY + 8} 16 ${mY - 6}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    shock: <ellipse cx={0} cy={mY + 4} rx={10} ry={14} fill={ink} />,
    worried: <path d={`M -16 ${mY + 4} Q -8 ${mY - 4} 0 ${mY + 4} Q 8 ${mY + 12} 16 ${mY + 4}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    oops: <g><rect x={-18} y={mY - 6} width={36} height={16} rx={6} fill={ink} /><path d={`M -14 ${mY + 2} L 14 ${mY + 2}`} stroke="#fff" strokeWidth={3} /></g>,
    cool: <path d={`M -12 ${mY + 2} Q 4 ${mY + 8} 16 ${mY - 6}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    dizzy: <path d={`M -14 ${mY + 4} Q -7 ${mY - 4} 0 ${mY + 4} Q 7 ${mY + 12} 14 ${mY + 4}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    tired: <path d={`M -11 ${mY + 4} Q 0 ${mY} 11 ${mY + 4}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    laugh: (
      <g>
        <path d={`M -22 ${mY - 8} Q 0 ${mY + 24} 22 ${mY - 8} Z`} fill={ink} />
        <path d={`M -13 ${mY - 2} Q 0 ${mY + 7} 13 ${mY - 2}`} stroke="#FFF" strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
    ),
    euphoric: (
      <g>
        <path d={`M -24 ${mY - 10} Q 0 ${mY + 28} 24 ${mY - 10} Z`} fill={ink} />
        <path d={`M -14 ${mY - 3} Q 0 ${mY + 8} 14 ${mY - 3}`} stroke="#FFF" strokeWidth={4.5} fill="none" strokeLinecap="round" />
      </g>
    ),
    greedy: (
      <g>
        <path d={`M -13 ${mY + 2} Q 4 ${mY + 10} 18 ${mY - 6}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d={`M 2 ${mY + 6} Q 7 ${mY + 12} 11 ${mY + 5} Z`} fill="#B4565A" opacity={0.9} />
      </g>
    ),
    devastated: <path d={`M -17 ${mY + 2} Q -9 ${mY - 5} 0 ${mY + 3} Q 9 ${mY + 10} 17 ${mY + 2}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    // Panic is a scream, not a grin. The first version was wider than it was tall (38 × 25) and, at thumbnail
    // size, read as a smile during despair — the one thing the brief forbids. Tall and narrow with the teeth
    // line high in the mouth: the shape can only be an open shout.
    panic: (
      <g>
        <path d={`M -14 ${mY - 9} Q 0 ${mY - 17} 14 ${mY - 9} L 10 ${mY + 20} Q 0 ${mY + 30} -10 ${mY + 20} Z`} fill={ink} />
        <path d={`M -9 ${mY + 2} Q 0 ${mY - 3} 9 ${mY + 2}`} stroke="#FFF" strokeWidth={4} strokeLinecap="round" fill="none" />
      </g>
    ),
    suspicious: <path d={`M -13 ${mY + 2} L 13 ${mY + 2}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    cold: <path d={`M -11 ${mY + 3} L 11 ${mY + 3}`} stroke={ink} strokeWidth={4.5} fill="none" strokeLinecap="round" />,
    determined: <path d={`M -12 ${mY + 2} L 12 ${mY + 2}`} stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />,
  };
  return (
    <g transform={`translate(${faceX} 0) scale(${faceK} 1)`}>
      {/* The pupils move inside the face while the brows hold: looking down at the felt, the chips or his own
          hand is acting, and a head tilt alone reads as a nod, not as a gaze. */}
      <g transform={`translate(0 ${lookY * 6})`}>
        {eye(-21)}
        {eye(21)}
      </g>
      {brows[expr] ? <path d={brows[expr]} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
      {/* A palm drawn in front of the face hides the mouth: drawing it anyway left a dark stub of lip poking out
          past the hand's edge at the whisper and the hidden smile (the eighth-pass audit: "traço preto solto",
          "arco preto acima do objeto"). Nothing behind a hand needs to exist. */}
      {mute
        ? null
         : viseme === 'rest' ? mouth[expr] : talk > 0.06 && viseme
          ? <g data-viseme={viseme}>{viseme==='MBP'?<path d={`M-11 ${mY+4}Q0 ${mY+6}11 ${mY+4}`}stroke={ink}strokeWidth={3.6}fill="none"strokeLinecap="round"/>:viseme==='FV'?<><path d={`M-11 ${mY+2}Q0 ${mY+8}11 ${mY+2}`}stroke={ink}strokeWidth={4}fill="none"/><path d={`M-7 ${mY+2}H7`}stroke="#F6EFE3"strokeWidth={2}/></>:<><ellipse cx={0}cy={mY+5}rx={viseme==='O'?6:viseme==='E'?12:10}ry={viseme==='O'?3+talk*6:viseme==='E'?2+talk*3:3+talk*8}fill={ink}/>{viseme==='E'?<path d={`M-7 ${mY+2}H7`}stroke="#F6EFE3"strokeWidth={2}/>:null}</>}</g>
        : talk > 0.06
          ? (
            <g>
              {/* speaking mouth: an opening whose height follows the voice envelope; the brows and lids keep the
                  expression, which is what separates "talking" from "a face swapped for an O" */}
              <path
                d={`M ${-10 - 2 * talk} ${mY + 1} Q 0 ${mY - 3} ${10 + 2 * talk} ${mY + 1}
                    Q ${8 + 2 * talk} ${mY + 4 + 12 * talk} 0 ${mY + 5 + 12 * talk}
                    Q ${-8 - 2 * talk} ${mY + 4 + 12 * talk} ${-10 - 2 * talk} ${mY + 1} Z`}
                fill={ink}
              />
              {talk > 0.55 ? <path d={`M -6 ${mY + 2} Q 0 ${mY - 1} 6 ${mY + 2}`} stroke="#F6EFE3" strokeWidth={2.6} fill="none" strokeLinecap="round" /> : null}
            </g>
          )
          : mouth[expr]}
      {expr === 'shock' || expr === 'oops' ? <path d={`M 52 ${HEAD.y - 30} q 6 10 0 16 q -6 -6 0 -16 Z`} fill="#8FD3FF" /> : null}
      {/* a power lighting the eyes: a soft halo, a bright iris, a white catchlight (none while the lids are shut) */}
      {glint > 0.01 && blink < 0.95
        ? [-21, 21].map((cx) =>
            farHidden && Math.sign(cx) === farSide ? null : (
              <g key={`gl${cx}`} opacity={Math.min(1, glint)}>
                <circle cx={cx + ex} cy={eyeY} r={17} fill={glintColor} opacity={0.2} />
                <circle cx={cx + ex} cy={eyeY} r={12} fill={glintColor} opacity={0.28} />
                <ellipse cx={cx + ex} cy={eyeY + (lid ? 3 : 0)} rx={8} ry={Math.max(2, 11 * open)} fill={glintColor} />
                <circle cx={cx + ex + 2.5} cy={eyeY - 3} r={2.6} fill="#FFFFFF" />
              </g>
            ),
          )
        : null}
      {glasses > 0.01 ? (
        <g opacity={glasses} transform={`translate(0 ${(1 - glasses) * -60})`}>
          {/* classic shades: a full bar across, two big lenses, one bright glint so it reads at feed size */}
          <path d={`M -58 ${eyeY - 12} L 58 ${eyeY - 12}`} stroke={ink} strokeWidth={6} strokeLinecap="round" />
          <path d={`M -50 ${eyeY - 14} L -6 ${eyeY - 14} L -10 ${eyeY + 8} Q -28 ${eyeY + 18} -46 ${eyeY + 8} Z`} fill="#0D0F1C" stroke={ink} strokeWidth={3} />
          <path d={`M 6 ${eyeY - 14} L 50 ${eyeY - 14} L 46 ${eyeY + 8} Q 28 ${eyeY + 18} 10 ${eyeY + 8} Z`} fill="#0D0F1C" stroke={ink} strokeWidth={3} />
          <path d={`M -40 ${eyeY + 2} L -26 ${eyeY - 10} M 16 ${eyeY + 2} L 30 ${eyeY - 10}`} stroke="#ffffff" strokeWidth={4} strokeLinecap="round" opacity={0.85} />
        </g>
      ) : null}
    </g>
  );
};

export const Hero: React.FC<{ pose: Pose; shadow?: number; rimId?: string; look?: Look }> = ({ pose, shadow = 1, rimId = 'rimR', look = LOOKS.pipHood }) => {
  const j = joints(pose);
  const L = look;
  // limbs are light with a dark outline, so they read on the dark sets (navy limbs vanished on navy walls)
  const sleeve = L.sleeve ?? L.limb;
  const limb = (o: { root: P; mid: P; end: P }, w: number, front = false, color: string = L.limb) => {
    const d = `M ${o.root.x} ${o.root.y} L ${o.mid.x} ${o.mid.y} L ${o.end.x} ${o.end.y}`;
    return (
      <g>
        {/* a raised arm is drawn over the jacket, and a dark sleeve on a dark body has no edge: the front arm
            carries a lighter outline. No warm line along it: at a close-up the round cap at the shoulder plus
            that line read as the gold lining of a sleeve that ended in mid-air (the eighth pass). */}
        <path d={d} stroke={front ? '#5D5878' : L.line} strokeWidth={w + 7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* the raised sleeve is the same navy as the hood behind it, so at the whisper's close-up it read as a
            hollow tube: two grey-violet borders around a navy core (the eighth-pass audit's "faixa oca"). A thin
            white veil lights the sleeve where it leaves the body, and the band becomes an object. */}
        {front ? <path d={d} stroke="#FFFFFF" strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.16} /> : null}
      </g>
    );
  };
  const shoe = (o: { root: P; mid: P; end: P }) => (
    <ellipse cx={o.end.x + pose.facing * 9} cy={o.end.y + 4} rx={22} ry={11} fill={L.shoe} stroke={L.line} strokeWidth={4} />
  );
  // A raised arm drawn whole after the head shows its round root cap sitting on the jacket — at the whisper's
  // close-up that cap read as a cuff floating at the chest. Split at the elbow instead: the upper segment goes
  // under the hood (which is drawn after it), the forearm and hand over the face. The two round caps meet at the
  // elbow with the same width, so the seam is invisible.
  const upperArm = (o: { root: P; mid: P }, front: boolean) => limb({ root: o.root, mid: o.mid, end: o.mid }, 11, front, sleeve);
  const foreArm = (o: { mid: P; end: P }, front: boolean) => limb({ root: o.mid, mid: o.mid, end: o.end }, 11, front, sleeve);
  // A hand is ONE silhouette with its fingers in it — never a ring for a thumb. The old hand drew the thumb as a
  // separate stroked ellipse; at the whisper's 2,5× close-up that ring sat beside a smooth pale blob over the mouth
  // and the pair read as a mug: white body, black handle with a white hole, dark rim over the lips (the eighth-pass
  // audit). Here the thumb is a bump in the outline and three fingertips break the far edge, so no hole exists and
  // the shape can only read as a hand. `side` mirrors it so the thumb faces the body; the palm over the mouth is
  // drawn full size, a hanging hand is smaller.
  const hand = (o: { mid: P; end: P }, side: 1 | -1, kind: HandKind) => {
    const ang = (Math.atan2(o.end.x - o.mid.x, o.end.y - o.mid.y) * 180) / Math.PI;
    const mitten = (k: number) => (
      <g transform={`scale(${side * k} ${k})`}>
        <path d="M -17 0 Q -20 10 -17 18 L -15 26 Q -15 34 -10 36 Q -7 32 -6 29 Q -3 34 2 37 Q 5 32 7 29 Q 9 31 12 33 Q 19 27 20 19 Q 21 11 17 4 Q 10 -3 0 -4 Q -10 -3 -17 0 Z"
              fill={L.hand} stroke={L.line} strokeWidth={4} strokeLinejoin="round" />
        <path d="M -7 22 L -7 27 M -1 23 L -1 28 M 5 22 L 5 27" stroke={L.line} strokeWidth={1.6} opacity={0.25} strokeLinecap="round" />
      </g>
    );
    return (
      <g transform={`translate(${o.end.x} ${o.end.y}) rotate(${-ang})`}>
        {kind === 'palm' ? mitten(1) : kind === 'point' ? (
          <g>
            <rect x={-4} y={10} width={8} height={24} rx={4} fill={L.hand} stroke={L.line} strokeWidth={3.5} />
            <path d="M -11 -2 Q -14 14 -6 18 L 7 18 Q 14 14 11 -2 Z" fill={L.hand} stroke={L.line} strokeWidth={4} strokeLinejoin="round" />
            <ellipse cx={side * 10} cy={6} rx={4.5} ry={7} fill={L.hand} stroke={L.line} strokeWidth={3.5} />
          </g>
        ) : mitten(0.75)}
      </g>
    );
  };
  const kw = turnWidth(pose.yaw) * (L.bulk ?? 1);
  const torso = (
    <g transform={`rotate(${pose.tilt}) translate(${pose.yaw * 6} 0) scale(${kw} 1)`}>
      <path d="M -46 -112 Q 0 -124 46 -112 L 40 2 Q 0 12 -40 2 Z" fill={L.jacket} stroke={L.line} strokeWidth={4} strokeLinejoin="round" />
      <path d="M 10 -116 Q 30 -114 46 -112 L 40 2 Q 26 8 12 9 Z" fill={L.jacketShade} opacity={0.55} />
      <path d="M 0 -112 L 0 4" stroke={L.jacketShade} strokeWidth={4} />
      {L.extra === 'suit' || L.extra === 'dealer' || L.extra === 'staff' || L.extra === 'security' || L.extra === 'coat' ? (
        // the formal torso: an open jacket with a shirt in the V, and one badge per job
        <g>
          <path d="M -24 -116 L 0 -54 L 24 -116 Z"
                fill={L.extra === 'security' ? L.jacketShade : L.extra === 'coat' ? '#2B2F39' : '#EDE8DE'} />
          {L.extra === 'suit' ? (
            <path d="M -7 -112 L 7 -112 L 9 -100 L 5 -64 L 0 -56 L -5 -64 L -9 -100 Z" fill={L.accent} />
          ) : null}
          {L.extra === 'dealer' ? (
            // a bow tie: the one piece that says croupier at any distance
            <g>
              <path d="M -4 -110 L -22 -118 L -22 -94 Z" fill={L.accent} stroke={L.line} strokeWidth={3} strokeLinejoin="round" />
              <path d="M 4 -110 L 22 -118 L 22 -94 Z" fill={L.accent} stroke={L.line} strokeWidth={3} strokeLinejoin="round" />
              <rect x={-5} y={-112} width={10} height={12} rx={3} fill={L.accent} stroke={L.line} strokeWidth={2.5} />
            </g>
          ) : null}
          {L.extra === 'staff' ? (
            // a waistcoat button and a folded cloth over the forearm side
            <g>
              <circle cx={0} cy={-74} r={3} fill={L.line} opacity={0.55} />
              <circle cx={0} cy={-92} r={3} fill={L.line} opacity={0.55} />
            </g>
          ) : null}
          {L.extra === 'security' ? (
            // a radio clipped at the shoulder with its cord: staff, not menace
            <g>
              <path d="M 38 -114 Q 46 -78 30 -60" stroke={L.line} strokeWidth={3} fill="none" opacity={0.75} />
              <rect x={22} y={-122} width={15} height={21} rx={6} fill={L.jacketShade} stroke={L.line} strokeWidth={2.5} />
              <circle cx={30} cy={-58} r={4.5} fill={L.line} opacity={0.85} />
            </g>
          ) : null}
          <path d="M -26 -116 L 0 -54 M 26 -116 L 0 -54" stroke={L.line} strokeWidth={4} />
          {L.extra === 'coat' ? (
            // the overcoat: a notched lapel and a skirt that falls over the hips — the silhouette that separates
            // him from every jacket in the room without a single villain prop
            <g>
              <path d="M -44 -114 L -18 -88 L -34 -80 M 44 -114 L 18 -88 L 34 -80" fill="none" stroke={L.jacketShade} strokeWidth={3.5} strokeLinejoin="round" />
              <path d="M -50 2 Q 0 16 50 2 L 58 84 Q 0 98 -58 84 Z" fill={L.jacket} stroke={L.line} strokeWidth={4} strokeLinejoin="round" />
              <path d="M 0 14 L 0 92" stroke={L.line} strokeWidth={3} opacity={0.5} />
              <path d="M -58 84 Q 0 98 58 84" fill="none" stroke={L.jacketShade} strokeWidth={3} opacity={0.6} />
            </g>
          ) : null}
          {L.apron ? (
            <g>
              <path d="M -30 -74 L 30 -74 L 36 6 L -36 6 Z" fill="#DCD5C4" stroke={L.line} strokeWidth={3} strokeLinejoin="round" />
              <path d="M -30 -74 L 30 -74" stroke={L.line} strokeWidth={3} opacity={0.5} />
              <path d="M 0 -28 L 0 4" stroke={L.line} strokeWidth={2} opacity={0.26} />
            </g>
          ) : null}
        </g>
      ) : (
        <path d="M -22 -118 Q 0 -100 22 -118" stroke={L.accent} strokeWidth={6} fill="none" strokeLinecap="round" />
      )}
    </g>
  );
  const head = (
    <g transform={`rotate(${pose.tilt}) rotate(${pose.headTilt} 0 ${HEAD.y + 40})`}>
      {/* hair with a mass behind the skull is drawn first, so the face stays clear */}
      {L.extra === 'ponytail' ? (
        <g transform={`rotate(${pose.sway * 0.6 - pose.tilt * 0.5} ${-pose.yaw * 12} ${HEAD.y - 40})`}>
          <path
            transform={`translate(${-pose.yaw * 12} 0)`}
            d={`M -4 ${HEAD.y - 52} Q 66 ${HEAD.y - 44} 68 ${HEAD.y + 26} Q 68 ${HEAD.y + 74} 46 ${HEAD.y + 86} Q 40 ${HEAD.y + 64} 48 ${HEAD.y + 30} Q 50 ${HEAD.y - 24} -10 ${HEAD.y - 40} Z`}
            fill={L.hair} stroke={L.line} strokeWidth={3.5} strokeLinejoin="round"
          />
        </g>
      ) : null}
      {L.extra === 'longhair' ? (
        <path
          transform={`translate(${-pose.yaw * 10} 0)`}
          d={`M -74 ${HEAD.y + 66} Q -86 ${HEAD.y - 40} 0 ${HEAD.y - 76} Q 86 ${HEAD.y - 40} 74 ${HEAD.y + 66} Q 58 ${HEAD.y + 54} 52 ${HEAD.y + 10} Q 20 ${HEAD.y - 30} -40 ${HEAD.y - 16} Q -54 ${HEAD.y + 20} -56 ${HEAD.y + 56} Z`}
          fill={L.hair} stroke={L.line} strokeWidth={4} strokeLinejoin="round"
        />
      ) : null}
      <circle cx={HEAD.x} cy={HEAD.y} r={HEAD.r} fill={L.skin} stroke={L.line} strokeWidth={4} />
      <path d={`M ${HEAD.x + 14} ${HEAD.y + 58} A ${HEAD.r} ${HEAD.r} 0 0 0 ${HEAD.x + 60} ${HEAD.y + 14} A 70 70 0 0 1 ${HEAD.x + 14} ${HEAD.y + 58} Z`} fill={L.skinShade} />
      {L.extra === 'bunches' || L.extra === 'bob' || L.extra === 'suit' || L.extra === 'coat' || L.extra === 'fringe' ? null : (
        <path transform={`translate(${-pose.yaw * 16} 0)`} d={`M -6 ${HEAD.y - 60} q 10 -26 30 -18 q -16 2 -14 16 q -8 -10 -16 2 Z`} fill={L.hair} />
      )}
      {L.extra === 'bunches' ? (
        // a fringe cap and two bunches tied with coral bands; the bunches swing a little with sway
        <g>
          {[-1, 1].map((sd) => (
            <g key={sd} transform={`rotate(${pose.sway * 0.5} ${sd * 58} ${HEAD.y - 30})`}>
              <circle cx={sd * 72 - pose.yaw * 10} cy={HEAD.y - 24} r={24} fill={L.hair} stroke={L.line} strokeWidth={4} />
              <circle cx={sd * 55 - pose.yaw * 10} cy={HEAD.y - 30} r={8} fill={L.accent} />
            </g>
          ))}
          <path transform={`translate(${-pose.yaw * 14} 0)`} d={`M -60 ${HEAD.y - 22} Q -62 ${HEAD.y - 66} 0 ${HEAD.y - 66} Q 62 ${HEAD.y - 66} 60 ${HEAD.y - 22} Q 40 ${HEAD.y - 46} 14 ${HEAD.y - 40} Q 0 ${HEAD.y - 50} -14 ${HEAD.y - 40} Q -40 ${HEAD.y - 46} -60 ${HEAD.y - 22} Z`} fill={L.hair} />
        </g>
      ) : null}
      {L.extra === 'bob' ? (
        // a chin-length bob framing the face, a side parting
        <path
          transform={`translate(${-pose.yaw * 12} 0)`}
          d={`M -74 ${HEAD.y + 34} Q -84 ${HEAD.y - 70} 0 ${HEAD.y - 72} Q 84 ${HEAD.y - 70} 74 ${HEAD.y + 34} L 56 ${HEAD.y + 34} Q 60 ${HEAD.y - 20} 40 ${HEAD.y - 40} Q 10 ${HEAD.y - 34} -16 ${HEAD.y - 48} Q -52 ${HEAD.y - 30} -56 ${HEAD.y + 34} Z`}
          fill={L.hair}
          stroke={L.line}
          strokeWidth={4}
          strokeLinejoin="round"
        />
      ) : null}
      {L.extra === 'suit' || L.extra === 'dealer' ? (
        // short combed-back hair with a hard side parting
        <path transform={`translate(${-pose.yaw * 14} 0)`} d={`M -60 ${HEAD.y - 18} Q -64 ${HEAD.y - 70} 4 ${HEAD.y - 68} Q 64 ${HEAD.y - 64} 60 ${HEAD.y - 18} Q 52 ${HEAD.y - 44} 18 ${HEAD.y - 46} L 12 ${HEAD.y - 54} L 6 ${HEAD.y - 46} Q -44 ${HEAD.y - 46} -60 ${HEAD.y - 18} Z`} fill={L.hair} />
      ) : null}
      {L.extra === 'buzz' || L.extra === 'security' ? (
        // a crown of hair only a shade off the skull: the shape reads as a cut, not as a helmet
        <path transform={`translate(${-pose.yaw * 11} 0)`} d={`M -58 ${HEAD.y - 14} Q -60 ${HEAD.y - 62} 0 ${HEAD.y - 64} Q 60 ${HEAD.y - 62} 58 ${HEAD.y - 14} Q 52 ${HEAD.y - 40} 24 ${HEAD.y - 42} Q 0 ${HEAD.y - 36} -24 ${HEAD.y - 42} Q -52 ${HEAD.y - 40} -58 ${HEAD.y - 14} Z`} fill={L.hair} opacity={0.92} stroke={L.line} strokeWidth={2.5} />
      ) : null}
      {L.extra === 'balding' ? (
        // hair at the sides only, the dome catching the light
        <g transform={`translate(${-pose.yaw * 9} 0)`}>
          <path d={`M -58 ${HEAD.y + 10} Q -64 ${HEAD.y - 30} -34 ${HEAD.y - 44} Q -40 ${HEAD.y - 12} -50 ${HEAD.y + 14} Z`} fill={L.hair} stroke={L.line} strokeWidth={2.5} />
          <path d={`M 58 ${HEAD.y + 10} Q 64 ${HEAD.y - 30} 34 ${HEAD.y - 44} Q 40 ${HEAD.y - 12} 50 ${HEAD.y + 14} Z`} fill={L.hair} stroke={L.line} strokeWidth={2.5} />
        </g>
      ) : null}
      {L.extra === 'ponytail' || L.extra === 'longhair' ? (
        // the fringe that sits over the forehead, tied back or loose
        <path transform={`translate(${-pose.yaw * 12} 0)`} d={`M -62 ${HEAD.y - 14} Q -64 ${HEAD.y - 70} 0 ${HEAD.y - 72} Q 62 ${HEAD.y - 70} 62 ${HEAD.y - 14} Q 46 ${HEAD.y - 44} 8 ${HEAD.y - 46} Q -34 ${HEAD.y - 42} -62 ${HEAD.y - 14} Z`} fill={L.hair} stroke={L.line} strokeWidth={4} strokeLinejoin="round" />
      ) : null}
      {L.extra === 'coat' ? (
        // short hair, combed back and thinning at the temples: a man in his forties, not a silhouette
        <path transform={`translate(${-pose.yaw * 12} 0)`} d={`M -58 ${HEAD.y - 18} Q -60 ${HEAD.y - 68} 2 ${HEAD.y - 66} Q 60 ${HEAD.y - 60} 58 ${HEAD.y - 16} Q 48 ${HEAD.y - 46} 14 ${HEAD.y - 46} Q -34 ${HEAD.y - 40} -58 ${HEAD.y - 18} Z`} fill={L.hair} stroke={L.line} strokeWidth={3} strokeLinejoin="round" />
      ) : null}
      {L.extra === 'fringe' ? (
        // a young man's side-swept fringe: a heavy diagonal edge across the forehead, one lock past the temple.
        // The shape is the identity here — it must not read as Pip's small flick however the head turns.
        <g transform={`translate(${-pose.yaw * 14} 0)`}>
          <path d={`M -60 ${HEAD.y - 20} Q -64 ${HEAD.y - 72} 2 ${HEAD.y - 74} Q 62 ${HEAD.y - 72} 60 ${HEAD.y - 20} Q 58 ${HEAD.y - 42} 44 ${HEAD.y - 48} Q 24 ${HEAD.y - 56} 6 ${HEAD.y - 44} Q -16 ${HEAD.y - 32} -34 ${HEAD.y - 40} Q -50 ${HEAD.y - 44} -60 ${HEAD.y - 20} Z`} fill={L.hair} stroke={L.line} strokeWidth={3.5} strokeLinejoin="round" />
          <path d={`M 6 ${HEAD.y - 44} Q 20 ${HEAD.y - 26} 34 ${HEAD.y - 24} Q 30 ${HEAD.y - 38} 18 ${HEAD.y - 48} Z`} fill={L.hair} />
        </g>
      ) : null}
      {L.extra === 'staff' ? (
        // short hair, side part on the other side, so the waiters never twin with the croupier
        <path transform={`translate(${-pose.yaw * 12} 0)`} d={`M -60 ${HEAD.y - 16} Q -62 ${HEAD.y - 68} 0 ${HEAD.y - 68} Q 62 ${HEAD.y - 66} 60 ${HEAD.y - 16} Q 48 ${HEAD.y - 46} 8 ${HEAD.y - 50} Q -30 ${HEAD.y - 42} -60 ${HEAD.y - 16} Z`} fill={L.hair} stroke={L.line} strokeWidth={3.5} />
      ) : null}
      {L.extra === 'cap' ? (
        // a flat cap: a low crown and a brim that points the way he faces
        <g transform={`translate(${-pose.yaw * 12} 0)`}>
          <path d={`M -58 ${HEAD.y - 22} Q -58 ${HEAD.y - 74} 0 ${HEAD.y - 74} Q 52 ${HEAD.y - 72} 56 ${HEAD.y - 26} Z`} fill={L.hair} stroke={L.line} strokeWidth={4} strokeLinejoin="round" />
          <path d={`M -54 ${HEAD.y - 24} Q 6 ${HEAD.y - 6} 74 ${HEAD.y - 30} Q 76 ${HEAD.y - 16} 62 ${HEAD.y - 10} Q 0 ${HEAD.y + 12} -54 ${HEAD.y - 14} Z`} fill={L.jacketShade} stroke={L.line} strokeWidth={4} strokeLinejoin="round" />
        </g>
      ) : null}
      {/* A front arm hides the mouth only when its hand is at the mouth. It used to mute on `armFront` alone,
          which erased his mouth the moment a front arm was used for anything else — a fist at the chest, a palm
          holding chips. The hand's own joint decides now: within 75 units of the mouth, mute; anywhere else, the
          face is the face. */}
      <Face expr={pose.expr} blink={pose.blink} look={pose.look} lookY={pose.lookY} talk={pose.talk} viseme={pose.viseme} glasses={pose.glasses} yaw={pose.yaw} ink={L.face} glint={pose.glint} glintColor={pose.glintColor}
            mute={pose.armFront >= 0.5 && (() => {
              const e = pose.yaw < 0 ? j.armL.end : j.armR.end;
              return Math.hypot(e.x, e.y - (HEAD.y + 28)) < 75;
            })()} />
      {L.extra === 'curls'
        ? [-150, -125, -100, -78, -55, -30].map((deg, k) => {
            const a = (deg * Math.PI) / 180;
            return <circle key={k} cx={Math.cos(a) * 54} cy={HEAD.y + Math.sin(a) * 54} r={24} fill={L.hair} />;
          })
        : null}
      {L.extra === 'beard' ? (
        // a full beard along the jaw, its inner edge below the mouth so the expression still reads
        <g>
          <path d={`M -48 ${HEAD.y + 12} Q -54 ${HEAD.y + 62} 0 ${HEAD.y + 78} Q 54 ${HEAD.y + 62} 48 ${HEAD.y + 12} Q 40 ${HEAD.y + 48} 0 ${HEAD.y + 50} Q -40 ${HEAD.y + 48} -48 ${HEAD.y + 12} Z`} fill={L.hair} stroke={L.line} strokeWidth={3} strokeLinejoin="round" />
          <path d={`M -17 ${HEAD.y + 18} Q 0 ${HEAD.y + 11} 17 ${HEAD.y + 18} Q 0 ${HEAD.y + 24} -17 ${HEAD.y + 18} Z`} fill={L.hair} />
        </g>
      ) : null}
      {L.earpiece ? (
        <g>
          <circle cx={52} cy={HEAD.y + 6} r={6.5} fill={L.line} opacity={0.85} />
          <path d={`M 58 ${HEAD.y + 14} Q 66 ${HEAD.y + 44} 52 ${HEAD.y + 60}`} stroke={L.line} strokeWidth={4} fill="none" opacity={0.8} strokeLinecap="round" />
        </g>
      ) : null}
    </g>
  );
  return (
    <g>
      {shadow > 0 ? <ellipse cx={pose.x} cy={pose.y + LEG_LEN * pose.scale + 10} rx={70 * pose.scale} ry={12 * pose.scale} fill="#000" opacity={0.25 * shadow} /> : null}
      <g transform={`translate(${pose.x} ${pose.y}) scale(${pose.scale}) rotate(${pose.spin} 0 -90)`} filter={`url(#${rimId})`}>
        <g transform={`translate(0 ${LEG_LEN}) scale(${1 + 0.6 * pose.squash} ${1 - pose.squash}) translate(0 ${-LEG_LEN})`}>
          {/* the far side is drawn first, so a turned body overlaps itself the right way */}
          {pose.yaw < 0 ? <>{limb(j.legR, 12)}{shoe(j.legR)}{limb(j.legL, 12)}{shoe(j.legL)}</> : <>{limb(j.legL, 12)}{shoe(j.legL)}{limb(j.legR, 12)}{shoe(j.legR)}</>}
          {/* the far arm, behind the body (or in front of it when a seated pose rests both hands on the lap) */}
          {pose.farFront >= 0.5 ? null : (pose.yaw < 0 ? <>{limb(j.armR, 11, false, sleeve)}{hand(j.armR, -1, pose.handR)}</> : <>{limb(j.armL, 11, false, sleeve)}{hand(j.armL, 1, pose.handL)}</>)}
          {torso}
          {pose.farFront >= 0.5 ? (pose.yaw < 0 ? <>{limb(j.armR, 11, false, sleeve)}{hand(j.armR, -1, pose.handR)}</> : <>{limb(j.armL, 11, false, sleeve)}{hand(j.armL, 1, pose.handL)}</>) : null}
          {/* a raised near arm leaves the body from under the hood: the upper segment is drawn here, before the
              hood, so the hood covers its root; the forearm and hand come after the head, over the face */}
          {pose.armFront >= 0.5 ? (pose.yaw < 0 ? upperArm(j.armL, true) : upperArm(j.armR, true)) : null}
          {/* the near arm: normally over the jacket and under the hood; when it has to reach the mouth, after the
              head, so the hand is in front of the face. `armFront` is part of the pose, so it travels with the rig. */}
          {pose.armFront < 0.5 ? (pose.yaw < 0 ? <>{limb(j.armL, 11, false, sleeve)}{hand(j.armL, 1, pose.handL)}</> : <>{limb(j.armR, 11, false, sleeve)}{hand(j.armR, -1, pose.handR)}</>) : null}
          {L.extra === 'hood' ? (
            <g transform={`rotate(${pose.tilt}) rotate(${pose.headTilt * 0.5} 0 ${HEAD.y + 40})`}>
              <path d={`M -70 ${HEAD.y + 14} Q -80 ${HEAD.y - 74} 0 ${HEAD.y - 80} Q 80 ${HEAD.y - 74} 70 ${HEAD.y + 14} Q 52 -100 0 -106 Q -52 -100 -70 ${HEAD.y + 14} Z`} fill={L.jacket} stroke={L.line} strokeWidth={4} />
              {(() => {
                const sw = pose.sway * 0.7 - pose.tilt * 0.6;
                return (
                  <g>
                    <path d={`M -12 -108 Q ${-14 + sw * 0.3} -88 ${-16 + sw} -66 M 12 -108 Q ${14 + sw * 0.3} -88 ${16 + sw} -66`} stroke={L.accent} strokeWidth={5} strokeLinecap="round" fill="none" />
                    <circle cx={-16 + sw} cy={-64} r={5} fill={L.accent} />
                    <circle cx={16 + sw} cy={-64} r={5} fill={L.accent} />
                  </g>
                );
              })()}
            </g>
          ) : null}
          {L.extra === 'curls' ? (
            <g transform={`rotate(${pose.tilt})`}>
              <path d="M -46 -110 Q 0 -86 46 -110" stroke="#E06A5A" strokeWidth={8} fill="none" strokeLinecap="round" />
              <rect x={-60} y={-126} width={20} height={32} rx={8} fill="#E06A5A" stroke={L.line} strokeWidth={4} />
              <rect x={40} y={-126} width={20} height={32} rx={8} fill="#E06A5A" stroke={L.line} strokeWidth={4} />
            </g>
          ) : null}
          {head}
          {pose.armFront >= 0.5 ? (pose.yaw < 0 ? <>{foreArm(j.armL, true)}{hand(j.armL, 1, pose.handL)}</> : <>{foreArm(j.armR, true)}{hand(j.armR, -1, pose.handR)}</>) : null}
        </g>
      </g>
    </g>
  );
};


/** A character is the rig in a costume: <Actor> is the same as <Hero>, named for scenes with more than one person. */
export const Actor = Hero;

/**
 * A walk in profile. `phase` advances about 0.6 a frame for a normal walk; `ground` is the floor height under the hips
 * (a number, or a function of x for stairs and slopes). Leans into the step, bobs the head, bends the elbows, swings
 * loose things (the drawstrings) a beat behind the body.
 */
export const walkPose = (x: number, phase: number, ground: number | ((x: number) => number), scale = 0.9, extra: Partial<Pose> = {}, facing: 1 | -1 = 1): Pose => {
  const s = Math.sin(phase);
  const g = typeof ground === 'number' ? ground : ground(x);
  return {
    ...basePose,
    x,
    y: g - LEG_LEN * scale - Math.abs(Math.cos(phase)) * 7,
    scale,
    facing,
    yaw: facing,
    tilt: 5 * facing,
    headTilt: 2 * Math.sin(phase * 2),
    sway: 10 * Math.sin(phase + 0.8),
    legL: { a: 28 * s, b: -Math.max(0, 40 * Math.sin(phase + 1.2)) },
    legR: { a: -28 * s, b: -Math.max(0, 40 * Math.sin(phase + 1.2 + Math.PI)) },
    armL: { a: 24 * s, b: 12 + 14 * Math.abs(s) },
    armR: { a: 24 * s, b: 12 + 14 * Math.abs(s) },
    ...extra,
  };
};

/** Where the feet are for a pose standing at hip y: use it to put a character on a floor (y = floor - feetBelowHips). */
export const feetBelowHips = (scale: number) => LEG_LEN * scale;
