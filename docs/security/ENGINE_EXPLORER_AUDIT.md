# GAM-02 — auditoria AppSec do motor e Explorer

Data: 03/10/2026. Contexto: Nodus pessoal, local, Windows nativo, Electron/React/TypeScript/SQLite. Escopo solicitado: motor/upgrades, QTE/skillcheck, Explorer com edição UTF-8, persistência e integração com a mesa. A autorização veio do pedido do usuário de revisão por agente; nenhuma funcionalidade do produto foi alterada pelo auditor e nenhuma instância Electron foi aberta por ele.

**Decisão: APPROVE WITH MITIGATIONS para o incremento local no snapshot final identificado abaixo.** Nenhuma vulnerabilidade de código permaneceu aberta no escopo revisado. O bypass de metadados Git foi reproduzido e corrigido; uma CVE High no tooling recebeu avaliação de exposição. A decisão não certifica publicação pública, assinatura do aplicativo, nuvem, execução de projetos ou uma auditoria independente do binário.

## Identidade e cobertura

Os identificadores têm funções diferentes; o selo antigo não foi reatribuído aos arquivos posteriores.

| Artefato | Identidade | O que comprova |
|---|---|---|
| Baseline Git | `083bdc0d1bd1312cbf89b2b6a685badeb0b234fe` | Base do diff |
| Snapshot inicial, 258 entradas | `3901b796ca1719fe90d62efd5f24916c173b812779e14755c992a2d8631124f5` | Manifesto inicial, todos os hashes conferidos |
| Scan Codex Security | `5d3b04b2-2639-44be-863c-965da5511ea7` | Revisão canônica concluída, 23/23 itens de fonte |
| Digest canônico desse scan | `codex-security-snapshot/v1:sha256:3d8f3f54e3efcabc7961961d94dc57e41f083f33450258972a2ec14af53b9aca` | Checkout isolado imutável sobre a baseline, contendo o snapshot inicial |
| **Snapshot final, 258 entradas** | **`a8be0350038b400a77879663aaf6b203a47dd01e208a135bbe331970a4bd387d`** | **Alvo deste parecer suplementar; todos os hashes conferidos** |
| ASAR final | `0907DBC2E6D9E5EF9DD96256E045D3F6A6008212A2AC249AE2810BC5319E1143` | Identificação dos bytes, não equivalência fonte/binário |
| Executável final | `53AC4B45D41E2CA2A628193F25AD2803D2FF4EA73917F2A2701EDDCB09AC960A` | Identificação dos bytes, não execução pelo auditor |

O scan canônico foi selado em `2026-10-03T17:44:35.833081Z`, com `coverage.completeness=complete`, `findings=[]`, `deferred=[]` e `openQuestions=[]`. Isso significa cobertura completa **do diff de fonte delimitado**, não de todos os 149 arquivos contados no repositório pelo plugin. A exclusão padrão de testes no inventário do plugin foi suprida pela revisão manual de quatro arquivos de teste, execução de dez testes de domínio e secret scanning do snapshot inteiro. O aviso de workers indisponíveis foi atendido pela revisão direta de todos os itens; nenhuma delegação adicional ocorreu. O consumo de tokens não foi disponibilizado pelo plugin.

Inventário de fonte: `package.json`; scripts `audit-product-docs.mjs`, `check-bootstrap.mjs`, `smoke-engine-explorer.ts`, `smoke-game-security.ts`, `smoke-game.ts`, `smoke-journey.ts`; main `game.ts`, `index.ts`, `projects.ts`, `store.ts`; preload `index.ts`; renderer `App.tsx`, `Arcade.tsx`, `CityScene.tsx`, `GameView.tsx`, `ProjectEditor.tsx`, `ProjectWorkspace.tsx`, `game.css`, `projects.css`; shared `contracts.ts`, `game.ts`, `projects.ts`. Também foram conferidos lockfile, memória, instruções e código adjacente pertinente.

Entre os dois manifestos mudaram **somente** `ProjectWorkspace.tsx`, `ProjectEditor.tsx` e `smoke-engine-explorer.ts`. Esses três arquivos foram lidos integralmente e o snapshot final foi novamente escaneado para segredos. Essa revisão posterior é suplementar, fora do selo canônico inicial. Posteriormente, o implementador ajustou check-bootstrap.mjs para ignorar release/dist apenas na raiz e incluir docs/release na verificação documental; o diff desse ajuste também foi lido, sem nova capacidade runtime. Ele está fora do manifesto a8be0350 e requer a prova documental e scan staged do implementador. O implementador informa os checkpoints core `62dbd60` e UI `1c6366a`; os digestes acima continuam sendo a identificação efetivamente verificada.

