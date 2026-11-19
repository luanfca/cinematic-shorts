const fs=require('fs'),crypto=require('crypto'),assert=require('assert/strict'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup:ssr}=require('react-dom/server');
for(const ext of['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText,f);
const old='./backups/src-before/',current='./src/',env=require('./src/envelopes.json');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const modules=['Classroom.tsx','Phone.tsx','WorldHands.tsx'],exportNames=['Classroom','Phone','OwnHands'];
const pairs=modules.map((m,i)=>[require(current+m)[exportNames[i]],require(old+m)[exportNames[i]]]);
let frames=0,comparisons=0;
for(let frame=0;frame<2037;frame++){
 const t=frame/30;if(t>=40&&t<47||t>=51&&t<59)continue;
 for(const[a,b]of pairs){assert.equal(ssr(React.createElement('svg',null,React.createElement(a,{t,frame,env}))),ssr(React.createElement('svg',null,React.createElement(b,{t,frame,env}))),`Rendered SVG differs outside scope at ${t}`);comparisons++;}frames++;
}
const unchanged=['Film.tsx','performance.ts','envelopes.json','voice-stage.json','word-times.json','nightLighting.ts','timing.ts'];
const preserved=unchanged.filter(f=>fs.existsSync(old+f));for(const f of preserved)assert.equal(hash(current+f),hash(old+f),f);
const v=require(current+'ActingQualityValidator.ts');
const blocked={bounds:[[100,100],[300,300]],eyes:[[160,180],[230,180]],landmarks:[[195,210]],occluders:[[[140,150],[250,150],[250,250],[140,250]]]};
assert(v.inspectFace(blocked,1080,1920).length,'Validator missed occlusion');
assert(v.inspectActing([{time:0,face:[1],body:[1]},{time:1,face:[1],body:[1]}],{face:3,body:3}).errors.length,'Validator missed static acting');
assert(v.inspectContinuity([{time:0,position:[0,0,0],objectY:0},{time:1/30,position:[1,0,0],objectY:200}],.055,100).errors.length===2,'Validator missed jumps');
assert(v.inspectReactionOrder({perception:1,eyes:.5,brows:2,body:3,speech:4}).length,'Validator missed invalid reaction order');
const originals=JSON.parse(fs.readFileSync('state/source-manifest.json','utf8'));for(const row of originals)assert.equal(hash(row.source),row.sha256,`Original modified: ${row.source}`);
const output={status:'PASS',framesOutsideWindows:frames,renderedSVGComparisons:comparisons,unchangedFiles:preserved,originalFilesIntact:originals.length,negativeFixtures:['face/foreground occlusion','static acting','camera and phone jumps','reaction order'],note:'Exact source SVG equality outside windows; codec pixels tested separately.'};
fs.writeFileSync('qa/regression.json',JSON.stringify(output,null,2));console.log(output);
