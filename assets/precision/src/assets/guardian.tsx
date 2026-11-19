import React from 'react';
import {clamp, mix} from './art';

// Iron Guardian: ~9 m colossus. Local units: feet at y=0, crown at about y=-3300.
// core / eyes: 0..1 glow; heat 0 = cyan, 1 = forge orange; fist: 0 = hanging, 1 = raised overhead, 2 = slammed onto the ground.
export const GuardianDefs:React.FC=()=> <defs>
  <linearGradient id="ironG" x1="0" x2="1"><stop stopColor="#14151c"/><stop offset=".45" stopColor="#3b3e4a"/><stop offset=".6" stopColor="#555a68"/><stop offset="1" stopColor="#191a22"/></linearGradient>
  <linearGradient id="ironDarkG" x1="0" x2="1"><stop stopColor="#0c0d12"/><stop offset=".6" stopColor="#2a2c36"/><stop offset="1" stopColor="#101117"/></linearGradient>
  <radialGradient id="coreBlueG"><stop stopColor="#ffffff"/><stop offset=".25" stopColor="#7ff0ff"/><stop offset=".6" stopColor="#1e8cff" stopOpacity=".45"/><stop offset="1" stopColor="#1e8cff" stopOpacity="0"/></radialGradient>
  <radialGradient id="coreHotG"><stop stopColor="#ffffff"/><stop offset=".25" stopColor="#ffd27a"/><stop offset=".6" stopColor="#ff5a1a" stopOpacity=".5"/><stop offset="1" stopColor="#ff5a1a" stopOpacity="0"/></radialGradient>
</defs>;

