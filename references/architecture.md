# Arquitetura e portabilidade

A pasta da skill Ã© somente leitura. scripts/cinematic.py copia assets/runtime e assets/demo para PROJETO/.cinematic; dependÃªncias, cache, logs, modelos e mÃ­dias ficam no projeto. Caminhos de navegador/bibliotecas sÃ£o detectados/configurados ali, nÃ£o embutidos na distribuiÃ§Ã£o.

O nÃºcleo orquestra cache, render, Ã¡udio e QA; o adaptador visual fica em episodes/<id>/studio/src. O Ãºnico adaptador incluÃ­do Ã© cinematogrÃ¡fico 2D/SVG com apartamento, personagens e transmissÃ£o. Outros temas reutilizam o nÃºcleo, mas podem exigir outro elenco, cenÃ¡rio e direÃ§Ã£o. Isso nÃ£o Ã© uma biblioteca completa de todas as sÃ©ries.

Nomes de arquivos como caderno2, modos como write-daniel e IDs de papÃ©is sÃ£o detalhes internos do adaptador herdado. Os nomes/textos de tela sÃ£o dados configurÃ¡veis; o exemplo pÃºblico foi neutralizado. Formatos alÃ©m de vertical 1080Ã—1920/30 fps exigem mudar o contrato, o renderer/QA e os componentes pertinentes.

Os intermediÃ¡rios de plano usam PNGâ†’FFV1/RGB sem perdas. A entrega H.264/CRF 17 Ã© codificada uma vez a partir deles; mudanÃ§a sÃ³ sonora copia o vÃ­deo. Guardar intermediÃ¡rios usa disco. Na primeira renderizaÃ§Ã£o fria, os planos precisam ser produzidos; a skill nÃ£o evita a computaÃ§Ã£o inicial.

A identidade das vozes editadas inclui texto, estilo, papel, voz/modelo e hash do arquivo. A master Ã© vinculada Ã  timeline/vozes/palavras. Dados locais de direÃ§Ã£o/atuaÃ§Ã£o/envelope afetam seus planos; cÃ³digo/assets globais invalidam conservadoramente. NÃ£o reutilize cache por nome de arquivo apenas.

O exemplo empacotado tem vozes reais jÃ¡ produzidas, mas nÃ£o credenciais. A nova produÃ§Ã£o depende de arquivos do usuÃ¡rio ou de um provedor autorizado e de ASR/alinhamento real. A skill descreve como usar o mÃ©todo; nÃ£o garante que todo agente ou toda histÃ³ria alcance a mesma qualidade criativa do vÃ­deo de referÃªncia.

Origem: engine desenvolvida neste workspace e motor visual fornecido pelo usuÃ¡rio, adaptado ao fluxo. O repositÃ³rio claude-shorts-roblox foi consultado como exemplo de embalagem de uma skill; nenhum arquivo dele foi incorporado. Remotion e dependÃªncias mantÃªm licenÃ§as prÃ³prias. Veja NOTICE.md antes de escolher uma licenÃ§a global de publicaÃ§Ã£o.
