---
name: cinematic-shorts
description: Produzir e refinar vídeos narrativos com Remotion, vozes consistentes, legendas alinhadas e validação do arquivo final. Use para criar shorts animados ou melhorar sua produção; não para apenas assistir, resumir ou transcrever um vídeo.
---
# Cinematic Shorts

Use o motor e os assets desta pasta para trabalhar em um projeto separado. A skill contém código, referências de voz e um exemplo real; a instalação não garante direção cinematográfica ou interpretações novas automaticamente.

## Começar com pouco contexto

1. Preserve formato, idioma, duração e estilo pedidos. O perfil pronto é vertical 1080×1920/30 fps, áudio 48 kHz; outro formato exige adaptação e testes, não alteração silenciosa do pedido.
2. Leia o CONTEXT.md e execute plan se o projeto já existir. Para um projeto novo, siga [references/installation.md](references/installation.md). Todos os novos arquivos ficam no projeto; os recursos da skill são somente leitura.
3. Escreva a história e a direção reais. O exemplo é uma base, não um episódio novo. Use [references/authoring.md](references/authoring.md) para script, cenas, câmera e atuação; adapte os cenários quando a história exigir.
4. Reutilize vozes e renders compatíveis. Para falas inéditas, leia [references/voices.md](references/voices.md): use um provedor autorizado na sessão ou áudio fornecido. A chave configurada não autoriza cobranças por si só. O adaptador online é explícito; renderização nunca chama TTS.
5. Compile clips realmente alinhados, ajuste o som e execute o plano com um limite coerente de quadros. Comandos e schemas estão nas referências; execute os scripts em vez de reescrever a infraestrutura.
6. Valide o arquivo entregue e reveja momentos-chave conforme [references/quality.md](references/quality.md). Informe o vídeo, evidências e limites da inspeção. Não declare escuta, aprovação estética ou sincronismo fonético sem verificá-los.

## Invariantes de qualidade

- Preserve identidade, intenção e vozes aprovadas. O pacote traz cinco perfis; não troque modelo/voz automaticamente para economizar ou contornar quota.
- Não corte diretamente nos timestamps ASR: preserve margens, respirações e fonemas. Safe-cut recusa bordas sem intervalo quieto. Não force encaixes por pitch ou velocidade.
- Mantenha voz, música, SFX e ambiente separados. Aplique correções locais justificadas; não nivele suspense ou trate todo transiente como erro. Mudança só sonora deve copiar o vídeo.
- Boca RMS é o padrão. Word-preview é aproximação por palavras/letras, opcional; não é alinhamento fonético certificado.
- Cache só vale com identidade e hash corretos. Código/assets globais podem invalidar vários planos; não reutilize uma fala para um texto alterado.
- Respeite limites de imagens, serviços e credenciais da tarefa. Não publique arquivos ou instale dependências globais por causa desta skill.

## Entrega

Entregue MP4 reproduzível e um relatório curto com verificações reais. Consulte [references/architecture.md](references/architecture.md) apenas para trocar série, formato ou componentes. O exemplo completo permite um teste offline após instalar as dependências; vozes inéditas podem exigir conta, quota e custo próprios.
