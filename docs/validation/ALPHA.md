# Validação da aplicação alpha

Estado inicial: nenhum teste da aplicação executado. Os resultados abaixo começam como não verificado. Validação do pacote documental está em BOOTSTRAP.md e não aprova a aplicação.

Para cada execução, registre data, sistema, versão/build, fixture/conta, comando ou roteiro, resultado observado e evidência. Use aprovado, falhou ou não verificado. Registre limitações Windows, serviços reais e consulta com PC desligado separadamente.

## ALP-01 — Fundação executável no Windows

Ambiente/build: não informado. Dados usados: não informado. Comandos/roteiros executados: nenhum.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | typecheck e 1 teste passaram; build Windows gerada; smoke-desktop abriu/fechou/reabriu app e executável duas vezes, IPC versão 0.1.0/Electron 44.5.1/Node 24.21.0, isolamento confirmado; capturas em .local/evidence/foundation-*.png. Decisão: docs/decisions/runtime-mvp.md. |
| C2 | aprovado | typecheck e 1 teste passaram; build Windows gerada; smoke-desktop abriu/fechou/reabriu app e executável duas vezes, IPC versão 0.1.0/Electron 44.5.1/Node 24.21.0, isolamento confirmado; capturas em .local/evidence/foundation-*.png. Decisão: docs/decisions/runtime-mvp.md. |
| C3 | aprovado | typecheck e 1 teste passaram; build Windows gerada; smoke-desktop abriu/fechou/reabriu app e executável duas vezes, IPC versão 0.1.0/Electron 44.5.1/Node 24.21.0, isolamento confirmado; capturas em .local/evidence/foundation-*.png. Decisão: docs/decisions/runtime-mvp.md. |
| C4 | aprovado | typecheck e 1 teste passaram; build Windows gerada; smoke-desktop abriu/fechou/reabriu app e executável duas vezes, IPC versão 0.1.0/Electron 44.5.1/Node 24.21.0, isolamento confirmado; capturas em .local/evidence/foundation-*.png. Decisão: docs/decisions/runtime-mvp.md. |
| C5 | aprovado | typecheck e 1 teste passaram; build Windows gerada; smoke-desktop abriu/fechou/reabriu app e executável duas vezes, IPC versão 0.1.0/Electron 44.5.1/Node 24.21.0, isolamento confirmado; capturas em .local/evidence/foundation-*.png. Decisão: docs/decisions/runtime-mvp.md. |

Os enunciados são os do ticket. Reprodução/impacto/próxima ação: iniciar ou aguardar dependências conforme o quadro.

Execução 02/10/2026, Windows 11 (10.0.26200), Node host portátil 24.21.0. typecheck e 1 teste passaram; build Windows gerada; smoke-desktop abriu/fechou/reabriu app e executável duas vezes, IPC versão 0.1.0/Electron 44.5.1/Node 24.21.0, isolamento confirmado; capturas em .local/evidence/foundation-*.png. Decisão: docs/decisions/runtime-mvp.md.

## ALP-02 — Prova de compatibilidade do editor Markdown

Ambiente/build: não informado. Dados usados: não informado. Comandos/roteiros executados: nenhum.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | 2 testes passaram; probe-tiptap registrou perda no candidato básico; smoke-editor exercitou CodeMirror real e toolbar, conservou fixture e gerou saída/captura. Fonte sem serialização destrutiva; decisão em docs/decisions/markdown-editor.md. Editor externo ainda não exercitado. |
| C2 | aprovado | 2 testes passaram; probe-tiptap registrou perda no candidato básico; smoke-editor exercitou CodeMirror real e toolbar, conservou fixture e gerou saída/captura. Fonte sem serialização destrutiva; decisão em docs/decisions/markdown-editor.md. Editor externo ainda não exercitado. |
| C3 | aprovado | 2 testes passaram; probe-tiptap registrou perda no candidato básico; smoke-editor exercitou CodeMirror real e toolbar, conservou fixture e gerou saída/captura. Fonte sem serialização destrutiva; decisão em docs/decisions/markdown-editor.md. Editor externo ainda não exercitado. |
| C4 | aprovado | 2 testes passaram; probe-tiptap registrou perda no candidato básico; smoke-editor exercitou CodeMirror real e toolbar, conservou fixture e gerou saída/captura. Fonte sem serialização destrutiva; decisão em docs/decisions/markdown-editor.md. Editor externo ainda não exercitado. |
| C5 | não verificado | 2 testes passaram; probe-tiptap registrou perda no candidato básico; smoke-editor exercitou CodeMirror real e toolbar, conservou fixture e gerou saída/captura. Fonte sem serialização destrutiva; decisão em docs/decisions/markdown-editor.md. Editor externo ainda não exercitado. |
| C6 | aprovado | 2 testes passaram; probe-tiptap registrou perda no candidato básico; smoke-editor exercitou CodeMirror real e toolbar, conservou fixture e gerou saída/captura. Fonte sem serialização destrutiva; decisão em docs/decisions/markdown-editor.md. Editor externo ainda não exercitado. |

