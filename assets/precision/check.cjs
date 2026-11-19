const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
for(const ext of['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText,f);
const load=(folder)=>({Classroom:require(folder+'/Classroom.tsx').Classroom,landmarks:require('./src/Character.tsx').characterLandmarks,emotion:require(folder+'/emotion.ts').emotionAt,camera:require(folder+'/pov.ts').camera,phone:require(folder+'/Phone.tsx').phonePose});
const now=load('./src'),old=load('./backups/src-before'),env=require('./src/envelopes.json'),v=require('./src/ActingQualityValidator.ts'),{precisionPerformances}=require('./src/PrecisionPlan.ts');
function faceAt(model,t,actor){
 const svg=renderToStaticMarkup(React.createElement('svg',null,model.Classroom({t,env,frame:Math.round(t*30)})));
 const match=new RegExp('<g transform="matrix\\(([^\"]+)\\)" data-actor="'+actor+'"').exec(svg);
 if(!match)return{errors:['actor absent'],bounds:[],eyes:[],occluders:[],landmarks:[]};
 const[a,b,c,d,x,y]=match[1].split(',').map(Number),project=([px,py])=>[a*px+c*py+x,b*px+d*py+y];
 const mask=svg.slice(0,match.index).split('<mask').pop().split('</mask>')[0];
 const occluders=[...mask.matchAll(/points="([^"]+)" fill="black"/g)].map(row=>row[1].split(' ').map(pair=>pair.split(',').map(Number)));
 const local=now.landmarks(t,actor==='E',env[actor]?.[Math.round(t*30)]||0);
 const ph=model.phone(t);if(ph.visible){const angle=Math.sin(t*.7)*.11*Math.PI/180;occluders.push([[175,-10],[905,-10],[905,1305],[175,1305]].map(([x,y])=>[540+(x-540)*Math.cos(angle)-(y-650)*Math.sin(angle),ph.y+650+(x-540)*Math.sin(angle)+(y-650)*Math.cos(angle)]));}
 const face={bounds:local.bounds.map(project),eyes:local.eyes.map(project),landmarks:local.landmarks.map(project),occluders};
 return{...face,errors:v.inspectFace(face,1080,1920,24,35),hands:local.hands.map(project)};
}
const findings=[];for(const[actor,a,b]of[['D',41.05,45.12],['E',53.17,59]])for(let f=Math.ceil(a*30);f<=Math.floor(b*30);f++){const q=faceAt(now,f/30,actor);if(q.errors.length)findings.push({actor,frame:f,t:f/30,issues:q.errors});}
const snapshots=[40.7,41.1,42.6,44.2,52.1,52.7,53.2,53.7,55.2,56.4,58].map(t=>({t,actor:t<47?'D':'E',now:faceAt(now,t,t<47?'D':'E'),before:faceAt(old,t,t<47?'D':'E')}));
const acting=[['D',[41.1,41.7,42.2,43.2,44.4]],['E',[52.6,53.0,53.4,54.0,55.2,56.5,58.2]]].map(([actor,times])=>({actor,...v.inspectActing(times.map(time=>{const a=now.emotion(time,actor==='E');return{time,face:[a.eye,a.inner,a.outer,a.jaw,a.gaze],body:[a.shoulder,a.recoil,a.lean*85,a.neck,a.handPressure*10,a.stopGesture*10]};}),{face:3,body:3})}));
const ordered=[v.inspectReactionOrder({...precisionPerformances.davi,speech:42.2}),v.inspectReactionOrder({...precisionPerformances.elisa,speech:53.2})];
const continuity=[];let minLeg=Infinity;for(let f=0;f<2037;f++){const t=f/30,c=now.camera(t),p=now.phone(t);if((t>=40&&t<47)||(t>=51&&t<59))continuity.push({time:t,position:[c.x,c.y,c.z],objectY:p.y});else{assert.deepEqual(c,old.camera(t),'POV changed outside scope '+t);assert.deepEqual(p,old.phone(t),'Phone changed outside scope '+t);assert.deepEqual(Object.fromEntries(Object.entries(now.emotion(t)).filter(([k])=>!['handPressure','stopGesture'].includes(k))),old.emotion(t),'Davi changed outside scope '+t);}
 for(const x of[-1.45,0,1.45])for(const z of[1,2.7,4.4])for(const dx of[-.44,.40])for(const dz of[-.29,.27]){const gap=Math.hypot(Math.max(x+dx-c.x,0,c.x-x-dx-.045),Math.max(z+dz-c.z,0,c.z-z-dz-.045));minLeg=Math.min(minLeg,gap);assert(gap>.05,'POV intersects desk leg '+t);}}
const cut=(a,b)=>v.inspectContinuity(continuity.filter(s=>s.time>=a&&s.time<=b),.055,100),motion=[cut(40,46.99),cut(51,58.99)];
const r={status:!findings.length&&acting.every(a=>!a.errors.length)&&ordered.every(a=>!a.length)&&motion.every(a=>!a.errors.length)?'PASS':'FAIL',findings,snapshots,acting,ordered,motion,minLeg,frames:2037,manualReview:['perceived emotion','finger/knee contacts','POV movement and lip sync'],limits:'Face geometry includes actual body/head transforms plus furniture masks and foreground phone; not a subjective acting certificate.'};
fs.mkdirSync('qa',{recursive:true});fs.writeFileSync('qa/precision-preflight.json',JSON.stringify(r,null,2));console.log({status:r.status,findings:findings.slice(0,14),acting,motion,minLeg});if(r.status!=='PASS')process.exitCode=1;
