---
id: GAM-03
status: done
outcome: concluido
depends_on: ["GAM-02","NXT-01","UI-03"]
criteria_count: 8
---

# GAM-03 — Janela própria, ambiente e progressão da cidade

## Objetivo e dependências

Pedido de 06/10/2026, escolhas confirmadas antes do trabalho: controles próprios de janela; fundo Editorial lento e discreto com opção de acessibilidade; skins completas Cyberpunk e New York com locais/funções preservados; produção automática, upgrades encadeados, conquistas e prestígio opcional; Oficina com dificuldade gradual e duração aproximada de 2–4 minutos por partida.

## Prompt de execução

C1. Janela sem barra Windows padrão, minimizar/maximizar/restaurar/fechar acessíveis, arraste e fechamento conservando drafts/foco via fluxo existente. IPC específico, validado e restrito à janela principal.
C2. Fundo Editorial animado discretamente, controle independente salvo em Ajustes, respeitando movimento reduzido do sistema/animações gerais e pausando quando oculto.
C3. Skins Original/Cyberpunk/New York transformam geometria, materiais, iluminação e atmosfera, preservam locais/funções/câmera/dados e persistem após reinício.
C4. Produtores automáticos com custos crescentes, desbloqueios e upgrades encadeados, rate calculado no main e produção offline limitada, sem duplicação nem multiplicar tempo antigo por taxa nova.
C5. Conquistas persistentes com critérios/progresso e bônus; prestígio opcional com prévia, confirmação, bônus permanentes e preservação explícita de dados de estudo/progresso retido. Replay, saldo insuficiente e rollback reais.
C6. QTE e calibração com mais etapas, fases de dificuldade crescente, duração 2–4 min, tolerância a erros, teclado/botões e retomada/cancelamento; cálculo/recompensa no main, sem aceitar timing/score do renderer.
C7. Typecheck, testes pertinentes, execução/pacote Windows, capturas inspecionadas e regressão de edição/foco/navegação/movimento reduzido. Fixtures explicitamente identificadas, sem tocar perfil pessoal.
C8. Ticket, guia, ADR, estado/validação/retomada e fontes da análise Cookie Clicker atualizados; bootstrap/diff aprovados. Sem commit/push/publicação no pedido atual.

## Execução e retomada

Branch local codex/city-progression criada de codex/editorial-dashboard/80e0805 com alterações UI-03 preservadas. Incrementos executados: fronteiras de janela/preferência → economia autoritativa e desafios → geometrias urbanas → pacote/partidas reais → contraste/capturas/regressões → documentação/quadro. Sem delegação conforme instrução do usuário.

C1–C8 aprovados em [CITY_PROGRESSION](../../validation/CITY_PROGRESSION.md): typecheck, 42 testes e reconferência dos dois testes econômicos, pacote Windows/201 arquivos dist idênticos ao ASAR, fluxo completo com QTE140s/calibração159s e 36 acertos/três fases, fluxo final curto, Journey R1–R7, vídeo real e foco ativo pausado pelo botão Fechar. IPC restrito/replay/rollback/taxa antiga/offline/legado, dados de estudo, fontes BOM/CRLF e drafts conservados. Skins/fundo/persistência/compacto/capturas inspecionados, O-016 corrigido/verificado. Main/preload do pacote final idênticos aos da prova completa; somente CSS da Oficina mudou depois dela, sem alegar repetição completa posterior. Guia/ADR/sdd/design/produto/quadro/retomada/validação e fontes oficiais atualizados; bootstrap/diff de fechamento registrados na evidência. Sem migration/dependência nova, configuração global, commit/push/publicação. Nenhuma implementação restante neste ticket. Próxima ação humana: abrir o pacote, escolher a skin em Cidade/Vila, explorar Produção e ajustar o fundo em Ajustes/Aparência. Alpha externa permanece parcial; arraste físico/Snap Layouts não foram automatizados.