Os enunciados são os do ticket. Reprodução/impacto/próxima ação: iniciar ou aguardar dependências conforme o quadro.

Execução 02/10/2026, Windows 11 (10.0.26200), Node host portátil 24.21.0. 2 testes passaram; probe-tiptap registrou perda no candidato básico; smoke-editor exercitou CodeMirror real e toolbar, conservou fixture e gerou saída/captura. Fonte sem serialização destrutiva; decisão em docs/decisions/markdown-editor.md. Editor externo ainda não exercitado.

## ALP-03 — Contratos e persistência local mínima

Ambiente/build: não informado. Dados usados: não informado. Comandos/roteiros executados: nenhum.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | 3 testes passaram (SQLite real, rollback, schema v1); smoke-store usou IPC real no Electron, criou duas matérias, renomeou e reabriu com IDs conservados, argumento inválido rejeitado sem gravação; store separado da UI. Decisão: docs/decisions/local-storage.md. |
| C2 | aprovado | 3 testes passaram (SQLite real, rollback, schema v1); smoke-store usou IPC real no Electron, criou duas matérias, renomeou e reabriu com IDs conservados, argumento inválido rejeitado sem gravação; store separado da UI. Decisão: docs/decisions/local-storage.md. |
| C3 | aprovado | 3 testes passaram (SQLite real, rollback, schema v1); smoke-store usou IPC real no Electron, criou duas matérias, renomeou e reabriu com IDs conservados, argumento inválido rejeitado sem gravação; store separado da UI. Decisão: docs/decisions/local-storage.md. |
| C4 | aprovado | 3 testes passaram (SQLite real, rollback, schema v1); smoke-store usou IPC real no Electron, criou duas matérias, renomeou e reabriu com IDs conservados, argumento inválido rejeitado sem gravação; store separado da UI. Decisão: docs/decisions/local-storage.md. |
| C5 | aprovado | 3 testes passaram (SQLite real, rollback, schema v1); smoke-store usou IPC real no Electron, criou duas matérias, renomeou e reabriu com IDs conservados, argumento inválido rejeitado sem gravação; store separado da UI. Decisão: docs/decisions/local-storage.md. |
| C6 | aprovado | 3 testes passaram (SQLite real, rollback, schema v1); smoke-store usou IPC real no Electron, criou duas matérias, renomeou e reabriu com IDs conservados, argumento inválido rejeitado sem gravação; store separado da UI. Decisão: docs/decisions/local-storage.md. |

Os enunciados são os do ticket. Reprodução/impacto/próxima ação: iniciar ou aguardar dependências conforme o quadro.

Execução 02/10/2026, Windows 11 (10.0.26200), Node host portátil 24.21.0. 3 testes passaram (SQLite real, rollback, schema v1); smoke-store usou IPC real no Electron, criou duas matérias, renomeou e reabriu com IDs conservados, argumento inválido rejeitado sem gravação; store separado da UI. Decisão: docs/decisions/local-storage.md.

## ALP-04 — Vault e salvar/reabrir notas

Ambiente/build: não informado. Dados usados: não informado. Comandos/roteiros executados: nenhum.

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

Os enunciados são os do ticket. Reprodução/impacto/próxima ação: iniciar ou aguardar dependências conforme o quadro.

