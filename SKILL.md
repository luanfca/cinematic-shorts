---
name: cinematic-shorts
description: Produzir e refinar curtas narrativos com Remotion, vozes consistentes e QA, inclusive adaptar episódios a partir de vídeo de referência. Use para execução de animação ou reconstrução dirigida; não apenas para assistir ou resumir um vídeo.
---
# Cinematic Shorts

Trabalhe em um projeto separado, com os recursos desta pasta somente em leitura. A instalação fornece motor, método e demonstração; aparência, interpretação e fidelidade de uma cena inédita exigem autoria e revisão.

## Escolher o modo do pedido

- **História nova ou continuação:** ler [production-contract.md](references/production-contract.md), preservar cânone e estilo aprovados, abrir com premissa e contexto integrados à ação.
- **Qualidade de atuação/POV ou correção local:** ler [acting-and-pov.md](references/acting-and-pov.md). O exemplo completo em `assets/precision` contém o motor real da Sala 214, braços compartilhados com QA, reações graduais e câmera espacial. Inicializar fora da skill com `scripts/precision.py`; não substituir os personagens aprovados por desenhos simplificados.
- **Vídeo de referência:** ler [reference-reproduction.md](references/reference-reproduction.md). Inspecionar mídia/áudio antes de confiar no prompt derivado, mapear planos e preservar falantes, acontecimentos e final. A abertura original prevalece sobre a fórmula“E se...?”.
- **Olhos sobrenaturais/acessórios:** ler [character-eyes.md](references/character-eyes.md) somente quando pertinente. O renderer tem presets opcionais de Sharingan, Byakugan, Rinnegan, branco sem íris, óculos transparentes e venda; eles não convertem o motor em 3D.

Preserve o motor e a preferência visual escolhidos pelo usuário. Referência 3D não autoriza automaticamente trocar o 2.5D por Blender, fotografias ou outro serviço. Identifique o limite real do pipeline antes de prometer equivalência visual. Uma alternativa explicitamente pedida/aceita pode usar outro renderer, sem abandonar o enredo ou ocultar as limitações.

## Execução com contexto econômico

1. Ler CONTEXT.md e executar plan em projeto existente. Para começar, usar [installation.md](references/installation.md). Perfil pronto: 1080×1920/30fps,pt-BR/48kHz; adaptar quando o usuário pedir outro formato.
2. Escrever o roteiro e selecionar os componentes reais conforme [authoring.md](references/authoring.md). A demo é infraestrutura, não um episódio novo. Inspecionar schemas antes de estender; não inventar comandos ou campos.
3. Em referência, comparar transcrição, mapa de planos e fichas de personagens. Confirmar o primeiro plano, ações de risco e o último estado permitido antes de gerar mídia paga. `scripts/reference_audit.py` oferece metadados offline e amostras com orçamento explícito; não aprova estética.
4. Reutilizar takes compatíveis. Para falas inéditas, ler [voices.md](references/voices.md), agrupar por personagem/intenção com `scripts/grouped_voice_pack.py` e manter modelo/teto autorizados em fila única. Chave configurada não é autorização de gasto. Não repetir falhas de cota automaticamente.
5. Medir os WAVs reais antes de fechar a timeline. Preservar fonemas/caudas, velocidade e pitch; usar ASR local. `align --language auto` atende referência em outro idioma; `pt` continua o padrão de produção.
6. Fazer prévias dos planos de maior risco dentro do lote de imagens vigente, corrigir e renderizar o episódio pedido. Ver [quality.md](references/quality.md). Separar o que foi medido, visto e ouvido; métricas não certificam atuação nem ausência de todos os artefatos.

## Invariantes de produção

- Para novos curtas do canal, aplicar [retention.md](references/retention.md): ação desde o frame 0, extraordinário legível até 3 s, curiosidade concreta até 6 s, progressão a cada 5–8 s; preferência 35–60 s, teto 90 s salvo pedido explícito diferente. A pergunta “E se...?” integra a ação, não a adia. Revisão cirúrgica preserva a abertura aprovada.
- Usar o motor conectado, cenários, luz e câmera; adaptar a arquitetura ao tema, sem apresentar uma sucessão de imagens ou demo como animação completa.
- Preservar identidade: cabelo, proporção, olhos, roupas por ocasião, vozes e objetos. Mudanças de identidade ocorrem apenas no estado narrativo definido. Cliffhanger não revela antecipadamente um resultado desconhecido.
- Não cortar pela borda ASR isolada. Safe-cut exige intervalo quieto e margens; recusa não deve ser contornada com corte cego. Não acelerar voz para cumprir uma estimativa textual.
- Stems separados: voz, música, ambiente e efeitos. Alteração só visual reutiliza voz; alteração só sonora preserva imagem quando compatível.
- Boca RMS/word-preview é aproximação, não sincronismo fonético certificado. Só o falante articula sua própria voz.
- Cache depende de identidade/hashes e versão dos verificadores. Código global pode invalidar vários planos.
- Respeitar permissões, orçamento e limites de imagens. Nenhuma instalação global, publicação ou chamada de provedor é implícita.
- Usar `<Medo>`, `<Desconfiança>` etc. como direção separada do texto falado, com intenção e gesto específicos. Não fazer o TTS pronunciar tags; veja [performance-and-continuity.md](references/performance-and-continuity.md).
- Em projeto existente, continuar de CONTEXT.md, contrato, SERIES.json e mídia aprovada; não reinstalar a skill nem reescrever o cânone por padrão. A transferência para Claude Code segue [claude-handoff.md](references/claude-handoff.md).
- Aceleração precisa de medição; PNG continua padrão. JPEG95 é alternativa com perda, não otimização sem perdas. Mídia grande vai em release com hash e restauração, sem duplicar no histórico Git; ver [render-and-distribution.md](references/render-and-distribution.md).

## Entrega

MP4 reproduzível, projeto, roteiro, SRT, áudio reutilizável e relatório compacto com caminhos, testes, chamadas/cache e limitações. Em reconstruções, incluir a cobertura da inspeção e as diferenças conhecidas para a referência. [architecture.md](references/architecture.md) explica mudanças de série/adaptador. Não garantir qualidade idêntica por instalar a skill.
