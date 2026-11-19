import React from 'react';
import {clamp, mix} from './art';

// World space: horizon at y=1250, actors stand with feet on y=GROUND.
export const GROUND=1510, HORIZON=1250;

export const WorldDefs:React.FC=()=> <defs>
  <linearGradient id="skyE" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#05071a"/><stop offset=".45" stopColor="#141a44"/><stop offset=".8" stopColor="#3a2f5e"/><stop offset="1" stopColor="#6a4a6a"/></linearGradient>
  <radialGradient id="moonE" cx=".42" cy=".38"><stop stopColor="#fbf6e6"/><stop offset=".7" stopColor="#d9d6e6"/><stop offset="1" stopColor="#a7a9c8"/></radialGradient>
  <radialGradient id="moonGlowE"><stop stopColor="#c9cfff" stopOpacity=".45"/><stop offset=".5" stopColor="#8f94d8" stopOpacity=".14"/><stop offset="1" stopColor="#8f94d8" stopOpacity="0"/></radialGradient>
  <linearGradient id="groundE" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#2b2c3c"/><stop offset=".25" stopColor="#3a3c4c"/><stop offset="1" stopColor="#101118"/></linearGradient>
  <radialGradient id="runeGlowE"><stop stopColor="#4fe3ff" stopOpacity=".55"/><stop offset=".6" stopColor="#2a8cff" stopOpacity=".12"/><stop offset="1" stopColor="#2a8cff" stopOpacity="0"/></radialGradient>
  <radialGradient id="hotGlowE"><stop stopColor="#ffd28a" stopOpacity=".9"/><stop offset=".4" stopColor="#ff7a2a" stopOpacity=".35"/><stop offset="1" stopColor="#ff5a1a" stopOpacity="0"/></radialGradient>
  <radialGradient id="whiteGlowE"><stop stopColor="#ffffff" stopOpacity=".95"/><stop offset=".35" stopColor="#bfe8ff" stopOpacity=".4"/><stop offset="1" stopColor="#bfe8ff" stopOpacity="0"/></radialGradient>
  <radialGradient id="vigE"><stop offset=".45" stopColor="#02030a" stopOpacity="0"/><stop offset="1" stopColor="#02030a" stopOpacity=".6"/></radialGradient>
  <linearGradient id="rockE" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#4a4a66"/><stop offset=".3" stopColor="#262840"/><stop offset="1" stopColor="#0d0e1a"/></linearGradient>
  <linearGradient id="stoneE" x1="0" x2="1"><stop stopColor="#1d1f2c"/><stop offset=".6" stopColor="#4a4d60"/><stop offset="1" stopColor="#6e7188"/></linearGradient>
</defs>;

const Island:React.FC<{x:number;y:number;s:number;f:number;i:number}>=({x,y,s,f,i})=><g transform={`translate(${x} ${y+Math.sin(f/70+i)*10}) scale(${s})`}>
  <path d="M-260 0Q-200-40-80-30Q40-60 160-30Q260-20 280 10L180 60L120 200L40 150L0 320L-60 160L-140 210L-180 60Z" fill="url(#rockE)" stroke="#0b0b16" strokeWidth="5"/>
  <path d="M-260 0Q-200-40-80-30Q40-60 160-30Q260-20 280 10" fill="none" stroke="#a9b0e8" strokeWidth="7" opacity=".55"/>
  <path d="M-150-34l-20-70l40 30l10-60l30 70M90-44l10-80l30 60l20-40l10 60" fill="#11131f"/>
  <path d="M40 150Q44 260 40 400" stroke="#9fc8ff" strokeWidth="5" opacity=".25"/>
</g>;

const Statue:React.FC<{x:number;s:number;flip?:boolean}>=({x,s,flip})=><g transform={`translate(${x} ${HORIZON+40}) scale(${flip?-s:s} ${s})`}>
  <path d="M-160 0H160V-90H-160Z" fill="#1a1b26"/>
  <path d="M-110-90L-90-520L-150-610L-60-700L-20-860L60-830L80-700L140-610L95-520L120-90Z" fill="url(#stoneE)" stroke="#0a0b12" strokeWidth="6"/>
  <path d="M-20-860L60-830L40-760L-30-790Z" fill="#11121a"/>
  <path d="M95-520L250-640L270-610L130-480Z" fill="url(#stoneE)" stroke="#0a0b12" strokeWidth="5"/>
  <path d="M-60-400L10-470L-30-300L40-210" fill="none" stroke="#0a0b12" strokeWidth="6"/>
  <path d="M-200 0L-150-30L-90-10L-40-40L20 0Z" fill="#2a2c3c"/>
