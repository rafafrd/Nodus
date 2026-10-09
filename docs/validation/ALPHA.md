# Validação da aplicação alpha

## DOC-01 — README e demonstrações

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | [README_SHOWCASE](README_SHOWCASE.md): main/PR13/código/package/evidências conferidos |
| C2 | aprovado | [README_SHOWCASE](README_SHOWCASE.md):10prints de fixtures/9badges/alt/recursos válidos |
| C3 | aprovado | [README_SHOWCASE](README_SHOWCASE.md): GitHub real/3SVGs/12tabelas/5âncoras/430px/claro-escuro |
| C4 | aprovado | [README_SHOWCASE](README_SHOWCASE.md): scripts/stack/bootstrap/diff/Gitleaks, commits/push e PR14 para main |

Execução real do MVP local em 02/10/2026. Resultados atuais e histórico por critério abaixo; provas externas permanecem não verificadas. Validação do pacote documental está em BOOTSTRAP.md e não aprova a aplicação.

Para cada execução, registre data, sistema, versão/build, fixture/conta, comando ou roteiro, resultado observado e evidência. Use aprovado, falhou ou não verificado. Registre limitações Windows, serviços reais e consulta com PC desligado separadamente.

## ALP-01 — Fundação executável no Windows

Ambiente das provas locais: Windows 11 10.0.26200, Node 24.21.0, app 0.1.0; fixtures fictícias e comandos/resultados registrados abaixo. ALP-09 não executado.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | typecheck e 1 teste passaram; build Windows gerada; smoke-desktop abriu/fechou/reabriu app e executável duas vezes, IPC versão 0.1.0/Electron 44.5.1/Node 24.21.0, isolamento confirmado; capturas em .local/evidence/foundation-*.png. Decisão: docs/decisions/runtime-mvp.md. |
| C2 | aprovado | typecheck e 1 teste passaram; build Windows gerada; smoke-desktop abriu/fechou/reabriu app e executável duas vezes, IPC versão 0.1.0/Electron 44.5.1/Node 24.21.0, isolamento confirmado; capturas em .local/evidence/foundation-*.png. Decisão: docs/decisions/runtime-mvp.md. |
| C3 | aprovado | typecheck e 1 teste passaram; build Windows gerada; smoke-desktop abriu/fechou/reabriu app e executável duas vezes, IPC versão 0.1.0/Electron 44.5.1/Node 24.21.0, isolamento confirmado; capturas em .local/evidence/foundation-*.png. Decisão: docs/decisions/runtime-mvp.md. |
| C4 | aprovado | typecheck e 1 teste passaram; build Windows gerada; smoke-desktop abriu/fechou/reabriu app e executável duas vezes, IPC versão 0.1.0/Electron 44.5.1/Node 24.21.0, isolamento confirmado; capturas em .local/evidence/foundation-*.png. Decisão: docs/decisions/runtime-mvp.md. |
| C5 | aprovado | typecheck e 1 teste passaram; build Windows gerada; smoke-desktop abriu/fechou/reabriu app e executável duas vezes, IPC versão 0.1.0/Electron 44.5.1/Node 24.21.0, isolamento confirmado; capturas em .local/evidence/foundation-*.png. Decisão: docs/decisions/runtime-mvp.md. |

Os enunciados são os do ticket. Reprodução, limites e próxima ação: evidências abaixo e docs/status/ALPHA_STATE.md.

Execução 02/10/2026, Windows 11 (10.0.26200), Node host portátil 24.21.0. typecheck e 1 teste passaram; build Windows gerada; smoke-desktop abriu/fechou/reabriu app e executável duas vezes, IPC versão 0.1.0/Electron 44.5.1/Node 24.21.0, isolamento confirmado; capturas em .local/evidence/foundation-*.png. Decisão: docs/decisions/runtime-mvp.md.

## ALP-02 — Prova de compatibilidade do editor Markdown

Ambiente das provas locais: Windows 11 10.0.26200, Node 24.21.0, app 0.1.0; fixtures fictícias e comandos/resultados registrados abaixo. ALP-09 não executado.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | 2 testes passaram; probe-tiptap registrou perda no candidato básico; smoke-editor exercitou CodeMirror real e toolbar, conservou fixture e gerou saída/captura. Fonte sem serialização destrutiva; decisão em docs/decisions/markdown-editor.md. Editor externo ainda não exercitado. |
| C2 | aprovado | 2 testes passaram; probe-tiptap registrou perda no candidato básico; smoke-editor exercitou CodeMirror real e toolbar, conservou fixture e gerou saída/captura. Fonte sem serialização destrutiva; decisão em docs/decisions/markdown-editor.md. Editor externo ainda não exercitado. |
| C3 | aprovado | 2 testes passaram; probe-tiptap registrou perda no candidato básico; smoke-editor exercitou CodeMirror real e toolbar, conservou fixture e gerou saída/captura. Fonte sem serialização destrutiva; decisão em docs/decisions/markdown-editor.md. Editor externo ainda não exercitado. |
| C4 | aprovado | 2 testes passaram; probe-tiptap registrou perda no candidato básico; smoke-editor exercitou CodeMirror real e toolbar, conservou fixture e gerou saída/captura. Fonte sem serialização destrutiva; decisão em docs/decisions/markdown-editor.md. Editor externo ainda não exercitado. |
| C5 | não verificado | 2 testes passaram; probe-tiptap registrou perda no candidato básico; smoke-editor exercitou CodeMirror real e toolbar, conservou fixture e gerou saída/captura. Fonte sem serialização destrutiva; decisão em docs/decisions/markdown-editor.md. Editor externo ainda não exercitado. |
| C6 | aprovado | 2 testes passaram; probe-tiptap registrou perda no candidato básico; smoke-editor exercitou CodeMirror real e toolbar, conservou fixture e gerou saída/captura. Fonte sem serialização destrutiva; decisão em docs/decisions/markdown-editor.md. Editor externo ainda não exercitado. |

Os enunciados são os do ticket. Reprodução, limites e próxima ação: evidências abaixo e docs/status/ALPHA_STATE.md.

Execução 02/10/2026, Windows 11 (10.0.26200), Node host portátil 24.21.0. 2 testes passaram; probe-tiptap registrou perda no candidato básico; smoke-editor exercitou CodeMirror real e toolbar, conservou fixture e gerou saída/captura. Fonte sem serialização destrutiva; decisão em docs/decisions/markdown-editor.md. Editor externo ainda não exercitado.

## ALP-03 — Contratos e persistência local mínima

Ambiente das provas locais: Windows 11 10.0.26200, Node 24.21.0, app 0.1.0; fixtures fictícias e comandos/resultados registrados abaixo. ALP-09 não executado.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | 3 testes passaram (SQLite real, rollback, schema v1); smoke-store usou IPC real no Electron, criou duas matérias, renomeou e reabriu com IDs conservados, argumento inválido rejeitado sem gravação; store separado da UI. Decisão: docs/decisions/local-storage.md. |
| C2 | aprovado | 3 testes passaram (SQLite real, rollback, schema v1); smoke-store usou IPC real no Electron, criou duas matérias, renomeou e reabriu com IDs conservados, argumento inválido rejeitado sem gravação; store separado da UI. Decisão: docs/decisions/local-storage.md. |
| C3 | aprovado | 3 testes passaram (SQLite real, rollback, schema v1); smoke-store usou IPC real no Electron, criou duas matérias, renomeou e reabriu com IDs conservados, argumento inválido rejeitado sem gravação; store separado da UI. Decisão: docs/decisions/local-storage.md. |
| C4 | aprovado | 3 testes passaram (SQLite real, rollback, schema v1); smoke-store usou IPC real no Electron, criou duas matérias, renomeou e reabriu com IDs conservados, argumento inválido rejeitado sem gravação; store separado da UI. Decisão: docs/decisions/local-storage.md. |
| C5 | aprovado | 3 testes passaram (SQLite real, rollback, schema v1); smoke-store usou IPC real no Electron, criou duas matérias, renomeou e reabriu com IDs conservados, argumento inválido rejeitado sem gravação; store separado da UI. Decisão: docs/decisions/local-storage.md. |
| C6 | aprovado | 3 testes passaram (SQLite real, rollback, schema v1); smoke-store usou IPC real no Electron, criou duas matérias, renomeou e reabriu com IDs conservados, argumento inválido rejeitado sem gravação; store separado da UI. Decisão: docs/decisions/local-storage.md. |