Execução 02/10/2026, Windows 11 (10.0.26200), Node host portátil 24.21.0. 4 testes passaram, incluindo arquivos reais, CRLF/BOM, junction Windows e falha de arquivo; smoke-vault exercitou UI/IPC: salvar bytes, atualização externa limpa, conflito, erro visível com rascunho e reinicialização preservadora. Evidências em .local/evidence/vault-conflict.png e docs/decisions/vault-safety.md.

## ALP-05 — Mesa persistente por matéria

Ambiente/build: não informado. Dados usados: não informado. Comandos/roteiros executados: nenhum.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | 5 testes passaram; smoke-desk exercitou duas mesas reais, notas/PDFs de fixture, split por teclado, ferramenta e rascunho após reinício; dock/rodapé dentro da janela; captura .local/evidence/desk.png inspecionada. Three.js/GSAP efetivos. Decisão: docs/decisions/desk-mvp.md. |
| C2 | aprovado | 5 testes passaram; smoke-desk exercitou duas mesas reais, notas/PDFs de fixture, split por teclado, ferramenta e rascunho após reinício; dock/rodapé dentro da janela; captura .local/evidence/desk.png inspecionada. Three.js/GSAP efetivos. Decisão: docs/decisions/desk-mvp.md. |
| C3 | aprovado | 5 testes passaram; smoke-desk exercitou duas mesas reais, notas/PDFs de fixture, split por teclado, ferramenta e rascunho após reinício; dock/rodapé dentro da janela; captura .local/evidence/desk.png inspecionada. Three.js/GSAP efetivos. Decisão: docs/decisions/desk-mvp.md. |
| C4 | aprovado | 5 testes passaram; smoke-desk exercitou duas mesas reais, notas/PDFs de fixture, split por teclado, ferramenta e rascunho após reinício; dock/rodapé dentro da janela; captura .local/evidence/desk.png inspecionada. Three.js/GSAP efetivos. Decisão: docs/decisions/desk-mvp.md. |
| C5 | aprovado | 5 testes passaram; smoke-desk exercitou duas mesas reais, notas/PDFs de fixture, split por teclado, ferramenta e rascunho após reinício; dock/rodapé dentro da janela; captura .local/evidence/desk.png inspecionada. Three.js/GSAP efetivos. Decisão: docs/decisions/desk-mvp.md. |
| C6 | aprovado | 5 testes passaram; smoke-desk exercitou duas mesas reais, notas/PDFs de fixture, split por teclado, ferramenta e rascunho após reinício; dock/rodapé dentro da janela; captura .local/evidence/desk.png inspecionada. Three.js/GSAP efetivos. Decisão: docs/decisions/desk-mvp.md. |
| C7 | aprovado | 5 testes passaram; smoke-desk exercitou duas mesas reais, notas/PDFs de fixture, split por teclado, ferramenta e rascunho após reinício; dock/rodapé dentro da janela; captura .local/evidence/desk.png inspecionada. Three.js/GSAP efetivos. Decisão: docs/decisions/desk-mvp.md. |

Os enunciados são os do ticket. Reprodução/impacto/próxima ação: iniciar ou aguardar dependências conforme o quadro.

Execução 02/10/2026, Windows 11 (10.0.26200), Node host portátil 24.21.0. 5 testes passaram; smoke-desk exercitou duas mesas reais, notas/PDFs de fixture, split por teclado, ferramenta e rascunho após reinício; dock/rodapé dentro da janela; captura .local/evidence/desk.png inspecionada. Three.js/GSAP efetivos. Decisão: docs/decisions/desk-mvp.md.

## ALP-06 — Leitor PDF com retomada

