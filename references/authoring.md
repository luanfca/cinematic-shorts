# Autoria de um episódio

Use o exemplo como infraestrutura, escrevendo a história efetiva do usuário:

```powershell
python -X utf8 CAMINHO-DA-SKILL/scripts/cinematic.py --project PROJETO clone demo episodio1
```

Arquivos ficam em `.cinematic/episodes/episodio1/`. script.json define vozes e falas; studio/src/caderno2/story.json define nomes, textos e direção; performance.json define microatuação. O nome interno caderno2 identifica o adaptador visual existente, não uma obrigação temática.

Uma fala em script.json tem `id`, `who`, `text`, `style`, `emotion`, `scene`, `mode`; `holdSeconds` é opcional e não altera velocidade. Os cinco papéis iniciais são lucas, narr, anchor, fake, real; para outro elenco adapte perfis/renderer e referências. Não imite uma voz diferente silenciosamente.

Modos visuais do adaptador: close, room, window, news, fake, symbol, map, photo, write, write-daniel, name, montage, comments, timer40, timer25, timer5, death, end. São cenas de apartamento/transmissão; uma escola, banco ou outro cenário exige implementar/selecionar esse cenário no projeto. O pacote não promete assets prontos para qualquer assunto.

Depois de importar WAVs reais e seus alinhamentos, compile:

```powershell
python -X utf8 CAMINHO-DA-SKILL/scripts/cinematic.py --project PROJETO compile episodio1
```

O compilador deriva duração dos clips, gera timeline, legendas de até duas linhas e envelopes por personagem. Não inventa tempos, corta fonemas, altera pitch ou acelera fala. Pre-roll precisa caber em silêncio anterior. Clips extraídos como slots aprovados podem preservar sua duração; takes novas recebem um hold natural configurável.

`beatsBefore` e `beatsAfter` permitem beats sem fala: `{"mode":"symbol","seconds":0.8,"scene":8}`. `direction` por fala pode conter broadcastMode, notebookNameKey, closeAfter/photoAfter (fração de 0 a 1) e camera `{x,y,scale,zoom}` para planos de sala/close. Não use efeitos por obrigação; mantenha o ritmo solicitado.

O compilador preserva os stems existentes quando cabem. Se a duração mudar, prepara ambiente e um leito de suspense procedural discreto; efeitos começam vazios e devem ser dirigidos. A master nova usa o perfil de compressão/loudness da produção, sem modificar a referência aprovada. Se o barramento de voz for idêntico, a master existente é preservada. Rever a mixagem nova continua necessário.

Para autoria posterior, ajuste story.json e performance.json já compilados. Uma compilação nova remapeia direção/atuação pelo ID da fala e reinicia cues sonoros; execute-a antes do acabamento final de som.

Presets de atuação: confident, shock, coldAuthority, containedTriumph:

```powershell
python -X utf8 CAMINHO-DA-SKILL/scripts/cinematic.py --project PROJETO future preset episodio1 --shot S01 --preset confident
```

Os deslocamentos usam o rig conectado e têm limites conservadores. O cache é por plano para dados locais; alterações de código/global podem exigir novos renders. Consulte plan e informe o limite necessário em build. Não apresente um clone sem autoria como conteúdo novo.
