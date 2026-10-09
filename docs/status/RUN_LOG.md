# Diário de execução da alpha

Estado inicial: nenhum ticket implementado. Este arquivo registra checkpoints reais de execução; não preencha datas, comandos, testes ou resultados que não ocorreram.

## Formato de entrada

### Data/hora e ticket

- Ambiente e versão/build usada:
- Comportamento entregue:
- Arquivos/commit, quando existente:
- Verificações executadas e resultados:
- Critérios pendentes e bloqueios:
- Próxima ação concreta e como reproduzir:

Use entradas curtas e mantenha o histórico. O estado atual está em [ALPHA_STATE.md](ALPHA_STATE.md), e a evidência por critério em [ALPHA.md](../validation/ALPHA.md).

### 02/10/2026 — ALP-01: Em andamento

Fundação Electron/React/TypeScript; instalação e prova Windows em execução.

### 02/10/2026 — ALP-01: Concluído

Fundação verificada no Windows; próximo ALP-02, prova do editor preservador.

### 02/10/2026 — ALP-02: Em andamento

Avaliar Tiptap e integrar editor com preservação de bytes e prévia.

### 02/10/2026 — ALP-02: Parcial

Editor assistido preservador integrado; C5 externo pendente. Prosseguir ALP-03 independente dessa prova.

### 02/10/2026 — ALP-03: Em andamento

SQLite nativo do Node embarcado, schema versionado, contratos e matérias reais.

### 02/10/2026 — ALP-03: Concluído

Matérias e SQLite reais verificados; próximo ALP-04, vault e recuperação.

### 02/10/2026 — ALP-04: Em andamento

Vault autorizado, identidade portável, gravação atômica e rascunhos recuperáveis; fase na branch MVP.

### 02/10/2026 — ALP-04: Concluído

Vault e recuperação verificados; consolidar ALP-11 antes da mesa.

### 02/10/2026 — ALP-11: Em andamento

Checkpoint após ALP-04: setup, decisões, memória de arquitetura e retomada.

### 02/10/2026 — ALP-11: Concluído

Documentação do primeiro checkpoint coerente; repetir ALP-11 no final. Próximo ALP-05.

### 02/10/2026 — ALP-05: Em andamento

Mesa por matéria com contexto persistente e interface Three.js/GSAP discreta.

### 02/10/2026 — ALP-05: Concluído

Mesa persistente verificada; próximo ALP-06, renderização PDF real.

### 02/10/2026 — ALP-06: Em andamento

Leitor PDF local com worker empacotado, navegação e retomada.

### 02/10/2026 — ALP-06: Concluído

Leitor PDF real verificado também empacotado Windows; próximo ALP-07, foco por segmentos.

### 02/10/2026 — ALP-07: Em andamento

Foco por tempo monotônico, segmentos e checkpoint de recuperação.

### 02/10/2026 — ALP-07: Concluído

Foco e recuperação verificados; próximo ALP-08, etapas e próxima ação.

### 02/10/2026 — ALP-08: Em andamento

Checklist persistente por matéria, IDs de etapas e referência de retomada.

### 02/10/2026 — ALP-08: Concluído

Checklist local verificado. MVP local implementado; ALP-09 fica fora deste recorte sem serviço/hospedagem. Executar jornada local ALP-10 e consolidar ALP-11.

### 02/10/2026 — ALP-10: Em andamento

Jornada integrada do MVP local no executável Windows; R8 nuvem fora do recorte e não verificado.

### 02/10/2026 — ALP-10: Parcial

MVP local R1–R7 verificado; alpha completa continua parcial por R8/nuvem. Consolidar ALP-11 e auditoria solicitada.

### 02/10/2026 — ALP-11: Concluído

MVP local implementado/verificado na branch MVP; auditoria final em andamento. Após review, abrir executável e conferir editor externo; ALP-09 é próximo incremento da alpha integral.

### 02/10/2026 — ALP-11: Concluído

MVP local entregue, auditoria final concluida e commits por fase na MVP. Primeira acao humana: abrir release/win-unpacked/App Estudos.exe com vault de teste e conferir .local/evidence/editor-output.md em editor externo para ALP-02/C5. ALP-09 permanece proximo incremento da alpha integral.

### 02/10/2026 — UI-01: Em andamento

MVP ae0c9f6 enviada para origin/MVP a pedido do usuário; branch feat/frontend criada. Direção visual corrigida pela referência: cantos retos, painéis planos e grade de quatro módulos. Implementados grade retomável, modo só caderno/Esc, atalhos Alt+1/2/3, ajuste de PDF, duração de foco e refinamento de leitura/estados vazios. Capturas reais compartilhadas; fixtures isoladas, sem dados pessoais.

Windows 11 10.0.26200, Node 24.21.0, Electron 44.5.1: typecheck, nove testes, package:win, preview empacotado com reinício/compacta, jornada R1–R7, smoke-pdf/editor/checklist empacotados e check-bootstrap passaram. Oscilação de layout do PDF corrigida (O-004). Detalhes em docs/validation/FRONTEND.md. Próxima ação: commit/push do incremento e fechamento documental de UI-01; critérios externos da alpha continuam pendentes.

### 02/10/2026 — UI-01: Concluído

Implementação 4e460e0 enviada para origin/feat/frontend. Nove capturas empacotadas e resultado de reinício registrados; Gitleaks do stage (~78,2 KB) sem achados, incluindo testes/fixtures. UI-01 movida para done/concluido com C1–C4 aprovados e links/retomada atualizados. Checkpoint documental separado da implementação; nenhuma funcionalidade de nuvem anunciada como concluída. Próxima ação: usuário avaliar a grade no executável/prints; provas externas da alpha mantidas nos tickets próprios.

### 02/10/2026 — GAM-01: Em andamento

Pedido explícito de jogo/cidade/farm/grind/loja. Branch feat/game deriva de feat/frontend 884593e. Implementados economia transacional/SQLite v2, cidade medieval procedural Three.js, cultivo/coleta/venda, cinco melhorias/moinho passivo, memória demonstrativa e build/respec grátis. Capturas reais compartilhadas, carteira construída por ações de jogo em fixture isolada.

Windows: typecheck, 13 testes, package:win, test:game com maturação/tempo real fechado/restart/retomada de estudo, test:journey R1–R7 e probe dos novos canais contra outra janela passaram. R8/nuvem e editor externo permanecem pendentes. Auditoria por agente em GAME_AUDIT: zero vulnerabilidade de código confirmada, oito High de um advisory transitivo de tooling com exposição avaliada; scan canônico parcial/digest inicial não atribuído à build. Próxima ação: commits por fase/push e fechamento C6. Regras e identificação de binário em docs/validation/GAME.md.

