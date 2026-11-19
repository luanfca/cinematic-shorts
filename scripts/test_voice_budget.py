#!/usr/bin/env python3
"""Offline transport/budget tests; requires a work directory outside the skill."""
import sys
sys.dont_write_bytecode=True
from pathlib import Path
import argparse,importlib.util,tempfile,json,hashlib,wave,io,base64,urllib.error
from unittest.mock import patch
HERE=Path(__file__).resolve().parent
def load(name):
 s=importlib.util.spec_from_file_location(name,HERE/(name+'.py'));m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
def test(root):
 root=Path(root).resolve();skill=HERE.parent
 if root==skill or root.is_relative_to(skill):raise ValueError('Use work directory outside skill')
 root.mkdir(parents=True,exist_ok=True);g=load('gemini_tts');b=load('grouped_voice_pack');checks=[]
 script={'voices':{'a':{'model':'fixture-model','voice':'Puck'}},'lines':[{'id':'one','who':'a','text':'<Medo> Não abra.','style':'Contained fear.'},{'id':'two','who':'a','text':'Fique aqui.'}]}
 pack=b.build(script,2500,None,'generate-content');assert len(pack)==1 and pack[0]['lineIds']==['one','two'];body=pack[0]['body'];assert body['api']=='generate-content' and body['generationConfig']['speechConfig']['voiceConfig']['prebuiltVoiceConfig']['voiceName']=='Puck';assert 'Speech text: Não abra.'in body['contents'][0]['parts'][0]['text'] and '<Medo>'not in body['contents'][0]['parts'][0]['text'];checks+=['grouped generate-content payload','direction tags not spoken']
 assert 'input'in b.build(script)[0]['body'];checks.append('legacy dialect preserved explicitly')
 captured=[]
 class Response:
  def __enter__(self):return self
  def __exit__(self,*args):pass
  def read(self):return b'{}'
 def urlopen(req,timeout):captured.append(req);return Response()
 with patch.object(g.urllib.request,'urlopen',urlopen):g.default_transport(body,'fixture-not-real')
 req=captured[0];sent=json.loads(req.data);assert req.full_url.endswith('/models/fixture-model:generateContent') and 'api'not in sent and'model'not in sent;checks.append('generate-content URL and payload projection')
 audio=io.BytesIO()
 with wave.open(audio,'wb')as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(24000);w.writeframes(b'\0\0'*24000)
 response={'candidates':[{'content':{'parts':[{'inlineData':{'mimeType':'audio/wav','data':base64.b64encode(audio.getvalue()).decode()}}]}}]};calls=[]
 def success(body,key):calls.append(body);return response
 def rejected(fn,contains):
  try:fn()
  except ValueError as e:assert contains in str(e),str(e);return
  raise AssertionError('Expected rejection '+contains)
 with tempfile.TemporaryDirectory(dir=root,prefix='mock-')as tmp:
  project=Path(tmp);item=pack[0]
  rejected(lambda:g.generate(project,pack,1,False,success,'fixture'), 'opt-in');checks.append('explicit online opt-in')
  first=g.generate(project,pack,1,True,success,'fixture','approved-one');second=g.generate(project,pack,1,True,success,'fixture','approved-one');assert first['providerCalls']==1 and second['providerCalls']==0 and len(calls)==1;checks+=['real WAV conversion from mocked transport','cache reuse zero attempts','persistent attempt count']
  changed={**body,'model':'fixture-two'};other={**item,'body':changed,'requestKey':hashlib.sha256(json.dumps(changed,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()}
  rejected(lambda:g.generate(project,[other],1,True,success,'fixture','approved-one'),'Persistent call cap');assert len(calls)==1;checks.append('restart does not reset cap')
  rejected(lambda:g.generate(project,[other],2,True,success,'fixture','approved-one'),'Budget cap changed');checks.append('same authorization cannot silently increase cap')
  rejected(lambda:g.generate(project,[{**item,'body':changed}],1,True,success,'fixture','invalid-key'),'content key');checks.append('request integrity')
  def quota(body,key):calls.append('quota');raise urllib.error.HTTPError('fixture',429,'fixture',{},io.BytesIO(b'private-response-not-for-logs'))
  rejected(lambda:g.generate(project,[other],1,True,quota,'fixture','approved-error'),'HTTP 429');count=len(calls)
  rejected(lambda:g.generate(project,[other],1,True,quota,'fixture','approved-error'),'Persistent call cap');assert len(calls)==count;checks+=['429 stops without retry/fallback','failed attempt consumes persistent budget']
  ledger=json.loads((project/'.cinematic/provider/gemini/budget-approved-error.json').read_text());assert ledger['attempts']==1 and'private-response'not in json.dumps(ledger);checks.append('no secret response body logged')
  lock=project/'.cinematic/provider/gemini/.generation.lock';lock.write_text('fixture-pid');rejected(lambda:g.generate(project,pack,1,True,success,'fixture','queue'),'owns the queue');lock.unlink();checks.append('single queue lock')
  rejected(lambda:g.generate(skill,pack,1,True,success,'fixture','write'),'outside installed skill');checks.append('installed skill remains read only')
 return {'status':'PASS','checks':checks,'liveProviderCalls':0,'APIResponses':'mocked only','modelAvailabilityCertified':False}
def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--project',required=True);a=p.parse_args();r=test(a.project);out=Path(a.project)/'voice-budget-tests.json';out.write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8');print(json.dumps(r,indent=2))
if __name__=='__main__':main()
