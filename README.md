# Cinematic Shorts Studio

Skill instalável para produzir vídeos narrativos com **Remotion, áudio consistente, cache e validação real**. Inclui código executável, um template cinematográfico, cinco referências de voz e uma demonstração com áudio real. Compatível com agentes que leem SKILL.md e executam Python/Node, como Codex e Claude Code.

Um projeto **E Se....? | Histórias**. O ebook associado ensina instalação e produção; o código está disponível publicamente, sem promessa de exclusividade ou de resultados automáticos.

**Instalar a skill não garante automaticamente a mesma qualidade criativa do vídeo de referência.** Roteiro, direção, interpretação, novos cenários e revisão continuam importantes. Remotion é a infraestrutura; não é uma garantia de qualidade por si só.

## Baixar a versão do guia

A versão deste guia é **1.3.0**. Instale diretamente de https://github.com/luanfca/cinematic-shorts, obtendo a pasta completa, e registre o commit instalado. Não copie apenas SKILL.md.

Pedido pronto para colar no Codex ou Claude Code com acesso ao computador:

> Instale a skill cinematic-shorts de https://github.com/luanfca/cinematic-shorts . Leia README e SKILL.md, instale todos os assets, scripts e referências em local compatível com este agente e confirme VERSION 1.3.0, production-contract.md e grouped_voice_pack.py. Registre o commit. Preserve projetos e alterações locais. Verifique pré-requisitos e execute a demo em um projeto separado, sem gerar voz nova. Informe o caminho instalado, o MP4 e as limitações reais.

Não é preciso enviar um ZIP ao agente. A primeira obtenção do repositório e instalação de dependências requer rede; a demo usa áudio em cache.

O contrato em [production-contract.md](references/production-contract.md) exige preservar o motor, ação desde o frame0 com premissa integrada e takes agrupados antes de qualquer geração de voz autorizada. `scripts/grouped_voice_pack.py` prepara os blocos offline; não gera áudio nem concede autorização de custo.

## Atualização 1.3.0 — motor real de atuação e transferência

Além do template original, inclui **Sala 214 Parte2 precision completa em fonte**, com câmera espacial, mãos POV, telefone legível e atuação facial/corporal progressiva. Os módulos CharacterActingSystem, POVCinematicDirector e ActingQualityValidator são usados pela cena real. Os presets de olhos e a reprodução fiel da edição1.2 continuam incluídos. Veja [CHANGELOG](CHANGELOG.md).

Para o exemplo de qualidade mais recente, em um projeto separado:

```powershell
python CAMINHO-DA-SKILL/scripts/precision.py init --project ./sala214 --download-media
cd sala214
npm install
npm run check
npm run preview:a
npm run preview:b
npm run render
```

