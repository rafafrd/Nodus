# Revisão de documentação contra o produto — GAM-02

03/10/2026, Windows nativo. Escopo: todos os arquivos de docs, índices, instruções aplicáveis e correspondência dos documentos ativos com código, manifests, migrations e provas. O inventário ao final identifica cada arquivo; não representa aprovação de todas as funcionalidades previstas na concepção.

## Resultado e alterações

| Divergência encontrada | Correção/verificação |
| --- | --- |
| PRD dizia implementação não iniciada | Estado real do MVP/alpha parcial, incrementos explícitos GAM-01/02 e jornadas futuras separados |
| SDD v1/modelo v2 apresentados como atuais | Schema v3 do Store e contratos de desafios/projetos; v1/v2 históricos preservados nas provas datadas |
| Farm/projetos inteiramente futuros no texto ativo | Jogo e Explorer/editor antecipados por pedido; execução/terminal/Git/IA/nuvem continuam futuros |
| CLAUDE/ADR citavam JSON do editor e provas ausentes antigas | Fonte Markdown em CodeMirror, ADR-0005 e acompanhamento de ALP-01/03/04; Obsidian externo continua pendente |
| Prompts confundiam concepção, execução sequencial e estado inicial | Banco referencial identificado; ticket/estado/autorização atual prevalecem, sem recriar base |
| Guia centrado em farm e branch antiga | Motor primeiro, oficina/QTE/skillcheck, Explorer/abas/save/draft/conflito, branch e schema atualizados |
| Verificador ignorava UI/GAM | check-bootstrap cobre IDs de todos os incrementos, frontmatter, dependências, retomada e critérios/evidência; 11 ALP continuam obrigatórios |
| docs/release era oculto pelo ignore release/ não ancorado e pulado pelo verificador | Ignore agora /release/ só na raiz; documento de publicação entra no Git. Verificador ignora build release/dist somente na raiz e também lê os links internos de docs/release |
| Plano/publicação tratados como recursos todos implementados | Índice distingue produto atual, requisitos e snapshots históricos; publicação/licença/assinatura e serviços pendentes permanecem explícitos |

Arquitetura/main/preload mantêm capacidades específicas. Notas/projetos são arquivos canônicos, SQLite conserva estado/draft. PDFs/projetos permanecem no PC. Jogo, moedas e XP não avaliam domínio acadêmico. Classes derivam da build/respec livre. UI mantém cantos retos, painéis próprios, GSAP/Three previstos e navegação por áreas.

## Como reproduzir

```powershell
node scripts/audit-product-docs.mjs
node scripts/check-bootstrap.mjs
```

O primeiro lê/inventaria cada arquivo de docs, classifica por função e grava hashes em .local/evidence/product-docs-inventory.json. O segundo lê Markdown fora de dependências/build/dados e valida links/quadro/evidências. Revisão semântica focou documentos ativos, objetivos/critério dos tickets, decisões e os assuntos de jogo/programação do planejamento; os quatro originais completos de concepção continuam snapshots, sem reescrever previsões antigas como código entregue. Hash/inventário/links não provam integração nem fazem auditoria exaustiva de toda frase futura.

Comandos de guia conferidos contra package.json/scripts/lockfile; dev/build e executável foram executados neste projeto. Clone/npm ci em PC novo continuam instruções, não prova de instalação externa. CODEX_START é um template de autorização e não supera pedidos posteriores. BOOTSTRAP é referência de geração; não deve sobrescrever o estado atual.

Pendências preservadas: ALP-02/C5 editor externo; ALP-09/nuvem/PC desligado/celular e ALP-10/R8; nome/licença/distribuição externa/assinatura. Nenhuma aprovação de jogo/Explorer resolve essas pendências. Tempo humano não informado.

Provas do verificador estendido em cópia real isolada: baseline passou; critérios UI-01 divergentes, tabela GAM-02 divergente, documento de release ausente e link interno quebrado em docs/release foram negados. Resultado em .local/evidence/docs-check-mutations.json. O inventário final tem 68 arquivos de docs; verificador cobre 14 tickets/88 critérios e 78 arquivos Markdown do projeto, sem aprovar integração externa. A última correção do verificador é posterior ao snapshot de segurança a8be0350 e não altera o runtime/pacote auditado.

