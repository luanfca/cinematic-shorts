# Projeto completo — Sala 214 Parte 2 precision

Leia README.md, PRECISION-RULES.md, CONTEXT.md e as regras da skill. Esta é a fonte real do episódio 2.5D de 67,9 s, não apenas uma demonstração de instruções. Preserve composição, vozes, identidade e áudio aprovados ao corrigir; história nova exige autoria, não reapresentar este vídeo como novo.

Os sistemas CharacterActingSystem, POVCinematicDirector e ActingQualityValidator já estão integrados ao personagem, câmera e telefone. Não criar outro rig simplificado para evitar entendê-los. Antes de alterar: ler Character, Classroom, WorldHands, emotion, pov, Phone, PrecisionPlan e os JSONs de fala. Preservar máscaras e mão→objeto; validar rostos com suas transformações reais.

Mudança só visual não gera voz. approved-audio.m4a é o AAC aprovado, copiado sem nova compressão no final. Os takes e misturas em public permanecem para edição; não usar rascunho/part2-raw como se fosse a mix final. A mix aprovada deste caso está no AAC, não em nome de WAV presumido. Modelos/vozes usados no cache estão em voices.json, sem autorização implícita para nova API.

Primeira execução: instalar dependências somente no projeto se faltarem; npm run check; npm run preview:a e npm run preview:b; npm run render. Usar Chrome Headless Shell do Remotion já instalado. Se não existir, baixar localmente de forma explícita; não depender de caminho pessoal do criador. FFMPEG/FFPROBE podem indicar executáveis locais. Preservar limites de imagens do usuário, registrar inspeção real, não declarar escuta/visão integral sem realizá-las.

Os testes e tempos atuais pertencem à revisão precision. Para continuação, criar novo episódio e adaptar testes ao novo espaço/timeline, mantendo a fonte aprovada e cânone. Atualizar CONTEXT.md, SERIES.json e contrato. Em série, não supor o conteúdo da Parte1 se não foi fornecido.