### 03/10/2026 — GAM-01: Concluído

Economia 728047d e cidade/interface/jornadas 49489ad enviadas para origin/feat/game. Critérios C1–C6 aprovados em GAME.md; ticket movido para done/concluido. Snapshot final inicial de 31 arquivos/233.406 bytes passou Gitleaks incluindo testes, harness e relatório; stage documental de 18 arquivos incluindo guia também passou, zero achados. Check-bootstrap e diff --check passaram. docs/GUIA_DE_USO.md explica abrir executável, dev/build, mesa/jogo, perfil de teste e backup; comandos existentes conferidos contra scripts/configuração. Próxima ação humana: avaliar arte/ritmo no executável. Provas externas da alpha continuam pendentes; sem publicação de serviço/release.

### 03/10/2026 — GAM-02: Em andamento

Branch feat/engine-explorer deriva de083bdc0; user confirmou Explorer real com editar e pediu nova branch/commits/push final. Core62dbd60 registra v3 aditivo/motor/QTE/skillcheck e projetos/typed IPC. Interface com motor como entrada, oficina, rail/árvore/abas/CodeMirror, save/draft/conflito/retomada. Provas reais Windows:18testes, typecheck, pacote, nova jornada BOM/CRLF/fechar/restart/desafios/trocar vistas, estudo R1–R7, jogo legado e IPC outra janela. Fontes congeladas para auditoria; revisão detectou e corrigiu aliases .git caixa/8.3 e save strict antes de entrega, sugeriu mutex de resolução e novo teste detectou status errado após carregar fonte. Rerun de eventos rápidos aprovado. Docs inventariadas, estado/schema/requisitos/histórico diferenciados; ignore de release corrigido para versionar docs/release. Diálogos nativos e editor externo/nuvem mantidos não verificados. Finalizar parecer/segredos, commit UI/docs e push autorizado.

### 03/10/2026 — GAM-02: revisão concluída, sincronização pendente

Interface 1c6366a commitada. Novas jornadas, R1–R7 e jogo legado repetidos no pacote final identificado em ENGINE_EXPLORER.md; typecheck final passou. Agente AppSec: 10 testes/3 probes reais/Gitleaks final aprovados, bypass .git/alias NTFS corrigido, zero vulnerabilidades de código abertas. Scan canônico inicial completo em 23 itens, suplemento final com digest próprio; advisory High de tooling permanece avaliado. Relatório copiado sem alteração de verdict, memória de arquitetura/guidelines atualizada. Documentação posterior ao freeze tem prova própria: 68 arquivos inventariados, 14 tickets/88 critérios/78 Markdown verificados, quatro cenários negativos em cópia real incluindo link interno de docs/release. C8 aguarda scan do stage, commit/push autorizado e fechamento; nenhum serviço/release publicado.

### 03/10/2026 — GAM-02: Concluído

Core 62dbd60, interface 1c6366a e documentação/auditoria 6e1a636 enviados para origin/feat/engine-explorer; push exit 0/upstream configurado. Stage documental de 37 arquivos/~75 KB passou Gitleaks sem achados, check-bootstrap/diff --check aprovados. C1–C8 registrados como aprovados, ticket movido para done/concluido e links/retomada atualizados. Fechamento do quadro é um commit documental separado. Build Windows/capturas permanecem locais, nenhum serviço/release publicado. Próxima ação humana: usar o guia e avaliar a build com perfil de teste; alpha integral continua parcial por editor externo/nuvem/R8.

### 03/10/2026 — UI-02: Em andamento

Pedido de aplicar as oito sugestões visuais, com esforço maior em transições suaves. Branch codex/smooth-ui parte de 0da34c7, working tree limpa antes da tarefa. Plano curto em UI-02: identidade/navegação, ciclos de transição/câmera, Explorer/feedback, provas Windows e checkpoint. Autorização anterior de commits/push por fase mantida; nenhuma publicação de serviço/release. Resultados novos ainda não verificados.

### 03/10/2026 — UI-02: implementação/provas Windows

Implementação 27bd358: oito sugestões aplicadas, maior esforço em retarget/cancelamento de área/painéis/câmera/superfícies, sem clonar documentos nem esperar animação para salvar. Rail fixo, SVG/legibilidade/superfícies, Explorer com sintaxe/caminho/largura e motor com feedback local. Typecheck, 18 testes e pacote Windows passaram. Jornada UI-02, engine/Explorer/QTE/skillcheck, R1–R7 e jogo legado passaram no pacote final identificado em SMOOTH_UI; produção passiva provada com 61 s fechado. Capturas/vídeo reais locais, fixtures de serviços sem mocks. Gitleaks stage 83,13KB exit 0. Auditoria independente/documentação/push em fechamento; C1–C7 aprovados, C8 pendente, ticket permanece doing. Nenhuma alteração de main/preload/schema ou publicação.

### 03/10/2026 — UI-02: acabamento e audit

Ajuste d50af65 restaura a amostra de moedas antes do primeiro paint; seis amostras reais do contador na jornada passaram, seguidas das regressões de engine/Explorer, estudos e jogo no mesmo pacote final. Novo ASAR/EXE em SMOOTH_UI; arquivos anteriores no relatório do auditor são históricos. Fonte independente aprovada com mitigações: freeze 4728… + suplemento f30de98c…, zero achado de código aberto, quatro testes próprios/probes/Gitleaks passados; tooling High mantém avaliação de precondições. Memória atualizada; Gitleaks do stage de acabamento 940 bytes exit 0. Documentação/links/push em fechamento, C8 ainda não verificado até envio.

### 03/10/2026 — UI-02: concluído

Implementação 27bd358, acabamento d50af65 e docs/audit b0060f1 enviados ao origin/codex/smooth-ui; push exit 0 e upstream configurado. C1–C8 aprovados; ticket movido para done/concluido e links/retomada atualizados. Stage documental 15 arquivos/45,46KB Gitleaks sem achados; fechamento do quadro em commit documental separado. Pacote/capturas/vídeo e perfis fictícios ficam locais/ignorados. Nenhum serviço/release publicado. Próxima ação humana: abrir a build com perfil de teste conforme o guia e conferir fluidez. Alpha integral permanece parcial por editor externo/nuvem/R8.

Verificação final: audit-product-docs leu 71 arquivos; check-bootstrap aprovou 15 tickets/96 critérios/81 Markdown/242 links locais. As provas externas continuam pendentes; a verificação documental não as aprova.

### 03/10/2026 — MED-01: implementação e provas Windows

