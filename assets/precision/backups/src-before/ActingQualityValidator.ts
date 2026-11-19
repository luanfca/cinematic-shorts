export type Pixel=readonly [number,number];
export type FaceSample={bounds:readonly Pixel[];eyes:readonly Pixel[];occluders:readonly Pixel[][]};

function inside([x,y]:Pixel,polygon:readonly Pixel[]){
 let result=false;
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const [ax,ay]=polygon[i],[bx,by]=polygon[j];
  if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)result=!result;
 }
 return result;
}

export function inspectFace(face:FaceSample,width:number,height:number,margin=24,minEyeSpan=24){
 const {bounds,eyes,occluders}=face;
 const errors:string[]=[];
 if(bounds.some(([x,y])=>x<margin||x>width-margin||y<margin||y>height-margin))errors.push('face crosses frame margin');
 if(eyes.some(eye=>occluders.some(p=>inside(eye,p))))errors.push('eye hidden by furniture');
 if(Math.hypot(eyes[0][0]-eyes[1][0],eyes[0][1]-eyes[1][1])<minEyeSpan)errors.push('eyes too small in reaction shot');
 return errors;
}

export function inspectActing(samples:readonly {
 time:number;face:readonly number[];body:readonly number[];
}[],minimum:{face:number;body:number},intentionalStillness=false){
 if(samples.length<2||samples.some((s,i)=>i>0&&s.time<=samples[i-1].time))throw Error('Acting samples must be ordered');
 const span=(key:'face'|'body')=>Math.hypot(...samples[0][key].map((_,i)=>{
  const values=samples.map(s=>s[key][i]);
  return Math.max(...values)-Math.min(...values);
 }));
 const face=span('face'),body=span('body');
 const errors=[];
 if(face<minimum.face)errors.push('expression change below authored minimum');
 if(!intentionalStillness&&body<minimum.body)errors.push('body change below authored minimum');
 return {face,body,errors};
}

export function compareExpressions(a:readonly number[],b:readonly number[],minimum:number){
 if(a.length!==b.length||!a.length)throw Error('Expression vectors must have equal size');
 return Math.hypot(...a.map((value,i)=>value-b[i]))>=minimum;
}
