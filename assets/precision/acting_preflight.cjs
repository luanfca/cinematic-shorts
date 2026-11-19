const fs=require('node:fs'),assert=require('node:assert/strict'),ts=require('typescript');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
for(const extension of ['.ts','.tsx']){
 require.extensions[extension]=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}
 }).outputText,file);
}
const {Classroom}=require('./src/Classroom.tsx');
const {emotionAt}=require('./src/emotion.ts');
const {inspectFace,inspectActing,compareExpressions}=require('./src/ActingQualityValidator.ts');
const {createActingTrack,reactionAt}=require('./src/CharacterActingSystem.ts');
const {attentionKeys,interpolatePOV}=require('./src/POVCinematicDirector.ts');
const env=require('./src/envelopes.json');

function inspectActor(t,actor){
 const svg=renderToStaticMarkup(React.createElement('svg',null,Classroom({t,env,frame:Math.round(t*30)})));
 const match=new RegExp('<g transform="matrix\\(([^\"]+)\\)" data-actor="'+actor+'"').exec(svg);
 if(!match)return ['actor missing from shot'];
 const [a,b,c,d,x,y]=match[1].split(',').map(Number);
 const world=([px,py])=>[a*px+c*py+x,b*px+d*py+y];
 const mask=svg.slice(0,match.index).split('<mask').pop().split('</mask>')[0];
 const occluders=[...mask.matchAll(/points="([^"]+)" fill="black"/g)].map(row=>row[1].split(' ').map(pair=>pair.split(',').map(Number)));
 const bounds=[[-116,-151],[116,-151],[116,123],[-116,123]].map(world);
 const eyes=[[-40,0],[42,0]].map(world);
 return inspectFace({bounds,eyes,occluders},1080,1920,32,35);
}

const scenes=[
 {id:'recognition',actor:'D',start:41.55,end:45.10,acting:[39.3,40.5,42.5,44.1]},
 {id:'teacher-blocks',actor:'E',start:53.20,end:60.40,acting:[52.9,53.15,55,56.15,58.65,60]},
 {id:'final-dilemma',actor:'D',start:61.65,end:64.85,acting:[59.8,60.3,61.9,63.75]},
];

const sample=(time,actor)=>{
 const a=emotionAt(time,actor==='E');
 return {time,face:[a.eye,a.inner,a.outer,a.asym,a.jaw],body:[a.shoulder,a.recoil,a.lean*85,a.grip*8,a.neck]};
};
const results=scenes.map(scene=>{
 const findings=[];
 let sampled=0;
 for(let frame=Math.ceil(scene.start*30);frame<=Math.floor(scene.end*30);frame+=2){
  const issues=inspectActor(frame/30,scene.actor);
  if(issues.length)findings.push({frame,issues});
  sampled++;
 }
 return {id:scene.id,sampled,findings,acting:inspectActing(scene.acting.map(t=>sample(t,scene.actor)),{face:2,body:1.5})};
});
assert(compareExpressions(sample(40.3,'D').face,sample(43.2,'D').face,3),'Confusion and recognition must read differently');
const beat={at:1,release:2,gaze:7,lean:.04,grip:.4};
assert(reactionAt(1.15,beat).gaze>0&&reactionAt(1.15,beat).body===0);
assert(reactionAt(1.55,beat).body>0&&reactionAt(3,beat).gaze===0);
assert.equal(createActingTrack([{at:0,feeling:'neutral'},{at:1,feeling:'shock'}])(2).weights.shock,1);
const keys=[[0,0,0,0,0,0],...attentionKeys({kind:'message',at:0,arrive:1,holdUntil:2,target:[1,.4,2,.6,-.3]})];
assert.equal(interpolatePOV(keys,1.5).pitch,-.3);
assert(inspectFace({bounds:[[5,1]],eyes:[[10,10],[12,10]],occluders:[[[0,0],[20,0],[20,20],[0,20]]]},1080,1920).length===3);
assert(inspectActing([{time:0,face:[0],body:[0]},{time:1,face:[0],body:[0]}],{face:1,body:1}).errors.length===2);
fs.mkdirSync('renders',{recursive:true});
fs.writeFileSync('renders/acting-preflight.json',JSON.stringify({results,manualReview:['hand and knee contact','viewing motion and lip sync','phone and voting contrast','identity and lighting continuity']},null,2));
for(const row of results)console.log(row.id,row.sampled,row.findings.slice(0,5),row.acting);
assert(results.every(r=>!r.acting.errors.length&&!r.findings.length),'Acting or framing check failed');