Instalar npm somente se faltarem dependências locais. As mídias são um download explícito da [release v1.3.0](https://github.com/luanfca/cinematic-shorts/releases/tag/v1.3.0), com SHA256 fixo em assets/precision/media.json. Para uso offline, trocar --download-media por --media-zip CAMINHO/cinematic-shorts-sala214-media-v1.3.0.zip. Não há chamada de TTS. Os vídeos de referência permanecem idênticos byte a byte; WAVs inteiros usam FLAC e voltam ao mesmo PCM; WAVs float permanecem originais. Arquivos grandes não entram no histórico Git.

Regras de retenção: ação desde frame0, entendimento até3s, curiosidade até6s, progressão significativa a cada5–8s, preferência35–60s/teto90s, sem acelerar TTS. Correção cirúrgica respeita abertura e conteúdo aprovados. [Retenção](references/retention.md), [atuação/POV](references/acting-and-pov.md), [vozes/continuidade](references/performance-and-continuity.md), [transferência Claude Code](references/claude-handoff.md) e [render/distribuição](references/render-and-distribution.md).

Não misturar os comandos do adaptador legado `.cinematic` com a estrutura direta do template precision sem adaptar a integração. Não basta trocar o texto de um vídeo da Sala214 para produzir qualquer cenário; o template fornece fontes, exemplos e QA reais para autoria.

## Adaptação fiel de uma referência

A edição 1.2.0 acrescenta análise offline de referência, transcrição no idioma original e estados visuais de olhos no próprio renderer. Veja [reprodução por referência](references/reference-reproduction.md) e [olhos e venda](references/character-eyes.md). A aparência 3D de um vídeo fornecido continua dependendo dos recursos reais: os presets atuais são 2.5D. Não é preciso trocar o motor aprovado nem contratar um serviço para testar a análise.

## Instalar

Copie esta pasta inteira para o diretório de skills do seu agente. Exemplos: `~/.agents/skills/cinematic-shorts/` no Codex ou `~/.claude/skills/cinematic-shorts/` no Claude Code. O nome da pasta deve continuar cinematic-shorts. Não copie somente SKILL.md.

Peça ao agente:

> Use $cinematic-shorts para criar um vídeo de suspense em português. Crie um projeto separado, preserve as vozes e o estilo aprovados e valide o arquivo final.

O núcleo e as instruções também permitem adaptar outros temas; o template pronto usa personagens 2D e modos de apartamento/transmissão. A biblioteca-fonte também inclui quarto, terraço, rua, escritório e outros cenários; cada extensão precisa ser ligada ao renderer e testada. Não há uma biblioteca pronta para todos os cenários, estilos ou formatos.

## Teste rápido, sem gerar voz nova

Pré-requisitos: Python 3.11+, Node/npm, FFmpeg/FFprobe e Chrome/Edge/Chromium. Ajuste CAMINHO-DA-SKILL:

```powershell
python -X utf8 CAMINHO-DA-SKILL/scripts/cinematic.py --project ./meu-video init
python -X utf8 CAMINHO-DA-SKILL/scripts/cinematic.py --project ./meu-video setup --install
python -X utf8 CAMINHO-DA-SKILL/scripts/cinematic.py --project ./meu-video doctor demo
python -X utf8 CAMINHO-DA-SKILL/scripts/cinematic.py --project ./meu-video build demo --max-new-frames 93
```

A primeira instalação de dependências precisa de internet e fica **somente no projeto**. Navegador ausente pode ser informado em init --browser ou baixado localmente com setup --download-browser. Python, Node e FFmpeg não são instalados no sistema por estes scripts. Veja [instalação detalhada](references/installation.md).

[Prévia do exemplo](assets/demo-preview.mp4).

A demo tem 3,1 s, 1080×1920/30 fps e duas falas reais em cache. Nenhuma chave ou conta de TTS é necessária para esse teste. Para checar o exemplo e a reutilização de cache, execute também `python -X utf8 CAMINHO-DA-SKILL/scripts/selftest.py --project ./meu-video`. O script informa o caminho do MP4. O exemplo é uma demonstração técnica, não um novo episódio completo.

## O pacote contém

- **SKILL.md:** instruções curtas para o agente, com referências carregadas sob demanda.
- **scripts/:** entrada portátil, compilação de clips alinhados, ASR local e adaptador Gemini opcional.
- **assets/runtime/:** engine, ferramentas de render/QA, perfis e WAVs de referência.
- **assets/demo/:** fonte Remotion, roteiro, alinhamento, clips e stems reais do exemplo.
- **assets/package.json e requirements*.txt:** dependências diretas fixadas, sem node_modules ou modelos enormes no ZIP.
- **references/:** operação, autoria, vozes, acabamento e arquitetura.
- **agents/openai.yaml:** descoberta e interface no Codex; outros agentes podem usar o SKILL.md.

A skill instalada permanece somente leitura. Cache, logs, vozes geradas, dependências, navegador e renderizações ficam em PROJETO/.cinematic/. O pacote não depende de caminhos pessoais do criador e não inclui chaves, configurações de conta ou o histórico de produção.

## Vozes inéditas

As referências são Fenrir, Charon, Kore, Orus e Sadaltager. Para gerar material novo, use áudio fornecido ou seu próprio provedor autorizado. O adaptador Gemini é opt-in, usa GEMINI_API_KEY no ambiente, limita chamadas e não muda modelo automaticamente. Pode haver custo e limites de conta; o pacote não fornece saldo/créditos.

ASR novo exige instalar opcionalmente faster-whisper e fornecer um modelo local. Não há download automático de modelo. Veja [vozes e alinhamento](references/voices.md). A ferramenta de compilação monta timeline/legendas/envelopes a partir de clips realmente alinhados; não inventa timestamps ou acelera a interpretação.

## Qualidade e testes

O build verifica o MP4 real: frames, duração, resolução, áudio 48 kHz, decode integral, cópia do vídeo no mux, loudness/pico/clipping/descontinuidades e limites das legendas no navegador. O modo avançado de boca é opcional e aproximado; RMS continua padrão. Conferência de emoção/timbre e revisão visual não são substituídas por métricas.

O pacote foi exercitado no Windows, em projeto separado com espaços/acentos, usando dependências já instaladas e sem chamada real nova de TTS. A instalação limpa de dependências pela internet e outras plataformas não foram certificadas nesta sessão. A primeira instalação resolve transitivas e gera o lockfile do projeto; guarde-o. Os testes e limites estão em VALIDATION.md.

## Origem e publicação

O repositório [claude-shorts-roblox](https://github.com/celticmatheus/claude-shorts-roblox) foi consultado como referência de distribuição de uma skill. Ele usa Canvas; aqui usamos Remotion com o método de produção/QA desenvolvido neste workspace. Não foi executada uma comparação de qualidade entre os dois, e nenhum arquivo daquele repositório foi copiado.

O motor visual veio do projeto fornecido pelo usuário e foi adaptado. Não foi presumida uma licença MIT global para esse conteúdo herdado. As dependências mantêm suas próprias licenças, inclusive a [licença do Remotion](https://www.remotion.dev/docs/licensing). Consulte NOTICE.md para a proveniência; a disponibilidade pública não substitui as licenças aplicáveis a cada componente.

Prévia local dos presets: [abrir catálogo de olhos](assets/eye-presets.html). Abra o HTML no navegador; não depende de API.
