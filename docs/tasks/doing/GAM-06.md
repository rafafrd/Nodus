---
id: GAM-06
status: doing
outcome: em_andamento
depends_on: ["GAM-05", "UI-07", "UI-08"]
criteria_count: 10
---

# GAM-06 — Jogo incremental refeito e independente do estudo

## Objetivo e dependências

Pedido de 23/10/2026 (ticket B de dois, num único PR com [UI-08](../done/UI-08.md)): refazer a Cidade, a economia e os minijogos, que estavam chatos, usando o Cookie Clicker e a literatura de jogos incrementais como referência de design, sem copiar nomes, textos, arte, sons ou números. Branch `feat/fundo-e-jogo-idle`.

Decisões do usuário: o progresso do jogo é migrado e preservado (moedas, produtores, melhorias, conquistas, prestígio, farm, skins); notas e dados de estudo nunca são tocados. **O jogo é independente do estudo**: estudo concede só XP e conquistas, não gera moedas nem produção. Assets podem ser gerados localmente. IPC do jogo pode ser criado ou alterado se for específico, tipado com Zod e validado.

## Prompt de execução

C1. Pesquisa e `docs/design/GAME_DESIGN.md`: por que o Cookie Clicker prende (cada hipótese confirmada ou ajustada com fonte), auditoria medida do jogo atual (tempo até a primeira compra, intervalo entre compras nos primeiros 30–60 min, decisões por 10 min, tempos mortos, o que fica invisível), tabela Cookie Clicker × Nodus atual × proposta, pilares e loops em Mermaid, curvas-alvo, plano de balanceamento e fontes.
C2. Independência do estudo: Foco e revisão deixam de creditar moedas e produção; o estudo concede XP e conquistas que não alteram a produção; recibos e moedas creditados no passado são preservados; um teste prova a regra.
C3. Economia, tempo e gravação autoritativos no main (relógio do main, transação única, idempotência por operação, sem replay): clique sem orçamento diário e que escala com a produção, compra ×1/×10/×100/máx, prestígio com moeda permanente, progresso offline sem punir ausência, IPC do jogo específico, tipado com Zod, com validação de argumentos e de remetente.
C4. Migração do progresso: tabela de conversão documentada, backup automático antes de migrar, teste em perfil antigo (fixture identificada), reversão comprovada, migrações SQLite apenas aditivas.
C5. Tela e feel: loop principal numa só tela (núcleo, loja, melhorias, ticker de notícias, marcos visuais na cena), revelação progressiva, números grandes legíveis, feedback de clique e de compra com as primitivas de `src/renderer/motion/`, som sintetizado com WebAudio e volume/mudo em Ajustes, movimento reduzido e `data-animations=off` com estado final estático, Three.js em `import()` dinâmico e pausado com a área oculta. Assets locais, de autoria própria, com licença e orçamento de tamanho registrados.
C6. Minijogos refeitos com decisão estratégica e leve, ligados às construções; reflexo, se mantido, é opcional e nunca o único caminho; registros antigos preservados.
C7. Balanceamento: simulador estendido ou novo gera curvas de tempo até a próxima compra, produção por segundo e marcos, antes e depois, com gráficos salvos como evidência; metas justificadas pela pesquisa (primeira compra em menos de 15 s, uma decisão a cada 30–90 s nos primeiros 30 min, primeiro prestígio viável em horas). Simulação não é apresentada como tempo humano.
C8. Proteções contra procrastinação: nenhuma notificação do sistema, o jogo nunca abre sozinho, eventos raros só com a área do jogo visível, nada que peça atenção durante uma sessão de Foco ativa, progresso offline sem punir ausência.
C9. Verificação Windows: typecheck sem erro novo, testes (migração de perfil antigo, idempotência, offline, prestígio, "estudo não gera moedas"), build, `package:win`, smokes do jogo atualizados e aprovados, regressões de UI pertinentes, capturas e vídeo de jogo inspecionados.
C10. Documentação: ADR-0026, decisão sobre GAM-05 registrada nos dois tickets, validação, retomada, gotcha e corpo do PR com evidências públicas conferidas.

## Execução e retomada

23/10/2026: em andamento. Leitura do código, ADR-0013, ADR-0019, GAM-05 e simuladores concluída; UI-08 entregue primeiro, no mesmo branch. Próxima ação: pesquisa e `GAME_DESIGN.md` (C1).
