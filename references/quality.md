# Acabamento e validaÃ§Ã£o

Use stems independentes e cues locais em sound.json. Ganho: `{stem:"music",start:12,end:14,gainDB:-3,fadeMs:30}`. Efeito WAV local: `{type:"effect",stem:"sfx",asset:"audio/effects/hit.wav",start:12,end:12.4,gainDB:-6,fadeMs:12}` (nos arquivos reais, use JSON vÃ¡lido com todas as chaves entre aspas).

`future mix EPISODIO` aplica e vincula a receita; sem alteraÃ§Ã£o, devolve a master existente. MudanÃ§as de receita/assets invalidam o vÃ­nculo; SFX que encobre palavra Ã© rejeitado. O ducking condicional Ã© opcional, nÃ£o um filtro global obrigatÃ³rio. Preserve pausas dramÃ¡ticas e graves intencionais. NÃ£o aplique de-essing/denoise sem defeito identificado.

MouthMode rms mantÃ©m articulaÃ§Ã£o por energia. word-preview oferece cinco formatos por estimativa de letras/tempo de palavra e permite cues manuais alinhados. **NÃ£o Ã© alinhamento fonÃ©tico.** O preview cobre Lucas e o falso investigador; outros papÃ©is seguem o comportamento original. Regere com `future mouth EPISODIO` depois de mudar palavras/envelopes/cues. FaÃ§a revisÃ£o visual antes de adotar.

O build verifica o MP4 real: decode integral, frames, duraÃ§Ã£o, 1080Ã—1920/30 fps, Ã¡udio 48 kHz, cÃ³pia exata do stream de vÃ­deo no mux, loudness/pico/clipping/descontinuidades e medidas reais de legendas no navegador. A referÃªncia Ã© prÃ³xima de âˆ’14 LUFS e âˆ’1,5 dBTP, com tolerÃ¢ncia declarada no runtime para preservar a master de referÃªncia. NÃ£o nivele toda a dinÃ¢mica para perseguir dÃ©cimos de dB.

Uma rodada final deve cobrir os trechos alterados, emendas, nomes/rostos antes de eventos narrativos relevantes, legendas, comeÃ§o/fim e diÃ¡logos emocionais. Gere e inspecione amostras somente dentro do orÃ§amento de imagens do usuÃ¡rio. Se nÃ£o puder ver/escutar, registre isso; nÃ£o confunda checks de sinal ou DOM com aprovaÃ§Ã£o estÃ©tica.

As fontes Arial/Consolas/Georgia nÃ£o sÃ£o distribuÃ­das como binÃ¡rios. Outras plataformas podem usar substitutas; valide layout no sistema de destino ou adicione fontes locais com licenÃ§a apropriada. O pacote nÃ£o garante aparÃªncia pixel a pixel em qualquer computador.

Entregue MP4 e um relatÃ³rio compacto com caminhos, mÃ©tricas, alteraÃ§Ãµes e pendÃªncias. Cache de QA sÃ³ vale para o mesmo arquivo e versÃ£o dos verificadores. Mantenha um modelo de referÃªncia aprovado por sÃ©rie e nÃ£o declare que uma nova renderizaÃ§Ã£o foi assistida por inteiro sem realmente verificÃ¡-la.

## Fidelidade a uma referÃªncia

Separar QA tÃ©cnico de identidade, cronologia e atuaÃ§Ã£o. Conferir o enquadramento e o movimento, nÃ£o apenas um quadro bonito. Verificar estados de olhos, cores de figurino, contato das mÃ£os e o quadro anterior ao cliffhanger. Presets e checks estruturais SVG nÃ£o certificam aparÃªncia 3D nem equivalÃªncia ao original. As rotas e APIs de olhos estÃ£o em [character-eyes.md](character-eyes.md). A cobertura da inspeÃ§Ã£o deve constar no relatÃ³rio.

## Atuação e revisões locais

Aplicar [acting-and-pov.md](acting-and-pov.md): landmarks reais, telefone/móveis como oclusores, solver compartilhado com braços e corpo, fases antes da fala e testes negativos. Comparar todos os quadros fora do escopo em SVG e quantificar diferenças de compressão separadamente. Não certificar emoção apenas por amplitude numérica.
