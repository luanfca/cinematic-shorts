# Notas de atualização

## 1.3.0 — 19/11/2026

### Atuação e motor 2.5D

- Fontes completas do caso Sala 214 Parte2 precision: sala espacial, máscaras, personagem, mãos POV, celular, iluminação, expressões, legendas e votação.
- CharacterActingSystem com fases de percepção, olhos, sobrancelhas, corpo, fala e residual, pressão das mãos e gesto de parada; chamadas reais a partir de emotion/Character.
- POVCinematicDirector com atenção local e descida contínua de objetos, câmera coordenada com apoio/levantar e geometria dos móveis.
- ActingQualityValidator com landmarks transformados e telefone como oclusor; testes negativos e regressão dos 1.587 quadros fora das janelas corrigidas. Braços do QA e do desenho compartilham solver.

### Direção e qualidade

- Regras de retenção atualizadas: ação desde frame0, extraordinário até3s, curiosidade até6s, progressão significativa, duração preferencial35–60s/teto90s; preservação de abertura aprovada em revisão local.
- Direção `<Medo>`, `<Desconfiança>` e outras intenções separadas do texto falado; interpretação por personagem e transição emocional, sem tags pronunciadas nem TTS acelerado.
- Continuidade de séries e cliffhangers, identidade e olhos especiais preservados, proteção contra teletransporte de personagem/objeto, braço solto e câmera atravessando cenário.
- Economia por cache/takes agrupados, fila única e autorização por teto incluindo erros. Modelos legados identificados como configuração histórica, não disponibilidade garantida. Sem repetição automática de429.
- Ledger persistente por autorização e lock de fila; reiniciar comando não reinicia cota local. Dialetos generateContent e Interactions explícitos, sem fallback; 16 verificações offline do transporte/cache/teto.
- Otimização de render por medição; PNG permanece padrão. JPEG95 corretamente identificado como compressão com perdas; redução de CRF não é redução de qualidade.

### Transferência e distribuição

- Inicializador portátil `scripts/precision.py` com download GitHub explícito ou pacote offline, checksum e restauração de áudio verificada.
- `CLAUDE.md`, instruções de continuidade e fonte anterior para regressão no projeto inicializado; sem depender do chat, paths pessoais ou credenciais do criador.
- Mídias completas separadas como asset de release, fora do histórico Git. Pacote 31,2% menor: MP4s byte a byte preservados; FLAC apenas para PCM inteiro, WAV float mantido original.
- `qa_precision.py` testa MP4 real, timestamps, decode, formato, loudness/true peak e identidade AAC/PCM.

### Consolidação da edição1.2 ainda não publicada

- Presets Sharingan, Byakugan, Rinnegan, branco sem íris, óculos/venda; análise offline de referência e idioma de ASR configurável. Permanecem no renderer, scripts e referências.

### Limites

Sem novas chamadas de voz nesta atualização. Mídias demonstram a produção existente, não um novo episódio criado pela instalação. Ver VALIDATION.md para evidências atuais, testes anteriores e o que não foi certificado. A skill não garante resultado criativo idêntico entre agentes nem substitui dependências, acesso ao provedor ou revisão humana.
