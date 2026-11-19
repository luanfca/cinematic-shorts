#!/usr/bin/env python3
"""Initialize the complete POV/acting reference outside the installed skill. No TTS."""
import sys
sys.dont_write_bytecode=True
from pathlib import Path,PurePosixPath
import argparse,hashlib,json,shutil,subprocess,tempfile,urllib.request,zipfile,os
ROOT=Path(__file__).resolve().parents[1];ASSET=ROOT/'assets/precision'
def digest(f):return hashlib.sha256(Path(f).read_bytes()).hexdigest()
def run(args):return subprocess.run(args,check=True,capture_output=True).stdout
def initialize(project,media_zip=None,download=False):
    project=Path(project).expanduser().resolve()
    if project==ROOT or project.is_relative_to(ROOT):raise ValueError('Project must be outside installed skill')
    if project.exists() and any(project.iterdir()):raise ValueError('Destination must be new or empty; existing work is preserved')
    if media_zip and download:raise ValueError('Use local media OR explicit download')
    if (media_zip or download) and not shutil.which('ffmpeg'):raise ValueError('FFmpeg is required to restore approved audio')
    project.mkdir(parents=True,exist_ok=True)
    if download:
        info=json.loads((ASSET/'media.json').read_text());cache=project/'.cache';cache.mkdir()
        media_zip=cache/'media.zip'
        with urllib.request.urlopen(info['url'],timeout=120)as response,media_zip.open('wb')as output:
            total=0
            while chunk:=response.read(1024*1024):
                total+=len(chunk)
                if total>info['bytes']:raise ValueError('Unexpected release size')
                output.write(chunk)
        if digest(media_zip)!=info['sha256']:raise ValueError('Release checksum mismatch')
    if media_zip:
        media_zip=Path(media_zip).resolve();info=json.loads((ASSET/'media.json').read_text())
        if digest(media_zip)!=info['sha256']:raise ValueError('Local media checksum mismatch')
    shutil.copytree(ASSET,project,dirs_exist_ok=True)
    if media_zip:
        with zipfile.ZipFile(media_zip)as z:
            manifest=json.loads(z.read('MEDIA-MANIFEST.json'))
            if set(z.namelist())!=set(manifest['files'])|{'MEDIA-MANIFEST.json'}:raise ValueError('Unexpected archive entries')
            for name,row in manifest['files'].items():
                rel=PurePosixPath(name);restore=PurePosixPath(row['restore'])
                if any(x.is_absolute() or '..' in x.parts or '\\' in str(x) or ':' in str(x) for x in [rel,restore]):raise ValueError('Unsafe media path')
                data=z.read(name)
                if len(data)!=row['bytes'] or hashlib.sha256(data).hexdigest()!=row['sha256']:raise ValueError('Media hash mismatch: '+name)
                target=project/Path(restore);target.parent.mkdir(parents=True,exist_ok=True)
                if target.exists():raise ValueError('Refusing to replace '+str(restore))
                if name.endswith('.flac'):
                    packed=project/'.cache'/Path(rel);packed.parent.mkdir(parents=True,exist_ok=True);packed.write_bytes(data)
                    run(['ffmpeg','-v','error','-i',str(packed),'-c:a',row['codec'],str(target)])
                    pcm=run(['ffmpeg','-v','error','-i',str(target),'-f','s32le','-'])
                    if hashlib.sha256(pcm).hexdigest()!=row['pcmSHA256']:raise ValueError('Decoded PCM mismatch: '+name)
                else:target.write_bytes(data)
        (project/'MEDIA-MANIFEST.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
    contract='''# Claude Code / Codex — projeto ativo
Leia CLAUDE.md e PRECISION-RULES.md. Preserve identidade, vozes/modelo, áudio, rig conectado, sombras e continuidade. Leia src e execute npm run check antes de estender. Não faça TTS nem chamadas pagas sem autorização vigente; uma chave presente não autoriza gasto. A instalação não é o vídeo pedido: continue a autoria e a revisão até a entrega autorizada. Atualize CONTEXT.md e SERIES.json ao aprovar um episódio. Esta pasta contém um episódio de referência, não um vídeo inédito para qualquer tema.
'''
    (project/'AGENTS.md').write_text(contract,encoding='utf-8');(project/'CONTEXT.md').write_text('Skill 1.3.0. Reference: Sala 214 Parte 2 precision, 67.9 s. Media restored: '+str(bool(media_zip))+'. No new API calls. Read CLAUDE.md and project contract before continuation.\n',encoding='utf-8')
    return {'project':str(project),'mediaRestored':bool(media_zip),'externalVoiceCalls':0,'next':'npm install (local, if needed); npm run check; npm run preview:a; npm run preview:b; npm run render'}
def main():
    parser=argparse.ArgumentParser(description=__doc__);sub=parser.add_subparsers(dest='command',required=True);p=sub.add_parser('init');p.add_argument('--project',required=True);p.add_argument('--media-zip');p.add_argument('--download-media',action='store_true');a=parser.parse_args();print(json.dumps(initialize(a.project,a.media_zip,a.download_media),ensure_ascii=False,indent=2))
if __name__=='__main__':
    try:main()
    except Exception as error:print(json.dumps({'status':'BLOCKED','error':str(error)},ensure_ascii=False));sys.exit(1)
