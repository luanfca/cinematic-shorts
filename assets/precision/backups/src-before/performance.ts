import words from './word-times.json';
import voice from './voice-stage.json';
export type Viseme=0|1|2|3|4;
export function captionLines(text:string){
 const lines:string[]=[];let line='';
 for(const word of text.split(' ')){
  if((line+' '+word).trim().length>24&&line){lines.push(line);line=word;}
  else line=(line+' '+word).trim();
 }
 if(line)lines.push(line);return lines;
}
export function captionAt(t:number,id:string,text:string){
 const l=voice.lines.find(l=>l.id===id),row=words.find(w=>w.id===id);
 if(!l||!row)return text;
 const tokens=text.split(' '),groups:{text:string;first:number}[]=[];
 let first=0,group='';
 for(let i=0;i<tokens.length;i++){
  // Preserve the long, performed pauses after "Então..." and "Caio...".
  const pause=false;
  const candidate=(group+' '+tokens[i]).trim();
  const sentence=group.length>15&&/[^.]\.$/.test(group);
  if(group&&(pause||sentence||captionLines(candidate).length>2)){
   groups.push({text:group,first});group='';first=i;
  }
  group=(group+' '+tokens[i]).trim();
 }
 if(group)groups.push({text:group,first});
 const dt=t-l.at,at=(g:{first:number})=>row.words[Math.min(row.words.length-1,Math.floor(g.first/tokens.length*row.words.length))]?.start??0;
 return (groups.find((g,i)=>dt< (groups[i+1]?at(groups[i+1]):l.duration))??groups[groups.length-1])?.text??text;
}
export function visemeAt(t:number,who:string):Viseme{const l=voice.lines.find(l=>l.who===who&&t>=l.at&&t<l.end);if(!l)return 0;const w=words.find(w=>w.id===l.id)?.words.find(w=>t-l.at>=w.start&&t-l.at<w.end);if(!w)return 0;const letters=w.text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z]/g,'');const p=(t-l.at-w.start)/Math.max(.03,w.end-w.start),ch=letters[Math.min(letters.length-1,Math.floor(p*letters.length))];return /[mbp]/.test(ch)?0:/[fv]/.test(ch)?4:/[ou]/.test(ch)?3:/[ei]/.test(ch)?2:1;}
