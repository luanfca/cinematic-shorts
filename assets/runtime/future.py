"""Offline authoring, performance and audio tools. No online provider calls."""
from pathlib import Path
import json,wave,math,re,unicodedata,hashlib,shutil
import numpy as np
SR=48000

def pcm(p):
 with wave.open(str(p),'rb')as w:
  if(w.getframerate(),w.getnchannels(),w.getsampwidth())!=(SR,1,2):raise ValueError('Expected PCM16 mono 48 kHz')
  return np.frombuffer(w.readframes(w.getnframes()),'<i2').astype(np.float64)/32768

def save(m,p,x):
 p=m.inside(p);p.parent.mkdir(parents=True,exist_ok=True)
 if np.max(abs(x),initial=0)>=.999:raise ValueError('PCM would clip; adjust the specific source/gain')
 with wave.open(str(p),'wb')as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes(np.rint(x*32768).astype('<i2').tobytes())

def db(x):return float(20*np.log10(np.sqrt(np.mean(x*x))+1e-12))
def normalize(t):return re.sub('[^a-z]','',unicodedata.normalize('NFKD',t.lower()).encode('ascii','ignore').decode())

def features(x):
 n=960;hop=480
 if len(x)<n:return {'voicedDBFS':db(x),'spectralBands':[]}
 windows=np.lib.stride_tricks.sliding_window_view(x,n)[::hop];rms=np.sqrt(np.mean(windows**2,axis=1));v=windows[rms>.012]
 if not len(v):return {'voicedDBFS':db(x),'spectralBands':[]}
 power=abs(np.fft.rfft(v*np.hanning(n),axis=1))**2;freq=np.fft.rfftfreq(n,1/SR);edges=np.geomspace(90,12000,13);bands=np.array([np.mean(power[:,(freq>=a)&(freq<b)],axis=1)for a,b in zip(edges,edges[1:])]).T;bands=bands/(bands.sum(axis=1,keepdims=True)+1e-15)
 return {'voicedDBFS':db(v),'spectralBands':np.round(np.median(10*np.log10(bands+1e-12),axis=0),3).tolist()}

def audit_clip(m,path,reference=None):
 x=pcm(m.source(path));win=480;n=len(x)//win;levels=np.array([db(z)for z in x[:n*win].reshape(-1,win)]);active=np.flatnonzero(levels>-45);warnings=[]
 head=float(active[0]*.01)if len(active)else len(x)/SR;tail=float((n-1-active[-1])*.01)if len(active)else len(x)/SR
 if head<.1:warnings.append('Short head margin; inspect articulation/breath, never auto-trim')
 if tail<.1:warnings.append('Short tail margin; compare full source')
 f=features(x);compare=None
 if reference:
  r=features(pcm(m.source(reference)));delta=f['voicedDBFS']-r['voicedDBFS'];distance=float(np.mean(abs(np.array(f['spectralBands'])-np.array(r['spectralBands']))))if f['spectralBands']and r['spectralBands']else None;compare={'voicedLevelDeltaDB':delta,'spectralBandDistanceDB':distance,'automaticIdentityApproval':False}
  if abs(delta)>6:warnings.append('Voiced level differs >6 dB from reference; consider emotional intent before gain changes')
  if distance is not None and distance>9:warnings.append('Spectral signature differs; listen before changing the voice')
 return {'seconds':len(x)/SR,'sampleRate':SR,'clippedSamples':int(np.count_nonzero(abs(x)>=.999)),'headMarginSeconds':head,'tailMarginSeconds':tail,'features':f,'referenceComparison':compare,'warnings':warnings,'subjectiveListening':False}