Branch codex/youtube-cinema parte de2690372 por pedido de links YouTube/cinema/PiP e autorização vigente de commits/push. Schema v4 aditivo, biblioteca por matéria com URLs validadas, guest remoto isolado sem preload/Node/bridge, sessão efêmera e controles próprios. Cinema/PiP/mesa retargetam mesmo player; PiP arrasta/teclado e acompanha Explorer, bounds/clipping/diálogos/reduced-motion tratados. Auditor reproduziu Low de QTE sob cinema; gates corrigidos/verificados. Typecheck,21 testes, package Windows e test:videos final21:57:46.686Z passaram com player oficial/rede/input reais, sixIPCsender negados, crash remoto/retry conservando mesa. Regressões journey(R1–R7)/engine-explorer/smooth-ui passaram no mesmo ASAR identificado em YOUTUBE. Capturas reais native child view compartilhadas; probe de emulação offline não comprovou offline e não conta como aprovação. C1–C6 aprovados, C7 aguarda parecer/stage/commits/push; próxima ação documental. Nenhum serviço/release publicado; pendências externas da alpha preservadas.

### 03/10/2026 — MED-01: checkpoints de código

Core d19c316 e interface/harness 228c15f commitados após revisão seletiva. Gitleaks staged core22,32 KB e interface43,10 KB exit0/sem achados incluindo testes/script; diff --check passou. Não houve mudança de produto depois do pacote/jornadas finais; docs/memória pós-freeze são checkpoint separado. C7 ainda aguarda audit final, scan staged documental e push.

### 03/10/2026 — MED-01: auditoria encerrada

Agente independente concluiu YOUTUBE_AUDIT: APPROVE WITH MITIGATIONS para fonte final56563e23… + suplemento final de harness1b999d0e…, 18 arquivos comparados sem diferença. Probes reais/4 testes/segredos próprios aprovados, Low de teclado corrigido, High de tooling com exposição avaliada permanece. Jornada Windows/reprodução/crash/retry e regressões atribuídas ao implementador; offline não comprovado. Memória/documentos atualizados; apenas stage documental/commit/push e fechamento C7 restantes.

### 03/10/2026 — MED-01: concluído

Core d19c316, interface/harness228c15f e docs/audit ad77aae enviados para origin/codex/youtube-cinema; push exit0/upstream configurado. Stage documental23 arquivos/54,84 KB Gitleaks sem achados, check-bootstrap16 tickets/103 critérios/85 Markdown/270 links e inventário75 docs aprovados. C1–C7 aprovados, ticket movido para done/concluido e links/retomada atualizados; fechamento do quadro é checkpoint documental separado. Fonte/pacote/jornadas permanecem os identificados em YOUTUBE; perfis/capturas/build locais ignorados. Próxima ação humana: abrir a build pelo guia e usar vídeos/cinema/PiP; alpha externa continua parcial, sem serviço/release publicado.

Verificação final MED-01 após mover o ticket: inventário75 arquivos de docs; check-bootstrap16 tickets/103 critérios/85 Markdown/272 links locais aprovado. Essa checagem documental não aprova os critérios externos pendentes da alpha.

### 03/10/2026 — CFG-01: implementação e prova Windows

Branch codex/settings-profile parte de92cc357. UserPreferences/AppManagement/foto PNGJPEG validada no main, IPC strict e quarta área Perfil/Aparência/Dados e app. Preferências persistem em settings existente/schema4;3 temas CSS/CodeMirror sem remount, off OR OS para GSAP/Three/CSS. Typecheck,24 testes,package:win e test:settings final22:50:44.874Z exit0: input/normalização256/rejeição conserva foto/remove/restart, DOM/canvas/draft/BOMCRLF conservados, viewport real1040×760, contagens/paths/runtime, shell pasta fictícia sucesso e6IPCsenderFORBIDDEN/zeroerrors. Harness anterior corrigiu seletores/espera checkbox assíncrona; não houve falha de produto demonstrada nesses casos. Provas/scripts/photos ficam locais, identificação de ASAR/EXE em SETTINGS. Auditor independente executou probes próprios sem Electron; relatório em elaboração. Regressões/commits/push em fechamento, C6 ainda não verificado.

### 03/10/2026 — CFG-01: regressão de player corrigida

O-011 observado no pacote inicial: closed transitório de VideoPlayer.open podia deixar guest carregado sem surface/retry após restart. Probe nativo reproduziu eventos/DOM; dispose privado agora descarta sem publicar closed, close explícito mantém evento. Package final/typecheck passaram, ASAR08F62C1D…/EXEED36D014… identificados em SETTINGS. Nova Settings22:58:35.202Z e vídeos22:59:01.257Z passaram: ausência de closed ao abrir, superfície/guest reais, crash/retry e PiP nas configurações/off/cinema comprovados. Estudos/transições em execução. Core8f1a47e commitado; Gitleaks stage13.42KB exit0 incluindo tests. Nenhum push ainda.

### 03/10/2026 — CFG-01: regressões e checkpoints

Settings/Videos/Journey/Smooth-ui finais exit0 no mesmo ASAR08F62C1D…/EXEED36D014…: perfis/preferences, player oficial/PiP/off/cinema/isolamento/crash/retry, R1–R7 estudos e câmera/retarget/engine/QTE oculto/Explorer/BOMCRLF/compacto. Core8f1a47e, UI5eb2142 e fixplayerc68a020 commitados após revisão seletiva; Gitleaks stages13.42/45.59/2.58KB exit0 e diff cached --check aprovado. Fonte/harness não mudou depois dessas provas. Docs/memória/ADR/quadro atualizados; inventário leu79docs, bootstrap17tickets/109critérios/89Markdown/293links passou comC6pendente. Aguardando encerramento audit independente e stage/push documental; nenhum serviço/release publicado.

### 03/10/2026 — CFG-01: audit final e documentos

Agente independente encerrou SETTINGS_AUDIT: APPROVE WITH MITIGATIONS para freeze34a7c877… composto com suplemento final1d13b934… (30 arquivos comparados, sem diferenças). Probes próprios SQLite/FS/header/schema/movimento/3 testes e Gitleaks aprovados; nenhuma vulnerabilidade nova confirmada, tooling High com exposição avaliada permanece. Correção O-011 revisada; pacote/jornadas Windows são do implementador, auditor não abriu Electron. Guia/ADR/arquitetura/contratos/PRD/design/quadro/validação/memória atualizados. Restam scan staged documental, commit/push e fechamento C6; nenhuma alteração de produto depois da última jornada.

### 03/10/2026 — CFG-01: concluído