Os enunciados são os do ticket. Reprodução, limites e próxima ação: evidências abaixo e docs/status/ALPHA_STATE.md.

Execução 02/10/2026, Windows 11 (10.0.26200), Node host portátil 24.21.0. 3 testes passaram (SQLite real, rollback, schema v1); smoke-store usou IPC real no Electron, criou duas matérias, renomeou e reabriu com IDs conservados, argumento inválido rejeitado sem gravação; store separado da UI. Decisão: docs/decisions/local-storage.md.

## ALP-04 — Vault e salvar/reabrir notas

Ambiente das provas locais: Windows 11 10.0.26200, Node 24.21.0, app 0.1.0; fixtures fictícias e comandos/resultados registrados abaixo. ALP-09 não executado.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | 4 testes passaram, incluindo arquivos reais, CRLF/BOM, junction Windows e falha de arquivo; smoke-vault exercitou UI/IPC: salvar bytes, atualização externa limpa, conflito, erro visível com rascunho e reinicialização preservadora. Evidências em .local/evidence/vault-conflict.png e docs/decisions/vault-safety.md. |
| C2 | aprovado | 4 testes passaram, incluindo arquivos reais, CRLF/BOM, junction Windows e falha de arquivo; smoke-vault exercitou UI/IPC: salvar bytes, atualização externa limpa, conflito, erro visível com rascunho e reinicialização preservadora. Evidências em .local/evidence/vault-conflict.png e docs/decisions/vault-safety.md. |
| C3 | aprovado | 4 testes passaram, incluindo arquivos reais, CRLF/BOM, junction Windows e falha de arquivo; smoke-vault exercitou UI/IPC: salvar bytes, atualização externa limpa, conflito, erro visível com rascunho e reinicialização preservadora. Evidências em .local/evidence/vault-conflict.png e docs/decisions/vault-safety.md. |
| C4 | aprovado | 4 testes passaram, incluindo arquivos reais, CRLF/BOM, junction Windows e falha de arquivo; smoke-vault exercitou UI/IPC: salvar bytes, atualização externa limpa, conflito, erro visível com rascunho e reinicialização preservadora. Evidências em .local/evidence/vault-conflict.png e docs/decisions/vault-safety.md. |
| C5 | aprovado | 4 testes passaram, incluindo arquivos reais, CRLF/BOM, junction Windows e falha de arquivo; smoke-vault exercitou UI/IPC: salvar bytes, atualização externa limpa, conflito, erro visível com rascunho e reinicialização preservadora. Evidências em .local/evidence/vault-conflict.png e docs/decisions/vault-safety.md. |
| C6 | aprovado | 4 testes passaram, incluindo arquivos reais, CRLF/BOM, junction Windows e falha de arquivo; smoke-vault exercitou UI/IPC: salvar bytes, atualização externa limpa, conflito, erro visível com rascunho e reinicialização preservadora. Evidências em .local/evidence/vault-conflict.png e docs/decisions/vault-safety.md. |
| C7 | aprovado | 4 testes passaram, incluindo arquivos reais, CRLF/BOM, junction Windows e falha de arquivo; smoke-vault exercitou UI/IPC: salvar bytes, atualização externa limpa, conflito, erro visível com rascunho e reinicialização preservadora. Evidências em .local/evidence/vault-conflict.png e docs/decisions/vault-safety.md. |
| C8 | aprovado | 4 testes passaram, incluindo arquivos reais, CRLF/BOM, junction Windows e falha de arquivo; smoke-vault exercitou UI/IPC: salvar bytes, atualização externa limpa, conflito, erro visível com rascunho e reinicialização preservadora. Evidências em .local/evidence/vault-conflict.png e docs/decisions/vault-safety.md. |

Os enunciados são os do ticket. Reprodução, limites e próxima ação: evidências abaixo e docs/status/ALPHA_STATE.md.

Execução 02/10/2026, Windows 11 (10.0.26200), Node host portátil 24.21.0. 4 testes passaram, incluindo arquivos reais, CRLF/BOM, junction Windows e falha de arquivo; smoke-vault exercitou UI/IPC: salvar bytes, atualização externa limpa, conflito, erro visível com rascunho e reinicialização preservadora. Evidências em .local/evidence/vault-conflict.png e docs/decisions/vault-safety.md.

## ALP-05 — Mesa persistente por matéria

Ambiente das provas locais: Windows 11 10.0.26200, Node 24.21.0, app 0.1.0; fixtures fictícias e comandos/resultados registrados abaixo. ALP-09 não executado.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | 5 testes passaram; smoke-desk exercitou duas mesas reais, notas/PDFs de fixture, split por teclado, ferramenta e rascunho após reinício; dock/rodapé dentro da janela; captura .local/evidence/desk.png inspecionada. Three.js/GSAP efetivos. Decisão: docs/decisions/desk-mvp.md. |
| C2 | aprovado | 5 testes passaram; smoke-desk exercitou duas mesas reais, notas/PDFs de fixture, split por teclado, ferramenta e rascunho após reinício; dock/rodapé dentro da janela; captura .local/evidence/desk.png inspecionada. Three.js/GSAP efetivos. Decisão: docs/decisions/desk-mvp.md. |
| C3 | aprovado | 5 testes passaram; smoke-desk exercitou duas mesas reais, notas/PDFs de fixture, split por teclado, ferramenta e rascunho após reinício; dock/rodapé dentro da janela; captura .local/evidence/desk.png inspecionada. Three.js/GSAP efetivos. Decisão: docs/decisions/desk-mvp.md. |
| C4 | aprovado | 5 testes passaram; smoke-desk exercitou duas mesas reais, notas/PDFs de fixture, split por teclado, ferramenta e rascunho após reinício; dock/rodapé dentro da janela; captura .local/evidence/desk.png inspecionada. Three.js/GSAP efetivos. Decisão: docs/decisions/desk-mvp.md. |
| C5 | aprovado | 5 testes passaram; smoke-desk exercitou duas mesas reais, notas/PDFs de fixture, split por teclado, ferramenta e rascunho após reinício; dock/rodapé dentro da janela; captura .local/evidence/desk.png inspecionada. Three.js/GSAP efetivos. Decisão: docs/decisions/desk-mvp.md. |
| C6 | aprovado | 5 testes passaram; smoke-desk exercitou duas mesas reais, notas/PDFs de fixture, split por teclado, ferramenta e rascunho após reinício; dock/rodapé dentro da janela; captura .local/evidence/desk.png inspecionada. Three.js/GSAP efetivos. Decisão: docs/decisions/desk-mvp.md. |
| C7 | aprovado | 5 testes passaram; smoke-desk exercitou duas mesas reais, notas/PDFs de fixture, split por teclado, ferramenta e rascunho após reinício; dock/rodapé dentro da janela; captura .local/evidence/desk.png inspecionada. Three.js/GSAP efetivos. Decisão: docs/decisions/desk-mvp.md. |

Os enunciados são os do ticket. Reprodução, limites e próxima ação: evidências abaixo e docs/status/ALPHA_STATE.md.

Execução 02/10/2026, Windows 11 (10.0.26200), Node host portátil 24.21.0. 5 testes passaram; smoke-desk exercitou duas mesas reais, notas/PDFs de fixture, split por teclado, ferramenta e rascunho após reinício; dock/rodapé dentro da janela; captura .local/evidence/desk.png inspecionada. Three.js/GSAP efetivos. Decisão: docs/decisions/desk-mvp.md.