A habilidade aplicada foi [codex-security:security-diff-scan](C:/Users/Rafael/.codex/plugins/cache/openai-curated-remote/codex-security/0.1.31/skills/security-diff-scan/SKILL.md), com preflight, modelo de ameaças, descoberta, validação, análise de caminho e relatório. Daybreak retornou `not_granted`; essa limitação foi comunicada e não bloqueou os probes locais ([ChatGPT Cyber](https://chatgpt.com/cyber)). O conector project-memory-keeper não estava disponível: `.claude/memory/architecture.md` e `guidelines.md` foram lidos diretamente, com handoff explícito ao implementador ao final.

## Modelo de ameaças e adaptação à stack

A seleção nativa de pasta concede uma capacidade sobre aquela raiz. Conteúdo do projeto e payloads IPC continuam não confiáveis. Ativos: bytes dos arquivos, rascunhos/recovery, dados de estudo, carteira/inventário e desafios persistidos. Fronteiras: diálogo → raiz canônica registrada; filesystem → main → editor textual; renderer → guard/schema → serviço; serviço → transação SQLite; save → filesystem e banco, sem transação conjunta.

| STRIDE / ativo | Cenário | Probabilidade / impacto no modelo | Controle verificado | Limite |
|---|---|---|---|---|
| S/E — capacidades main | Outra janela/iframe invoca project/game IPC | Baixa / alta se o guard fosse ausente | Identidade de webContents, mainFrame e URL exata; bridge específica | Auditor não executou todas as combinações de frames |
| T — fonte/Git | Payload usa traversal, junction ou alias 8.3 para editar metadados | Plausível antes da correção / médio local | Schema, lstat por componente, realpath, containment e bloqueio canônico de .git | Processo com autoridade filesystem do usuário está fora desta contenção |
| T — moedas/desafios | Enviar preço/clock/score, repetir UUID ou prêmio de desafio encerrado | Plausível / médio para estado do jogo | Zod strict, cálculo main, operação vinculada ao payload, ledger UNIQUE e rollback | Moedas/XP não medem domínio acadêmico nem possuem valor financeiro |
| R — edições/operações | Save/discard bem-sucedido sem registro | Baixa / médio | Auditoria de ação, UUID e resultado na transação pertinente | Não é log imutável contra o dono do perfil |
| I — conteúdo local | Arquivo HTML/JS ou nome malicioso executa no editor | Baixa / alta se executado | CodeMirror e JSX textual, sem preview de execução/HTML cru | Arquivos e recovery locais permanecem em texto claro |
| D — main/UI | Arquivo/árvore enorme ou spam de pulso | Limitada / baixo a médio | Read limitado a 1 MiB+1, árvore 500 itens, 40 raízes, 12 abas, cooldown 300 ms | FS síncrono, sem quota global de recovery/ledger nem fuzzing exaustivo |

Não existem cookies de autenticação, JWT em localStorage, tenant remoto, uploads HTTP ou infraestrutura cloud nesse incremento. Não foi inventada uma exigência de IAM/MFA/TLS para o app local. A revisão procurou HTML cru, eval/Function, execução de comandos, merges arbitrários/prototype pollution, SQL interpolado e URLs de projeto como fetch: não foi encontrado caminho novo dessas entradas para um sink privilegiado. Não se inferiu ausência de corrupção nativa de memória a partir de código TypeScript ou npm audit.

## Cenários e controles efetivamente verificados

**IPC e renderer.** `src/main/index.ts:31` exige a janela principal, seu mainFrame e a URL de inicialização antes de `safeParse`; `:42–51` aplica esse mesmo handler a oito operações de projeto e duas de jogo. O renderer não pode registrar uma raiz arbitrária: `project:choose` usa o diálogo main em `:43`. `src/preload/index.ts:4` expõe operações fixas e `:42` congela a API, sem fs/shell/ipcRenderer genérico. Context isolation, sandbox e webSecurity estão habilitados, nodeIntegration desabilitado; navegação, popups e permissões são negados. Projeto não é carregado como documento executável; o protocolo study serve os assets da aplicação.

**Arquivos e conflitos.** `src/shared/projects.ts:3–8` rejeita caminhos absolutos/traversal/backslash/ADS, NUL, segmentos inválidos e .git sem distinção de caixa; escrita exige UUID, SHA-256 e texto sem surrogate isolado. `src/main/projects.ts:24–31` revalida raiz, cada link/junction e destino canônico. `:46` lê pelo descritor até 1 MiB+1, rejeita binário/UTF-8 inválido e sempre fecha o descritor. BOM/CRLF são mantidos nos bytes e no hash.

Em `projects.ts:59–71`, save conserva draft, compara hash, grava recovery do original, cria temporário exclusivo, re-resolve/reconfere hash e renomeia. Falha de banco após rename não desfaz o filesystem; mantém draft/recovery e retorna erro. Esse limite foi testado, não descrito como atomicidade total. `:73–76` recupera o draft antes de descartá-lo. SQL usa parâmetros preparados; migração v3 em `store.ts:36–40` é aditiva, preserva v1/v2 e rejeita schema futuro.

**Economia e desafios.** `game.ts:73–77` compara UUID com o payload normalizado dentro da transação; payload diferente retorna OPERATION_CONFLICT. `:81–86` calcula cooldown, potência, preço e teto do motor no main. `shared/game.ts:41–57` não aceita moedas, nível, clock ou score enviados pelo renderer. `game.ts:52–66` gera ID/sequence/targets, avalia tempo/posição, exige desafio ativo correto e credita `challenge:<id>` uma vez. `store.ts:31` tem UNIQUE no ledger; `:43–46` usa BEGIN IMMEDIATE/COMMIT/ROLLBACK. Perfil, desafio, operação e auditoria participam da mesma transação SQL. Produção passiva é liquidada na taxa anterior antes da alteração, com fração persistida; retomada não duplica prêmio/credito inicial.

## Problemas encontrados e corrigidos

### [MEDIUM, corrigido] Alias Windows contornava a restrição de metadados Git

**Arquivo:** `src/shared/projects.ts:3` e `src/main/projects.ts:31`. **Classe:** CWE-22/CWE-73, OWASP A01, STRIDE Tampering. **Ativo:** metadados Git do projeto autorizado.

**Cenário reproduzido:** uma fixture NTFS continha uma pasta .git com config fictícia. A comparação inicial case-sensitive permitia .GIT/config. Após corrigir a caixa, o alias real `GIT~1/config` ainda abriu e salvou a config usando o serviço Projects. Não houve execução Git, escape de raiz ou projeto pessoal utilizado. A equivalência 8.3 é documentada pela [Microsoft](https://learn.microsoft.com/en-us/windows/desktop/fileio/naming-a-file).

**Correção exata:** comparar o componente com `part.toLowerCase() !== '.git'` no schema e, **após realpath**, negar qualquer componente relativo canônico igual a .git. A primeira camada bloqueia payloads literais; a segunda cobre aliases. Repetição após correção: .git/.GIT rejeitados pelo schema; GIT~1 open/save → UNSAFE_PATH, fonte intacta. Não permanece achado aberto.

Outras correções têm classificação própria: save enviava campos extras a um schema fileRef estrito e falhava funcionalmente; passou a construir `{projectId,path}` antes de open. Validação NUL/surrogate antes de escrita e read limitado reforçaram integridade/limite; não foi demonstrada uma sobrescrita NUL original ou um exploit de crescimento de arquivo.

### Integridade da UI: candidato endurecido, sem vulnerabilidade externa validada

No snapshot inicial, `ProjectWorkspace.tsx:40` descartava o draft sem participar da exclusão mútua de Save. A fonte sustentava uma preocupação de ordem entre intenções locais, mas o auditor não reproduziu exploração externa/elevação de capacidade. O candidato `candidate-a284b4fabf968cd5` recebeu disposição de segurança **ignore**, preservando a demanda de correção funcional.

No final, `ProjectWorkspace.tsx:21,36–44` compartilha guard/promise entre Save, usar arquivo e conservar edição; flush/close aguarda mutação e drafts. `:52` desabilita resolução ocupada. `ProjectEditor.tsx:9,15` fica readOnly durante a mutação; `:12–14` distingue dispatch programático de edição do usuário. O implementador também observou e corrigiu um status de rascunho indevido no dispatch programático. Seu harness real exercitou cliques rápidos nos dois sentidos com Ctrl+S, sem mock/delay IPC, confirmando primeira operação, draft/recovery e edição subsequente. Essa prova é atribuída ao implementador.

## Evidências executadas pelo auditor

Node **24.21.0**, Windows, serviços reais em fixtures isoladas; nenhum projeto do usuário executado.

```powershell
& .local/node-v24.21.0-win-x64/node.exe node_modules/tsx/dist/cli.mjs --test tests/engine.test.ts tests/projects.test.ts tests/game.test.ts tests/store.test.ts
```

No checkout imutável: **10/10 aprovados**, zero skip/falha. Cobrem motor/replay/insuficiência, desafios/expiração/prêmio/rollback, economia legada/proração/memória, projetos/BOM/CRLF/conflito/restart/recovery/entradas hostis e migrações v1/v2→v3. Os testes de projetos também passaram durante a correção inicial.

Três probes adicionais, repetidos no checkout congelado, saíram 0:

- Economia: segundo pulso em clock zero negado; clock regressivo negado; 299 ms nega/300 aceita; payload extra e UUID reaproveitado para outro payload negados; replay após restart tem um efeito; desafios estrangeiro/cancelado/concluído negados; conclusão/replay/restart têm um prêmio. Teto 10/potência 21/upgrade seguinte negado sem ledger/profile novo. **Saldo artificial somente na fixture do teste de teto**, sem alegação de progressão humana.
- Arquivos: vazio e exatamente 1 MiB aceitos; UTF-8 inválido negado; NUL/surrogate/UTF-8 acima do limite preservam fonte e draft anterior; traversal/ADS/absoluto/backslash negados; junction filho e raiz substituída negados, arquivo externo intacto.
- NTFS 8.3: alias real e caminhos .git/.GIT negados após correção; save pelo alias negado.

Gitleaks **8.30.1**, regras padrão, redaction 100%, ignore-gitleaks-allow e max-decode-depth 5, modo dir: inicial ~1.821.483 bytes, final ~1.824.707 bytes, **exit 0 e relatórios []**. Inclui arquivos de testes/fixtures e ambos os snapshots; assets PDF gerados estão no manifesto, sujeitos às regras de leitura/binário da ferramenta. Não houve exceção por serem testes. Não foi repetido o histórico Git completo; a etapa final de documentação fora do freeze continua sob o scan staged do implementador.

As evidências canônicas residem no diretório do scan citado: `artifacts/evidence/tests10.txt`, probes `economy-invariants.json`, `fs-invariants.json`, `shortname-probe.json`, reprodução `shortname-before-fix.json`, relatórios Gitleaks e npm audit, e manifesto final. Não foram editados manualmente os arquivos canônicos do plugin.

## Evidências do implementador, inspecionadas separadamente

O auditor leu os harnesses e os resultados, sem executar Electron nem extrair/comparar o ASAR com o fonte.

| Evidência | Resultado e cobertura |
|---|---|
| `.local/evidence/engine-explorer-results.json` | Pacote final, fixture engine-explorer-8GqCeM: duas raízes reais; BOM/CRLF/edição seletiva; conflito/revisão; close/restart/draft; Save→usar arquivo e ordem inversa; motor/upgrade; QTE real e skillcheck 3/3; retorno à mesa/PDF e movimento reduzido |
| `.local/evidence/engine-project-ipc-results.json` | Janela hostil: game:get/action e project:list/choose/save → FORBIDDEN; estado intacto; preferências de isolamento da janela do produto conferidas |
| `.local/evidence/journey-results.json` | R1–R7 aprovados em 03/10 no pacote final; cloud/mobile R8 não verificado |
| `.local/evidence/game-verified-results.json` | Atualizado em `2026-10-03T17:40:00.793Z`, fixture game-journey-Zmmtlv: cinco rodadas concluídas, farm/venda/coleta/loja/build, replay, restart/produção passiva real fechado, reconciliação ledger e retorno mesa/Markdown/PDF/foco |
| Typecheck, suite e build | Implementador relata 18/18 testes, typecheck e package:win exit 0; typecheck final após checkpoint UI aprovado |

O diálogo nativo de pasta não foi automatizado: o harness registra raízes pela classe Projects real. Não extrapolar os cinco canais hostis executados para execução individual de todos os canais/subframes; os demais compartilham o guard conferido em fonte. Resultados frescos do jogo substituem o arquivo anterior datado de 02/10; a prova GAM-01 antiga não é usada como execução deste pacote.

## Componentes vulneráveis e configuração

Em 03/10, `npm audit --omit=dev --json` retornou zero e exit 0; `npm audit --json` retornou **oito entradas High, zero Critical**, todas derivadas de **um advisory**, não oito CVEs: [GHSA-ch52-4w7c-c8xp / CVE-2026-93748](https://github.com/advisories/GHSA-ch52-4w7c-c8xp), CWE-524, CVSS reportado pelo npm 7,5.

Cadeia instalada: electron-builder 26.15.3 → app-builder-lib → @electron/get 3.1.0 → got 11.8.6 → cacheable-request 7.0.4 → http-cache-semantics 4.2.0. A questão é reutilização de respostas sensíveis em cache HTTP compartilhado sob condições do advisory. A leitura da implementação instalada mostrou got com cache indefinido e seleção do cache HTTP condicionada a configuração explícita; o projeto não define esse cache/downloadOptions nem sessões multiusuário. O cache de artefatos em disco de @electron/get é um mecanismo diferente.

**Avaliação de exposição:** tooling permanece vulnerável segundo o grafo, mas não foi encontrado o caminho de cache HTTP compartilhado/autenticado exigido no fluxo local. Nenhuma exploração da CVE foi tentada. Não houve audit fix forçado/downgrade; manter o risco documentado e reavaliar atualização upstream/configuração antes de ampliar build/downloads para serviço compartilhado. Não se afirma que a CVE foi removida. O omit=dev sozinho não certifica Electron, que é runtime apesar de declarado como devDependency: seu grafo foi incluído no audit completo, que não apontou Critical. Lockfile conferido: `34bc9ebbbc83d6d026d00f4eaa45397baee89528641c4513db0d6c72c7f24e41`.

Não se adicionaram permissões Node à janela do produto para facilitar o harness. O pacote local está sem assinatura conforme configuração existente; isso não equivale a release pública aprovada.

## Limites e handoff de memória

Não foram comprovados pelo auditor: execução nativa do pacote, equivalência fonte/ASAR, diálogo nativo, editor externo, fuzzing exaustivo de recursos, resistência a um processo já executando com o usuário Windows, assinatura/proveniência de distribuição ou cloud/mobile. Filesystem+SQLite não têm commit conjunto; existe intervalo entre último hash e rename frente a outro processo. Draft/recovery protegem recuperação, sem promessa de lock interprocesso. Arquivos de recovery/profile/clock são locais e mutáveis pelo usuário.

Para `architecture.md`: registrar a capacidade de raiz escolhida, editor textual sem execução, controles IPC, autoridade main do motor/desafios, separação FS/DB e avaliação datada do advisory de tooling. Para `guidelines.md`: proibir denylist de caminho apenas lexical/case-sensitive; aplicar bloqueio após canonicalização e testar aliases NTFS. Manter schemas estritos com refs próprias, validar bytes/texto antes de escrita, não usar readFileSync ilimitado após stat, não excluir tests/fixtures do secret scan. Registrar também fila compartilhada para Save/resolução/close e distinção entre dispatch de props e edição, como integridade funcional.

## Security Verdict

**Decision: APPROVE WITH MITIGATIONS — incremento pessoal/local, fonte final a8be0350…**

| Severity | Open | Mitigated/corrigido | Notes |
|---|---:|---:|---|
| Critical | 0 | 0 | Nenhum confirmado no escopo |
| High | 0 em código | 1 advisory de tooling | Oito entradas do grafo; exposição avaliada, CVE não removida |
| Medium | 0 | 1 corrigido | Bypass .git por caixa/alias NTFS |
| Low | 0 | 0 | UI endurecida tratada como integridade funcional |

**Secrets:** clean nos snapshots/diff delimitados; documentação posterior exige scan staged. **Dependencies:** um advisory High de tooling, zero Critical no audit completo; runtime do incremento sem achado reportado. **Threat model:** presente, fronteira de projetos adicionada e documentada.

**Required before checkpoint/push:** implementador deve copiar este parecer, registrar handoff/riscos na memória e conferir segredo/diff dos documentos finais fora do manifesto. Nenhuma nova aprovação humana é exigida para essas etapas já autorizadas. Não mudar runtime após o digest sem nova revisão do delta.

**Follow-ups:** reavaliar advisory ao atualizar a cadeia de empacotamento ou introduzir cache compartilhado; novas capacidades de execução/cloud/distribuição pública precisam de escopo e prova próprios.
