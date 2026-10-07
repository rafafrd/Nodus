# Validação de UI-03 — Dashboard Editorial

06/10/2026, Windows 11 10.0.26200, branch local codex/editorial-dashboard criada a partir de 80e0805. App 0.1.0/Electron 44.5.1; Node 24.19.0 do runtime local usado nos comandos. O Node no PATH inicial era 26.3.0; não se alterou configuração global. Nenhuma dependência, lockfile ou migration foi acrescentada.

## Comportamento

Tema Editorial quase preto, grid de 40 px, bordas finas, cantos de 2 px, títulos Georgia e interface Segoe UI/Consolas. Hoje é um dashboard com quatro indicadores reais, próximas tarefas, mesa retomável e cards de matérias. Mesa, PDF, Explorer, ajustes, revisão, grafo e moldura da cidade seguem a apresentação compacta. Cores originais do PDF/vídeo/cena permanecem. Oliva e o dashboard anterior ficam disponíveis; preferências de perfis existentes são preservadas.

O Explorer organiza pastas em principais/secundárias; cartões e árvore usam o catálogo real. Classificação é salva em preferences, com até 40 UUIDs distintos e transação/audit existentes. Abas são mantidas durante a vista geral e rascunhos continuam recuperáveis. Fontes Markdown e arquivos de projetos não são modificados por troca de tema/classificação.

## Execuções

| Comando | Resultado e escopo |
| --- | --- |
| `npm.cmd run typecheck` e `node node_modules/typescript/bin/tsc --noEmit` | aprovados na implementação; compilação inclui tema, catálogo e roteiro |
| `node node_modules/tsx/dist/cli.mjs --test tests/preferences.test.ts` | 4 testes aprovados: compatibilidade de perfil anterior sem regravar, classificação/restart, argumentos inválidos, rollback real de audit e verificações anteriores |
| `node node_modules/tsx/dist/cli.mjs --test tests/*.test.ts` | 39 testes aprovados; SQLite/vault/Markdown/projetos/foco/revisão/backups/anotações/economia/contratos reais |
| `node scripts/build.mjs` | aprovado; aviso não fatal de chunks grandes |
| `node node_modules/tsx/dist/cli.mjs scripts/preview-frontend.ts --stage=editorial-first --desk-only` | aprovado em Electron Windows; primeira captura da mesa inspecionada/compartilhada |
| `node node_modules/tsx/dist/cli.mjs scripts/smoke-editorial.ts --fixture=.local/frontend-preview-tD1YFW` | aprovado em Electron Windows: temas, Hoje, classificação, compacto, Markdown intacto e rascunho recuperado/salvo após restart; zero pageerror |
| `node node_modules/electron-builder/cli.js --win --dir` | aprovado no Windows x64, pacote local sem assinatura; avisos de autor/refs duplicadas não fatais |
| `node node_modules/tsx/dist/cli.mjs scripts/preview-frontend.ts --packaged --stage=editorial-final` | aprovado: ajuste PDF estável, Só caderno/Esc, fonte idêntica, grade/rodapé em 1040×760, foco 15 min, movimento reduzido, restart e perfil vazio |
| `node node_modules/tsx/dist/cli.mjs scripts/smoke-settings.ts` | aprovado: temas anteriores, PNG/JPEG, preferências/restart, editor/canvas conservados, redução de movimento, dados reais e negação de argumentos/sender |
| `node node_modules/tsx/dist/cli.mjs scripts/smoke-journey.ts` | R1–R7 aprovados: duas mesas/notas/PDFs/layouts/checklists/foco, reabertura e conflito externo. R8 externo não verificado |
| `node node_modules/tsx/dist/cli.mjs scripts/preview-frontend.ts --packaged --stage=editorial-release --desk-only` | aprovado na build final após ajuste do grafo/cidade; fixture isolada .local/frontend-preview-EmUMdW |
| `node node_modules/tsx/dist/cli.mjs scripts/smoke-editorial.ts --packaged --fixture=.local/frontend-preview-EmUMdW` | aprovado na build final: Hoje/mesa/PDF/catálogo/classificação/4 temas/revisão/grafo/cidade/compacto/restart/rascunho preservado; zero pageerror |
| `node node_modules/tsx/dist/cli.mjs scripts/smoke-knowledge-backup.ts` | aprovado na build final: grafo/relação/nó/câmera/abrir nota; 40 pulsos/upgrade/compras/noite; backup/restauração/relaunch reais e originais intactos |
| Comparação `@electron/asar.extractFile` com dist | 200 arquivos idênticos na build final, em .local/evidence/editorial-package.json |
| `node scripts/check-bootstrap.mjs` e `git diff --check` | consistência documental e diff aprovados; fechamento do quadro reconferido |

Inspeção de capturas encontrou canvas opaco no grafo ocultando grid; fundo passou a transparente somente em Editorial e desenho neutro, com preservação das paletas anteriores. Captura final editorial-graph.png inspecionada confirma o grid visível, e smoke-knowledge-backup aprovou seleção/câmera/relação/retomada no executável final. Ajuste registrado como O-015. Typecheck recompilado após a mudança. Testes de integridade do domínio não foram repetidos após alteração exclusiva de apresentação do canvas/CSS.

C1–C6 aprovados. Executável final: SHA256 349861839d77a4ebd5df356e87cf5e07e4df40d0b269c6a4b1ce11cb7be53581. ASAR: 471db19c93e7ed046697d60d1bb00614912aa5d40f7d455e30f46fa5d1e0dd90. Resultados finais em .local/evidence/editorial-results.json (packaged=true), editorial-package.json e knowledge-backup-results.json. Settings/journey e grade completa foram aprovados no pacote anterior desta mesma tarefa; após o ajuste de grafo/cidade, repetiram-se os roteiros que cobrem essas superfícies, sem alegar nova execução dos outros roteiros.

## Evidências e limites

Capturas reais em .local/evidence/editorial-*.png; frontend-editorial-first-desk.png é a primeira captura. Fixtures fictícias foram criadas por Store/Vault/Desks/Checklist/Study/Projects e exercitadas pelo IPC real. Não houve mock, inspeção nem modificação de perfil pessoal. Capturas, bancos e pacote são ignorados pelo Git.

Node no host divergente foi contornado usando o runtime 24 local. Provas externas da alpha continuam pendentes conforme seus tickets. Não houve commit, push, serviço, release publicado nem auditoria independente nesta tarefa; alterações salvas na branch solicitada. Diálogos nativos para adicionar pastas e a reprodução remota dos vídeos não fazem parte das novas provas. Avisos de tamanho de bundle/metadados da build permanecem; nenhum audit de dependências novo foi executado.
