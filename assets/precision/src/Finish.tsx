import React from 'react';
import {hero,poseTime,radians,IMPACT,CORE,type V} from './motion';
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const rand=(i:number,s=0)=>{const v=Math.sin(i*127.1+s*311.7)*43758.5453;return v-Math.floor(v);};

export const FinishDefs:React.FC=()=> <defs>
 <radialGradient id="irisK"><stop stopColor="#b6874e"/><stop offset=".55" stopColor="#705030"/><stop offset="1" stopColor="#30271f"/></radialGradient>
 <radialGradient id="irisL"><stop stopColor="#ffe5a0"/><stop offset=".55" stopColor="#d0a33b"/><stop offset="1" stopColor="#795420"/></radialGradient>
 <pattern id="clothWeave" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M1 0V7M5 0V7M0 2H7M0 6H7" stroke="#090d17" strokeWidth=".35" opacity=".13"/></pattern>
 <linearGradient id="leatherWet" x1="0" y1="0" x2="1" y2=".2"><stop stopColor="#35271e"/><stop offset=".5" stopColor="#725238"/><stop offset=".8" stopColor="#9b8056"/><stop offset="1" stopColor="#4c3929"/></linearGradient>
 <pattern id="ironWear" width="73" height="61" patternUnits="userSpaceOnUse"><path d="M7 9l19 4M51 22l-12 18M24 52l10-6M62 4l-4 7" stroke="#c9d6e2" strokeWidth="1.5" opacity=".11"/><path d="M9 12l18 4M50 24l-10 17M25 54l9-6" stroke="#03060b" strokeWidth="1.6" opacity=".27"/></pattern>
 <linearGradient id="silverEdge" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#d6e8f5" stopOpacity=".8"/><stop offset=".45" stopColor="#5a6b84" stopOpacity=".1"/><stop offset="1" stopColor="#050810" stopOpacity=".6"/></linearGradient>
 <linearGradient id="bodyShade" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#020714" stopOpacity=".38"/><stop offset=".36" stopColor="#020714" stopOpacity="0"/><stop offset=".78" stopColor="#cdf0ff" stopOpacity=".02"/><stop offset="1" stopColor="#a9dfff" stopOpacity=".18"/></linearGradient>
 <radialGradient id="fogPool"><stop stopColor="#8da8cf" stopOpacity=".19"/><stop offset=".45" stopColor="#7f95bc" stopOpacity=".08"/><stop offset="1" stopColor="#7f95bc" stopOpacity="0"/></radialGradient>
 <linearGradient id="moonShaft" x1="0" y1="0" x2=".3" y2="1"><stop stopColor="#b9d9ff" stopOpacity=".15"/><stop offset=".6" stopColor="#809cd2" stopOpacity=".04"/><stop offset="1" stopColor="#809cd2" stopOpacity="0"/></linearGradient>
 <linearGradient id="wetGround" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#a3e9ff" stopOpacity=".16"/><stop offset=".4" stopColor="#6da9cd" stopOpacity=".04"/><stop offset="1" stopColor="#6da9cd" stopOpacity="0"/></linearGradient>
 <radialGradient id="softEnergy"><stop stopColor="#f1ffff" stopOpacity=".8"/><stop offset=".2" stopColor="#a6f6ff" stopOpacity=".34"/><stop offset="1" stopColor="#56cfff" stopOpacity="0"/></radialGradient>
 <linearGradient id="impactCut"><stop stopColor="#bdf7ff"/><stop offset=".5" stopColor="#f3fffb"/><stop offset="1" stopColor="#84b6dc"/></linearGradient>
 <linearGradient id="reflectionFalloff" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#fff"/><stop offset=".8" stopColor="#000"/></linearGradient>
 <mask id="reflectionMask" maskUnits="userSpaceOnUse" x="-5000" y="1510" width="10000" height="500"><rect x="-5000" y="1510" width="10000" height="500" fill="url(#reflectionFalloff)"/></mask>
 </defs>;

export const GroundReflection:React.FC<{children:React.ReactNode}>=({children})=><g opacity=".14" mask="url(#reflectionMask)"><g transform="translate(0 1510) scale(1 -.23) translate(0 -1510)">{children}</g></g>;

