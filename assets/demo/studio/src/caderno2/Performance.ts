import React from 'react';
import {Pose} from '../engine';
import TRACK from './performance.json';import MOUTHS from './visemes.json';
export const performanceAt=(shot:string,p:number):Partial<Pose>=>{
 const keys=((TRACK.shots as Record<string,any[]>)[shot]||[]);if(!keys.length)return{};
 const a=[...keys].reverse().find(k=>k.at<=p)||keys[0];const b=keys.find(k=>k.at>=p)||keys[keys.length-1];const t=a===b?0:Math.max(0,Math.min(1,(p-a.at)/Math.max(.001,b.at-a.at)));const v=(name:string)=>{const x=a[name]??0,y=b[name]??x;return x+(y-x)*(t*t*(3-2*t))};
 return {headTilt:v('headTilt'),look:v('look'),lookY:v('lookY'),tilt:v('tilt'),yaw:v('yaw'),...(a.blink!==undefined||b.blink!==undefined?{blink:v('blink')}:{}),armL:{a:v('armLA'),b:v('armLB')},armR:{a:v('armRA'),b:v('armRB')}};
};
export const directedPose=(base:Pose,shot:string,p:number):Pose=>{const d=performanceAt(shot,p);if(!Object.keys(d).length)return base;return {...base,headTilt:base.headTilt+(d.headTilt||0),look:Math.max(-1,Math.min(1,base.look+(d.look||0))),lookY:d.lookY||base.lookY,tilt:base.tilt+(d.tilt||0),yaw:base.yaw+(d.yaw||0),blink:d.blink??base.blink,armL:{a:base.armL.a+(d.armL?.a||0),b:base.armL.b+(d.armL?.b||0)},armR:{a:base.armR.a+(d.armR?.a||0),b:base.armR.b+(d.armR?.b||0)}}};
export const mouthAt=(who:'lucas'|'fake',f:number,talk:number):Pose['viseme']=>TRACK.mouthMode==='word-preview'&&talk>.06?((MOUTHS.frames[who][f]||'rest')as Pose['viseme']):undefined;
