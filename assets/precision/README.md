# Sala 214 — referência executável 2.5D

Inicialize esta pasta pelo scripts/precision.py da skill, em diretório separado, com mídias locais ou download GitHub explícito. Fontes não dependem do workspace original. Mídias completas ficam na release, fora do histórico Git. Sem elas, check de geometria funciona; render final recusa falta de áudio em vez de gerar voz automaticamente.

No projeto inicializado: npm install (local, apenas se necessário), npm run check, npm run preview:a, npm run preview:b, npm run render. Node/npm, Python e FFmpeg/FFprobe são pré-requisitos. O navegador bundled do Remotion precisa estar instalado localmente; primeira instalação pode exigir rede. Não instalar globalmente. Guardar package-lock.json do projeto.

render.cjs mantém PNG, 30fps, CRF17, 1080×1920, AAC aprovado copiado; concorrência padrão6 configurável por CINEMATIC_CONCURRENCY. O fonte visual é o mesmo da entrega precision; novo H.264 pode variar em pixels comprimidos. As amostras MP4 preservadas byte a byte ficam em samples.

O arquivo qa/precision-preflight.json é produzido por check.cjs; os testes existentes também são executados por npm run check. regression_precision compara os 1.587 quadros fora das janelas com backups/src-before e verifica hashes das fontes anteriores. É uma proteção desta revisão, não um validador universal de qualquer episódio.

Leia CLAUDE.md e PRECISION-RULES.md antes de adaptar. A edição não certifica instalação limpa em todas as plataformas nem qualidade humana automática.
