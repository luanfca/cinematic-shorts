const fs=require('fs'),path=require('path'),crypto=require('crypto'),{execFileSync}=require('child_process');
const{bundle}=require('@remotion/bundler'),{openBrowser,selectComposition,renderMedia}=require('@remotion/renderer');
const project=__dirname,mode=process.argv[2]||'preview-a';
process.chdir(project);fs.mkdirSync('work/tmp',{recursive:true});fs.mkdirSync('renders',{recursive:true});process.env.TEMP=path.join(project,'work/tmp');process.env.TMP=process.env.TEMP;
function treeHash(folder){const h=crypto.createHash('sha256');function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const f=path.join(d,e.name);if(e.isDirectory())walk(f);else{h.update(path.relative(folder,f));h.update(fs.readFileSync(f));}}}walk(folder);return h.digest('hex');}
(async()=>{
 const jobs={'preview-a':{frames:[1170,1409],scale:.5,name:'PREVIA_A_39-47'},'preview-b':{frames:[1530,1799],scale:.5,name:'PREVIA_B_51-60'},final:{frames:[0,2036],scale:1,name:'SALA_214_PARTE_2_PRECISION_FINAL_1080P'}};
 const job=jobs[mode];if(!job)throw Error('Use preview-a, preview-b or final');
 if(!fs.existsSync('approved-audio.m4a'))throw Error('Restore versioned media with scripts/precision.py; no TTS fallback is used');
 const concurrency=Number(process.env.CINEMATIC_CONCURRENCY||6);if(!Number.isInteger(concurrency)||concurrency<1||concurrency>32)throw Error('Invalid concurrency');
 const ffmpeg=process.env.FFMPEG||'ffmpeg';execFileSync(process.execPath,[require.resolve('typescript/bin/tsc'),'--noEmit'],{stdio:'inherit'});execFileSync(process.execPath,['check.cjs'],{stdio:'inherit'});
 const sourceSHA256=treeHash(path.join(project,'src')),serveUrl=await bundle({entryPoint:path.join(project,'src/index.tsx'),publicDir:path.join(project,'public'),outDir:path.join(project,'work/bundle-'+sourceSHA256)}),browser=await openBrowser('chrome',{logLevel:'error'});
 try{
  const composition=await selectComposition({serveUrl,id:'Sala214Parte2',puppeteerInstance:browser}),raw=path.join(project,'work/'+job.name+'-picture.mp4'),final=path.join(project,'renders/'+job.name+'.mp4');
  await renderMedia({serveUrl,composition,puppeteerInstance:browser,outputLocation:raw,frameRange:job.frames,scale:job.scale,codec:'h264',pixelFormat:'yuv420p',colorSpace:'bt709',imageFormat:'png',crf:mode==='final'?17:20,x264Preset:mode==='final'?'medium':'veryfast',muted:true,concurrency,logLevel:'error'});
  if(sourceSHA256!==treeHash(path.join(project,'src')))throw Error('Source changed during render');
  execFileSync(ffmpeg,['-y','-v','error','-i',raw,'-ss',String(job.frames[0]/30),'-i','approved-audio.m4a','-map','0:v:0','-map','1:a:0','-t',String((job.frames[1]-job.frames[0]+1)/30),'-c:v','copy',...(mode==='final'?['-c:a','copy']:['-c:a','aac','-b:a','256k','-ar','48000']),'-movflags','+faststart',final],{stdio:'inherit'});
  fs.writeFileSync('renders/'+mode+'-render.json',JSON.stringify({sourceSHA256,job,PNG:true,CRF:mode==='final'?17:20,AACCopied:mode==='final'},null,2));console.log(final);
 }finally{await browser.close({silent:true});}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
