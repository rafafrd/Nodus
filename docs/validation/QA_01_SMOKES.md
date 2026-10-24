# QA-01 — Roteiros de smoke atualizados

24/10/2026, Windows 11 Pro 10.0.26300, Node 24.21.0 portátil, Electron 44.5.1. Pacote `release/win-unpacked/App Estudos.exe` gerado do commit cefbf56 (código do app idêntico em `chore/roteiros-smoke`). Fixtures geradas em `.local/`, sem perfil, vault ou dado pessoal. Ticket: [QA-01](../tasks/done/QA-01.md).

## O que estava quebrado

Na rodada inicial, 18 dos 22 roteiros suspeitos falharam. Ela começou antes das correções, e os últimos roteiros já rodaram com parte delas: `smoke-visual-experience` e `smoke-pdf-export` passaram depois do ajuste de seletor. Quase todos caíam no primeiro passo, porque esperavam um heading "Nota A" que UX-01 trocou por um campo de texto (O-030). Os que avançavam paravam em recursos que não existem mais:

- a mesa em grade da alpha ("Abrir todos os módulos", "Só caderno", régua "Largura do caderno", dock e barra de status);
- os botões de matéria;
- a tela Hoje antiga ("Retomar mesa");
- o diálogo de nova nota;
- o jogo anterior a GAM-06 (motor, "Gerar moedas", Oficina com QTE e skillcheck, Mercado).

## Mudanças comuns

`scripts/test-fixture.ts` ganhou:

- `noteTitle(page, título)`: espera o campo `#note-title-input` mostrar o título da nota aberta, no lugar do heading antigo;
- `chooseSubject(page, nome)`: escolhe no seletor "Matéria atual" da barra lateral, no lugar dos botões de matéria;
- `prepareFixture(prefixo, panes)`: abre a primeira aba com as janelas pedidas. `['study','pdf']` reproduz a mesa antiga, com a nota ao lado do PDF. O padrão continua `['study']`, então os roteiros não rastreados de IA-02/CAP-01 não mudam.

## Por roteiro

| Roteiro | O que mudou | Equivalente atual ou cobertura |
| --- | --- | --- |
| smoke-annotations | fixture com PDF aberto; "Vídeos" → "Abrir Vídeo" | — |
| smoke-checklist | abre o painel suspenso "Abrir checklist" | — |
| smoke-clean-workspace | rótulos das áreas (PDFs, Conexões, Projetos); acervo volta a escolher a matéria; contagem de camadas espera a condição final; clique no nó do grafo despachado; o motor e a Oficina deram lugar a 20 cliques no núcleo em ritmo humano, Perfil e Memória | contagem exata de cliques no main e números flutuantes só com movimento |
| smoke-desk | reescrito sobre a mesa atual: nota, PDF, página e rascunho por matéria e após reinício | larguras das colunas pertencem à aba: smoke-study-tabs |
| smoke-development | fixture com PDF aberto | — |
| smoke-editor | digita no fim do corpo com Enter (o editor mostra só o corpo desde UX-01) | bytes do arquivo idênticos fora do trecho editado |
| smoke-engine-explorer | parte do jogo: clique no núcleo confirmado pelo main | economia: smoke-idle-game |
| smoke-expansion | abre "Mais formatação e fonte" antes do flashcard; nota de origem oculta lida mesmo assim; Início usa "Continuar esta tarefa"; nota nova sem diálogo | — |
| smoke-focus | fixture com PDF; abre o painel de foco em cada passada | — |
| smoke-knowledge-backup | abre "Notas e relações" no grafo; título por campo; motor e mercado → 20 cliques, uma compra e ambiente Noite, conferidos também no perfil restaurado | — |
| smoke-pdf | fixture com PDF aberto | — |
| smoke-settings | compara o token `--theme-bg` (as superfícies ficaram transparentes em UI-08); canvas da cidade por `data-testid`; "fazenda" (agora abre a Horta) → moinho | — |
| smoke-sidebar | rótulos das áreas; linha de hover medida num item não selecionado (o selecionado tem marcador fixo desde UI-07); margem mínima de 6 px, porque UI-07 levou a linha de 16 para 8 px antes do ícone | escolha da UI-06: "linha afastada dos ícones" |
| smoke-smooth-ui | grade da mesa → dividir com PDFs conservando o mesmo editor; foco pelo painel suspenso; motor → compra com carteira pintando valores intermediários; QTE oculto removido; arraste do Explorer medido a partir da largura inicial; tema Oliva para o realce de sintaxe; transform final `none` | transições de área: smoke-motion; teclado do jogo: o jogo não escuta teclado, e smoke-videos prova que o cinema não clica no núcleo |
| smoke-vault | perfil novo abre na Início: acervo e Editar; preenche só o corpo | — |
| smoke-store.mjs | "Nova matéria pelo menu" | — |
| smoke-visual-experience | escultura limitada à camada visível (O-037) | — |
| smoke-videos | canvas da cidade por `data-testid` (já passava) | — |
| preview-frontend | fixture com nota e PDF lado a lado; "Só caderno" → menu recolhido; checklist e foco pelos painéis; compacto mede janelas e rodapé; primeiro uso pela Início | — |
| smoke-editorial | Início "Seu ponto de partida."; canvas da cidade; volta à mesa pela barra; fixture reposta para poder repetir | — |
| smoke-pdf-export, smoke-external-activities, smoke-desktop.mjs, smoke-editor.mjs | só o helper do título, ou nada | — |