export const Atmosphere:React.FC<{frame:number;camX:number;camY:number}>=({frame:f,camX,camY})=><g>
 <g transform={`translate(${(camX-1000)*.05} ${(camY-1000)*.04})`}>
  {Array.from({length:7},(_,i)=><path key={i} d={`M${1510+i*90} -2050L${1580+i*90} -2050L${650+i*220} 1550L${220+i*180} 1550Z`} fill="url(#moonShaft)" opacity={i%2?.45:.75}/>)}
  {Array.from({length:8},(_,i)=><ellipse key={i} cx={-1500+i*680+Math.sin(f/150+i)*160} cy={-1550+Math.cos(i)*400} rx={740} ry={120+i%3*40} fill="#11172f" opacity=".18"/>)}
 </g>
 <path d="M400 1450L1740 1450L2030 2600H-70Z" fill="url(#wetGround)"/>
 {Array.from({length:45},(_,i)=>{const x=-600+rand(i,1)*3500,y=1430+rand(i,2)*900,w=12+rand(i,3)*90;return <path key={i} d={`M${x} ${y}q${w*.4} -5 ${w} -2`} stroke={i%4?'#89b6cc':'#b9dfe9'} strokeWidth={1+i%2} opacity={.05+rand(i,4)*.1} fill="none"/>;})}
 {Array.from({length:26},(_,i)=>{const x=-200+rand(i,51)*3000,y=1450+rand(i,52)*450,a=(f/30*.8+rand(i,53))%1;return <g key={i} opacity={(1-a)*.18}><ellipse cx={x} cy={y} rx={3+a*38} ry={1+a*9} fill="none" stroke="#9bcedc" strokeWidth="1.6"/><path d={`M${x-3} ${y-2}l-4-${8*(1-a)}M${x+3} ${y-2}l5-${7*(1-a)}`} stroke="#b1dce5" strokeWidth="1"/></g>;})}
 <ellipse cx={300+Math.sin(f/170)*160} cy="1470" rx="1300" ry="155" fill="url(#fogPool)"/>
 <ellipse cx={1900+Math.sin(f/200+1)*220} cy="1350" rx="1450" ry="220" fill="url(#fogPool)"/>
</g>;

function weaponTip(t:number):V {
 const h=hero(t),a=radians(h.angle),l=radians(h.lean),x=h.right[0]+Math.sin(a)*330,y=h.right[1]-Math.cos(a)*330;
 return [h.x+x*Math.cos(l)-(y-520)*Math.sin(l),h.y+520+x*Math.sin(l)+(y-520)*Math.cos(l)];
}

export const StrikeFinish:React.FC<{t:number}>=({t})=>{
 if(t<15.5||t>16.45)return null;
 const history=Array.from({length:10},(_,i)=>weaponTip(Math.max(15.5,t-i/90)));
 const path=history.map((p,i)=>`${i?'L':'M'}${p[0]} ${p[1]}`).join(' ');
 const after=Math.max(0,t-IMPACT),fade=clamp((16.45-t)/.4);
 return <g opacity={fade}>
  <path d={path} stroke="#69ccff" strokeWidth="68" strokeOpacity=".07" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  <path d={path} stroke="#9de7ff" strokeWidth="25" strokeOpacity=".24" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  <path d={path} stroke="#ecffff" strokeWidth="5" strokeOpacity=".9" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  {t>=IMPACT&&<>
   <ellipse cx="2100" cy="-1430" rx={190+after*350} ry={170+after*300} fill="url(#softEnergy)" opacity={clamp(1-after/.5)}/>
   <path d="M1975-1554L2215-1309" stroke="#050a12" strokeWidth="16" strokeLinecap="round"/><path d="M1975-1554L2215-1309" stroke="url(#impactCut)" strokeWidth="7" strokeLinecap="round"/>
   {Array.from({length:38},(_,i)=>{const a=rand(i,9)*Math.PI*2,v=140+rand(i,10)*510,d=after*v;const x=2100+Math.cos(a)*d,y=-1430+Math.sin(a)*d+after*after*260;return <path key={i} d="M-9-5L5-8L11 2L-3 7Z" transform={`translate(${x} ${y}) rotate(${rand(i,11)*360+after*(80+rand(i,12)*380)}) scale(${.5+rand(i,13)*1.3})`} fill={i%3?'#586c85':'#c1e0e8'} stroke="#1a2437" strokeWidth="1.5"/>;})}
  </>}
 </g>;
};

export const LensDepth:React.FC<{frame:number;shot:number}>=({frame:f,shot})=><g>
 {![3,4,5,6].includes(shot)&&<g fill="#060b16" stroke="#182333" strokeWidth="3"><path d="M-80 1920L-45 1590L40 1550L93 1700L156 1920Z"/><path d="M965 1920L1020 1690L1115 1620L1190 1920Z"/><path d="M-20 1650l60-37M1040 1720l42-36" stroke="#456072" strokeWidth="3" opacity=".3"/></g>}
 {Array.from({length:12},(_,i)=>{const y=(i*173+f*(9+i%4*3))%2100-70,x=(i*151)%1120-20;return <path key={i} d={`M${x} ${y}l-26 150`} stroke="#c8e6f6" strokeWidth={4+i%3} opacity=".055" strokeLinecap="round"/>;})}
</g>;
