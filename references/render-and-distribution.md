# Render rápido e distribuição sem degradação

PNG permanece padrão de qualidade. Antes de mudar formato, concorrência ou GPU, medir o mesmo trecho de risco, resolução/fps/CRF, condições de cache e navegador. Registrar tempo, pico de memória e resultado; repetir só quando necessário para separar ruído de ganho. Concorrência excessiva pode piorar desempenho ou causar falha. Não prometer ganhos de percentuais sem medir.

JPEG95 altera pixels. PSNR44dB não prova invisibilidade; exigir comparação visual pertinente e preservar PNG quando qualidade máxima for prioridade. Diminuir CRF tende a aumentar qualidade e tamanho, não degradar; aumentá-lo pode perder detalhe. Reduzir fps, resolução ou interpolar upscale não é acelerar sem perdas.

Economias preferidas: reutilizar take/ASR/stems, cache com hash correto, renderizar apenas planos alterados, bundle/browser reaproveitados, prévias em meia resolução e um final nativo. Código global invalida todos os planos afetados. Alterar filtros, grain, blur ou blend só após demonstrar equivalência pertinente; não remover acabamento por palpite.

Patch de trecho precisa de timestamps, GOP, frames e áudio corretos. Concatenação por stream copy exige compatibilidade de codec/timebase; corte em keyframe não garante posição arbitrária. Não trocar quadro por frame anterior nem desalinhar áudio para facilitar emenda. Validar junções e decode completo.

## Pacote pequeno

Guardar fontes e manifestos em Git; mídias completas na release versionada, sem node_modules, modelos ASR, caches, logs, chaves ou múltiplos intermediários. `assets/precision/media.json` fixa URL, bytes e SHA256; `scripts/precision.py init --download-media` é download explícito do GitHub, não chamada de TTS.

Os MP4s de referência são copiados byte a byte e empacotados em ZIP. WAV PCM inteiro pode usar FLAC com conferência do PCM restaurado; WAV em ponto flutuante permanece original. ZIP não promete grande redução em vídeo já comprimido. Não chamar um novo H.264/HEVC com perda de “sem perdas”. A edição 1.3.0 reduziu o pacote de mídias, não a qualidade nem a resolução dos vídeos.

Não apagar entregas para reduzir o Git. Se arquivo grande já entrou no histórico, removê-lo do último commit não elimina o histórico; reescrever histórico exige autorização específica. Aqui a mídia grande entra diretamente em release.
