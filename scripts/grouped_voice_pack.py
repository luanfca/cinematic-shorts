"""Build content-addressed Gemini takes offline. Never generates audio or authorizes API use."""
import argparse, hashlib, json, re
from pathlib import Path

def build(script, max_chars=2500, model=None):
    if max_chars < 100:
        raise ValueError('max_chars must be >=100; it is an editorial cap, not a provider limit')
    groups = {}
    seen = set()
    for line in script['lines']:
        if line['id'] in seen:
            raise ValueError('Duplicate line ID: '+line['id'])
        seen.add(line['id'])
        role = line['who']; profile = script['voices'][role]
        selected = model or line.get('modelOverride') or profile['model']
        voice = profile['voice']
        text = re.sub(r'<[^>]*>', '', line['text']).strip()
        if not text:
            raise ValueError('Empty speech: '+line['id'])
        if len(text)>max_chars:
            raise ValueError('One line exceeds editorial cap; revise it before making a pack')
        key = (role, voice, selected)
        batches = groups.setdefault(key, [[]])
        if sum(len(x['text']) for x in batches[-1])+len(text)>max_chars:
            batches.append([])
        batches[-1].append({'id':line['id'],'text':text,'style':line.get('style','Natural Brazilian Portuguese.')})
    result=[]
    role_counts={}
    for (role,voice,selected),batches in groups.items():
        for lines in batches:
            role_counts[role]=role_counts.get(role,0)+1
            number=role_counts[role]
            body={'model':selected,'input':[{'type':'user_input','content':[
                {'type':'text','text':line['text'],'annotations':[{'type':'speech_metadata','style':line['style']}]} for line in lines
            ]}],'response_format':{'type':'audio','mime_type':'audio/wav'},'generation_config':{'speech_config':[{'voice':voice}]}}
            request_key=hashlib.sha256(json.dumps(body,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
            result.append({'line':f'take-{role}-{number:02}','lineIds':[x['id'] for x in lines],'requestKey':request_key,'body':body})
    return result

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--project',required=True);p.add_argument('--script',required=True);p.add_argument('--output',required=True);p.add_argument('--max-chars',type=int,default=2500);p.add_argument('--model');a=p.parse_args()
    root=Path(a.project).resolve();out=Path(a.output).resolve()
    if not out.is_relative_to(root):raise ValueError('Output must stay inside the production project')
    script=json.loads(Path(a.script).read_text(encoding='utf-8-sig'));pack=build(script,a.max_chars,a.model)
    out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(pack,ensure_ascii=False,indent=2),encoding='utf8')
    print(json.dumps({'requests':len(pack),'lines':sum(len(x['lineIds']) for x in pack),'externalCalls':0,'output':str(out),'next':'Inspect styles/model and obtain provider authorization before generation'},ensure_ascii=False))
if __name__=='__main__':main()
