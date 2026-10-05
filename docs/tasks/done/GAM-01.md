---
id: GAM-01
status: done
outcome: concluido
depends_on: ["UI-01","ALP-03","ALP-07"]
criteria_count: 6
---

# GAM-01 — Cidade, farm, grind e loja jogáveis

Pedido explícito de 02/10/2026 amplia o recorte anterior do MVP para o primeiro incremento local do jogo, na branch feat/game baseada em 884593e. Referências: arquitetura, seções 10/11, e roadmap, jogo/base isométrica. Não executar o restante da primeira pública.

## Critérios

C1. Cidade isométrica Three.js com fazenda, mercado, mina, bosque, moinho e casas; seleção de locais e controles de câmera. Interface mantém cantos retos.
C2. Ciclo funcional de plantio/crescimento/colheita, coleta de recursos, venda, compra de instalações/melhorias e produção passiva; mudanças aparecem no cenário.
C3. Memória de Conceitos sem limite de tempo, três tipos de pares, dificuldade/tentativas/combo/recompensa; build com redistribuição gratuita e classe derivada. Baralho demonstrativo identificado; XP/moedas não medem domínio acadêmico.
C4. SQLite e IPC validado: saldos/itens/instalações/rodada persistem, replay não duplica efeito, saldo insuficiente/argumento inválido não altera estado; migração conserva dados da mesa/vault.
C5. Execução real no Windows, capturas durante a tarefa e jornada de jogo no pacote; provas pertinentes do estudo continuam passando.
C6. Regras provisórias documentadas, evidência, quadro/retomada e commits/push por checkpoint. Produção pessoal não é substituída por fixture.

## Plano e retomada

Economia transacional → cidade/controles → farm/loja/memória/build → execução/fotos → retomada do estudo → documentação/commits concluídos. Catálogo e valores são configuração inicial reversível; contratos de origem/idempotência seguem o projeto. Vila medieval isométrica como escolha reversível; pergunta visual não recebeu alteração de direção. Nuvem, IA, agenda e programação permanecem nos tickets/roadmap próprios.

02/10/2026: C1–C6 aprovados em [GAME](../../validation/GAME.md). Typecheck, 13 testes, pacote Windows, jornada game com restart/passivo real, R1–R7 e probe de outro sender passaram. [Auditoria por agente](../../security/GAME_AUDIT.md) sem achados de código; tooling High com exposição avaliada, scan do plugin parcial separado da jornada. Economia 728047d e interface 49489ad enviadas para origin/feat/game; fechamento documental inclui [guia solicitado](../../GUIA_DE_USO.md). Gitleaks das alterações inclui testes, harness e docs. Próxima ação humana: avaliar executável/ritmo com perfil de teste; nenhuma integração futura foi aprovada por essas provas.
