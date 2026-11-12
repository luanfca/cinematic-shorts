#!/usr/bin/env python3
"""Run the packaged real-media demo twice. No TTS requests or installs are triggered."""
import sys
sys.dont_write_bytecode=True
import argparse,json,subprocess
from pathlib import Path

def main():
 p=argparse.ArgumentParser();p.add_argument('--project',required=True);a=p.parse_args();script=Path(__file__).with_name('cinematic.py');results=[]
 for args in [['doctor','demo'],['plan','demo'],['build','demo','--max-new-frames','93'],['build','demo','--max-new-frames','0']]:
  r=subprocess.run([sys.executable,'-B','-X','utf8',str(script),'--project',a.project,*args],capture_output=True,text=True,encoding='utf8')
  if r.returncode:raise ValueError('Selftest failed: '+r.stdout.strip())
  results.append(json.loads(r.stdout))
 first,last=results[2:]
 if first['frames']!=93 or last['frames']!=93 or last['newRenderedFrames']!=0 or not last['cachedQA']:raise ValueError('Packaged demo/cache verification failed')
 out={'PASS':True,'frames':93,'duration':3.1,'lastRunNewFrames':0,'newTTSRequests':0,'cachedQA':True,'output':last['output'],'scope':'Technical demo and cache only; no subjective listening or visual review claimed'};print(json.dumps(out,ensure_ascii=False))
if __name__=='__main__':
 try:main()
 except Exception as e:print(json.dumps({'PASS':False,'error':str(e)},ensure_ascii=False));sys.exit(1)