## ALP-06 — Leitor PDF com retomada

Ambiente das provas locais: Windows 11 10.0.26200, Node 24.21.0, app 0.1.0; fixtures fictícias e comandos/resultados registrados abaixo. ALP-09 não executado.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | 6 testes passaram; smoke-pdf executado na build local e no executável Windows empacotado: 3 páginas reais/worker/fontes, navegação, duas matérias, reinício, ausente, relocalização e inválido; nota conservada. Evidência: docs/decisions/pdf-reader.md e capturas .local/evidence/pdf-*.png. |
| C2 | aprovado | 6 testes passaram; smoke-pdf executado na build local e no executável Windows empacotado: 3 páginas reais/worker/fontes, navegação, duas matérias, reinício, ausente, relocalização e inválido; nota conservada. Evidência: docs/decisions/pdf-reader.md e capturas .local/evidence/pdf-*.png. |
| C3 | aprovado | 6 testes passaram; smoke-pdf executado na build local e no executável Windows empacotado: 3 páginas reais/worker/fontes, navegação, duas matérias, reinício, ausente, relocalização e inválido; nota conservada. Evidência: docs/decisions/pdf-reader.md e capturas .local/evidence/pdf-*.png. |
| C4 | aprovado | 6 testes passaram; smoke-pdf executado na build local e no executável Windows empacotado: 3 páginas reais/worker/fontes, navegação, duas matérias, reinício, ausente, relocalização e inválido; nota conservada. Evidência: docs/decisions/pdf-reader.md e capturas .local/evidence/pdf-*.png. |
| C5 | aprovado | 6 testes passaram; smoke-pdf executado na build local e no executável Windows empacotado: 3 páginas reais/worker/fontes, navegação, duas matérias, reinício, ausente, relocalização e inválido; nota conservada. Evidência: docs/decisions/pdf-reader.md e capturas .local/evidence/pdf-*.png. |
| C6 | aprovado | 6 testes passaram; smoke-pdf executado na build local e no executável Windows empacotado: 3 páginas reais/worker/fontes, navegação, duas matérias, reinício, ausente, relocalização e inválido; nota conservada. Evidência: docs/decisions/pdf-reader.md e capturas .local/evidence/pdf-*.png. |

Os enunciados são os do ticket. Reprodução, limites e próxima ação: evidências abaixo e docs/status/ALPHA_STATE.md.

Execução 02/10/2026, Windows 11 (10.0.26200), Node host portátil 24.21.0. 6 testes passaram; smoke-pdf executado na build local e no executável Windows empacotado: 3 páginas reais/worker/fontes, navegação, duas matérias, reinício, ausente, relocalização e inválido; nota conservada. Evidência: docs/decisions/pdf-reader.md e capturas .local/evidence/pdf-*.png.

## ALP-07 — Foco com pausa e estado persistente

Ambiente das provas locais: Windows 11 10.0.26200, Node 24.21.0, app 0.1.0; fixtures fictícias e comandos/resultados registrados abaixo. ALP-09 não executado.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | 7 testes passaram; smoke-focus mediu tempo real no Electron/SQLite, pausa de 1s sem crédito, retomada mesmo ID, janela sem foco, fechamento normal e recuperação após encerramento forçado, mantendo nota/PDF. Unitário verificou segmentos e relógio civil alterado. Decisão: docs/decisions/focus-time.md. |
| C2 | aprovado | 7 testes passaram; smoke-focus mediu tempo real no Electron/SQLite, pausa de 1s sem crédito, retomada mesmo ID, janela sem foco, fechamento normal e recuperação após encerramento forçado, mantendo nota/PDF. Unitário verificou segmentos e relógio civil alterado. Decisão: docs/decisions/focus-time.md. |
| C3 | aprovado | 7 testes passaram; smoke-focus mediu tempo real no Electron/SQLite, pausa de 1s sem crédito, retomada mesmo ID, janela sem foco, fechamento normal e recuperação após encerramento forçado, mantendo nota/PDF. Unitário verificou segmentos e relógio civil alterado. Decisão: docs/decisions/focus-time.md. |
| C4 | aprovado | 7 testes passaram; smoke-focus mediu tempo real no Electron/SQLite, pausa de 1s sem crédito, retomada mesmo ID, janela sem foco, fechamento normal e recuperação após encerramento forçado, mantendo nota/PDF. Unitário verificou segmentos e relógio civil alterado. Decisão: docs/decisions/focus-time.md. |
| C5 | aprovado | 7 testes passaram; smoke-focus mediu tempo real no Electron/SQLite, pausa de 1s sem crédito, retomada mesmo ID, janela sem foco, fechamento normal e recuperação após encerramento forçado, mantendo nota/PDF. Unitário verificou segmentos e relógio civil alterado. Decisão: docs/decisions/focus-time.md. |
| C6 | aprovado | 7 testes passaram; smoke-focus mediu tempo real no Electron/SQLite, pausa de 1s sem crédito, retomada mesmo ID, janela sem foco, fechamento normal e recuperação após encerramento forçado, mantendo nota/PDF. Unitário verificou segmentos e relógio civil alterado. Decisão: docs/decisions/focus-time.md. |

Os enunciados são os do ticket. Reprodução, limites e próxima ação: evidências abaixo e docs/status/ALPHA_STATE.md.

Execução 02/10/2026, Windows 11 (10.0.26200), Node host portátil 24.21.0. 7 testes passaram; smoke-focus mediu tempo real no Electron/SQLite, pausa de 1s sem crédito, retomada mesmo ID, janela sem foco, fechamento normal e recuperação após encerramento forçado, mantendo nota/PDF. Unitário verificou segmentos e relógio civil alterado. Decisão: docs/decisions/focus-time.md.

## ALP-08 — Checklist persistente por matéria

Ambiente das provas locais: Windows 11 10.0.26200, Node 24.21.0, app 0.1.0; fixtures fictícias e comandos/resultados registrados abaixo. ALP-09 não executado.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | 8 testes passaram; smoke-checklist usou UI/IPC/SQLite reais para duas matérias, duas etapas, marca/desmarca, edição, contagem, próxima ação e reabertura com IDs estáveis; argumento de outra matéria rejeitado sem gravação. Evidência: docs/decisions/checklist-mvp.md e .local/evidence/checklist.png. |
| C2 | aprovado | 8 testes passaram; smoke-checklist usou UI/IPC/SQLite reais para duas matérias, duas etapas, marca/desmarca, edição, contagem, próxima ação e reabertura com IDs estáveis; argumento de outra matéria rejeitado sem gravação. Evidência: docs/decisions/checklist-mvp.md e .local/evidence/checklist.png. |
| C3 | aprovado | 8 testes passaram; smoke-checklist usou UI/IPC/SQLite reais para duas matérias, duas etapas, marca/desmarca, edição, contagem, próxima ação e reabertura com IDs estáveis; argumento de outra matéria rejeitado sem gravação. Evidência: docs/decisions/checklist-mvp.md e .local/evidence/checklist.png. |
| C4 | aprovado | 8 testes passaram; smoke-checklist usou UI/IPC/SQLite reais para duas matérias, duas etapas, marca/desmarca, edição, contagem, próxima ação e reabertura com IDs estáveis; argumento de outra matéria rejeitado sem gravação. Evidência: docs/decisions/checklist-mvp.md e .local/evidence/checklist.png. |
| C5 | aprovado | 8 testes passaram; smoke-checklist usou UI/IPC/SQLite reais para duas matérias, duas etapas, marca/desmarca, edição, contagem, próxima ação e reabertura com IDs estáveis; argumento de outra matéria rejeitado sem gravação. Evidência: docs/decisions/checklist-mvp.md e .local/evidence/checklist.png. |
| C6 | aprovado | 8 testes passaram; smoke-checklist usou UI/IPC/SQLite reais para duas matérias, duas etapas, marca/desmarca, edição, contagem, próxima ação e reabertura com IDs estáveis; argumento de outra matéria rejeitado sem gravação. Evidência: docs/decisions/checklist-mvp.md e .local/evidence/checklist.png. |

