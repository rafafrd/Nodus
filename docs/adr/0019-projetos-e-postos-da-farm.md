# ADR-0019 — Projetos materiais e postos da farm

Status: aceita para GAM-05. Data: 09/10/2026.

## Contexto

O usuário aprovou o ciclo coletar → construir → automatizar → reinvestir dentro da Cidade, com estudo opcional, projetos permanentes e equilíbrio ativo/idle. A persistência Game/ledger/operações e o catálogo GAM-04 já existem; UX-01 e DOC-01 têm alterações locais preservadas.

## Decisão

Três projetos definidos em `shared/farm.ts`: depósito (10 madeiras/5 pedras), bosque (20 madeiras/10 pedras/10 trigos), mina (30 pedras/15 madeiras/5 cenouras). O depósito libera os postos; a preferência de ordem pode ser trocada sem consumir materiais. Um cartão na Vila mostra somente o próximo projeto, benefício, progresso e faltantes com atalhos. Após os três, aponta para uma instalação/melhoria elegível do catálogo existente. Não se cria moeda, prazo, pedido diário, família produtora ou árvore adicional.

O JSON de `game_player.state` ganha `farm: {built, target, stations}`. Cada posto guarda `stock`, `carryMs`, `settledAt`; 60.000ms produzem uma unidade, máximo200. A liquidação usa tempo do main e o horizonte offline existente (7/14dias). Ao encher, descarta tempo/fração excedentes; recolher não recupera um backlog. Regressão de relógio conserva a marca temporal. Perfil sem farm recebe um baseline vazio persistido imediatamente; construir começa a produzir no instante da construção. Prestígio não altera a farm. Backup/restauração já transportam esse JSON, sem migration/tabela nova.

GameAction estrito acrescenta `farm-build`, `farm-target`, `farm-collect` no IPC existente. Custos, inventário, estado, ledger, recibo e audit fazem parte da mesma transação Store. Recolher não concede Produção, XP, progresso de coleta/colheita nem recompensa de atividade. Materiais só geram Produção se o usuário os vender pelas regras existentes. Overflow de inventário falha preservando o estoque. Replay conserva também a liquidação temporal, sem repetir a construção/recolhimento.

Motor: `R` é Produção/minuto instalada, calculada no main com tecnologias, legado, moinho/build/conquistas e **sem eventos ativos**. `B = ceil(max(1200, 2R))`; `base = (1+2nível) × multiplicador permanente de pulso`; `ganho = floor(min(restante, max(64, 0,05R), max(base, R×base/600)))`. Sem instalações, reproduz o piso/cap anterior; na escala proporcional o nível0 equivale a0,1s e o nível10 a2,1s de produção por pulso antes do multiplicador, com cap proporcional de3s. O orçamento permite dois minutos/dia na escala instalada, preservando o piso inicial. Arredondamento ocorre somente na cotação final inteira; orçamento, saldo gasto, restante e ganho usam Amount e soma/subtração inteira exata. O dia local só renova se posterior ao último dia gasto. Melhorias/marcos duradouros podem ampliar o orçamento durante o mesmo dia; eventos não. Queda de taxa não gera restante negativo.

A UI exibe o ganho disponível e o saldo de hoje; ao zerar, desabilita o botão e oferece coleta/cultivos/projetos. O domínio continua entendendo recibos antigos/cliques de fila já enviados com ganho zero e mensagem explícita; não há animação de ganho positivo quando zero. Representações de construção nas três skins compartilham estado e estoque; movimento é cosmético e respeita a preferência existente.

## Consequências e limites

Cultivos seguem manuais, e a coleta ativa (até40 ações/minuto sem picareta) supera cada posto (1/minuto). Estoque cheio pausa sem perda dos200 materiais. Não há crescimento retroativo nem substituição de conquistas/inventário/compras anteriores. Relógio e banco são locais, sem antifraude remoto. Simulação e teste Windows verificam funcionamento/balanceamento; retenção e compreensão de usuário leigo exigem avaliação humana. [Ticket](../tasks/doing/GAM-05.md), [validação](../validation/FARM_PROJECTS.md).
