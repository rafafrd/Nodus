# CFG-01 — Configurações, temas e perfil

03/10/2026, Windows 11 10.0.26200, Node host/embarcado 24.21.0, Electron 44.5.1, branch codex/settings-profile a partir de 92cc357. Pacote local x64 real, perfil fictício .local/settings-ncTLPa. Foto de demonstração é raster sintético gerado pelo nativeImage do Electron; a importação/IPC/SQLite/FS são reais.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | Quarta área/Ajustes; DOM de nota/canvas retido, draft de projeto/nota conservado na navegação/restart. Atalhos ocultos/cinema exercitados nas regressões descritas abaixo. |
| C2 | aprovado | Oliva/Grafite/Azul noite persistidos, três backgrounds computados distintos; CodeMirror de projetos usa paleta nova sem recriar editor. |
| C3 | aprovado | CSS duração 0s com off; câmera imediata/pose estável, on restaura movimento, preferência do Windows prevalece mesmo com checkbox on. Mesmo canvas. PiP reproduz durante off/cinema. |
| C4 | aprovado | Input nativo PNG/JPEG decodificados e normalizados 256×256; SVG disfarçado rejeitado conserva foto; remoção conserva nome; novo upload/nome/tema/off retomados após restart. Unitários verificam limites/strict/rollback. |
| C5 | aprovado | Contagens: 2 matérias/2 notas/2 PDFs/1 projeto, drafts reais, caminhos e DB bytes; API shell.openPath retornou sucesso para data da fixture. Argumentos extras/caminhos arbitrários negados; seis canais de sender diferente recusados. |
| C6 | não verificado | Typecheck/24 testes/package/test:settings/test:videos/test:journey/test:smooth-ui passaram; audit/documentos/checkpoints/push em fechamento. |

## Execução e pacote

npm.cmd run typecheck e npm.cmd test passaram, 24/24 testes. Três novos unitários usam Store/SQLite/FS reais: preferências/rollback/malformed JSON sem reset, dimensões e payloads inválidos, gestão/enum/pastas ausentes. npm.cmd run package:win passou; warnings existentes de chunks/autor/referências duplicadas não são falha. Nenhuma dependência/lockfile alterada; Store continua schema v4.

npm.cmd run test:settings final passou em 2026-10-03T22:58:35.202Z, zero pageerrors; .local/evidence/settings-results.json e settings-final-settings.log. Janela real resized por BrowserWindow.setContentSize 1040×760 e restaurada; contagem/pastas/version consultadas pelo preload. Outro BrowserWindow controlado é somente probe do harness, não superfície com privilégios do produto. Rascunho de projeto retoma sem modificar fonte BOM/CRLF antes do Save explícito; nota salva e contexto conservados.

Capturas sem montagem: .local/evidence/settings-profile.png, settings-appearance.png, settings-data.png e settings-compact.png, feitas no pacote pelo Playwright. Nome “Perfil de demonstração” e raster são fixtures identificadas. Diretório/reprodução/fluxos reais não são substituídos por mocks.

Tentativas iniciais do harness tiveram seletor incorreto e espera por botão legitimamente disabled; corrigidos os seletores. Checkbox controlado confirma após IPC, então click e espera pelo dataset substituíram check/uncheck com expectativa síncrona. Essas falhas de automação não contam como provas aprovadas; a execução final exit0 é a evidência acima.

- release/win-unpacked/resources/app.asar SHA256: 08F62C1D9197BBE07118BF48076F6FC16847AC21697A01C0DAF3CD00E48EE5EA.
- release/win-unpacked/App Estudos.exe SHA256: ED36D014CF9FC59F69BF56940F37E858902BCB1FBDCED49742EA325F10871CF3.

Hash identifica artefato exercitado, sem comprovar comparação exaustiva fonte↔ASAR/assinatura/instalador. Source freeze e provas próprias do auditor são separados.

## Fronteiras e limites

Seis capacidades específicas preferences:get/update, profile:photo/photo-remove e app:management/folder usam handle existente, validação Zod strict e checagem sender/mainFrame/origem. UserPreferences salva preferências/audit em transação. Nome é texto React; foto original/EXIF/caminho não entram no audit. Perfil é local, sem conta/nuvem ou avatar remoto. PNG/JPEG até 5 MiB/4 MP/4096 px por lado, saída PNG 256; validação de header e teste nativo não esgotam formatos/bugs do codec.