def safe_cut(m,ep,path,wordsPath,first,last):
 x=pcm(m.source(path));words=m.read(m.source(wordsPath))
 if not 0<=first<=last<len(words):raise ValueError('Invalid word selection')
 for w in words:
  if not 0<=w['s']<=w['e']<=len(x)/SR+.001:raise ValueError('Invalid actual alignment')
 start=words[first]['s'];end=words[last]['e'];lo=words[first-1]['e']if first else 0;hi=words[last+1]['s']if last+1<len(words)else len(x)/SR
 def quiet(a,b,prefer):
  a=max(0,a);b=min(len(x)/SR,b);candidates=[]
  for t in np.arange(a,b-.02,.005):
   z=x[round(t*SR):round((t+.02)*SR)]
   if len(z)and db(z)<-50:candidates.append(t+.01)
  if not candidates:raise ValueError('No safe 20 ms quiet interval outside phonemes; retain full take or edit manually')
  return min(candidates,key=lambda t:abs(t-prefer))
 a=quiet(max(lo,start-.35),start,min(start-.2,start));b=quiet(end,min(hi,end+.4),end+.25)
 clip=x[round(a*SR):round(b*SR)].copy();fade=round(.008*SR);clip[:fade]*=np.linspace(0,1,fade);clip[-fade:]*=np.linspace(1,0,fade);k=m.key({'source':m.sha(path),'bounds':[a,b],'fadeMs':8});out=m.inside(ep/'audio/cuts'/(k+'.wav'));save(m,out,clip);aligned=[{**w,'s':w['s']-a,'e':w['e']-a}for w in words[first:last+1]];m.write(out.with_suffix('.words.json'),aligned);r={'output':str(out),'sourceStart':a,'sourceEnd':b,'microfadeMs':8,'keptWords':len(aligned),'noWordTimeStretch':True,'headMargin':start-a,'tailMargin':b-end,'scope':'Conservative silence search plus supplied ASR bounds; inspect original to confirm every phoneme'};m.write(out.with_suffix('.cut.json'),r);return r

def profiles(m):return m.read(m.ROOT/'profiles/voices.json')

def voice_pack(m,ep,cfg):
 spec=m.read(ep/'script.json');ps=profiles(m);p,f=m.plan(ep,cfg);requests=[]
 for line,v in zip(spec['lines'],f['voices']):
  if v['ready']:continue
  profile=ps['roles'].get(line['who'])
  if not profile:raise ValueError('Missing canonical role profile: '+line['who'])
  voice=dict(spec['voices'][line['who']]);voice['model']=line.get('modelOverride',voice['model'])
  if voice['voice']!=profile['voice']:raise ValueError('Voice differs from canonical character identity')
  emotional=profile['emotions'].get(line.get('emotion','neutral'),profile['defaultStyle']);style=profile['defaultStyle']+' '+emotional+' '+line.get('style','')+' Preserve natural breaths and complete phonemes; leave natural head/tail margins. Speak only the supplied Brazilian Portuguese text.'
  body={'model':voice['model'],'input':[{'type':'user_input','content':[{'type':'text','text':line['text'],'annotations':[{'type':'speech_metadata','style':style}]}]}],'response_format':{'type':'audio','mime_type':'audio/wav'},'generation_config':{'speech_config':[{'voice':voice['voice']}]}}
  requests.append({'line':line['id'],'role':line['who'],'voiceIdentity':v['key'],'requestKey':m.key(body),'body':body,'reference':profile['reference'],'newModelFallbackAllowed':False,'execution':'export-only; no API call'})
 target=ep/'state/voice-requests-v11.json';m.write(target,requests);return {'pending':len(requests),'path':str(target),'externalCalls':0}

def mouth_identity(m,data,perf):
 return m.key({'timeline':m.sha(data/'timeline.json'),'words':m.sha(data/'words.json'),'envelopes':{p.name:m.sha(p)for p in data.glob('speech.*.json')},'cues':perf.get('visemeCues',[]),'generator':'word-graphemes-rms-v1'})

