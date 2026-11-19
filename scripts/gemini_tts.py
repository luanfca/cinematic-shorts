#!/usr/bin/env python3
"""Optional Gemini TTS with explicit dialect, persistent budget and single queue. No implicit calls."""
import sys
sys.dont_write_bytecode=True
from pathlib import Path
import argparse,base64,hashlib,json,os,re,subprocess,urllib.request,urllib.error,wave
ENDPOINT='https://generativelanguage.googleapis.com/v1beta/interactions'

def find_audio(o):
 if isinstance(o,dict):
  if isinstance(o.get('data'),str)and len(o['data'])>1000:
   try:return base64.b64decode(o['data'],validate=True)
   except ValueError:pass
  for v in o.values():
   a=find_audio(v)
   if a:return a
 if isinstance(o,list):
  for v in o:
   a=find_audio(v)
   if a:return a
 return None

def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def default_transport(body,key):
 endpoint=ENDPOINT;payload=body
 if body.get('api')=='generate-content':
  model=body['model']
  if not re.fullmatch(r'[A-Za-z0-9._-]+',model):raise ValueError('Invalid model ID')
  endpoint='https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent'
  payload={k:v for k,v in body.items()if k not in ['api','model']}
 req=urllib.request.Request(endpoint,data=json.dumps(payload).encode(),headers={'Content-Type':'application/json','x-goog-api-key':key})
 with urllib.request.urlopen(req,timeout=300)as r:return json.loads(r.read())

def _generate(project,requests,max_calls,online=False,transport=None,api_key=None,budget_id='default'):
 project=Path(project).resolve();target=project/'.cinematic/provider/gemini';results=[];calls=0
 if not online:raise ValueError('Online voice generation is opt-in; use --online only for authorized provider use')
 if max_calls<1:raise ValueError('Set an explicit positive maximum number of provider calls')
 if not re.fullmatch(r'[A-Za-z0-9_-]{1,80}',budget_id):raise ValueError('Invalid authorization budget ID')
 ledger_path=target/('budget-'+budget_id+'.json')
 ledger=json.loads(ledger_path.read_text())if ledger_path.exists()else{'budgetId':budget_id,'limit':max_calls,'attempts':0,'requests':[]}
 if ledger['limit']!=max_calls:raise ValueError('Budget cap changed; use a distinct authorized budget ID, preserving the previous ledger')
 key=api_key if api_key is not None else os.environ.get('GEMINI_API_KEY')
 if not key:raise ValueError('GEMINI_API_KEY not available; no request sent')
 transport=transport or default_transport
 for item in requests:
  k=item['requestKey']
  if not isinstance(k,str)or len(k)!=64 or any(c not in '0123456789abcdef'for c in k):raise ValueError('Invalid content-addressed request key')
  expected=hashlib.sha256(json.dumps(item['body'],sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
  if k!=expected:raise ValueError('Request body changed without updating its content key')
  out=target/(k+'.wav');meta=target/(k+'.json')
  if out.is_file()and meta.is_file()and json.loads(meta.read_text()).get('sha256')==sha(out):results.append({'line':item['line'],'path':str(out),'cached':True});continue
  if ledger['attempts']>=max_calls:raise ValueError('Persistent call cap reached; completed clips remain cached')
  target.mkdir(parents=True,exist_ok=True);calls+=1
  ledger['attempts']+=1;ledger['requests'].append({'requestKey':k,'model':item['body']['model'],'status':'attempted'})
  temp=ledger_path.with_suffix('.tmp');temp.write_text(json.dumps(ledger,indent=2),encoding='utf-8');temp.replace(ledger_path)
  try:response=transport(item['body'],key)
  except urllib.error.HTTPError as e:raise ValueError('Provider HTTP '+str(e.code)+'; stopped without model fallback; response body/key not logged')from None
  except Exception:raise ValueError('Provider request failed; stopped without logging headers or response body')from None
  audio=find_audio(response)
  if not audio:raise ValueError('Provider did not return recognizable audio')
  raw=target/(k+'-raw.wav')
  if audio[:4]==b'RIFF':raw.write_bytes(audio)
  else:
   with wave.open(str(raw),'wb')as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(24000);w.writeframes(audio)
  r=subprocess.run(['ffmpeg','-y','-v','error','-i',str(raw),'-ar','48000','-ac','1',str(out)],capture_output=True)
  if r.returncode:raise ValueError('Provider audio decode/conversion failed')
  meta.write_text(json.dumps({'sha256':sha(out),'requestKey':k,'model':item['body']['model'],'usage':response.get('usage'),'provider':'Gemini','cost':'not queried'},indent=2),encoding='utf8');results.append({'line':item['line'],'path':str(out),'cached':False})
 return {'providerCalls':calls,'budgetAttempts':ledger['attempts'],'budgetLimit':max_calls,'budgetId':budget_id,'results':results,'billingCost':'not queried','alignmentRequiredBeforeBinding':True,'modelFallback':False}

def generate(project,requests,max_calls,online=False,transport=None,api_key=None,budget_id='default'):
 root=Path(__file__).resolve().parents[1];project=Path(project).resolve()
 if project==root or project.is_relative_to(root):raise ValueError('Provider output must stay outside installed skill')
 if not online:raise ValueError('Online voice generation is opt-in; use --online only for authorized provider use')
 target=project/'.cinematic/provider/gemini';target.mkdir(parents=True,exist_ok=True);lock=target/'.generation.lock'
 try:fd=os.open(lock,os.O_CREAT|os.O_EXCL|os.O_WRONLY)
 except FileExistsError:raise ValueError('Another voice generation owns the queue; do not run providers concurrently')from None
 try:
  with os.fdopen(fd,'w')as handle:handle.write(str(os.getpid()))
  return _generate(project,requests,max_calls,online,transport,api_key,budget_id)
 finally:lock.unlink(missing_ok=True)

def main():
 p=argparse.ArgumentParser();p.add_argument('--project',required=True);p.add_argument('--requests',required=True);p.add_argument('--online',action='store_true');p.add_argument('--max-calls',type=int,required=True);p.add_argument('--budget-id',default='default');a=p.parse_args();project=Path(a.project).resolve();requestFile=Path(a.requests).resolve()
 if not requestFile.is_relative_to(project):raise ValueError('Read a voice pack generated inside this project')
 result=generate(project,json.loads(requestFile.read_text(encoding='utf-8-sig')),a.max_calls,a.online,budget_id=a.budget_id);print(json.dumps(result,ensure_ascii=False))
if __name__=='__main__':
 try:main()
 except Exception as e:print(json.dumps({'status':'BLOCKED','error':str(e)},ensure_ascii=False));sys.exit(1)
