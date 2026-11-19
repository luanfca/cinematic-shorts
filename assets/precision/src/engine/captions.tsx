import React from 'react';
import { FONT } from './fonts';

/**
 * A global, burned-in caption layer. It is drawn by Episode's `Overlay`, above the picture, the grade, the power
 * look and the flash, so no scene, effect or transition can hide it.
 *
 * The chunks come from `scripts_local/build_captions.py`, which reads the final voice's `lines.json`/`words.json`
 * and writes `captions.json`. The render and `captions_check.py` therefore consume the same timings: a caption
 * cannot be "present in the code" but absent from the delivered MP4, which is what happened to episode 2.
 */
export type CaptionToken = { t: string; hi?: boolean };
export type CaptionChunk = {
  id: string;
  who?: string;
  a: number;
  b: number;
  y?: number;
  lines: CaptionToken[][];
};

export type CaptionsLayerProps = {
  f: number;
  fps: number;
  chunks: CaptionChunk[];
  /** Default band baseline (the bottom line's baseline). A chunk can override it with `y`. */
  y?: number;
  fontSize?: number;
  lineHeight?: number;
  fill?: string;
  hiFill?: string;
  stroke?: string;
  strokeWidth?: number;
  fontFamily?: string;
};

const ID = 'capShadow';

export const CaptionsLayer: React.FC<CaptionsLayerProps> = ({
  f, fps, chunks, y = 1560, fontSize = 58, lineHeight = 76, fill = '#FDF8EE', hiFill = '#F3C969',
  stroke = '#0A0610', strokeWidth = 13, fontFamily = FONT.title,
}) => {
  const t = f / fps;
  const c = chunks.find((k) => t >= k.a && t < k.b);
  if (!c) return null;
  const age = t - c.a;
  // A 0.16 s settle, not an exit animation: the layer is removed with the chunk, so it can never be left at
  // opacity 0 over a scene (the failure mode the audit asked to rule out).
  const pop = 1 + 0.045 * Math.max(0, 1 - age / 0.16);
  const base = (c.y ?? y) - (c.lines.length - 1) * lineHeight;
  return (
    <g>
      <defs>
        <filter id={ID} x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.6" />
        </filter>
      </defs>
      <g filter={`url(#${ID})`}>
        {c.lines.map((ln, i) => (
          <text key={`${c.id}-${i}`} x={540} y={base + i * lineHeight} textAnchor="middle"
                fontFamily={fontFamily} fontWeight={800} fontSize={fontSize * pop} fill={fill}
                stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" paintOrder="stroke"
                xmlSpace="preserve">
            {ln.map((tok, j) => (
              <tspan key={j} fill={tok.hi ? hiFill : fill}>{tok.t}{j < ln.length - 1 ? ' ' : ''}</tspan>
            ))}
          </text>
        ))}
      </g>
    </g>
  );
};