Temas mudam a interface e editores; materiais naturais Three e cores semânticas de estado/sintaxe permanecem próprios. Todas as três paletas são escuras. Off elimina movimento decorativo e transições, preservando tempo essencial de desafios/foco/vídeo; Windows reduzido continua prevalecendo. Preferências inválidas carregam defaults sem apagar raw existente; edição explícita confirma um novo valor validado.

Gestão não apaga, exporta automaticamente, atualiza o executável ou cria conta. Contagens não representam integridade de todos os arquivos referenciados; tamanho é banco/WAL/SHM, não disco completo. shell.openPath do diretório fictício retornou sucesso; conteúdo/visual da janela do Explorer do Windows não foi inspecionado. Backup necessita perfil/vault e arquivos originais de PDFs/projetos com app fechado. Alpha externa ALP-02/C5, ALP-09/R8 permanece pendente.

## Regressões e auditoria

No mesmo pacote final: npm.cmd run test:videos, npm.cmd run test:journey e npm.cmd run test:smooth-ui passaram, exit0. Logs settings-final-videos.log, settings-final-journey.log e settings-final-smooth-ui.log. Reprodução/PiP/cinema/isolamento/crash/retry, R1–R7 de estudos/PDF2/3/foco/conflito, transições/retarget/DOM/rail/engine/upgrade/BOMCRLF/QTE oculto/movimento dinâmico/compacto foram exercitados. R8 continua não verificado; não houve prova de nuvem/celular.

[Auditoria independente](../security/SETTINGS_AUDIT.md): APPROVE WITH MITIGATIONS para o MVP pessoal/local. Freeze inicial34a7c877… e suplemento final1d13b934… compõem30 arquivos do incremento comparados sem divergências. Auditor executou3 testes/probes próprios de SQLite/FS/schema/header/movimento e scan de segredos das capturas/suplementos/relatório. Nenhuma vulnerabilidade nova confirmada aberta; advisory High existente de tooling permanece com exposição avaliada, sem remediação alegada (produção0/completo8High de um advisory). Pacote/jornadas Windows são do implementador; o auditor conferiu fontes/logs/hashes, sem executar Electron. Memória recebeu o handoff de limites/controles/identidades e O-011.

## Correção observada durante regressão

A primeira build CFG-01 tinha ASAR 37E3932C…/EXE 21EE8431…, agora históricos. A regressão de vídeo revelou abertura depois de restart com guest presente mas superfície ausente: open publicava closed ao descartar recursos antigos, e a mensagem podia limpar video no renderer depois da resposta. Probe real .local/evidence/settings-player-probe.log registrou closed/loading/ready e surfacefalse; crash emitia error mas retry também ausente. O-011 registra causa/reprodução, sem atribuir a falha só ao harness.

VideoPlayer agora usa dispose privado silencioso na substituição, e close explícito continua publicando closed. URL permanece validada antes do descarte, callbacks antigos continuam condicionados à identidade da view. Nenhuma mudança de isolamento/sessão/bounds. Novo package:win e typecheck passaram; Settings foi repetido no novo pacote identificado acima. test:videos final passou em 2026-10-03T22:59:01.257Z: após restart exige guest/DOM/superfície sem closed transitório, crash real e botão/retry recuperado. PiP tocando nas Configurações com off/cinema/Escape conserva guest e reprodução. Captura nativa incluindo child view: .local/evidence/videos-pip-settings.png; log settings-final-videos.log e JSON videos-results.json. Corrida inicial do harness também foi corrigida com espera limitada pelo guest/DOM real, em lugar de apenas ausência de loading. A aprovação é da última jornada exit0 no novo pacote.

## Checkpoints e scan de stage

Core 8f1a47e (8 arquivos/13.42KB), UI 5eb2142 (20 arquivos/45.59KB) e correção player c68a020 (2 arquivos/2.58KB). Diff cached --check e Gitleaks 8.30.1 staged passaram em cada checkpoint, exit0/sem achados; inclui testes e harnesses/fixtures. Commits locais, push/documentos finais ainda pendentes neste registro. Fonte de produto/harness permanece a exercitada no pacote final; docs/memória pós-freeze são checkpoint separado.
