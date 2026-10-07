# Regras locais do jogo — histórico e regras atuais

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

## Revisão 2 — GAM-02, 03/10/2026

Motor da vila é a fonte principal ativa. Nível inicial0, potência 1+2×nível moedas/pulso, cooldown300ms global do motor, 1XP a cada10 pulsos. Custo do próximo upgrade = teto(25×1,8^nível), máximo nível10/potência21. A melhoria aumenta modelo 3D e produção; saldo/preço/cap ficam no main. Cultivo, mina, bosque, moinho e loja anteriores continuam complementares.

Oficina oferece dois desafios de3 etapas. QTE escolhe A/S/D/W e exige tecla correta antes do limite por etapa: tranquilo3500ms/normal2000ms. Concluído rende24moedas/12XP; tecla errada/timeout/cancelar sem multa. Skillcheck: marcador triangular 0→100→0, período tranquilo3200ms/normal2000ms, faixa32/18 pontos centrada em alvos30/45/60/75. Main usa instante de recepção, não o frame/UI ou score do cliente. Após3 calibrações, moedas por0/1/2/3 acertos=0/8/20/36, XP5 por acerto. Não há penalidade por cancelar. A rodada ativa pode ser retomada; QTE continua sujeito ao prazo após sair/fechar.

Desafios novos legítimos podem render novamente. Replay de operação/origem challenge:UUID não repete crédito. Migração aditiva v3 guarda game_challenges e projetos; defaults do perfil antigo preservam carteira/XP e motor0. Novos ledgers usam rule_version2, anteriores permanecem v1. Estudo/foco não recebem XP automaticamente neste recorte; memória mantém seu funcionamento sem limite de tempo.

## Revisão 3 — GAM-03, 06/10/2026

As revisões 1/2 acima documentam as versões anteriores. Regras atuais de produção, tecnologias/conquistas/prestígio, Oficina36 etapas e skins estão em [city-progression](city-progression.md). Carteira/XP/ledger e dados de estudo são preservados ao atualizar; as regras de três etapas permanecem apenas em partidas já abertas na versão anterior.

## UI-04 — ritmo contínuo, 06/10/2026

Substitui o cooldown300ms histórico e a preparação repetida de GAM-03: motor aceita todos os cliques únicos consecutivos, sem descartar por IPC pendente; XP/preço/potência/replay continuam calculados pelo main. Oficina nova mantém36 etapas/três fases/faixas/erros/recompensas, preparação somente antes da etapa0 (3,5s normal/4,5s tranquilo), readyAt=stepAt nas etapas seguintes. Usuário substituiu duração2–4min por partidas mais curtas/intensas. Desafios v2 em andamento recebem o ritmo ao avançar; v1 conserva três passos/recompensa. Ledger continua rule_version3 e registra créditos efetivos, sem reescrever histórico. [Decisão](../adr/0014-areas-isoladas.md), [prova](../validation/CLEAN_WORKSPACE.md).
