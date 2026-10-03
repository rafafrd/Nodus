# MED-01 — auditoria AppSec do YouTube, cinema e PiP

Data: 03/10/2026. Nodus pessoal/local, Windows nativo, Electron/React/TypeScript/SQLite. Autorização: pedido do usuário de auditoria independente por agente, conforme o anexo AppSec. Este parecer segue suas oito fases, respeitando as capacidades existentes do projeto. O auditor não alterou código do produto, abriu Electron, fez commit/push nem publicou serviço.

**Decisão: APPROVE WITH MITIGATIONS para a fonte final e o suplemento de harness identificados abaixo.** Revisão, comparação final e provas próprias concluídas. Um problema Low de teclado sob cinema foi reproduzido e corrigido. Não há achado de código aberto confirmado; o advisory High de tooling permanece com exposição avaliada. O veredicto se limita aos bytes identificados, sem certificar publicação ou equivalência fonte/binário.

## Identidade e cobertura

AGENTS.md, CLAUDE.md, gotcha.md, ALPHA_STATE, MED-01, arquitetura/guidelines da memória, manifests, lockfile e o anexo completo foram lidos. `project-memory-keeper` não estava disponível; houve leitura direta e handoff explícito na fase 7. Auditoria manual, sem invocar novo scan canônico do plugin ou atribuir um selo UI-02/GAM-02 a MED-01.

| Artefato | Identidade |
|---|---|
| Baseline / branch | `2690372af781e8609160c9d8c73de7b6eef46e84` / `codex/youtube-cinema` |
| Freeze inicial do auditor | `.local/med01-audit-a374905b`, 169 entradas, digest `0ec03457676efb1c3399258a1b762e98bc5dbb6a465b972e0cab399993b7f78a` |
| Suplemento do auditor | `.local/med01-delta-f8554cc1`, seis entradas, digest `78c9bc79965d2ad26fc9af2e952934c762565a981b4ebabc0bf2f3f2cbb8f665` |
| Fonte final congelada | `.local/med01-audit-final-9e410450`, 171 entradas, digest `56563e23d3e81caa067906c3dca0f49afd1e37d8601990751c052eec043c7595` |
| Suplemento final de harness | `.local/med01-harness-final-e1de9a76`, uma entrada, digest `1b999d0efcd6cc0523eeb50735c2b5c85c2713ff2c5eea11f424bb7707edf913`; `scripts/smoke-videos.ts` SHA256 `de47334283ff32458507d73be18657b76f8827edce2bcac98d01641707065e56` |
| Lockfile | SHA256 `30f06ba6e378447dd959ab2eec399a15715cc31c2dca5ef03b300d0cd59ec720`; sem alteração de dependências |
| Provas próprias | `.local/med01-evidence`; scripts de probes ignorados em `.local/med01-probe-*.ts` |

O freeze foi feito antes da revisão; origem e cópia tiveram SHA256 comparado. Os manifestos registram caminho/hash/tamanho, e o digest deriva da lista canônica caminho+hash. O suplemento preserva os novos bytes separadamente: player, VideoWorkspace, App, novo teste de vídeos, harness nativo e alias npm. Não reatribui mudanças ao digest inicial. A captura final mantém os documentos iniciais e sobrepõe apenas os 18 arquivos do incremento; os 171 hashes foram conferidos. Depois dela, houve somente o suplemento de harness de crash/retry descrito na fase 6, capturado e revisado separadamente; não houve novo delta de produto. Na comparação de fechamento, os outros 17 arquivos coincidem com a captura final, e o harness atual coincide com seu suplemento. Os commits do implementador `d19c316` e `228c15f` identificam o checkpoint; a comparação mede bytes, sem substituir os digests. Todas as referências de linha abaixo usam a captura final, exceto o local do achado inicial explicitamente indicado.

