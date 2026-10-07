# Balanceamento — Produção2

07/10/2026. Relatórios gerados pelo motor puro em Node24, sem UI. Curvas de `economy-balance.ts`, algoritmo de `scripts/simulate-economy.ts`; [arquitetura](../architecture/economy.md).

## Modelo e alvo

Sessão diária de30/45/60min, saldo inicial60, compras somente durante a sessão (e instalação inicial), até seis decisões por minuto, melhor ROI marginal positivo entre compras acessíveis. Créditos passivos usam carry, estudo usa recompensa real e consistência qualificada após10min. Tempo discretizado por minuto; não antecipa minuto de estudo em t=0. Conquistas consideradas a cada passo. Sem motor, revisões, sinais, build especializada ou reinício de prestígio. Não é telemetria nem medição de pessoas. Compras automáticas durante estudo são uma hipótese do simulador, não comportamento imposto pela interface.

Meta escolhida: primeiro prestígio em3–7dias de30–60min/dia. A primeira curva testada chegava em38min e foi rejeitada; custos de famílias e escala de prestígio foram recalibrados. Resultado final:

| Estudo/dia | Primeira compra | 10 Coletores | Primeiro tier | Compra da segunda família | 100 Coletores | Primeiro prestígio |
| --- | --- | --- | --- | --- | --- | --- |
| 30min | 0min (starter) | 16min | 24min | 1441min | 5774min | 7411min / 5.15dias |
| 45min | 0min (starter) | 16min | 24min | 1441min | 4341min | 6192min / 4.30dias |
| 60min | 0min (starter) | 16min | 24min | 48min | 2923min | 5908min / 4.10dias |

Segunda família é a **compra pela estratégia**, não seu instante de desbloqueio. Em30/45min, o algoritmo prefere melhorar Coletores e volta a comprar no dia seguinte. Outras decisões, revisões, builds, eventos e minigames podem antecipar a progressão. Prestígio opcional não foi executado neste modelo.

## Checkpoints —45min/dia

| Tempo | Saldo | Lifetime | Produção/min | Unidades | Famílias | Upgrades | Ganho disponível |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1min | 1 | 27 | 6.024 | 2 | 1 | 0 | 0 |
| 5min | 13 | 153 | 12.072 | 4 | 1 | 0 | 0 |
| 30min | 19 | 3313 | 110.376 | 18 | 1 | 1 | 0 |
| 60min | 5199 | 15251 | 309 | 25 | 1 | 2 | 0 |
| 480min | 135251 | 145303 | 310.2 | 25 | 1 | 2 | 0 |
| 1440min | 433043 | 443095 | 310.2 | 25 | 1 | 2 | 0 |
| 10080min | 3.84629e+13 | 5.49109e+13 | 2.74855e+10 | 565 | 7 | 42 | 7 |

## Retorno marginal ao final de7dias —45min/dia

| Família | Custo da próxima unidade | Ganho/min | Retorno em minutos |
| --- | --- | --- | --- |
| spectral-labs | 5.75755e+11 | 5.45533e+8 | 1055.40 |
| automata | 1.74901e+12 | 1.45688e+9 | 1200.52 |
| observatories | 2.17962e+11 | 1.79845e+8 | 1211.95 |
| powerplants | 1.65027e+11 | 3.18329e+7 | 5184.16 |
| warehouses | 1.96227e+11 | 3.47396e+7 | 5648.50 |
| compute-cores | 1.00000e+15 | 4.85625e+10 | 20592.0 |
| workshops | 1.47731e+11 | 3.34322e+6 | 44188.3 |
| collectors | 1.28631e+11 | 747077 | 172179 |
| orbital-beacons | 1.00000e+18 | 2.42812e+12 | 411840 |
| horizon-mesh | 1.00000e+21 | 2.42812e+14 | 4.11840e+6 |
| planetary-archives | 1.00000e+25 | 9.71250e+16 | 1.02960e+8 |
| stellar-choirs | 1.00000e+30 | 4.85625e+19 | 2.05920e+10 |
| instant-atelier | 1.00000e+36 | 4.85625e+23 | 2.05920e+12 |
| cartographic-folds | 1.00000e+43 | 4.85625e+28 | 2.05920e+14 |
| reality-anchors | 1.00000e+51 | 4.85625e+34 | 2.05920e+16 |
| impossible-council | 1.00000e+60 | 4.85625e+41 | 2.05920e+18 |

A tabela compara incremento unitário teórico, inclusive famílias ainda bloqueadas; não considera poder comprar o próximo tier ou uma sinergia por atingir um marco. O retorno alto de famílias antigas orienta buscar conexões/tiers, não comprar sempre a mesma família. Não há conclusão de que todo conteúdo sempre seja competitivo.

## Reprodução e limites

Com Node24 ativo: `npm run simulate:economy -- 30`, depois45 e60. Saídas locais em `.local/evidence`; cópias sanitizadas versionadas em [balance-30](../evidence/gam-04/balance-30.json), [balance-45](../evidence/gam-04/balance-45.json), [balance-60](../evidence/gam-04/balance-60.json). Os scripts usam o mesmo motor e não um mock de integração.

As três trajetórias de7dias aprovam o alvo inicial e mostram diferenças estratégicas. Não aprovam diversão, retenção, equilíbrio de todos os305upgrades ou semanas/meses de endgame. Isso requer playtesting e novas simulações conforme telemetria voluntária/feedback. Fronteiras numéricas, compras em lote, sinergias e fonte idempotente são cobertas separadamente por testes reais/puramente matemáticos. Não há notificação punitiva, perda por ausência ou prazo de evento guardado.
