#!/usr/bin/env python3
"""Validate the delivered native MP4 and preservation of approved audio, offline."""
import sys
sys.dont_write_bytecode=True
from pathlib import Path
import subprocess,json,argparse,hashlib
ROOT=Path(__file__).resolve().parents[1]
def run(args):return subprocess.run(args,check=True,capture_output=True)
def validate(video,approved,duration,output):
    video=Path(video).resolve();output=Path(output).resolve()
    if output==ROOT or output.is_relative_to(ROOT):raise ValueError('Write QA in working project, outside installed skill')
    probe=json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(video)]).stdout)
    v=next(s for s in probe['streams'] if s['codec_type']=='video');a=next(s for s in probe['streams'] if s['codec_type']=='audio');expected=round(duration*30)
    assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']),v['codec_name'],v['profile'])==(1080,1920,'30/1',expected,'h264','High'),'Video format differs'
    assert a['codec_name']=='aac' and a['sample_rate']=='48000','Audio format differs'
    assert abs(float(probe['format']['duration'])-expected/30)<.002,'Duration differs'
    decode=run(['ffmpeg','-v','error','-xerror','-i',str(video),'-f','null','-']);assert not decode.stderr,'Decode errors'
    audio=[]
    for source in [approved,video]:
        encoded=run(['ffmpeg','-v','error','-i',str(source),'-map','0:a:0','-c:a','copy','-f','adts','-']).stdout
        pcm=run(['ffmpeg','-v','error','-i',str(source),'-map','0:a:0','-f','s16le','-']).stdout
        audio.append({'AACSHA256':hashlib.sha256(encoded).hexdigest(),'PCMSHA256':hashlib.sha256(pcm).hexdigest()})
    assert audio[0]==audio[1],'Approved AAC or decoded audio changed'
    loud=run(['ffmpeg','-hide_banner','-nostats','-i',str(video),'-vn','-af','loudnorm=I=-14:TP=-1:LRA=11:print_format=json','-f','null','-']).stderr.decode(errors='replace');loud=json.loads(loud[loud.rfind('{'):loud.rfind('}')+1])
    assert float(loud['input_tp'])<=-1,'True peak exceeds -1dBTP';assert -15<=float(loud['input_i'])<=-13,'Loudness requires review'
    times=json.loads(run(['ffprobe','-v','error','-select_streams','v:0','-show_frames','-show_entries','frame=best_effort_timestamp_time','-of','json',str(video)]).stdout)['frames'];assert len(times)==expected
    assert all(abs(float(f['best_effort_timestamp_time'])-i/30)<.00001 for i,f in enumerate(times)),'Frame timestamps differ'
    result={'status':'PASS','video':video.name,'width':1080,'height':1920,'fps':30,'frames':expected,'seconds':expected/30,'profile':v['profile'],'sampleRate':48000,'LUFS':loud['input_i'],'dBTP':loud['input_tp'],'audioIdentical':True,'audioHashes':audio,'decode':'complete, no errors','timestamps':'all n/30','fullSubjectivePlaybackClaimed':False,'providerCalls':0}
    output.parent.mkdir(parents=True,exist_ok=True);output.write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8');return result
def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--video',required=True);p.add_argument('--approved-audio',required=True);p.add_argument('--duration',required=True,type=float);p.add_argument('--output',required=True);a=p.parse_args();print(json.dumps(validate(a.video,a.approved_audio,a.duration,a.output),indent=2))
if __name__=='__main__':
    try:main()
    except Exception as e:print(json.dumps({'status':'FAIL','error':str(e)}));sys.exit(1)