Cobertura de código/dependências/scripts/testes do incremento: `package.json`; main `desk.ts`, `index.ts`, `store.ts`, `video-player.ts`, `videos.ts`; preload `index.ts`; renderer `App.tsx`, `Icon.tsx`, `VideoWorkspace.tsx`, `videos.css`; shared `contracts.ts`, `videos.ts`; testes `game.test.ts`, `projects.test.ts`, `store.test.ts`, `videos.test.ts`; script `smoke-videos.ts` — **18 arquivos** revisados. Lockfile e suporte de notas/drafts, projetos, domínio do jogo, gates de teclado, CSP e sessão/protocolo foram conferidos quando necessários. O relatório não refaz a auditoria inteira do aplicativo nem sela os documentos de fechamento posteriores.

## 1. Design e ameaças — STRIDE

| Ativo / fronteira | Ameaça e cenário | Probabilidade / impacto local | Controle conferido | Limite |
|---|---|---|---|---|
| Vault, DB e IPC; remoto → main | Spoofing/elevação: script remoto tenta invocar operações de notas/projetos/jogo | Baixa após controles / acesso e alteração de dados locais | WebContents separado, sem preload/Node; sender+mainFrame+startURL antes do schema; API específica | Execução nativa do auditor não realizada; provas do implementador têm autoria separada |
| Rede / sessão do usuário | Disclosure/SSRF: link salvo aponta a localhost/arquivo/host parecido ou remoto acessa outros destinos | Média antes da validação / acesso indevido ou vazamento | Parser de hosts exatos/ID, URL embed construída, sessão em memória distinta, allowlist HTTPS, permissões e navegação negadas | Famílias Google/YouTube e anúncios ainda fazem rede; filtro URL não é firewall de todos os protocolos |
| Biblioteca e refs | Tampering/repudiation: ID de outra matéria, duplicação ou falha do audit deixa mutação parcial | Média / biblioteca/seleção incorreta | UUID, ref por matéria, UNIQUE e SQL parametrizado; add/remove e audit na mesma transação | DB local permanece controlável pela conta Windows |
| Notas/PDF/projetos/jogo antigos | Tampering/DoS: v4 reseta ou deixa migração parcial; cinema descarta buffer | Baixa após controles / perda de estudo | Migração aditiva transacional; editor conservado; navegação/retorno usa stash/flush existente | Sem atomicidade conjunta FS/DB nem prova exaustiva de todas as corridas legadas |
| Tentativa de jogo / teclado | Tampering: tecla do cabeçalho do cinema chega ao jogo coberto | Reproduzida / alteração de tentativa local | Gate cinema acrescentado aos activeArea; main conserva relógio/recompensa/replay | Low corrigido; inert sozinho não cancela listener global |
| Janela / reprodução | DoS e confusão: popup/dialog/download, child view cobre controles ou player oculto sobrevive ao fechamento | Média / interação e recursos locais | Deny de janelas/permissões/downloads/dialogs; bounds no main; fallback PiP; close destrói WebContents | Visibilidade não equivale a parar áudio; teardown é distinto de minimizar/ocultar |

Nova fronteira: abrir um vídeo conecta explicitamente uma superfície remota à janela local. Salvar/listar links e restaurar seleção não abrem o player nem fazem chamada externa. O aviso de rede aparece na biblioteca. Não há chave de API, IdP, tenant, nuvem ou autenticação implementada neste recurso.

## 2. Diff — controles e cenários concretos

| Cenário | Controle na fonte revisada |
|---|---|
| `youtube.com.attacker`, userinfo, porta não padrão, file/data/javascript ou ID com traversal chega a loadURL | `shared/videos.ts:23–38` parseia URL, exige HTTPS/hosts exatos e ID de 11 caracteres; `:11–22` limita tempo seguro a 86400. `:46–49` reconstrói embed a partir de ID/tempo validados, sem copiar query arbitrária. Player suplementar `:22` valida a URL antes de criar guest ou fechar o anterior |
| Renderizador passa URL/payload genérico ao player | `main/index.ts:47–52` recebe refs e layout específicos; open resolve vídeo no DB. `:36–38` valida webContents principal, mainFrame, startURL e Zod strict. `preload/index.ts:4–11` expõe somente canais/callbacks fixos; listeners têm unsubscribe |
| Matéria B lê/remove/seleciona vídeo A | `main/videos.ts:13–16` exige id+subject_id, `:10` limita list; `main/desk.ts:19–20` valida todas as refs por matéria. Schema strict rejeita campos extras; SQL bind impede conteúdo do título de virar SQL |
| Reenvio de link duplica dados ou audit parcial mente sobre remoção | `main/videos.ts:21–27` deduplica por YouTube ID/matéria, conserva o item anterior, limita 200 e insere com audit transacional; `:29–35` limpa refs/remove/audita na mesma transação. UNIQUE e foreign_keys oferecem outra camada |
| Transição cinema/PiP recria player ou callbacks antigos alteram o novo | `main/video-player.ts:21` conserva o mesmo vídeo/view; callbacks de load/crash conferem identidade da view antes de publicar. `VideoWorkspace.tsx` altera apenas retângulos/modo; fila de layout retém o mais recente, cleanup mata tween/observers/listeners |
| Título de vídeo vira HTML/script ou ref arbitrária vira arquivo/execução | React renderiza título como texto; não há dangerouslySetInnerHTML, eval/Function, fs/shell/exec genérico nem token em localStorage adicionado. Ícones são SVG fixo. Player não recebe o conteúdo de notas/projetos |

