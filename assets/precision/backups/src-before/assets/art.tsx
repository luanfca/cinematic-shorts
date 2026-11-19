import React from 'react';

// Rig adapted from volta2010-short/art.tsx (elbows out and down, hand on the forearm axis, one morphing mouth path).
export type Person='K'|'L';
export type Mood='calm'|'afraid'|'shock'|'angry'|'resolve'|'grief'|'tired';
export type Point=[number,number];
export type HandKind='open'|'relaxed'|'fist'|'grab';
export interface Weapon {kind:'sword'|'great';angle:number;gleam?:number}
export const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
export const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export const ease=(v:number)=>{const p=clamp(v);return p*p*(3-2*p);};
export const lerpPoint=(a:Point,b:Point,p:number):Point=>[mix(a[0],b[0],p),mix(a[1],b[1],p)];

export const CharDefs:React.FC=()=> <defs>
  <linearGradient id="skinK" x1="0" x2="1" y1="0" y2=".3"><stop stopColor="#b98467"/><stop offset=".55" stopColor="#e2b08a"/><stop offset="1" stopColor="#f0c7a0"/></linearGradient>
  <linearGradient id="skinL" x1="0" x2="1" y1="0" y2=".3"><stop stopColor="#a87a6c"/><stop offset=".55" stopColor="#dcae94"/><stop offset="1" stopColor="#ecc6ae"/></linearGradient>
  <linearGradient id="tunicK" x1="0" x2="1"><stop stopColor="#55565a"/><stop offset=".55" stopColor="#8d8c86"/><stop offset="1" stopColor="#a9a79e"/></linearGradient>
  <linearGradient id="armorL" x1="0" x2="1"><stop stopColor="#0f0e13"/><stop offset=".5" stopColor="#2c2a33"/><stop offset="1" stopColor="#4a4652"/></linearGradient>
  <linearGradient id="steelG" x1="0" x2="1"><stop stopColor="#7f8a94"/><stop offset=".45" stopColor="#dfe6ea"/><stop offset=".55" stopColor="#a7b2ba"/><stop offset="1" stopColor="#5d6770"/></linearGradient>
  <linearGradient id="darkSteelG" x1="0" x2="1"><stop stopColor="#30343b"/><stop offset=".5" stopColor="#8a929c"/><stop offset="1" stopColor="#2a2d33"/></linearGradient>
  <linearGradient id="scarfL" x1="0" x2="1"><stop stopColor="#5e0f1c"/><stop offset=".6" stopColor="#b3253a"/><stop offset="1" stopColor="#d7414e"/></linearGradient>
</defs>;

const sstep=(v:number)=>{const q=clamp(v);return q*q*(3-2*q);};
// Elbows always bend outward and down (never across the chest).
export function elbow(a:Point,b:Point,side:number):Point {
  const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.max(1,Math.hypot(dx,dy));
  const px=-dy/d,py=dx/d;
  const o=px*side*.86+py*.51;
  const bendLen=Math.max(d/2,Math.min(160,Math.max(d*.62,100)));
  const len=mix(d/2,bendLen,sstep(Math.abs(o)/.3));
  const h=Math.sqrt(Math.max(0,len*len-d*d/4));
  const s=o>=0?1:-1;
  return [(a[0]+b[0])/2+px*h*s,(a[1]+b[1])/2+py*h*s];
}

const Hand:React.FC<{at:Point;kind:HandKind;rotate:number;skin:string;line:string;flip?:boolean}>=({at,kind,rotate,skin,line,flip=false})=><g transform={`translate(${at[0]} ${at[1]}) rotate(${rotate}) scale(${flip?-1:1} 1)`}>
  {kind==='open'?<><path d="M-24 24L-41-8Q-47-22-39-26Q-31-29-22-11L-20-51Q-20-62-12-62Q-4-62-5-51L-3-21L0-65Q1-77 9-74Q16-73 15-61L13-22L21-58Q24-70 31-65Q38-62 34-50L26-15L35-39Q40-50 46-43Q50-39 44-24L31 16Q26 39 5 42Q-13 41-24 24Z" fill={skin} stroke={line} strokeWidth="3"/><path d="M-13 12Q-5-2 15-5M-4 25L16 18" fill="none" stroke={line} strokeWidth="2.5" opacity=".5"/></>
  :kind==='fist'?<><path d="M-26-14Q-6-30 22-16L33 2L30 34Q18 52-6 47L-26 26Z" fill={skin} stroke={line} strokeWidth="3"/><path d="M-18 4Q4-4 28 6M-20 18Q2 10 28 20" fill="none" stroke={line} strokeWidth="2.5" opacity=".6"/></>
  :kind==='grab'?<><path d="M-27-8Q-25-28-8-29L10-30Q23-31 27-20L21-8Q38-4 31 10L24 29Q12 43-8 34L-27 15Z" fill={skin} stroke={line} strokeWidth="3"/><path d="M-16-13Q0-21 19-12M-16 0Q1-7 23 2M-12 13Q2 5 23 14" fill="none" stroke={line} strokeWidth="2.5" opacity=".7"/></>
  :<path d="M-22-12Q-5-25 18-13L31 1L27 36Q16 54-6 48L-23 28Z" fill={skin} stroke={line} strokeWidth="3"/>}