def mouth_track(m,ep,cfg):
 data=m.local(ep,cfg['studio'])/'src/caderno2';tl=m.read(data/'timeline.json');words=m.read(data/'words.json');perf=m.read(data/'performance.json');frames={who:['rest']*tl['total']for who in ['lucas','fake']};counts={}
 # Approximation only: supplied word durations are divided over graphemes; not forced phoneme alignment.
 for w in words:
  who=w.get('who');chars=normalize(w['w'])
  if who not in frames or not chars:continue
  for frame in range(max(0,int(w['s']*30)),min(tl['total'],int(math.ceil(w['e']*30)))):
   t=frame/30
   if not w['s']<=t<w['e']:continue
   c=chars[min(len(chars)-1,int((t-w['s'])/max(.001,w['e']-w['s'])*len(chars)))];shape='A'if c=='a'else'E'if c in 'ei'else'O'if c in 'ou'else'MBP'if c in 'mbp'else'FV'if c in 'fv'else'E';frames[who][frame]=shape;counts[shape]=counts.get(shape,0)+1
 for who in frames:
  env=m.read(data/f'speech.{who}.json')
  for i in range(tl['total']):
   if i>=len(env)or env[i]<=.06:frames[who][i]='rest'
 # Explicit, actually aligned viseme cues override the approximation, still gated by the real envelope.
 for cue in perf.get('visemeCues',[]):
  who=cue['who'];shape=cue['shape']
  if who not in frames or shape not in ['A','E','O','MBP','FV','rest']:raise ValueError('Invalid viseme cue')
  env=m.read(data/f'speech.{who}.json')
  for f in range(max(0,int(cue['start']*30)),min(tl['total'],math.ceil(cue['end']*30))):frames[who][f]=shape if env[f]>.06 else'rest'
 out={'method':'word-grapheme approximation + actual RMS gate; manual aligned cues supported','phonemeAccurate':False,'sourceKey':mouth_identity(m,data,perf),'frames':frames};m.write(data/'visemes.json',out);return {'frames':tl['total'],'characters':list(frames),'shapeCounts':counts,'defaultMode':perf['mouthMode'],'phonemeAccurate':False}

def validate_direction(m,ep,cfg):
 data=m.local(ep,cfg['studio'])/'src/caderno2';story=m.read(data/'story.json');perf=m.read(data/'performance.json');tl=m.read(data/'timeline.json');errors=[];known={s['id']for s in tl['shots']};modes={'room','close','window','write','write-daniel','name','news','fake','symbol','map','photo','timer40','timer25','timer5','death','montage','comments','end'}
 for s in tl['shots']:
  d=story['shots'].get(s['id'])
  if d is None:errors.append('Missing direction: '+s['id']);continue
  if d.get('mode',s['mode'])not in modes:errors.append('Unsupported mode '+s['id'])
  if d.get('notebookNameKey')not in story['names']and not d.get('notebookName'):errors.append('Notebook name key invalid '+s['id'])
  if d.get('camera'):
   cam=d['camera']
   if any(not isinstance(cam.get(k),(float,int))for k in ['x','y','scale'])or not .5<=cam.get('scale',0)<=6 or not -.1<=cam.get('zoom',0)<=.15:errors.append('Camera outside conservative limits '+s['id'])
  for k in ['closeAfter','photoAfter']:
   if d.get(k)is not None and not 0<=d[k]<=1:errors.append('Invalid camera cut fraction '+s['id'])
 for field in ['subject','second','decoy','prior','symbol']:
  if not isinstance(story['names'].get(field),str)or not story['names'][field].strip():errors.append('Missing name '+field)
 if len(story.get('comments',[]))!=3:errors.append('Exactly three comment captions are required by this template')
 for sid,keys in perf.get('shots',{}).items():
  if sid not in known:errors.append('Performance references unknown shot '+sid)
  previous=-1
  for k in keys:
   if not previous<=k['at']<=1:errors.append('Performance keys not ordered '+sid)
   previous=k['at']
   for field,bounds in {'headTilt':(-12,12),'look':(-1,1),'lookY':(-1,1),'tilt':(-8,8),'yaw':(-.3,.3),'blink':(0,1),'armRA':(-12,12),'armRB':(-15,15),'armLA':(-12,12),'armLB':(-15,15)}.items():
    if field in k and not bounds[0]<=k[field]<=bounds[1]:errors.append('Performance exceeds conservative rig limit '+sid+':'+field)
 if perf.get('mouthMode')not in ['rms','word-preview']:errors.append('Unknown mouth mode')
 if perf.get('mouthMode')=='word-preview'and m.read(data/'visemes.json').get('sourceKey')!=mouth_identity(m,data,perf):errors.append('Mouth source changed; run future mouth before building')
 if cfg.get('soundBinding')!=sound_identity(m,ep):errors.append('Sound recipe or stems changed; run future mix before building')
 return {'errors':errors,'shots':len(tl['shots']),'dataDrivenNames':list(story['names']),'performanceTracks':len(perf.get('shots',{})),'mouthMode':perf['mouthMode'],'phonemeAccurate':False}