Nas refs locais, a separação é integridade por matéria, sem inventar isolamento entre usuários/tenants. Não se trata de autorização cloud. Economia e desafios continuam autoritativos no main; cinema/PiP não calculam preço, tempo, prêmio ou pontuação.

## 3. Segredos

Gitleaks **8.30.1**, regras padrão, modo diretório, redact 100%, max-decode-depth=5: freeze inicial ~1.14 MB, suplemento ~72.06 KB, freeze final ~1.16 MB e suplemento final de harness ~17.47 KB, todos **exit 0, zero achados**. Incluídos testes, fixtures, scripts e documentos presentes nas capturas, sem isenção para payloads de teste. Artefatos `gitleaks-initial.json`, `gitleaks-delta.json`, `gitleaks-final.json` e `gitleaks-harness-final.json`, listas vazias. O próprio relatório de fechamento também foi verificado separadamente, com resultado em `gitleaks-report.json`.

Perfis/vault/bancos pessoais, node_modules, builds e `.local` não entram no inventário Git da fonte. Este é scan incremental com capturas de fonte; não é repetição fresca de todo o histórico Git. O scan integral histórico anterior permanece uma evidência histórica, sem cobrir novos bytes. Arquivos de fechamento posteriores precisam de checagem staged própria.

## 4. Dependências

Não houve dependência nova, e o hash do lockfile coincide com a base. Executados pelo auditor no freeze: `npm audit --omit=dev --json` **exit 0/zero vulnerabilidades**; completo **exit 1/oito entradas High, zero Critical, um advisory único**. Electron é runtime embarcado apesar de devDependency; audit omit=dev sozinho não o aprova. Relatórios `audit-production.json` e `audit-full.json`.

