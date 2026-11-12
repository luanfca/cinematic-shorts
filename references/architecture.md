# Arquitetura e portabilidade

A pasta da skill é somente leitura. scripts/cinematic.py copia assets/runtime e assets/demo para PROJETO/.cinematic; dependências, cache, logs, modelos e mídias ficam no projeto. Caminhos de navegador/bibliotecas são detectados/configurados ali, não embutidos na distribuição.

O núcleo orquestra cache, render, áudio e QA; o adaptador visual fica em episodes/<id>/studio/src. O único adaptador incluído é cinematográfico 2D/SVG com apartamento, personagens e transmissão. Outros temas reutilizam o núcleo, mas podem exigir outro elenco, cenário e direção. Isso não é uma biblioteca completa de todas as séries.

Nomes de arquivos como caderno2, modos como write-daniel e IDs de papéis são detalhes internos do adaptador herdado. Os nomes/textos de tela são dados configuráveis; o exemplo público foi neutralizado. Formatos além de vertical 1080×1920/30 fps exigem mudar o contrato, o renderer/QA e os componentes pertinentes.

Os intermediários de plano usam PNG→FFV1/RGB sem perdas. A entrega H.264/CRF 17 é codificada uma vez a partir deles; mudança só sonora copia o vídeo. Guardar intermediários usa disco. Na primeira renderização fria, os planos precisam ser produzidos; a skill não evita a computação inicial.

A identidade das vozes editadas inclui texto, estilo, papel, voz/modelo e hash do arquivo. A master é vinculada à timeline/vozes/palavras. Dados locais de direção/atuação/envelope afetam seus planos; código/assets globais invalidam conservadoramente. Não reutilize cache por nome de arquivo apenas.

O exemplo empacotado tem vozes reais já produzidas, mas não credenciais. A nova produção depende de arquivos do usuário ou de um provedor autorizado e de ASR/alinhamento real. A skill descreve como usar o método; não garante que todo agente ou toda história alcance a mesma qualidade criativa do vídeo de referência.

Origem: engine desenvolvida neste workspace e motor visual fornecido pelo usuário, adaptado ao fluxo. O repositório claude-shorts-roblox foi consultado como exemplo de embalagem de uma skill; nenhum arquivo dele foi incorporado. Remotion e dependências mantêm licenças próprias. Veja NOTICE.md antes de escolher uma licença global de publicação.
