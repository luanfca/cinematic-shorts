import React from 'react';
import {camera,view,screen,polygon,ev,mix,type V,type Cam} from './pov';
import {night} from './nightLighting';
import {ExamPaper} from './ExamPaper';
import {visemeAt} from './performance';
import {Character,PupilBack} from './Character';
import {planeMatrix,nearerMask,flatMatrix} from './spatial';
export const ClassDefs=()=> <defs>
 <linearGradient id="classSkin"><stop stopColor="#bc8669"/><stop offset=".5" stopColor="#e6b38d"/><stop offset="1" stopColor="#f2caa6"/></linearGradient>
 <linearGradient id="uniformCloth"><stop stopColor="#8cabbc"/><stop offset=".5" stopColor="#d9e5e7"/><stop offset="1" stopColor="#a9c6d1"/></linearGradient>
 <linearGradient id="teacherCloth"><stop stopColor="#3c606e"/><stop offset=".5" stopColor="#7896a0"/><stop offset="1" stopColor="#476a7a"/></linearGradient>
 <linearGradient id="wall214" x1="0" y1="0" x2="0" y2="1"><stop stopColor={night.wallNear}/><stop offset="1" stopColor={night.wallFar}/></linearGradient>
 <linearGradient id="floor214" x1="0" y1="0" x2="0" y2="1"><stop stopColor={night.floorNear}/><stop offset="1" stopColor={night.floorFar}/></linearGradient>
 <linearGradient id="desk214"><stop stopColor="#47405a"/><stop offset=".5" stopColor="#625267"/><stop offset="1" stopColor="#493d53"/></linearGradient>
 <linearGradient id="door214"><stop stopColor="#243653"/><stop offset=".45" stopColor="#4b6591"/><stop offset="1" stopColor="#2d456b"/></linearGradient>
 <linearGradient id="hallSpill" x1="1" y1="0" x2="0" y2="1"><stop stopColor={night.corridor} stopOpacity=".48"/><stop offset="1" stopColor={night.coolEdge} stopOpacity="0"/></linearGradient>
 <radialGradient id="nightDepth" cx=".52" cy=".57" r=".72">
  <stop offset=".18" stopColor="#193d5c" stopOpacity="0"/>
  <stop offset="1" stopColor="#090b23" stopOpacity=".33"/>
 </radialGradient>
 <radialGradient id="povVig"><stop offset=".4" stopColor="#020a14" stopOpacity="0"/><stop offset="1" stopColor="#020a14" stopOpacity=".38"/></radialGradient>
 </defs>;

