import {ev} from './pov';
import {night as palette} from './nightLighting';
import {editTime} from './timing';
import {emotionAt} from './emotion';
import type {Viseme} from './performance';
import React from 'react';
import {mix} from './pov';
import {elbow,type Point} from './assets/art';
export const Character:React.FC<{teacher?:boolean;crouch?:boolean;crouchAmount?:number;footTargets?:Point[];viseme?:Viseme;mouth:number;t:number;finger?:number;silent?:boolean}>=({teacher=false,crouch=false,crouchAmount,footTargets,viseme=1,mouth,t,finger=0,silent=false})=>{
 const k=crouchAmount??(crouch?1:0),blend=(a:number,b:number)=>mix(a,b,k);
 const rt=editTime(t),acting=emotionAt(t,teacher),panic=acting.fear+acting.panic+acting.shock>.45,fear=acting.fear+acting.panic;
 const blinkTimes=teacher?[1.7,5.9,10.7,15.8,20.5,25.6,30.9,36.3,41.2,46.4,51.9,56.7,62.4,67.9,73.5,79.4,84.8,90.4,96.5,102.8,108.9]:[3.2,7.8,12.1,17.3,22.8,27.1,32.5,37.3,43.7,48.4,53.6,59.4,64.2,69.8,76.3,82.7,88.9,94.7,101.5,107.5,113.1];
 const blink=blinkTimes.reduce((v,at)=>Math.max(v,Math.max(0,1-Math.abs(rt-at)/.09)),0),eyeOpen=1-blink*(1-acting.still),h=acting.eye*eyeOpen;
 const gaze=acting.gaze,pupil=9+fear*.8+acting.shock*.4;
 const headTilt=acting.tilt+Math.sin(rt*.9)*.35*(1-acting.still)+Math.sin(rt*7)*Math.min(mouth,.5)*.6;
 const phoneLight=!teacher&&(t>=47&&t<53.2);
 const breath=acting.breath,lip=mouth<.045?0:viseme===0?.06:mouth,lipWidth=viseme===3?15:viseme===2?28:viseme===4?23:22;
 const tension=acting.shoulder,shake=acting.tremor,rest=acting.jaw*(lip<.07?1:0),night=1;
 const shoulder:Point=[95,blend(155,140)-tension],hand:Point=finger>.01?[145-finger*140,200-finger*125]:[blend(155,150)+shake-acting.grip*10+acting.block*10,blend(330,285)-tension*.25-acting.block*20],joint=elbow(shoulder,hand,1),otherA:Point=[-95,blend(155,140)-tension],otherH:Point=[blend(-150,teacher?-110:-145)-shake*.7+acting.grip*7,blend(330,teacher?340:285)-tension*.25],otherE=elbow(otherA,otherH,-1);
 const shirt=teacher?'url(#teacherCloth)':'url(#uniformCloth)',skin=`url(#skin-${teacher?'e':'d'})`,lower=blend(teacher?420:300,250);
 const feet=footTargets||[[-blend(teacher?60:100,teacher?45:115),blend(teacher?629:505,385)],[blend(teacher?60:100,115),blend(teacher?629:505,385)]];
 const legs=`M-55 ${blend(teacher?410:300,245)}L${blend(teacher?-60:-100,teacher?-120:-165)} ${blend(teacher?620:375,teacher?360:280)}L${feet[0][0]} ${feet[0][1]}M55 ${blend(teacher?410:300,245)}L${blend(teacher?60:100,165)} ${blend(teacher?620:375,280)}L${feet[1][0]} ${feet[1][1]}`;
 return <g><defs><linearGradient id={`skin-${teacher?'e':'d'}`} x1="0%" y1="72%" x2="100%" y2="29%"><stop stopColor={phoneLight?'#a0adb9':palette.faceShadow}/><stop offset=".47" stopColor={phoneLight?'#bec2ce':palette.faceMid}/><stop offset="1" stopColor={palette.sideKey}/></linearGradient></defs>
  <path d={`M-65 ${blend(teacher?405:285,230)}H65L75 ${blend(teacher?440:335,270)}Q0 ${blend(teacher?465:350,290)}-75 ${blend(teacher?440:335,270)}Z`} fill={teacher?'#233646':'#334d66'} stroke="#162b3e" strokeWidth="5"/>
  <path d={legs} fill="none" stroke="#101b2b" strokeWidth="65" strokeLinecap="round" strokeLinejoin="round"/>
  <path d={legs} fill="none" stroke={teacher?'#233646':'#334d66'} strokeWidth="49" strokeLinecap="round" strokeLinejoin="round"/>
  {[-1,1].map(s=><g key={s} transform={`translate(${feet[s<0?0:1][0]} ${feet[s<0?0:1][1]}) rotate(${s*blend(3,12)})`}><path d="M-30-12Q0-24 30-12L45 8Q50 24 27 25H-32Z" fill="#122436" stroke="#526b80" strokeWidth="4"/><path d="M-29 20H32" stroke="#78909e" strokeWidth="3"/></g>)}
  <g transform={`translate(${-acting.recoil*.62} ${breath+acting.recoil*.44}) translate(${-acting.lean*250} 0) matrix(1 0 ${acting.lean} 1 0 0)`}>
  <path d={`M${otherA}L${otherE}L${otherH}`} fill="none" stroke="#1d3040" strokeWidth="57" strokeLinecap="round" strokeLinejoin="round"/><path d={`M${otherA}L${otherE}L${otherH}`} fill="none" stroke={teacher?'#627e8d':'#c1d5dc'} strokeWidth="43" strokeLinecap="round" strokeLinejoin="round"/>
  <path d={`M-105 ${125-tension}Q0 ${85-tension*.45} 105 ${125-tension}L100 ${lower}Q0 ${lower+30}-100 ${lower}Z`} fill={shirt} stroke="#243b4b" strokeWidth="6"/>
  <path d={`M-45 117L0 192L45 117M0 193V${lower-20}`} fill="none" stroke={teacher?'#afc3c7':'#496f86'} strokeWidth="5"/>
  <path d={`M-85 210H85M-80 ${lower-30}H80`} stroke="#acc0c4" opacity=".3" strokeWidth="3"/>
  {!teacher&&<><path d="M-92 125L-75 145V205L-92 185Z M92 125L75 145V205L92 185Z" fill="#315b7c"/><path d="M55 230h29v28H55Z" fill="#c5d9dd" stroke="#53758a" strokeWidth="3"/></>}
  {teacher&&k<1&&<path opacity={1-k} d="M-100 325Q0 350 100 325L120 460H-120Z" fill="#263e51" stroke="#162c3e" strokeWidth="6"/>}
  <path d="M-30 67V120Q0 150 30 120V67" fill={skin} stroke="#895b4b" strokeWidth="4"/>
  <g transform={`translate(${-acting.neck*.35} ${acting.neck*.7}) rotate(${headTilt})`}>
   {teacher&&<ellipse cx="65" cy="-115" rx="65" ry="59" fill="#352721" stroke="#1b2026" strokeWidth="5"/>}
   <ellipse cx="-89" cy="5" rx="20" ry="31" fill={skin} stroke="#8b6252" strokeWidth="4"/><ellipse cx="89" cy="5" rx="20" ry="31" fill={skin} stroke="#8b6252" strokeWidth="4"/>
   <path d="M-90-55Q-88-127 0-129Q90-124 91-53L83 48Q65 104 0 119Q-65 103-85 47Z" fill={skin} stroke="#7d594b" strokeWidth="4"/>
   <path d="M82-42Q91 24 71 57" fill="none" stroke="#b5d7e0" strokeWidth="3.5" opacity={night*.48}/><path d="M-81-25Q-94 60-28 98" fill="none" stroke="#986b54" opacity=".3" strokeWidth="9"/>
   {[-40,42].map((cx,i)=>{const eye=`M${cx-25} 0Q${cx} ${-h} ${cx+25} 0Q${cx} ${h*.8} ${cx-25} 0Z`,id=`eye-${teacher?'e':'d'}-${i}`;return <g key={i}><defs><clipPath id={id}><path d={eye}/></clipPath></defs><path d={eye} fill="#ddd9e1"/>{eyeOpen>.08&&<g clipPath={`url(#${id})`}><ellipse cx={cx+gaze} cy="0" rx={pupil} ry={13+acting.shock*1.7} fill={teacher?'#66523b':'#755a3f'}/><ellipse cx={cx+gaze} cy="1" rx="4" ry="9" fill="#1b2228"/><circle cx={cx+gaze+3} cy="-5" r="2.7" fill="#fff4dc"/><circle cx={cx+gaze-3} cy="3" r="1.2" fill="#d2eaf7" opacity={night*(.62+acting.shock*.29)}/></g>}<path d={eye} fill="none" stroke="#513d37" strokeWidth="4"/></g>;})}
   {teacher&&<g fill="none" stroke="#263d4d" strokeWidth="5"><rect x="-70" y="-25" width="60" height="45" rx="15"/><rect x="10" y="-25" width="60" height="45" rx="15"/><path d="M-10-5H10M-70-10L-86-18M70-10L86-18"/></g>}
   <path d={`M-72 ${-40-acting.outer-acting.asym} Q-45 ${-51-acting.inner*.6-acting.asym} -18 ${-43-acting.inner-acting.asym*.3} M18 ${-43-acting.inner+acting.asym*.3} Q45 ${-51-acting.inner*.6+acting.asym} 72 ${-40-acting.outer+acting.asym*.5}`} fill="none" stroke="#49322b" strokeWidth="8" strokeLinecap="round"/>
   <path d="M3 7L-6 37Q0 43 12 36" fill="none" stroke="#9b6c53" strokeWidth="4" strokeLinecap="round"/>
   {(finger<.8||mouth>.045)&&<g><path d={lip<.07?(rest>1.4?`M-16 68Q0 ${64-rest*.6} 16 68Q0 ${68+rest*2} -16 68Z`:`M-${lipWidth} 69 Q0 ${74-(acting.worry+acting.fear+acting.panic)*11-acting.confusion*7-(teacher?5:0)} ${lipWidth} ${69+acting.confusion*2}`):`M-${lipWidth} 67 Q0 ${66-lip*19+acting.jawTremor} ${lipWidth} 67 Q0 ${70+lip*39+acting.jawTremor} -${lipWidth} 67 Z`} fill={(lip>.07||rest>1.4)&&!silent?'#482d32':'none'} stroke="#79564f" strokeWidth="3.6" strokeLinecap="round"/>{lip>.12&&viseme===2&&<path d="M-16 67Q0 62 17 67" fill="none" stroke="#e4d9cd" strokeWidth="3"/>}</g>}

   {teacher?<><path d="M-92-15Q-120-125-20-145Q100-159 96-36L76-75Q25-65-25-105Q-51-76-79-61Z" fill="#3b2b24" stroke="#24272c" strokeWidth="5"/><path d="M-68-104Q0-143 62-106" stroke="#7a5d47" strokeWidth="6" fill="none"/></>:<><path d="M-97-13Q-119-63-94-85Q-115-128-71-135Q-55-172-18-147Q22-175 49-142Q99-151 102-108Q132-83 101-42L86-13L73-73Q27-63 2-91Q-30-62-65-79L-79-21Z" fill="#292a30" stroke="#18202b" strokeWidth="5"/><path d="M-65-111Q-13-138 38-109M22-94l37-13" stroke="#5c5860" strokeWidth="6" fill="none"/></>}
   {panic&&<path d="M74 29q-7 15 0 21q8-7 0-21Z" fill="#accbd1" opacity=".7"/>}
  </g>
  {k>0&&<g opacity={k}>{[-1,1].map(side=><ellipse key={side} cx={teacher&&side<0?-120:side*165} cy={teacher&&side<0?360:280} rx="43" ry="38" fill={teacher?'#233646':'#334d66'} stroke="#162b3e" strokeWidth="5"/>)}</g>}
  <path d={`M${shoulder}L${joint}L${hand}`} fill="none" stroke="#233749" strokeWidth="56" strokeLinecap="round" strokeLinejoin="round"/><path d={`M${shoulder}L${joint}L${hand}`} fill="none" stroke={teacher?'#6c8896':'#c6d7da'} strokeWidth="43" strokeLinecap="round" strokeLinejoin="round"/>
  <g transform={`translate(${hand}) rotate(${acting.grip*9})`}><path d={finger>.5?'M-15 19L-14-11L-6-56Q3-63 8-53L6-8Q26-18 28-1L24 27Q8 44-12 29Z':'M-23-12Q0-28 21-12L29 7L21 34Q-3 48-23 21Z'} fill={skin} stroke="#825d4c" strokeWidth="4"/></g>
  <ellipse cx={otherH[0]} cy={otherH[1]+7} rx="25" ry="32" fill={skin} stroke="#825d4c" strokeWidth="4"/></g>
 </g>;
};