## Inventário por arquivo

| Arquivo | Papel |
| --- | --- |
| [docs/adr/0001-ambiente-windows.md](../adr/0001-ambiente-windows.md) | decisão/prova |
| [docs/adr/0002-desktop-electron.md](../adr/0002-desktop-electron.md) | decisão/prova |
| [docs/adr/0003-vault-e-persistencia.md](../adr/0003-vault-e-persistencia.md) | decisão/prova |
| [docs/adr/0004-snapshot-mobile.md](../adr/0004-snapshot-mobile.md) | decisão/prova |
| [docs/adr/0005-editor-markdown.md](../adr/0005-editor-markdown.md) | decisão/prova |
| [docs/adr/0006-execucao-por-ticket.md](../adr/0006-execucao-por-ticket.md) | decisão/prova |
| [docs/adr/0007-explorer-local.md](../adr/0007-explorer-local.md) | decisão/prova |
| [docs/adr/README.md](../adr/README.md) | decisão/prova |
| [docs/adr/TEMPLATE.md](../adr/TEMPLATE.md) | template |
| [docs/architecture/data-model.md](../architecture/data-model.md) | produto/uso/estado |
| [docs/architecture/README.md](../architecture/README.md) | produto/uso/estado |
| [docs/decisions/checklist-mvp.md](../decisions/checklist-mvp.md) | decisão/prova |
| [docs/decisions/desk-mvp.md](../decisions/desk-mvp.md) | decisão/prova |
| [docs/decisions/focus-time.md](../decisions/focus-time.md) | decisão/prova |
| [docs/decisions/game-rules.md](../decisions/game-rules.md) | decisão/prova |
| [docs/decisions/local-storage.md](../decisions/local-storage.md) | decisão/prova |
| [docs/decisions/markdown-editor.md](../decisions/markdown-editor.md) | decisão/prova |
| [docs/decisions/mvp-scope.md](../decisions/mvp-scope.md) | decisão/prova |
| [docs/decisions/pdf-reader.md](../decisions/pdf-reader.md) | decisão/prova |
| [docs/decisions/README.md](../decisions/README.md) | decisão/prova |
| [docs/decisions/runtime-mvp.md](../decisions/runtime-mvp.md) | decisão/prova |
| [docs/decisions/vault-safety.md](../decisions/vault-safety.md) | decisão/prova |
| [docs/design/README.md](../design/README.md) | produto/uso/estado |
| [docs/GUIA_DE_USO.md](../GUIA_DE_USO.md) | produto/uso/estado |
| [docs/planning/ARQUITETURA_APP_ESTUDOS.md](../planning/ARQUITETURA_APP_ESTUDOS.md) | histórico |
| [docs/planning/BACKLOG_ALPHA_SEMANAS_1_2.md](../planning/BACKLOG_ALPHA_SEMANAS_1_2.md) | histórico |
| [docs/planning/PROMPTS_ALPHA_ALP_01_11.md](../planning/PROMPTS_ALPHA_ALP_01_11.md) | histórico |
| [docs/planning/ROADMAP_V0_1.md](../planning/ROADMAP_V0_1.md) | histórico |
| [docs/product/PRD.md](../product/PRD.md) | produto/uso/estado |
| [docs/PROMPTS_ALPHA_ALP_01_11.md](../PROMPTS_ALPHA_ALP_01_11.md) | referência de execução |
| [docs/README.md](../README.md) | produto/uso/estado |
| [docs/release/README.md](../release/README.md) | produto/uso/estado |
| [docs/sdd.md](../sdd.md) | produto/uso/estado |
| [docs/security/ENGINE_EXPLORER_AUDIT.md](../security/ENGINE_EXPLORER_AUDIT.md) | evidência datada |
| [docs/security/GAME_AUDIT.md](../security/GAME_AUDIT.md) | evidência datada |
| [docs/security/MVP_AUDIT.md](../security/MVP_AUDIT.md) | evidência datada |
| [docs/setup/agents.md](../setup/agents.md) | produto/uso/estado |
| [docs/setup/bootstrap.md](../setup/bootstrap.md) | produto/uso/estado |
| [docs/setup/CODEX_START.md](../setup/CODEX_START.md) | referência de execução |
| [docs/setup/git.md](../setup/git.md) | produto/uso/estado |
| [docs/setup/windows.md](../setup/windows.md) | produto/uso/estado |
| [docs/status/ALPHA_STATE.md](../status/ALPHA_STATE.md) | produto/uso/estado |
| [docs/status/RUN_LOG.md](../status/RUN_LOG.md) | produto/uso/estado |
| [docs/tasks/doing/ALP-02.md](../tasks/doing/ALP-02.md) | ticket/quadro |
| [docs/tasks/doing/ALP-10.md](../tasks/doing/ALP-10.md) | ticket/quadro |
| [docs/tasks/done/GAM-02.md](../tasks/done/GAM-02.md) | ticket/quadro |
| [docs/tasks/doing/README.md](../tasks/doing/README.md) | ticket/quadro |
| [docs/tasks/done/ALP-01.md](../tasks/done/ALP-01.md) | ticket/quadro |
| [docs/tasks/done/ALP-03.md](../tasks/done/ALP-03.md) | ticket/quadro |
| [docs/tasks/done/ALP-04.md](../tasks/done/ALP-04.md) | ticket/quadro |
| [docs/tasks/done/ALP-05.md](../tasks/done/ALP-05.md) | ticket/quadro |
| [docs/tasks/done/ALP-06.md](../tasks/done/ALP-06.md) | ticket/quadro |
| [docs/tasks/done/ALP-07.md](../tasks/done/ALP-07.md) | ticket/quadro |
| [docs/tasks/done/ALP-08.md](../tasks/done/ALP-08.md) | ticket/quadro |
| [docs/tasks/done/ALP-11.md](../tasks/done/ALP-11.md) | ticket/quadro |
| [docs/tasks/done/GAM-01.md](../tasks/done/GAM-01.md) | ticket/quadro |
| [docs/tasks/done/README.md](../tasks/done/README.md) | ticket/quadro |
| [docs/tasks/done/UI-01.md](../tasks/done/UI-01.md) | ticket/quadro |
| [docs/tasks/README.md](../tasks/README.md) | ticket/quadro |
| [docs/tasks/TEMPLATE.md](../tasks/TEMPLATE.md) | template |
| [docs/tasks/todo/ALP-09.md](../tasks/todo/ALP-09.md) | ticket/quadro |
| [docs/validation/ALPHA.md](ALPHA.md) | evidência datada |
| [docs/validation/BOOTSTRAP.md](BOOTSTRAP.md) | evidência datada |
| [docs/validation/ENGINE_EXPLORER.md](ENGINE_EXPLORER.md) | evidência datada |
| [docs/validation/FRONTEND.md](FRONTEND.md) | evidência datada |
| [docs/validation/GAME.md](GAME.md) | evidência datada |
| [docs/validation/MVP_JOURNEY.md](MVP_JOURNEY.md) | evidência datada |
| [docs/validation/PRODUCT_DOCS.md](PRODUCT_DOCS.md) | evidência datada |

## Atualização documental UI-02, 03/10/2026

O inventário de 68 arquivos acima identifica o checkpoint GAM-02. UI-02 acrescentou o [ticket de refinamento](../tasks/done/UI-02.md), [prova Windows](SMOOTH_UI.md) e [AppSec](../security/SMOOTH_UI_AUDIT.md), mantendo os snapshots históricos. Guia/README/índice/design/setup Git/retomada/validação/quadro e memória foram atualizados para a barra fixa, sintaxe/árvore/caminho, feedback do motor e movimento normal/reduzido/retarget; schema v3 e capacidades específicas não mudaram. Comandos conferidos contra scripts/lockfile; clone em PC novo continua instrução, não prova externa. ALP-02 externo/nuvem/R8 continuam pendentes. Novo inventário e verificador no fechamento leem os documentos atuais; essa checagem documental não substitui a execução registrada em SMOOTH_UI.

No fechamento UI-02, novo inventário leu 71 arquivos de docs. Check-bootstrap inclui 15 tickets/96 critérios; resultado final de links/Markdown fica no RUN_LOG. Documentos históricos conservam os números datados de seus próprios checkpoints.
