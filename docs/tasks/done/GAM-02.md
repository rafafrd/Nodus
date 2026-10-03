---
id: GAM-02
status: done
outcome: concluido
depends_on: ["GAM-01","ALP-04","UI-01"]
criteria_count: 8
---

# GAM-02 — Motor, desafios e Explorer de projetos

Pedido de 03/10/2026: validar toda docs contra produto/código, tornar navegação intuitiva, motor clicável com upgrades, minigames QTE/skillcheck e Explorer como VSCode. Usuário confirmou navegação, visualização **e edição** de arquivos reais. Branch feat/engine-explorer parte de 083bdc0, sem executar todo o roadmap de programação.

C1. Docs inventariadas/verificadas, índice distingue estado atual, requisitos e histórico. Corrigir afirmações obsoletas de implementação/schema/editor; não apagar evidências históricas nem aprovar nuvem pendente.
C2. Motor da vila como fonte principal ativa de moedas, clique/cooldown/upgrades persistentes e visuais. Saldo/preço/cap calculados no main; replay não duplica efeito.
C3. Dois minigames adicionais: QTE sequencial e skillcheck de timing, instruções claras, teclado/botões, ritmo tranquilo/normal e recompensas calculadas no main. Memória continua sem limite de tempo; XP do jogo não mede domínio acadêmico.
C4. Explorer lateral: pastas reais, vários projetos, árvore expansível, arquivos em abas e estado retomável, com operações IPC específicas.
C5. Edição de texto UTF-8 preserva bytes não alterados/CRLF/BOM; save hash/backup, draft recuperável, conflito externo conserva duas versões. Trocar vista/fechar não perde rascunho. Sem executar HTML/JS do projeto.
C6. Contenção de caminho, junction/symlink, limites de leitura, argumentos, rollback/replay e migração aditiva conferidos com arquivos/SQLite reais. Não expor fs/shell/IPC genérico.
C7. Pacote Windows, jornada real dos novos fluxos/capturas e regressão pertinente do estudo/jogo. Diálogo nativo não automatizado permanece explicitamente não verificado.
C8. Guia/regras/arquitetura/evidência/memória/quadro/retomada atualizados, commits/push por fase, audit de segredos incluindo fixtures e revisão AppSec autorizada.

## Plano aplicado

Inspecionar docs/código → motor/desafios autoritativos → serviço de projetos/editor/explorer → UI intuitiva e capturas → provas Windows/segurança → documentação/commits. Diretórios de projetos são capacidades registradas via seleção de pasta; previews são texto inerte. Sem terminal, execução de código, Git automático, criação/deleção de arquivos, nuvem ou IA. Edição de arquivos existentes foi autorizada explicitamente. Valores de balanceamento são reversíveis e documentados.

## Checkpoint Windows, 03/10/2026

C1–C8 aprovados em [ALPHA](../../validation/ALPHA.md), com prova específica em [ENGINE_EXPLORER](../../validation/ENGINE_EXPLORER.md) e inventário em [PRODUCT_DOCS](../../validation/PRODUCT_DOCS.md). Core 62dbd60, interface 1c6366a e documentação 6e1a636 enviados para origin/feat/engine-explorer em 03/10/2026. Typecheck, 18 testes, pacote, jornadas novas e R1–R7/jogo anterior/IPC passaram; novas jornadas, R1–R7 e jogo legado foram repetidos no pacote final. Auditoria independente em [ENGINE_EXPLORER_AUDIT](../../security/ENGINE_EXPLORER_AUDIT.md), sem vulnerabilidade de código aberta e tooling High avaliado; memória atualizada. Gitleaks do stage documental (37 arquivos, ~75 KB) saiu 0/sem achados. Check-bootstrap e diff --check passaram. Diálogo nativo não automatizado, editor externo e nuvem continuam não verificados. Nenhuma ação de implementação restante neste ticket. Próxima ação humana: abrir a build/guia e avaliar ritmo e navegação com perfil de teste.