Os enunciados são os do ticket. Reprodução, limites e próxima ação: evidências abaixo e docs/status/ALPHA_STATE.md.

Execução 02/10/2026, Windows 11 (10.0.26200), Node host portátil 24.21.0. 8 testes passaram; smoke-checklist usou UI/IPC/SQLite reais para duas matérias, duas etapas, marca/desmarca, edição, contagem, próxima ação e reabertura com IDs estáveis; argumento de outra matéria rejeitado sem gravação. Evidência: docs/decisions/checklist-mvp.md e .local/evidence/checklist.png.

## ALP-09 — Primeiro espelho autenticado na nuvem

Ambiente das provas locais: Windows 11 10.0.26200, Node 24.21.0, app 0.1.0; fixtures fictícias e comandos/resultados registrados abaixo. ALP-09 não executado.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | não verificado | — |
| C2 | não verificado | — |
| C3 | não verificado | — |
| C4 | não verificado | — |
| C5 | não verificado | — |
| C6 | não verificado | — |
| C7 | não verificado | — |
| C8 | não verificado | — |
| C9 | não verificado | — |

Os enunciados são os do ticket. Reprodução, limites e próxima ação: evidências abaixo e docs/status/ALPHA_STATE.md.

## ALP-10 — Verificação do fluxo completo e recuperação

Ambiente: Windows 11 10.0.26200, Node 24.21.0, app 0.1.0. Dados de teste explicitamente fictícios em tests/fixtures e .local; comandos/resultados no registro abaixo.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | não verificado | Jornada R1-R7 local passou no executável Windows 0.1.0, conforme docs/validation/MVP_JOURNEY.md; dados reais de fixture, IDs/contextos e conflitos preservados. R8 e falha de sincronização não verificados: integração fora do MVP local. npm ci, typecheck e 8 testes passaram; smoke-development executou Vite/Electron/PDF sem erros. |
| C2 | aprovado | Jornada R1-R7 local passou no executável Windows 0.1.0, conforme docs/validation/MVP_JOURNEY.md; dados reais de fixture, IDs/contextos e conflitos preservados. R8 e falha de sincronização não verificados: integração fora do MVP local. npm ci, typecheck e 8 testes passaram; smoke-development executou Vite/Electron/PDF sem erros. |
| C3 | não verificado | Jornada R1-R7 local passou no executável Windows 0.1.0, conforme docs/validation/MVP_JOURNEY.md; dados reais de fixture, IDs/contextos e conflitos preservados. R8 e falha de sincronização não verificados: integração fora do MVP local. npm ci, typecheck e 8 testes passaram; smoke-development executou Vite/Electron/PDF sem erros. |
| C4 | aprovado | Jornada R1-R7 local passou no executável Windows 0.1.0, conforme docs/validation/MVP_JOURNEY.md; dados reais de fixture, IDs/contextos e conflitos preservados. R8 e falha de sincronização não verificados: integração fora do MVP local. npm ci, typecheck e 8 testes passaram; smoke-development executou Vite/Electron/PDF sem erros. |
| C5 | aprovado | Jornada R1-R7 local passou no executável Windows 0.1.0, conforme docs/validation/MVP_JOURNEY.md; dados reais de fixture, IDs/contextos e conflitos preservados. R8 e falha de sincronização não verificados: integração fora do MVP local. npm ci, typecheck e 8 testes passaram; smoke-development executou Vite/Electron/PDF sem erros. |

Os enunciados são os do ticket. Reprodução, limites e próxima ação: evidências abaixo e docs/status/ALPHA_STATE.md.

Execução 02/10/2026, Windows 11 (10.0.26200), Node host portátil 24.21.0. Jornada R1-R7 local passou no executável Windows 0.1.0, conforme docs/validation/MVP_JOURNEY.md; dados reais de fixture, IDs/contextos e conflitos preservados. R8 e falha de sincronização não verificados: integração fora do MVP local. npm ci, typecheck e 8 testes passaram; smoke-development executou Vite/Electron/PDF sem erros.

## ALP-11 — Setup, decisões e retomada

Ambiente: Windows 11 10.0.26200, Node 24.21.0, app 0.1.0. Dados de teste explicitamente fictícios em tests/fixtures e .local; comandos/resultados no registro abaixo.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | Checkpoint encerrado na branch MVP com commits por fase. README/setup/arquitetura/quadro conferidos; typecheck, 8 testes, pacote e jornada R1-R7 Windows passaram. Auditoria por agente em docs/security/MVP_AUDIT.md: zero achados abertos, um Low corrigido e verificado via IPC/rollback, npm audit prod/completo e Gitleaks fonte/historico sem achados. Nuvem/editor externo pendentes explicitos, tempo humano nao informado; check-bootstrap passou. |
| C2 | aprovado | Checkpoint encerrado na branch MVP com commits por fase. README/setup/arquitetura/quadro conferidos; typecheck, 8 testes, pacote e jornada R1-R7 Windows passaram. Auditoria por agente em docs/security/MVP_AUDIT.md: zero achados abertos, um Low corrigido e verificado via IPC/rollback, npm audit prod/completo e Gitleaks fonte/historico sem achados. Nuvem/editor externo pendentes explicitos, tempo humano nao informado; check-bootstrap passou. |
| C3 | aprovado | Checkpoint encerrado na branch MVP com commits por fase. README/setup/arquitetura/quadro conferidos; typecheck, 8 testes, pacote e jornada R1-R7 Windows passaram. Auditoria por agente em docs/security/MVP_AUDIT.md: zero achados abertos, um Low corrigido e verificado via IPC/rollback, npm audit prod/completo e Gitleaks fonte/historico sem achados. Nuvem/editor externo pendentes explicitos, tempo humano nao informado; check-bootstrap passou. |
| C4 | aprovado | Checkpoint encerrado na branch MVP com commits por fase. README/setup/arquitetura/quadro conferidos; typecheck, 8 testes, pacote e jornada R1-R7 Windows passaram. Auditoria por agente em docs/security/MVP_AUDIT.md: zero achados abertos, um Low corrigido e verificado via IPC/rollback, npm audit prod/completo e Gitleaks fonte/historico sem achados. Nuvem/editor externo pendentes explicitos, tempo humano nao informado; check-bootstrap passou. |
| C5 | aprovado | Checkpoint encerrado na branch MVP com commits por fase. README/setup/arquitetura/quadro conferidos; typecheck, 8 testes, pacote e jornada R1-R7 Windows passaram. Auditoria por agente em docs/security/MVP_AUDIT.md: zero achados abertos, um Low corrigido e verificado via IPC/rollback, npm audit prod/completo e Gitleaks fonte/historico sem achados. Nuvem/editor externo pendentes explicitos, tempo humano nao informado; check-bootstrap passou. |
| C6 | aprovado | Checkpoint encerrado na branch MVP com commits por fase. README/setup/arquitetura/quadro conferidos; typecheck, 8 testes, pacote e jornada R1-R7 Windows passaram. Auditoria por agente em docs/security/MVP_AUDIT.md: zero achados abertos, um Low corrigido e verificado via IPC/rollback, npm audit prod/completo e Gitleaks fonte/historico sem achados. Nuvem/editor externo pendentes explicitos, tempo humano nao informado; check-bootstrap passou. |

Os enunciados são os do ticket. Reprodução, limites e próxima ação: evidências abaixo e docs/status/ALPHA_STATE.md.

Execução 02/10/2026, Windows 11 (10.0.26200), Node host portátil 24.21.0. Checkpoint após ALP-04: README/scripts/lockfile e decisões conferidos; runtime Windows real registrado; nuvem sem serviço/credenciais; editor externo não verificado; memória de arquitetura criada; check-bootstrap passou. Tempo humano não informado, reserva 360 min mantida.

