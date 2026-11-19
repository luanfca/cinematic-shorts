import React from 'react';
import {camera,view,screen,ev,mix,type V} from './pov';
const Palm:React.FC<{x:number;y:number;scale?:number;flip?:boolean;point?:boolean;grip?:boolean}>=({x,y,scale=1,flip=false,point=false,grip=false})=><g transform={`translate(${x} ${y}) scale(${flip?-scale:scale} ${scale})`}>
 <path d={grip?'M-35-33Q-10-50 8-39L49-55Q65-53 59-35L24-10L26 29Q8 64-23 43L-43 10Z':point?'M-36 22L-47-15Q-55-40-41-43L-13-18L-5-92Q0-110 14-96L16-26Q43-48 51-29L62 4L43 55Q9 83-24 55Z':'M-38 31L-55-8Q-63-35-47-34L-21-13L-24-69Q-22-87-10-73L0-23L4-81Q9-96 20-78L21-22L32-64Q39-76 48-59L42-13Q63-45 71-25L59 20L40 61Q5 84-28 58Z'} fill="url(#classSkin)" stroke="#806052" strokeWidth="5"/><path d="M-20 26Q2 8 29 18M-9 49L24 38" fill="none" stroke="#aa795e" strokeWidth="4" opacity=".6"/>
</g>;
const Arm:React.FC<{from:[number,number];elbow:[number,number];to:[number,number]}>=({from,elbow,to})=><g><path d={`M${from}L${elbow}L${to}`} fill="none" stroke="#21394d" strokeWidth="135" strokeLinecap="round" strokeLinejoin="round"/><path d={`M${from}L${elbow}L${to}`} fill="none" stroke="#9db7c8" strokeWidth="111" strokeLinecap="round" strokeLinejoin="round"/><path d={`M${to[0]-52} ${to[1]+18}l105-7`} stroke="#315c7b" strokeWidth="28"/></g>;
export const OwnHands:React.FC<{t:number}>=({t})=>{
 if(t<3.6){const c=camera(t),l=view([-.17,.88,.94],c),r=view([.15,.88,1.01],c);if(l[2]<.08||r[2]<.08)return null;const L=screen(l,c),R=screen(r,c),w=Math.sin(t*19)*3;return <g><Arm from={[-130,1480]} elbow={[140,1190]} to={[L[0],L[1]+25]}/><Palm x={L[0]} y={L[1]} scale={1.35}/><Arm from={[1190,1480]} elbow={[900,1190]} to={[R[0]+15,R[1]+35]}/><Palm x={R[0]+w} y={R[1]} scale={1.35} flip point/><g transform={`translate(${R[0]-10+w} ${R[1]-30}) rotate(-28)`}><path d="M-5-135H7V45L1 65L-5 45Z" fill="#c6a563" stroke="#5d4e3d" strokeWidth="3"/><path d="M1 65L-2 54H4Z" fill="#27313a"/></g></g>;}
 if(t>=38.7&&t<40.4){const p=ev(t,38.7,39.6),y=mix(1450,1120,p);return <g><Arm from={[-100,2000]} elbow={[180,1600]} to={[300,y]}/><Palm x={300} y={y} scale={1.1}/><Arm from={[1200,2000]} elbow={[950,1640]} to={[790,y+70]}/><Palm x={790} y={y+70} flip scale={1.05}/></g>;}
 if((t>=41&&t<60||t>=79&&t<117||t>=130)&&Math.abs(camera(t).yaw)<.5){return <g opacity=".82"><path d="M-100 1960Q-45 1570 145 1590Q345 1650 220 1980Z M1180 1960Q1125 1570 935 1590Q735 1650 860 1980Z" fill="#263f56" stroke="#142a3d" strokeWidth="8"/><path d="M35 1770Q100 1730 190 1780M890 1780Q975 1730 1045 1770" fill="none" stroke="#5d7485" strokeWidth="7" opacity=".5"/></g>;}
 return null;
};
const messages=[
 {at:61,text:'tem alguém no corredor',in:true},{at:63,text:'me escondi no depósito',in:true},{at:65,text:'tô com muito medo',in:true},
 {at:67.7,text:'Fica escondida. Não sai daí.',in:false},
 {at:75.5,text:'Não abra pra ninguém.',in:false},{at:77,text:'alguém tá perto',in:true},
 {at:118,text:'ainda tô trancada no depósito',in:true},{at:120.8,text:'quem tá batendo aí?',in:true},{at:123,text:'NÃO ABRAM.',in:true,alert:true}];
