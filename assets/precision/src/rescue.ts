export type V=[number,number];
export const INSERT_ANCHOR:V=[540,960];
export const clamp=(x:number)=>Math.max(0,Math.min(1,x));
export const ease=(x:number)=>{const p=clamp(x);return p*p*(3-2*p);};
export const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
export const blend=(a:V,b:V,p:number):V=>[mix(a[0],b[0],p),mix(a[1],b[1],p)];
export const ev=(t:number,a:number,d:number)=>ease((t-a)/d);
const rad=(a:number)=>a*Math.PI/180;
export const bodyPoint=(origin:V,p:V,scale:number,sink:number,lean:number):V=>{
 const a=rad(lean);return [origin[0]+scale*(p[0]*Math.cos(a)-(p[1]-520)*Math.sin(a)),origin[1]+scale*(sink+520+p[0]*Math.sin(a)+(p[1]-520)*Math.cos(a))];
};
export const localPoint=(origin:V,p:V,scale:number,sink:number,lean:number):V=>{
 const a=rad(-lean),x=(p[0]-origin[0])/scale,y=(p[1]-origin[1])/scale-sink-520;
 return [x*Math.cos(a)-y*Math.sin(a),520+x*Math.sin(a)+y*Math.cos(a)];
};

export interface Pose {x:number;y:number;lean:number;sink:number;left:V;right:V;leftFoot:V;rightFoot:V;look:number;lookY:number;tilt:number}
export function scene(t:number){
 const u=ev(t,3.7,.8),recover=ev(t,4.6,.9),grasp=ev(t,2.65,.55),release=ev(t,5.35,.45);
 const k:Pose={x:640-550*u,y:600,lean:-14*Math.sin(u*Math.PI*.7)*(1-recover*.7),sink:95*Math.sin(u*Math.PI)+30*u*(1-recover),left:[-190,430],right:[220,360],leftFoot:[-78,878],rightFoot:[80,878],look:t<2.3?.9:t<5.3?.4:.8,lookY:t<2.3?-.8:.2,tilt:t<3.7?-4:mix(5,-2,recover)};
 const l:Pose={x:1000-550*u,y:527,lean:-5*Math.sin(Math.PI*u),sink:35*Math.sin(Math.PI*u),left:[-150,450],right:[220,350],leftFoot:[-78,878],rightFoot:[80,878],look:t<2.65?.7:t<7.4?-.8:.8,lookY:t<5.35?-.25:t<7.4?.25:-.65,tilt:t<5.35?-3:-4+ev(t,7.2,.55)*6};
 // Collar target follows the actual transformed costume point, not a second guessed animation.
 const collar=bodyPoint([k.x,k.y],[85,185],1,k.sink,k.lean);
 const reach=localPoint([l.x,l.y],collar,1.08,l.sink,l.lean);
 l.left=blend(blend([-150,450],reach,grasp),[-180,420],release);
 k.left=blend([-190,430],[-245,300],Math.sin(u*Math.PI));
 k.right=blend([220,360],[275,410],u);
 // A planted trailing boot, then a recovery step. The leading foot clears the ground.
 const step=ev(u,.22,.78);
 k.leftFoot=[mix(-78,-115,u),878-Math.sin(Math.PI*u)*115];
 k.rightFoot=[mix(720-k.x,110,step),878-Math.sin(Math.PI*step)*90];
 l.leftFoot=[mix(-78,-125,u),878-Math.sin(Math.PI*u)*125];
 l.rightFoot=[mix((1086.4-l.x)/1.08,105,step),878-Math.sin(Math.PI*step)*80];
 const hand=bodyPoint([l.x,l.y],l.left,1.08,l.sink,l.lean);
 const fist=t<1.3?blend([3090,-1800],[3180,-2900],ev(t,0,1.3)):t<4.25?[3180,-2900]:t<4.65?blend([3180,-2900],[1000,1190],Math.pow(clamp((t-4.25)/.4),2)):t<5.2?[1000,1190]:blend([1000,1190],[1150,1000],ev(t,5.2,.8));
 return {k,l,u,grasp,release,collar,hand,fist,impact:t>=4.65,impactAge:Math.max(0,t-4.65)};
}

export function camera(t:number,collar:V){
 let x=1000,y=600,z=.7,roll=0;
 const s=t<1.2?0:t<2.3?1:t<3.5?2:t<4.9?3:t<6.3?4:t<8.1?5:6;
 if(s===0){const p=ev(t,0,1.2);x=mix(1250,1120,p);y=mix(-250,400,p);z=mix(.43,.67,p);roll=mix(-3,0,p);}
 if(s===1){const p=ev(t,1.2,1.1);x=620;y=mix(650,625,p);z=mix(2.1,2.4,p);roll=mix(-2,1,p);}
 if(s===2){const p=ev(t,2.3,1.2);x=mix(820,720,p);y=mix(730,780,p);z=mix(1.7,1.8,p);roll=mix(-2,0,p);}
 if(s===3){const p=ev(t,3.5,1.4);x=720-360*ev(t,3.7,.8);y=mix(780,900,p);z=mix(1.0,.87,p);roll=mix(0,4,p);}
 if(s===4){const p=ev(t,4.9,1.4);x=mix(1150,1100,p);y=mix(1170,1220,p);z=mix(1.05,1.18,p);roll=mix(4,0,p);}
 if(s===5){const p=ev(t,6.3,1.8);x=480;y=mix(575,560,p);z=mix(1.95,2.15,p);roll=mix(1,-1,p);}
 if(s===6){const p=ev(t,8.1,1.9);x=mix(480,680,p);y=mix(900,500,p);z=mix(.87,.66,p);roll=mix(-1,1,p);}
 return {x,y,z,roll,s};
}
