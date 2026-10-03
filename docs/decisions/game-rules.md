# Regras locais do primeiro jogo — GAM-01

02/10/2026. Pedido explícito de cidade, farm, grind e loja, após UI-01. Vila medieval isométrica como escolha reversível. Valores de balanceamento provisórios em src/shared/game.ts; não são metas acadêmicas. Este incremento não entrega todo o roadmap público, integração de notas/IA, sincronização, missões semanais ou multiplayer.

## Economia e ciclo

Perfil único local começa com 60 moedas e XP zero. Entrada inicial aparece no ledger, sem simular produção ou estudo. Quatro canteiros iniciais; mais dois pela loja. Plantar paga a semente, maturação continua com o app fechado; colher paga bônus e acrescenta uma unidade ao inventário. Vender é uma operação separada.

| Cultivo | Semente | Crescimento | Colheita | XP | Venda por unidade |
| --- | --- | --- | --- | --- | --- |
| Trigo | 2 | 45 s | 8 moedas + 1 trigo | 5 | 4 |
| Cenoura | 5 | 90 s | 18 moedas + 1 cenoura | 10 | 8 |

Mina e bosque rendem uma pedra/madeira, quatro moedas e três XP. Intervalo global de 1,5 s entre coletas, inclusive alternando locais. Picareta dobra pedra; Prática aumenta moedas por coleta. Pedra vende por três moedas/unidade, madeira por duas.

| Compra única | Preço | Efeito |
| --- | --- | --- |
| Moinho | 75 | Instalação visível, quatro moedas/minuto |
| Terra fértil | 60 | Abre canteiros 5 e 6 |
| Picareta de ferro | 85 | Duas pedras por coleta |
| Casa do viajante | 120 | Casa visível junto à praça |
| Luzes da vila | 50 | Lanternas visíveis nas ruas |

Moinho acumula com app fechado, até sete dias por visita. Liquidação usa relógio do processo principal, minutos completos e fração preservada quando mudar habilidade. Mudança de build liquida a taxa anterior antes de aplicar a nova; consultas repetidas não duplicam saldo. Relógio do PC adulterado pode alterar progressão local: não há autoridade remota nem economia competitiva. Não interpretar isso como prevenção de fraude de um serviço online.

## Memória e personagem

Baralho demonstrativo curado com nove pares de matemática/programação, em três relações: conceito/definição, conceito/exemplo e fórmula/situação. Leve/normal/desafio usam 3/6/9 pares. Sem limite de tempo; duas cartas erradas ficam reveladas até a próxima escolha. Tentativas e melhor combo entram na recompensa. Toda rodada nova efetivamente completada rende novamente; repetir a operação final rende uma única vez. Pares escondidos não são enviados ao renderer.

Recompensa: moedas = 20 × dificuldade (1/2/3) + 2 × melhor combo + eficiência + 2 × pontos de Revisão; XP = 15 × dificuldade + número de cartas + eficiência. Eficiência = piso(8 × pares / tentativas). Resultados são calculados no main, sem aceitar pontuação do cliente.

Nível = 1 + piso(XP/100), com tantos pontos de habilidade quanto o nível. Redistribuir é grátis. Foco: +1 moeda/minuto por ponto com moinho; Revisão: +2 moedas por rodada; Planejamento: -5% no tempo de plantio por ponto, limite 50%; Prática: +1 moeda/coleta. Maior atributo determina Guardião/Erudito/Arquiteto/Explorador; empate resulta em Viajante. Classes são derivações de build, sem bloqueio permanente.

## Dados e fronteiras

SQLite v2 acrescenta quatro tabelas sem resetar v1: perfil, ledger, operações e rodadas. Ação, efeito, rodada e auditoria pertencem à mesma transação. UUID de operação é vinculado ao payload validado; replay retorna estado atual, outro payload é rejeitado. Ledger conserva origem única, deltas de carteira/XP/recursos e versão da regra. Preço, XP, relógio e pares pertencem ao main. Preload expõe apenas getGame/gameAction, guardados por remetente/mainFrame/URL e Zod strict.

Entrar na cidade preserva o rascunho e pausa o foco ativo, inclusive quando seu proprietário é outra matéria. Jogar não credita minutos de estudo. Voltar retoma a mesa; Markdown permanece canônico, nenhuma compra exige nota ou vault. Cenário Three.js é apresentação, sem autoridade econômica; GSAP anima transições. Preferência de movimento reduzido suspende animações e usa redraw sob demanda; aba oculta suspende o loop. Sem alegar medições de GPU que não foram feitas.

Fonte/SQLite permanecem acessíveis ao usuário Windows. Não há autenticação remota, criptografia de perfil, antifraude competitivo ou assinatura do pacote. Escopo do parecer de segurança e provas efetivas ficam em docs/security e docs/validation/GAME.md.
