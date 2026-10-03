# MED-01 — YouTube, cinema e PiP

03/10/2026, Windows 11 10.0.26200, Node24.21.0/Electron44.5.1, branch codex/youtube-cinema a partir de2690372. Execução real do pacote local x64, perfil fictício .local/videos-WrVART. Não foi usado mock de YouTube/IPC/SQLite/FS.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | Testes de URL/ID/tempo/host/argumentos, SQLite real/dedup/rollback; UI salva, rejeita host falso, mantém UUID/seleção e remove por matéria. |
| C2 | aprovado | Testes de migração v1/v2/v3→v4, fonte/draft/mesa/economia preservados; lista/seleção retomadas após restart e nenhuma conexão automática. PDF A página2 conservado. |
| C3 | aprovado | YouTube oficial carregado/reproduzido com entrada nativa; guest sem desktop/require/process/preload, flags sandbox/contextIsolation/webSecurity. Sessão diferente/efêmera; popup/navegação/microfone negados, seis canais negados de outra janela controlada. |
| C4 | aprovado | Cinema 480ms com poses de transição, contexto de matéria e Escape recebido no guest; mesma identidade WebContents nas vistas. |
| C5 | aprovado | PiP movido por mouse e setas, permanece no Explorer e contido em1040×760; voltar seleciona origem, close destrói player e conserva link. |
| C6 | aprovado | Reprodução segue com currentTime crescente/pausedfalse nas mudanças, movimento reduzido, diálogo esconde view, scroll real promove PiP; teclado QTE sob cinema não altera etapa/acerto e área volta após fechamento. Crash real do renderer remoto mantém mesa/link e retry carrega YouTube novamente. |
| C7 | não verificado | Typecheck,21 testes,pacote/jornada e regressões passaram; audit independente final/memória/documentos conferidos; scan do stage documental/commit/push em fechamento. |

## Comandos e prova externa

npm.cmd run typecheck e npm.cmd test passaram (21 testes). npm.cmd run package:win passou; warnings existentes de tamanho de chunks/autor ausente/referências duplicadas não foram tratados como falha. npm.cmd run test:videos passou em2026-10-03T21:57:46.686Z no pacote abaixo. Resultado: .local/evidence/videos-results.json e videos-native.log. M7lc1UVf-VE é o vídeo oficial de demonstração do Google for Developers, não um vídeo simulado; identificador/request construídos pelo produto. Clique de Play veio de webContents.sendInputEvent no guest, tempo avançou com readyState real. Rotina executeJavaScript do harness inspeciona estado/DOM; ela não faz parte da aplicação nem comprova permissão de eval do renderer.

Capturas reais de janela via Electron desktopCapturer, incluindo o child view: .local/evidence/videos-desk.png, videos-cinema.png, videos-pip-explorer.png e videos-compact-pip.png. As imagens não foram montadas/editadas. capturePage apenas do renderer omite o child view; não usar o quadro preto daquela inspeção como prova de vídeo ausente.

O roteiro ampliado teve uma interrupção do probe de janela de teste por fechar antes de aguardar a resposta e duas asserções de PiP cujo setup ainda não tinha rolagem. Corrigidos await e cenário de overflow real da grade; a última execução exit0 é a evidência de aprovação. Um probe de session.enableNetworkEmulation não bloqueou a rede do novo guest e falhou em demonstrar offline; não é prova aprovada de conexão perdida. A jornada final usa forcefullyCrashRenderer apenas no guest de teste e prova erro de processo/retry real. Perfis fictícios/resultados anteriores permanecem locais; nenhuma correção destrutiva em dados pessoais.

## Identidade do pacote

- release/win-unpacked/resources/app.asar, SHA256: BCBED04D7957E2BB2CB1DEE7B6E5B67627C632EA1E3E876924AAE0B90C3A1970.
- release/win-unpacked/App Estudos.exe, SHA256: B2B040513A472D70E6F001BEC916987BD4DC715C8AB729CCDDBA9A573B3532F6.