function wrap(s:string,n=25){const a:string[]=[];let line='';for(const w of s.split(' ')){if((line+' '+w).trim().length>n&&line){a.push(line);line=w;}else line=(line+' '+w).trim();}if(line)a.push(line);return a;}
export const Phone:React.FC<{t:number}>=({t})=>{
 let visible=false,p=0;
 if(t>=59.5&&t<70){visible=true;p=ev(t,59.5,60.2)*(1-ev(t,69,70));}
 if(t>=74.5&&t<79){visible=true;p=ev(t,74.5,75.2)*(1-ev(t,78,79));}
 if(t>=117&&t<126.5){visible=true;p=ev(t,117,117.8)*(1-ev(t,124.8,126.5));}
 if(!visible)return null;
 const y=mix(1550,300,p)+Math.sin(t*2)*2,rotation=Math.sin(t*.7)*.5;
 const shown=messages.filter(m=>m.at<=t).slice(-4);let rowY=300;
 return <g transform={`translate(0 ${y}) rotate(${rotation} 540 650)`}>
  <Arm from={[-120,1800]} elbow={[100,1250]} to={[205,820]}/><Arm from={[1200,1800]} elbow={[990,1250]} to={[875,970]}/>
  <rect x="175" y="-10" width="730" height="1315" rx="75" fill="#0b131d" stroke="#617684" strokeWidth="10"/>
  <rect x="202" y="30" width="676" height="1210" rx="44" fill="#111f2a"/>
  <rect x="400" y="38" width="280" height="38" rx="19" fill="#090e15"/>
  <g fontFamily="Arial"><text x="240" y="123" fontSize="26" fill="#a2b7c3">14:42</text><text x="830" y="123" textAnchor="end" fontSize="24" fill="#a2b7c3">▰ 68%</text>
  <path d="M245 195l-22 22 22 22" fill="none" stroke="#bdd5df" strokeWidth="6"/><circle cx="295" cy="216" r="29" fill="#536d7f"/><text x="350" y="215" fontSize="39" fill="#d6e6ed">Lívia</text><text x="350" y="252" fontSize="23" fill="#859da9">conversa privada</text><path d="M220 280H860" stroke="#344a59" strokeWidth="3"/>
  {shown.map((m,i)=>{const lines=wrap(m.text),h=65+lines.length*48,yy=rowY;rowY+=h+23;const xx=m.in?230:265;return <g key={m.at}><rect x={xx} y={yy} width={m.in?580:570} height={h} rx="23" fill={m.alert?'#492635':m.in?'#273d4c':'#28505c'} stroke={m.alert?'#c3798f':'#3d5967'} strokeWidth={m.alert?4:1}/>{lines.map((l,j)=><text key={j} x={xx+24} y={yy+52+j*48} fontSize="36" fontWeight={m.alert?'700':'400'} fill={m.alert?'#ffd4dd':'#e0e9eb'}>{l}</text>)}<text x={xx+555} y={yy+h-12} textAnchor="end" fontSize="19" fill="#8aa6b4">{m.in?'14:42':'✓✓'}</text></g>;})}
  <rect x="230" y="1130" width="620" height="72" rx="34" fill="#263b49" stroke="#415b6c" strokeWidth="2"/><text x="265" y="1176" fill="#8099a7" fontSize="29">{t>=66.4&&t<67.7?'Fica escondida…':t>=75&&t<75.5?'Não abra…':'Mensagem'}</text>
  </g>
  <Palm x={204} y={825} scale={1.5} grip/><Palm x={865} y={970} flip scale={1.5} grip point={t>=66.4&&t<67.7||t>=75&&t<75.5}/>
 </g>;
};
