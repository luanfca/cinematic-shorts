import React from 'react';import {C} from '../engine';
export const Hand: React.FC<{
  x: number; y: number; rot?: number; s?: number; open?: number; sleeve?: string; skin?: string;
  /** how far the forearm runs. It exists so a hand drawn in the middle of the frame can still leave it: at 380 a
      forearm pointing up inside a wide shot ended in mid-air, which is the "braço que não existe" the author saw
      in S56 and S66. 640 is the default now; a shot that needs the arm to stop behind a card passes its own. */
  reach?: number;
  /** degrees the forearm turns at the elbow, in the hand's own frame. A straight sleeve running out of frame at
      insert scale reads as a tube with no joint (episode 2, S20/S33/S42); the bend puts the elbow inside the shot.
      0 — the default — keeps every sleeve drawn before this identical. */
  bend?: number;
  /** where the elbow sits along the sleeve, 0..1. 0.4–0.45 is a plausible forearm/upper-arm ratio. */
  elbow?: number;
}> = ({ x, y, rot = 0, s = 1, open = 0, sleeve = '#2E2B3D', skin = C.skin, reach = 640, bend = 0, elbow = 0.45 }) => {
  const curl = 1 - Math.max(0, Math.min(1, open));
  // EIGHTH PASS — THE SOCK. The old close-up hand was a bare cream forearm (34 wide) ending in a white band and a
  // tall banded palm: on the delivered frames it read as a sock pulled over a wrist, and at the mouth it read as
  // a cup. It is now the rig's OWN hand, the same mitten the characters have, at insert scale: one rounded palm
  // with a thumb under it and three shallow finger grooves, and the sleeve covers the forearm from the wrist out
  // of frame, the way a jacketed arm does. No bare skin between a cuff and the hand, no band.
  const wc = 33; // palm half-width across the arm
  const wl = 44 - 10 * curl; // palm half-length along the arm; a closed hand is shorter
  const tip = -wl;
  // the sleeve: two tapered segments around one elbow. With bend 0 the three joints are collinear and the shape is
  // the old straight sleeve to the unit; with a bend the elbow is a real corner, so the arm can leave the frame
  // without becoming a tube.
  const w0 = wc - 2, w2 = wc + 16;
  const el = Math.max(0.08, Math.min(0.92, elbow));
  const xe = 14 + (reach - 14) * el;
  const w1 = w0 + (w2 - w0) * el;
  const ra = (bend * Math.PI) / 180;
  const ca = Math.cos(ra), sa = Math.sin(ra);
  const L2 = (reach - 14) * (1 - el);
  const bx = xe + L2 * ca, by = L2 * sa;
  const arm = `M 14 ${-w0} L ${xe - w1 * sa} ${-w1 * ca} L ${bx - w2 * sa} ${by - w2 * ca} ` +
              `L ${bx + w2 * sa} ${by + w2 * ca} L ${xe + w1 * sa} ${w1 * ca} L 14 ${w0} Z`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {/* the sleeve: a jacketed forearm, tapered like the rig's limb, running out of the shot */}
      <path d={arm} fill={sleeve} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      {/* the rim light the characters get, along the sleeve's upper edge, over the elbow */}
      <path d={`M 20 ${-(w0 - 2)} L ${xe - (w1 - 2) * sa} ${-(w1 - 2) * ca} L ${bx - (w2 - 2) * sa} ${by - (w2 - 2) * ca}`}
            stroke="#FF8A3D" strokeWidth={3} opacity={0.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* a cuff seam at the wrist */}
      <path d={`M 26 -${wc - 3} Q 30 0 26 ${wc - 3}`} stroke={C.ink} strokeWidth={3} opacity={0.5} fill="none" />
      {/* the thumb, under the palm (drawn first so its outline never crosses the palm) */}
      <ellipse cx={4} cy={wc + 8} rx={16} ry={25} fill={skin} stroke={C.ink} strokeWidth={5}
               transform={`rotate(${34 + 12 * curl} 4 ${wc + 8})`} />
      {/* the mitten: one rounded shape, the rig's hand at close-up size */}
      <rect x={tip} y={-wc} width={46 - tip} height={wc * 2} rx={wc - 2} fill={skin} stroke={C.ink} strokeWidth={6} />
      {/* finger grooves at the far edge, only while the hand is open */}
      {curl < 0.55 ? (
        <g stroke={C.ink} strokeWidth={2.6} opacity={0.35} strokeLinecap="round">
          <path d={`M ${tip + 6} -20 L ${tip + 20} -17`} />
          <path d={`M ${tip + 5} 0 L ${tip + 22} 0`} />
          <path d={`M ${tip + 6} 20 L ${tip + 20} 17`} />
        </g>
      ) : null}
      {/* the shade along the palm's lower edge, so the hand is a surface and not a white slab */}
      <path d={`M ${tip + 10} ${wc - 3} Q 20 ${wc + 1} 44 ${wc - 8} L 44 ${wc - 20} Q 16 ${wc - 12} ${tip + 12} ${wc - 14} Z`} fill="#000" opacity={0.07} />
      {/* knuckle line */}
      <path d={`M 32 -${wc - 9} Q 35 0 32 ${wc - 9}`} stroke={C.ink} strokeWidth={2.2} opacity={0.26} fill="none" />
    </g>
  );
};
