"""Compile authored lines and real aligned local clips into the Remotion data model."""
from pathlib import Path
import re,wave,math,sys
import numpy as np

def compile_episode(m,name):
 import future
 ep,cfg=m.load(name);spec=m.read(ep/'script.json');data=m.local(ep,cfg['studio'])/'src/caderno2';oldtl=m.read(data/'timeline.json');story=m.read(data/'story.json');perf=m.read(data/'performance.json');previous={s['line']:(story['shots'].get(s['id'],{}),perf['shots'].get(s['id'],[]))for s in oldtl['shots']if s.get('line')};prepared=[]
 if not spec['lines']:raise ValueError('Author real lines before compiling')
 for line in spec['lines']:
  b=cfg['voices'].get(line['id'],{});p=m.local(ep,b.get('path','missing.wav'))
  if b.get('identity')!=m.voice_identity(line,spec)or not p.is_file()or b.get('sha256')!=m.sha(p):raise ValueError('Missing current aligned voice for '+line['id'])
  if not b.get('alignment'):raise ValueError('Provide actual word alignment for '+line['id'])
  x=future.pcm(p);words=m.read(m.local(ep,b['alignment']));pre=round(b.get('preRollSeconds',0)*48000)
  if not words or any(not 0<=w['s']<=w['e']<=len(x)/48000+.02 for w in words):raise ValueError('Invalid actual words for '+line['id'])
  # No invented timings, auto-trimming, pitch changes, time stretching or phoneme overlap.
  hold=line.get('holdSeconds',0 if b.get('slotAligned')else .18)
  if not 0<=hold<=5:raise ValueError('Invalid explicit hold')
  frames=math.ceil((len(x)-pre)/1600+hold*30);prepared.append((line,b,x,words,pre,frames))
 shots=[];voice=[];captions=[];wordsOut=[];cursor=0;newDirections={};newPerformance={}
 def beat(b):
  nonlocal cursor
  frames=round(float(b['seconds'])*30)
  if frames<=0:raise ValueError('Nonspoken beat must have positive duration')
  sid='S'+str(len(shots)+1).zfill(2);shots.append({'id':sid,'a':cursor,'b':cursor+frames,'mode':b['mode'],'line':None,'scene':b.get('scene',1),'who':'','emotion':'neutral'});newDirections[sid]={'mode':b['mode'],'broadcastMode':b.get('broadcastMode','news'),'notebookNameKey':b.get('notebookNameKey','subject'),**b.get('direction',{})};voice.append(np.zeros(frames*1600));cursor+=frames
 for line,b,x,words,pre,frames in prepared:
  for b0 in line.get('beatsBefore',[]):beat(b0)
  if pre:
   if not voice or len(voice[-1])<pre or np.max(abs(voice[-1][-pre:]),initial=0)>.01:raise ValueError('Pre-roll overlaps prior articulation; author a natural pause')
   voice[-1][-pre:]=x[:pre]
  sid='S'+str(len(shots)+1).zfill(2);a=cursor;mode=line.get('mode','close');shot={'id':sid,'a':a,'b':a+frames,'mode':mode,'line':line['id'],'scene':line.get('scene',1),'who':line['who'],'emotion':line.get('emotion','neutral')};shots.append(shot);slot=np.zeros(frames*1600);slot[:len(x)-pre]=x[pre:];voice.append(slot);cursor+=frames;prior,acting=previous.get(line['id'],({},[]));newDirections[sid]={'mode':mode,'broadcastMode':'news','notebookNameKey':'subject',**prior,**line.get('direction',{})};newPerformance[sid]=line.get('performance',acting)
  localWords=[]
  for w in words:
   item={**w,'who':line['who'],'line':line['id'],'s':round(a/30+w['s']-pre/48000,5),'e':round(a/30+w['e']-pre/48000,5)}
   if item['s']<0:raise ValueError('Word begins before the film')
   localWords.append(item);wordsOut.append(item)
  chunks=[];chunk=[];rows=[[]]
  for w in localWords:
   if chunk and(len(chunk)>=7 or len(' '.join(z['w']for z in chunk))+len(w['w'])>44):chunks.append(chunk);chunk=[]
   chunk.append(w)
  if chunk:chunks.append(chunk)
  for i,ch in enumerate(chunks):
   rows=[[]]
   for w in ch:
    if rows[-1]and len(' '.join(z['t']for z in rows[-1]))+len(w['w'])+1>26:rows.append([])
    rows[-1].append({'t':w['w'],'hi':False})
   if len(rows)>2:raise ValueError('Caption needs authored reflow; no tiny-font fallback')
   captions.append({'id':line['id']+'-'+str(i),'a':max(a/30,ch[0]['s']-.04),'b':min(cursor/30,ch[-1]['e']+.08),'who':line['who'],'lines':rows})
  for b0 in line.get('beatsAfter',[]):beat(b0)
 bus=np.concatenate(voice);N=len(bus);sr=48000
 oldVoice=m.local(ep,'audio/stems/voice.wav');unchanged=oldVoice.is_file()and np.array_equal(future.pcm(oldVoice),bus)
 arrays={'voice':bus}
 for stem in ['music','sfx','ambience']:
  p=m.local(ep,'audio/stems/'+stem+'.wav');old=future.pcm(p)if p.is_file()else np.empty(0)
  if len(old)==N:arrays[stem]=old
  elif stem=='music':
   t=np.arange(N)/sr;arrays[stem]=(.008*np.sin(2*np.pi*55*t)+.004*np.sin(2*np.pi*82.4069*t))*np.minimum(1,t/.15)*np.minimum(1,(N/sr-t)/.15)
  elif stem=='ambience':arrays[stem]=.001*np.sin(2*np.pi*47*np.arange(N)/sr)
  else:arrays[stem]=np.zeros(N)
 for stem,x in arrays.items():future.save(m,m.local(ep,'audio/stems/'+stem+'.wav'),x)
 if not unchanged:
  raw=sum(arrays.values()).astype('<f4');path=m.inside(m.ROOT/'work/compiled-premix.f32');path.write_bytes(raw.tobytes());master=m.inside(ep/'audio'/('master-compiled-'+m.sha(path)[:16]+'.wav'));m.run(['ffmpeg','-y','-v','error','-f','f32le','-ar','48000','-ac','1','-i',path,'-af','acompressor=threshold=0.125:ratio=4:attack=2:release=80:makeup=2,loudnorm=I=-14:TP=-1.5:LRA=7','-ar','48000',master],'compile-master');cfg['master']=str(master.relative_to(ep)).replace('\\','/')
 tl={'fps':30,'total':cursor,'duration':cursor/30,'shots':shots};m.write(data/'timeline.json',tl);m.write(data/'words.json',wordsOut);m.write(data/'captions.json',captions);story['shots']=newDirections;perf['shots']={k:v for k,v in newPerformance.items()if v};m.write(data/'story.json',story);m.write(data/'performance.json',perf)
 for who in spec['voices']:
  envelope=np.zeros(cursor)
  for s in shots:
   if s['who']!=who:continue
   p=bus[s['a']*1600:s['b']*1600].reshape(-1,1600);rms=np.sqrt(np.mean(p*p,axis=1));den=max(.04,float(np.percentile(rms,85)));envelope[s['a']:s['b']]=np.clip(rms/den,0,1)
  m.write(data/f'speech.{who}.json',np.round(envelope,3).tolist())
 recipe={'version':1,'stems':{n:'audio/stems/'+n+'.wav'for n in arrays},'baselineStems':{n:m.sha(m.local(ep,'audio/stems/'+n+'.wav'))for n in arrays},'baselineMaster':cfg['master'],'baselineMasterSHA256':m.sha(m.local(ep,cfg['master'])),'protectedRanges':[[s['a']/30,s['b']/30]for s in shots if s['mode'].startswith('timer')or s['mode']=='death'],'duckWhenMasked':False,'cues':[]};m.write(ep/'sound.json',recipe);cfg['soundBinding']=future.sound_identity(m,ep);m.write(ep/'episode.json',cfg);future.mouth_track(m,ep,cfg);cfg['audioBinding']=m.fingerprints(ep,cfg)['audioBinding'];m.write(ep/'episode.json',cfg);m.context(ep,cfg)
 return {'episode':name,'frames':cursor,'duration':cursor/30,'lines':len(prepared),'captions':len(captions),'existingVoiceSamplesRetimed':False,'masterRebuilt':not unchanged,'next':'Author sound cues if needed; plan then build and review actual output'}