Ambiente/build: não informado. Dados usados: não informado. Comandos/roteiros executados: nenhum.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | 6 testes passaram; smoke-pdf executado na build local e no executável Windows empacotado: 3 páginas reais/worker/fontes, navegação, duas matérias, reinício, ausente, relocalização e inválido; nota conservada. Evidência: docs/decisions/pdf-reader.md e capturas .local/evidence/pdf-*.png. |
| C2 | aprovado | 6 testes passaram; smoke-pdf executado na build local e no executável Windows empacotado: 3 páginas reais/worker/fontes, navegação, duas matérias, reinício, ausente, relocalização e inválido; nota conservada. Evidência: docs/decisions/pdf-reader.md e capturas .local/evidence/pdf-*.png. |
| C3 | aprovado | 6 testes passaram; smoke-pdf executado na build local e no executável Windows empacotado: 3 páginas reais/worker/fontes, navegação, duas matérias, reinício, ausente, relocalização e inválido; nota conservada. Evidência: docs/decisions/pdf-reader.md e capturas .local/evidence/pdf-*.png. |
| C4 | aprovado | 6 testes passaram; smoke-pdf executado na build local e no executável Windows empacotado: 3 páginas reais/worker/fontes, navegação, duas matérias, reinício, ausente, relocalização e inválido; nota conservada. Evidência: docs/decisions/pdf-reader.md e capturas .local/evidence/pdf-*.png. |
| C5 | aprovado | 6 testes passaram; smoke-pdf executado na build local e no executável Windows empacotado: 3 páginas reais/worker/fontes, navegação, duas matérias, reinício, ausente, relocalização e inválido; nota conservada. Evidência: docs/decisions/pdf-reader.md e capturas .local/evidence/pdf-*.png. |
| C6 | aprovado | 6 testes passaram; smoke-pdf executado na build local e no executável Windows empacotado: 3 páginas reais/worker/fontes, navegação, duas matérias, reinício, ausente, relocalização e inválido; nota conservada. Evidência: docs/decisions/pdf-reader.md e capturas .local/evidence/pdf-*.png. |

Os enunciados são os do ticket. Reprodução/impacto/próxima ação: iniciar ou aguardar dependências conforme o quadro.

Execução 02/10/2026, Windows 11 (10.0.26200), Node host portátil 24.21.0. 6 testes passaram; smoke-pdf executado na build local e no executável Windows empacotado: 3 páginas reais/worker/fontes, navegação, duas matérias, reinício, ausente, relocalização e inválido; nota conservada. Evidência: docs/decisions/pdf-reader.md e capturas .local/evidence/pdf-*.png.

## ALP-07 — Foco com pausa e estado persistente

Ambiente/build: não informado. Dados usados: não informado. Comandos/roteiros executados: nenhum.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | 7 testes passaram; smoke-focus mediu tempo real no Electron/SQLite, pausa de 1s sem crédito, retomada mesmo ID, janela sem foco, fechamento normal e recuperação após encerramento forçado, mantendo nota/PDF. Unitário verificou segmentos e relógio civil alterado. Decisão: docs/decisions/focus-time.md. |
| C2 | aprovado | 7 testes passaram; smoke-focus mediu tempo real no Electron/SQLite, pausa de 1s sem crédito, retomada mesmo ID, janela sem foco, fechamento normal e recuperação após encerramento forçado, mantendo nota/PDF. Unitário verificou segmentos e relógio civil alterado. Decisão: docs/decisions/focus-time.md. |
| C3 | aprovado | 7 testes passaram; smoke-focus mediu tempo real no Electron/SQLite, pausa de 1s sem crédito, retomada mesmo ID, janela sem foco, fechamento normal e recuperação após encerramento forçado, mantendo nota/PDF. Unitário verificou segmentos e relógio civil alterado. Decisão: docs/decisions/focus-time.md. |
| C4 | aprovado | 7 testes passaram; smoke-focus mediu tempo real no Electron/SQLite, pausa de 1s sem crédito, retomada mesmo ID, janela sem foco, fechamento normal e recuperação após encerramento forçado, mantendo nota/PDF. Unitário verificou segmentos e relógio civil alterado. Decisão: docs/decisions/focus-time.md. |
| C5 | aprovado | 7 testes passaram; smoke-focus mediu tempo real no Electron/SQLite, pausa de 1s sem crédito, retomada mesmo ID, janela sem foco, fechamento normal e recuperação após encerramento forçado, mantendo nota/PDF. Unitário verificou segmentos e relógio civil alterado. Decisão: docs/decisions/focus-time.md. |
| C6 | aprovado | 7 testes passaram; smoke-focus mediu tempo real no Electron/SQLite, pausa de 1s sem crédito, retomada mesmo ID, janela sem foco, fechamento normal e recuperação após encerramento forçado, mantendo nota/PDF. Unitário verificou segmentos e relógio civil alterado. Decisão: docs/decisions/focus-time.md. |

