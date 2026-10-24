# GAM-07 — Mira, acesso aos minigames e 3D da cidade

24/10/2026, Windows 11 Pro 10.0.26300, Node 24.21.0 portátil, Electron 44.5.1, pacote `release/win-unpacked/App Estudos.exe` gerado da branch `feat/cidade-e-mira`. Fixtures geradas em `.local/`, com a economia ganha jogando pela API real do jogo. Nenhum dado pessoal foi usado. Ticket: [GAM-07](../tasks/done/GAM-07.md); decisão: [ADR-0027](../adr/0027-mira-e-acesso-aos-minigames.md).

## Por critério

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 Mira no main | aprovado | `tests/aim.test.ts`, 2 testes (detalhes abaixo) |
| C2 Mira na interface | aprovado | `scripts/smoke-aim-city.ts` no pacote (detalhes abaixo) |
| C3 Acesso aos minigames | aprovado | `smoke-aim-city`: menu, lista no Observatório e entradas no mapa; capturas `observatorio-*` |
| C4 3D nas três skins | aprovado | Capturas abaixo; brilho conferido pelo atributo `data-bloom` do canvas, ligado só no Cyberpunk e à noite |
| C5 Regressão e documentação | aprovado | Typecheck e testes na baseline mais os testes novos; documentação feita; 9 smokes de regressão aprovados (ver Regressão) |

**C1, testes.** Os 2 testes de `tests/aim.test.ts` cobrem:
- pontos por distância ao centro, precisão com cliques no vazio e sequência;
- quadrados dentro da arena e no ritmo do nível;
- término antes do último quadrado recusado, além de acerto repetido, tardio ou de índice inexistente;
- deslocamento fora de −1…1 recusado pelo Zod;
- pagamento único, recorde, métricas e conquista `aimrounds-1`;
- rodada substituída que não pode mais ser encerrada, e precisão zero sem pagamento.

**C2, smoke no pacote.** O `smoke-aim-city` mostrou:
- rodada Leve com 20/20 no centro: SS, 100% de precisão, pago uma vez;
- rodada Difícil a 60% do meio-lado: só 100 pontos, cerca de 32%;
- saída no meio da rodada não paga nada.

## Ocorrência corrigida

O-039: a barra de avisos do jogo cobria a parte de baixo da arena e engolia cliques. Em cerca de uma de cada três execuções, a rodada Leve saía com 1 ou 2 quadrados perdidos. A correção esconde os avisos comuns durante a rodada. Depois dela, `smoke-aim-city` passou 5 vezes seguidas: 4 num pacote intermediário e 1 no pacote final. O roteiro agora confere com `elementFromPoint` que nada cobre cada quadrado.

## Verificações

| Verificação | Resultado |
| --- | --- |
| `tsc --noEmit` | 61 erros, iguais à baseline e todos de IA-02/CAP-01 (não rastreados) |
| `npm test` | 91 de 111 aprovados; as mesmas 20 falhas de IA-02/CAP-01; os 2 testes novos passam |
| `npm run build` e `electron-builder --win --dir` | aprovados |
| `smoke-aim-city` no pacote final, com brilho reduzido | aprovado (`.local/smoke-runs/gam07-glow/`) |

## Capturas

Pasta [evidence/gam-07](evidence/gam-07/):

- `observatorio-vale-dourado`, `observatorio-vale-noite`, `observatorio-cyberpunk`, `observatorio-newyork-dourado`, `observatorio-newyork-noite`;
- `mira-inicio`, `mira-rodada-dificil`, `mira-resultado-leve`, `mira-resultado-dificil`.

## Brilho reduzido

A pedido do usuário, a incandescência da cidade foi reduzida em cerca de um terço:

- bloom: força 0,85 → 0,55 no Cyberpunk e 0,55 → 0,35 à noite; limiar 0,78 → 0,85; raio 0,45 → 0,35;
- intensidade emissiva: janelas do Vale 1,3 → 0,9, janelas de New York 1,1 → 0,75, neons 1,2 → 0,85 (Cyberpunk) e 1 → 0,8 (Vale).

As capturas acima são do pacote com esses valores.

## Regressão

Uma primeira rodada foi interrompida pelo Claude Code por falta de memória no sistema. Repetida em sequência no pacote anterior ao ajuste de brilho (`.local/smoke-runs/gam07/`), todos aprovados:

| Roteiro | Tempo |
| --- | --- |
| `smoke-idle-game` | 162 s |
| `smoke-visual-experience` | 49 s |
| `smoke-settings` | 13 s |
| `smoke-clean-workspace` | 34 s |
| `smoke-knowledge-backup` | 14 s |
| `smoke-smooth-ui` | 18 s |
| `smoke-videos` | 54 s |
| `smoke-engine-explorer` | 11 s |
| `smoke-game-security` | 3 s |

O ajuste de brilho muda só constantes de material e de pós-processamento; o pacote com ele passou no `smoke-aim-city`, que percorre as três skins. O executor é o mesmo de [QA-01](QA_01_SMOKES.md).

## Não verificado

- a sensação de jogo e o novo nível de brilho com uma pessoa;
- o layout compacto (menos de 720 px) da lista de minigames;
- o custo do brilho em GPU integrada.
