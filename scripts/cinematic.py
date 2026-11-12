#!/usr/bin/env python3
"""Portable entry point. Skill resources remain read-only; output lives in the chosen project."""
import sys
sys.dont_write_bytecode=True
from pathlib import Path
import argparse,hashlib,importlib.util,json,os,shutil,subprocess
PACKAGE=Path(__file__).resolve().parents[1]
ASSETS=PACKAGE/'assets'

def read(p):return json.loads(Path(p).read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def key(x):return hashlib.sha256(json.dumps(x,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
def write(p,x):p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2),encoding='utf8')
def output(x):print(json.dumps(x,ensure_ascii=False,separators=(',',':')))
def safe_project(p):
 p=Path(p).resolve()
 if p==PACKAGE or p.is_relative_to(PACKAGE):raise ValueError('Choose a working project outside the installed skill directory')
 return p

def discover_browser(project,explicit=None):
 if explicit:
  p=Path(explicit).expanduser().resolve()
  if not p.is_file():raise ValueError('Configured browser executable not found')
  return str(p)
 found=os.environ.get('CINEMATIC_BROWSER')
 if found and Path(found).is_file():return str(Path(found).resolve())
 candidates=[]
 for root in [project/'.cinematic/browsers',Path(os.environ.get('LOCALAPPDATA',str(Path.home()/'.cache')))/'ms-playwright',Path.home()/'.cache/ms-playwright']:
  if root.exists():
   for pattern in ['chromium-*/chrome-win64/chrome.exe','chromium-*/chrome-linux/chrome','chromium-*/chrome-linux64/chrome','chromium-*/chrome-mac/Chromium.app/Contents/MacOS/Chromium','chromium-*/chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium']:
    candidates.extend(sorted(root.glob(pattern),reverse=True))
 for base in [os.environ.get('PROGRAMFILES',''),os.environ.get('PROGRAMFILES(X86)',''),os.environ.get('LOCALAPPDATA','')]:
  if base:
   for rel in ['Google/Chrome/Application/chrome.exe','Microsoft/Edge/Application/msedge.exe']:candidates.append(Path(base)/rel)
 candidates.extend(Path(p)for p in ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'])
 for binary in ['chromium','chromium-browser','google-chrome','microsoft-edge']:
  p=shutil.which(binary)
  if p:candidates.append(Path(p))
 return str(next((p for p in candidates if p.is_file()),''))

def module(project):
 root=project/'.cinematic'
 (root/'work/tmp').mkdir(parents=True,exist_ok=True)
 os.environ.update(TEMP=str(root/'work/tmp'),TMP=str(root/'work/tmp'),HF_HOME=str(root/'cache/hf'),HF_HUB_OFFLINE='1',HF_HUB_DISABLE_TELEMETRY='1')
 sys.path.insert(0,str(root/'python'));sys.path.insert(0,str(root))
 machine=read(root/'machine.json')
 if machine.get('nodeModules'):os.environ['CINEMATIC_NODE_MODULES']=machine['nodeModules']
 if machine.get('browser'):os.environ['CINEMATIC_BROWSER']=machine['browser']
 spec=importlib.util.spec_from_file_location('cinematic_runtime',root/'engine.py');m=importlib.util.module_from_spec(spec);sys.modules[spec.name]=m;spec.loader.exec_module(m);return m

def initialize(project,browser,modules):
 project=safe_project(project);root=project/'.cinematic'
 if root.exists():raise ValueError('Project is already initialized; refusing to overwrite it')
 
 for f in ['package.json','package-lock.json','requirements.txt','requirements-voice.txt']:
  if(project/f).exists():raise ValueError('Existing project file would be overwritten: '+f)
 project.mkdir(parents=True,exist_ok=True);shutil.copytree(ASSETS/'runtime',root);shutil.copytree(ASSETS/'demo',root/'episodes/demo')
 for f in ['package.json','requirements.txt','requirements-voice.txt']:
  target=project/f
  if target.exists():raise ValueError('Existing project file would be overwritten: '+f)
  shutil.copyfile(ASSETS/f,target)
 if(ASSETS/'package-lock.json').is_file():shutil.copyfile(ASSETS/'package-lock.json',project/'package-lock.json')
 machine={'browser':discover_browser(project,browser),'nodeModules':str(Path(modules).resolve())if modules else str(project/'node_modules')};write(root/'machine.json',machine)
 ep=root/'episodes/demo';cfg=read(ep/'episode.json');cfg['browser']=machine['browser'];script=read(ep/'script.json');tl=read(ep/'studio/src/caderno2/timeline.json');voices=[]
 for line in script['lines']:
  vk=key({'text':line['text'],'style':line.get('style',''),'speaker':line['who'],'voice':script['voices'][line['who']],'processing':'approved-edited-voice-slot-v1','modelOverride':line.get('modelOverride'),'engine':'caderno-engine-1.0'});b=cfg['voices'][line['id']];b['identity']=vk;b['sha256']=sha(ep/b['path']);voices.append({'identity':vk,'audio':b['sha256']})
 cfg['audioBinding']=key({'voices':voices,'timeline':{'total':tl['total'],'fps':tl['fps'],'slots':[{k:s.get(k)for k in ['id','a','b','line','who']}for s in tl['shots']]},'words':read(ep/'studio/src/caderno2/words.json')})
 recipe=read(ep/'sound.json');recipe['baselineMasterSHA256']=sha(ep/recipe['baselineMaster']);recipe['baselineStems']={n:sha(ep/p)for n,p in recipe['stems'].items()};write(ep/'sound.json',recipe);cfg['soundBinding']=key({'recipe':recipe,'sources':{n:sha(ep/p)for n,p in recipe['stems'].items()},'effects':{}});write(ep/'episode.json',cfg)
 (root/'cache').mkdir();(root/'work').mkdir();(project/'CONTEXT.md').write_text('Cinematic Shorts: project initialized. Demo: 3.1s, 1080x1920/30fps, real cached speech. Use the skill plan command; preserve approved assets. New stories require authored script, aligned speech and direction. No automatic provider calls.\n',encoding='utf8')
 return {'project':str(project),'episode':'demo','browserFound':bool(machine['browser']),'next':'doctor; setup only if local dependencies are missing','externalCalls':0}

def setup(project,install,download):
 root=project/'.cinematic';machine=read(root/'machine.json');environment=os.environ.copy()
 for name in list(environment):
  if any(t in name.upper()for t in ['API_KEY','ACCESS_TOKEN','AUTH_TOKEN']):environment.pop(name,None)
 (root/'work/tmp').mkdir(parents=True,exist_ok=True)
 environment.update(TEMP=str(root/'work/tmp'),TMP=str(root/'work/tmp'),NPM_CONFIG_CACHE=str(root/'cache/npm'),PIP_CACHE_DIR=str(root/'cache/pip'),PLAYWRIGHT_BROWSERS_PATH=str(root/'browsers'),PYTHONPYCACHEPREFIX=str(root/'work/pycache'))
 if install:
  if not shutil.which('npm'):raise ValueError('Install Node.js/npm first; no system installer is run by this skill')
  npm=Path(shutil.which('npm'));npmCommand=[str(npm)]
  if os.name=='nt':
   candidates=[npm.parent/'node_modules/npm/bin/npm-cli.js',Path(shutil.which('node')).parent/'node_modules/npm/bin/npm-cli.js'];cli=next((p for p in candidates if p.is_file()),None)
   if not cli:raise ValueError('Cannot locate npm-cli.js; install project dependencies manually with npm')
   npmCommand=['node',str(cli)]
  lock=(project/'package-lock.json').is_file()and os.name=='nt';commands=[[*npmCommand,'ci'if lock else'install','--prefix',str(project)], [sys.executable,'-m','pip','install','--target',str(root/'python'),'-r',str(project/'requirements.txt')]]
  for c in commands:
   r=subprocess.run(c,cwd=project,env=environment,capture_output=True);(root/'work').mkdir(exist_ok=True);(root/'work'/('setup-'+('python'if c[0]==sys.executable else'npm')+'.log')).write_bytes(r.stdout+r.stderr)
   if r.returncode:raise ValueError('Local dependency installation failed; see project setup logs')
  machine['nodeModules']=str(project/'node_modules')
 if download:
  cli=project/'node_modules/playwright/cli.js'
  if not cli.is_file():raise ValueError('Install local dependencies before downloading a browser')
  r=subprocess.run(['node',str(cli),'install','chromium'],cwd=project,env=environment,capture_output=True);(root/'work/browser-install.log').write_bytes(r.stdout+r.stderr)
  if r.returncode:raise ValueError('Browser download failed; see project log')
  resolved=subprocess.run(['node','-e',"process.stdout.write(require('playwright').chromium.executablePath())"],cwd=project,env=environment,capture_output=True,text=True)
  if resolved.returncode==0 and Path(resolved.stdout.strip()).is_file():machine['browser']=resolved.stdout.strip()
 machine['browser']=discover_browser(project,machine.get('browser')or None);write(root/'machine.json',machine)
 for ep in(root/'episodes').iterdir():
  p=ep/'episode.json'
  if p.is_file():cfg=read(p);cfg['browser']=machine['browser'];write(p,cfg)
 return {'installedLocally':install,'browserDownloadRequested':download,'browserFound':bool(machine['browser']),'noGlobalInstallation':True}

def main():
 p=argparse.ArgumentParser(description='Cinematic Shorts skill: portable Remotion production');p.add_argument('--project',default='.',help='Working project directory, outside the skill');s=p.add_subparsers(dest='cmd',required=True)
 q=s.add_parser('init');q.add_argument('--browser');q.add_argument('--node-modules',help='Optional existing dependencies for offline testing; not bundled')
 q=s.add_parser('setup');q.add_argument('--install',action='store_true');q.add_argument('--download-browser',action='store_true')
 for name in ['doctor','plan','context','build','clone','future','bind-voice','bind-master','compile','align']:
  q=s.add_parser(name)
  if name=='align':q.add_argument('--wav',required=True);q.add_argument('--model',required=True);q.add_argument('--output',required=True)
  else:q.add_argument('args',nargs=argparse.REMAINDER)
 a=p.parse_args();project=safe_project(a.project)
 if a.cmd=='init':output(initialize(project,a.browser,a.node_modules));return
 if a.cmd=='setup':output(setup(project,a.install,a.download_browser));return
 m=module(project)
 if a.cmd=='compile':
  import compile_episode;output(compile_episode.compile_episode(m,*a.args));return
 if a.cmd=='align':
  import align;output(align.run(project,['--wav',a.wav,'--model',a.model,'--output',a.output]));return
 old=sys.argv;sys.argv=[str(m.ROOT/'engine.py'),a.cmd,*a.args]
 try:m.main()
 finally:sys.argv=old
if __name__=='__main__':
 try:main()
 except Exception as e:output({'status':'BLOCKED','error':str(e)});sys.exit(1)
