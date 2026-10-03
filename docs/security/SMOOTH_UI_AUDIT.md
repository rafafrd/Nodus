# UI-02 — auditoria AppSec das transições e do Explorer

Data: 03/10/2026. Auditoria independente e delimitada ao incremento UI-02, no Nodus pessoal/local para Windows, Electron, React, TypeScript, SQLite, CodeMirror, GSAP e Three.js. Autorização: pedido original do usuário de análise por agente conforme o anexo AppSec. O auditor não alterou o produto, abriu Electron, fez commit/push ou publicou serviço.

**Decisão: APPROVE WITH MITIGATIONS para a fonte local do snapshot final e do suplemento de contador identificados abaixo.** Nenhuma vulnerabilidade de código ficou aberta no escopo. Permanece um advisory High de tooling com exposição avaliada. Este parecer não certifica uma publicação pública nem equivalência entre fonte e binário.

## Identidade, procedimento e cobertura

A leitura direta incluiu AGENTS.md, CLAUDE.md, gotcha.md, estado da alpha, ticket UI-02, arquitetura e guidelines da memória, manifests e lockfile, além do anexo AppSec inteiro. `project-memory-keeper` não estava disponível; a fase de memória consiste na leitura direta e nas recomendações de atualização abaixo. Esta é uma auditoria manual nas oito fases do anexo, sem novo scan canônico do plugin. Nenhum selo ou resultado de GAM-02 foi atribuído à fonte UI-02.

| Identidade | Valor e significado |
|---|---|
| Baseline | `0da34c7c2a8d4345f233150900a3bf1eeed6b086` |
| Branch / checkpoint anterior ao suplemento de contador | `codex/smooth-ui` / `27bd35854973f4bcdda6f89c42a7b5cd45b2355e` |
| Freeze inicial do auditor | `.local/ui02-audit-9fbabb2c`; 161 entradas; digest `21c65d7a12a5829080fd1173af67d5ba5fcdedbdd61eb63487e1eb6482b9e87e` |
| **Freeze final do auditor** | **`.local/ui02-audit-final-f447c813`; 161 entradas; digest `4728bccd3899e1c6ee1e0d728708781cd76b1804854f0d3b82e45919d38ff31d`** |
| Suplemento imutável posterior, duas entradas | `.local/ui02-number-supplement-c7e5f75d`; digest `f30de98ce47842832d76bf96d0efbd6f6b6c8ab63b5bf4a76dbba343dee27f87`; vinculado ao freeze `4728bccd…`, sem reatribuir-lhe os novos bytes |
| Lockfile final | SHA256 `30f06ba6e378447dd959ab2eec399a15715cc31c2dca5ef03b300d0cd59ec720` |
| Recibo próprio | `.local/ui02-evidence-9fbabb2c/COVERAGE.json` |

O freeze foi feito antes da revisão. Os manifestos registram caminho e SHA256; o digest deriva da lista canônica dessas entradas. Todos os 161 hashes finais foram conferidos. Os 17 arquivos de código/dependências/scripts do diff foram lidos; os bytes correspondentes no checkout após o commit 27bd358 coincidiram com o freeze final, antes do suplemento posterior. Os snapshots preservam documentos da primeira captura; não selam o fechamento documental posterior.

Inventário revisado, **17/17**: `package.json`, `package-lock.json`, `scripts/smoke-game.ts`, `scripts/smoke-smooth-ui.ts`; renderer `ActivityRail.tsx`, `App.tsx`, `Arcade.tsx`, `ChecklistPanel.tsx`, `CityScene.tsx`, `GameView.tsx`, `Icon.tsx`, `motion.tsx`, `MotionDialog.tsx`, `NoteEditor.tsx`, `ProjectEditor.tsx`, `ProjectWorkspace.tsx` e `refinement.css`. O suporte necessário incluiu handlers main, preload, schemas, persistência de projetos/notas/jogo, CSP, testes e fixtures. Main, preload e domínio não receberam mudanças neste incremento.

