# Instalação e primeiro teste

## Instalar a pasta da skill

Copie **a pasta cinematic-shorts inteira**, preservando scripts/, references/, assets/ e agents/. No Codex atual, a localização pessoal documentada é `~/.agents/skills/cinematic-shorts/`; no Claude Code, use `~/.claude/skills/cinematic-shorts/`. Outros clientes podem usar um diretório próprio. Recarregue a descoberta de skills quando necessário. Não basta copiar somente SKILL.md.

A instalação da skill e o projeto de produção são separados. A skill é somente leitura. A produção fica em uma pasta escolhida pelo usuário, com estado/cache em `.cinematic/`.

## Dependências

Python **3.11+** (testado: 3.12), Node.js/npm (testado: Node 26.3.1), FFmpeg/FFprobe no PATH e Chrome/Edge/Chromium. O FFmpeg precisa incluir libx264, FFV1 e AAC. O primeiro setup instala localmente Remotion/React/Playwright/TypeScript e NumPy. Não estão embutidos no ZIP. As versões diretas estão fixadas em assets/package.json e requirements.txt; a instalação cria seu package-lock.json para congelar as transitivas.

A instalação limpa das dependências pela internet não foi executada nesta sessão: os testes usaram bibliotecas locais existentes. Não trate o pacote como certificação para qualquer sistema operacional. O ambiente testado é Windows; os caminhos do pacote são relativos e o localizador contempla Windows/Linux/macOS.

## Criar o projeto

A partir de um diretório de trabalho **fora da skill instalada**, ajustando seu caminho:

```powershell
python -X utf8 CAMINHO-DA-SKILL/scripts/cinematic.py --project ./meu-video init
python -X utf8 CAMINHO-DA-SKILL/scripts/cinematic.py --project ./meu-video setup --install
```

`setup --install` requer internet para pacotes e instala somente no projeto: node_modules/ e .cinematic/python/. Não altera instalações globais. Python, Node e FFmpeg precisam estar disponíveis; o script não executa instaladores de sistema.

O navegador pode ser detectado automaticamente. Se faltar, use um executável instalado via `init --browser CAMINHO-DO-NAVEGADOR` ou solicite o download local depois do setup:

```powershell
python -X utf8 CAMINHO-DA-SKILL/scripts/cinematic.py --project ./meu-video setup --download-browser
```

O download fica em .cinematic/browsers/. Nenhum download ocorre em init ou build.

## Rodar o exemplo com vozes reais em cache

```powershell
python -X utf8 CAMINHO-DA-SKILL/scripts/cinematic.py --project ./meu-video doctor demo
python -X utf8 CAMINHO-DA-SKILL/scripts/cinematic.py --project ./meu-video plan demo
python -X utf8 CAMINHO-DA-SKILL/scripts/cinematic.py --project ./meu-video build demo --max-new-frames 93
```

O exemplo tem 3,1 s e duas falas completas; é um teste da infraestrutura, não um filme novo. Não exige chave de API, conta de voz ou geração nova. O build informa o caminho do MP4; repetir reutiliza cache.

Para desenvolvimento offline com dependências já existentes, init aceita `--node-modules CAMINHO-EXISTENTE`. Isso é uma referência local explícita, não symlink, instalação global ou dependência oculta distribuída no pacote. O destinatário normal usa setup para instalar suas próprias dependências.

Use uma pasta nova: init recusa sobrescrever um projeto já inicializado ou manifestos existentes. Nenhuma skill é instalada automaticamente no diretório pessoal por estes comandos.
