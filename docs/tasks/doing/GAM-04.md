---
id: GAM-04
status: doing
outcome: em_andamento
depends_on: ["GAM-03","UI-04","NXT-01"]
criteria_count: 8
---

# GAM-04 — Produção profunda do observatório

## Objetivo e escolhas

Pedido de 07/10/2026: aprofundar o game com referência de design de progressão em Cookie Clicker, sem copiar conteúdo; nova branch, testes, commit/push e PR para main com capturas de demonstração. Respostas 1A/2A/3A/4A/5A: motor livre secundário, primeiro prestígio alvo em 3–7 dias de estudo de 30–60min/dia, sinais guardados sem expirar durante Foco, conectar sistemas reais e preparar contratos futuros, recompensar minutos efetivos/revisões com consistência sem modificar XP.

## Prompt e critérios

C1. Auditar sistemas reais e separar motor/conteúdo/configuração, com contratos tipados e números grandes serializáveis sem Infinity/NaN ou perda no saldo inteiro.
C2. Validar primeiro uma fatia de quatro famílias: custos geométricos, compras 1/10/100/MAX, efeitos, sinergias e breakdown; expandir depois para 16 famílias e catálogo declarativo de aproximadamente 300 melhorias.
C3. Ampliar conquistas normais/secretas com condições reais, índice derivado e descoberta progressiva; manter conquistas/IDs anteriores e não fingir missões/coleções/platinums implementados.
C4. Integrar minutos efetivos de Foco, revisões e minigames por fontes idempotentes, consistência e quatro builds; motor livre secundário e XP/fontes acadêmicas conservados.
C5. Eventos configuráveis/auditáveis guardados sem expirar; combos, retorno offline, liquidação anterior e prestígio opcional com permanentes; nenhuma perda de estudo no reset/migração.
C6. UI limpa com próximo objetivo, instalação/efeitos inspecionáveis, representação isométrica agregada por marcos e movimento reduzido; preservar skins e ferramentas existentes.
C7. Testes reais SQLite/migração/replay/rollback, simulador determinístico e relatório de balanceamento, typecheck e pacote/jornada Windows com capturas inspecionadas e compartilhadas aqui.
C8. Docs/ADR/quadro/retomada/validação atualizados, bootstrap/diff/segredos conferidos; commit/push e PR detalhado para main com Mermaid/badges e capturas de fixtures.

## Execução e retomada

Branch codex/deep-production criada de origin/main/b112df6 (PR10 integrado); árvore inicial limpa. Baseline43 testes/typecheck aprovados antes da implementação. Auditoria: cinco famílias/21 melhorias/27 conquistas/quatro permanentes, teto100, compras1/10; Game/ledger/SQLite autoritativos, offline/prestígio/builds/minigames existentes. Foco/revisão tinham registros reais sem recompensa econômica; missões/coleções/platinums não implementados.

Motor/configuração/conteúdo separados; fatia quatro famílias validada antes da expansão16/305/284. Schema6 migra saldo/ledger para TEXT, BigInt conserva unidades/decimal.js calcula taxas. Integrações reais de Foco/revisões/minigames, sinais guardados e prestígio implementados. C1–C7 aprovados em [DEEP_PRODUCTION](../../validation/DEEP_PRODUCTION.md):52testes/typecheck, pacote Windows/201assets idênticos, quatro roteiros incluindo três skins,1min real de Foco, compras100/MAX/combos/reset/permanente/restart e regressões Oficina/áreas/JourneyR1–R7. Capturas reais inspecionadas/retornadas,12imagens de fixture e3modelos sanitizados versionados. Simulação30/45/60min/dia:5,15/4,30/4,10dias até prestígio, sem motor/eventos/revisões/reset e sem duração humana medida. O-019/O-020 corrigidos/verificados.

Próxima ação: bootstrap/diff/stage seletivo/scan, commit/push e PR para main com prints/Mermaid/badges; concluir C8 e mover para done após verificar publicação. Nenhuma fonte de produto pendente; fontes validadas do pacote ficam preservadas. Perfis/bancos/vaults/EXE e logs locais não entram no stage.
