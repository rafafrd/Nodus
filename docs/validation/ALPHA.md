# Validação da aplicação alpha

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

## Refinamento posterior — UI-01

02/10/2026, branch feat/frontend: grade de módulos com cantos retos, leitura ampliada e ferramentas refinadas. Evidência própria em [FRONTEND.md](FRONTEND.md). Typecheck, nove testes, empacotamento e jornada R1–R7 passaram novamente no Windows, incluindo nota/PDF/contextos/foco/checklist/conflito. ALP-02/C5, ALP-09 e R8 continuam pendentes; esse incremento visual não aprova a alpha integral. A identificação do novo pacote está na evidência de UI-01, separada da prova anterior da MVP.