Após o freeze inicial, o implementador avisou mudanças em exatamente três arquivos: `motion.tsx` (amostragem da pose antes de cancelar/retargetar a animação), `refinement.css` (duas regras dos marcadores contextuais) e `smoke-smooth-ui.ts` (provas adicionais e seletor). Esses arquivos foram sobrepostos em uma segunda cópia isolada, integralmente revisados e escaneados. O digest inicial continua identificando apenas a primeira captura.

Posteriormente houve um delta delimitado adicional, preservado no suplemento de duas entradas: `motion.tsx` ganhou `update()` antes de `gsap.to` em AnimatedNumber (`:104–105`), restaurando o valor amostrado após React escrever o texto destino; `smoke-smooth-ui.ts:50` ganhou seis amostras de texto em intervalos de 40ms e uma asserção de valor intermediário após upgrade. Não mudou main, payload, dependência, persistência ou autoridade do saldo. Ambos foram comparados, revisados no contexto e tiveram os hashes de origem/cópia conferidos: motion SHA256 `a483b86696597f61864a28c17a74436287fa05a5e3a0a1158413b8461fe594b5`; harness SHA256 `a776b860ca71f367516b7cf307cba91840435f26fdddb58e361d549204e1a44d`. O suplemento não é um novo selo de todos os 161 arquivos; a decisão combina o freeze final com esse delta revisado.

## 1. Design e ameaças — STRIDE

| Ativo | Ameaça e cenário | Probabilidade / impacto no contexto | Controle conferido | Lacuna ou limite |
|---|---|---|---|---|
| Fonte e rascunhos | Tampering: Ctrl+S ou navegação durante transição salva o buffer errado ou perde edição | Média / perda de trabalho local | Refs de área atual; navegação espera stash/flush; fila de drafts e mutex de mutações do Explorer | Corridas exaustivas com IPC artificialmente atrasado não foram provadas; API legada de notas não ganhou mutex neste diff |
| Estado do desafio | Spoofing/tampering: listener da Vila montada recebe teclas na mesa e progride uma tentativa oculta | Média / prêmio ou tentativa indevida | Arcade rejeita área invisível, repetição e alvos de edição; main mantém relógio/recompensa autoritativos | Inert é apresentação; autorização continua no main |
| Projetos locais | Elevation/information disclosure: HTML/JS aberto no editor executa código e alcança IPC privilegiado | Baixa após controles / acesso a dados locais | CodeMirror interpreta texto com parsers fixos; nenhum preview executável; preload específico e sender validado | Execução de projetos permanece fora do incremento |
| Disponibilidade e foco | DoS: área oculta mantém RAF, câmera/tween/listeners, retarget perde foco ou duplica ação | Média / consumo local e interação incorreta | Gates de área/document.hidden, cancelamento e teardown; uma camada ativa; movimento reduzido dinâmico | Não houve fuzzing prolongado de GPU/recursos pelo auditor |
| Credenciais de build | Information disclosure: cache HTTP compartilhado serve resposta autenticada a outro usuário | Baixa na configuração atual / confidencialidade High se precondições forem introduzidas | Cache HTTP de Got não habilitado neste downloader; sem configuração multiusuário/autenticada adicionada | Advisory de tooling permanece; reavaliar ao mudar cache/CI/distribuição |

Não há fluxo novo de identidade, nuvem, cookie/JWT, endpoint HTTP público ou execução de terminal a que se possa atribuir requisitos fictícios de compliance.

## 2. Revisão de código — cenários OWASP/CWE

