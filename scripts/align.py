"""Offline ASR helper: no model download unless the operator installs one separately."""
from pathlib import Path
import argparse,json

def run(project,args):
 p=argparse.ArgumentParser();p.add_argument('--wav',required=True);p.add_argument('--model',required=True);p.add_argument('--output',required=True);a=p.parse_args(args);source=Path(a.wav).resolve();out=Path(a.output).resolve();modelPath=Path(a.model).expanduser().resolve()
 if not source.is_relative_to(project)or not out.is_relative_to(project):raise ValueError('Input and output must stay within the working project')
 if not(modelPath/'model.bin').is_file():raise ValueError('Local Whisper model is missing; no download attempted')
 from faster_whisper import WhisperModel
 model=WhisperModel(str(modelPath),device='cpu',compute_type='int8',cpu_threads=4,local_files_only=True);segments,_=model.transcribe(str(source),language='pt',word_timestamps=True,vad_filter=False,condition_on_previous_text=False);words=[{'w':w.word.strip(),'s':round(w.start,4),'e':round(w.end,4),'probability':w.probability}for s in segments for w in(s.words or[])];out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(words,ensure_ascii=False,indent=2),encoding='utf8');return {'words':len(words),'output':str(out),'modelLocalOnly':True,'phonemeAccurate':False}
