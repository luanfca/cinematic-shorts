import {editTime} from './timing';
import React from 'react';
import {ev,mix} from './pov';
import {lowerHeldObject}from'./POVCinematicDirector';
const messages=[{at:-9,text:"tem alguém no corredor",in:true},{at:-8,text:"me escondi no depósito",in:true},{at:-7,text:"tô com muito medo",in:true},{at:-6,text:"Fica escondida. Não sai daí.",in:false},{at:-5,text:"Não abra pra ninguém.",in:false},{at:-4,text:"alguém tá perto",in:true},{at:-3,text:"ainda tô trancada no depósito",in:true},{at:-2,text:"quem tá batendo aí?",in:true},{at:-1,text:"NÃO ABRAM.",in:true,alert:true},
 {at:47.42,text:'Caio? É você aí fora do depósito?',in:true},
 {at:49.24,text:'Espera, vou abrir.',in:true},
 {at:50.94,text:'NÃO SOU EU! NÃO ABRE!',in:false,alert:true},
];
function wrap(s:string,n=25){const out:string[]=[];let line='';for(const w of s.split(' ')){if((line+' '+w).trim().length>n&&line){out.push(line);line=w;}else line=(line+' '+w).trim();}if(line)out.push(line);return out;}
export function phonePose(t:number){
 if(t>=52.15&&t<53.37){const lower=lowerHeldObject(t,52.15,53.10,300+Math.sin(52.15*2)*.65,1980);return{visible:true,p:1-lower.progress,y:lower.y+Math.sin(t*39)*1.1*Math.sin(lower.progress*Math.PI)};}
 for(const [a,b,inEnd,outStart] of [[46.95,53.37,47.46,52.92]])if(t>=a&&t<b){const p=ev(t,a,inEnd)*(1-ev(t,outStart,b));const glance=.10*(ev(t,65.05,65.35)-ev(t,65.6,66.1));return {visible:true,p:p-glance,y:mix(1980,300,p-glance)+Math.sin(editTime(t)*2)*.65+5*(ev(t,123.4,123.8)-ev(t,123.9,124.15))};}
 return {visible:false,p:0,y:1980};
}
const forearm=(side:number)=>{const x=side<0?145:935;return <g><path d={`M${side<0?-100:1180} 1860Q${side<0?30:1050} 1450 ${x} 1000`} fill="none" stroke="#2a4358" strokeWidth="136" strokeLinecap="round"/><path d={`M${side<0?-100:1180} 1860Q${side<0?30:1050} 1450 ${x} 1000`} fill="none" stroke="url(#uniformCloth)" strokeWidth="112" strokeLinecap="round"/><path d={`M${x-55} 1022h110`} stroke="#315976" strokeWidth="25"/><path d={side<0?'M92 998Q70 913 104 850Q138 805 182 832L230 890L211 1007Q153 1051 92 998Z':'M988 1030Q1014 935 972 895Q928 862 888 900L850 963L876 1052Q938 1082 988 1030Z'} fill="url(#phone-skin)" stroke="#795c4c" strokeWidth="5"/>
 {Array.from({length:3},(_,i)=><path key={i} d={side<0?`M140 ${855+i*40}q38-21 68 6v24q-39 14-65-5Z`:`M940 ${911+i*39}q-37-19-65 6v24q36 12 62-4Z`} fill="url(#phone-skin)" stroke="#9c745d" strokeWidth="3"/>)}
 </g>;};