**GHSA-ch52-4w7c-c8xp / CVE-2026-93748 / CWE-524** afeta http-cache-semantics <=4.2.0: cache HTTP compartilhado pode divulgar respostas autenticadas entre usuários por tratamento de max-stale. Consulta oficial em 03/10: nenhuma versão corrigida; High 8.7 CVSS4. npm informa 7.5 CVSS3.1. [Advisory oficial](https://github.com/advisories/GHSA-ch52-4w7c-c8xp).

Cadeia existente: electron-builder/app-builder-lib → @electron/get 3.1.0 → Got 11.8.6 → cacheable-request 7.0.4 → http-cache-semantics 4.2.0. O downloader instalado passa opções para Got; Got inicia cache undefined e só usa cacheable-request quando cache é configurado (`got/dist/source/index.js:65`, `core/index.js:1088`). A configuração do projeto não habilita cache HTTP compartilhado/autenticado. Cache de artefatos do downloader e cache Chromium da sessão YouTube são outros mecanismos; playback não usa esta cadeia npm de build.

Mitigação/exposição local já reconhecida na memória: conservar essa configuração, acompanhar correção compatível e reavaliar ao alterar cache/CI/distribuição. Não foi corrigida a CVE nem aplicado automaticamente o downgrade sugerido pelo npm; a mudança precisaria de prova. A superfície remota aumenta a importância de atualizar Electron conforme seu ciclo, sem inventar uma CVE runtime que o audit não reportou.

## 5. Sessão, navegação, permissões e rede

`main/video-player.ts:10` usa partition `youtube-player`, sem prefixo persist e diferente da sessão padrão. Electron documenta que isso é uma sessão em memória; não equivale a ausência de cookies durante a execução. [Sessões Electron](https://www.electronjs.org/docs/latest/api/session#sessionfrompartitionpartition-options).

Na fonte suplementar, `:24–32`: nenhum preload; sandbox/contextIsolation/webSecurity true; Node desligado na página, subframes e workers; webview e navegação por drag desligados; disableDialogs true; popups negados; navegação principal e redirects principais negados, subframes limitados pela allowlist. Permissão request/check e downloads são negados (`:12–15`); sessão não registra o handler study da sessão principal. Não se invoca shell.openExternal nem se ignora erro TLS. A CSP da mesa permanece frame-src none e sem unsafe-eval; styles unsafe-inline preexistente não foi ampliado para scripts. A mesa não recebe iframe remoto; o WebContents separado não herda a CSP da mesa, e seus controles principais são sessão/preferências/IPC/navegação.

Allowlist `shared/videos.ts:40–45` aceita apenas HTTPS, sem credenciais/porta não padrão, com fronteira de hostname e famílias YouTube/Google necessárias ao player/mídia/assets/anúncios. Localhost/IP/file/study/data/hosts parecidos são negados no predicate. O resultado de um predicate não é uma prova de pacote que bloqueou cada conexão. Eventos de navegação cobrem tentativas iniciadas por página/usuário; loadURL programático não emite esses eventos, por isso a construção/validação da URL e o webRequest também são necessários. [Navegação Electron](https://www.electronjs.org/docs/latest/api/web-contents#event-will-frame-navigate).

Hardening de WebRTC foi recomendado sem tratar o caminho inicial como exploit reproduzido. A fonte suplementar configura `disable_non_proxied_udp` (`video-player.ts:28`). A API limita a exposição de IP e o transporte UDP não proxied, mas admite TCP e UDP por proxy; não representa bloqueio universal de WebRTC/rede. Não houve probe próprio de sockets/ICE. [API da versão Electron 44.5.1](https://github.com/electron/electron/blob/v44.5.1/docs/api/web-contents.md#contentssetwebrtciphandlingpolicypolicy).

Referer é constante com identidade do app, sem caminho do vault/título/matéria; origin e tempo são parâmetros construídos. A política strict-origin-when-cross-origin corresponde à recomendação técnica oficial do embed, e headers em WebViews desktop são uma técnica documentada. Isso identifica o cliente; não autentica a sessão nem constitui validação de distribuição pública. [Identificação do player YouTube](https://developers.google.com/youtube/terms/required-minimum-functionality#api-client-identity-and-credentials).

Bounds são inteiros validados e limitados novamente ao content size no main (`video-player.ts:43–48`); view menor que 200×200 fica invisível. No renderer, child view não herda clipping CSS: o suplemento detecta slot fora da área de scroll/pequeno e muda para PiP; resize/scroll capturado e ResizeObserver recalculam. O último delta de produto, `VideoWorkspace.tsx:124–138`, acompanha a pose do slot por RAF somente com vídeo inline, atualiza bounds quando a superfície está idle e a geometria mudou, promove PiP se houver clipping e cancela RAF ao mudar modo/desmontar. Esse delta foi lido integralmente, sem autoridade nova. Cinema bloqueia shell/rail e oferece Escape no DOM e no WebContents remoto. Fechar destrói a view com waitForBeforeUnload=false (`video-player.ts:51–55`); ocultar/layout sozinho não afirma parada de áudio.

## 6. Achado e validação própria

### [LOW, corrigido no suplemento] Cinema não suspendia o teclado global do jogo

**Arquivo:** `src/renderer/App.tsx:196` da captura inicial; handler atingido em `Arcade.tsx:9–13`. **Classe:** CWE-841 / STRIDE Tampering. **Ativo:** tentativa e ações locais do jogo, sem bypass de preço/relógio/replay do main.

**Cenário:** abrir PiP, entrar na Vila com desafio ativo e ativar cinema. O shell fica inert, mas GameView continuava activeArea=true. Com foco no botão do cabeçalho do cinema, A/S/D/W ou Espaço podia chegar ao listener window do Arcade e alterar a tentativa que estava coberta. O probe com componente real e SQLite real avançou QTE 0→1 com uma tecla correta; não foi atribuído ao remoto acesso ao IPC da mesa.

**Correção exata aplicada pelo implementador:** App passa `gameOpen && videos.mode !== 'cinema'` e `explorerOpen && videos.mode !== 'cinema'` aos activeArea de GameView/ProjectWorkspace. GameView já propaga esse gate ao Arcade; o Explorer consulta sua ref atual no shortcut. Closed redefine modo inline no hook, restaurando os gates quando o player termina.

**Defesa adicional existente:** inert/aria-hidden limitam interação nativa, listeners leem props por ref e main valida/autoriza a ação com relógio/replay próprios. Nenhuma dessas camadas substitui o gate de contexto do listener global. **Estado:** fonte suplementar conferida; probe de negação passou, visible=false manteve etapa0/execuções0 e retomar visible=true avançou uma vez. O auditor não executou a jornada nativa dessa correção.

Provas executadas pelo auditor, sem mocks apresentados como integração externa:

- `med01-probe-data.ts` / `data-initial-results.json`: seis formatos de URL aceitos/16 hostis negados; tracking descartado; dez predicates de rede admitidos/12 negados; schemas strict e limites. FS/SQLite reais em fixture identificada: migração v3→v4 conservou oito tabelas, bytes Markdown/draft, material/mesa/layout, jogo/ledger e projeto/draft; restart preservou biblioteca. Dedup por matéria conserva início original; refs cruzadas negadas; limite 200; triggers reais de audit falhando reverteram add/remove e seleção; falha no meio de migração reverteu CREATE/ALTER/version.
- `med01-probe-cinema.ts` / `cinema-initial-results.json`: reprodução acima com React/Arcade reais em JSDOM e Game SQLite isolado. `med01-probe-cinema-fixed.ts` / `cinema-fixed-results.json`: negação/restauração do gate. App suplementar e propagação do GameView foram lidos separadamente; JSDOM não comprova foco/inert/roteamento nativos.
- Teste inicial congelado `tests/store.test.ts`: **1/1 passou**, `test-store.txt`. No freeze final, `tests/store.test.ts` e `tests/videos.test.ts`: **4/4 passaram**, zero falhas/skips, `tests-final.txt`. Gitleaks, audit e conferência de hashes conforme as fases anteriores. O domínio de dados não mudou entre os freezes, portanto o probe próprio inicial permanece identificado e não foi reatribuído a uma nova execução.

A primeira execução da fixture de dados tentou coleta em 1000ms, antes do cooldown real de 1500ms. O relógio da fixture foi corrigido para 2000ms; a execução final passou sem mudança do produto. Não se declarou falha do app nem integração externa com base nessa preparação.

Provas **do implementador**, lidas e distintas da execução própria: `.local/evidence/videos-results.json` e `videos-native.log`, jornada final em **2026-10-03T21:57:46.686Z**, packaged=true, perfil isolado `videos-WrVART`; o implementador informou exit 0. YouTube M7lc1UVf-VE/rede real, native input, currentTime **1.598906→5.99611**, paused=false, um WebContents preservado entre mesa/cinema/PiP/Explorer, sem bridge/Node/preload, sessão distinta/getStoragePath null e policy RTC. Incluem popup/navegação/microfone negados; seis canais video/player recusados com FORBIDDEN numa outra janela de prova deliberadamente insegura, destruída pelo harness; diálogo esconde view, scroll real promove PiP, cinema não consome QTE coberto e fechar libera área. Também Escape remoto, drag/teclado/reduced/compact/restart/lista/PDF2 e errors vazio. O harness foi revisado, mas o auditor não o executou.

O teste de offline por enableNetworkEmulation não provocou a falha esperada e terminou em timeout; **offline não foi comprovado**, sem alteração de produto. O implementador o substituiu por crash forçado exclusivamente do renderer remoto na fixture, seguido de erro visível e retry pela rede real, preservando a mesa. O último resultado contém essa quinta prova. O suplemento imutável de harness acrescenta as linhas 86–91 e a descrição de resultado na linha 100; o auditor conferiu o diff e segredos desses bytes, sem reatribuir o script novo ao freeze anterior. Esta é uma prova de falha de processo/retry, não de transporte offline. Os logs de regressão `videos-regression-test-journey.log`, `videos-regression-test-engine-explorer.log` e `videos-regression-test-smooth-ui.log` foram lidos; o implementador informa exit 0 no mesmo pacote. R8 nuvem/mobile e diálogo nativo de pasta continuam fora dessas provas.

Identidade dos bytes do pacote foi medida pelo auditor e coincide com a informada: ASAR SHA256 `BCBED04D7957E2BB2CB1DEE7B6E5B67627C632EA1E3E876924AAE0B90C3A1970`; EXE SHA256 `B2B040513A472D70E6F001BEC916987BD4DC715C8AB729CCDDBA9A573B3532F6`. Não se extraiu ASAR, comparou módulos empacotados com fonte ou executou o binário. Hashes identificam o pacote, sem comprovar equivalência fonte/binário.

Limites: nenhum Electron/player remoto executado pelo auditor; nenhum pacote extraído ou comparado à fonte; nenhum teste próprio de header no wire, navegação, sockets, downloads/permissões nativas, áudio ou GPU. Sem fuzzing exaustivo de race/bounds. APIs legadas de notas continuam com seus limites anteriores; o diff não comprova serialização de todas as combinações save/discard. Uma carga que terminou no embed não garante disponibilidade/reprodução de todos os vídeos, incluindo privados, removidos ou com embed restrito.

## 7. Handoff de memória

Recomendações ao implementador, sem escrita de memória pelo auditor:

- Arquitetura: fronteira remoto → WebContentsView separado, partition em memória, sem preload/Node/IPC/study handler; Referer de identidade constante; salvar/restaurar links não conecta automaticamente. Allowlist URL tem famílias e limites explícitos; WebRTC policy não é firewall universal.
- Guidelines: overlays e inert não suspendem atalhos globais de áreas mantidas montadas. Propagar contexto ativo aos listeners/polling/RAF, inclusive cinema; testar negação e retomada com domínio real. Registrar Low observado/corrigido com cenário e fonte da evidência.
- Arquitetura/guidelines: v4 é aditiva, UNIQUE por matéria/YouTube ID; refs são verificadas por matéria, remove limpa desk em transação com audit. Preservar dedup/início original e rollback quando o audit falha.
- Guidelines: child view não acompanha CSS clipping. Conter bounds no main, mover a PiP quando slot deixa o viewport; remover view e fechar WebContents para teardown. Não alegar que setVisible(false) interrompe áudio.
- Memória de componentes: manter advisory High/data/exposição de tooling; cache Chromium remoto não é o cache HTTP npm vulnerável. Reavaliar pipeline/publicação sem reutilizar zeros históricos ou seals de outros tickets.

## 8. Veredicto delimitado

**Decision: APPROVE WITH MITIGATIONS para o MVP pessoal/local na fonte final `56563e23…` e suplemento final de harness `1b999d0e…`.** Comparação final concluída, sem delta de produto posterior ou achado confirmado de código em aberto. Não há aprovação de bytes ainda não revisados.

| Severidade | Aberto | Corrigido / mitigado | Observação |
|---|---|---|---|
| Critical | 0 | 0 | Nenhum confirmado |
| High | 0 de código | 1 advisory de tooling | Oito entradas npm; exposição local avaliada, pacote afetado permanece |
| Medium | 0 | 0 | Nenhum confirmado |
| Low | 0 | 1 corrigido na fonte | Gate de teclado sob cinema; reprodução/negação próprias delimitadas |

**Secrets:** clean nas capturas e suplementos identificados, incluindo testes/fixtures. **Dependencies:** um advisory High, zero Critical reportado; produção omit=dev zero com limite registrado. **Threat model:** presente, com nova fronteira remota. Não há ação de produto pendente deste parecer. O implementador conclui memória/docs e verificação staged dos arquivos posteriores à captura. Uma eventual distribuição pública exige revisão própria do release; este parecer não a certifica.
