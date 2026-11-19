import {view,screen,type V,type Cam} from './pov';
export function planeMatrix(root:V,normal:[number,number],unit:number,c:Cam,height=650){
 const basis:V=[normal[1]*unit,0,-normal[0]*unit];
 const o=view(root,c),a=view(root.map((v,i)=>v+basis[i]) as V,c),b=view([root[0],root[1]-unit,root[2]],c);
 const u=a.map((v,i)=>v-o[i]),v=b.map((v,i)=>v-o[i]),d=o[2];
 if(d<.12)return null;
 const m=[(540*u[2]+c.f*u[0])/d,(850*u[2]-c.f*u[1])/d,0,u[2]/d,(540*v[2]+c.f*v[0])/d,(850*v[2]-c.f*v[1])/d,0,v[2]/d,0,0,1,0,540+c.f*o[0]/d,850-c.f*o[1]/d,0,1];
 const origin=screen(o,c),right=screen(view([root[0]+basis[0]*100,root[1],root[2]+basis[2]*100],c),c),bottom=screen(view([root[0],root[1]-unit*height,root[2]],c),c);
 return `matrix(${[(right[0]-origin[0])/100,(right[1]-origin[1])/100,(bottom[0]-origin[0])/height,(bottom[1]-origin[1])/height,...origin].join(',')})`;
}
export function nearerMask(points:V[],root:V,normal:[number,number],c:Cam){
 const dot=(p:V)=>(p[0]-root[0])*normal[0]+(p[2]-root[2])*normal[1];
 let out:V[]=[];
 for(let i=0;i<points.length;i++){
  const a=points[i],b=points[(i+1)%points.length],da=dot(a)+.003,db=dot(b)+.003,aa=da<0,bb=db<0;
  if(aa)out.push(a);if(aa!==bb){const t=da/(da-db);out.push(a.map((v,j)=>v+(b[j]-v)*t) as V);}
 }
 if(out.length<3)return '';
 const src=out.map(p=>view(p,c));out=[];
 for(let i=0;i<src.length;i++){const a=src[i],b=src[(i+1)%src.length],aa=a[2]>.08,bb=b[2]>.08;if(aa)out.push(a);if(aa!==bb){const t=(.08-a[2])/(b[2]-a[2]);out.push(a.map((v,j)=>v+(b[j]-v)*t) as V);}}
 return out.length<3?'':out.map(p=>screen(p,c).join(',')).join(' ');
}
export function flatMatrix(root:V,ux:V,uy:V,c:Cam){
 const o=view(root,c),a=view(root.map((v,i)=>v+ux[i]) as V,c),b=view(root.map((v,i)=>v+uy[i]) as V,c),d=o[2];if(d<.08)return null;
 const u=a.map((v,i)=>v-o[i]),v=b.map((v,i)=>v-o[i]);
 const P=screen(o,c),U=screen(view(root.map((p,i)=>p+ux[i]*100) as V,c),c),Vv=screen(view(root.map((p,i)=>p+uy[i]*100) as V,c),c);
 return `matrix(${[(U[0]-P[0])/100,(U[1]-P[1])/100,(Vv[0]-P[0])/100,(Vv[1]-P[1])/100,...P].join(',')})`;
}
