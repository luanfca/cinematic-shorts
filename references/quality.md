# Acabamento e validação

Use stems independentes e cues locais em sound.json. Ganho: `{stem:"music",start:12,end:14,gainDB:-3,fadeMs:30}`. Efeito WAV local: `{type:"effect",stem:"sfx",asset:"audio/effects/hit.wav",start:12,end:12.4,gainDB:-6,fadeMs:12}` (nos arquivos reais, use JSON válido com todas as chaves entre aspas).

`future mix EPISODIO` aplica e vincula a receita; sem alteração, devolve a master existente. Mudanças de receita/assets invalidam o vínculo; SFX que encobre palavra é rejeitado. O ducking condicional é opcional, não um filtro global obrigatório. Preserve pausas dramáticas e graves intencionais. Não aplique de-essing/denoise sem defeito identificado.

MouthMode rms mantém articulação por energia. word-preview oferece cinco formatos por estimativa de letras/tempo de palavra e permite cues manuais alinhados. **Não é alinhamento fonético.** O preview cobre Lucas e o falso investigador; outros papéis seguem o comportamento original. Regere com `future mouth EPISODIO` depois de mudar palavras/envelopes/cues. Faça revisão visual antes de adotar.

O build verifica o MP4 real: decode integral, frames, duração, 1080×1920/30 fps, áudio 48 kHz, cópia exata do stream de vídeo no mux, loudness/pico/clipping/descontinuidades e medidas reais de legendas no navegador. A referência é próxima de −14 LUFS e −1,5 dBTP, com tolerância declarada no runtime para preservar a master de referência. Não nivele toda a dinâmica para perseguir décimos de dB.

Uma rodada final deve cobrir os trechos alterados, emendas, nomes/rostos antes de eventos narrativos relevantes, legendas, começo/fim e diálogos emocionais. Gere e inspecione amostras somente dentro do orçamento de imagens do usuário. Se não puder ver/escutar, registre isso; não confunda checks de sinal ou DOM com aprovação estética.

As fontes Arial/Consolas/Georgia não são distribuídas como binários. Outras plataformas podem usar substitutas; valide layout no sistema de destino ou adicione fontes locais com licença apropriada. O pacote não garante aparência pixel a pixel em qualquer computador.

Entregue MP4 e um relatório compacto com caminhos, métricas, alterações e pendências. Cache de QA só vale para o mesmo arquivo e versão dos verificadores. Mantenha um modelo de referência aprovado por série e não declare que uma nova renderização foi assistida por inteiro sem realmente verificá-la.