export interface GuardianProps {x:number;y:number;scale:number;frame:number;core:number;eyes:number;heat:number;fist:number;rise?:number;fistTarget?:[number,number];stagger?:number}
export const Guardian:React.FC<GuardianProps>=({x,y,scale,frame,core,eyes,heat,fist,rise=1,fistTarget,stagger=0})=>{
  const hot=heat>.5;const glow=hot?'#ff8a3a':'#6fe8ff';const coreFill=hot?'url(#coreHotG)':'url(#coreBlueG)';
  const sway=Math.sin(frame/40)*6;const sink=(1-clamp(rise))*900;
  // Right arm: shoulder fixed, elbow goes out and down, fist follows a raise then a slam arc.
  const sh:[number,number]=[560,-2380];
  const hang:[number,number]=[820,-1050],up:[number,number]=[700,-3600],slam:[number,number]=[-700,-60];
  const fp=fistTarget??(fist<=1?[mix(hang[0],up[0],fist),mix(hang[1],up[1],fist)]:[mix(up[0],slam[0],fist-1),mix(up[1],slam[1],fist-1)]);
  const el:[number,number]=[Math.max(sh[0],fp[0])+330,(sh[1]+fp[1])/2+120];
  const runes=(n:number)=>Array.from({length:n},(_,i)=>i);
  return <g transform={`translate(${x} ${y+sink}) scale(${scale})`}>
    <ellipse cx="0" cy="10" rx="1300" ry="120" fill="#020308" opacity=".55"/>
    {/* Legs */}
    {[-1,1].map(s=><g key={s}>
      <path d={`M${s*180} -1500L${s*420} -1450L${s*470} -700L${s*560} -40H${s*120}L${s*170} -700Z`} fill="url(#ironG)" stroke="#05060a" strokeWidth="14"/>
      <path d={`M${s*130} -760H${s*500}L${s*470} -620H${s*160}Z`} fill="url(#ironDarkG)" stroke="#05060a" strokeWidth="10"/>
      <path d={`M${s*80} 0L${s*120} -120H${s*640}L${s*700} 0Z`} fill="#1a1b22" stroke="#05060a" strokeWidth="12"/>
      <path d={`M${s*300} -1300l${s*40} 220l${-s*60} 160l${s*50} 200`} fill="none" stroke={glow} strokeWidth="14" opacity={.35+core*.5}/>
    </g>)}
    <g transform={`translate(${sway+stagger*60} ${stagger*35}) rotate(${stagger*2} 0 -1800)`}>
      {/* Hips and torso plates */}
      <path d="M-520-1700H520L460-1420H-460Z" fill="url(#ironDarkG)" stroke="#05060a" strokeWidth="14"/>
      <path d="M-700-2500Q-760-2900-500-2980H500Q760-2900 700-2500L520-1700H-520Z" fill="url(#ironG)" stroke="#05060a" strokeWidth="16"/>
      <path d="M-640-2600L-260-2700L-300-2100L-520-1780Z" fill="#20222b" stroke="#05060a" strokeWidth="10"/>
      <path d="M640-2600L260-2700L300-2100L520-1780Z" fill="#20222b" stroke="#05060a" strokeWidth="10"/>
      <path d="M-700-2500Q-760-2900-500-2980H500Q760-2900 700-2500L520-1700H-520Z" fill="url(#ironWear)"/>
      <path d="M-700-2500Q-760-2900-500-2980H500Q760-2900 700-2500L520-1700H-520Z" fill="url(#bodyShade)"/>
      <path d="M-662-2630L-580-2890L-318-2810M662-2630L580-2890L318-2810M-470-1780H470" stroke="url(#silverEdge)" strokeWidth="12" fill="none"/>
      {[-1,1].map(side=><g key={side}>{[-2850,-2690,-2500,-1960,-1810].map(yy=><g key={yy}><circle cx={side*(yy<-2400?585:450)} cy={yy} r="17" fill="#1c2633" stroke="#748092" strokeWidth="4"/><path d={`M${side*(yy<-2400?585:450)-7} ${yy-6}l14 12`} stroke="#a7b3c1" strokeWidth="2" opacity=".6"/></g>)}</g>)}
      {/* Rune cracks across the plates */}
      <path d="M-560-2850l120 160l-60 140l140 120l-40 180M380-2880l-80 150l110 130l-70 170l90 150M-200-1900l90-120l100 60l120-110" fill="none" stroke={glow} strokeWidth="18" strokeLinecap="round" opacity={.4+core*.6}/>
      <path d="M-560-2850l120 160l-60 140l140 120l-40 180M380-2880l-80 150l110 130l-70 170l90 150M-200-1900l90-120l100 60l120-110" fill="none" stroke="#fff3dc" strokeWidth="5" strokeLinecap="round" opacity={core*.8}/>
      {/* Core */}
      <circle cx="0" cy="-2300" r={330+core*170} fill={coreFill} opacity={.35+core*.65}/>
      <path d="M0-2470L150-2300L0-2130L-150-2300Z" fill="#0b0c12" stroke="#05060a" strokeWidth="12"/>
      <path d="M0-2420L100-2300L0-2180L-100-2300Z" fill={hot?'#ffb86a':'#8ff4ff'} opacity={.25+core*.75}/>
      {runes(8).map(i=>{const a=i/8*Math.PI*2+frame/50;return <circle key={i} cx={Math.cos(a)*220} cy={-2300+Math.sin(a)*220} r="16" fill={glow} opacity={core*.9}/>;})}
      {/* Shoulders */}
      <path d="M-700-2950Q-980-2950-1020-2650L-760-2500L-620-2800Z" fill="url(#ironG)" stroke="#05060a" strokeWidth="14"/>
      <path d="M700-2950Q980-2950 1020-2650L760-2500L620-2800Z" fill="url(#ironG)" stroke="#05060a" strokeWidth="14"/>
      {/* Left arm hangs, elbow out */}
      <path d="M-760-2600L-1060-1900L-900-1200" fill="none" stroke="#05060a" strokeWidth="290" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M-760-2600L-1060-1900L-900-1200" fill="none" stroke="#33363f" strokeWidth="250" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M-1020-1180Q-1100-980-930-900Q-760-920-760-1120Z" fill="#2a2c35" stroke="#05060a" strokeWidth="14"/>
      {/* Head: a helm with slit eyes */}
      <path d="M-260-3000L-300-3250Q-200-3420 0-3430Q200-3420 300-3250L260-3000Z" fill="url(#ironG)" stroke="#05060a" strokeWidth="14"/>
      <path d="M-120-3430L-60-3600L0-3440M120-3430L60-3600L0-3440" fill="#1a1b22" stroke="#05060a" strokeWidth="10"/>
      <path d="M-200-3200L-40-3160L-40-3135L-210-3170Z M200-3200L40-3160L40-3135L210-3170Z" fill={hot?'#ffcb7a':'#bff6ff'} opacity={.2+eyes*.8}/>
      {eyes>0&&<g opacity={eyes}><ellipse cx="-125" cy="-3170" rx="220" ry="60" fill={coreFill}/><ellipse cx="125" cy="-3170" rx="220" ry="60" fill={coreFill}/></g>}
    </g>
    {/* Right arm with the fist (drawn last: it comes toward the camera). */}
    <path d={`M${sh[0]} ${sh[1]}L${el[0]} ${el[1]}L${fp[0]} ${fp[1]}`} fill="none" stroke="#05060a" strokeWidth="300" strokeLinecap="round" strokeLinejoin="round"/>
    <path d={`M${sh[0]} ${sh[1]}L${el[0]} ${el[1]}L${fp[0]} ${fp[1]}`} fill="none" stroke="#3a3d47" strokeWidth="260" strokeLinecap="round" strokeLinejoin="round"/>
    <path d={`M${mix(el[0],fp[0],.3)} ${mix(el[1],fp[1],.3)}L${mix(el[0],fp[0],.85)} ${mix(el[1],fp[1],.85)}`} stroke={glow} strokeWidth="22" opacity={.3+core*.5} strokeLinecap="round"/>
    <g transform={`translate(${fp[0]} ${fp[1]})`}>
      <path d="M-260-200Q-300 120-160 260H170Q300 120 260-200Q0-300-260-200Z" fill="url(#ironG)" stroke="#05060a" strokeWidth="16"/>
      {[-150,-50,50,150].map(k=><path key={k} d={`M${k-48} -120Q${k} -170 ${k+48} -120V60Q${k} 90 ${k-48} 60Z`} fill="#2b2d36" stroke="#05060a" strokeWidth="10"/>)}
      <path d="M-200 120Q0 180 200 120" stroke={glow} strokeWidth="16" fill="none" opacity={.4+core*.5}/>
    </g>
  </g>;
};
