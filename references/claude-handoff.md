# Continuar no Claude Code

Transferir a pasta completa da skill, não apenas um superprompt. Ela inclui fontes, scripts, schemas, exemplos e notas. Não precisa copiar o histórico deste chat. Para continuar um episódio específico, entregar também o projeto ativo, áudio/takes, contratos, CONTEXT.md, cânone e revisão aprovada.

Instalação de skill no Claude Code: diretório do usuário `~/.claude/skills/cinematic-shorts/` ou projeto `.claude/skills/cinematic-shorts/`. Abra SKILL.md no destino e mantenha a skill somente leitura. Dependências e resultados ficam no projeto, não na instalação.

Para obter o exemplo completo:

    python CAMINHO-DA-SKILL/scripts/precision.py init --project ./sala214 --download-media

Com pacote offline, usar `--media-zip CAMINHO/cinematic-shorts-sala214-media-v1.3.0.zip`, sem `--download-media`. A mídia tem checksum fixo. O init restaura WAVs e AAC aprovado, vídeo de referência e as duas prévias; não gera voz. Instalar npm localmente somente se faltar, guardar lockfile, executar `npm run check`, prévias e render conforme README do projeto.

Prompt para transferência:

> Use a skill cinematic-shorts 1.3.0 completa desta pasta. Leia SKILL.md, references/production-contract.md, references/acting-and-pov.md e CLAUDE.md do projeto. Continue o projeto existente, sem reinstalar por padrão, preservando vozes, modelo, takes, rig 2.5D, luz, personagens, legenda e cânone aprovados. Leia os módulos reais e mantenha atuação progressiva e câmera coerente com móveis/mãos. Para nova história, autoria completa e plano de retenção; para correção, limite às janelas pedidas. Não faça voz/API sem autorização vigente. Faça prévias dos planos de risco, valide o MP4 final e registre o que foi medido, visto e ouvido. Não substitua o motor por slides, desenhos simplificados ou fotografias. Pedido atual: [DESCREVA A HISTÓRIA OU CORREÇÃO].

Os planos de assinatura de Codex, Claude Code e Gemini não são uma API compartilhada. O destinatário precisa de ferramentas locais compatíveis e de seu próprio acesso autorizado para fala nova; mídia em cache não exige provedor. IDs de modelo históricos são metadados, não garantia de disponibilidade atual. Não transferir .env, tokens ou credenciais. A skill não garante qualidade criativa idêntica entre agentes/máquinas; transfere a implementação, as referências e os critérios necessários para continuar.