</g>;

export const Blade:React.FC<{at:Point;w:Weapon}>=({at,w})=>{
  const g=w.kind==='great';const L=g?560:330,W=g?54:28,gl=w.gleam??0;
  return <g transform={`translate(${at[0]} ${at[1]}) rotate(${w.angle})`}>
    <path d={`M${-W/2} -30L${-W/2} ${-L+W}L0 ${-L}L${W/2} ${-L+W}L${W/2} -30Z`} fill={g?'url(#darkSteelG)':'url(#steelG)'} stroke="#1c2026" strokeWidth="4"/>
    <path d={`M0 -40V${-L+W}`} stroke={g?'#23252b':'#66727c'} strokeWidth={g?7:3}/>
    {g&&[120,200,280,360].map(y=><path key={y} d={`M-9 ${-y}h18M0 ${-y-10}v20`} stroke="#d0384a" strokeWidth="4" opacity=".85"/>)}
    <rect x={g?-82:-58} y={-36} width={g?164:116} height={g?22:14} rx="6" fill={g?'#3b1a21':'#707378'} stroke="#17191c" strokeWidth="3"/>
    <rect x={g?-13:-10} y={-22} width={g?26:20} height={g?118:72} rx="4" fill={g?'#2a1316':'#5c3b25'}/>
    <circle cy={g?100:56} r={g?18:12} fill={g?'#a3243a':'#8b8d91'} stroke="#17191c" strokeWidth="3"/>
    {gl>0&&<g opacity={gl}><path d={`M${-W/4} -44L${-W/4} ${-L+W+14}`} stroke="#ffffff" strokeWidth="6" strokeLinecap="round"/><path d={`M0 ${-L-60}V${-L+60}M-60 ${-L}H60`} stroke="#fff6dc" strokeWidth="6" strokeLinecap="round"/><circle cy={-L} r="20" fill="#ffffff"/></g>}
  </g>;
};

const Arm:React.FC<{side:number;sx:number;hand:Point;kind:HandKind;who:Person;rotation?:number;weapon?:Weapon|null}>=({side,sx,hand,kind,who,rotation=0,weapon})=>{
  const K=who==='K';const a:Point=[side*sx,190];const e=elbow(a,hand,side);
  const sleeve=K?'#8b8a80':'#26232b',trim=K?'#bcb9ae':'#b02a40',out=K?'#33343a':'#0b0a0e',width=K?54:68;
  const skin=K?'#e2b08a':'#2e292e',line=K?'#6d4c3e':'#0e0c10';
  // The hand follows the forearm; the wrist and the cuff sit on the forearm's own axis.
  const ux=hand[0]-e[0],uy=hand[1]-e[1],ul=Math.max(1,Math.hypot(ux,uy)),nx=ux/ul,ny=uy/ul;
  const wrist:Point=[hand[0]-nx*8,hand[1]-ny*8];
  const follow=(kind==='open'?Math.atan2(nx,-ny):Math.atan2(-nx,ny))*180/Math.PI;
  const handRot=follow+rotation*.25;
  const c1:Point=[wrist[0]-ny*22,wrist[1]+nx*22],c2:Point=[wrist[0]+ny*22,wrist[1]-nx*22];
  const b1:Point=[mix(e[0],wrist[0],.35),mix(e[1],wrist[1],.35)];
  return <g>
    {weapon&&<Blade at={hand} w={weapon}/>}
    <path d={`M${a}L${e}L${wrist}`} fill="none" stroke={out} strokeWidth={width+11} strokeLinecap="round" strokeLinejoin="round"/>
    <path d={`M${a}L${e}L${wrist}`} fill="none" stroke={sleeve} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"/>
    <path d={`M${a[0]+side*15} ${a[1]}L${e[0]+side*13} ${e[1]}L${wrist[0]+side*10} ${wrist[1]}`} fill="none" stroke={trim} strokeWidth={K?4:6} opacity={K?.5:.85}/>
    {/* Bracer: leather for Kai, crimson-banded gauntlet for Lira. */}
    <path d={`M${b1[0]} ${b1[1]}L${wrist[0]} ${wrist[1]}`} stroke={K?'url(#leatherWet)':'#121015'} strokeWidth={width+4} strokeLinecap="round"/>
    <path d={`M${c1[0]} ${c1[1]}L${c2[0]} ${c2[1]}`} stroke={K?'#3f2b1d':'#b02a40'} strokeWidth="13"/>
    <Hand at={hand} kind={kind} rotate={handRot} skin={skin} line={line} flip={side<0}/>
  </g>;
};
export {Arm};
export {Hand};