def sound_identity(m,ep):
 recipe=m.read(ep/'sound.json');return m.key({'recipe':recipe,'sources':{n:m.sha(m.local(ep,p))for n,p in recipe['stems'].items()},'effects':{c['asset']:m.sha(m.local(ep,c['asset']))for c in recipe['cues']if c.get('type')=='effect'}})

def sound_mix(m,ep,cfg):
 recipe=m.read(ep/'sound.json');paths={n:m.local(ep,p)for n,p in recipe['stems'].items()};stems={n:pcm(p)for n,p in paths.items()};n=len(stems['voice']);tl=m.read(m.local(ep,cfg['studio'])/'src/caderno2/timeline.json')
 if n!=tl['total']*1600 or any(len(x)!=n for x in stems.values()):raise ValueError('Stem durations must exactly match timeline')
 for name,p in paths.items():
  if name not in ['voice','music','sfx','ambience']:raise ValueError('Unknown stem')
 recipeKey=sound_identity(m,ep);dest=m.inside(ep/'audio/mixes'/(recipeKey+'.wav'))
 if not recipe['cues']and not recipe.get('duckWhenMasked',False):
  for name,p in paths.items():
   if recipe['baselineStems'].get(name)!=m.sha(p):raise ValueError('Stem changed; supply an explicit mix recipe instead of reusing approved master')
  base=m.local(ep,recipe['baselineMaster'])
  if m.sha(base)!=recipe['baselineMasterSHA256']:raise ValueError('Baseline master hash mismatch')
  return {'output':str(base),'unchangedApprovedMaster':True,'newProcessing':False}
 masks=np.zeros(n,bool);before={k:v.copy()for k,v in stems.items()};protected=recipe.get('protectedRanges',[])
 for cue in recipe['cues']:
  start,end=cue['start'],cue['end']
  if not 0<=start<end<=n/SR:raise ValueError('Invalid sound cue interval')
  if any(start<b and end>a for a,b in protected):raise ValueError('Sound cue touches protected dramatic pause')
  stem=cue.get('stem','sfx')
  if stem not in ['music','sfx','ambience']:raise ValueError('Gain cues cannot alter approved voice')
  gain=10**(cue['gainDB']/20)
  if not -24<=cue['gainDB']<=6:raise ValueError('Excessive local gain change')
  a,b=round(start*SR),round(end*SR)
  if cue.get('type')=='effect':
   if stem!='sfx':raise ValueError('One-shot effects belong in the SFX stem')
   effect=pcm(m.local(ep,cue['asset'])).copy()
   if len(effect)>b-a:raise ValueError('Effect is longer than its slot; no automatic truncation')
   fade=min(round(cue.get('fadeMs',12)*SR/1000),len(effect)//2)
   if fade:effect[:fade]*=np.linspace(0,1,fade);effect[-fade:]*=np.linspace(1,0,fade)
   stems['sfx'][a:a+len(effect)]+=effect*gain;masks[a:a+len(effect)]=True;continue
  weight=np.ones(b-a);fade=min(round(cue.get('fadeMs',30)*SR/1000),(b-a)//2);weight[:fade]=np.linspace(0,1,fade)if fade else[];weight[-fade:]=np.linspace(1,0,fade)if fade else weight[-fade:];stems[stem][a:b]*=1+weight*(gain-1);masks[a:b]=True
 if recipe.get('duckWhenMasked',False):
  # Only reduce music when measured 50 ms voice-active windows lack a 9 dB margin.
  win=2400;target=np.ones(n)
  for a in range(0,n-win,win):
   b=a+win;vr=np.sqrt(np.mean(stems['voice'][a:b]**2));mr=np.sqrt(np.mean(stems['music'][a:b]**2))
   if vr>.012 and mr>vr/2.818:target[a:b]=max(.1,vr/2.818/(mr+1e-12))
  state=1.;gain=np.ones(n);attack=math.exp(-1/(SR*.02));release=math.exp(-1/(SR*.15))
  for i,t in enumerate(target):coeff=attack if t<state else release;state=coeff*state+(1-coeff)*t;gain[i]=state
  for a,b in protected:gain[round(a*SR):round(b*SR)]=1
  masks|=abs(gain-1)>1e-6;stems['music']*=gain
 # Check timed effects against actual word windows before accepting the mix.
 words=m.read(m.local(ep,cfg['studio'])/'src/caderno2/words.json');masked=[]
 for w in words:
  a=max(0,int(w['s']*SR));b=min(n,max(a+1,int(w['e']*SR)))
  if b<=a:continue
  vr=np.sqrt(np.mean(stems['voice'][a:b]**2));fx=np.sqrt(np.mean(stems['sfx'][a:b]**2))
  if fx>0 and vr>0 and 20*np.log10((vr+1e-9)/(fx+1e-9))<6:masked.append(w['w'])
 if masked:raise ValueError('SFX mask actual words; reduce or reposition only the cue: '+', '.join(masked[:8]))
 baseline=pcm(m.local(ep,recipe['baselineMaster']));raw=sum(stems.values());original=sum(before.values());delta=raw-original
 if not np.any(masks):return {'output':str(m.local(ep,recipe['baselineMaster'])),'unchangedApprovedMaster':True,'newProcessing':False,'reason':'No measured masking or cue required a change'}
 # Preserve the approved master outside local interventions; use original master gain near each delta.
 smooth=2401
 def moving_rms(z):
  pad=smooth//2;c=np.cumsum(np.pad(z*z,(pad,pad)),dtype=np.float64);c=np.insert(c,0,0.);return np.sqrt(np.maximum(0,(c[smooth:]-c[:-smooth])/smooth))
 rawR=moving_rms(original);masterR=moving_rms(baseline);gain=np.clip(masterR/(rawR+1e-6),.2,5)
 out=baseline+delta*gain
 if np.max(abs(out))>=.95:raise ValueError('Local mix lacks peak headroom; reduce the specific cue')
 save(m,dest,out);preserved=np.array_equal(out[~masks],baseline[~masks]);result={'output':str(dest),'sourcePCMExactOutsideInterventions':preserved,'changedSeconds':int(masks.sum())/SR,'protectedRangesPreserved':all(np.array_equal(out[round(a*SR):round(b*SR)],baseline[round(a*SR):round(b*SR)])for a,b in protected),'newGlobalFilters':False,'requiresFinalAudioQA':True};m.write(dest.with_suffix('.json'),result);return result

def prepare(m,sourceName,name):
 raise ValueError("Portable templates already include v1.1; use clone")

def command(m,args):
 if args.action=='upgrade':return prepare(m,args.episode,args.target)
 ep,cfg=m.load(args.episode)
 if args.action=='preset':
  data=m.local(ep,cfg['studio'])/'src/caderno2';presets=m.read(m.ROOT/'profiles/performance-presets.json')['presets'];perf=m.read(data/'performance.json');story=m.read(data/'story.json')
  if args.preset not in presets or args.shot not in story['shots']:raise ValueError('Unknown preset or shot ID')
  perf['shots'][args.shot]=presets[args.preset];m.write(data/'performance.json',perf);return {'shot':args.shot,'preset':args.preset,'direction':validate_direction(m,ep,cfg)}
 if args.action=='voice-pack':return voice_pack(m,ep,cfg)
 if args.action=='mouth':return mouth_track(m,ep,cfg)
 if args.action=='direction':return validate_direction(m,ep,cfg)
 if args.action=='mix':
  result=sound_mix(m,ep,cfg);cfg['soundBinding']=sound_identity(m,ep)
  if not result.get('unchangedApprovedMaster'):m.bind_master(ep,cfg,result['output'])
  else:m.write(ep/'episode.json',cfg)
  result['soundBindingCurrent']=True;return result
 if args.action=='cut':return safe_cut(m,ep,args.wav,args.words,args.first,args.last)
 if args.action=='voice-audit':
  ps=profiles(m);reference=m.ROOT/ps['roles'][args.role]['reference'];return audit_clip(m,args.wav,reference)
 raise ValueError('Unknown future command')
