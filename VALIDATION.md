# Revisão 1.1.0 — testes desta edição

- Contrato obrigatório para preservar o motor, adaptar cenas e abrir cada vídeo com premissa e contexto; parte visível em séries.
- grouped_voice_pack.py: três falas de dois papéis viraram dois pedidos; preservação de direção por frase, overrides explícitos, nomes únicos de takes, chave estável e invalidação seletiva testados.
- Adaptador exercitado com WAV sintético e transporte simulado: duas chamadas simuladas, zero na repetição, opt-in obrigatório. Nenhuma API real foi chamada. Isso valida integração/cache, não qualidade de novas vozes nem disponibilidade de modelos.
- Demo real executada novamente no Windows: 93 quadros, 3,1 s, 1080×1920/30 fps; build e QA passaram, segunda execução sem quadros novos e com QA em cache. Não houve escuta integral nem avaliação artística da demo nesta revisão.
- Validador oficial de formato executado com Python em UTF-8: PASS. O modo de codificação padrão do Windows falhou ao ler pontuação UTF-8; o arquivo não estava corrompido.
- Não foi produzido um novo curta de um minuto nesta revisão; não foi certificada uma instalação limpa em outro computador.

## Histórico anterior do pacote (não repetido integralmente nesta revisão)

# Validação do pacote

Ambiente: Windows, Python 3.12, Node 26.3.1, NumPy 2.3.5, Remotion 4.0.530, React 19.0.0 e Playwright 1.61.1. As bibliotecas existentes foram referenciadas explicitamente para testar a portabilidade sem instalar globalmente nem consultar um provedor de voz.

| Verificação | Resultado |
|---|---|
| Formato de skill | Validador oficial skill-creator: PASS |
| Projeto separado com espaços/acentos | Init, doctor, render e QA executados: PASS |
| ZIP extraído em outra pasta | Skill executada a partir da nova localização: PASS |
| Demo com mídia real | 3,1 s, 93 quadros, 1080×1920/30 fps, áudio 48 kHz: PASS |
| Repetição | Zero novos quadros, zero TTS e QA em cache: PASS |
| Compilador | Preservou master ao recompilar clips idênticos; outra edição de 161 quadros/5,3667 s foi montada e renderizada: PASS |
| ASR local real | Reconheceu cinco palavras na master compilada: “Funcionou. Eu sabia. Eu sabia.” |
| Adaptador Gemini | Opt-in, chave por conteúdo, cache e parada em HTTP 429 testados com transporte simulado: PASS |
| Credenciais | Nenhuma chave real, material privado de chave ou caminho pessoal do criador encontrado nos arquivos de distribuição |
| Recursos instalados | Arquivos fonte permaneceram inalterados durante init/compile/render |
| Referência anterior | 244 arquivos da Parte 2 preservados por hash |

Foram consolidados **10 grupos de verificação funcionais**, além da validação de formato e da integridade do ZIP. A engine que originou este pacote também possui seus testes anteriores, mas eles não são apresentados como teste de instalação em outro sistema.

## Limites reais

- A instalação limpa por npm/pip com internet **não foi executada**. Uma tentativa de validar resolução de lockfile apenas pelo cache local retornou ENOTCACHED; o lockfile não validado foi excluído da distribuição. O destinatário instala as dependências diretas fixadas e gera seu lockfile de projeto.
- Linux/macOS não foram executados nesta sessão. O código não traz caminhos pessoais fixos e contempla localização de navegador, mas isso não certifica todos os sistemas.
- Nenhuma nova chamada real ao Gemini foi feita. O adaptador usa o protocolo da produção anterior, com testes locais de falha/cache; conta, quota e custo pertencem ao destinatário.
- Um modelo Whisper local já disponível foi usado no teste. Modelos ASR e node_modules não são distribuídos.
- Não houve análise de novas imagens nem escuta humana completa. O QA é técnico; interpretação, aparência de cenas inéditas e timbre continuam sujeitos a revisão.
- O modo de boca por palavras é aproximado, opcional, e não constitui alinhamento fonético certificado. O padrão da demo é RMS.

O pacote é instalável como pasta de skill e contém um exemplo executável. Isso fornece o método e a infraestrutura, não uma garantia de que qualquer roteiro, agente ou computador produzirá automaticamente um filme da mesma qualidade criativa.