Execução 02/10/2026, Windows 11 (10.0.26200), Node host portátil 24.21.0. Checkpoint final: README com primeiro uso e comandos realmente executados, lockfile e decisões conferidos, recorte/nuvem sem segredos, evidência por ticket e jornada local, tempo humano não informado (reserva 360 min). Memória de arquitetura disponível ao agente auditor. check-bootstrap executado; prova externa ALP-02 e ALP-09 explícitas.

Execução 02/10/2026, Windows 11 (10.0.26200), Node host portátil 24.21.0. Checkpoint encerrado na branch MVP com commits por fase. README/setup/arquitetura/quadro conferidos; typecheck, 8 testes, pacote e jornada R1-R7 Windows passaram. Auditoria por agente em docs/security/MVP_AUDIT.md: zero achados abertos, um Low corrigido e verificado via IPC/rollback, npm audit prod/completo e Gitleaks fonte/historico sem achados. Nuvem/editor externo pendentes explicitos, tempo humano nao informado; check-bootstrap passou.

## UI-01 — Refinamento posterior

02/10/2026, branch feat/frontend: grade de módulos com cantos retos, leitura ampliada e ferramentas refinadas. Evidência própria em [FRONTEND.md](FRONTEND.md). Typecheck, nove testes, empacotamento e jornada R1–R7 passaram novamente no Windows, incluindo nota/PDF/contextos/foco/checklist/conflito. ALP-02/C5, ALP-09 e R8 continuam pendentes; esse incremento visual não aprova a alpha integral. A identificação do novo pacote está na evidência de UI-01, separada da prova anterior da MVP.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | [FRONTEND](FRONTEND.md), provas UI-01/Windows, contexto/rodadas datadas preservados |
| C2 | aprovado | [FRONTEND](FRONTEND.md), provas UI-01/Windows, contexto/rodadas datadas preservados |
| C3 | aprovado | [FRONTEND](FRONTEND.md), provas UI-01/Windows, contexto/rodadas datadas preservados |
| C4 | aprovado | [FRONTEND](FRONTEND.md), provas UI-01/Windows, contexto/rodadas datadas preservados |

## GAM-01 — Cidade, farm, grind e loja

02/10/2026, incremento local solicitado após UI-01 na branch feat/game. Resultados completos e identificação do pacote em [GAME](GAME.md); [guia de execução/uso](../GUIA_DE_USO.md). Alpha integral mantém ALP-02/C5, ALP-09 e R8 pendentes.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | Cidade Three.js/locais/controles e cantos retos; capturas do pacote e compacta 1040×760 em GAME.md |
| C2 | aprovado | Plantio/45 s reais/colheita/venda, coleta, cinco compras/visuais, seis canteiros, picareta e produção passiva com app fechado; test:game no pacote |
| C3 | aprovado | Três dificuldades/tipos, seis rodadas completas, tentativas/combo, rodada incompleta retomada; build/classe/respec gratuito pela UI |
| C4 | aprovado | SQLite v2 aditivo, 13 testes, replay/rejeições/rollback e conciliação; probes do agente e IPC real descritos em GAME.md |
| C5 | aprovado | Windows package:win/test:game/test:journey R1–R7/probe de outro sender passaram; rascunho/Markdown/PDF/mesa/foco preservados |
| C6 | aprovado | Economia 728047d e interface 49489ad enviadas para origin/feat/game; regras/guia/auditoria/memória/quadro/retomada atualizados, Gitleaks e check-bootstrap |

## GAM-02 — Motor, desafios e Explorer

Prova específica em [ENGINE_EXPLORER](ENGINE_EXPLORER.md), inventário em [PRODUCT_DOCS](PRODUCT_DOCS.md).

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | [PRODUCT_DOCS](PRODUCT_DOCS.md): 68 arquivos inventariados, divergências corrigidas, planejamento histórico preservado; verificador e provas negativas |
| C2 | aprovado | [ENGINE_EXPLORER](ENGINE_EXPLORER.md): motor real 60→61 moedas, upgrade25/potência3, pulso→39; cooldown, replay e migração sem reset em SQLite |
| C3 | aprovado | [ENGINE_EXPLORER](ENGINE_EXPLORER.md): QTE por teclado 3/3 e skillcheck por timing 3/3, recompensas no main, ritmo/teclado/botões e cancelamento gratuito |
| C4 | aprovado | [ENGINE_EXPLORER](ENGINE_EXPLORER.md): dois diretórios reais, árvore/abas/retomada e oito capacidades IPC específicas; diálogo nativo permanece não automatizado |
| C5 | aprovado | [ENGINE_EXPLORER](ENGINE_EXPLORER.md): edição seletiva preserva BOM/CRLF, conflito/draft/recovery, fechamento imediato/restart e eventos rápidos de Save/resolução |
| C6 | aprovado | [ENGINE_EXPLORER](ENGINE_EXPLORER.md): 18 testes, .git caixa/alias8.3, traversal/junction/encoding/1MiB, argumento/replay/rollback e outro sender negado |
| C7 | aprovado | [ENGINE_EXPLORER](ENGINE_EXPLORER.md): pacote Windows identificado, novas jornadas/capturas, R1–R7 e jogo legado repetidos no pacote final |
| C8 | aprovado | Core 62dbd60/UI 1c6366a/docs 6e1a636 enviados para origin/feat/engine-explorer; guia/regras/quadro/memória atualizados, [auditoria](../security/ENGINE_EXPLORER_AUDIT.md), Gitleaks staged sem achados e check-bootstrap |

## UI-02 — Refinamento e transições suaves

03/10/2026, branch codex/smooth-ui, implementação 27bd358 + d50af65. Nova build/jornadas próprias, sem atribuir audit GAM-02 à UI-02.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | [SMOOTH_UI](SMOOTH_UI.md): fontes/contraste/SVG próprios/cantos retos, capturas inspecionadas |
| C2 | aprovado | [SMOOTH_UI](SMOOTH_UI.md): rail fixo, rascunho e DOM retidos; foco running no Explorer/paused na cidade |
| C3 | aprovado | [SMOOTH_UI](SMOOTH_UI.md): superfícies/estados e viewport 1040×760 com mesa/PDF e ferramentas acessíveis |
| C4 | aprovado | [SMOOTH_UI](SMOOTH_UI.md): sintaxe, árvore/abas/breadcrumb, largura mouse/teclado, BOM/CRLF/conflito/recovery/restart |
| C5 | aprovado | [SMOOTH_UI](SMOOTH_UI.md): luz/contexto/upgrade, câmera com poses intermediárias e retarget |
| C6 | aprovado | [SMOOTH_UI](SMOOTH_UI.md): ganho local/carteira animada, pulso sem toast, economia autoritativa |
| C7 | aprovado | [SMOOTH_UI](SMOOTH_UI.md): normal/reduzido dinâmico, retarget, inert, Ctrl+S durante transição, QTE oculto/teclado e Escape |
| C8 | aprovado | [SMOOTH_UI](SMOOTH_UI.md): typecheck, 18 testes, pacote/jornadas finais/R1–R7/jogo legado; 27bd358/d50af65/b0060f1 enviados ao origin, guia/quadro/memória atualizados; [AppSec](../security/SMOOTH_UI_AUDIT.md), Gitleaks staged/docs e verificador aprovados |

## MED-01 — Links YouTube, cinema e PiP

