# EXP-01 — Pasta de notas em PDF preto

03/10/2026, Windows11 10.0.26200, Node host/embarcado24.21.0, Electron44.5.1, branch codex/pdf-export a partir de6897adb. Perfil/material explicitamente fictício .local/pdf-export-6Y2vrl. Nenhum mock de IPC/FS/Chromium/print; Downloads do processo de teste foi configurado para a pasta isolada pelo app.setPath real.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | Vault/subpastas e projeto registrado pela UI real; main revalida raiz/descendentes. Unitários/probes de fonte negam traversal/ADS/UNC/links/.git/auxiliares; contratos strict e UUID desconhecido negados. |
| C2 | aprovado | SSR ReactMarkdown/GFM com títulos/listas/citações/tabela/código/Unicode, HTML ignorado/imagem rotulada/link externo inerte. Fontes reais preservadas byte a byte; bloco inicial de frontmatter removido apenas da cópia. |
| C3 | aprovado | PDFs reais de3 e13 páginas; Poppler renderizou todas, inspeção visual de capa/sumário/texto/tabela/código/paginação. A4 594,96×841,92pt; seis pixels de borda por página RGB(0,0,0), sem faixa branca observada. Sumário tem destinos internos; amostra sem ações URI/JS/Launch. |
| C4 | aprovado | Downloads/nome único/wx/fsync; segundo export conserva primeiro. Pasta vazia sem artefato; concorrência aceita uma/nega EXPORT_BUSY. Trigger SQLite real nega audit, remove só saída nova e não mostra recibo. Limites/UTF-8/bytes/quantidade/profundidade/entradas verificados em testes/probes. |
| C5 | aprovado | SettingsData seleciona origem/pasta/mostra caminho/erro/estado. Runtime de5 superfícies print: JSfalse/Nodefalse/sandbox/contextIsolation/webSecuritytrue, sem preload, sessão separada/storage null. Duas chamadas de outro sender FORBIDDEN; só janela principal resta; zero pageerrors. Settings e R1–R7 de estudos passaram no mesmo pacote. |
| C6 | aprovado | Typecheck/28 testes/package/export/Settings/Journey/renderização e scans staged core/UI/docs aprovados. Audit independente/guia/ADR/memória/quadro/inventário/bootstrap atualizados; fef5821/38651b4/32eb884 enviados ao origin/codex/pdf-export, push exit0/upstream configurado. |

## Execução e identificação

npm.cmd run typecheck, npm.cmd test (28/28), npm.cmd run package:win e npm.cmd run test:pdf-export passaram. Prova nativa final2026-10-03T23:36:13.972Z em .local/evidence/export-results.json/export-native-final.log. Contém recibos reais,4 eventos UUID/action/outcome, concorrência, prefs reais das5 superfícies e recusas strict/sender. Trigger SQLite de teste é instalado/removido no banco fictício; saída prévia e fontes conservadas. SSR/helpers são os mesmos usados no fluxo real; bytes %PDF fictícios do unitário são somente prova de escrita/rollback, não de impressão.

npm.cmd run test:settings passou2026-10-03T23:37:02.609Z, e npm.cmd run test:journey passou R1–R7, logs export-regression-settings.log/export-regression-journey.log. Preferências/foto/temas/reduced-motion/gestão/restart, nota/projeto/BOMCRLF/draft/contexto/foco/PDF2/3 e conflito externo conservados. R8 segue não verificado. Vídeos/smooth-ui não foram repetidos neste incremento: suas implementações não mudaram; provas anteriores são de CFG-01.

- release/win-unpacked/resources/app.asar SHA256: D78522E47736BD1137B8B13A0D7A2ABF0CB50AF46A6F3A94BB35B246367F6BDC.
- release/win-unpacked/App Estudos.exe SHA256: 0CDB145AFB54C60B24534F6BB41DFA0609ACCA6844127177331413A793E35226.
- .local/evidence/export-sample.pdf SHA256: dd4122017e33fdb8b7ad7c8a38ea502b55888f6f3cc73dddb54d119741b0bd05.

Hashes identificam artefatos exercitados; não comprovam assinatura/proveniência ou comparação exaustiva fonte↔ASAR. Pacote local x64 sem instalador/assinatura, warnings existentes de chunk/autor/dependências duplicadas. Nenhuma dependency/lockfile/migration nova; schema4 permanece. Core/UI não mudaram após as provas e o suplemento do auditor.

## Revisão dos PDFs

