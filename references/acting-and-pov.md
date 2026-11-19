# Atuação, braços e câmera — implementação executável

`assets/precision` contém fontes completas da Sala 214 Parte 2 com a correção precision: personagem, sala com projeção/oclusão, mão POV, celular, luz, legendas e módulos usados efetivamente pela cena. Não é apenas pseudocódigo. Copiar via `scripts/precision.py` para um projeto; depois ler exports e dados reais antes de adaptar. O template genérico antigo continua disponível para outras composições.

## Módulos e chamada real

- CharacterActingSystem: createActingTrack/reactionAt e applyPerformance/performancePhases. emotion.ts aplica fases aos parâmetros que Character desenha. PrecisionPlan separa eventos do episódio do mecanismo reutilizável.
- Character: characterArms compartilha o solver real com characterLandmarks. Verificar ombro→cotovelo→pulso, lado do braço, limites de alcance, rig conectado, ordem das camadas e objetos vinculados à mão. Não remendar mão solta em coordenadas de tela para esconder braço inválido.
- POVCinematicDirector: localAttention, interpolatePOV e lowerHeldObject, usados por pov/Phone. Estado base fora de janelas permanece igual; gesto corporal, apoio e câmera compartilham o tempo.
- ActingQualityValidator: rosto/olhos/landmarks com transformações reais, oclusores móveis e mobiliário; amplitude facial/corporal, ordem de reação e saltos. check.cjs usa todos os quadros relevantes; regression_precision.cjs compara os 1.587 quadros fora das janelas com a fonte anterior.

## Direção

Percepção precede olhos, sobrancelhas, corpo e fala; depois existe resíduo. Os offsets pertencem à ação, não são delay fixo universal. Choque não significa corpo imóvel por vários segundos. Evitar grip saturado, tremor uniforme, sobrancelha fixa e boca como única animação. Distribuir atuação em respiração, olhar, ombro, pescoço, apoio e mãos, com intenção.

Enquadrar o interlocutor antes da fala importante. Leitura de telefone pede duração legível, descida contínua, tremor discreto e rosto liberado a tempo; contar o telefone como oclusor. Verificar pés de carteira, paredes e mãos apoiadas na trajetória POV. Uma câmera suave que atravessa móveis falha.

As máscaras precisam refletir o render: translação, shear, head tilt, respiração, perspectiva e objetos de primeiro plano. Não validar apenas centro ou bounding box estático. Testes negativos devem rejeitar rosto oculto, atuação congelada, reação invertida e saltos.

## Correção cirúrgica

Backup + hashes; definir janelas, falas e estados protegidos; gerar somente as prévias solicitadas; conferir antes do final; guardar comparação e medir o MP4 entregue. Alteração visual reutiliza AAC aprovado por stream copy quando compatível. Distinguir igualdade da fonte de igualdade de pixels após H.264. Novos roteiros exigem adaptar o mapa temporal, composição e testes: os segundos/2037 quadros do exemplo não são universais.

O exemplo mantém o estilo 2.5D. Métricas não certificam emoção humana, anatomia perfeita nem sincronismo fonético. Verificar movimento além de quadros estáticos dentro do orçamento visual vigente.
