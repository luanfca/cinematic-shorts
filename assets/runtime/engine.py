"""Caderno Engine: conservative, offline, content-addressed production orchestrator."""
from pathlib import Path
import argparse,hashlib,json,os,shutil,subprocess,sys,time,wave,importlib.util
ROOT=Path(__file__).resolve().parent
WORKSPACE=ROOT.parent
REVISION='caderno-engine-1.0'

def sha(p):
 h=hashlib.sha256()
 with Path(p).open('rb')as f:
  for chunk in iter(lambda:f.read(1024*1024),b''):h.update(chunk)
 return h.hexdigest()
def key(x):return hashlib.sha256(json.dumps(x,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
def read(p):return json.loads(Path(p).read_text(encoding='utf-8-sig'))
def write(p,x):
 p=inside(p);p.parent.mkdir(parents=True,exist_ok=True);tmp=p.with_suffix(p.suffix+'.tmp');tmp.write_text(json.dumps(x,ensure_ascii=False,indent=2),encoding='utf8');os.replace(tmp,p)
def inside(p):
 p=Path(p).resolve()
 if not p.is_relative_to(ROOT):raise ValueError('Writes must stay within the isolated engine directory')
 return p
def source(p):
 p=Path(p).resolve()
 if not p.is_relative_to(WORKSPACE):raise ValueError('Inputs must be local files in this workspace')
 return p
def local(e,p):return source(e/str(p))
def emit(x):print(json.dumps(x,ensure_ascii=False,separators=(',',':')))
def env():
 out=os.environ.copy()
 for k in list(out):
  if any(s in k.upper()for s in ['API_KEY','ACCESS_TOKEN','AUTH_TOKEN']):out.pop(k,None)
 t=inside(ROOT/'work/tmp');t.mkdir(parents=True,exist_ok=True)
 modules=os.environ.get('CINEMATIC_NODE_MODULES',str(WORKSPACE/'node_modules'))
 out.update(TEMP=str(t),TMP=str(t),REMOTION_TMP=str(t),NODE_PATH=modules,NODE_OPTIONS='--require='+json.dumps(str(ROOT/'tools/offline.cjs'),ensure_ascii=False),HF_HUB_OFFLINE='1',HF_HUB_DISABLE_TELEMETRY='1',PYTHONUTF8='1')
 out['PYTHONPATH']=str(ROOT/'python')+(os.pathsep+out['PYTHONPATH']if out.get('PYTHONPATH')else'')
 return out
def run(args,name):
 t=time.monotonic();r=subprocess.run([str(a)for a in args],cwd=WORKSPACE,env=env(),capture_output=True);d=inside(ROOT/'work/logs');d.mkdir(parents=True,exist_ok=True);(d/(name+'.log')).write_bytes(r.stdout+r.stderr)
 if r.returncode:raise RuntimeError(f'{name} failed; see work/logs/{name}.log')
 return {'seconds':round(time.monotonic()-t,3),'stdout':r.stdout}
def probe(p):return json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',p],'probe')['stdout'])
def media_hash(p,kind='v:0'):return run(['ffmpeg','-v','error','-i',p,'-map','0:'+kind,'-c','copy','-f','hash','-hash','sha256','-'],'media-hash')['stdout'].decode().strip()
def cached(kind,k,suffix):
 p=inside(ROOT/'cache'/kind/(k+suffix));m=p.with_suffix(p.suffix+'.json')
 if p.exists()and m.exists()and read(m).get('sha256')==sha(p):return p
 return None
def put(kind,k,p,suffix):
 dest=inside(ROOT/'cache'/kind/(k+suffix));dest.parent.mkdir(parents=True,exist_ok=True);tmp=dest.with_suffix(dest.suffix+'.pending');shutil.copyfile(source(p),tmp);os.replace(tmp,dest);write(dest.with_suffix(dest.suffix+'.json'),{'sha256':sha(dest),'key':k,'version':REVISION});return dest

def load(ep):
 
 if not ep or any(c not in 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_'for c in ep):raise ValueError('Invalid episode name')
 ep=inside(ROOT/'episodes'/ep);cfg=read(ep/'episode.json');return ep,cfg

def voice_identity(line,spec):
 return key({'text':line['text'],'style':line.get('style',''),'speaker':line['who'],'voice':spec['voices'][line['who']],'processing':'approved-edited-voice-slot-v1','modelOverride':line.get('modelOverride'),'engine':REVISION})

def fingerprints(ep,cfg):
 studio=local(ep,cfg['studio']);data=studio/'src/caderno2';tl=read(data/'timeline.json');caps=read(data/'captions.json');spec=read(ep/'script.json');errors=[]
 shots=tl['shots'];cursor=0
 for s in shots:
  if s['a']!=cursor or s['b']<=s['a']:errors.append('Timeline gap/overlap: '+s['id'])
  cursor=s['b']
 if cursor!=tl['total']or tl['fps']!=30:errors.append('Timeline total/fps mismatch')
 if len({s['id']for s in shots})!=len(shots):errors.append('Duplicate shot IDs')
 if len({l['id']for l in spec['lines']})!=len(spec['lines']):errors.append('Duplicate line IDs')
 for c in caps:
  if c['a']<0 or c['b']<=c['a']or c['b']>tl['total']/30+.05:errors.append('Caption time invalid: '+c['id'])
  if len(c['lines'])>2:errors.append('Caption has more than two rows: '+c['id'])
 code={str(p.relative_to(studio)):sha(p)for p in sorted((studio/'src').rglob('*'))if p.is_file()and p.suffix in ['.tsx','.ts','.js','.css']and p.name not in ['qa.tsx','qa-dom.d.ts']}
 assets={str(p.relative_to(studio)):sha(p)for p in sorted((studio/'public').rglob('*'))if p.is_file()}
 optimized={'timeline.json','captions.json'}|{p.name for p in data.glob('speech.*.json')}
 futureData={}
 if cfg.get('futureVersion'):
  from future import validate_direction
  errors.extend(validate_direction(sys.modules[__name__],ep,cfg)['errors'])
  futureData={n:read(data/(n+'.json'))for n in ['story','performance','visemes']}
  optimized|={n+'.json'for n in futureData}
 other={str(p.relative_to(studio)):sha(p)for p in sorted((studio/'src').rglob('*.json'))if p.parent!=data or p.name not in optimized}
 speech={p.name:read(p)for p in data.glob('speech.*.json')}
 shared={'code':code,'assets':assets,'otherJSON':other,'contract':cfg['quality'],'composition':cfg['composition'],'engine':REVISION,'total':tl['total'],'rendererTool':sha(ROOT/'tools/render.cjs'),'runtime':cfg['runtime']}
 if futureData:shared['futureGlobal']={'story':{k:v for k,v in futureData['story'].items()if k!='shots'},'performance':{k:v for k,v in futureData['performance'].items()if k not in ['shots','visemeCues']},'visemeMethod':futureData['visemes'].get('method')}
 chunks=[]
 for s in shots:
  a,b=s['a'],s['b'];k=key({'shared':shared,'shot':s,'captions':[c for c in caps if c['a']<b/30 and c['b']>a/30],'speech':{n:v[a:b]for n,v in speech.items()},**({'direction':futureData['story']['shots'].get(s['id']),'performance':futureData['performance']['shots'].get(s['id']),'visemes':{n:v[a:b]for n,v in futureData['visemes']['frames'].items()}}if futureData else{})});chunks.append({'id':s['id'],'a':a,'b':b,'key':k,'cached':bool(cached('chunks',k,'.mkv'))})
 picture=key({'chunks':[s['key']for s in chunks],'quality':cfg['quality'],'rendererABI':cfg['runtime']})
 voices=[]
 for l in spec['lines']:
  vk=voice_identity(l,spec);binding=cfg.get('voices',{}).get(l['id'],{});p=local(ep,binding.get('path','missing.wav'));ok=binding.get('identity')==vk and p.is_file()and binding.get('sha256')==sha(p)
  voices.append({'id':l['id'],'key':vk,'audioSHA256':binding.get('sha256'),'ready':bool(ok)})
 master=local(ep,cfg['master']);masterHash=sha(master);audioBinding=key({'voices':[{'identity':v['key'],'audio':v['audioSHA256']}for v in voices],'timeline':{'total':tl['total'],'fps':tl['fps'],'slots':[{k:s.get(k)for k in ['id','a','b','line','who']}for s in shots]},'words':read(data/'words.json')})
 if cfg.get('audioBinding')!=audioBinding:errors.append('Master is not bound to current voice/timeline/word data; supply aligned audio before building')
 if not all(v['ready']for v in voices):errors.append('Missing or changed approved voice assets; use pending-voices.json, never reuse mismatched TTS')
 return {'tl':tl,'chunks':chunks,'picture':picture,'voices':voices,'audioBinding':audioBinding,'masterHash':masterHash,'master':master,'errors':errors,'studio':studio}

def plan(ep,cfg):
 f=fingerprints(ep,cfg);hit=cached('pictures',f['picture'],'.mp4');outputKey=key({'picture':f['picture'],'master':f['masterHash'],'mux':cfg['quality']});delivery=cached('deliveries',outputKey,'.mp4')
 result={'episode':cfg['id'],'quality':cfg['quality'],'duration':f['tl']['total']/30,'frames':f['tl']['total'],'pictureKey':f['picture'],'deliveryKey':outputKey,'deliveryCached':bool(delivery),'pictureCached':bool(hit),'voicesReady':sum(v['ready']for v in f['voices']),'voiceCount':len(f['voices']),'newFramesRequired':0 if hit else sum(s['b']-s['a']for s in f['chunks']if not s['cached']),'reusableChunks':sum(s['cached']for s in f['chunks']),'shotCount':len(f['chunks']),'errors':f['errors'],'externalCalls':0,'estimatedNewTTSRequests':sum(not v['ready']for v in f['voices'])}
 write(ep/'state/plan.json',result);write(ep/'state/chunks.json',f['chunks'])
 spec=read(ep/'script.json');pending=[{'id':l['id'],'text':l['text'],'style':l.get('style',''),'voice':dict(spec['voices'][l['who']],model=l.get('modelOverride',spec['voices'][l['who']]['model'])),'key':v['key']}for l,v in zip(spec['lines'],f['voices'])if not v['ready']];write(ep/'state/pending-voices.json',pending)
 return result,f

def doctor(cfg):
 checks={'numpy':importlib.util.find_spec('numpy')is not None,'ffmpeg':bool(shutil.which('ffmpeg')),'ffprobe':bool(shutil.which('ffprobe')),'node':bool(shutil.which('node')),'localChromium':Path(cfg['browser']).is_file(),'nodeModules':(Path(os.environ.get('CINEMATIC_NODE_MODULES',str(WORKSPACE/'node_modules')))/'@remotion/renderer/package.json').is_file()}
 for package in ['@remotion/player','playwright','typescript','react-dom']:
  checks[package]=(Path(os.environ.get('CINEMATIC_NODE_MODULES',str(WORKSPACE/'node_modules')))/package/'package.json').is_file()
 versions={}
 for p in ['remotion','react','@remotion/renderer','@remotion/bundler']:
  path=Path(os.environ.get('CINEMATIC_NODE_MODULES',str(WORKSPACE/'node_modules')))/p/'package.json'
  if path.is_file():versions[p]=read(path)['version']
 if versions!=cfg['runtime']:raise RuntimeError('Installed renderer versions differ from locked runtime; explicit rebaseline required')
 if not all(checks.values()):raise RuntimeError('Missing local runtime: '+','.join(k for k,v in checks.items()if not v))
 return checks

def render_range(ep,cfg,f,a,b):
 k=key({'picture':f['picture'],'range':[a,b],'sample':True});existing=cached('samples',k,'.mkv')
 if existing:return existing,True
 job={'entry':str(f['studio']/'src/index.tsx'),'public':str(f['studio']/'public'),'bundle':str(inside(ROOT/'work/bundle'/f['picture'])),'browser':cfg['browser'],'composition':cfg['composition'],'range':[a,b],'output':str(inside(ROOT/'work'/('render-'+k+'.mkv')))};write(ROOT/'work/job.json',job);doctor(cfg);run(['node',ROOT/'tools/render.cjs',ROOT/'work/job.json'],'render-range');return put('samples',k,job['output'],'.mkv'),False

def audio_quality(final):
 import numpy as np
 r=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',str(final),'-af','loudnorm=I=-14:TP=-1.5:print_format=json','-f','null','-'],cwd=WORKSPACE,env=env(),capture_output=True,text=True,encoding='utf8')
 text=r.stderr;d=json.loads(text[text.rfind('{'):text.rfind('}')+1]);x=np.frombuffer(run(['ffmpeg','-v','error','-i',final,'-ac','1','-ar','48000','-f','f32le','-'],'audio-decode')['stdout'],'<f4').astype(np.float64);dx=np.abs(np.diff(x));local=np.convolve(dx,np.ones(48)/48,'same')+1e-4;clicks=np.flatnonzero((dx>.08)&(dx>20*local));clipped=int(np.count_nonzero(abs(x)>=.999));errors=[]
 if clipped:errors.append('Clipped audio samples')
 if len(clicks):errors.append('Isolated sample discontinuities require inspection')
 if not -15<=float(d['input_i'])<=-13:errors.append('Loudness outside approved range')
 if float(d['input_tp'])>-1.3:errors.append('True peak above approximate -1.5 dBTP reference with 0.2 dB tolerance')
 return {'integratedLUFS':float(d['input_i']),'truePeakDBTP':float(d['input_tp']),'clippedSamples':clipped,'isolatedDiscontinuities':len(clicks),'errors':errors,'subjectiveListening':False,'scope':'Level/clipping/click gate; no automatic timbre or emotional approval'}

def validate(final,ep,cfg,expectedPicture):
 digest=sha(final);qpath=ROOT/'cache/qa'/(key({'media':digest,'validator':sha(Path(__file__)),'layoutTool':sha(ROOT/'tools/layout.cjs')})+'.json')
 if qpath.is_file():return read(qpath),True
 p=probe(final);v=next(s for s in p['streams']if s['codec_type']=='video');a=next(s for s in p['streams']if s['codec_type']=='audio');tl=read(local(ep,cfg['studio'])/'src/caderno2/timeline.json');errors=[]
 if [v['width'],v['height'],v['avg_frame_rate']]!=[1080,1920,'30/1']:errors.append('Dimensions/fps mismatch')
 if int(v['nb_frames'])!=tl['total']:errors.append('Frame count mismatch')
 if abs(float(p['format']['duration'])-tl['total']/30)>.001:errors.append('Duration mismatch')
 if int(a['sample_rate'])!=48000:errors.append('Audio sample rate mismatch')
 if media_hash(final)!=media_hash(expectedPicture):errors.append('Encoded video changed in mux')
 run(['ffmpeg','-v','error','-xerror','-i',final,'-f','null','-'],'full-decode')
 audio=audio_quality(final)
 studio=local(ep,cfg['studio']);(studio.parent/'qa').mkdir(exist_ok=True)
 run(['node',ROOT/'tools/layout.cjs',studio.parent,ROOT/'work/layout-bundle'],'layout')
 layout=read(studio.parent/'qa/layout.json')
 if layout['missingCaptions']or layout['unsafeCaptionBounds']or layout['pageErrors']:raise ValueError('Caption browser QA failed')
 if audio['errors']:raise ValueError('; '.join(audio['errors']))
 r={'sha256':digest,'frames':int(v['nb_frames']),'duration':float(p['format']['duration']),'dimensions':[v['width'],v['height']],'fps':30,'audioSampleRate':int(a['sample_rate']),'fullDecodePassed':True,'pictureStreamCopiedExactly':not errors,'audioQA':audio,'captionLayoutSamples':layout['sampleCount'],'captionLayoutPassed':True,'errors':errors,'scope':'Structural final-file verification; artistic, ASR and audio quality approval remains separate'}
 write(qpath,r)
 if errors:raise ValueError('; '.join(errors))
 return r,False

def build(ep,cfg,maxframes):
 start=time.monotonic();p,f=plan(ep,cfg)
 if p['errors']:raise ValueError('; '.join(p['errors']))
 doctor(cfg)
 if p['newFramesRequired']>maxframes:raise ValueError(f'Render requires {p["newFramesRequired"]} new frames; cap is {maxframes}')
 picture=cached('pictures',f['picture'],'.mp4');newFrames=0
 if not picture:
  segments=[]
  for s in f['chunks']:
   c=cached('chunks',s['key'],'.mkv')
   if not c:
    c,_=render_range(ep,cfg,f,s['a'],s['b']-1);newFrames+=s['b']-s['a'];c=put('chunks',s['key'],c,'.mkv')
   segments.append(c)
  listing=inside(ROOT/'work/segments.txt');listing.write_text('\n'.join("file '"+str(x).replace('\\','/')+"'"for x in segments),encoding='utf8');out=inside(ROOT/'work/picture.mp4');run(['ffmpeg','-y','-v','error','-f','concat','-safe','0','-i',listing,'-an','-c:v','libx264','-preset','fast','-crf',str(cfg['quality']['crf']),'-pix_fmt','yuv420p',out],'assemble-picture');picture=put('pictures',f['picture'],out,'.mp4')
 delivery=cached('deliveries',p['deliveryKey'],'.mp4');mux=False
 if not delivery:
  out=inside(ROOT/'work/delivery.mp4');run(['ffmpeg','-y','-v','error','-i',picture,'-i',f['master'],'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-t',str(p['duration']),'-movflags','+faststart',out],'mux');delivery=put('deliveries',p['deliveryKey'],out,'.mp4');mux=True
 output=inside(ep/'deliveries'/(p['deliveryKey'][:16]+'.mp4'));output.parent.mkdir(parents=True,exist_ok=True)
 if not output.exists()or sha(output)!=sha(delivery):shutil.copyfile(delivery,output)
 qa,reused=validate(output,ep,cfg,picture);report={'episode':cfg['id'],'output':str(output),'newTTSRequests':0,'newRenderedFrames':newFrames,'audioEncoded':mux,'cachedQA':reused,'duration':qa['duration'],'frames':qa['frames'],'qualityPreserved':not qa['errors'],'seconds':round(time.monotonic()-start,3),'billingTokens':'not measured; no LLM/TTS calls made by engine'};write(ep/'state/last-build.json',report);return report

def bootstrap(name):
 raise ValueError("Initialize a portable project with scripts/cinematic.py init")

def context(ep,cfg):
 p,_=plan(ep,cfg);text=('CINEMATIC SHORTS '+('1.1'if cfg.get('futureVersion')else'1.0')+'\n'+f'Episódio: {cfg["id"]}; qualidade 1080x1920/30fps/48kHz.\n'+'Preservar elenco, interpretação e suspense aprovados. Cache por SHA-256; offline.\n'+f'Plano: {p["shotCount"]} planos, {p["voiceCount"]} falas, {p["duration"]}s. Vozes prontas: {p["voicesReady"]}. Novos frames: {p["newFramesRequired"]}.\n'+f'Bloqueios: {p["errors"]}.\n'+'Comandos no diretório da engine: python -X utf8 engine.py plan '+cfg['id']+'; python -X utf8 engine.py build '+cfg['id']+' --max-new-frames 0\n'+'Ler somente state/plan.json, pending-voices.json e arquivos alterados. Reabrir fontes grandes só quando necessário. Não confundir cache hit com revisão auditiva. Não disparar TTS por uma mudança apenas visual.\n')
 target=inside(ep/'CONTEXT.md');target.write_text(text,encoding='utf8');return {'path':str(target),'characters':len(text),'utf8Bytes':len(text.encode()),'tokenCount':'not measured; exact characters/bytes only'}

def clone_episode(ep,cfg,name):
 if not name or any(c not in 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_'for c in name):raise ValueError('Invalid episode name')
 dest=inside(ROOT/'episodes'/name)
 if dest.exists():raise ValueError('Target episode exists')
 shutil.copytree(ep,dest,ignore=shutil.ignore_patterns('state','deliveries','CONTEXT.md'))
 cfg=dict(cfg,id=name);write(dest/'episode.json',cfg);context(dest,cfg);return {'episode':name,'path':str(dest),'note':'Copied approved template; author the new story and aligned assets before calling it a new episode'}

def bind_master(ep,cfg,path):
 src=source(path)
 with wave.open(str(src),'rb')as w:
  if (w.getframerate(),w.getnchannels(),w.getsampwidth())!=(48000,1,2):raise ValueError('Master must be PCM16 mono 48 kHz, matching the approved pipeline')
  tl=read(local(ep,cfg['studio'])/'src/caderno2/timeline.json')
  if w.getnframes()!=tl['total']*1600:raise ValueError('Master duration does not match timeline exactly')
 f=fingerprints(ep,cfg)
 if not all(v['ready']for v in f['voices']):raise ValueError('Bind changed voice assets and their alignment first')
 dst=inside(ep/'audio'/('master-'+sha(src)[:16]+'.wav'));shutil.copyfile(src,dst);cfg=dict(cfg,master=str(dst.relative_to(ep)),audioBinding=f['audioBinding']);write(ep/'episode.json',cfg);return plan(ep,cfg)[0]

def bind_voice(ep,cfg,lineId,path,wordsPath):
 spec=read(ep/'script.json');line=next((l for l in spec['lines']if l['id']==lineId),None)
 if not line:raise ValueError('Unknown line ID')
 src=source(path);words=read(source(wordsPath))
 with wave.open(str(src),'rb')as w:
  if (w.getframerate(),w.getnchannels(),w.getsampwidth())!=(48000,1,2):raise ValueError('Voice asset must be PCM16 mono 48 kHz')
  duration=w.getnframes()/48000
 if not isinstance(words,list)or not words:raise ValueError('Actual local word alignment is required')
 last=0
 for word in words:
  if not word.get('w')or word['s']<last or word['e']<word['s']or word['e']>duration+.02:raise ValueError('Invalid word alignment; never invent timestamps')
  last=word['s']
 report=None
 if cfg.get('futureVersion'):
  from future import audit_clip,profiles
  profile=profiles(sys.modules[__name__])['roles'][line['who']];report=audit_clip(sys.modules[__name__],src,ROOT/profile['reference'])
  if report['clippedSamples']:raise ValueError('Imported voice is clipped')
 ident=voice_identity(line,spec);audioHash=sha(src);dst=inside(ep/'audio/voices'/(lineId+'-'+audioHash[:12]+'.wav'));shutil.copyfile(src,dst);wordDst=dst.with_suffix('.words.json');write(wordDst,words);cfg['voices'][lineId]={'identity':ident,'path':str(dst.relative_to(ep)),'sha256':audioHash,'source':'user-supplied-edited-aligned-voice','alignment':str(wordDst.relative_to(ep)),**({'voiceAudit':report}if report else{})};put('voices',key({'identity':ident,'audio':audioHash}),dst,'.wav');write(ep/'episode.json',cfg)
 return {'line':lineId,'cached':True,'next':'Update timeline/captions/lipsync and supply the mixed master using bind-master. Engine does not invent a performance or alignment.'}

def main():
 parser=argparse.ArgumentParser();sub=parser.add_subparsers(dest='cmd',required=True)
 for name in ['bootstrap','plan','context','doctor','build','sample','clone','bind-master','bind-voice']:
  p=sub.add_parser(name);p.add_argument('episode')
  if name=='clone':p.add_argument('target')
  if name=='bind-master':p.add_argument('wav')
  if name=='bind-voice':p.add_argument('line');p.add_argument('wav');p.add_argument('--words',required=True)
  if name=='build':p.add_argument('--max-new-frames',type=int,default=0)
  if name=='sample':p.add_argument('--start',type=int,default=0);p.add_argument('--end',type=int,default=2)
 p=sub.add_parser('future');p.add_argument('action',choices=['upgrade','voice-pack','voice-audit','mouth','direction','mix','cut','preset']);p.add_argument('episode');p.add_argument('--target');p.add_argument('--wav');p.add_argument('--words');p.add_argument('--first',type=int,default=0);p.add_argument('--last',type=int,default=0);p.add_argument('--role',default='lucas');p.add_argument('--preset');p.add_argument('--shot')
 args=parser.parse_args()
 if args.cmd=='future':
  import future
  emit(future.command(sys.modules[__name__],args));return
 if args.cmd=='bootstrap':result=bootstrap(args.episode)
 else:
  ep,cfg=load(args.episode)
  if args.cmd=='plan':result=plan(ep,cfg)[0]
  elif args.cmd=='context':result=context(ep,cfg)
  elif args.cmd=='doctor':result=doctor(cfg)
  elif args.cmd=='clone':result=clone_episode(ep,cfg,args.target)
  elif args.cmd=='bind-master':result=bind_master(ep,cfg,args.wav)
  elif args.cmd=='bind-voice':result=bind_voice(ep,cfg,args.line,args.wav,args.words)
  elif args.cmd=='build':result=build(ep,cfg,args.max_new_frames)
  else:
   f=fingerprints(ep,cfg)
   if args.start<0 or args.end<args.start or args.end>=f['tl']['total']:raise ValueError('Invalid frame range')
   path,hit=render_range(ep,cfg,f,args.start,args.end);result={'path':str(path),'cacheHit':hit,'newRenderedFrames':0 if hit else args.end-args.start+1}
 emit(result)
if __name__=='__main__':
 try:main()
 except Exception as e:emit({'status':'BLOCKED','error':str(e)});sys.exit(1)