Core8f1a47e, UI5eb2142, fixplayerc68a020 e docs/auditccdd75d enviados ao origin/codex/settings-profile; push exit0/upstream configurado. Stage documental23 arquivos/53.42KB Gitleaks aprovado, bootstrap17tickets/109critérios/89Markdown/295links e inventário79docs passaram. C1–C6 aprovados; ticket movido para done/concluido, links/quadro/retomada atualizados. Fechamento em commit documental separado; fonte/pacote/jornadas e identidades do auditor permanecem os de SETTINGS/SETTINGS_AUDIT. Build/capturas/perfis fictícios locais ignorados; nenhum serviço/release publicado. Próxima ação humana: abrir a build, usar Ajustes e avaliar as três paletas. Alpha externa permanece parcial.

Verificação final CFG-01 após movimentar o ticket: inventário79 arquivos de docs; check-bootstrap17 tickets/109 critérios/89Markdown/299links locais aprovado. Contagens são documentais; critérios externos da alpha continuam pendentes.

### 03/10/2026 — EXP-01: implementação e provas Windows

Branch codex/pdf-export parte de6897adb com working tree limpa; autorização vigente de commits por fase/push final. Coleta Markdown registrada/contida/limitada sem escrita da fonte, SSR ReactMarkdown/GFM existente, printToPDF em superfície efêmera isolada JS/Node/preload ausentes, A4 preto/capa/sumário/paginação e Downloads wx/fsync. UI em Ajustes/Dados e app seleciona vault/projeto/subpasta e mostra estados/recibo. Sem dependência/lockfile/migration nova; schema4 permanece.

Auditor independente confirmou O-012/CWE-778: sucesso sem evento na fonte inicial. export-output agora exige UUID/action/outcome depois de fsync/close e remove somente saída nova se audit falhar. Unitário/native/probe independente com trigger SQLite real confirmaram rollback e fonte/saída anterior/draft intactos. Sem transação FS/SQLite conjunta ou garantia contra crash/falha de cleanup.

Typecheck28 testes/package:win passaram; PDF native final23:36:13.972Z, Settings23:37:02.609Z e Journey R1–R7 exit0 no pacote ASARD78522E4…/EXE0CDB145A… de PDF_EXPORT. UI/IPC/FS/print reais,4 eventos opacos,5 superfícies print com prefs/sessões reais, guard busy/pasta vazia/auditfail/payload/sender negados, zero pageerrors. Poppler/Pillow/pypdf renderizaram e conferiram3/13 páginas, margens pretas/A4/texto/sumário e revisão visual passou. Fontes/harness não mudaram após essas provas. Core fef5821/UI38651b4 commitados; Gitleaks stages23,65/14,16KB aprovados incluindo testes/harness. C1–C5 aprovados; C6 aguardando relatório final/docs/inventário/bootstrap/scan/push/fechamento. Alpha externa ALP-02/C5 e nuvem/R8 continua pendente; nenhum serviço/release publicado.

### 03/10/2026 — EXP-01: auditoria final

PDF_EXPORT_AUDIT independente: APPROVE WITH MITIGATIONS para inicialb225d619… e final04b47c95…/14arquivos comparados0diferenças, sem vulnerabilidade nova confirmada aberta. Low/CWE-778 corrigido/probes próprios4testes/34checks/FS/SQLite/root e segredos aprovados; tooling High existente permanece. Windows/PDF são provas do implementador. Handoff em memória/O-012, guias/ADR/contratos/produto/documentos/quadro atualizados; /output/pdf/ ignore protege cópia de demonstração de mesmohash, sem mudança de produto pós-freeze. Restam scan/commit documental/push e C6/quadro.

### 03/10/2026 — EXP-01: concluído

Core fef5821/UI38651b4/docs-audit32eb884 enviados ao origin/codex/pdf-export, push exit0/upstream configurado. Stage documental24arquivos/46,52KB Gitleaks sem achados e diff cached --check aprovado, incluindo guia/memória/audit; bootstrap18tickets/115critérios/93Markdown/328links e inventário83docs passaram no checkpoint. C1–C6 aprovados; ticket movido para done/concluido, links/quadro/retomada atualizados. Fechamento do quadro é checkpoint documental separado, com nova reconferência. Fonte/harness/pacote permanecem os exercitados e identificados em PDF_EXPORT/PDF_EXPORT_AUDIT. Dados/capturas/PDF demonstrativo/pacote locais ignorados; nenhum serviço/release publicado. Próxima ação humana: exportar sua pasta de notas conforme o guia; alpha externa permanece parcial.

Verificação final EXP-01 após mover ticket/links: inventário83docs; bootstrap18tickets/115critérios/93Markdown/331links locais aprovado. Contagens documentais não aprovam provas externas. Diff de fechamento conferido e fonte/harness preservados.

### 04/10/2026 — NXT-01: checkpoint1

Busca/Hoje/flashcards e schema5 aditivo implementados, commit 58937e6. Windows: typecheck,31testes,package e jornada real expansion passaram; fontes preservadas e canais estritos/sender verificados. C1–C3 aprovados, demais pendentes. Continuação: marcações PDF/vídeo e exportação ampliada; evidências em STUDY_EXPANSION.md.

### 04/10/2026 — NXT-01: domínio e integração das fases 2/3

Commit 1f69692 acrescenta annotations, snapshots/restauração separados, imagens/destino PDF, cosméticos da cidade e contratos/preload/testes. Migração v5 permanece aditiva, lockfile inalterado. Typecheck e 38 testes passaram; as três jornadas novas no Windows exercitaram Ctrl+K/Hoje/revisão, PDF/vídeo/export, grafo/40 pulsos/upgrade/compras/noite, backup/restore/relaunch e audit failure sem fechar. Auditor independente reproduziu overflow de intervalo e eventos ausentes; O-013/cap de 365 dias, destino transacional e audit antes de relaunch foram corrigidos/verificados.

Regressão Smooth encontrou O-014: container vazio de controles interceptava marcador. CSS agora captura ponteiro somente nos botões; mesma jornada sem force passou no pacote corrigido. Vídeos reais e PDF legado também passaram. Game antigo ainda usava saldo/quantidade de catálogo anterior; roteiro corrigido calcula soma e obtém saldo por rodadas reais. Build atual comparada com 200 arquivos dist no ASAR, sem diferenças; hashes correntes e repetição final em STUDY_EXPANSION. Gitleaks staged do core (22 arquivos/69,25 KB) e da interface/harness (19 arquivos/60,02 KB) sem achados; diff cached --check aprovado. Interface staged, regressões/audit/docs/commit/push em fechamento; nenhum serviço/release publicado.

### 04/10/2026 — NXT-01: interface, regressões e auditoria final