Os enunciados são os do ticket. Reprodução/impacto/próxima ação: iniciar ou aguardar dependências conforme o quadro.

Execução 02/10/2026, Windows 11 (10.0.26200), Node host portátil 24.21.0. 7 testes passaram; smoke-focus mediu tempo real no Electron/SQLite, pausa de 1s sem crédito, retomada mesmo ID, janela sem foco, fechamento normal e recuperação após encerramento forçado, mantendo nota/PDF. Unitário verificou segmentos e relógio civil alterado. Decisão: docs/decisions/focus-time.md.

## ALP-08 — Checklist persistente por matéria

Ambiente/build: não informado. Dados usados: não informado. Comandos/roteiros executados: nenhum.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | não verificado | — |
| C2 | não verificado | — |
| C3 | não verificado | — |
| C4 | não verificado | — |
| C5 | não verificado | — |
| C6 | não verificado | — |

Os enunciados são os do ticket. Reprodução/impacto/próxima ação: iniciar ou aguardar dependências conforme o quadro.

## ALP-09 — Primeiro espelho autenticado na nuvem

Ambiente/build: não informado. Dados usados: não informado. Comandos/roteiros executados: nenhum.

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

Os enunciados são os do ticket. Reprodução/impacto/próxima ação: iniciar ou aguardar dependências conforme o quadro.

## ALP-10 — Verificação do fluxo completo e recuperação

Ambiente/build: não informado. Dados usados: não informado. Comandos/roteiros executados: nenhum.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | não verificado | — |
| C2 | não verificado | — |
| C3 | não verificado | — |
| C4 | não verificado | — |
| C5 | não verificado | — |

Os enunciados são os do ticket. Reprodução/impacto/próxima ação: iniciar ou aguardar dependências conforme o quadro.

## ALP-11 — Setup, decisões e retomada

Ambiente/build: não informado. Dados usados: não informado. Comandos/roteiros executados: nenhum.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | Checkpoint após ALP-04: README/scripts/lockfile e decisões conferidos; runtime Windows real registrado; nuvem sem serviço/credenciais; editor externo não verificado; memória de arquitetura criada; check-bootstrap passou. Tempo humano não informado, reserva 360 min mantida. |
| C2 | aprovado | Checkpoint após ALP-04: README/scripts/lockfile e decisões conferidos; runtime Windows real registrado; nuvem sem serviço/credenciais; editor externo não verificado; memória de arquitetura criada; check-bootstrap passou. Tempo humano não informado, reserva 360 min mantida. |
| C3 | aprovado | Checkpoint após ALP-04: README/scripts/lockfile e decisões conferidos; runtime Windows real registrado; nuvem sem serviço/credenciais; editor externo não verificado; memória de arquitetura criada; check-bootstrap passou. Tempo humano não informado, reserva 360 min mantida. |
| C4 | aprovado | Checkpoint após ALP-04: README/scripts/lockfile e decisões conferidos; runtime Windows real registrado; nuvem sem serviço/credenciais; editor externo não verificado; memória de arquitetura criada; check-bootstrap passou. Tempo humano não informado, reserva 360 min mantida. |
| C5 | aprovado | Checkpoint após ALP-04: README/scripts/lockfile e decisões conferidos; runtime Windows real registrado; nuvem sem serviço/credenciais; editor externo não verificado; memória de arquitetura criada; check-bootstrap passou. Tempo humano não informado, reserva 360 min mantida. |
| C6 | aprovado | Checkpoint após ALP-04: README/scripts/lockfile e decisões conferidos; runtime Windows real registrado; nuvem sem serviço/credenciais; editor externo não verificado; memória de arquitetura criada; check-bootstrap passou. Tempo humano não informado, reserva 360 min mantida. |

Os enunciados são os do ticket. Reprodução/impacto/próxima ação: iniciar ou aguardar dependências conforme o quadro.

Execução 02/10/2026, Windows 11 (10.0.26200), Node host portátil 24.21.0. Checkpoint após ALP-04: README/scripts/lockfile e decisões conferidos; runtime Windows real registrado; nuvem sem serviço/credenciais; editor externo não verificado; memória de arquitetura criada; check-bootstrap passou. Tempo humano não informado, reserva 360 min mantida.
