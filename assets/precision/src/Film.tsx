import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Classroom,ClassDefs} from './Classroom';
import {Phone} from './Phone';
import {OwnHands} from './WorldHands';
import {ev,camera,view,screen} from './pov';
import envelopes from './envelopes.json';
import voice from './voice-stage.json';
import {stageTime} from './timing';
import {captionAt,captionLines} from './performance';
export const Film:React.FC=()=>{
 const outputFrame=useCurrentFrame(),rt=outputFrame/30,t=stageTime(rt),frame=Math.round(t*30),cam=camera(t);
 const lines=voice.lines as {at:number;end:number;id:string;who:string;text:string}[];
 const line=lines.find(l=>t>=l.at&&t<l.end),color=line?(line.id.startsWith('F')?'#f1f3f2':line.who==='E'?'#ffe39c':line.who==='D'?'#a7eff3':line.who==='L'?'#f4b7d1':'#f0f4f5'):'#fff';
 return <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{background:'#152a3b'}}>
  <ClassDefs/>
  <g transform={`rotate(${cam.roll} 540 850)`}><g style={rt>=64.9?{filter:"blur(2px)"}:undefined}><Classroom t={t} frame={frame} env={envelopes}/></g>
  <OwnHands t={t}/></g>
  <rect width="1080" height="1920" fill="url(#povVig)"/>
  <g transform={`rotate(${cam.roll} 540 850)`}><Phone t={t}/></g>
  {Array.from({length:18},(_,i)=><circle key={i} cx={(i*173+Math.sin(t*.4+i)*30)%1080} cy={(i*311-t*(3+i%3)+6000)%1920} r={1+i%2} fill="#b1c6ce" opacity={t>42?.045:.10}/>)}
  {line&&t<65.12&&<g fontFamily="Arial" textAnchor="middle" fill={color} fontWeight="700" stroke="#050a11" strokeWidth="8" paintOrder="stroke" strokeLinejoin="round">{captionLines(captionAt(t,line.id,line.text)).map((l,i,a)=><text key={i} x="540" y={1500-(a.length-1-i)*76} fontSize="60">{l}</text>)}</g>}
  {rt<2.70&&<g fontFamily="Arial" fontWeight="800" textAnchor="middle"
   opacity={1-ev(rt,2.35,2.70)} fill="#fff" stroke="#070d18" strokeWidth="7" paintOrder="stroke">
   <text x="540" y="184" fontSize="48" letterSpacing="5">PARTE 2</text>
   <text x="540" y="264" fontSize="56">VOCÊS ESCOLHERAM:</text>
   <text x="540" y="330" fontSize="65">MANTER TRANCADA</text>
  </g>}
  {rt>=64.9&&<g fontFamily="Arial" textAnchor="middle" fontWeight="800" opacity={ev(rt,64.9,65.06)}>
   <defs><linearGradient id="choiceShade" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop stopColor="#06101b" stopOpacity=".14"/><stop offset=".49" stopColor="#06101b" stopOpacity=".28"/>
    <stop offset=".67" stopColor="#06101b" stopOpacity=".93"/><stop offset="1" stopColor="#06101b" stopOpacity=".98"/>
   </linearGradient></defs>
   <rect width="1080" height="1920" fill="url(#choiceShade)"/>
   <text x="540" y="940" fontSize="79" fill="#fff" stroke="#060d15" strokeWidth="7" paintOrder="stroke">O QUE VOCÊ FARIA?</text>
   {[{lines:['A — CORRER PARA','SALVAR LÍVIA'],y:994,fill:'#173e35',edge:'#76c6aa'},
     {lines:['B — CONTINUAR','ESCONDIDO'],y:1168,fill:'#542831',edge:'#e8979e'}].map(({lines,y,fill,edge})=>
    <g key={lines[0]}><rect x="102" y={y} width="876" height="149" rx="24" fill={fill} stroke={edge} strokeWidth="3"/>
    {lines.map((label,i)=><text key={label} x="540" y={y+61+i*55} fontSize="57" fill="#fff">{label}</text>)}</g>)}
   <text x="540" y="1416" fontSize="48" letterSpacing="2" fill="#fff">COMENTE A OU B</text>
   <text x="540" y="1491" fontSize="42" letterSpacing="4" fill="#bdcdda">PARTE 3</text>
  </g>}
 </svg>;
};
