import React from 'react';
import {view,screen,type V,type Cam} from './pov';
import {writingTip} from './WorldHands';
export const ExamPaper:React.FC<{c:Cam;t:number}>=({c,t})=>{
 if(c.y<=.857)return null; const w=460,h=540;
 const at=(x:number,y:number):V=>[-.23+x*.001,.857,1.19-y*.001];
 const projected=(x:number,y:number)=>{const v=view(at(x,y),c);return v[2]>.08?screen(v,c):null;};
 const strips=Array.from({length:8},(_,i)=>{
  const y=i*h/8,end=(i+1)*h/8,A=projected(0,y),B=projected(w,y),C=projected(0,end),D=projected(w,end);if(!A||!B||!C||!D)return null;
  const u=[(B[0]-A[0])/w,(B[1]-A[1])/w],v=[(C[0]-A[0])/(end-y),(C[1]-A[1])/(end-y)],u2=[(D[0]-C[0])/w,(D[1]-C[1])/w],v2=[(D[0]-B[0])/(end-y),(D[1]-B[1])/(end-y)];
  const matrices=[`matrix(${[...u,...v,A[0]-v[0]*y,A[1]-v[1]*y]})`,`matrix(${[...u2,...v2,D[0]-u2[0]*w-v2[0]*end,D[1]-u2[1]*w-v2[1]*end]})`];
  return <g key={i}><defs><clipPath id={`paper-${i}-a`}><path d={`M0 ${y}H${w}L0 ${end}Z`}/></clipPath><clipPath id={`paper-${i}-b`}><path d={`M${w} ${end}V${y}L0 ${end}Z`}/></clipPath></defs>{matrices.map((m,j)=><g key={j} transform={m} clipPath={`url(#paper-${i}-${j?'b':'a'})`}><use href="#exam-art"/></g>)}</g>;
 });
 const ink=Array.from({length:Math.floor(Math.min(t,3)*30)+1},(_,i)=>view(writingTip(i/30),c)).filter(v=>v[2]>.08).map((v,i)=>`${i?'L':'M'}${screen(v,c)}`).join(' ');
 return <g><defs><g id="exam-art"><rect width={w} height={h} fill="#e0e3d7" stroke="#a1aaa7" strokeWidth="3"/><text x="28" y="57" fontFamily="Arial" fontSize="26" fontWeight="700" fill="#394b55">PROVA DE BIOLOGIA</text><text x="28" y="104" fontFamily="Arial" fontSize="20" fill="#52656c">Nome: Caio</text><path d="M28 126H430M28 190H430M28 255H430M28 320H430M28 385H430M28 450H430" stroke="#9caaa7" strokeWidth="2"/><text x="28" y="164" fontFamily="Arial" fontSize="17" fill="#73827e">1. Identifique as estruturas da célula.</text></g></defs>{strips}<path d={ink} fill="none" stroke="#485d65" strokeWidth="2.4" strokeLinecap="round"/></g>;
};