Interface/harness em 61ef01b. Dez jornadas passaram no mesmo EXE41FC22FB…/ASAR7F1B0ED2…: Game oito compras/rodadas/cultivos/renda passiva com app fechado, Smooth, Videos, PDF legado, Expansion, Annotations, Knowledge-Backup, Settings, Journey R1–R7 e Engine-Explorer com QTE/skillcheck. PDF final quatro páginas/A4/preto/imagem renderizado e visualmente inspecionado; fonte/draft/raízes originais conservados. Diálogos de pasta não automatizados, conforme os limites. No harness Engine, date histórico fixo não é o horário da execução atual; log/arquivo datados de 04/10 são registrados separadamente.

Auditor independente encerrou STUDY_EXPANSION_AUDIT: APPROVE WITH MITIGATIONS, composição 8fdf7397…/224 entradas/52 fontes correntes, 14/14 testes/dez grupos de probes/callbacks/FS/SQLite e segredos aprovados. Sem Electron pelo auditor, nenhuma vulnerabilidade nova confirmada aberta. Npm audit atual prod0/full1High legado, exposição avaliada e não remediada. Docs/memória/ADR/guia/produto/quadro atualizados; C1–C11 aprovados, C12 aguarda scan/commit documental/push e fechamento. Inventário87docs/bootstrap19tickets/127critérios/97Markdown/360links aprovado no checkpoint anterior com C12 pendente.

### 04/10/2026 — NXT-01: concluído

Checkpoints 58937e6/1f69692/61ef01b/docs-audit7cbdd8a enviados ao origin/codex/study-expansion, push exit 0/upstream configurado. Stage documental22arquivos/66,58KB Gitleaks sem achados, diff cached --check aprovado; inventário87docs/bootstrap19tickets/127critérios/97Markdown/363links passou com C12 ainda pendente de push. C1–C12 agora aprovados, ticket movido para done/concluido, links/quadro/retomada atualizados. Fechamento documental é commit separado, com novo scan/reconferência. Fonte/harness/pacote e fonte congelada do auditor permanecem os de STUDY_EXPANSION/STUDY_EXPANSION_AUDIT. Nenhum serviço/release publicado; próxima ação humana: usar os novos fluxos conforme o guia. Alpha externa permanece parcial.

Reconferência após mover o ticket: inventário87docs/bootstrap19tickets/127critérios/97Markdown/366links locais aprovado. Essas contagens são documentais e não substituem provas externas. Nenhuma alteração de produto/harness após as jornadas finais.


### 06/10/2026 — UI-03: tema e provas Windows

Branch local codex/editorial-dashboard criada de 80e0805, sem alterações prévias e sem subagentes conforme instrução do usuário. Editorial padrão para perfil novo, Oliva e Hoje históricos preservados; dashboard denso, catálogo de projetos principais/secundários e classificação transacional na preferência existente. Sem migration/dependência/lockfile novo. Node inicial 26.3.0; comandos usam runtime local 24.19.0 sem configuração global. Typecheck, 39 testes, pacote Windows e jornadas preview/editorial/settings/journey passaram. Fontes/rascunhos/restart/temas e viewport 1040×760 aprovados; 200 arquivos dist conferidos no ASAR. Inspeção encontrou fundo opaco do grafo cobrindo grid; ajuste final de canvas/paleta e moldura da cidade em empacotamento. C5/C6 aguardam reconferência/documentação final. Não houve commit/push/publicação no pedido atual.

### 06/10/2026 — UI-03: concluído

C1–C6 aprovados; ticket done/concluido, links/quadro/retomada/validação/guia/ADR/design/produto/contratos atualizados. O-015 do grafo opaco corrigido/verificado. Pacote final EXE349861839d77…/ASAR471db19c93e7… conferido com 200 arquivos dist idênticos. Editorial Windows repetido no pacote final com temas/catalogação/reclassificação/restart/draft/1040×760; Knowledge-Backup aprovou grafo/câmera/relação/40 pulsos/upgrade/compras/noite/snapshot/restauração/relaunch real. Settings/Journey/grade completa aprovados antes do último ajuste de apresentação, sem alegar repetição posterior desses roteiros. Capturas reais inspecionadas e compartilhadas; zero pageerror nos roteiros finais. Alterações locais na branch solicitada, sem commit/push/publicação. Nenhuma implementação restante no ticket. Próxima ação humana: selecionar Editorial em Ajustes/Aparência no perfil existente e avaliar; alpha externa segue parcial.

## GAM-03 — implementação e prova inicial, 06/10/2026

Branch codex/city-progression de codex/editorial-dashboard/80e0805, conservando alterações anteriores. Usuário confirmou prestígio opcional, partidas 2–4 min e skins completas antes do início. Janela/IPC limitado, fundo independente, duas geometrias urbanas, cinco produtores/21 tecnologias/27 conquistas/quatro permanentes e Oficina36 etapas/três fases. Typecheck/42 testes aprovados; roteiro inicial sem partidas completas aprovou controles/skin/cultivo/prestígio/draft/restart em Electron Windows. Minimizacão usa evento nativo além de visibilitychange, pois a automação mantém document.hidden false. Ajustes finais de contraste/registro por minuto/fechamento durante carga feitos depois; repetir provas no pacote final. Sem commit/push.

### 06/10/2026 — GAM-03: concluído

C1–C8 aprovados, ticket done/concluido e docs/guia/ADR/estado/validação/quadro atualizados. Pacote completo aprovou QTE140s/calibração159s em relógio real, 36/36 etapas/três fases/recompensas e todos os fluxos de janela/fundo/skins/economia/prestígio/draft/restart. Último ajuste somente CSS da Oficina Editorial, O-016 corrigido/verificado por capturas; main/preload idênticos aos da prova completa. Pacote final EXE9b31036518c5…/ASARc5924ce9fb06… e 201 arquivos dist idênticos ao ASAR. Preview final/roteiro curto reconferido com foco ativo e fundo desligado/Journey R1–R7/YouTube real passaram, nenhum pageerror. PiP foi reposicionado pelo controle Home na regressão, sem force; sessão de foco existente foi retomada corretamente. Typecheck/42 testes e dois econômicos reconferidos; bootstrap/diff de fechamento em CITY_PROGRESSION. Sem migrations/dependências/alterações globais ou commit/push/publicação. Próxima ação humana: Cidade/Vila/Cenário e Produção, Ajustes/Aparência; alpha externa segue parcial. Não há implementação restante.

Reconferência do fechamento: bootstrap21tickets/141critérios/104Markdown/410links aprovado, typecheck final e diff --check aprovados. Dados/EXE/capturas são locais ignorados; fontes e arquivos de outros projetos não foram alterados. Essas contagens documentais não substituem provas externas.

### 06/10/2026 — UI-04: concluído

