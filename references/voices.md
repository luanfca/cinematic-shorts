# Vozes, alinhamento e custos

Os cinco perfis em .cinematic/profiles/voices.json preservam Fenrir, Charon, Kore, Orus e Sadaltager, com idioma pt-BR, estilos e referÃªncias WAV reais. A produÃ§Ã£o de referÃªncia usou Gemini 3.8 Flash TTS, com overrides pontuais Flash-Lite. Isso nÃ£o garante disponibilidade, gratuidade, quota ou timbre perfeitamente idÃªntico em geraÃ§Ãµes futuras.

Comece com Ã¡udio fornecido/cache compatÃ­vel. Alterar sÃ³ imagem nÃ£o deve disparar voz. Para falas pendentes, leia primeiro [production-contract.md](production-contract.md). Prepare takes agrupados offline, preservando o modelo realmente escolhido:

```powershell
python -X utf8 CAMINHO-DA-SKILL/scripts/grouped_voice_pack.py --project PROJETO --script PROJETO/.cinematic/episodes/episodio1/script.json --output PROJETO/takes.json --api generate-content
```

Inspecione o pack, direÃ§Ã£o e teto. O comando legado `future voice-pack` separa por linha; nÃ£o Ã© o padrÃ£o econÃ´mico para uma nova produÃ§Ã£o. Agrupamento reduz solicitaÃ§Ãµes, mas nÃ£o garante reduzir caracteres faturados nem tempo de Ã¡udio. Somente apÃ³s autorizaÃ§Ã£o do provedor e custo:

```powershell
python -X utf8 CAMINHO-DA-SKILL/scripts/gemini_tts.py --project PROJETO --requests PROJETO/takes.json --online --max-calls 2 --budget-id episodio1-autorizacao1
```

Use a chave **GEMINI_API_KEY no ambiente**, nunca no prompt. O teto acima Ã© um exemplo, nÃ£o uma autorizaÃ§Ã£o automÃ¡tica. FaÃ§a ASR da take e recortes seguros antes de bind-voice.

Nada disso Ã© executado por init, render ou setup. O adaptador nÃ£o escreve chave/headers, usa cache por request e hash de Ã¡udio e para em erros/limite de chamadas; nÃ£o troca modelo nem repete indefinidamente. Pode haver cobranÃ§a no provedor. Os testes deste pacote usaram transporte simulado, nÃ£o uma nova chamada real; a forma da requisiÃ§Ã£o deriva da produÃ§Ã£o existente. NÃ£o deduza saldo/cota pela quantidade de vÃ­deos.

Para usar outro provedor, forneÃ§a o WAV e adapte os perfis conscientemente. NÃ£o chame uma voz offline diferente de equivalente ao Gemini aprovado.

## ASR local

### Teto persistente e protocolo explícito — edição1.3

`budget-id` identifica uma autorização, não uma tentativa. Manter o mesmo ID ao retomar; falhas também contam e reiniciar o comando não zera o ledger. Uma autorização nova pode ter outro ID, mas o agente não deve criá-lo para contornar o teto anterior. A fila usa lock local e libera ao terminar; em interrupção abrupta, verificar processo antes de remover lock obsoleto. Cache válido não gasta nova tentativa. Os ledgers ficam em `.cinematic/provider/gemini`, no projeto.

O pack CLI usa `generate-content`, compatível com a estrutura de requisição observada na produção Sala214. O transporte legado Interactions continua explícito por `--api interactions`; packs existentes mantêm identidade e protocolo. Não alternar protocolos como fallback após erro. Não presumir que um modelo legado funciona em ambos. A disponibilidade atual de modelos não foi testada com chamada real nesta edição: foram 16 verificações com transporte simulado. Chave, teto e provedor continuam exigindo autorização pertinente.

Instale opcionalmente as dependÃªncias de voz no projeto com pip `--target PROJETO/.cinematic/python -r PROJETO/requirements-voice.txt`. ForneÃ§a um modelo faster-whisper local, por exemplo o small apropriado ao ambiente. O modelo nÃ£o vai no ZIP e nÃ£o Ã© baixado automaticamente; um download separado requer rede e deve ficar no projeto/cache escolhido.

```powershell
python -X utf8 CAMINHO-DA-SKILL/scripts/cinematic.py --project PROJETO align --wav PROJETO/voz.wav --model CAMINHO-DO-MODELO-LOCAL --output PROJETO/palavras.json
python -X utf8 CAMINHO-DA-SKILL/scripts/cinematic.py --project PROJETO bind-voice episodio1 L01 PROJETO/voz.wav --words PROJETO/palavras.json
```

O WAV precisa ser PCM16 mono/48 kHz. Palavras sÃ£o uma lista `{w,s,e}` com segundos relativos ao clip; nÃ£o substitua alinhamento real por estimativas de leitura. O ASR tambÃ©m pode errar: confronte texto e articulaÃ§Ã£o, principalmente nomes e falas curtas.

Safe-cut Ã© opcional quando hÃ¡ recorte justificado de uma take maior:

```powershell
python -X utf8 CAMINHO-DA-SKILL/scripts/cinematic.py --project PROJETO future cut episodio1 --wav PROJETO/take.wav --words PROJETO/palavras.json --first 0 --last 8
```

Ele procura bordas quietas fora dos fonemas anotados, preserva margens e recusa recorte inseguro. NÃ£o corte somente porque o ASR marcou fim de palavra.

Auditoria por personagem compara margens, clipping, RMS de voz e bandas espectrais com referÃªncia. As diferenÃ§as sÃ£o avisos de revisÃ£o, nÃ£o prova de identidade nem motivo para aplicar EQ global. Escute antes de trocar uma interpretaÃ§Ã£o convincente.

## Idioma da referÃªncia

A produÃ§Ã£o mantÃ©m `pt` como padrÃ£o. Para transcrever Ã¡udio de referÃªncia em outro idioma, `align --language auto` detecta a lÃ­ngua; `--language en` fixa inglÃªs. O modelo permanece local e nÃ£o Ã© baixado pelo comando. A transcriÃ§Ã£o de origem deve preceder a adaptaÃ§Ã£o, para nÃ£o omitir condiÃ§Ãµes narrativas ou mudar quem revela uma informaÃ§Ã£o. Isso nÃ£o gera novas vozes.

Para direção com tags como <Medo> separadas da fala e preservação de cânone, ver [performance-and-continuity.md](performance-and-continuity.md). Não converter uma assinatura de agente em suposta cota gratuita de API.
