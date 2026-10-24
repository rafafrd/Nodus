# ADR-0027 — Mira, um minijogo de precisão, e acesso claro aos minijogos

Estado: aceita para GAM-07, 24/10/2026. Complementa [ADR-0026](0026-jogo-incremental-independente.md) e revê o pilar 4 de [GAME_DESIGN](../design/GAME_DESIGN.md) ("decisão, não reflexo"). Provas em [GAM_07_AIM_CITY](../validation/GAM_07_AIM_CITY.md).

## Contexto

GAM-06 tirou o reflexo do jogo junto com a Oficina, que exigia de 2 a 4 minutos seguidos de QTE para pagar. Depois do merge dos PRs #17 e #18, o usuário pediu três coisas:

- foco na cidade, com o 3D melhorado nas três skins;
- minijogos fáceis de achar;
- um minijogo de mira no estilo osu!, focado em precisão e com dificuldades.

O pedido é explícito, então o reflexo volta, com limites que preservam o resto do pilar.

## Decisão

1. **Mira** é um minijogo opcional. Quadrados aparecem numa arena de 1000 × 600 unidades e somem sozinhos; um quadrado externo que se fecha mostra o tempo restante. O ponto vale pela distância ao centro:

   | Distância ao centro | Pontos |
   | --- | --- |
   | até 40 % do meio-lado | 300 |
   | até 75 % | 100 |
   | no restante | 50 |

   Clique no vazio entra no denominador da precisão. Há quatro níveis:

   | Nível | Quadrados | Lado | Vida | Intervalo |
   | --- | --- | --- | --- | --- |
   | Leve | 20 | 110 | 1,5 s | 0,85 s |
   | Normal | 28 | 84 | 1,15 s | 0,65 s |
   | Difícil | 36 | 64 | 0,85 s | 0,5 s |
   | Insano | 45 | 46 | 0,62 s | 0,36 s |

   Cada rodada dura cerca de 20 s, com contagem de 3 s.
2. **O main é a autoridade.**
   - Sorteia os quadrados (`aim-start`), cada um a pelo menos 1,8 lado do anterior.
   - Só aceita o término (`aim-finish`) depois que o último quadrado saiu, pelo relógio do main.
   - Recusa um acerto repetido, de quadrado inexistente ou fora da janela do quadrado (de 50 ms antes a 150 ms depois).
   - Paga uma vez por rodada (ledger `aim:<id>`).

   Os quadrados ficam na tabela `game_rounds`, e o estado da Mira no JSON do jogador. Não há migration.
3. **Recompensa modesta.** Paga `2 × multiplicador` minutos de produção × precisão², com piso de `10 × multiplicador` centelhas; o multiplicador vai de 1 (Leve) a 4 (Insano). Precisão zero não paga. XP: `6 × multiplicador × precisão`, mais 5 numa rodada perfeita. As métricas novas `aimRounds` e `aimPerfect` alimentam dez conquistas.
4. **O pilar 4 passa a valer para o progresso, não para todo minijogo.** Nenhuma etapa do jogo depende da Mira. A Memória continua sendo o minijogo sem tempo, e a Mira avisa que precisa de mouse ou toque. Sair da área ou esconder a janela encerra a rodada sem pagar.
5. **Acesso.**
   - O menu do jogo ganha os grupos CIDADE, MINIGAMES e PROGRESSO.
   - O Observatório lista os quatro minijogos abaixo do núcleo, com o estado de cada um: "2 prontas para colher", "Abre com 10 Coletores · 4/10" e assim por diante.
   - No mapa, os locais de minijogo têm etiqueta própria com "JOGAR ▸" e um anel no chão que pulsa quando está aberto. Um ponto marca o que espera ação.
   - A Mira tem um estande próprio na cidade.
6. **3D.**
   - Luz de preenchimento, neblina até o horizonte, sombras em 2048 e densidade de pixels até 2.
   - Brilho (UnrealBloom) só no Cyberpunk e à noite.
   - Janelas acesas à noite no Vale e em New York; fumaça nas chaminés, pássaros e uma camada de rocha sob a ilha do Vale; aeronaves no Cyberpunk.

## Consequências

- O cliente conhece os quadrados para poder desenhá-los, então um script local conseguiria acertar todos. O limite de tempo do main mantém o ganho por minuto no mesmo nível de quem joga de verdade. O jogo é local e de um jogador só; a proteção é de plausibilidade, como o balde de cliques do núcleo.
- O brilho pós-processado custa mais GPU. Por isso fica restrito às cenas com fontes de luz e usa densidade de pixels até 1,5.
- O quadrado que se fecha continua encolhendo com movimento reduzido, porque é informação (o relógio do alvo), assim como o anel do Lampejo. O movimento decorativo (marcas de pontos, pulsos, fumaça e pássaros) para.