Branch codex/clean-workspace de codex/city-progression/80e0805, conservando UI-03/GAM-03 locais, sem delegação conforme instrução. Usuário confirmou36 etapas curtas/intensas, um módulo padrão e até três áreas inteiras/PDF/Vídeo ajustáveis; foco/checklist suspensos. Oficina com preparo inicial e sinais consecutivos, fila do motor sem cooldown/efeito imediato, grafo com forças/pan/zoom/foco e áreas isoladas implementados. Preferências/IPC estritos/compatíveis, updates serializados, foco por teclado, fontes/drafts e fila ao fechar preservados; nenhuma migration/dependência/alteração global.

43 testes/typecheck/package Windows aprovados. Pacote final EXE6a723ba82f94…/ASAR1e1b4a0a525f… e201 arquivos dist idênticos; nenhuma fonte de produto alterada após o pacote. Vídeos reais21:40:34, clean-workspace21:41:50 e Journey R1–R721:42:23 (local) passaram no mesmo pacote. QTE5994ms/calibração30539ms com entrada automática e relógio real,36/36 acertos; sem alegar duração humana. Motor61 cliques exatos+40 ao fechar, larguras38,333/28,333/33,333%/restart/foco pausado/PDF2/drafts/fontes byte a byte intactos. Grafo/pan/zoom intermediário/relação real/reduzido e controles1040×760 aprovados; zero pageerror.

O-017 do CSS herdado truncando controles corrigido; O-018 do vídeo alto/retorno com scroll promovendo PiP corrigido e nova regressão completa aprovada. Falhas de roteiro (rótulo/virtualização/heading oculto/posição do PiP/calibração automática/scroll sem conteúdo suficiente) distinguidas das falhas do produto em CLEAN_WORKSPACE; roteiros ajustados sem force ou mocks de integração. Capturas reais inspecionadas/retornadas, guia/ADR0014/arquitetura/sdd/design/produto/regras/gotcha/validação/quadro/retomada atualizados. C1–C8 aprovados, ticket done/concluido. Sem stage/commit/push/publicação; próximos passos humanos: + Módulo/divisores e avaliar ritmo. Contexto de matéria compartilhado, limites na evidência; alpha externa permanece parcial.

Fechamento conferido: node scripts/check-bootstrap.mjs aprovado — 22 tickets, 149 critérios, 107 arquivos Markdown, 436 links locais. Inventário: 97 arquivos em docs, 70 entradas alteradas incluindo os incrementos anteriores e 31 arquivos ainda não rastreados. git diff --check aprovado; scan de whitespace dos 31 arquivos novos sem ocorrências; stage vazio. Capturas/JSON/EXE conferidos como ignorados. Essas contagens não substituem provas externas.

### 06/10/2026 — Entrega de UI-03/GAM-03/UI-04 por PR

Usuário pediu explicitamente PR para main com mensagem detalhada/Mermaid/badges. git fetch origin main identificou2077d25, árvore idêntica ao HEAD80e0805; fast-forward da branch conservou as70 alterações e fontes já validadas. Inventário/revisão seletiva, git diff --cached --check e Gitleaks sobre512,78KB do stage aprovados, sem achados. Bootstrap22tickets/149critérios/107Markdown/436links aprovado. Nenhum pacote/captura/banco/vault ou arquivo de outro projeto staged.

