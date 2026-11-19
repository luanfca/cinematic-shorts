import {attentionKeys,interpolatePOV,eventPulse,localAttention,type POVKey} from './POVCinematicDirector';
export type V=[number,number,number];
export const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
export const ease=(x:number)=>{const p=Math.max(0,Math.min(1,x));return p*p*(3-2*p);};
export const ev=(t:number,a:number,b:number)=>ease((t-a)/(b-a));
// y is height above the floor. Positive pitch looks up; yaw positive turns right.
// [time, x, height, z, yaw, pitch]. Every turn serves a sound or a reply.
const keys:POVKey[]=[
 [0,.73,.35,1.39,.91,.04],[1.67,.73,.35,1.39,.92,.015],[2.45,.73,.352,1.33,1.54,.18],[3.43,.73,.352,1.33,1.54,.18],[4.35,.73,.35,1.39,.91,.06],
 [6.9,.73,.35,1.39,.91,.055],[7.2,.73,.35,1.56,.3,.1],[7.8,-.69,.36,1.56,-.06,.21],[8.85,-.69,.36,1.56,-.06,.21],
 [9.75,.73,.35,1.39,.91,.07],[11.03,.73,.35,1.39,.91,.07],[11.42,.73,.35,1.385,.95,.016],[12.05,.73,.35,1.385,.95,.016],[12.9,.73,.35,1.32,1.52,.17],
 [14.05,.65,.345,1.07,1.65,.19],[16.8,.65,.345,1.07,1.65,.19],
 [17.25,.65,.345,1.07,1.53,.16],[18.15,.65,.345,1.07,1.62,.19],
 [19.1,.73,.35,1.39,.91,.065],[22.4,.73,.35,1.39,.91,.06],
 [23.1,.73,.352,1.055,1.62,.22],[26.7,.73,.352,1.055,1.63,.21],
 [27.7,.73,.35,1.39,.91,.04],[28.35,.73,.35,1.39,.91,.04],
 [29.05,.55,.36,1.16,1.7,.12],[30.25,.55,.36,1.16,1.7,.12],
 [30.45,.55,.36,1.6,1,.1],[31.42,-.69,.36,1.6,-.06,.21],[33.5,-.69,.36,1.6,-.06,.21],
 [35.6,.24,.34,1.58,-1.25,.18],[37.2,.24,.34,1.58,-1.25,.11],
 [37.8,.24,.34,1.58,-1.25,.11],[38.36,.24,.34,1.58,-1.20,.09],[39.02,.24,.34,1.58,-1.20,.09],...attentionKeys({
  kind:'revelation',at:39.02,arrive:41.55,holdUntil:45.12,
  via:[[40.02,.65,.345,1.56,.46,.12]],
  target:[.77,.355,1.055,1.63,.235],
 }),[45.56,.72,.344,1.115,1.44,.18],
 ...attentionKeys({kind:'unseen-threat',at:45.12,arrive:46.23,holdUntil:46.68,target:[.73,.35,1.39,.91,.04]}),
 ...attentionKeys({kind:'notification',at:46.68,arrive:47.15,holdUntil:52.37,target:[.73,.35,1.39,1.06,-.24]}),[52.52,.73,.35,1.62,.52,-.12],[53.17,-.69,.36,1.62,-.06,.24],
 [54.25,-.69,.36,1.62,-.06,.24],[54.99,-.69,.405,1.62,.04,-.05],
 [55.7,-.69,.62,1.62,.12,.08],[56.35,-.69,.67,1.62,.03,.10],
 [57.18,-.69,.68,1.62,.05,.09],[60.45,-.69,.68,1.62,.05,.09],
 [60.9,.73,.57,1.60,1.54,.02],[61.6,.73,.55,1.07,1.65,.015],[65.04,.73,.55,1.07,1.65,.015],
 [65.78,.75,.56,1.58,.97,.04],[67.9,.75,.56,1.58,.97,.04],
];
export function legacyCamera(t:number){
 const {x,y,z,yaw,pitch}=interpolatePOV(keys,t);
 const alarm=eventPulse(t,37.35,37.56,38.2,38.95);
 const startle=eventPulse(t,45.12,45.32,45.41,46.12);
 const flinch=.014*eventPulse(t,4.02,4.18,4.28,4.66)+.035*startle;
 return {x,y:y+Math.sin(t*2.1)*.0017+Math.sin((t-45.12)*15)*startle*.004,z:z-flinch,yaw,pitch:pitch-.02*alarm+flinch,roll:alarm*1.35,f:760};
}
const K=(t:number):POVKey=>{const c=legacyCamera(t);return[t,c.x,c.y,c.z,c.yaw,c.pitch];};
const recognition:POVKey[]=[K(40),[40.96,.76,.365,1.055,1.63,.22],[44.75,.76,.365,1.055,1.63,.22],[45.12,.76,.365,1.055,1.63,.22],[45.30,.715,.36,1.075,1.57,.195],[45.58,.73,.35,1.14,1.35,.125],[46.23,.73,.35,1.39,.91,.04],K(46.68),K(47)];
const phoneToTeacher:POVKey[]=[K(51),[51.65,.54,.35,1.61,1.06,-.24],[52.15,.18,.35,1.64,1.06,-.24],[52.50,-.12,.35,1.64,.40,-.10],[52.85,-.45,.36,1.64,-.26,.16],[53.05,-.62,.36,1.64,-.06,.24],[53.60,-.69,.36,1.62,-.06,.24],[54.37,-.69,.36,1.62,-.06,.24],[54.9,-.69,.43,1.62,.04,.09],[55.25,-.69,.53,1.62,.10,.10],K(55.7)];
export function camera(t:number){let c=legacyCamera(t);c=localAttention(t,c,recognition);return localAttention(t,c,phoneToTeacher);}
export type Cam=ReturnType<typeof camera>;
export function view(p:V,c:Cam):V{const dx=p[0]-c.x,dy=p[1]-c.y,dz=p[2]-c.z,rx=dx*Math.cos(c.yaw)-dz*Math.sin(c.yaw),rz=dx*Math.sin(c.yaw)+dz*Math.cos(c.yaw);return [rx,dy*Math.cos(c.pitch)-rz*Math.sin(c.pitch),dy*Math.sin(c.pitch)+rz*Math.cos(c.pitch)];}
export const screen=(v:V,c:Cam):[number,number]=>[540+c.f*v[0]/v[2],850-c.f*v[1]/v[2]];
export function polygon(points:V[],c:Cam){
 const src=points.map(p=>view(p,c)),out:V[]=[];
 for(let i=0;i<src.length;i++){const a=src[i],b=src[(i+1)%src.length],aa=a[2]>=.08,bb=b[2]>=.08;if(aa)out.push(a);if(aa!==bb){const t=(.08-a[2])/(b[2]-a[2]);out.push(a.map((v,j)=>mix(v,b[j],t)) as V);}}
 return out.length<3?'':out.map(p=>screen(p,c).join(',')).join(' ');
}
export const cuts=[0,7,13,18,27,33,38,45,52,60,70,79,88,96,103,111,117,135,141.5,150];
