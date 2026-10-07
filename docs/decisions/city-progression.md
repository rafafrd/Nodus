# Profundidade da cidade — GAM-03

06/10/2026. Escolhas confirmadas pelo usuário antes da implementação. [ADR-0013](../adr/0013-cidade-progressiva-e-janela.md).

## Leitura de Cookie Clicker

Foi consultado o [jogo oficial](https://orteil.dashnet.org/cookieclicker/) e seu [código oficial publicado](https://orteil.dashnet.org/cookieclicker/main.js), baixado apenas em .local/cookie-reference.js para leitura. A implementação consultada usa custo exponencial de construções (fator 1,15), upgrades por tiers/sinergias, conquistas que participam de multiplicadores de produção e ascensão calculada sobre produção acumulada. A raiz cúbica e os marcos muito altos do jogo sustentam uma economia de longa duração. A profundidade vem das escolhas de investimento e do retorno de ciclos, além da quantidade de compras.

Adaptação autoral: Nodus usa fator 1,17, cinco redes produtivas, cadeias de três especializações, sinergias da cidade, melhorias de pulso, conquistas permanentes e reinício parcial opcional. A escala/localidade são próprias; não pretende reproduzir todo Cookie Clicker. Sem arte/textos copiados, eventos aleatórios, monetização ou obrigação diária. Progresso do jogo não avalia domínio acadêmico.

## Balanceamento implementado

| Produtor | Custo base | Moedas/min por unidade | Desbloqueia após produzir |
| --- | --- | --- | --- |
| Coletores | 40 | 3 | 0 |
| Oficinas | 240 | 18 | 200 |
| Armazéns | 1.400 | 105 | 1.500 |
| Centrais | 9.000 | 700 | 12.000 |
| Observatórios | 60.000 | 4.800 | 90.000 |

Compra ×1/×10 soma os preços crescentes de cada unidade; não usa preço unitário multiplicado por dez. Limite de 100 unidades por tipo/ciclo. Cada produtor possui três upgrades ×2: 5/15/30 unidades e melhoria anterior. Custos base ×8/×40/×180. Três melhorias de pulso exigem 100/500/2.000 pulsos e nível 2/5/8 do motor; cada uma dobra a potência. Três sinergias exigem 20/60/150 produtores, cada uma soma 25% de produção global. São 21 tecnologias no total.

As 27 conquistas usam produção acumulada, pulsos, produtores/tecnologias no ciclo, colheitas, coletas, Oficina/partidas perfeitas, memória e prestígio. Critérios/progresso aparecem na interface; cada conquista acrescenta 1% de produção automática permanentemente. Carteira e produção acumulada são distintas: comprar não subtrai produção histórica. Entrada inicial de 60 moedas não conta como produção. Legacy economy deriva contadores existentes do ledger, sem repetir o crédito inicial.

Taxa global = (moinho + produtores especializados) × (1 + 0,05×prestígio) × (1 + 0,01×conquistas) × (1 + 0,25×sinergias) × bônus permanente. Pulso = (1 + 2×nível do motor) × tecnologias de pulso × ferramentas herdadas. Rate é arredondado a duas casas; carteira usa moedas inteiras e carrega a fração da liquidação. O main liquida a taxa anterior antes de mudanças. Produção offline limitada a 7 dias por visita; relógio retrocedido não soma tempo; consultas/replays não duplicam renda. Créditos passivos do mesmo minuto/ciclo compartilham linha de ledger para limitar crescimento durante visitas longas.

## Prestígio

Ganho = máximo(0, piso(raiz(produção acumulada / 20.000)) − prestígio já recebido). Primeira insígnia em 20.000, total de duas em 80.000, três em 180.000. Cada ponto mantém +5% de produção, mesmo depois de gastar as insígnias.

Melhorias permanentes: Ferramentas herdadas (1 insígnia, pulso ×2); Carta da cidade (3, produtores 10% mais baratos); Horizonte longo (5, offline até 14 dias); Conhecimento compartilhado (8, produção ×1,25). Prévia informa ganho/perdas/preservações; checkbox e botão final exigem escolha explícita. Cancelar mantém o ciclo. Preview obsoleta é rejeitada no main, sem reset parcial.

Reinicia saldo, produtores, tecnologias do ciclo e nível do motor. Oficina ativa é encerrada. Conserva notas/matérias/projetos/foco, XP/personagem, inventário, canteiros/cultivos, compras do mercado (incluindo moinho), skin/atmosfera, memória, conquistas e upgrades permanentes. Não confundir este reset da economia com restauração ou remoção de dados.

## Oficina e cenários

Novas partidas: 36 etapas em blocos de 12. Preparação mínima por etapa: 3,5s normal / 4,5s tranquilo. QTE normal responde em 2,2/1,85/1,5s; tranquilo 3,4/3,1/2,8s. Até seis erros; sétimo encerra sem multa. Calibração normal tem períodos 2,4/2,15/1,9s e faixas 22/18/14; tranquilo 3,2/2,95/2,7s e faixas 32/28/24. Cada etapa aceita no máximo duas passagens antes de registrar erro; até dez erros. Falhas/tentativas canceladas não recebem recompensa.

Partidas completas rendem até 240 moedas QTE / 300 calibração e 60 XP, proporcionais aos acertos; normal aplica +25% em moedas. Teclado ou botões; pausa suspende prazos e persiste. Janela/cinema/área ocultos não aceitam entrada; o cronômetro continua se a partida não foi pausada. Duração típica alvo de 2–4 min, dependente de reação/erros; pausas podem prolongá-la. Partidas anteriores de três etapas conservam regras/recompensas e são retomadas sem reset.

Vale Sereno conserva o cenário original. New York acrescenta brownstones/escadas de incêndio, caixas d'água, skyline, avenidas/táxis e parque. Cyberpunk usa torres/antenas, néon, materiais metálicos, vias luminosas e distrito botânico. Farm/mine/forest/mill/shop/plaza/engine conservam posições/funções. Decorações compradas continuam representadas. Escolha é gratuita, persistida e não influencia a economia. Movimento reduzido usa redraw sob demanda; trocar skin conserva canvas/câmera/estado do cultivo.

## Atualização UI-04

O usuário substituiu as metas temporais anteriores: deseja36 etapas curtas/intensas, sem espera entre sinais, somente preparo inicial. Motor não tem cooldown e usa fila idempotente; módulos/detalhes são isolados/recolhidos. As regras anteriores acima são históricas nos pontos substituídos; produtores, conquistas, prestígio, skins e valores de recompensa permanecem. [Regras atuais](game-rules.md), [ADR-0014](../adr/0014-areas-isoladas.md).
