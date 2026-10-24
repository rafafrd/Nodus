---
id: CAP-01
status: doing
outcome: bloqueado
depends_on: ["IA-01", "IA-02", "UX-03"]
criteria_count: 10
---

# CAP-01 — Captura Edge e preparação integrada ao desktop

## Pedido e base

12/10/2026: implementar extensão Manifest V3 no Edge/Windows, Native Messaging restrito, captura genérica de seleção/página e PDFs escolhidos, abertura/reutilização do Nodus, confirmação obrigatória da matéria e proposta local. Após aprovação específica, OpenRouter com chave protegida/modelo/orçamento do usuário; pacote validado salvo automaticamente em nota/resumo/tópicos/etapas e dez flashcards existentes. Fluxo manual preservado; sem questionário automático, agenda/mobile/jogo/OCR pago ou publicação.

Checkout real codex/external-study-material/07e223b, com IA-02 e fechamento documental anteriores não commitados. Permanecer nesta branch, sem reset/switch/push. Preservação em .local/edge-capture-baseline. AGENTS/CLAUDE/gotchas/retomada e serviços conferidos. Main62bfb0f é referência histórica, não autorização de reset. Sem subagentes. Nenhuma dependência nova prevista; Node24/Electron44/SQLite8 da base real.

## Critérios

C1. Captura funciona no Edge real para seleção/página e PDFs escolhidos, com preview/limites e sem dados de outras abas/formulários/credenciais.
C2. Desktop fechado abre; aberto mantém uma instância e preserva contexto. Recibo comprova persistência, reenvio não duplica.
C3. Toda captura exige confirmação da matéria, com sugestão local explicável e sem chamada de IA nessa etapa.
C4. API não recebe material sem aprovação; alterações invalidam aprovação também no serviço e não há truncamento/lotes ocultos.
C5. Geração real usa configuração e aprovação fornecidas e registra uso/custo conhecido ou pendente; orçamentos/tokens obrigatórios.
C6. Resultado válido disponibiliza nota/resumo/tópicos/etapas/dez flashcards automaticamente, sem questionário novo ou recompensa.
C7. Repetição, reabertura e falhas não duplicam resultados nem causam nova cobrança silenciosa; manifesto permite salvar sem nova API.
C8. Falhas são recuperáveis; chave e dados não selecionados ficam fora do transporte/extensão/logs/Git; host restrito e seguro.
C9. Notas/PDF/foco/IA manual/revisão anteriores continuam funcionando.
C10. Evidências distinguem fixtures, Edge+Windows real, OpenRouter real e AVA real; docs/setup/contratos/limites/retomada atualizados.

## Incrementos e retomada

1. Captura genérica Edge com atalho/ação/painel lateral, PDFs selecionados e persistência pendente.
2. Host/framing/chunks/setup, single-instance, inbox durável e confirmação da matéria.
3. Snapshot/proposta/configuração protegida e aprovação vinculada no executor.
4. OpenRouter/envelope compartilhado/validação/salvamento e recuperação sem repetição paga.
5. Jornadas reais, regressões e documentação.

Registro HKCU e teste pago exigem aprovação específica posterior; este pedido não autoriza executá-los. Preparar implementação/setup verificáveis antes dessa etapa. AVA específico permanece não verificado por ausência de URL/exemplo. Concluir todo trabalho independente e registrar bloqueios reproduzíveis sem inventar sucesso externo.

## Estado em 24/10/2026 — guardado

Bloqueado. Em 21/10/2026, um reset da branch `codex/external-study-material` para `origin/main` descartou as alterações em arquivos rastreados deste ticket (vault, StudyActivities, Checklist, Desks, preload, main, store, contratos); sobraram só os arquivos novos, que deixaram de compilar (61 erros de tipos e 20 testes falhando na main). Nenhuma cópia foi encontrada em reflog, commits/blobs soltos, `.local` ou no pacote (gotcha O-041).

Por decisão do usuário, IA-02 foi recuperado e os 56 arquivos deste ticket foram movidos intactos, com os mesmos caminhos, para `.local/cap-01-parked/` (fora do Git, só nesta máquina). Inclui código Edge/host/OpenRouter, roteiros, testes, ADR-0023, contrato, setup, validação e capturas, e as versões de `study-materials.ts` e do teste adaptadas por este ticket.

Nenhum critério foi comprovado: C1–C10 seguem não verificados. Para retomar:

1. Recolocar os arquivos guardados e reconstruir a parte rastreada perdida a partir do uso nos arquivos novos.
2. Typecheck, testes e jornadas com fixtures.
3. Com aprovação específica: registro do host no HKCU (Edge real) e chave/orçamento OpenRouter (uso pago).
