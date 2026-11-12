# Vozes, alinhamento e custos

Os cinco perfis em .cinematic/profiles/voices.json preservam Fenrir, Charon, Kore, Orus e Sadaltager, com idioma pt-BR, estilos e referências WAV reais. A produção de referência usou Gemini 3.8 Flash TTS, com overrides pontuais Flash-Lite. Isso não garante disponibilidade, gratuidade, quota ou timbre perfeitamente idêntico em gerações futuras.

Comece com áudio fornecido/cache compatível. Alterar só imagem não deve disparar voz. Para falas pendentes, leia primeiro [production-contract.md](production-contract.md). Prepare takes agrupados offline, preservando o modelo realmente escolhido:

```powershell
python -X utf8 CAMINHO-DA-SKILL/scripts/grouped_voice_pack.py --project PROJETO --script PROJETO/.cinematic/episodes/episodio1/script.json --output PROJETO/takes.json
```

Inspecione o pack, direção e teto. O comando legado `future voice-pack` separa por linha; não é o padrão econômico para uma nova produção. Agrupamento reduz solicitações, mas não garante reduzir caracteres faturados nem tempo de áudio. Somente após autorização do provedor e custo:

```powershell
python -X utf8 CAMINHO-DA-SKILL/scripts/gemini_tts.py --project PROJETO --requests PROJETO/takes.json --online --max-calls 2
```

Use a chave **GEMINI_API_KEY no ambiente**, nunca no prompt. O teto acima é um exemplo, não uma autorização automática. Faça ASR da take e recortes seguros antes de bind-voice.

Nada disso é executado por init, render ou setup. O adaptador não escreve chave/headers, usa cache por request e hash de áudio e para em erros/limite de chamadas; não troca modelo nem repete indefinidamente. Pode haver cobrança no provedor. Os testes deste pacote usaram transporte simulado, não uma nova chamada real; a forma da requisição deriva da produção existente. Não deduza saldo/cota pela quantidade de vídeos.

Para usar outro provedor, forneça o WAV e adapte os perfis conscientemente. Não chame uma voz offline diferente de equivalente ao Gemini aprovado.

## ASR local

Instale opcionalmente as dependências de voz no projeto com pip `--target PROJETO/.cinematic/python -r PROJETO/requirements-voice.txt`. Forneça um modelo faster-whisper local, por exemplo o small apropriado ao ambiente. O modelo não vai no ZIP e não é baixado automaticamente; um download separado requer rede e deve ficar no projeto/cache escolhido.

```powershell
python -X utf8 CAMINHO-DA-SKILL/scripts/cinematic.py --project PROJETO align --wav PROJETO/voz.wav --model CAMINHO-DO-MODELO-LOCAL --output PROJETO/palavras.json
python -X utf8 CAMINHO-DA-SKILL/scripts/cinematic.py --project PROJETO bind-voice episodio1 L01 PROJETO/voz.wav --words PROJETO/palavras.json
```

O WAV precisa ser PCM16 mono/48 kHz. Palavras são uma lista `{w,s,e}` com segundos relativos ao clip; não substitua alinhamento real por estimativas de leitura. O ASR também pode errar: confronte texto e articulação, principalmente nomes e falas curtas.

Safe-cut é opcional quando há recorte justificado de uma take maior:

```powershell
python -X utf8 CAMINHO-DA-SKILL/scripts/cinematic.py --project PROJETO future cut episodio1 --wav PROJETO/take.wav --words PROJETO/palavras.json --first 0 --last 8
```

Ele procura bordas quietas fora dos fonemas anotados, preserva margens e recusa recorte inseguro. Não corte somente porque o ASR marcou fim de palavra.

Auditoria por personagem compara margens, clipping, RMS de voz e bandas espectrais com referência. As diferenças são avisos de revisão, não prova de identidade nem motivo para aplicar EQ global. Escute antes de trocar uma interpretação convincente.