Commit1976aa3 publicado em origin/codex/clean-workspace, push exit0/upstream configurado. Conector GitHub retornou403 Resource not accessible by integration; fallback pela autenticação do helper Git já configurado, somente em memória/sem credencial em arquivo/log, criou [PR #10](https://github.com/rafafrd/Nodus/pull/10). API confirmou aberto/draft=false/base main/head1976aa3/body exato, três diagramas Mermaid/cinco badges Shields.io, verificações locais e limites distinguindo CI/nuvem. Anexo adicionado ao chat. Badge.io inacessível; badges estáticos usam Shields.io/documentação oficial. Nenhum merge/release/serviço publicado. Registro documental de entrega em checkpoint separado, sem alteração de código após o pacote nativo.

### 07/10/2026 — GAM-04, Produção profunda e provas finais

Nova branch codex/deep-production de main/b112df6, PR10 integrado, árvore inicialmente limpa. Pedido explícito autoriza commit/push/PR com prints. Auditoria/code-first preservou Game/ledger/builds; quatro famílias validadas antes do catálogo16/305/284. Engine/conteúdo/curvas separados, Decimal80/BigInt, schema6/backup5–6, recibos reais de estudo, motor secundário, sinais/combos/offline/prestígio e distrito agregado. Valores históricos/documentos de GAM-03 continuam identificados como históricos.

52testes aprovados/typecheck/build/pacote Windows executados em Node24 direto.201assets idênticos ao ASAR, hashes em DEEP_PRODUCTION. No mesmo pacote final: deep-economy com1min real de Foco sem XP, compras100/MAX, eventos e reset/permanente/restart; skins após frame renderizado; clean-workspace com QTE6816ms/calibração31545ms (entradas automáticas reais, não tempo humano),61+40cliques/áreas/grafo/drafts; JourneyR1–R7 preserva fontes/conflitos/PDF/checklist. Nenhuma nuvem/release/merge publicada. O-019/O-020 corrigidos/reconferidos. Três modelos30/45/60min/dia: primeiro prestígio5,15/4,30/4,10dias; sem equivalência com experiência humana.12capturas e JSONs sanitizados de fixture autorizados para PR, sem perfil/banco/vault/EXE.

Documentação econômica/ADR15/guia/validação/quadro/retomada/gotcha atualizada; bootstrap23tickets/157critérios/113Markdown/483links passou antes do stage. C1–C7 aprovados; próxima ação concreta: revisão/stage seletivo/Gitleaks, commit/push e novo PR detalhado para main, depois checkpoint documental de C8.

Entrega Git: commit6d20ce7/push/upstream aprovados. [PR #11](https://github.com/rafafrd/Nodus/pull/11) criado para main/draft=false,3Mermaid/6badges/12capturas; API conferiu corpo exato/head/base e imagem raw200/image/png. Helper Git configurado utilizado somente em memória para autenticação da API, sem credenciais em arquivo/log; nenhuma configuração global alterada. PR anexado ao chat. C8 aprovado/quadro done; checkpoint documental posterior não altera fonte/depêndencia do pacote validado. Próxima ação: revisão humana do PR, sem merge automático.


### 07/10/2026 — IA-01, atividades manuais de estudo

Branch codex/external-study-activities criada de f6d1a67 após inspeção do Git/AGENTS/CLAUDE/gotcha/retomada/código. Seleção explícita de notas/PDF/anotações locais usa pacote JSON completo inspirado no Repomix, sem CLI nova. Contrato1.0/Zod4/JSON Schema/parser estrito alimentam geração/correção/importação; clipboard Windows aguardado e conferido. Snapshot/pedido/draft, atividades/hash/revisões, quiz/sessões e cartões reais em SQLite7 aditivo. Study.review/economia existentes preservados; excerpt ampliado para4.000para conservar o contrato válido. Nenhuma chave/.env/dependência nova/chamada automática de IA.

Typecheck/suíte inicial67/67 aprovados após migration7. Correções e casos novos pertinentes tiveram19/19testes de atividade/revisão aprovados. Build/pacote Windows executados via Node24.19.0 explícito;204arquivos de dist idênticos ao ASAR. Jornada no pacote final: PDF.js3páginas/duas notas/vídeo anotado, clipboard e falha injetada, duplicatas/correção, três reaberturas, quiz10/10com KPIs/explicações, quatro entradas tipo×colagem/arquivo, replay/revisão2,10flashcards/autoavaliação/biblioteca existente, rollback de importação injetado, HTML inerte, fonte alterada/ausente, limite/1040×760 dividido e escolha explícita de pedido de outra matéria. Nove canais negados a outra janela real, zero pageerror/HTTP(S) no renderer.11capturas/manifesto/relatório de fixtures em [validação](../validation/atividades-ia-externa.md); sem alegar provedor real. O-022 corrigido/verificado, documentação/ADR17/quadro/retomada atualizados.

C1–C10 concluídos na entrega local original, com stage vazio e sem commit/push/PR/publicação naquele checkpoint. Nenhuma implementação restante nesta feature; próxima ação humana: usar Prática com materiais próprios e a IA escolhida. ALP-02/C5 e ALP-09 continuam em seus tickets, sem declarar integração externa concluída.

Entrega Git após novo pedido explícito "abre o pr": PR12 já integrado à main/c95aabd; fast-forward com árvore idêntica conserva as fontes validadas. Stage seletivo61arquivos,11capturas de fixtures e272.643bytes de patch; diff --cached --check/Gitleaks8.30.1 sem achados/bootstrap26tickets/176critérios/125Markdown/539links aprovados. Commit6396e32/push/upstream confirmados. [PR #13](https://github.com/rafafrd/Nodus/pull/13) aberto para main/draft=false,3Mermaid/6badges/11capturas fixadas no commit e conferidas200/image/png; API confirmou corpo exato/head/base/61arquivos/mergeable=true e anexo no chat. Conector de criação retornou403 por permissão da integração; API autenticada pelo helper Git configurado concluiu a operação, com credenciais somente em memória e nenhuma alteração global. Checkpoint documental posterior não modifica código do pacote. Próxima ação: revisão humana do PR, sem merge/release/serviço nesta entrega.


### 08/10/2026 — UX-01, escrita e navegação

08/10/2026: UX-01 concluído na branch local codex/notes-navigation de cd3a199, com apresentação DOC-01 preservada de f35ba7d. Escrita imediata/título/modelos/recente/busca por corpo e rascunho/importação múltipla/matéria, captura PDF/comentário/momento com origem legível, cartão/relação contextual e prática com fonte selecionada. Menu/primeiro uso/nomes consistentes sem módulos novos. Typecheck/76testes/build/pacote Windows204assets idênticos/jornada real UX/primeiro uso/restart/MVP R1–R7/IA/player oficial75s/12capturas aprovados; O-023 corrigido. Sem migration/dependência/reset. Alterações locais salvas sem stage/commit/push/publicação. Próxima ação humana: usar a build e avaliar a compreensão com um usuário leigo; alpha externa permanece parcial. [Provas](../validation/NOTES_UX.md).

Domínio: src/shared/note-content.ts, Vault/Study/ActivitySources/IPC/preload; interface: App/ActivityRail/NoteEditor/PdfPane/PdfAnnotations/VideoWorkspace/Flashcards/Activities/Graph/notes-ux.css. CodeMirror esconde prefixo e decora fontes locais sem converter o Markdown. Mudança de matéria compensa o arquivo em falha SQL, mantém caminho para links relativos e resolve referências históricas pela matéria atual. Importação externa conserva originais e desfaz cópia/catálogo em falha. Roteiro scripts/smoke-notes-ux.ts e testes de preservação/rollback/captura/snapshot movido registrados; scripts antigos adaptados ao fluxo imediato e nomes atuais. Fontes do DOC-01 não foram repetidas como prova de produto.

Host global26.3.0 não foi alterado; todos os comandos usaram Node24.21.0 portátil/PATH do terminal. Player oficial/rede real reproduzido; IA permanece intercâmbio manual sem provedor automatizado. Native multi-seleção não automatizada; serviços reais e primeiro uso padrão comprovados. Sem vault/banco/perfil pessoal no repositório;12prints de fixtures e relatórios sanitizados. Alpha/ADRs/modelo/SDD/guia/quadro/gotcha atualizados. Checkpoint documental de fechamento em NOTES_UX; stage vazio.

### Registro documental preservado — DOC-01

README/capturas/provas/ticket de codex/readme-showcase foram restaurados do checkout anteriorf35ba7d antes de UX-01. Mantido histórico de entrega PR14 e limites da main/PR13 conforme README_SHOWCASE. Nenhum novo commit/push/merge por essa preservação.


### 09/10/2026 — GAM-05, entrega local com avaliação humana pendente

Windows11 10.0.26200, Node24.21.0 portátil, Electron44.5.1. Branch codex/farm-projects de cd3a199 e todas as alterações UX-01/DOC-01 mantidas, stage vazio. Projetos materiais permanentes, escolha de posto, estoques1/min/cap200, objetivo/atalhos, três skins e motor proporcional ao catálogo atual. Persistência JSON/SQLite7, custos/recolhimento/recibos/audit atômicos, frações/cap/clock/baseline/backup/prestígio; nenhum reset/migration/dependência nova.

Typecheck/81testes aprovados, simulação inicial real Game/SQLite sem estudo e quatro cenários de sete dias. Sem estudo:5,78dias simulados até prestígio disponível;45min/dia:5,09dias. Postos geraram6.007de Produção por vendas sem mudar esses marcos. Não são tempo humano/retenção observados. Pacote Windows204assets idênticos ao ASAR, jornada farm (1min real/16capturas/ordem/construção/recolhimento/motor/compacta/skins/restart), regressão UX-01 e MVP R1–R7 aprovados. Fonte Markdown/PDF/foco/checklist/dados locais preservados; nuvem/celular da alpha continuam fora dessa prova. O-024/O-025 corrigidos, bootstrap/diff/manifesto/documentação conferidos.

[FARM_PROJECTS](../validation/FARM_PROJECTS.md) contém regras, comandos e evidências. C1–C7 aprovados; C8 não verificado, ticket doing/parcial porque a compreensão por leigo exige pessoa real. Próxima ação: usar o roteiro, registrar respostas sem dados pessoais, corrigir se necessário e só então mover para done. Sem commit/push/PR/release/publicação por este plano.


### 09/10/2026 — UX-02, clareza e animação 3D, entrega local

Windows 11 10.0.26200, Node 24.21.0 portátil, Electron 44.5.1, Three.js 0.186.1. Branch codex/visual-experience de cd3a199, partindo do checkout modificado de GAM-05/UX-01/DOC-01. Baseline de 115 arquivos locais preservada em .local/visual-baseline; nenhum reset ou dado pessoal. Sem dependência/migration/lockfile novos e sem stage/commit/push/publicação.

Hoje/DayOverview e studyNextStep usam o catálogo/checklist existente; tarefa abre matéria e ferramenta. ContentShelf reúne escrita/Markdown/PDF/aulas após fechar seu diálogo; quickNote/newModal encaminham ao estudo antes do primeiro uso. Acervo/menu/estados vazios/quatro temas/compacto conservam contextos e rascunhos. StudySculpture cria livro/páginas/órbita/ponteiro com Three.js; FarmScene dá silhuetas próprias, contorno do próximo projeto, crescimento da construção e atividade limitada pelo estoque. CityEffects usa shader de água, nuvens/pontos/partículas instanciados após estado confirmado; distrito usa 119 objetos independentemente das unidades compradas. Renderer não modifica economia.

Typecheck e 82/82 testes aprovados; referência obsoleta de matéria corrigida no teste da próxima ação. Pacote Windows nativo aprovado e 204 arquivos dist idênticos no ASAR. Sete jornadas no mesmo pacote: visual, notes-ux, farm (um minuto real, estoque/motor/offline/restart), distrito visual, abas, vídeos oficiais pela rede real e MVP R1–R7. Erros de renderer/shader vazios na jornada visual. Rascunhos/divisões/teclado/drag/player/PiP/cinema/fontes/PDF/foco/checklist/conflito conservados. Movimento reduzido/minimização/área oculta e perda real WebGL aprovados; O-026 corrigido. Harness de abas atualizado aos nomes existentes e aguarda WebContents real; O-027 separa captura de gravação para evitar tiles do compositor neste host.

21 capturas originais (18 da jornada nova, três do distrito), dois WebM do canvas real, logs/JSON/hashes sanitizados em [VISUAL_EXPERIENCE](../validation/VISUAL_EXPERIENCE.md). [Relatório de bom dia](../reports/BOM_DIA_2026-10-09.md) e galeria HTML, ADR20, guia, retomada e quadro atualizados. UX-02/C1–C7 concluídos; GAM-05 permanece doing/parcial por C8 humano. Seleção manual de diálogo nativo, outros GPUs, nuvem/celular e provas externas não foram aprovados por este incremento. Próxima ação humana: experimentar Hoje → Adicionar conteúdo/Cidade → Vila e executar o roteiro leigo já existente.

Fechamento: galeria HTML aberta no Edge Windows isolado, 10 imagens/links locais íntegros, vídeos reproduzidos (23 quadros cada) e larguras 1280/480 sem transbordamento. Preservação comparada ao baseline: 100/115 arquivos byte idênticos, todos os 68 críticos/evidências anteriores conservados; 15 alterações esperadas de apresentação/docs e ticket UX-02 movido. Stage vazio. Bootstrap 30 tickets/203 critérios e git diff --check aprovados; manifesto final conferido. Nenhuma edição posterior de fonte do produto.

### 09/10/2026 — UX-03, Home e tema Branco, entrega local

Windows 11 10.0.26200, Node 24.21.0 portátil/PATH do terminal, Electron 44.5.1, Three.js 0.186.1, app 0.1.0. Branch codex/home-white criada do checkout modificado codex/visual-experience de cd3a199; baseline de 164 arquivos. Sem reset, alteração global, dependência, lockfile ou migration.

HomeWorkspace/DayOverview reutilizam home, agora Início, próxima ação/checklist/catálogo e quatro entradas Caderno/Materiais/Revisão/Cidade. Novos perfis começam em Home; fallback de layouts antigos permanece estudo. GSAP dá entrada escalonada, CSS resposta a interação, Three.js plano/shader de luz com câmera/posição fixas atrás de rolagem independente. Livro 3D existente permanece. Movimento reduzido/controle geral/área oculta/minimização e contexto perdido conservam a navegação; cleanup libera GPU/eventos/observadores.

Branco acrescentado ao enum validado sem novo contrato privilegiado; CSS claro próprio, realce de código por variáveis e grafo adaptado. SQLite7, perfil, layouts, rascunhos e fontes anteriores preservados. Teste real de preferência inclui reopen/legado/rollback audit/setting/schema. Typecheck/83 testes aprovados, pacote Windows executado e 204 arquivos dist idênticos no ASAR. Home real valida entrada/hover/tempo/scroll fixo, tema/UI/editor/PDF/grafo/projetos/cidade, reduzido/desligado/minimizado/oculto, restart, WebGL perdido, compacto e primeiro uso. errors/graphicsErrors vazios. Notas UX, Abas com player oficial real e MVP R1–R7 aprovados; R8 externo continua não verificado.

Últimos ajustes somente CSS corrigem raiz selecionada de projeto com ouro claro (O-028) e rótulos da Cidade; pacote/Home/capturas/hashes reconferidos depois deles. Regressões Notas/Abas/MVP imediatamente anteriores, fontes de domínio e componentes iguais. Seletores históricos dos harnesses atualizados de Hoje para Início, e fixtures escolhem estudo explicitamente para conservar sua jornada anterior. Não são mocks de integração.

15 fotos originais, WebM de quatro segundos do canvas real, logs/JSON sanitizados/hashes em [HOME_WHITE](../validation/HOME_WHITE.md). Novo [relatório de bom dia](../reports/HOME_BRANCO_2026-10-09.md), ADR21/guia/ticket/quadro/retomada atualizados. Relatório e provas UX-02 anteriores byte idênticos. C1–C6 concluídos; GAM-05/C8 permanece doing/parcial. Outros GPUs, compreensão humana, diálogos nativos manuais e alpha externa não aprovados por este incremento. Nenhuma implementação restante; usar Início e Ajustes → Aparência → Branco. Sem stage, commit, push ou publicação.

Fechamento: 164 arquivos do baseline presentes, 147 byte idênticos e todos os 89 críticos (main/preload/relatórios/provas anteriores) conservados. Bootstrap 31 tickets/209 critérios e diff aprovados, stage vazio. Clipe reproduzido no Edge Windows isolado: 1252×834/3,93s, 30 quadros decodificados na amostra. Manifesto e 204 arquivos do ASAR conferidos após os últimos ajustes; nenhuma edição posterior de fonte do produto.
