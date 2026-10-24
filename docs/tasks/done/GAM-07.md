---
id: GAM-07
status: done
outcome: concluido
depends_on: ["GAM-06", "QA-01"]
criteria_count: 5
---

# GAM-07 — Cidade em 3D melhor, minigames fáceis de achar e Mira

## Objetivo e dependências

Pedido de 24/10/2026, depois do merge dos PRs #17 e #18:

- foco no jogo da cidade, com o 3D melhorado em todas as skins;
- acesso aos minigames mais intuitivo e fácil de achar;
- um minigame de mira no estilo osu!, focado em precisão e já com dificuldades.

O trabalho foi feito na branch `feat/cidade-e-mira`, criada da `main` atualizada (488ce1c). Os arquivos não rastreados de IA-02/CAP-01 ficaram fora do stage. A decisão está no [ADR-0027](../../adr/0027-mira-e-acesso-aos-minigames.md).

## Prompt de execução

C1. **Mira no main.** Quatro níveis. O main sorteia os quadrados, só aceita o término depois do último, valida cada acerto (quadrado, janela de tempo, deslocamento) e paga uma vez pela precisão. Testes cobrem pontuação, término antecipado, repetição, rodada substituída e rodada sem acerto.
C2. **Mira na interface.** Contagem de 3 s, quadrado que se fecha, 300/100/50 pela distância ao centro, clique no vazio contando contra, painel ao vivo, resultado com nota, saída sem pagamento. Tudo funcionando no pacote Windows.
C3. **Acesso aos minigames.**
  - Menu agrupado (CIDADE, MINIGAMES, PROGRESSO).
  - Lista no Observatório com o estado de cada minigame.
  - Etiquetas "JOGAR ▸" e anéis no mapa.
  - Estande da Mira na cidade.
C4. **3D melhor nas três skins.**
  - Luz de preenchimento, neblina, sombras em 2048 e densidade de pixels até 2.
  - Brilho só no Cyberpunk e à noite.
  - Janelas acesas à noite; fumaça, pássaros e rocha no Vale; aeronaves no Cyberpunk.
  - Capturas de cada skin.
C5. **Regressão e documentação.** Typecheck e testes na baseline mais os testes novos; smokes da cidade e do jogo aprovados no pacote. ADR, design, guia, validação, gotcha, quadro e retomada atualizados.

## Execução e retomada

24/10/2026: C1–C5 aprovados. Provas e capturas estão em [GAM_07_AIM_CITY](../../validation/GAM_07_AIM_CITY.md).

- **Verificado:** typecheck 61 erros (baseline), testes 91/111 com as mesmas 20 falhas de IA-02/CAP-01, build, pacote Windows, `smoke-aim-city` e os 9 smokes de regressão da cidade e do jogo aprovados. O-039 (aviso cobrindo a arena) foi encontrado e corrigido.
- **Ajuste:** a pedido do usuário, o brilho da cidade foi reduzido em cerca de um terço (bloom e intensidade emissiva); o pacote com o ajuste passou no `smoke-aim-city`.
- **Git:** commit, push e PR autorizados pelo usuário; merge não. Branch `feat/cidade-e-mira`, commits 9e9e070 (código), 9d0eb01 (testes) e 514cfff (docs); [PR #19](https://github.com/rafafrd/Nodus/pull/19) aberto para `main`.
- **Não verificado:** sensação de jogo com uma pessoa, layout abaixo de 720 px e custo do brilho em GPU integrada.
