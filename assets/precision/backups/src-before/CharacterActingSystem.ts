export type Feeling='neutral'|'confusion'|'worry'|'fear'|'panic'|'shock'|'authority'|'curiosity'|'relief'|'despair'|'resolve';
type Pose={eye:number;inner:number;outer:number;asym:number;tilt:number;rest:number;shoulder:number;breath:number;recoil:number};
const poses:Record<Feeling,Pose>={
 neutral:{eye:21,inner:0,outer:0,asym:0,tilt:0,rest:0,shoulder:0,breath:1,recoil:0},
 confusion:{eye:19.5,inner:2,outer:0,asym:8,tilt:-3.2,rest:.4,shoulder:2,breath:1,recoil:0},
 worry:{eye:22.5,inner:9,outer:-1,asym:1,tilt:-1,rest:.8,shoulder:5,breath:1.4,recoil:1},
 fear:{eye:26,inner:14,outer:4,asym:0,tilt:-1.5,rest:3.5,shoulder:8,breath:2.1,recoil:3},
 panic:{eye:25,inner:16,outer:2,asym:1.5,tilt:-2.2,rest:2.2,shoulder:10,breath:2.6,recoil:4},
 shock:{eye:29.5,inner:19,outer:13,asym:0,tilt:1,rest:7,shoulder:11,breath:.3,recoil:7},
 curiosity:{eye:23,inner:2,outer:5,asym:5,tilt:3,rest:1,shoulder:1,breath:1.1,recoil:0},
 relief:{eye:20,inner:7,outer:-1,asym:2,tilt:-1,rest:1.3,shoulder:3,breath:2,recoil:1},
 despair:{eye:24,inner:18,outer:-3,asym:2,tilt:-4,rest:3,shoulder:13,breath:3,recoil:3},
 resolve:{eye:21,inner:8,outer:0,asym:1,tilt:2,rest:.3,shoulder:7,breath:1.5,recoil:0},
 authority:{eye:20.5,inner:4,outer:-2,asym:0,tilt:.5,rest:.3,shoulder:4,breath:1.3,recoil:0},
};

export type Cue={at:number;feeling:Feeling;duration?:number};
export type Reaction={at:number;release:number;gaze:number;lean:number;grip:number;breathHold?:number};
export function smooth(x:number){
 const p=Math.max(0,Math.min(1,x));
 return p*p*(3-2*p);
}

export function createActingTrack(cues:readonly Cue[]){
 if(!cues.length||cues.some((cue,i)=>i>0&&cue.at<cues[i-1].at))throw Error('Acting cues must be ordered');
 const states=Object.keys(poses) as Feeling[];
 const fields=Object.keys(poses.neutral) as (keyof Pose)[];
 return (time:number)=>{
  const weights=Object.fromEntries(states.map(state=>[state,0])) as Record<Feeling,number>;
  weights[cues[0].feeling]=1;
  for(const cue of cues.slice(1)){
   if(time<cue.at)break;
   const blend=smooth((time-cue.at)/(cue.duration??.58));
   for(const state of states)weights[state]*=1-blend;
   weights[cue.feeling]+=blend;
  }
  const pose=Object.fromEntries(fields.map(field=>[field,states.reduce((sum,state)=>sum+poses[state][field]*weights[state],0)])) as Pose;
  return {weights,pose};
 };
}

// Gaze leads the head and chest. The residual expression eases out after the beat.
export function reactionAt(time:number,event:Reaction){
 const phase=(delay:number,duration:number)=>smooth((time-event.at-delay)/duration)*(1-smooth((time-event.release)/.6));
 const eyes=phase(0,.14);
 const head=phase(.09,.28);
 const body=phase(.24,.4);
 return {gaze:event.gaze*eyes,head:head*event.gaze*.24,lean:event.lean*body,
  grip:event.grip*body,breathHold:(event.breathHold??0)*body,body};
}