03/10/2026, branch codex/youtube-cinema; provas de pacote Windows/player oficial e fronteiras em [YOUTUBE](YOUTUBE.md).

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | [YOUTUBE](YOUTUBE.md): URLs/argumentos/ID/tempo, SQLite real/UUID/dedup/limite/rollback e vínculos por matéria |
| C2 | aprovado | [YOUTUBE](YOUTUBE.md): migração aditiva v1/v2/v3→v4 preserva fonte/draft/mesa/economia; restart lista/seleção sem conectar, PDF2 |
| C3 | aprovado | [YOUTUBE](YOUTUBE.md): player oficial reproduzido, guest isolado/efêmero sem Node/preload/bridge, permissões/popups negados e seis IPCs recusados de outro sender |
| C4 | aprovado | [YOUTUBE](YOUTUBE.md): cinema/retarget/Escape recebido pelo guest e mesmo WebContents conservado |
| C5 | aprovado | [YOUTUBE](YOUTUBE.md): PiP mouse/teclado, Explorer/compacto/owner-return e close conservando link |
| C6 | aprovado | [YOUTUBE](YOUTUBE.md): reprodução/reduced-motion/clipping/diálogo, gates QTE e crash real do guest/retry sem derrubar mesa |
| C7 | aprovado | [YOUTUBE](YOUTUBE.md): typecheck/21 testes/pacote/jornadas/regressões passaram; [AppSec](../security/YOUTUBE_AUDIT.md)/guia/documentos/memória e Gitleaks staged aprovados; d19c316/228c15f/ad77aae enviados ao origin/codex/youtube-cinema |

## CFG-01 — configurações, aparência e perfil

03/10/2026, branch codex/settings-profile; pacote/provas nativas próprias em [SETTINGS](SETTINGS.md).

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | [SETTINGS](SETTINGS.md): quarta área, navegação/restart conservam nota/projeto/canvas, PiP e gates nas regressões |
| C2 | aprovado | [SETTINGS](SETTINGS.md):3 temas persistentes/cores computadas e CodeMirror, sem remount |
| C3 | aprovado | [SETTINGS](SETTINGS.md): off CSS/GSAP/Three dinâmico, on restaura, OS reduzido prevalece, reprodução conserva |
| C4 | aprovado | [SETTINGS](SETTINGS.md): nome/PNG/JPEG256, rejeição conserva foto, remoção/restart/rollback/strict |
| C5 | aprovado | [SETTINGS](SETTINGS.md): dados/paths/runtime reais, enum/ausência/erro e6IPCsender negados, shell aceita pasta fictícia |
| C6 | aprovado | [SETTINGS](SETTINGS.md):24 testes/typecheck/package/jornadas/regressões, [AppSec](../security/SETTINGS_AUDIT.md), guias/memória/quadros e Gitleaks staged aprovados;8f1a47e/5eb2142/c68a020/ccdd75d enviados ao origin/codex/settings-profile |

## EXP-01 — Exportar pasta em PDF escuro

03/10/2026, branch codex/pdf-export; provas próprias Windows/PDF em [PDF_EXPORT](PDF_EXPORT.md).

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | [PDF_EXPORT](PDF_EXPORT.md): origens reais/subpastas/strict/canonical/links/auxiliares e sender negados |
| C2 | aprovado | [PDF_EXPORT](PDF_EXPORT.md): Markdown GFM/Unicode formatado, HTML/links/imagens inertes, bytes da fonte conservados |
| C3 | aprovado | [PDF_EXPORT](PDF_EXPORT.md):3/13 páginas A4 reais/renderizadas, preto nas margens, capa/sumário/paginação inspecionados |
| C4 | aprovado | [PDF_EXPORT](PDF_EXPORT.md): Downloads sem sobrescrita, limites/EXPORT_BUSY/vazio e audit/rollback real SQLite+FS |
| C5 | aprovado | [PDF_EXPORT](PDF_EXPORT.md): UI/IPC/print/FS reais, isolamento de5 superfícies e Settings/R1–R7 aprovados |
| C6 | aprovado | [PDF_EXPORT](PDF_EXPORT.md):28 testes/typecheck/pacote/jornadas/renderização, [AppSec](../security/PDF_EXPORT_AUDIT.md), docs/memória/inventário/bootstrap e Gitleaks staged aprovados; fef5821/38651b4/32eb884 enviados ao origin/codex/pdf-export |

## NXT-01 — Estudo, revisão e conhecimento

04/10/2026, codex/study-expansion, nove sugestões implementadas; [provas](STUDY_EXPANSION.md), regressões finais, auditoria/documentos e push aprovados. C1–C12 concluídos no recorte local; alpha externa permanece parcial.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | [STUDY_EXPANSION](STUDY_EXPANSION.md): Ctrl+K/busca real, navegação entre matérias, buffers e uma janela de criação |
| C2 | aprovado | [STUDY_EXPANSION](STUDY_EXPANSION.md): Hoje/tarefas/vencidos/foco persistido e retomada pela UI |
| C3 | aprovado | [STUDY_EXPANSION](STUDY_EXPANSION.md): cartão de trecho/nota, revelar/avaliar, versão/replay/audit/clock e limite de intervalo verificados |
| C4 | aprovado | [STUDY_EXPANSION](STUDY_EXPANSION.md): marcação real no PDF, comentário/nota, SHA por versão e bytes originais preservados |
| C5 | aprovado | [STUDY_EXPANSION](STUDY_EXPANSION.md): momento manual 1:15 abre guest oficial com start=75; modos/retry/isolamento preservados |
| C6 | aprovado | [STUDY_EXPANSION](STUDY_EXPANSION.md): snapshot real, WAL/FS/limites/contenção/omissões e hash/segredos conhecidos |
| C7 | aprovado | [STUDY_EXPANSION](STUDY_EXPANSION.md): cópia isolada, remapeamento, fontes intactas e relaunch real; audit failure não arma fechamento |
| C8 | aprovado | [STUDY_EXPANSION](STUDY_EXPANSION.md): canvas Three.js/links/prévia/abrir fonte reais, GSAP/gates/movimento reduzido/limpeza revisados |
| C9 | aprovado | [STUDY_EXPANSION](STUDY_EXPANSION.md): 40 pulsos reais/upgrade/três compras/noite persistida; ledger/audit/preços autoritativos |
| C10 | aprovado | [STUDY_EXPANSION](STUDY_EXPANSION.md): PDF preto real 4 páginas/imagem/capa/nota individual/destino registrado; picker não automatizado |
| C11 | aprovado | [STUDY_EXPANSION](STUDY_EXPANSION.md): 38 testes/typecheck/pacote/200 assets conferidos/dez jornadas Windows e PDF renderizado aprovados |
| C12 | aprovado | [STUDY_EXPANSION](STUDY_EXPANSION.md)/[AppSec](../security/STUDY_EXPANSION_AUDIT.md), docs/memória/scans staged/bootstrap/inventário aprovados; 58937e6/1f69692/61ef01b/7cbdd8a enviados ao origin/codex/study-expansion, push exit 0 |

## UI-03 — Dashboard Editorial e tema original

06/10/2026, Windows nativo, branch codex/editorial-dashboard. Evidência e limites em [EDITORIAL_DESIGN](EDITORIAL_DESIGN.md). Fixtures fictícias isoladas; alpha externa permanece parcial.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | Preferências anteriores sem regravação/rollback/restart; Oliva e dashboard histórico conferidos; Editorial padrão de perfil novo |
| C2 | aprovado | Capturas e serviço Hoje real, quatro indicadores, tarefas/retomada/acervo compactos |
| C3 | aprovado | Mesa, revisão, grafo, ajustes e moldura da cidade inspecionados; grafo corrigido para revelar grid no tema Editorial |
| C4 | aprovado | Catálogo real 2 principais/3 secundários, reclassificação pela UI, IDs salvos/restart e rascunho recuperado/salvo |
| C5 | aprovado | [EDITORIAL_DESIGN](EDITORIAL_DESIGN.md): typecheck/39 testes/pacote/roteiros Windows; grafo/cidade e catálogo repetidos após ajuste final; 200 assets conferidos |
| C6 | aprovado | [EDITORIAL_DESIGN](EDITORIAL_DESIGN.md): capturas reais compartilhadas, guia/ADR/sdd/quadro/retomada/validação atualizados, verificador documental aprovado |