Hash identifica o artefato executado, sem afirmar comparação exaustiva fonte↔ASAR ou assinatura. Provas próprias do auditor, source freezes e scan de stage ficam separados.

## Fronteiras e limites

src/shared/videos.ts normaliza URLs com host exato/HTTPS/ID11/tempo até24h, sem parâmetros de tracking/HTML. src/main/videos.ts transaciona referências/audit. Storev4 altera schema sem reset, Desks valida vínculo por matéria. src/main/video-player.ts cria o guest isolado e limita bounds à janela; src/renderer/VideoWorkspace.tsx controla biblioteca/movimento/modos. CSP principal permaneceu frame-src none. Sem dependência/chave/servidor/execução/download novos.

PiP é interno ao app; não é janela always-on-top do sistema. Existe um player; é preciso abrir e usar Play. A rede/identidade configuradas foram aceitas no vídeo exercitado, sem garantir disponibilidade de outros vídeos, contas/regiões/restrições de incorporação. Erro de conexão/processo é indicado com nova tentativa; erros do vídeo são apresentados pelo player oficial. Crash/retry remoto foi exercitado, sem esgotar suas variantes. Queda de conexão/rede lenta/restrições de idade/região/anúncios/login não foram aprovadas por essa prova. Sessão é efêmera, mas os domínios remotos recebem conexão/dados usuais ao abrir. Referer usa appId local; publicação/identidade de instalação ainda não verificadas.

Gates de área são necessários além de inert: o auditor reproduziu no primeiro recorte um QTE reagindo sob cinema em JSDOM/SQLite real; fonte corrigida e negação também exercitada no pacote. [Audit](../security/YOUTUBE_AUDIT.md) registra classe/linha/correção e limita suas próprias provas. Alpha externa ALP-02/ALP-09/R8 permanece pendente.

## Regressões no mesmo pacote

npm.cmd run test:journey, npm.cmd run test:engine-explorer e npm.cmd run test:smooth-ui passaram depois do package final, exit0. Logs em .local/evidence/videos-regression-test-journey.log, videos-regression-test-engine-explorer.log e videos-regression-test-smooth-ui.log. R1–R7 de estudos, preservação BOM/CRLF/save/conflito/recovery/restart de projetos, motor/QTE/skillcheck e transições/reduced-motion/retarget/câmera foram exercitados. R8 continua fora do recorte; não houve execução de nuvem.

## Checkpoints de fonte

Domínio/isolamento/migração/testes em d19c316; interface/cinema/PiP e harness final em 228c15f. Nenhuma dependência/lockfile foi alterada. Gitleaks 8.30.1 do stage core12 arquivos/22,32 KB e interface6 arquivos/43,10 KB passou exit0, sem achados; inclui testes/fixtures/script. Scan documental final e push ainda pendentes nesta revisão. Provas do auditor têm manifestos próprios em YOUTUBE_AUDIT e não são atribuídas retroativamente aos commits.

## Auditoria independente final

[YOUTUBE_AUDIT](../security/YOUTUBE_AUDIT.md): APPROVE WITH MITIGATIONS para MVP pessoal/local; 18 arquivos comparados ao freeze56563e23… + suplemento final de harness1b999d0e…, sem diferenças. Auditor executou probes reais de SQLite/FS/URL/migração/rollback/refs e 4 testes finais, além de Gitleaks das capturas/suplementos/relatório. Low de teclado sob cinema corrigido; nenhum achado de código confirmado aberto. npm audit próprio atual: produção0/completo8High de um advisory de tooling com precondições/exposição local avaliadas; não declarar remediado. Auditor não executou Electron; fonte congelada/ASAR/hash e jornada nativa conservam identidades distintas. Memória de arquitetura/guidelines e O-010 receberam handoff.