Poppler pdftoppm do runtime disponível gerou export-final-page-1/2/3.png e export-final-long-01…13.png. pypdf6.10/Pillow conferiram dimensão/texto/amostras de borda e destinos internos; registro export-pdf-inspection.json. As3 páginas da demonstração foram vistas integralmente; o caderno13 páginas em export-final-contact.png também foi inspecionado. Capa/TOC, quebras e tabelas/código legíveis; última página longa tem texto restante da fixture de compatibilidade, não página em branco. Captura real export-settings.png mostra origem/pasta/recibo no app, sem montagem. Cópia para entrega em output/pdf/Nodus-demonstracao.pdf tem mesmo hash do sample, conferido em export-source-match.json. Arquivos de evidência/perfis/PDFs são locais ignorados; /output/pdf/ acrescentado ao ignore no checkpoint documental.

Primeiro harness tinha seleção de projectId a partir de resposta catalog tratada como objeto único; corrigido para projects[0].id. Inspeção automatizada inicial da capa esperava título numa linha; normalização de whitespace passou, acentos visuais/textuais preservados. Essas falhas do harness não são provas aprovadas nem regressões de produto.

## Controles, correção e limites

[ADR-0010](../adr/0010-exportacao-pdf.md) registra isolamento e fronteiras. Dois canais específicos guardados/strict. Leitura limitada e revalidada, sem converter/salvar Markdown. Sessão de impressão efêmera própria: CSP default/script/img/font/frame none, só style inline; request exato da URL interna, popups/navegação/redirect/downloads/permissões negados. JS/Node/preload desligados. HTML não confiável não ganha execução ou fetch. Timeout60s cobre load/print, não parse/SSR anterior; resultado até32MiB. Byte/entrada/profundidade são limites concretos, não orçamento universal de CPU/memória.

O-012: versão inicial gerava PDF sem evento de sucesso. Auditor independente observou CWE-778; export-output agora grava/fecha, exige audit UUID opaco e remove saída nova em falha. Unitário, native e probe independente com trigger SQLite real aprovaram rollback e privacidade do evento. Saídas anteriores/fontes/drafts permanecem. Não há transação conjunta FS/SQLite: crash entre etapas e falha de remoção permanecem limites; erro não confirma sucesso. Outro processo da mesma conta Windows continua capaz de acessar arquivos/banco.

Origem é só vault/projeto registrado; folder vazio é raiz inteira e slash é relativo. Pastas ocultas, .git, node_modules, dist e release/links/junctions ignoradas. Até200 notas,2MiB por nota/6MiB total,4000 entradas/16 níveis; erro pede recorte menor. Coleta não garante snapshot de toda a pasta contra alterações externas simultâneas. Apenas Markdown UTF-8 salvo entra; frontmatter inicial oculto, fórmulas/wikilinks fonte, imagens texto, links externos inertes. PDF é derivado de leitura, sem imagem/PDF anexo/código ou backup completo, sem histórico/lista persistente de exports. Download novo em cada operação, sem sobrescrever nome existente.

## Auditoria e checkpoints

[Auditoria independente](../security/PDF_EXPORT_AUDIT.md): APPROVE WITH MITIGATIONS para o recorte pessoal/local; um Low/CWE-778 corrigido e verificado, nenhuma vulnerabilidade nova confirmada aberta. Auditor confirmou4/4 testes e probes próprios reais FS/Store/HTML/schema, incluindo34 checks e logging/rollback, sem abrir Electron. Freeze inicialb225d61922b4b12d4e61f7e9eda24f1ffba0fd6a40d9979c662639821108530c + final próprio04b47c95ee6a087e130a405b56233250418605ad42022b37c0edca19c2383816/14 arquivos; não são hashes do pacote. Root comparou14 arquivos correntes com suplemento:0diferenças, export-source-match.json. Advisory High existente de tooling continua: prod0/completo8High de um advisory, sem remediação alegada. Gitleaks staged core9 arquivos/23,65KB e UI5 arquivos/14,16KB passaram, incluindo testes/harness; diff cached --check aprovado. Handoff do auditor registrado em memória/arquitetura/guidelines e O-012; docs/memória/ignore pós-freeze receberam scan próprio24arquivos/46,52KB e checkpoint32eb884. Core fef5821/UI38651b4/docs32eb884 enviados ao origin/codex/pdf-export, push exit0/upstream configurado em03/10/2026. C1–C6 aprovados; movimento do ticket/quadro e reconferência ficam no checkpoint documental de encerramento.
