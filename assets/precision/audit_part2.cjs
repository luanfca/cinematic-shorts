const fs=require('fs'),ts=require('typescript'),assert=require('assert/strict');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const {camera}=require('./src/pov.ts'),{captionAt,captionLines}=require('./src/performance.ts');
const {lines}=require('./src/voice-stage.json');
let prev,maxStep=0, minLeg=Infinity;
for(let f=0;f<2037;f++){
 const t=f/30,c=camera(t);assert(Object.values(c).every(Number.isFinite));assert.equal(c.f,760);
 if(prev)maxStep=Math.max(maxStep,Math.hypot(c.x-prev.x,c.y-prev.y,c.z-prev.z));
 prev=c;
 for(const x of [-1.45,0,1.45])for(const z of [1,2.7,4.4])for(const dx of [-.44,.4])for(const dz of [-.29,.27]){
  const gap=Math.hypot(Math.max(x+dx-c.x,0,c.x-x-dx-.045),Math.max(z+dz-c.z,0,c.z-z-dz-.045));
  minLeg=Math.min(minLeg,gap);
  assert(gap>.05,'camera near desk leg at '+t);
 }
 const l=lines.find(l=>t>=l.at&&t<l.end);
 if(l)assert(captionLines(captionAt(t,l.id,l.text)).length<=2);
}
console.log(JSON.stringify({frames:2037,maxStep,minLeg}));