## Comandos

Rodada inicial: `node run-smokes.mjs .local/smoke-runs/r1 <22 roteiros>`. Esse executor fica no scratchpad: roda cada roteiro com tsx, em sequência, com limite de 7 minutos, e grava um log por roteiro. Usa `--packaged` em smooth-ui, videos e editorial; os demais rodam no modo padrão de cada roteiro.

Rodada final: `node run-smokes.mjs .local/smoke-runs/r2 <29 roteiros>`, com todos os smokes rastreados exceto editorial. Também rodaram:

- `tsx scripts/preview-frontend.ts --packaged --stage=qa01`;
- `tsx scripts/preview-frontend.ts --packaged --stage=qa01-editorial --desk-only`, seguido de `tsx scripts/smoke-editorial.ts --packaged --fixture=.local/frontend-preview-4V795y`;
- `--packaged` para checklist, desk, pdf e editor, que por padrão usam o Electron de desenvolvimento sobre `dist/`.

## Resultados

| Verificação | Resultado |
| --- | --- |
| Rodada final, 29 roteiros em sequência | aprovado: 28 de 29 de primeira; o `smoke-smooth-ui` falhou por tempo, ao ler a carteira depois do fim da animação (todas as amostras em 5) |
| `smoke-smooth-ui` depois de amostrar a carteira por quadro desde antes da compra | aprovado 3 vezes seguidas (`.local/smoke-runs/r2/smooth-ui-rerun-*.log`) |
| `preview-frontend --packaged --stage=qa01`, jornada completa | aprovado; capturas `frontend-qa01-*.png` inspecionadas |
| `smoke-editorial --packaged` sobre fixture nova do `preview-frontend` | aprovado |
| checklist, desk, pdf e editor com `--packaged` | aprovados |
| Typecheck do projeto | 61 erros, iguais à baseline e todos de IA-02/CAP-01 |
| Testes | 89 de 109, com as mesmas 20 falhas de IA-02/CAP-01 |
| Código do app | sem mudança: `git diff ced0f26 -- src` vazio |

Os logs por roteiro ficam em `.local/smoke-runs/` (não versionado).

## Limites

- Os roteiros dos arquivos não rastreados de IA-02/CAP-01 (captura, edge, study-materials) não foram executados nem alterados.
- O seletor nativo de pastas e arquivos continua fora da automação, como antes.
- `smoke-videos` depende do player do YouTube na rede.
- Typecheck do projeto não inclui `scripts/`. Uma checagem à parte dos roteiros alterados só mostrou as classes de erro que já existiam em todos os roteiros (tipo de `window.desktop`, `env`, `electronPath`).
