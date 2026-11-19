#!/usr/bin/env python3
"""Read a local reference without API calls. Frame extraction requires an explicit budget."""
import sys
sys.dont_write_bytecode=True
import argparse,hashlib,json,math,subprocess
from pathlib import Path
PACKAGE=Path(__file__).resolve().parents[1]

def digest(path):
 h=hashlib.sha256()
 with path.open('rb')as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()

def run(a):
 source=Path(a.video).expanduser().resolve();project=Path(a.project).expanduser().resolve();out=(project/a.out).resolve()
 if not source.is_file():raise ValueError('Reference video not found')
 if not out.is_relative_to(project)or out==project:raise ValueError('Choose a subdirectory inside the working project')
 if project==PACKAGE or project.is_relative_to(PACKAGE)or out.is_relative_to(PACKAGE):raise ValueError('Output must be outside the installed skill')
 times=a.times or[]
 if a.max_frames<0 or len(times)>a.max_frames:raise ValueError('Requested samples exceed the explicit --max-frames budget')
 if len(set(times))!=len(times):raise ValueError('Duplicate sample times are not allowed')
 if any(not math.isfinite(t)or t<0 for t in times):raise ValueError('Invalid sample time')
 if out.exists()and any(out.iterdir()):raise ValueError('Output directory is not empty; choose a new output directory')
 raw=subprocess.run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(source)],capture_output=True,text=True,encoding='utf8',check=True);probe=json.loads(raw.stdout);video=next((s for s in probe['streams']if s['codec_type']=='video'),None)
 if video is None:raise ValueError('Reference has no video stream')
 duration=float(probe['format']['duration'])
 if any(t>=duration for t in times):raise ValueError('Sample time is outside reference duration')
 before=digest(source);out.mkdir(parents=True,exist_ok=True);(out/'probe.json').write_text(json.dumps(probe,ensure_ascii=False,indent=2),encoding='utf8');samples=[]
 for i,t in enumerate(times):
  target=out/f'frame-{i+1:02}.png';subprocess.run(['ffmpeg','-nostdin','-n','-v','error','-ss',str(t),'-i',str(source),'-frames:v','1',str(target)],check=True,capture_output=True);samples.append({'seconds':t,'path':target.name,'sha256':digest(target)})
 if a.audio:subprocess.run(['ffmpeg','-nostdin','-n','-v','error','-i',str(source),'-vn','-ac','1','-ar','16000','-c:a','pcm_s16le',str(out/'reference-audio.wav')],check=True,capture_output=True)
 unchanged=digest(source)==before
 if not unchanged:raise ValueError('Source integrity changed unexpectedly')
 report={'reference':str(source),'sourceSHA256':before,'sourceUnchanged':unchanged,'duration':duration,'width':video['width'],'height':video['height'],'containerFrameRate':video.get('avg_frame_rate'),'frameRateIsNotMotionQualityProof':True,'framesExtracted':len(samples),'maxFramesRequested':a.max_frames,'visualFramesActuallyReviewed':0,'samples':samples,'audioExtracted':a.audio,'providerCalls':0,'fullViewingOrListeningClaimed':False,'coverageNote':'Metadata and optional extracted samples only; an agent must separately record which samples it reviewed. Extraction does not establish shot order, identity, dialogue or aesthetic fidelity.'}
 (out/'reference.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');return report

def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--video',required=True);p.add_argument('--project',required=True);p.add_argument('--out',default='reference-audit');p.add_argument('--times',nargs='*',type=float,default=[]);p.add_argument('--max-frames',type=int,default=0);p.add_argument('--audio',action='store_true');a=p.parse_args();print(json.dumps(run(a),ensure_ascii=False))
if __name__=='__main__':
 try:main()
 except Exception as e:print(json.dumps({'status':'FAILED','error':str(e)},ensure_ascii=False));sys.exit(1)