type Item={z:number;node:React.ReactNode};
export const Classroom:React.FC<{t:number;env:Record<string,number[]>;frame:number}>=({t,env,frame})=>{
 const c=camera(t),items:Item[]=[],actors:Item[]=[],occluders:V[][]=[],dark=1;
 let count=0;
 const face=(pts:V[],fill:string,stroke='#293e4e',sw=2,opacity=1)=>{const d=polygon(pts,c);if(!d)return;if(opacity===1)occluders.push(pts);const center=pts.reduce((a,p)=>a.map((v,j)=>v+p[j]/pts.length) as V,[0,0,0] as V);items.push({z:view(center,c)[2],node:<polygon key={count++} points={d} fill={fill} stroke={stroke} strokeWidth={sw} opacity={opacity} strokeLinejoin="round"/>});};
 const box=(x:number,y:number,z:number,w:number,h:number,d:number,color:string,top=color)=>{
  face([[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z]],color);face([[x,y,z+d],[x+w,y,z+d],[x+w,y+h,z+d],[x,y+h,z+d]],color);
  face([[x,y,z],[x,y,z+d],[x,y+h,z+d],[x,y+h,z]],color);face([[x+w,y,z],[x+w,y,z+d],[x+w,y+h,z+d],[x+w,y+h,z]],color);
  face([[x,y+h,z],[x+w,y+h,z],[x+w,y+h,z+d],[x,y+h,z+d]],top);
 };
 const decal=(p:V,text:string,size:number,fill:string)=>{const q=view(p,c);if(q[2]>.1){const xy=screen(q,c);items.push({z:q[2]-.002,node:<text key={count++} x={xy[0]} y={xy[1]} fontSize={size*c.f/q[2]} textAnchor="middle" fontFamily="Arial" fill={fill}>{text}</text>});}};
 // One immutable room. Surfaces use the same perspective as furniture and characters.
 face([[-3.2,0,-1],[3.2,0,-1],[3.2,0,6],[-3.2,0,6]],'url(#floor214)');
 face([[-3.2,0,6],[3.2,0,6],[3.2,3.2,6],[-3.2,3.2,6]],'url(#wall214)');
 face([[-3.2,0,-1],[-3.2,0,6],[-3.2,3.2,6],[-3.2,3.2,-1]],'#3b3f64');
 face([[3.2,0,-1],[3.2,0,6],[3.2,3.2,6],[3.2,3.2,-1]],'#455373');
 face([[-3.2,3.2,-1],[3.2,3.2,-1],[3.2,3.2,6],[-3.2,3.2,6]],'#303554');
 for(const x of [-3,-2,-1,0,1,2,3])face([[x,0,-1],[x+.009,0,-1],[x+.009,0,6],[x,0,6]],'#6b7194','none',0,.35);
 for(const z of [0,1,2,3,4,5])face([[-3.2,.001,z],[3.2,.001,z],[3.2,.001,z+.012],[-3.2,.001,z+.012]],'#6b7194','none',0,.4);
 for(const x of [-3.195,3.195]){face([[x,0,-1],[x,0,6],[x,1.0,6],[x,1.0,-1]],x<0?'#312e53':'#354364');face([[x,1,-1],[x,1,6],[x,1.035,6],[x,1.035,-1]],'#737591','none');}
 face([[-3.2,0,5.995],[3.2,0,5.995],[3.2,.95,5.995],[-3.2,.95,5.995]],'#343955');
 // Green chalkboard, rail, school clock, PA grille.
 box(-2.35,1.15,5.90,3.6,1.35,.055,'#405964','#b7b5a0');
 face([[-2.28,1.22,5.885],[1.18,1.22,5.885],[1.18,2.43,5.885],[-2.28,2.43,5.885]],'#294e50','#b6b6a0',6);
 decal([-.55,2.18,5.87],'BIOLOGIA',.17,'#cdd9cf');decal([-.55,1.84,5.87],'AVALIAÇÃO · 2º BIMESTRE',.09,'#b5c9c1');decal([-.55,1.53,5.87],'Silêncio durante a prova.',.085,'#a4bcb5');
 box(-2.5,.95,5.78,3.9,.07,.22,'#8b9699');
 box(-.92,2.65,5.84,.62,.34,.12,'#465a67');
 for(let i=0;i<7;i++)face([[-.85,2.70+i*.033,5.825],[-.36,2.70+i*.033,5.825],[-.36,2.71+i*.033,5.825],[-.85,2.71+i*.033,5.825]],'#1d303e','none');
 decal([1.65,2.60,5.86],'◷',.52,'#8791ab');
 // Door on right wall, always the same hinge and handle.
 face([[3.18,0,2.65],[3.18,0,3.9],[3.18,2.38,3.9],[3.18,2.38,2.65]],'#193d56','#778eb0',6);
 face([[3.17,.045,2.73],[3.17,.045,3.82],[3.17,2.30,3.82],[3.17,2.30,2.73]],'url(#door214)','#396981',4);
 for(const y of [.27,1.25])face([[3.16,y,2.88],[3.16,y,3.68],[3.16,y+.65,3.68],[3.16,y+.65,2.88]],'#374d76','#4a8ca3',3);
 face([[3.15,1.8,2.94],[3.15,1.8,3.6],[3.15,2.12,3.6],[3.15,2.12,2.94]],'#aabbd5');decal([3.13,1.90,3.27],'214',.17,'#2e4859');
 const settle=(a:number,b:number)=>ev(t,a,a+.12)*(1-ev(t,a+.17,b));
 const handle=.032*settle(11,11.7)+.028*settle(21.2,21.7);
 const hallLight=.45+.55*(1-ev(t,27.3,34));
 box(3.10,.99,2.84,.06,.22,.10,'#819ba6');face([[3.05,1.10,2.89],[3.05,1.10-handle,3.14],[3.05,1.06-handle,3.14],[3.05,1.06,2.89]],'#aebfd8','#5b737d',3);
 face([[3.155,.0,2.74],[3.155,.0,3.80],[3.155,.026,3.80],[3.155,.026,2.74]],'#bdd1ed','none');
 face([[3.15,.003,2.77],[3.15,.003,3.79],[2.05,.003,3.53],[2.05,.003,3.00]],'url(#hallSpill)','none',0,.68*hallLight);
 {face([[3.145,2.43,3.02],[3.145,2.43,3.48],[3.145,2.52,3.48],[3.145,2.52,3.02]],'#975f5d','#bb9290',1);}
 // Windows on the opposite wall and blinds that keep outside light weak.
 for(const z of [.2,2.3,4.4]){
  face([[-3.18,1.0,z],[-3.18,1.0,z+1.5],[-3.18,2.75,z+1.5],[-3.18,2.75,z]],'#717f9f','#456576',7);
  for(let i=0;i<10;i++)face([[-3.16,1.06+i*.16,z+.04],[-3.16,1.06+i*.16,z+1.46],[-3.16,1.17+i*.16,z+1.46],[-3.16,1.17+i*.16,z+.04]],'#4a5276','#393f61',1);
  if(t<3.3){const glow=(Math.sin(t*7)+1)/2;face([[-3.15,1.05,z+.04],[-3.15,1.05,z+1.46],[-3.15,2.7,z+1.46],[-3.15,2.7,z+.04]],glow>.53?'#d34553':'#527bd0','none',0,(glow*.08+.025)*(1-ev(t,0,3.3)));for(let i=0;i<6;i++)face([[-3,.01,z+i*.19],[-.7,.01,z+i*.19+.55],[-.7,.01,z+i*.19+.62],[-3,.01,z+i*.19+.07]],glow>.53?'#f05f68':'#6790eb','none',0,(glow*.04+.015)*(1-ev(t,0,3.3)));}
 }
 for(const z of [1.4,3.8])for(const x of [-1.5,.9])face([[x,3.17,z],[x+.65,3.17,z],[x+.65,3.17,z+.9],[x,3.17,z+.9]],dark>.5?'#383e61':'#edf0da','#648492',4);
 const background=items.splice(0);occluders.length=0;
 // Desks/chairs have independent tops and legs; depth sorting produces real occlusion.
 for(const z of [1.0,2.7,4.4])for(const x of [-1.45,0,1.45]){
  for(const dx of [-.44,.40])for(const dz of [-.29,.27])box(x+dx,0,z+dz,.045,.80,.045,'#242b49','#4c5278');
  box(x-.52,.78,z-.37,1.04,.07,.74,'#463852','url(#desk214)');
  if(c.y<.78)face([[x-.52,.779,z-.37],[x+.52,.779,z-.37],[x+.52,.779,z+.37],[x-.52,.779,z+.37]],night.underside);

  if(x===1.45&&z===1.0){
   // Davi turned his chair toward Caio. Backrest stays behind his back, never through his chest.
   for(const xx of [1.12,1.69])for(const zz of [-.04,.58])box(xx,0,zz,.045,.54,.045,'#252e4e');
   box(1.10,.47,-.08,.64,.07,.72,'#3a3049','#52465a');
   for(const zz of [-.08,.59])box(1.70,.54,zz,.045,.55,.045,'#252e4e');
   box(1.70,.80,-.08,.05,.28,.72,'#473954','#594963');
  }else{
   box(x-.44,.12,z-.85,.045,.88,.045,'#252e4e');box(x+.40,.12,z-.85,.045,.88,.045,'#252e4e');
   box(x-.44,.47,z-.88,.88,.07,.48,'#3a3049','#52465a');box(x-.44,.79,z-.91,.88,.25,.045,'#473954','#594963');
  }
  // Paper rests on the physical tabletop.
  if(c.y>.85)face([[x-.26,.853,z-.20],[x+.25,.853,z-.20],[x+.25,.853,z+.20],[x-.26,.853,z+.20]],'#e1e1d1','#b8baac',1);
  if(c.y>.85&&x===0&&z===1.0){for(let i=0;i<8;i++)face([[x-.20,.856,z-.12+i*.033],[x+.19,.856,z-.12+i*.033],[x+.19,.856,z-.117+i*.033],[x-.20,.856,z-.117+i*.033]],'#75848a','none');}
 }
 const character=(x:number,z:number,head:number,teacher:boolean,crouch:boolean,who:string,finger=0,back=false,amount=crouch?1:0)=>{
  face(Array.from({length:24},(_,i)=>[x+Math.cos(i*Math.PI/12)*.23,.004,z+Math.sin(i*Math.PI/12)*.16] as V),'#081722','none',0,.22);
  const root:V=[x,head,z],q=view(root,c);if(q[2]<.25||Math.abs(q[0]/q[2])>1.5)return;
  const anchor=1.18,dx=x+.12,dz=z-anchor,len=Math.hypot(dx,dz),normal:[number,number]=(back||(teacher&&crouch))?[0,1]:[dx/len,dz/len],unit=mix(back?.0022:.0024,back?.00125:.00135,amount);
  const matrix=planeMatrix(root,normal,unit,c,mix(back?545:teacher?654:530,back?400:408,amount));if(!matrix)return;
  const mm=matrix.slice(7,-1).split(',').map(Number),det=mm[0]*mm[3]-mm[1]*mm[2];
  const feet=[-1,1].map(side=>{const xx=side*mix(back?65:teacher?60:100,back?110:(teacher&&side<0?45:115),amount),world:V=[root[0]+normal[1]*unit*xx,0,root[2]-normal[0]*unit*xx],v=view(world,c);if(v[2]<.08)return [xx,mix(back?522:teacher?629:505,back?380:385,amount)] as [number,number];const P=screen(v,c),X=P[0]-mm[4],Y=P[1]-mm[5];return [(mm[3]*X-mm[2]*Y)/det,(mm[0]*Y-mm[1]*X)/det-(back?22:25)] as [number,number];});
  const id='actor-mask-'+count++,blocks=occluders.filter(pts=>!(who==='D'&&t<38.5&&pts.every(p=>p[0]>=1.09&&p[0]<=1.76&&p[1]<=.56&&p[2]>=-.1&&p[2]<=.66))).map(pts=>nearerMask(pts,root,normal,c)).filter(Boolean);
  actors.push({z:q[2],node:<g key={id} mask={`url(#${id})`}><defs><mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920"><rect width="1080" height="1920" fill="white"/>{blocks.map((d,i)=><polygon key={i} points={d} fill="black"/>)}</mask></defs><g transform={matrix} data-actor={back?undefined:who} data-face={back?undefined:"-110,-155,110,119"}>{back?<PupilBack footTargets={feet} crouch={crouch} crouchAmount={amount} t={t} variant={x<0?0:x>0?2:1}/>:<Character footTargets={feet} teacher={teacher} crouch={crouch} crouchAmount={amount} mouth={env[who]?.[frame]||0} t={t} viseme={visemeAt(t,who)} finger={finger}/>}</g></g>});
 };
 const hiding=1;
 character(1.6,1.0,.55,false,true,'D',0,false,1);
 const intervene=ev(t,54.7,57.15);
 character(mix(-.72,-.65,intervene),mix(2.05,2.09,intervene),mix(.55,.73,intervene),true,true,'E',
   ev(t,7.1,7.62)*(1-ev(t,8.8,9.45)),false,1);
 // Fixed world orientation: the class looks toward the board, never rotates to follow Caio.
 for(const z of [2.7,4.4])for(const x of [-1.45,0,1.45])character(x,mix(z-.6,z,hiding),mix(1.20,.50,hiding),false,hiding>.6,'',0,true,hiding);
 if(c.y>.85)items.push({z:view([0,.857,.92],c)[2]-.015,node:<ExamPaper key="permanent-paper" c={c} t={t}/>});
 return <g>{background.map(i=>i.node)}{items.sort((a,b)=>b.z-a.z).map(i=>i.node)}{actors.sort((a,b)=>b.z-a.z).map(i=>i.node)}{dark>0&&<rect width="1080" height="1920" fill={night.violet} opacity={dark*.055}/>}<rect width="1080" height="1920" fill="url(#nightDepth)" opacity={dark*.85}/></g>;
};