| Cenário adverso | Arquivo/linha da fonte final e controle verificado |
|---|---|
| Tecla de estudo chega à tentativa oculta | `Arcade.tsx:9–13` consulta a visibilidade atual antes de executar ação, ignora `repeat`, input/select/textarea/contenteditable e remove listener. `GameView.tsx:29` interrompe polling quando a área está inativa. O probe não avançou a etapa real SQLite ao ocultar/unmountar; visível, a tecla correta avançou uma vez |
| Ctrl+S dispara o handler global de outra área | `App.tsx:66–68` lê a área por ref e desvia do handler de estudo em Explorer/Vila; `ProjectWorkspace.tsx:46` exige área ativa e evento não tratado. O keymap de `ProjectEditor.tsx:23` trata Mod-s. A animação não é o mecanismo de autorização |
| Navegação, salvar e descarte atropelam o draft | `App.tsx:145–156` serializa a navegação, espera stash/flush e confirma o destino mais recente; fechamento também espera flush (`App.tsx:63`). `ProjectWorkspace.tsx:28,43–51` aguarda drafts e mutação pendente, bloqueia Save/useFile/keepMine concorrentes; `ProjectEditor.tsx:29` fica readOnly durante a mutação. O guard de sincronização (`ProjectEditor.tsx:26–28`) evita registrar atualização programática como nova edição |
| HTML/JS/CSS/JSON vira XSS ou prototype pollution | `ProjectEditor.tsx:18,23` seleciona LanguageSupport por extensões conhecidas e mantém o documento como texto; não injeta HTML nem executa Function/eval. `NoteEditor.tsx:44` conserva `skipHtml`, links como texto e imagem como placeholder. Os probes com script, iframe, onerror, URL CSS e chaves `__proto__` preservaram a fonte sem nós executáveis nem protótipo alterado |
| Dado local injeta CSS/controle de largura | `ProjectWorkspace.tsx:13–16,57` usa somente `nodus.explorer.width`, convertido em número, limitado a 190–400 e com fallback. Não há token, sessão ou conteúdo de arquivo nessa chave; texto de breadcrumb é renderizado por React |
| Área anterior continua interativa ou observer/tween sobrevive | `motion.tsx:21–28` aplica inert/aria-hidden e termina com exatamente uma camada ativa; `motion.tsx:40–43` desconecta observer e mata timelines. `motion.tsx:5–7` remove listener de preferência. `CityScene.tsx:156–181` cancela RAF/câmera ao ocultar e desfaz observer, eventos, OrbitControls, geometrias, materiais e renderer no teardown |

A busca de sinks incluiu HTML bruto, eval/Function, execução de processo, rede e armazenamento de credenciais em código e scripts. Os usos encontrados de SQLite.exec, protocol/net.fetch e IPC específico são suporte existente, não capacidades introduzidas por UI-02. Ícones usam nós SVG fixos, sem SVG bruto vindo de arquivos. Layout FLIP conserva os editores montados; os módulos lazy têm caminhos constantes.

O relógio local/GSAP anima somente apresentação. XP, motor, custo e prêmio permanecem calculados no main. A pausa de foco ao entrar na Vila consulta e pausa a sessão principal; Explorer permite continuar a sessão de estudos. Nada no diff transforma animação em fonte de verdade para economia, persistência ou tempo.

## 3. Segredos

Gitleaks **8.30.1**, regras padrão, saída redigida, `max-decode-depth=5`, modo diretório, foi executado pelo auditor nos dois freezes: **exit 0, zero achados**. Foram incluídos os arquivos rastreados e novos presentes na captura, inclusive todos os testes, fixtures, scripts, manifests e documentos. Testes não receberam isenção. Relatórios: `gitleaks-snapshot.json` e `gitleaks-final.json` na pasta de evidência própria; ambos contêm lista vazia. O suplemento posterior também passou separadamente, exit 0/zero achados, ~23.21 KB, registrado em `gitleaks-number-supplement.json`; isso não renova o scan dos arquivos inalterados.