export const Phone:React.FC<{t:number}>=({t})=>{
 const pose=phonePose(t);if(!pose.visible)return null;const rt=editTime(t),vibration=[47.42,49.24].reduce((a,event)=>{const d=rt-editTime(event);return a+(d>=0&&d<.22?Math.sin(d*2*Math.PI*12)*2.1*Math.exp(-d*12):0);},0);
 const windows:[number,number,string][]=[[49.54,50.94,'NÃO SOU EU! NÃO ABRE!']];
 const typing=windows.find(([a,b])=>t>=a&&t<b),recent=windows.find(([a,b])=>t>=a&&t<b+.18),kp=recent?ev(t,recent[0],recent[0]+.15)*(1-ev(t,recent[1],recent[1]+.18)):0;
 const chatHeight=mix(800,570,kp),fieldY=mix(1130,900,kp),shown=messages.filter(m=>m.at<=t);let total=0;const rows=shown.map(m=>{const lines=m.alert&&!m.in?m.text.split(/(?<=EU!) /):wrap(m.text,m.at>=0?21:25),height=55+lines.length*54,row={...m,lines,height,y:total};total+=height+24;return row;});
 let scroll=0;for(const row of rows){const before=Math.max(0,row.y-chatHeight+15),after=Math.max(0,row.y+row.height+24-chatHeight+15);scroll=Math.max(scroll,mix(before,after,ev(t,row.at,row.at+.30)));}
 const written=typing?typing[2].slice(0,Math.ceil((t-typing[0])/(typing[1]-typing[0])*typing[2].length)):'';
 const tapping=typing?Math.sin((t-typing[0])*25):0,reach=typing?ev(t,typing[0],typing[0]+.12):recent?1-ev(t,recent[1],recent[1]+.12):0;
 const thumbX=mix(885,811,reach),thumbY=mix(969,1075,reach)+Math.max(0,tapping)*4;
 return <g transform={`translate(${vibration} ${pose.y}) rotate(${Math.sin(rt*.7)*.11} 540 650)`}>
  <defs><linearGradient id="phone-skin"><stop stopColor="#78869b"/><stop offset=".56" stopColor="#c5b7a8"/><stop offset="1" stopColor="#d4e0e5"/></linearGradient></defs>{forearm(-1)}{forearm(1)}
  <rect x="175" y="-10" width="730" height="1315" rx="75" fill="#0b131d" stroke="#617684" strokeWidth="10"/><path d="M220 10H860" stroke="#a0b1bc" opacity=".4" strokeWidth="3"/>
  <rect x="202" y="30" width="676" height="1210" rx="44" fill="#152632"/>
  <defs><clipPath id="phone-screen"><rect x="202" y="30" width="676" height="1210" rx="44"/></clipPath><clipPath id="phone-chat"><rect x="220" y="285" width="640" height={chatHeight}/></clipPath></defs>
  <g fontFamily="Arial" clipPath="url(#phone-screen)">
   <rect x="400" y="38" width="280" height="38" rx="19" fill="#090e15"/><text x="240" y="123" fontSize="26" fill="#a2b7c3">14:42</text><text x="830" y="123" textAnchor="end" fontSize="24" fill="#a2b7c3">▰ 68%</text>
   <path d="M245 195l-22 22 22 22" fill="none" stroke="#bdd5df" strokeWidth="6"/><circle cx="295" cy="216" r="29" fill="#536d7f"/><text x="350" y="215" fontSize="39" fill="#d6e6ed">Lívia</text><text x="350" y="252" fontSize="23" fill="#859da9">conversa privada</text><path d="M220 280H860" stroke="#344a59" strokeWidth="3"/>
   <g clipPath="url(#phone-chat)"><g transform={`translate(0 ${300-scroll})`}>{rows.map(row=>{const x=row.in?235:265;return <g key={row.at} transform={`translate(${x} ${row.y})`} opacity={row.at<0?1-.83*ev(t,47.42,48.0):ev(t,row.at,row.at+.12)}><rect width={row.in?580:570} height={row.height} rx="22" fill={row.alert?(row.at>=0?'#79394f':'#602b3f'):row.in?(row.at>=0?'#3b5668':'#273d4c'):'#28505c'} stroke={row.alert?'#e19aab':'#3d5967'} strokeWidth={row.alert?4:1}/>{row.lines.map((l,j)=><text key={j} x="24" y={51+j*54} fontSize={row.alert?(row.in?48:49):row.at>=0?46:36} fontWeight={row.alert?'750':row.at>=0?'600':'400'} fill={row.at>=0?'#f7fbff':row.alert?'#ffd4dd':'#e0e9eb'}>{l}</text>)}<text x="555" y={row.height-12} textAnchor="end" fontSize="18" fill="#8aa6b4">{row.in?'14:42':'✓✓'}</text></g>;})}</g></g>
   <rect x="220" y={fieldY-20} width="640" height="125" fill="#152632"/><rect x="230" y={fieldY} width="620" height="72" rx="34" fill="#263b49" stroke="#415b6c" strokeWidth="2"/><text x="260" y={fieldY+45} fill={written?'#d8e6eb':'#8099a7'} fontSize={written?25:29}>{written||'Mensagem'}</text><path d={`M807 ${fieldY+20}l27 17-27 17Z`} fill={written?'#82c2c8':'#607e8d'}/>
   {kp>0&&<g transform={`translate(0 ${1000+(1-kp)*260})`}><rect x="205" y="-15" width="670" height="275" fill="#1b2d3b"/>{['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'].map((letters,r)=><g key={r}>{letters.split('').map((l,i)=><g key={l}><rect x={232+i*58+r*15} y={r*57} width="49" height="49" rx="6" fill="#344d5d"/><text x={256+i*58+r*15} y={r*57+33} textAnchor="middle" fontSize="24" fill="#d9e4e8">{l}</text></g>)}</g>)}<rect x="345" y="180" width="340" height="43" rx="7" fill="#3b5667"/></g>}
  </g>
  <path d="M155 911Q138 864 169 850L204 850Q222 857 214 873L183 889L180 925Z" fill="url(#phone-skin)" stroke="#88644f" strokeWidth="4"/><path d="M174 855q22-8 28 6l-9 9h-20Z" fill="#edd0b3" stroke="#b58e74" strokeWidth="2"/>
  <path d={`M930 1015Q960 982 920 952L${thumbX+23} ${thumbY-18}Q${thumbX-4} ${thumbY-29} ${thumbX-12} ${thumbY-10}Q${thumbX-17} ${thumbY+5} ${thumbX+7} ${thumbY+15}L905 1035Z`} fill="url(#phone-skin)" stroke="#88644f" strokeWidth="4"/><path d={`M${thumbX-2} ${thumbY-16}q18-3 22 10l-8 8h-18Z`} fill="#edd0b3" stroke="#b58e74" strokeWidth="2"/>
 </g>;
};
