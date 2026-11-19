import React from 'react';
import {camera,view,screen,polygon,ev,mix,type V,type Cam} from './pov';
import {flatMatrix} from './spatial';
const lerp=(a:V,b:V,p:number)=>a.map((v,i)=>mix(v,b[i],p)) as V;
export function writingTip(t:number):V{return [-.12+Math.min(t,3)*.05,.859,.91+Math.sin(Math.min(t,3)*12)*.002];}
export function handPose(t:number){
 const c=camera(t);
 if(t>=54.05&&t<56.05){
  const plant=ev(t,54.05,54.68),release=ev(t,55.32,56.05);
  const rest:V=[-.53,.011,1.94];
  const right=lerp(lerp([c.x+.2,.12,c.z-.15],rest,plant),[c.x+.32,.24,c.z-.24],release);
  const left:V=[c.x-.3,.27,c.z-.25];
  return {kind:'floor',left,right,tip:[0,0,0] as V,p:release};
 }

 return null;
}
const BackHand:React.FC<{grip?:boolean;flip?:boolean}>=({grip=false,flip=false})=><g transform={`scale(${flip?-1:1} 1)`}>
 <path d={grip?'M-37 68L-42 20Q-45-9-28-20L-10-44Q4-54 14-36L9-13L35-20Q53-12 44 7L25 28L38 56Q14 84-37 68Z':'M-37 70L-47 12L-43-53Q-39-73-28-55L-22-10L-20-85Q-15-105-5-86L0-14L7-95Q14-113 24-93L24-15L35-70Q43-88 52-69L45-5L67 11Q81 29 65 38L40 26L34 69Q3 86-37 70Z'} fill="url(#classSkin)" stroke="#775848" strokeWidth="4" strokeLinejoin="round"/>
 {grip?<><path d="M-25-8Q-4-18 14-8M-31 16Q-7 3 19 10M-25 40L14 32" fill="none" stroke="#aa7c60" strokeWidth="3"/><path d="M-8-35q11-10 17 2l-3 10H-9Z" fill="#efd0b1" stroke="#b58a6d" strokeWidth="2"/></>:<>
 {[[ -35,-54],[-12,-85],[16,-94],[43,-70]].map(([x,y],i)=><path key={i} d={`M${x-5} ${y+3}q7-7 12 0v11h-12Z`} fill="#eed0b5" stroke="#b58b72" strokeWidth="2"/>)}
 <path d="M-26 4L-21 37M-7 0L-3 40M16 0L12 42M34 7L25 40" fill="none" stroke="#b6896d" strokeWidth="2.5" opacity=".6"/>
 </>}
</g>;
const ProjectedHand:React.FC<{root:V;c:Cam;grip:boolean;flip:boolean}>=({root,c,grip,flip})=>{
 const at=(p:number[]):V=>[root[0]+p[0]*.00105*(flip?-1:1),root[1],root[2]-p[1]*.00105];
 const outline=grip?[[-37,68],[-42,20],[-42,-9],[-28,-20],[-10,-44],[0,-48],[14,-36],[9,-13],[35,-20],[46,-12],[44,7],[25,28],[38,56],[24,73],[0,78]]:[[-37,70],[-47,12],[-43,-53],[-39,-65],[-31,-58],[-22,-10],[-20,-85],[-15,-96],[-7,-90],[0,-14],[7,-95],[14,-103],[23,-96],[24,-15],[35,-70],[43,-78],[50,-72],[45,-5],[67,11],[76,26],[66,36],[40,26],[34,69],[8,78]];
 const d=polygon(outline.map(at),c);if(!d)return null;
 const nail=(x:number,y:number)=>polygon([[x-5,y],[x+6,y-2],[x+7,y+11],[x-5,y+12]].map(at),c);
 const line=(points:number[][])=>{const q=points.map(p=>view(at(p),c));return q.every(p=>p[2]>.08)?q.map((p,i)=>`${i?'L':'M'}${screen(p,c)}`).join(' '):'';};
 return <g><polygon points={d} fill="url(#classSkin)" stroke="#795b49" strokeWidth="3.5" strokeLinejoin="round"/>{(grip?[[0,-32]]:[[-35,-54],[-12,-85],[16,-94],[43,-70]]).map(([x,y],i)=><polygon key={i} points={nail(x,y)} fill="#efd2b7" stroke="#b58b70" strokeWidth="1.5"/>)}{(grip?[[[-25,-8],[-4,-12],[14,-8]],[[-31,16],[-7,8],[19,10]],[[-25,40],[14,32]]]:[[[-26,4],[-21,37]],[[-7,0],[-3,40]],[[16,0],[12,42]],[[34,7],[25,40]]]).map((p,i)=><path key={i} d={line(p)} fill="none" stroke="#b68c6f" strokeWidth="2"/>)}</g>;
};
function sleeve(a:V,b:V,c:Cam,key:string){
 const dx=b[0]-a[0],dz=b[2]-a[2],n=Math.hypot(dx,dz)||1,ux=-dz/n*.043,uz=dx/n*.043;
 const d=polygon([[a[0]+ux,a[1],a[2]+uz],[b[0]+ux,b[1],b[2]+uz],[b[0]-ux,b[1],b[2]-uz],[a[0]-ux,a[1],a[2]-uz]],c);
 return d?<polygon key={key} points={d} fill="url(#uniformCloth)" stroke="#37546a" strokeWidth="3" strokeLinejoin="round"/>:null;
}
export const OwnHands:React.FC<{t:number}>=({t})=>{
 const pose=handPose(t);if(!pose)return null;const c=camera(t),floor=pose.kind==='floor';
 const rootY=floor?Math.max(.24,c.y-.16):.99,rootZ=c.z-.26;
 const hands=[{p:pose.right,side:1}];
 const top:V=[pose.tip[0]+.065,pose.tip[1]+.17,pose.tip[2]-.065],tipV=view(pose.tip,c),topV=view(top,c);
 return <g>
  {hands.map(({p,side})=>{const shoulder:V=[c.x+side*.23,rootY,rootZ],elbow:V=[c.x+side*.31,floor?Math.max(.1,c.y-.18):.89,rootZ+.25],m=flatMatrix(p,[.00105,0,0],[0,0,-.00105],c);
   return <g key={side}>{sleeve(shoulder,elbow,c,'upper')}{sleeve(elbow,p,c,'fore')}<ProjectedHand root={p} c={c} grip={!floor&&side===1} flip={side===1}/></g>;
  })}
  {!floor&&tipV[2]>.08&&topV[2]>.08&&<g><path d={`M${screen(topV,c)}L${screen(tipV,c)}`} stroke="#705235" strokeWidth="9" strokeLinecap="round"/><path d={`M${screen(topV,c)}L${screen(tipV,c)}`} stroke="#d6b56c" strokeWidth="5" strokeLinecap="round"/><circle cx={screen(tipV,c)[0]} cy={screen(tipV,c)[1]} r="2.6" fill="#303f48"/></g>}
 </g>;
};