export interface ActorProps {who:Person;x:number;y:number;scale?:number;frame:number;mouth:number;mood:Mood;look?:number;left?:Point;right?:Point;leftKind?:HandKind;rightKind?:HandKind;leftRotate?:number;rightRotate?:number;sink?:number;tilt?:number;tear?:number;lean?:number;stride?:number;sword?:Weapon|null;swordLeft?:Weapon|null;wet?:number;scarfWind?:number;leftFoot?:Point;rightFoot?:Point;shadow?:number;breathScale?:number;view?:'front'|'threeQuarter';headVisible?:boolean;lookY?:number;collarPull?:number;leftBootAngle?:number;rightBootAngle?:number;}

export const Actor:React.FC<ActorProps>=({who,x,y,scale=1,frame,mouth,mood,look=0,left=[-140,500],right=[140,500],leftKind='relaxed',rightKind='relaxed',leftRotate=0,rightRotate=0,sink=0,tilt=0,tear=0,lean=0,stride=0,sword=null,swordLeft=null,wet=0,scarfWind=0,leftFoot,rightFoot,shadow=1,breathScale=1,view='front',headVisible=true,lookY=0,collarPull=0,leftBootAngle=0,rightBootAngle=0})=>{
  const K=who==='K';const sw=K?112:136;const breath=Math.sin(frame/19+(K?0:2))*1.8*breathScale;const drop=sink+breath;
  const skin=`url(#skin${who})`;const knee=715+sink*.37;
  // Stride swings the feet in opposite directions; the hips stay put so feet never "swim".
  const fl=-stride*70,fr=stride*70,kl=-stride*35,kr=stride*35;
  const lf:Point=leftFoot??[-78+fl,878],rf:Point=rightFoot??[80+fr,878];
  const hipL:Point=[-62,505+drop],hipR:Point=[62,505+drop];
  const legJoint=(a:Point,b:Point,side:number):Point=>{
    const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.max(1,Math.hypot(dx,dy));
    // Screen-space foreshortening keeps a frontal crouch from spreading the knees unnaturally.
    const len=Math.max(d*.502,Math.min(192,d*.58)),h=Math.sqrt(Math.max(0,len*len-d*d*.25));
    return [(a[0]+b[0])/2+side*dy/d*h,(a[1]+b[1])/2-side*dx/d*h];
  };
  const kneeL=legJoint(hipL,lf,-1),kneeR=legJoint(hipR,rf,1);
  const legs=`M${hipL}L${kneeL}L${lf}M${hipR}L${kneeR}L${rf}`;
  const sa=Math.sin(frame/9)*scarfWind*14;
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cx="10" cy="918" rx={K?150:175} ry="24" fill="#05060c" opacity={.45*shadow}/>
    {/* Lira's tattered scarf trails behind the body. */}
    {!K&&<path d={`M40 150Q${160+scarfWind*90} ${330+sa} ${230+scarfWind*190} ${560+sa*2}L${250+scarfWind*200} ${640+sa*2}L${200+scarfWind*170} ${600+sa}L${215+scarfWind*180} ${690+sa*2}L${160+scarfWind*120} ${570}Q90 380 -20 190Z`} fill="url(#scarfL)" stroke="#3a0810" strokeWidth="5"/>}
    {!K&&!sword&&<g transform="rotate(-24 0 300)"><Blade at={[30,740]} w={{kind:'great',angle:0}}/></g>}
    <g fill="none" strokeLinecap="round" strokeLinejoin="round"><path d={legs} stroke={K?'#26272b':'#060509'} strokeWidth={K?80:96}/><path d={legs} stroke={K?'#76756f':'#25222a'} strokeWidth={K?66:80}/>{!K&&<path d={`M${hipL}L${kneeL}M${hipR}L${kneeR}`} stroke="#9e2236" strokeWidth="8" opacity=".8"/>}</g>
    {/* Boots: soft brown for Kai, plated black for Lira. */}
    <g transform={`translate(${lf[0]+78} ${lf[1]-878}) rotate(${leftBootAngle} -78 878)`}><path d="M-128 846Q-84 828-44 850L-43 909H-158Q-166 880-126 868Z" fill={K?'#6b4529':'#141217'} stroke="#120d0b" strokeWidth="6"/><path d="M-152 904H-46" stroke={K?'#a87a4f':'#b02a40'} strokeWidth="7"/></g>
    <g transform={`translate(${rf[0]-80} ${rf[1]-878}) rotate(${rightBootAngle} 80 878)`}><path d="M48 850Q86 832 124 850L162 882Q174 912 143 912H46Z" fill={K?'#6b4529':'#141217'} stroke="#120d0b" strokeWidth="6"/><path d="M50 906H160" stroke={K?'#a87a4f':'#b02a40'} strokeWidth="7"/></g>
    <g transform={`translate(0 ${drop}) rotate(${lean} 0 520)`}>
      <Arm side={-1} sx={sw-8} hand={left} kind={leftKind} who={who} rotation={leftRotate} weapon={swordLeft}/>
      {K?<>
        <path d={`M-${sw} 180Q-70 128 0 140Q70 128 ${sw} 180L104 540Q0 575-104 540Z`} fill="url(#tunicK)" stroke="#2f3034" strokeWidth="6"/>
        <path d="M-34 146L0 262L34 146" fill="#5f5f63" stroke="#3a3a3e" strokeWidth="5"/><path d="M-8 170l16 16M-8 200l16 16" stroke="#3c2a1d" strokeWidth="4"/>
        {[ -70,-20,40,80].map(x=><path key={x} d={`M${x} 300q4 110-3 220`} stroke="#6e6d68" strokeWidth="3" fill="none" opacity=".6"/>)}
        <path d="M-108 455Q0 480 108 455L110 492Q0 516-110 492Z" fill="#5a3b24" stroke="#2a1b10" strokeWidth="4"/><rect x="-18" y="462" width="36" height="34" rx="4" fill="none" stroke="#b49a62" strokeWidth="6"/>
        {!sword&&!swordLeft&&<g transform="translate(-96 488) rotate(-160)"><rect x="-14" y="-12" width="28" height="270" rx="10" fill="#4b331f" stroke="#1d140c" strokeWidth="4"/><rect x="-36" y="-30" width="72" height="14" rx="5" fill="#707378"/><rect x="-9" y="-80" width="18" height="52" rx="4" fill="#5c3b25"/><circle cy="-86" r="11" fill="#8b8d91"/></g>}
      </>:<>
        <path d={`M-${sw} 178Q-80 120 0 132Q80 120 ${sw} 178L118 540Q0 580-118 540Z`} fill="url(#armorL)" stroke="#060508" strokeWidth="6"/>
        <path d="M-90 230Q0 270 90 230L84 330Q0 365-84 330Z" fill="#1c1a21" stroke="#9e2236" strokeWidth="5"/>
        <path d="M0 250V520M-100 420Q0 445 100 420" stroke="#9e2236" strokeWidth="5" fill="none"/>
        <path d="M-80 380l20 30M80 380l-20 30" stroke="#5b5664" strokeWidth="4"/>
        <path d={`M-${sw+34} 168Q-${sw} 120-70 150L-80 250Q-${sw+20} 260-${sw+44} 220Z M${sw+34} 168Q${sw} 120 70 150L80 250Q${sw+20} 260 ${sw+44} 220Z`} fill="#2a2730" stroke="#b02a40" strokeWidth="5"/>
        <path d="M-70 140Q0 205 70 140L64 185Q0 230-64 185Z" fill="url(#scarfL)" stroke="#3a0810" strokeWidth="5"/>
      </>}
      {K?<g pointerEvents="none"><path d="M-112 180Q-70 128 0 140Q70 128 112 180L104 540Q0 575-104 540Z" fill="url(#clothWeave)"/><path d="M-112 180Q-70 128 0 140Q70 128 112 180L104 540Q0 575-104 540Z" fill="url(#bodyShade)"/><path d="M-86 205L-70 432M81 206L70 431M-72 520Q0 540 73 520" fill="none" stroke="#c1c9bb" strokeWidth="2.2" strokeDasharray="4 6" opacity=".45"/><path d="M-86 270l32 20-21 14M80 349l-28 21 19 13M-65 401l30 12M42 479l30-5" stroke="#3e454d" strokeWidth="3" opacity=".4" fill="none"/></g>:<g pointerEvents="none"><path d="M-136 178Q-80 120 0 132Q80 120 136 178L118 540Q0 580-118 540Z" fill="url(#ironWear)"/><path d="M-136 178Q-80 120 0 132Q80 120 136 178L118 540Q0 580-118 540Z" fill="url(#bodyShade)"/><path d="M-91 244Q0 284 91 244M-94 429Q0 454 94 429M-79 503L-79 473M79 503L79 473" stroke="url(#silverEdge)" strokeWidth="3" fill="none"/>{[-1,1].map(side=><g key={side}>{[284,335,382,476].map(y=><g key={y}><circle cx={side*94} cy={y} r="5" fill="#0c0d15" stroke="#6f7c89" strokeWidth="1.5"/><circle cx={side*94-1} cy={y-1} r="1.5" fill="#bfced9"/></g>)}</g>)}<path d="M-67 296l11 14M35 313l14-7M-30 392l11 18M58 468l13-8" stroke="#96a4af" strokeWidth="1.6" opacity=".4" fill="none"/></g>}
      {wet>0&&<g opacity={wet*.3} stroke="#d6ecf5" fill="none" strokeLinecap="round">{[-67,-19,43,80].map((x,i)=><path key={i} d={`M${x} ${215+(frame*.8+i*67)%260}l-2 ${10+i%3*8}`} strokeWidth={i%2?1.3:2.1}/>)}</g>}
      {K&&collarPull>0&&<g opacity={collarPull} fill="none" strokeLinecap="round"><path d="M85 185Q45 184 18 225M85 185Q71 227 99 265M85 185Q46 233 53 288" stroke="#3f444d" strokeWidth="3.4"/><path d="M79 187Q41 190 17 230M90 187Q76 232 102 268" stroke="#c3c7b6" strokeWidth="2" opacity=".6"/></g>}
      <path d="M-36 96V162Q0 194 36 162V96" fill={skin} stroke="#7a5446" strokeWidth="4"/>
      {headVisible&&<g transform={`rotate(${tilt}) translate(${view==='threeQuarter'?16:0} 0) scale(${view==='threeQuarter'?.86:1} 1)`}>
        {!K&&<path d={`M70-80Q150-40 130 80Q120 200 ${150+Math.sin(frame/13)*6} 330L120 340Q100 220 92 120Q90 30 40-40Z`} fill="#c9cdd6" stroke="#6f7480" strokeWidth="5"/>}
        {!K&&[120,190,260,320].map(yy=><path key={yy} d={`M${108+yy*.07} ${yy-30}q20 18 32-4`} stroke="#8a8f9b" strokeWidth="4" fill="none"/>)}
        <ellipse cx="-104" cy="6" rx="22" ry="35" fill={skin} stroke="#7a5446" strokeWidth="4"/><ellipse cx="104" cy="6" rx="22" ry="35" fill={skin} stroke="#7a5446" strokeWidth="4"/>
        <path d={K?'M-104-62Q-100-146 2-148Q104-140 106-58L98 58Q78 124 4 142Q-66 130-98 62Z':'M-102-70Q-94-150 2-152Q100-146 104-64L94 50Q70 126 2 150Q-62 132-92 56Z'} fill={skin} stroke="#6f4e42" strokeWidth="4"/>
        <path d="M-92-47Q-100 40-66 83Q-34 122 6 132Q-62 128-92 62Z" fill="#5d3e3a" opacity=".22"/>
        <path d="M84-76Q110-15 96 55Q80 104 42 118" fill="none" stroke={K?'#ffd9b4':'#ffd2c4'} strokeWidth="5" opacity=".5"/>
        {wet>0&&<g opacity={wet}>{[[-70,-60],[60,-90],[78,40],[-58,60],[20,110]].map(([wx,wy],i)=><path key={i} d={`M${wx} ${wy+(frame*1.7+i*19)%26}q-4 8 0 12q4-4 0-12Z`} fill="#d8eef6" stroke="#8cb5c8" strokeWidth="1.5"/>)}</g>}
        <path d="M3 2L-2 31M-62-30Q-44-42-22-29M25-29Q46-43 65-30" stroke={K?'#ffdfbd':'#f9d3c7'} strokeWidth="2.4" opacity=".28" fill="none"/>
        <Face who={who} frame={frame} mood={mood} mouth={mouth} look={look} lookY={lookY} tear={tear}/>
        {K?<><path d="M-114-14Q-140-90-104-128L-128-150L-74-150L-60-186L-20-160L10-198L36-158L80-182L84-140L130-134L112-70L118-10L98-56L92-92Q40-70 2-108Q-30-76-70-92L-88-30Z" fill="#141317" stroke="#050506" strokeWidth="4"/><path d="M-80-124Q-30-150 30-130M-30-110Q20-90 80-118M-96-80L-74-60" fill="none" stroke="#3b3a44" strokeWidth="6"/><path d="M-20-104L-34-48M24-100L30-52M60-96L74-54" stroke="#141317" strokeWidth="14" strokeLinecap="round"/></>
        :<><path d="M-108-30Q-130-110-80-146Q-20-182 50-160Q120-140 114-60L104-14L86-84Q40-110-10-92Q-50-80-82-96Q-92-60-98-12Z" fill="#c9cdd6" stroke="#6f7480" strokeWidth="5"/><path d="M-86-120Q-30-160 40-140M-60-100Q0-120 70-104" fill="none" stroke="#f1f3f7" strokeWidth="6" opacity=".7"/><path d="M-62-96L-96-6" stroke="#c9cdd6" strokeWidth="18" strokeLinecap="round"/></>}
      </g>}
      <Arm side={1} sx={sw-8} hand={right} kind={rightKind} who={who} rotation={rightRotate} weapon={sword}/>
    </g>
  </g>;
};

