# Contrato de produção

Leia antes de criar uma história nova. O resultado desejado é o motor cinematográfico da skill em uma história própria, não só um arquivo tecnicamente 1080p.

## Motor visual

1. Descubra os módulos reais em assets/demo/studio/src/engine: rig.tsx, light.tsx, room.tsx, furnish.tsx, props.tsx, npc.tsx e sets/. A biblioteca inclui fontes para bedroom, rooftop, street, study, classroom, kitchen e outros. Confira exports/props antes de usar.
2. O adaptador de exemplo liga apartamento/transmissão. Os demais cenários não são modos automaticamente suportados pelo compilador. Instancie e adapte os componentes no episódio; atualize renderer, composição, timeline e verificadores quando necessário.
3. Reutilize Actor/basePose ou o rig conectado pertinente, câmera, materiais e luz. SVG é usado pelo motor; a proibição é trocar esse sistema por desenhos independentes simplificados e chamar isso de mesma qualidade. Uma extensão SVG coerente sobre o motor é válida.
4. Registre em production-plan.json cada plano, ação, emoção, enquadramento, fonte do cenário e componente. Esse plano é documentação de autoria; não passe seus campos ao compilador sem verificar o schema.

## Abertura autônoma — sempre

Todo vídeo começa apresentando o que é a história: pergunta “E se...?”, regra ou condição principal e contexto mínimo. Só depois vem o conflito. Em séries, mostre o número da parte. Não dependa de o público ter visto a parte anterior e não faça recapitulacão longa.

## Takes agrupados

O fluxo antigo future voice-pack cria pedidos por fala. Não envie esse pack inteiro sem avaliar o número de chamadas. Para geração nova, prefira scripts/grouped_voice_pack.py, que agrupa por personagem/voz/modelo e mantém a direção de cada trecho. Não existe modelo automaticamente melhor ou mais barato em todas as contas.

Exemplo offline, com caminhos reais substituídos pelo agente:

    python CAMINHO-DA-SKILL/scripts/grouped_voice_pack.py --project PROJETO --script PROJETO/.cinematic/episodes/episodio1/script.json --output PROJETO/.cinematic/episodes/episodio1/state/grouped-requests.json

O parâmetro --model é uma mudança explícita de modelo, não um fallback. --max-chars é um limite editorial configurável de tamanho do take; não anuncia o limite real do provedor. O utilitário não chama API. O formato gerado é aceito pelo adaptador gemini_tts.py. lineIds preserva a relação take→falas para o alinhamento posterior.

Depois de autorizar provedor e teto, gere em uma única fila. O adaptador para na primeira falha e limita chamadas; para uma cadência específica, passe um único pedido por execução controlada e mantenha espera entre pedidos. Não lance execuções concorrentes. Depois de 429, pare e diagnostique o limite disponível; aumentar repetições ou trocar de chave não resolve legitimamente uma cota diária.

Alinhe a take inteira antes de recortar. Preserve nomes, últimas palavras e caudas. A anotação ASR pode terminar antes do fonema real; o safe-cut não certifica a palavra apenas por encontrar silêncio. Quando uma borda for recusada, mantenha a fonte e revise em contexto. Não contorne a recusa cortando cegamente no timestamp.

## Critérios de entrega

Antes do render completo, revise animação dos planos arriscados e atuação dentro do limite de imagens autorizado. Depois, confira o MP4 real e seus tempos, áudio, captions e continuidade. Registre separadamente o que foi medido, visto e ouvido. ASR e loudness não avaliam emoção nem garantem ausência de metalização. Se não houver escuta disponível, o resultado pode ser entregue para revisão humana, mas não como aprovado perceptivamente.

Problema de cota não impede preparar cenas, roteiro e código independentes. Não use isso para anunciar um vídeo completo que ainda não existe. A qualidade artística depende da execução e da revisão; este contrato não é garantia de resultado 100% automático.