</g>;

const Castle:React.FC=()=><g transform={`translate(260 ${HORIZON+6})`}>
  <path d="M-300 0V-160H-250V-200H-220V-160H-160V-330L-130-390L-100-330V-160H-40V-460L0-560L40-460V-160H100V-300L130-350L160-300V-160H260V0Z" fill="#141429"/>
  {[[-130,-280],[0,-400],[0,-300],[130,-240],[-200,-110],[200,-110]].map(([wx,wy],i)=><rect key={i} x={wx-6} y={wy} width="12" height="20" fill="#ffbf6a" opacity=".85"/>)}
  <path d="M0-560V-640L60-620L0-600" fill="#7a1a2a"/>
</g>;

export interface WorldProps {frame:number;camX:number;camY:number;crack?:number;crackHeat?:number;runes?:number;build?:number;impact?:number}
export const World:React.FC<WorldProps>=({frame:f,camX,camY,crack=0,crackHeat=0,runes=.6,build=1,impact=0})=>{
  // Distant layers drift a little with the camera; the floor plane never moves under the feet.
  const px=(k:number)=>`translate(${(camX-1000)*k} ${(camY-1000)*k*.6})`;
  const rp=runes*(.75+.25*Math.sin(f/9));
  return <g>
    <rect x="-3000" y="-4200" width="7200" height={HORIZON+4300} fill="url(#skyE)"/>
    <g transform={px(.12)}>
      {Array.from({length:70},(_,i)=><circle key={i} cx={-1500+(i*397)%5200} cy={-3900+(i*613)%4600} r={i%5===0?4:2} fill="#e8ecff" opacity={.35+.35*Math.sin(f/23+i)}/>)}
      <circle cx="1700" cy="-1450" r="1300" fill="url(#moonGlowE)"/>
      <circle cx="1700" cy="-1450" r="520" fill="url(#moonE)"/>
      <path d="M1460-1620q60 40 30 110M1820-1260q-80 20-120-40M1900-1640q20 70-40 90" fill="none" stroke="#b8b8d0" strokeWidth="18" opacity=".45"/>
      <ellipse cx="1700" cy="-1450" rx="980" ry="190" fill="none" stroke="#d8dcff" strokeWidth="16" opacity=".55" transform="rotate(-14 1700 -1450)"/>
      <ellipse cx="1700" cy="-1450" rx="1080" ry="215" fill="none" stroke="#9aa2e8" strokeWidth="7" opacity=".35" transform="rotate(-14 1700 -1450)"/>
    </g>
    <g transform={px(.08)}>
      <Island x={-200} y={-700} s={1.3} f={f} i={0}/><Island x={2350} y={-260} s={1.1} f={f} i={2}/><Island x={600} y={-1500} s={.7} f={f} i={4}/><Island x={2700} y={-1900} s={.6} f={f} i={1}/>
      <path d={`M-3000 ${HORIZON}L-2000 ${HORIZON-260}L-1300 ${HORIZON-120}L-600 ${HORIZON-330}L200 ${HORIZON-140}L1100 ${HORIZON-380}L1900 ${HORIZON-150}L2700 ${HORIZON-300}L4200 ${HORIZON-90}V${HORIZON+40}H-3000Z`} fill="#1c1a36"/>
    </g>
    <g transform={px(.04)}><Castle/><Statue x={-420} s={1.2}/><Statue x={2380} s={1.35} flip/></g>
    <rect x="-3000" y={HORIZON} width="7200" height="2600" fill="url(#groundE)"/>
    {Array.from({length:23},(_,i)=>{const x=-4000+i*500;return <path key={i} d={`M1000 ${HORIZON}L${x} 3800`} stroke="#5d6078" strokeWidth="4" opacity=".35"/>;})}
    {[1290,1350,1440,1580,1800,2150,2700].map(y=><path key={y} d={`M-3000 ${y}H4200`} stroke="#5d6078" strokeWidth={3+(y-1250)/200} opacity=".3"/>)}
    <path d={`M-3000 ${HORIZON}H4200`} stroke="#8a86c0" strokeWidth="5" opacity=".5"/>
    <g opacity={.35+rp*.65}>
      <ellipse cx="1050" cy="1560" rx="1150" ry="260" fill="url(#runeGlowE)"/>
      <ellipse cx="1050" cy="1560" rx="900" ry="150" fill="none" stroke="#5ae6ff" strokeWidth="7"/>
      <ellipse cx="1050" cy="1560" rx="780" ry="122" fill="none" stroke="#5ae6ff" strokeWidth="3" strokeDasharray="30 18"/>
      {Array.from({length:18},(_,i)=>{const a=i/18*Math.PI*2+f/240;const x=1050+Math.cos(a)*840,y=1560+Math.sin(a)*136;return <path key={i} d={`M${x-14} ${y-6}l14-14l14 14l-14 14ZM${x} ${y-20}v40`} fill="none" stroke="#9af2ff" strokeWidth="4"/>;})}
    </g>
    {crack>0&&<g>{[[1500,1300,-1],[1300,1340,1],[1700,1330,-1]].map(([cx,cy,d],i)=>{const L=crack*(1600+i*300);const dd=`M${cx} ${cy}l${d*L*.12} ${L*.08}l${-d*L*.05} ${L*.1}l${d*L*.14} ${L*.12}l${-d*L*.08} ${L*.16}`;return <g key={i}>
      <path d={dd} fill="none" stroke={crackHeat>.5?'#ff8a3a':'#5ae6ff'} strokeWidth={18} strokeLinecap="round" opacity=".9"/>
      <path d={dd} fill="none" stroke="#fff6e2" strokeWidth={5} strokeLinecap="round"/>
    </g>;})}</g>}
    {impact>0&&impact<1&&<g opacity={clamp(1-impact)}><ellipse cx="1450" cy="1540" rx={300+impact*1600} ry={60+impact*300} fill="none" stroke="#fff1d6" strokeWidth={40*(1-impact)+6}/><ellipse cx="1450" cy="1540" rx={200+impact*900} ry={40+impact*170} fill="url(#hotGlowE)"/></g>}
    {build<1&&<BuildVeil build={build} f={f}/>}
  </g>;
};

