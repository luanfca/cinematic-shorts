# Regras permanentes integradas

## Implementação em uso

- CharacterActingSystem.applyPerformance/performancePhases recebe eventos temporais reutilizáveis; emotionAt aplica o resultado ao personagem real. PrecisionPlan mantém somente as decisões deste episódio.
- Character.characterArms é compartilhado pela renderização e pelos landmarks de validação. characterLandmarks inclui inclinação, respiração, pescoço e rotação de cabeça. Pressão das mãos e gesto de parada afetam os desenhos reais.
- POVCinematicDirector.localAttention aplica trajetórias somente dentro da janela autoral, retornando à câmera anterior fora dela. lowerHeldObject governa a descida contínua de objetos.
- ActingQualityValidator verifica olhos e landmarks faciais contra móveis e telefone, ordem percepção/olhos/sobrancelhas/corpo/fala e saltos de câmera/objeto. Os testes incluem casos negativos, além de casos aprovados.

## Aplicação nas próximas cenas

1. Medir fala existente; planejar percepção antes da fala, sem mover o áudio para acomodar a atuação.
2. Enquadrar rosto e olhos antes da frase importante. Validar máscaras reais e objetos do primeiro plano, não apenas bounding boxes estáticas.
3. Não saturar a pressão das mãos durante todo o plano. Usar antecipação, respiração brevemente presa, ênfase e residual; evitar imobilidade permanente sob pretexto de choque.
4. Descer o celular continuamente antes da fala importante. Preservar mensagens durante leitura e verificar o objeto totalmente fora do quadro antes de ocultá-lo.
5. Planejar deslocamento POV e apoio das mãos no mesmo espaço dos móveis. Um rosto sem obstrução não justifica atravessar uma carteira.
6. Em correção local, comparar SVGs reais em todos os quadros fora do escopo, preservar áudio por stream copy e conferir o MP4 efetivamente entregue.

## Limites dos testes

Os limiares deste episódio são 0,055 m/quadro para translação da câmera nas janelas, 100 px/quadro para telefone, margem facial de 24 px, distância mínima de olhos de 35 px e folga de pernas de carteira superior a 0,05 m. Não são leis universais: ajustar por escala/ação, mantendo testes e revisão visual.

Variação numérica não certifica emoção humana nem sincronismo fonético. A inspeção visual foi por quadros selecionados das duas prévias, com validação geométrica densa. Não alegar que o vídeo foi assistido ou ouvido integralmente.