Vault, banco e perfis pessoais ignorados, node_modules e artefatos de build não foram incluídos. Não foi repetido o scan de todo o histórico Git nesta auditoria incremental; o registro histórico anterior não comprova novos bytes. A documentação de encerramento criada depois do freeze requer a checagem staged do implementador antes do push.

## 4. Componentes e advisories

Executados pelo auditor, sobre o lockfile congelado: `npm audit --omit=dev --json` **exit 0, zero vulnerabilidades**; `npm audit --json` **exit 1, oito entradas High, zero Critical, um advisory único**. Artefatos próprios: `audit-production.json` e `audit-full.json`. A classificação omit=dev não basta para atestar Electron, que é declarado como dependência de desenvolvimento no manifest.

O advisory é **GHSA-ch52-4w7c-c8xp / CVE-2026-93748 / CWE-524**, em `http-cache-semantics <=4.2.0`: respostas autenticadas podem atravessar usuários quando um cache HTTP compartilhado combina essas respostas com o tratamento vulnerável de `max-stale`. O GHSA consultado em 03/10 informa High 8.7 em CVSS 4.0 e nenhuma versão corrigida; npm reportou 7.5 em CVSS 3.1. São métricas diferentes. [Advisory oficial](https://github.com/advisories/GHSA-ch52-4w7c-c8xp).

No lockfile, a cadeia afetada é electron-builder/app-builder-lib → @electron/get 3.1.0 → got 11.8.6 → cacheable-request 7.0.4 → http-cache-semantics 4.2.0. Foram inspecionados o downloader e o Got instalados: `got/dist/source/index.js:65` deixa `cache` undefined e `got/dist/source/core/index.js:1088` só usa cache HTTP quando configurado. O cache de arquivos dos downloads Electron não equivale a esse cache HTTP compartilhado. O projeto não configura `gotOptions.cache` nem download autenticado/multiusuário; UI-02 não introduz esse caminho. Assim, há componente vulnerável presente, mas não se confirmou o cenário de vazamento na configuração local avaliada.

Mitigação vigente: conservar essa configuração sem cache HTTP compartilhado/autenticado e revisar a cadeia quando houver correção compatível ou mudança de pipeline/distribuição. Não executar automaticamente o downgrade sugerido por `npm audit fix`: compatibilidade e remoção efetiva do caminho precisariam de prova. Esta decisão não elimina o advisory nem reduz sua severidade intrínseca.

Os seis pins diretos de UI-02 são CodeMirror lang-css 6.3.1, lang-html 6.4.12, lang-javascript 6.2.5, lang-json 6.0.2, language 6.12.4 e @lezer/highlight 1.2.5. A maioria já existia transitivamente; os novos nós do lock são lang-json e @lezer/json 1.0.3. Versões instaladas coincidem com lock, URLs apontam ao registro público npm, integridades sha512 estão presentes e os módulos novos não adicionam install/postinstall. Os exports lidos configuram parsers/LanguageSupport, sem avaliação do conteúdo editado.

## 5. Configuração e capacidades

O suporte privilegiado inalterado foi conferido na fonte congelada: `main/index.ts:31–32` exige webContents da janela principal, mainFrame e startUrl esperado antes de safeParse; os handlers de projeto/jogo são específicos. `preload/index.ts:42` congela uma API limitada, sem fs/shell/exec genérico. `main/index.ts:91` mantém sandbox, contextIsolation e webSecurity ativos, nodeIntegration desligado; `:92–93` nega popups/navegação externa e `:107–108` nega permissões. Estes são controles de fonte verificados, não uma nova prova IPC nativa executada pelo auditor.

A CSP do HTML mantém script próprio, sem unsafe-eval, object/frame/base desabilitados e conexões próprias/dev loopback específicas. O unsafe-inline de estilos já existe para a apresentação/CodeMirror; não foi ampliado para scripts. Os parsers novos não criam preview HTML, iframe ou rede a partir do arquivo aberto. Não há autenticação cujo token precise ser transferido de localStorage para cookie.

## 6. Achados, validações e limitações

**Achados de código confirmados: zero.** Não foi identificado cenário explorável que exija linha de correção neste incremento. O retarget de `useSurfaceMotion` recebeu ajuste de apresentação: amostrar opacity/y antes de kill e preservar a pose no cleanup (`motion.tsx:52–57`). O probe final mediu opacity 0.9419/y 1.2456 antes e depois do retarget, sem salto, e confirmou remoção de transforms ao ativar movimento reduzido. Isso é evidência de correção de apresentação, não uma vulnerabilidade inventada.

Provas **executadas pelo auditor**, artefatos em `.local/ui02-evidence-9fbabb2c`:

- `probe-controls.tsx` / `probe-controls-results.json`: módulos reais do freeze React/CodeMirror/GSAP em JSDOM, preferência de movimento como fixture, e desafio com SQLite real isolado/relógio controlado no main. Sete formatos preservaram conteúdo exato, BOM/CRLF, parser esperado e ausência de nós executáveis. Atualização de props não chamou onChange de edição; busy bloqueou edição. Gate de teclas, retarget, redução dinâmica e limpeza de tweens/listeners passaram. O resultado inicial foi preservado separadamente.
- `tests/markdown.test.ts` e `tests/projects.test.ts` do freeze: **4/4 passaram, zero falhas ou skips**, em diretório de trabalho isolado. Usam FS/SQLite reais e verificam preservação, save/conflito/draft/restart, rollback e entradas hostis; os limites de caminhos/junctions do suporte permanecem. Log `tests-markdown-projects-final.txt`.
- Gitleaks e os dois npm audits da seção anterior; conferência dos 161 hashes e da identidade dos 17 arquivos após o commit.
- `probe-number.ts` / `probe-number-results.json`, suplemento posterior: AnimatedNumber real em JSDOM restaurou imediatamente 61 após receber destino 36, produziu amostras 46/41/38/37/36/36, convergiu a 36 e aplicou 48 imediatamente em movimento reduzido; unmount removeu tween e listener. O probe comprova a lógica DOM síncrona e intermediária, sem afirmar paint nativo ou integração do jogo. A revisão do delta e o Gitleaks suplementar não exigiram repetir os quatro testes de domínio inalterado.

A primeira montagem do probe precisou fornecer globals JSX/Window de JSDOM; a primeira execução dos testes a partir do freeze falhou por ausência do diretório temporário `.local`. Foram corrigidos somente o harness e o diretório de execução fora da fonte congelada; as execuções finais acima passaram. Esses erros de preparação não foram falhas do produto.

JSDOM não comprova foco, layout, inert e roteamento de teclado nativos, WebGL, CSP ou IPC Electron. Não se chamou um mock de integração. Não houve teste exaustivo de atraso/corrida de IPC nem consumo prolongado de GPU. O fluxo de notas usa a API legada inalterada e não recebe aqui uma afirmação de linearizabilidade de todas as combinações save/discard. O suporte de caminhos foi conferido/testado, mas não foi refeita a auditoria de todo o aplicativo.

Provas **do implementador do pacote anterior ao suplemento de contador**, lidas e separadas da execução própria:

- `.local/evidence/smooth-ui-results.json`, `2026-10-03T20:19:39.047Z`, packaged=true, fixture `smooth-ui-4n1kMG`: Ctrl+S durante transição, painel/DOM editor preservados, 12 posições intermediárias da câmera e cancelamento, movimento reduzido dinâmico, resizer com mouse/teclado, foco no Explorer/Vila, tecla com QTE oculto, retorno mesa/PDF e ausência de renderer errors. Leitura do harness final confirma fixture isolada usando serviços reais.
- Regressões finais no mesmo pacote, resultados `engine-explorer-results.json`, `journey-results.json` e `game-verified-results.json` (datas frescas de 03/10), logs `ui02-engine-explorer.log`, `ui02-journey.log`, `ui02-game.log`: o implementador informa sessão 8340 exit 0. Incluem Save/usar arquivo rápido nos dois sentidos, conflito/draft/restart, QTE/skillcheck, R1–R7, jogo legado/farm/loja/replay e produção com app fechado por 61s. Diálogo nativo de pasta e editor externo continuam não automatizados; R8 nuvem/mobile continua não verificado.
- Typecheck, 18 testes, package Windows e Gitleaks staged 83.13 KB exit 0 foram informados pelo implementador. O auditor não executou essa suíte integral nem a jornada Electron.

Hashes históricos do pacote anterior ao suplemento foram medidos pelo auditor e coincidiram com os informados: ASAR `DDE458ED61E7F9E236FB631BA068C41FD9789460D0A0F722F3DD3CA39F8C036A`; EXE `8C81FA323B6FB56D278EA17FCDA10B3EF75054D3795C6B55C42101227AF5623E`. Isso identifica aqueles bytes, sem atribuir-lhes o delta de contador. O auditor não extraiu ASAR, comparou seus módulos com o freeze ou executou o binário. A nova prova e identidade de pacote após esse delta cabem ao implementador em `docs/validation/SMOOTH_UI.md`; não foram convertidas em prova própria neste parecer.

## 7. Recomendações de memória

Handoff ao implementador, sem alterações de memória pelo auditor:

- Arquitetura: áreas visitadas permanecem montadas para preservar editores/canvas. Além de inert/aria-hidden, listeners, polling e RAF precisam consultar área ativa por ref; CSS de visibilidade sozinho não impede atalhos globais.
- Guidelines: transições não aguardam nem autorizam persistência. Navegação espera stash/flush; Save/useFile/keepMine do Explorer compartilham mutação/fila e readOnly; preservar esses gates ao refatorar.
- Arquitetura: parsers fixos de CodeMirror operam sobre fonte inerte. Um futuro preview/executor exigirá superfície isolada e revisão própria; não reutilizar a janela privilegiada.
- Guidelines: no retarget, amostrar pose antes de cancelar tween; movimento reduzido e teardown devem cancelar tween/observer/listener/RAF. Câmera interrompida por preferência dinâmica conserva a pose corrente.
- Dependências: manter advisory/data/cadeia/precondições na memória; reavaliar cache/CI ao atualizar tooling. Não substituir a avaliação completa pelo audit omit=dev nem recomendar ferramenta externa quando Gitleaks/harnesses internos já atendem.

## 8. Veredicto e fechamento

| Resultado | Contagem / decisão |
|---|---|
| Critical / High / Medium / Low de código abertos no diff | 0 / 0 / 0 / 0 |
| Advisory de componente | 1 High, oito entradas dependentes no npm audit completo; exposição local avaliada, mitigação registrada |
| Segredos no freeze, inclusive testes/fixtures | 0 |
| Veredicto da fonte revisada | **APPROVE WITH MITIGATIONS**, local, freeze `4728bccd3899e1c6ee1e0d728708781cd76b1804854f0d3b82e45919d38ff31d` + suplemento de duas entradas `f30de98ce47842832d76bf96d0efbd6f6b6c8ab63b5bf4a76dbba343dee27f87` |
| Fora deste veredicto | Histórico Git fresco, documentos pós-freeze, execução independente do pacote, equivalência fonte/ASAR, publicação/assinatura, nuvem/mobile e execução de projetos |

Não há Critical aberto nem vulnerabilidade de código aprovada por prazo. A condição de tooling já reconhecida pelo projeto recebeu nova avaliação, sem afirmar que o pacote vulnerável foi corrigido. O fechamento documental/memória, validação de links e scan dos arquivos staged posteriores cabem ao implementador antes do commit/push; não resta ação de produto ou prova pendente nesta auditoria delimitada.