const Face:React.FC<{who:Person;frame:number;mood:Mood;mouth:number;look:number;lookY:number;tear:number}>=({who,frame,mood,mouth,look,lookY,tear})=>{
  const K=who==='K';const shock=mood==='shock';const angry=mood==='angry'||mood==='resolve';const sad=mood==='grief'||mood==='tired';const scared=mood==='afraid';
  const blinkAt=(frame+(K?0:61))%137;const blink=blinkAt>131&&blinkAt<136;
  // Lira's lids sit low (tired); Kai's eyes open wide in fear.
  const h=blink?2:shock?33:angry?(K?17:13):sad?(K?19:14):scared?30:(K?24:17);
  const px=clamp((look+1)/2)*14-7;const browY=shock?-66:scared?-55:angry?-38:sad?-50:-48;
  const open=mouth<.03?0:Math.pow(Math.min(1,(mouth-.03)*1.15),.9);
  const shape=shock?{xl:-13,yl:81,xr:21,yr:81,cy:71}:angry?{xl:-30,yl:84,xr:34,yr:84,cy:74}:sad||scared?{xl:-27,yl:88,xr:33,yr:86,cy:69}:{xl:-26,yl:80,xr:30,yr:80,cy:82};
  const halfW=shock?16:angry?21:sad?17:scared?18:19;
  const mxl=mix(shape.xl,3-halfW,open),mxr=mix(shape.xr,5+halfW,open),myl=mix(shape.yl,84,open),myr=mix(shape.yr,84,open),mcx=(mxl+mxr)/2;
  const yAvg=(myl+myr)/2,depth=angry||scared?30:shock?28:sad?22:24;
  const ctrlTop=mix(shape.cy,yAvg-depth*1.2,open),ctrlBot=mix(shape.cy,yAvg+depth*1.9,open);
  const mpath=`M${mxl} ${myl}Q${mcx} ${ctrlTop} ${mxr} ${myr}Q${mcx} ${ctrlBot} ${mxl} ${myl}Z`;
  const topA=(yAvg+ctrlTop)/2,mid=`mouth-${who}`;
  const iris=K?'url(#irisK)':'url(#irisL)',ring=K?'#1c130f':'#7a4c10',browC=K?'#141317':'#a8adb8';
  return <g>
    {[-46,48].map((cx,i)=><g key={i}><defs><clipPath id={`eye-${who}-${i}`}><path d={`M${cx-27} -3Q${cx} ${-3-h*1.25} ${cx+27} -3Q${cx} ${-3+Math.max(h,8)} ${cx-27} -3Z`}/></clipPath></defs><path d={`M${cx-27} ${-3}Q${cx} ${-3-h*1.25} ${cx+27} -3Q${cx} ${-3+Math.max(h,8)} ${cx-27} -3Z`} fill="#f4e6d2" stroke="#4a3530" strokeWidth="3.5"/>{!blink&&<g clipPath={`url(#eye-${who}-${i})`}><ellipse cx={cx+px} cy={-4+(sad?4:0)+lookY*5} rx="12" ry={Math.min(14,h*.78)} fill={iris}/><ellipse cx={cx+px} cy={-4+(sad?4:0)+lookY*5} rx="5.5" ry={Math.min(9,h*.6)} fill={ring}/><circle cx={cx+px+3} cy={-9+(sad?4:0)+lookY*5} r="3" fill="#fff6e2"/></g>}
      {!K&&<path d={`M${cx-28} ${-4}Q${cx} ${-8-h*1.05} ${cx+28} -4`} fill="none" stroke="#2a1d1e" strokeWidth="5"/>}
      {!K&&<path d={`M${cx-22} 16Q${cx} 24 ${cx+22} 16`} fill="none" stroke="#7d5148" strokeWidth="2.5" opacity=".55"/>}</g>)}
    <g fill="none" stroke={browC} strokeWidth={K?12:9} strokeLinecap="round"><path d={angry?`M-82 ${browY-18}L-20 ${browY+6}`:sad||scared?`M-82 ${browY+9}Q-50 ${browY-10}-21 ${browY-16}`:`M-82 ${browY+5}Q-52 ${browY-8}-21 ${browY+3}`}/><path d={angry?`M22 ${browY+6}L84 ${browY-18}`:sad||scared?`M22 ${browY-16}Q52 ${browY-9} 84 ${browY+9}`:`M22 ${browY+3}Q52 ${browY-8} 84 ${browY+5}`}/></g>
    <path d={K?'M2-6L-8 38Q2 46 15 37':'M3-6L-5 36Q3 42 13 35'} stroke="#9a6650" strokeWidth="4" strokeLinecap="round" fill="none"/>
    {/* Lira's scar crosses her left cheek. */}
    {!K&&<g><path d="M58 22L88 70" stroke="#8c4a46" strokeWidth="6" strokeLinecap="round"/><path d="M62 36l10-4M70 50l10-4M78 62l9-4" stroke="#8c4a46" strokeWidth="3"/></g>}
    {K&&<path d="M-76 34Q-58 46-32 37M28 37Q56 47 76 31" stroke="#bb8162" strokeWidth="3" opacity=".55" fill="none"/>}
    <g><clipPath id={mid}><path d={mpath}/></clipPath>
      {open>.04&&<path d={mpath} fill="#3e1f20"/>}
      {open>.04&&<g clipPath={`url(#${mid})`}><rect x={mxl-4} y={topA-2} width={mxr-mxl+8} height={clamp(open*1.5)*8} fill="#efdcc0" opacity={clamp((open-.15)/.15)*(sad?.55:.8)}/></g>}
      <path d={mpath} fill="none" stroke={K?'#86503f':'#7e4040'} strokeWidth={mix(5,3.5,open)} strokeLinejoin="round" strokeLinecap="round"/>
    </g>
    {tear>0&&<g opacity={clamp(tear*1.4)}><path d={`M-50 14Q-56 40-53 ${50+Math.min(50,tear*50)}`} stroke="#e4f2f6" strokeWidth="5" fill="none"/><ellipse cx="-53" cy={54+Math.min(50,tear*50)} rx="5" ry="8" fill="#e8f6fa" stroke="#9cc4d2" strokeWidth="1.5"/></g>}
  </g>;
};