// The world assembles under a scan line: below it, a void of cyan wireframe.
const BuildVeil:React.FC<{build:number;f:number}>=({build,f})=>{
  const y=mix(-2600,2600,clamp(build));
  return <g>
    <rect x="-3000" y={y} width="7200" height="6000" fill="#03050c"/>
    {Array.from({length:30},(_,i)=><path key={i} d={`M${-2000+i*220} ${y}V4000`} stroke="#2fd4ff" strokeWidth="3" opacity=".28"/>)}
    {Array.from({length:22},(_,i)=><path key={`h${i}`} d={`M-3000 ${y+60+i*180}H4200`} stroke="#2fd4ff" strokeWidth="3" opacity=".22"/>)}
    <rect x="-3000" y={y-30} width="7200" height="60" fill="#8ff2ff" opacity=".55"/>
    <rect x="-3000" y={y-6} width="7200" height="12" fill="#ffffff"/>
    {Array.from({length:40},(_,i)=><rect key={`b${i}`} x={-1200+(i*331+f*23)%3600} y={y-60-(i*97)%400} width={16+(i%4)*14} height="16" fill="#9ff4ff" opacity=".6"/>)}
  </g>;
};

// Screen-space rain. In slow motion it hangs in the air as still beads.
export const Rain:React.FC<{frame:number;amount?:number;freeze?:number;slant?:number}>=({frame,amount=1,freeze=0,slant=14})=>{
  return <g opacity={amount}>{Array.from({length:110},(_,i)=>{const x=(i*97+Math.floor(i/7)*31)%1180-50;const sp=34+i%5*7;const near=i%6===0;
    if(freeze>0){const y=((i*211+Math.floor(frame/40)*sp)%2100)-90;return <ellipse key={i} cx={x+Math.sin(frame/50+i)*3} cy={y+Math.sin(frame/37+i)*4} rx={near?3.5:2} ry={near?7:4} fill="#d6ecff" opacity={.4+(i%3)*.15}/>;}
    const y=((i*211+frame*sp)%2100)-90;
    return <path key={i} d={`M${x} ${y}l${-slant*(near?1.6:1)} ${near?120:70}`} stroke={i%3?'#9fb8e8':'#dbe8ff'} strokeWidth={near?4:2} opacity={near?.5:.3}/>;})}</g>;
};

export const Dust:React.FC<{frame:number;amount:number;warm?:boolean}>=({frame,amount,warm})=> <g opacity={amount}>{Array.from({length:46},(_,i)=><circle key={i} cx={(i*233)%1080+Math.sin(frame/60+i)*20} cy={(i*419)%1920-((frame*(.4+i%3*.2))%120)} r={i%4===0?5:2.5} fill={warm?'#ffcf9a':'#cfd8ff'} opacity={.35+(i%3)*.18}/>)}</g>;