## GAM-03 — Janela própria, ambientes e progressão

06/10/2026, Windows nativo, branch local codex/city-progression, UI-03 preservado. [CITY_PROGRESSION](CITY_PROGRESSION.md) contém comandos, hashes, capturas, distinção dos dois pacotes e limites. Fixtures fictícias isoladas; sem commit/push/publicação, alpha externa permanece parcial.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | Controle nativo maximizar/restaurar/minimizar, CSS draggable/IPC estrito/remetente negado, Fechar preserva draft e pausa foco ativo sem recuperação de crash |
| C2 | aprovado | Transform de 90s efetivo, preferência independente/restart, animações gerais/movimento reduzido/minimização interrompem efeito |
| C3 | aprovado | Original/Cyberpunk/New York, geometrias/luz/materiais/atmosfera, mesmo canvas/câmera/locais, cultivo/skin conservados após reinício |
| C4 | aprovado | Cinco produtores/preço crescente/×10/21 tecnologias/requisitos, taxa antiga/fração/cap offline/ledger agregado/replay e rollback reais |
| C5 | aprovado | 27 conquistas, quatro permanentes, prévia/cancelar/confirmar prestígio, rejeição obsoleta/audit rollback, estudo e progresso retido intactos |
| C6 | aprovado | QTE140s/calibração159s reais, 36/36 etapas/três fases, tolerância/recompensas/pausa/retomada/legado, timing main e entrada oculta bloqueada |
| C7 | aprovado | Typecheck/42 testes/2 econômicos reconferidos, pacote Windows/201 assets idênticos, roteiros final curto/Journey R1–R7/YouTube real e capturas inspecionadas |
| C8 | aprovado | Guia/análise oficial/ADR/estado/quadro/validação/retomada/gotcha atualizados; bootstrap/diff de fechamento em CITY_PROGRESSION; alterações locais salvas |

## UI-04 — Ritmo contínuo e espaço de trabalho limpo

06/10/2026, Windows nativo, branch codex/clean-workspace, alterações anteriores preservadas. [CLEAN_WORKSPACE](CLEAN_WORKSPACE.md) registra pacote/capturas/limites e fechamento. Sem commit/push/publicação.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | Domínio e QTE/calibração reais de36 etapas; preparo inicial/pausa/clock/replay/legado |
| C2 | aprovado | Sem cooldown,61 cliques consecutivos e40 pendentes drenados ao fechar; animação imediata/reduzida |
| C3 | aprovado | Zoom intermediário/pan/foco/forças e relação real; cena oculta/reduzida sem movimento |
| C4 | aprovado | Uma área padrão, acervo/detalhes/formatação/inventário recolhidos; drafts/fontes conservados |
| C5 | aprovado | Até três áreas/PDF/Vídeo, divisores mouse/teclado, validação/preferências/restart/contexto |
| C6 | aprovado | [CLEAN_WORKSPACE](CLEAN_WORKSPACE.md): 43 testes/typecheck/pacote/201 assets, clean-workspace/YouTube real/Journey R1–R7 no mesmo pacote final |
| C7 | aprovado | [CLEAN_WORKSPACE](CLEAN_WORKSPACE.md): capturas únicas/divididas/compactas/grafo/motor/Oficina inspecionadas e retornadas, limites/fixtures registrados |
| C8 | aprovado | [CLEAN_WORKSPACE](CLEAN_WORKSPACE.md): docs/ADR/guia/quadro/retomada/gotcha atualizados, bootstrap/diff/inventário final conferidos; alterações anteriores preservadas |

## GAM-04 — Produção profunda do observatório

