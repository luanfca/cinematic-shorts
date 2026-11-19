/** Reusable 2D motion: units are the reference drawing's world units, seconds and degrees. */
export type V=[number,number];
export const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export const smooth=(n:number)=>{const p=clamp(n);return p*p*(3-2*p);};
export const lerp=(a:number,b:number,p:number)=>a+(b-a)*p;
export const blend=(a:V,b:V,p:number):V=>[lerp(a[0],b[0],p),lerp(a[1],b[1],p)];
export const CORE:V=[2100,-1430];
export const TAKEOFF=14.2,FLIGHT=2.6,HEIGHT=2150,IMPACT=15.6,HOLD=.1;
export const poseTime=(t:number)=>t<=IMPACT?t:t<=IMPACT+HOLD?IMPACT:t-HOLD;
export const radians=(a:number)=>a*Math.PI/180;
export const coreAt=(t:number):V=>[CORE[0]+Math.sin((poseTime(t)*30+1800)/40)*7.2,CORE[1]];
export const tip=(origin:V,hand:V,angle:number,length=330):V=>[origin[0]+hand[0]+Math.sin(radians(angle))*length,origin[1]+hand[1]-Math.cos(radians(angle))*length];

export interface MotionPose {x:number;y:number;left:V;right:V;leftFoot:V;rightFoot:V;crouch:number;lean:number;tilt:number;angle:number;grounded:boolean;shadow:number;breath:number;phase:string;leftBootAngle:number;rightBootAngle:number}
export function hero(t:number):MotionPose {
 const m=poseTime(t),u=clamp((m-TAKEOFF)/FLIGHT);
 let x=640,y=600,left:V=[-160,455],right:V=[220,300],leftFoot:V=[-78,878],rightFoot:V=[80,878],crouch=0,lean=0,tilt=0,angle=28,grounded=true,shadow=1,breath=1,phase='idle';
 if(t>=5&&t<9){right=[45,350];crouch=lerp(30,0,smooth((t-5)/.8));tilt=-7;phase='fear';}
 if(t>=9&&t<13.2){right=[220,lerp(390,255,smooth((t-11.25)/.5))];phase='resolve';}
 if(m>=13.2&&m<13.95){
  phase='run';const a=m-13.2,v=310/.75;x=640+v*a;lean=8;
  const cycle=.36;
  const foot=(offset:number,side:number):V=>{const f=(a/cycle+offset)%1;const step=v*cycle;return [side*72+(f<.5?step*(.25-f):lerp(-step*.25,step*.25,smooth((f-.5)*2))),878-Math.sin(Math.PI*clamp((f-.5)*2))*100*(f>.5?1:0)];};
  leftFoot=foot(0,-1);rightFoot=foot(.5,1);left=[-210,370+Math.sin(a/cycle*Math.PI*2)*70];right=[230,310-Math.sin(a/cycle*Math.PI*2)*65];angle=18;
 }
 if(m>=13.95&&m<TAKEOFF){phase='anticipation';x=950;const p=clamp((m-13.95)/.25),extension=smooth((p-.55)/.45);crouch=145*(p<.55?smooth(p/.55):1-extension);lean=7*(1-extension);left=blend([-210,430],[-230,240],extension);right=blend([210,345],[240,150],extension);angle=lerp(-12,8,extension);}
 if(m>=TAKEOFF&&u<1){
  phase=m<IMPACT?'flight':'follow-through';x=lerp(950,1950,u);y=600-4*HEIGHT*u*(1-u);grounded=false;shadow=0;breath=0;lean=0;
  const tuck=Math.sin(Math.PI*u),extend=smooth((u-.79)/.21);
  leftFoot=[lerp(-78-tuck*72,-150,extend),lerp(878-tuck*260,878,extend)];rightFoot=[lerp(80+tuck*120,150,extend),lerp(878-tuck*150,878,extend)];
  left=blend([-230,240+tuck*90],[-220,430],extend);
  if(m<15.35){const wind=smooth((m-14.6)/.35);lean=-12*wind;tilt=wind*5;right=[240,lerp(150,70,smooth((m-TAKEOFF)/1.15))];angle=lerp(8,-38,smooth((m-TAKEOFF)/1.15));}
  else if(m<=IMPACT){
   const p=smooth((m-15.35)/(IMPACT-15.35));angle=lerp(-38,70,p);lean=-12*(1-p);tilt=5*(1-p);
   const target=coreAt(t);
   const contact:V=[target[0]-x-Math.sin(radians(angle))*330,target[1]-y+Math.cos(radians(angle))*330];
   right=blend([240,70],contact,p);
  }else{const p=smooth((m-IMPACT)/.3),iu=(IMPACT-TAKEOFF)/FLIGHT,ix=lerp(950,1950,iu),iy=600-4*HEIGHT*iu*(1-iu),target=coreAt(IMPACT);const ih:V=[target[0]-ix-Math.sin(radians(70))*330,target[1]-iy+Math.cos(radians(70))*330];angle=lerp(lerp(70,122,p),105,extend);right=blend(blend(ih,[310,430],p),[240,380],extend);lean=Math.sin(p*Math.PI)*11*(1-extend);tilt=-p*3*(1-extend);}
 }
 if(m>=TAKEOFF+FLIGHT){
  phase='landing';x=1950;const a=m-TAKEOFF-FLIGHT;
  crouch=a<.18?145*smooth(a/.18):145*(1-smooth((a-.18)/.55));
  leftFoot=[-150,878];rightFoot=[150,878];lean=lerp(8,0,smooth(a/.7));left=[-220,430];right=[240,380];angle=105;breath=1;
  phase=a>.8?'settled':'landing';
 }
 const leftBootAngle=grounded?0:-28*Math.sin(Math.PI*u),rightBootAngle=grounded?0:20*Math.sin(Math.PI*u);
 return {x,y,left,right,leftFoot,rightFoot,crouch,lean,tilt,angle,grounded,shadow,breath,phase,leftBootAngle,rightBootAngle};
}

export function fistWorld(t:number):V {
 if(t<1.8)return [3084,70];
 if(t<3.1)return blend([3084,70],[3100,-2750],smooth((t-1.8)/1.3));
 if(t<3.65){const p=clamp((t-3.1)/.55);return blend([3100,-2750],[1572,580],p*p);}
 if(t<3.77)return [1572,580];
 if(t<5)return blend([1572,580],[2360,-900],smooth((t-3.77)/1.23));
 return blend([2360,-900],[2920,70],smooth((t-17.3)/1.3));
}

export const PRESETS={
 idle:{left:[-160,455],right:[220,300],leftFoot:[-78,878],rightFoot:[80,878],crouch:0},
 crouch:{left:[-210,430],right:[210,345],leftFoot:[-78,878],rightFoot:[80,878],crouch:145},
 airborne:{left:[-230,300],right:[240,70],leftFoot:[-150,650],rightFoot:[180,740],crouch:0},
 landing:{left:[-220,430],right:[240,380],leftFoot:[-150,878],rightFoot:[150,878],crouch:145},
} as const;