export const PupilBack:React.FC<{crouch:boolean;crouchAmount?:number;footTargets?:Point[];t:number;variant:number}>=({crouch,crouchAmount,footTargets,t,variant})=>{
 const k=crouchAmount??(crouch?1:0),blend=(a:number,b:number)=>mix(a,b,k);
 const feet=footTargets||[[-blend(65,110),blend(522,380)],[blend(65,110),blend(522,380)]];
 const hair=['#302b2a','#493326','#252c38'][variant],shirt=['#bdcdd5','#c5d6db','#adc4d0'][variant];
 const sway=Math.sin(t*1.3+variant)*1.3;
 return <g>
  <path d={`M-48 ${blend(275,245)}L${blend(-65,-155)} ${blend(400,280)}L${feet[0][0]} ${feet[0][1]}M48 ${blend(275,245)}L${blend(65,155)} ${blend(400,280)}L${feet[1][0]} ${feet[1][1]}`} fill="none" stroke="#182e43" strokeWidth="53" strokeLinecap="round" strokeLinejoin="round"/>
  {[-1,1].map(s=><g key={s} transform={`translate(${feet[s<0?0:1][0]} ${feet[s<0?0:1][1]})`}><path d="M-26-9Q0-20 25-7L39 10L31 22H-30Z" fill="#162738" stroke="#6a8294" strokeWidth="4"/></g>)}
  <path d={`M-95 110Q0 73 95 110L${blend(100,90)} ${blend(300,245)}Q0 ${blend(326,265)}${blend(-100,-90)} ${blend(300,245)}Z`} fill={shirt} stroke="#304b60" strokeWidth="5"/>
  <path d={`M-84 128L-130 ${blend(236,210)}L${blend(-105,-150)} ${blend(300,280)}M84 128L130 ${blend(236,210)}L${blend(105,150)} ${blend(300,280)}`} fill="none" stroke="#91aebe" strokeWidth="36" strokeLinecap="round" strokeLinejoin="round"/>
  <g transform={`translate(${sway*.65} 0) rotate(${Math.sin(editTime(t)*.6+variant)*.6})`}><path d="M-30 74V113Q0 143 30 113V74" fill="#c49b7f" stroke="#6d5c55" strokeWidth="4"/>
  <ellipse cx="-79" cy="15" rx="15" ry="27" fill="#c49b7f"/><ellipse cx="79" cy="15" rx="15" ry="27" fill="#c49b7f"/>
  <path d="M-82-44Q-80-119 0-123Q84-116 85-43L78 45Q50 91 0 95Q-50 90-78 45Z" fill={hair} stroke="#202c37" strokeWidth="5"/>
  <path d="M-65-45Q0-100 65-45M-57-20Q0-73 57-20M-44 53Q0 75 44 53" fill="none" stroke={variant===1?'#765444':'#515664'} strokeWidth="5" opacity=".65"/>
  </g><path d="M-45 116Q0 138 45 116M0 149V230" fill="none" stroke="#6a94ab" strokeWidth="5"/>
 </g>;
};
