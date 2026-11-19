import {editTime} from './timing';

import {createActingTrack,reactionAt,smooth,applyPerformance,type Cue} from './CharacterActingSystem';
import {precisionPerformances}from'./PrecisionPlan';
const davi:Cue[]=[{at:0,feeling:'fear',duration:0.4},{at:10,feeling:'panic',duration:0.6},{at:12.4,feeling:'confusion',duration:0.6},{at:17.4,feeling:'worry',duration:0.6},{at:19.4,feeling:'shock',duration:0.35},{at:22.5,feeling:'shock',duration:0.35},{at:24.8,feeling:'panic',duration:0.55},{at:28,feeling:'relief',duration:0.8},{at:37.52,feeling:'confusion',duration:.75},{at:39.15,feeling:'fear',duration:1.05},{at:42.02,feeling:'shock',duration:.57},{at:44.8,feeling:'panic',duration:.8},{at:47.1,feeling:'worry',duration:.7},{at:50.3,feeling:'fear',duration:1.1},{at:54,feeling:'panic',duration:.7},{at:60,feeling:'despair',duration:.95}];
const elisa:Cue[]=[{at:0,feeling:'authority',duration:0.5},{at:4.12,feeling:'fear',duration:0.4},{at:7.6,feeling:'authority',duration:0.5},{at:29,feeling:'worry',duration:0.55},{at:31,feeling:'authority',duration:0.5},{at:39,feeling:'fear',duration:0.6},{at:52.5,feeling:'shock',duration:0.37},{at:55.94,feeling:'resolve',duration:0.5},{at:59,feeling:'fear',duration:0.6}];
const tracks={davi:createActingTrack(davi),elisa:createActingTrack(elisa)};
export function emotionAt(t:number,teacher=false){
 const rt=editTime(t),track=teacher?tracks.elisa:tracks.davi;
 const {weights:w,pose}=track(rt),{weights:body,pose:bodyPose}=track(rt-.28);
 const window=(a:number,c:number,d:number)=>smooth((rt-a)/.16)*(1-smooth((rt-c)/(d-c)));
 const reaction=reactionAt(rt,teacher
  ?{at:52.82,release:59.1,gaze:-5,lean:-.045,grip:.24,breathHold:.33}
  :{at:37.52,release:43.45,gaze:-6,lean:.032,grip:.33,breathHold:.70});
 const secondLook=teacher?0:window(43.62,44.12,44.58);
 // Davi's gaze follows specific sounds and contradictory information.
 let gaze=(teacher?2:0)+reaction.gaze+secondLook*7;
 if(!teacher){
  gaze+=7*window(0,12,13.6);
  gaze+=8*window(16.7,19.8,22.4);
  gaze+=6*window(26.8,29,29.6);
  gaze+=4*window(39.82,42.42,43.12);
  gaze+=4*window(48.1,51.0,53.0);
  gaze+=5*window(44.4,46.4,47);
  gaze-=6*window(53,58.8,60.25);
 }else gaze+=4*window(4.1,7.1,7.8);
 const recognize=teacher?0:window(39.2,42.2,44.85);
 const repeat=teacher?0:window(22.65,24.65,26.6);
 const block=teacher?window(53.0,58.9,61):0;
 const anguish=teacher?0:window(59.8,63.9,65.1);
 const guarded=teacher?0:window(0,11.1,13.9)+.55*window(27.3,34,36.8);
 const tense=recognize+repeat+anguish+block;
 const freeze=teacher?0:window(39.7,42.1,43.15);
 const still=Math.max(w.shock*.94,freeze*.90,reaction.breathHold);
 const lean=teacher?-.055*block:.060*recognize+.033*repeat+.018*guarded-.030*anguish;
 const jaw=track(rt-.11).pose.rest;
 const neck=bodyPose.recoil*.86;
 const grip=body.panic*.85+body.fear*.35+body.shock*.65;
 const base={...w,jaw,neck,grip:Math.min(1,grip+.35*tense+reaction.grip),lean:lean+reaction.lean,block,tense,eye:pose.eye,inner:pose.inner,outer:pose.outer,asym:pose.asym,tilt:pose.tilt+reaction.head+2.7*recognize-2.5*block-2.0*anguish,rest:pose.rest,
  shoulder:bodyPose.shoulder+5.7*tense+4*guarded,recoil:bodyPose.recoil+3.9*recognize+2*repeat,
  breath:(Math.sin(rt*(2.15+body.fear*.45+body.panic*.65))+.17*body.panic*Math.sin(rt*6.4))*bodyPose.breath*(1-still),
  tremor:(body.panic*.55+w.shock*.35)*Math.sin(rt*23),jawTremor:w.shock*Math.sin(rt*21)*.8,gaze,still};
 return applyPerformance(base,rt,teacher?precisionPerformances.elisa:precisionPerformances.davi);
}
