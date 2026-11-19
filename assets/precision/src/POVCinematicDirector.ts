export type POVKey=readonly [number,number,number,number,number,number];
type AttentionKind='noise'|'speech'|'notification'|'message'|'revelation'|'unseen-threat';
export type AttentionEvent={
 kind:AttentionKind;
 at:number;
 arrive:number;
 holdUntil:number;
 target:readonly [number,number,number,number,number];
 via?:readonly POVKey[];
};

// Scene supplies physical waypoints so the director can share timing logic across rooms.
export function attentionKeys(event:AttentionEvent):POVKey[]{
 if(event.arrive<event.at||event.holdUntil<event.arrive||
    event.via?.some((key,index)=>key[0]<event.at||key[0]>=event.arrive||(index>0&&key[0]<=event.via![index-1][0]))) {
  throw new Error('Invalid POV event: '+event.kind);
 }
 return [...(event.via??[]),[event.arrive,...event.target],
  ...(event.holdUntil>event.arrive?[[event.holdUntil,...event.target] as POVKey]:[])];
}

export function interpolatePOV(keys:readonly POVKey[],time:number){
 let i=0;
 while(i<keys.length-2&&time>keys[i+1][0])i++;
 const a=keys[i],b=keys[i+1];
 const linear=Math.max(0,Math.min(1,(time-a[0])/(b[0]-a[0])));
 const p=linear*linear*(3-2*linear);
 const [,x,y,z,yaw,pitch]=a.map((v,j)=>v+(b[j]-v)*p);
 return {x,y,z,yaw,pitch};
}

export function eventPulse(time:number,at:number,peak:number,hold:number,end:number){
 const curve=(value:number)=>{const p=Math.max(0,Math.min(1,value));return p*p*(3-2*p);};
 return curve((time-at)/(peak-at))*(1-curve((time-hold)/(end-hold)));
}

export function localAttention<T extends {x:number;y:number;z:number;yaw:number;pitch:number}>(time:number,base:T,keys:readonly POVKey[]){
 if(time<keys[0][0]||time>=keys[keys.length-1][0])return base;
 return {...base,...interpolatePOV(keys,time)};
}

/** Choreograph the screen-space lowering before a reaction, preserving the UI itself. */
export function lowerHeldObject(time:number,start:number,end:number,fromY:number,toY:number){
 const p=Math.max(0,Math.min(1,(time-start)/(end-start))),s=p*p*(3-2*p);
 return {progress:s,y:fromY+(toY-fromY)*s};
}
