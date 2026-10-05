# Parecer do incremento GAM-01

02/10/2026, Windows nativo, branch feat/game, base 884593e. **APPROVE WITH MITIGATIONS para a fonte/domínio local revisados.** Nenhuma vulnerabilidade de código Critical/High/Medium/Low confirmada. A execução do pacote pertence à jornada do implementador; este auditor não abriu Electron em paralelo.

## Escopo e evidência

Skill `codex-security:security-diff-scan`, plugin 0.1.31. Memória de arquitetura/guidelines, AGENTS.md, manifestos e anexo AppSec foram lidos. Project-memory-keeper não está disponível; a devolução de memória está abaixo. Foram revisados os arquivos de runtime alterados e seus controles de apoio, testes, fixtures, scripts e deltas observados durante a execução.

Preflight informou Daybreak não habilitado nesta conta; resultados protegidos podem não ser exibidos. A documentação do plugin aponta [ChatGPT Cyber](https://chatgpt.com/cyber). Esse aviso não impediu os probes locais descritos aqui; não há alegação de cobertura de resultados protegidos indisponíveis.

Scan canônico `0dad3b5a-3eb0-4536-873f-b446d0b13b89`, encerrado pelo plugin em 03/10/2026 01:23 UTC. Snapshot inicial `8fc09d383fba2f0c8d5958c30ef27472b0bc348805675d80bdd22355c609c281`. O plugin registrou que a árvore mudou e conservou o snapshot original e checkpoints, incluindo a pendência de probes de segurança do pacote; sua cobertura geral é **parcial**. Deltas de dificuldade retomada, redraw com movimento reduzido, script smoke-game e script npm foram lidos posteriormente e registrados. Este parecer não vincula um commit futuro ou uma build posterior a esse digest.

Resultados canônicos, SARIF e evidências ficam no estado local do Codex Security sob esse scanId. Este documento registra o resultado no projeto, com os limites de cada prova. A jornada e identificação do binário ficam em docs/validation/GAME.md quando concluídas pelo implementador.

## Modelo de ameaça e controles examinados

Perfil único local, sem servidor, moeda real, identidades remotas ou multiplayer. Ativos: integridade da carteira/inventário/rodada e preservação de mesa, nota e rascunho. Código executando no renderer pode tentar enviar ações arbitrárias; não recebe autoridade para fornecer preço, prêmio, relógio, SQL ou caminho. Processo já autorizado sob a conta Windows pode alterar SQLite/relógio; não há promessa de antifraude competitivo.

| Ativo / STRIDE | Cenário concreto | Controle verificado / evidência | Resultado e limite |
| --- | --- | --- | --- |
| IPC / S, E | Outra janela/frame tenta usar game:action, ou renderer envia moedas no payload | Guard de sender/mainFrame/URL em src/main/index.ts:25; preload fixo em src/preload/index.ts:4; Zod strict/discriminado em src/shared/game.ts | Guard reutilizado inspecionado; seis ações malformadas rejeitadas em probe de domínio. Origem estrangeira dos novos canais não foi executada pelo auditor no pacote |
| Carteira / T | Comprar item caro com saldo insuficiente, vender recurso inexistente ou enviar quantidade negativa | Valores de catálogo no main; validação e insuficiência antes de persistir, src/main/game.ts:18, src/main/game.ts:71; CHECK não negativo, src/main/store.ts:30 | Testes/probes com SQLite real preservaram saldo e inventário após rejeição; alterar snapshot retornado não alterou fonte de verdade |
| Recompensa / T | Repetir UUID de colheita/finalização ou usar esse UUID com outro payload | Payload normalizado vinculado a game_operations, src/main/game.ts:45; source UNIQUE, src/main/store.ts:31; rodada ativa/completion e origem round:id, src/main/game.ts:94 | Replay inclusive com ordem diferente de campos não repetiu efeito; outro payload foi rejeitado; exatamente uma recompensa por rodada |
| Produção / T | Aplicar a nova taxa retroativamente após respec ou receber o mesmo tempo duas vezes | Liquidação prévia/carry/timestamp no main, src/main/game.ts:24 e src/main/game.ts:82; limite de sete dias | Teste de fração, mudança de taxa, consultas repetidas e relógio regressivo passou. Relógio local não é autoridade remota |
| Rodada / I | Ler todos os pares escondidos da resposta ou escolher uma carta de rodada antiga | View só envia labels revelados/matched, src/main/game.ts:40; rodada/seleção/pontos calculados no main, src/main/game.ts:83 | Probe confirmou ausência de pair/text nas cartas fechadas; rodada antiga rejeitada. Baralho demonstrativo é público, sem alegação de avaliação acadêmica |
| Dados/log / R, D | Falha de INSERT de operação/audit ou UPDATE de rodada deixa prêmio/estado parcial | BEGIN IMMEDIATE/ROLLBACK, src/main/store.ts:37; perfil/ledger/round/operation/audit na mesma transação, src/main/game.ts:115 | Triggers reais provocaram falha e rollback integral; retry após falha funcionou; ledger conciliou saldo/XP. Eventos contêm ação/UUID/outcome, sem texto de nota |
| Estudo / T, D | Migração do jogo apaga notas/rascunhos/mesa ou recreia schema | Migração aditiva v1→v2 em src/main/store.ts:29, rejeição de versão mais nova em src/main/store.ts:13 | Teste conservou matéria, mesa, nota, draft e bytes do vault. Não houve reset de dados do produto |

Renderer: JSX mantém texto como dado; imports de Three/GSAP usam caminhos literais locais. Não foram introduzidos eval/Function, HTML bruto, merges com entrada arbitrária, shell, SQL interpolado, URL remota ou acesso a disco. Cenário possui geometria fixa, DPR/zoom limitados, limpeza de listeners/recursos e pausa em aba oculta; animação não credita economia. Entrada na cidade guarda rascunho e pausa foco pelo serviço existente. CSP/sandbox/contextIsolation/Node desligado e navegação/permissões restritas continuam no main; sua prova prévia está em [MVP_AUDIT](MVP_AUDIT.md).

Cookies/CSRF, autenticação remota, tenant, pagamento, upload de conteúdo do jogo, IAM, buckets e SSRF de servidor não correspondem a interfaces implementadas neste incremento. Não foi criada uma aprovação fictícia para essas superfícies.

## Verificações executadas pelo auditor

| Comando/prova | Resultado efetivo |
| --- | --- |
| Node portátil 24 + tsx --test tests/game.test.ts | 4/4 passaram: economia/replay/restart, passivo fracionário, memória autoritativa, migração conservadora |
| game-security-probe.ts em workspace temporário do plugin | Exit 0: seis argumentos hostis; snapshot alterado; replay normalizado/conflito; falha real de INSERT de operação; falha real de UPDATE de rodada; retry; prêmio único; conciliação |
| Gitleaks 8.30.1 no snapshot de alterações/novos arquivos | Passagem inicial: 15 arquivos, 150.658 bytes; passagem posterior: 19 arquivos, 173.713 bytes. Zero achados, exit 0; testes/fixtures incluídos |
| npm audit --omit=dev --json | Zero vulnerabilidades, exit 0 |
| npm audit --json | 8 entradas High, exit 1; assessment abaixo. Nenhum audit fix ou alteração de dependência pelo auditor |

Gitleaks utilizou regras padrão, redaction 100%, ignore-gitleaks-allow e decodificação até cinco níveis. O primeiro comando nativo com argumentos malformados varreu uma árvore maior de arquivos gerados/dependências; esse resultado foi descartado como prova do escopo. As duas provas válidas usaram explicitamente diretórios de fontes copiados. Nenhum valor de credencial foi impresso. O histórico integral já foi escaneado no primeiro audit do MVP; não foi reivindicada uma nova varredura histórica neste review de alterações. Arquivos novos após a última passagem requerem o scan final do checkpoint.

## Dependência High: avaliação de exposição

O audit completo atual identifica **um advisory subjacente**, propagado por oito entradas de pacotes: [CVE-2026-93748 / GHSA-ch52-4w7c-c8xp](https://github.com/advisories/GHSA-ch52-4w7c-c8xp), CWE-524. O relatório npm usa CVSS 3.1 7,5; GitHub mostra CVSS 4.0 8,7. Versões afetadas: http-cache-semantics até 4.2.0, sem versão corrigida listada na consulta. Cenário: cache HTTP compartilhado entre usuários permite recuperar resposta de outro usuário usando max-stale, inclusive cookie de sessão.

Árvore instalada: electron-builder 26.15.3 → app-builder-lib → @electron/get 3.1.0 → got 11.8.6 → cacheable-request 7.0.4 → http-cache-semantics 4.2.0. A cadeia pertence à ferramenta de build, não aos imports/arquivos de runtime do app. Electron 44.5.1 usa seu @electron/get 5.1.0 separado. got inicia cache=undefined em node_modules/got/dist/source/index.js:65 e somente escolhe CacheableRequest quando options.cache é truthy em core/index.js:1088. O projeto não fornece downloadOptions/cache, cache HTTP compartilhado ou sessões/cookies remotos. Não foi encontrado o caminho necessário ao ataque no produto ou no workflow de download configurado.

Esse assessment permite continuar o incremento local; não afirmar zero no audit completo. A sugestão automática de downgrade do electron-builder para 26.5.0 não foi aplicada: não é evidência de compatibilidade nem de correção adequada ao projeto. Reavaliar a cadeia no release e quando houver versão/remediação oficial; qualquer introdução de cache HTTP compartilhado reabre esta análise. As versões/lockfile não mudaram neste incremento; package.json acrescenta apenas o script test:game. O resultado zero histórico no MVP é uma consulta anterior, não garantia atual.

## Parecer e devolução à memória

| Severidade de achado de código | Aberto | Corrigido nesta revisão |
| --- | --- | --- |
| Critical | 0 | 0 |
| High | 0 | 0 |
| Medium | 0 | 0 |
| Low | 0 | 0 |

**Secrets:** zero detectado no escopo de alterações/testes copiado. **Dependencies:** produção 0; completo 8 entradas High de um CVE de tooling com exposição avaliada acima, Critical 0. **Threat model:** criado no scan. **Decisão:** APPROVE WITH MITIGATIONS para fonte/domínio pessoal local. Mantêm-se os limites herdados de perfil/SQLite sem criptografia própria, relógio controlável pelo usuário e pacote sem assinatura. Segurança do pacote tem cobertura parcial no scan; a jornada funcional do implementador deve ser registrada separadamente antes do checkpoint. Nenhuma aprovação de produção/cloud/publicação competitiva decorre disso.

Devolver à architecture.md: novas tabelas v2, fronteira renderer→gameAction, preços/tempo/prêmio/pares autoritativos no main, ledger/UUID vinculados ao payload, limitações de perfil/relógio local e exposição do advisory de tooling. Devolver à guidelines.md: preservar o idioma transacional com origem única e audit, liquidar taxa anterior com carry antes de respec, omitir pares fechados da view e incluir fixtures no scan de segredos. Nenhuma classe de vulnerabilidade foi remediada nesta revisão; esses são controles examinados. Uso de tokens do plugin ficou indisponível para medição, sem estimativa inventada.