07/10/2026, branch codex/deep-production/main integrado. [Provas Windows/modelos/capturas](DEEP_PRODUCTION.md); C1–C8 concluídos; entrega Git no PR #11.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | Engine/conteúdo/curvas separados, BigInt/Decimal80, schema6 e migração preservadora |
| C2 | aprovado | Fatia quatro famílias validada primeiro;17ª genérica;16famílias/305melhorias;1/10/100/MAX real |
| C3 | aprovado |264normais/20secretas, índice derivado, descoberta progressiva/IDs antigos; sem anunciar sistemas futuros |
| C4 | aprovado | Recibos reais de Foco/revisão,1min Windows, rollback/replay/consistência/builds, motor livre secundário, XP conservado |
| C5 | aprovado | Sinais guardados/combo/cache único, expiração offline/cap/carry, prestígio/legado/restart e fontes conservadas |
| C6 | aprovado | Objetivo/detalhes e distrito103meshes em três skins, movimento reduzido, compacto sem overflow |
| C7 | aprovado |52testes/typecheck/pacote201assets, deep-economy/skins/clean-workspace/Journey no mesmo pacote,3modelos/capturas inspecionadas |
| C8 | aprovado | Bootstrap/diff/Gitleaks326,60KB sem achados; commit6d20ce7/push/upstream e [PR11](https://github.com/rafafrd/Nodus/pull/11) com3Mermaid/6badges/12prints/API verificados; docs/ADR/guia/quadro/retomada atualizados |

## UI-05 — Abas e grade de estudo

07/10/2026, branch codex/study-tabs, GAM-04 preservado. [Prova Windows](STUDY_TABS.md); C1–C6 concluídos.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | Nove subitens; ausência do seletor/menu superior; clique muda somente a composição atual |
| C2 | aprovado | Arraste real/MIME/preview; alternativa +/Enter; bloqueio da quinta e foco de módulo existente |
| C3 | aprovado | Criação/seleção/fechamento/setas/atalhos; composição/foco/divisores independentes e restart |
| C4 | aprovado | Três com esquerda inteira, quatro2×2; mouse/setas,1040×760 e container queries |
| C5 | aprovado | Compatibilidade/rollback estritos; drafts/fontes/PDF2/foco; player oficial/guest/isolamento/crash/retry |
| C6 | aprovado | [STUDY_TABS](STUDY_TABS.md):56testes/typecheck/pacote201assets;study-tabs/player/clean-workspace/JourneyR1–R7;10capturas, O-021/ADR/docs/guia/quadro/bootstrap conferidos |

## UI-06 — Menu lateral recolhível

07/10/2026, codex/study-tabs/PR12. [Prova Windows](SIDEBAR.md); C1–C3 concluídos.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | Linha invisível em repouso, hover/foco com16px antes do ícone; arraste/clique/teclado preservados |
| C2 | aprovado | Menu inteiro oculto,188px liberados, botão acessível/Enter/clique, persistência/restart/perfil antigo/rollback; abas/divisores/fontes/PDF2 conservados |
| C3 | aprovado |10testes/typecheck/build/pacote201assets; smoke-sidebar e estudo/player oficial real; quatro temas/reduced motion/1040×760;5capturas inspecionadas, docs/ADR/guia atualizados |


## IA-01 — Atividades por IA externa

Entrega Git posterior por pedido explícito: implementação6396e32 enviada, [PR #13](https://github.com/rafafrd/Nodus/pull/13) aberto para main com3Mermaid/6badges/11prints públicos conferidos. Gitleaks272,64KB/diff/bootstrap aprovados; fontes do pacote conservadas, sem release/serviço/merge. Checkpoint e prova em [atividades-ia-externa](atividades-ia-externa.md).

07/10/2026, codex/external-study-activities local, de f6d1a67. [Prova completa](atividades-ia-externa.md); C1–C10 entregues, sem push/publicação.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | Duas notas/PDF3páginas/anotação42s da mesma matéria, hashes/blocos/locais e conteúdo integral; fonte de outra matéria excluída |
| C2 | aprovado | Clipboard Windows confirmado depois do await, falha sem confirmação falsa/alternativa manual; três reaberturas preservam pedido/snapshot/original |
| C3 | aprovado | Tamanho completo/default100.000/configuração;2.000bloqueia e lista maiores fontes sem corte |
| C4 | aprovado | Quiz e flashcards por colagem/arquivo, mesmo contrato/serviço, importação/prática real Windows |
| C5 | aprovado |15testes específicos cobrem rejeições exigidas e limites, sem coerção/heurística; caminhos precisos |
| C6 | aprovado | Syntax linha/coluna real, relatório/contrato/metadados/original no pedido de correção; orçamento curto explícito e revalidação integral |
| C7 | aprovado | Complemento identificado, contexto congelado/PDF2 abre leitor; fonte alterada/ausente conserva trecho; tema insuficiente rejeitado |
| C8 | aprovado | Hash/replay sem duplicata, revisão conserva resultado; triggers reais de falha/optimistic version/rollback sem atividade parcial |
| C9 | aprovado | Quiz retomado2/10, final10/10/100%/10explicações;10cartões/revelação/autoavaliação/restart, biblioteca existente recarregada; importação sem prêmio |
| C10 | aprovado | Zero pageerror/HTTP(S) no renderer, HTML inerte/nove canais negados a sender externo; typecheck/67+19testes/build/pacote204assets/11capturas/docs/O-022 aprovados |


## DOC-01 — Apresentação do README

Registro preservado de07/10/2026, codex/readme-showcase. [Prova existente](README_SHOWCASE.md); sem nova execução desses checks por UX-01.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | [README_SHOWCASE](README_SHOWCASE.md): Conteúdo conferido no código/main/PR13, escopo e limites |
| C2 | aprovado | [README_SHOWCASE](README_SHOWCASE.md): Capturas reais/alt/proveniência/recursos sem materiais pessoais |
| C3 | aprovado | [README_SHOWCASE](README_SHOWCASE.md): GitHub real/Mermaid/badges/GFM/âncoras e composição ampla/estreita |
| C4 | aprovado | [README_SHOWCASE](README_SHOWCASE.md): Scripts/stack/guia/bootstrap/diff/entrega documental anterior registrada |

## UX-01 — Escrita simples e navegação

08/10/2026, codex/notes-navigation local. [Provas Windows e limites](NOTES_UX.md); C1–C8 concluídos, sem commit/push/publicação.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | [NOTES_UX](NOTES_UX.md): Nota imediata/foco/corpo, metadados/fonte completa, primeiro uso e restart |
| C2 | aprovado | [NOTES_UX](NOTES_UX.md): Título/modelo/recente/matéria, preservação BOM/CRLF/campos/IDs, conflito/rollback/histórico |
| C3 | aprovado | [NOTES_UX](NOTES_UX.md): Busca por palavra do rascunho, importação externa/original/UTF-8/duplicatas/audit transacional |
| C4 | aprovado | [NOTES_UX](NOTES_UX.md): TextLayer PDF2/comentário/momento75s, fonte/page/hash e nova nota por captura |
| C5 | aprovado | [NOTES_UX](NOTES_UX.md): Cartão real por seleção/formulário curto e relação/grafo após mudar matéria |
| C6 | aprovado | [NOTES_UX](NOTES_UX.md): Fonte atual preselecionada, prática IA-01 manual e regressão completa |
| C7 | aprovado | [NOTES_UX](NOTES_UX.md): Primeiro uso/menu/nome/ajuda/1040×760/abas/divisões/recolher/restart, fonte legível |
| C8 | aprovado | [NOTES_UX](NOTES_UX.md): Typecheck/76testes/pacote204assets/jornadas/IPC/documentação/bootstrap/diff |


## GAM-05 — Projetos e automação da farm

09/10/2026, codex/farm-projects local. [Provas e limites](FARM_PROJECTS.md); C1–C7 entregues e aprovados; avaliação leiga C8 pendente (doing/parcial).

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | [FARM_PROJECTS](FARM_PROJECTS.md): Projetos/custos/ordem/objetivo/atalhos/reinvestimento real |
| C2 | aprovado | [FARM_PROJECTS](FARM_PROJECTS.md): Estoques1/min/cap200/recolhimento sem XP/produção, cultivos manuais |
| C3 | aprovado | [FARM_PROJECTS](FARM_PROJECTS.md): SQLite/recibos/audit/insuficiência/duplicata/replay/rollback |
| C4 | aprovado | [FARM_PROJECTS](FARM_PROJECTS.md): Frações/cheio/offline/clock/restart/baseline/backup/prestígio |
| C5 | aprovado | [FARM_PROJECTS](FARM_PROJECTS.md): Motor main/Amount/piso/orçamento/eventos/restante/alternativas |
| C6 | aprovado | [FARM_PROJECTS](FARM_PROJECTS.md): Três skins/compacta/pacote Windows204assets/jornadas farm/UX-01/MVP/capturas |
| C7 | aprovado | [FARM_PROJECTS](FARM_PROJECTS.md): Simulação com/sem estudo/estoques, typecheck/81testes/docs/ADR/bootstrap/diff/manifesto |
| C8 | não verificado | [FARM_PROJECTS](FARM_PROJECTS.md): Avaliação humana leiga ainda não realizada; roteiro pronto |


## UX-02 — Clareza do estudo e animação 3D

09/10/2026, codex/visual-experience local. [Provas, capturas e limites](VISUAL_EXPERIENCE.md); [relatório de bom dia](../reports/BOM_DIA_2026-10-09.md). C1–C7 concluídos, sem alterar pendências humanas/externas de outros tickets.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | [VISUAL_EXPERIENCE](VISUAL_EXPERIENCE.md): Hoje/próxima ação/primeiro uso/contexto e referências antigas |
| C2 | aprovado | [VISUAL_EXPERIENCE](VISUAL_EXPERIENCE.md): escrita/Markdown/PDF/aula, fontes/identidade/rascunho/originais e restart |
| C3 | aprovado | [VISUAL_EXPERIENCE](VISUAL_EXPERIENCE.md): acervo/menu/controles, quatro temas, compacto e quatro painéis |
| C4 | aprovado | [VISUAL_EXPERIENCE](VISUAL_EXPERIENCE.md): livro/órbita/água/ambiente/partículas/postos, três skins/distrito e dois clipes reais |
| C5 | aprovado | [VISUAL_EXPERIENCE](VISUAL_EXPERIENCE.md): movimento reduzido dinâmico/minimização/área oculta, cleanup e perda real WebGL com ferramentas |
| C6 | aprovado | [VISUAL_EXPERIENCE](VISUAL_EXPERIENCE.md): typecheck/82 testes/204 arquivos ASAR/sete jornadas Windows no pacote |
| C7 | aprovado | [VISUAL_EXPERIENCE](VISUAL_EXPERIENCE.md): relatório/21 capturas/clipes/manifesto/docs/ADR/guia/quadro/bootstrap/diff |

## UX-03 — Home animada e tema Branco

09/10/2026, codex/home-white local, checkout anterior preservado. [Provas, fotos e limites](HOME_WHITE.md), [relatório](../reports/HOME_BRANCO_2026-10-09.md). C1–C6 concluídos; pendências humanas/externas anteriores permanecem.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | [HOME_WHITE](HOME_WHITE.md): Início/atalhos/próxima ação/primeiro uso real, novos perfis e legado |
| C2 | aprovado | [HOME_WHITE](HOME_WHITE.md): entrada/hover medidos, fundo WebGL avança e mantém retângulo na rolagem |
| C3 | aprovado | [HOME_WHITE](HOME_WHITE.md): reduzido/controle geral/área oculta/minimização, perda real WebGL/cleanup |
| C4 | aprovado | [HOME_WHITE](HOME_WHITE.md): quinto tema/contrato/UI/realce/grafo/módulos/diálogo/restart/SQLite7/rollback |
| C5 | aprovado | [HOME_WHITE](HOME_WHITE.md): typecheck/83 testes/pacote204assets/jornadas Home/Notas/Abas/MVP/fontes |
| C6 | aprovado | [HOME_WHITE](HOME_WHITE.md): 15 fotos/clipe/relatório/ADR/guia/quadro/baseline164/manifesto/bootstrap/diff |
