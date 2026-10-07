# UI-04 — Espaço de trabalho e ritmo contínuo

Concluído em 06/10/2026, Windows 11 10.0.26200, Node 24.19.0 local, Electron 44.5.1, app 0.1.0. Branch codex/clean-workspace criada de codex/city-progression/80e0805, preservando UI-03/GAM-03 sem stage/commit/push. As escolhas do usuário substituem a meta anterior de partidas de 2–4 minutos: agora 36 etapas mais curtas/intensas, com preparo somente no início.

## Comportamento entregue

Um módulo Caderno por padrão, acervo/formatação/relações/inventário recolhidos. + Módulo combina até três áreas únicas, incluindo PDF/Vídeo; divisores por arraste, setas, Shift+seta e Home, larguras persistidas. Navegação substitui a área focada; Tela única conserva essa área. Foco/checklist revelados por hover/foco de teclado, fixados por clique, fechados por Escape/×. Foco continua no main com o painel recolhido. Fontes e drafts continuam preservados; atalhos seguem o painel focado também por teclado.

Motor sem cooldown: animação imediata por clique, operações únicas em fila e confirmação autoritativa/replay idempotente; Fechar drena pendências. Movimento reduzido remove os efeitos e não acumula giro ao reativar animação. Oficina mantém 36 etapas/três fases/dificuldade/erros/pausa/recompensas; preparo inicial 3,5s normal/4,5s tranquilo e readyAt=stepAt nas etapas seguintes. Partidas v1 continuam com suas três etapas e recompensa; v2 em andamento recebe novo ritmo ao avançar.

Grafo com forças de repulsão/centro/conexão, pan amortecido, zoom interpolado e foco animado; seleção destaca vizinhos, câmera preservada ao editar relações. Movimento reduzido calcula layout estático; área/documento ocultos interrompem o loop. Decisão, pesquisa oficial e limites em [ADR-0014](../adr/0014-areas-isoladas.md).

## Verificações executadas

Todos os comandos abaixo executados no Windows nativo. Fixtures identificadas em .local usam vault/SQLite/projetos/IPC reais e perfis separados de dados pessoais. Não são mocks de integração.

| Comando | Resultado |
| --- | --- |
| npm test | 43 testes aprovados após alterações de domínio/preferências; cliques consecutivos/replay/rollback/restart, Oficina/preparo/pausa/legado, layout estrito e leitura compatível sem regravação |
| npm run typecheck | aprovado após o último ajuste de fonte |
| npm run package:win | aprovado; 446 módulos, pacote Windows x64; avisos de chunks grandes/metadados/duplicatas do tooling, sem erro |
| npm run test:videos | aprovado no pacote final, conclusão UTC 07/10 00:40:34 (06/10 21:40:34 local) |
| npm run test:clean-workspace | aprovado no pacote final, conclusão UTC 07/10 00:41:50 (06/10 21:41:50 local) |
| npm run test:journey | aprovado R1–R7 no pacote final; R8 nuvem/celular não verificado |
| node .local/verify-clean-package.mjs | todos os 201 arquivos dist idênticos aos do ASAR; hashes abaixo |

Clean-workspace: um módulo inicial sem acervo/PDF/ferramentas abertos; edição/leitura, draft entre matérias, checklist real e hover. Caderno/PDF/Grafo e Caderno/Explorer/PDF em três áreas, quarta opção desabilitada, larguras por mouse/teclado e controles compactos dentro de 1040×760. Foco de teclado direcionou o painel Explorer. Grafo com amostra de zoom intermediário, pan/foco, relação real e câmera conservada; oculto/reduzido sem movimento. Motor recebeu 61 cliques rápidos com crédito exato, efeito imediato e redução/reativação sem giro acumulado.

QTE normal **5994ms**, calibração tranquila **30539ms**, **36/36 acertos cada**, sem preparação intermediária. São durações de entrada automática em relógio real, incluindo o preparo inicial; não são benchmark humano nem promessa de duração. O roteiro usa UI/IPC/main reais, sem substituir relógio/pontuação. Testes de domínio com relógio controlado são fixtures distintas. Recompensas/dificuldade continuam autoritativas.

Fechar pelo controle próprio drenou mais 40 cliques enfileirados e pausou foco ativo; restart conservou larguras 38,333/28,333/33,333%, Cidade/PDF/Caderno, foco paused/recovered=false, PDF página2 e drafts de nota/projeto. Markdown e README de demonstração conferidos byte a byte intactos. Mercado/build e memória difícil de18 cartas continuam acessíveis. Zero pageerror.

Vídeos: player oficial YouTube carregado/reproduzido pela rede real, mesmo guest/reprodução entre cinema/PiP/Explorer/Ajustes, Escape nativo e movimentação por mouse/teclado, viewport compacto e movimento reduzido. Ferramentas suspensas/diálogo escondem a view sem destruir guest. Três momentos reais produziram overflow para provar scroll→PiP e retorno entre matérias; retorno reposiciona a biblioteca. URL inválida/identidade/remetente negado/sandbox/sessão efêmera/sem preload ou bridge/popup/navegação/microfone negados; cinema não consumiu QTE oculto. Restart não abre rede; crash isolado/retry e remoção preservaram o PDF. Zero pageerror.

Journey R1–R7: duas matérias/notas criadas e salvas, PDFs páginas2/3, checklist/contexto/foco distintos, fechamento/reabertura, edição externa limpa e conflito mantendo as duas versões. A divisão foi escolhida explicitamente no roteiro, sem restaurar a mesa poluída por padrão.

## Pacote, arquivos e capturas

Pacote final release/win-unpacked/App Estudos.exe, SHA256 **6a723ba82f94f89a7d111abfa3140e08cb72ceaa543c6cea54b17722faa39134**. resources/app.asar SHA256 **1e1b4a0a525fe7224d1b1b3c8e7c537bbb3e20d9b95a7c086696eb5c449388db**. Os três roteiros nativos finais acima usaram esse mesmo pacote; nenhuma fonte do produto alterada depois.

Provas ignoradas: .local/evidence/clean-package.json, clean-results.json (perfil clean-workspace-b1pboB), videos-results.json (perfil videos-qZzmt4), journey-results.json. Execuções anteriores da Oficina também preservadas em clean-workshops-results.json/clean-workshops-package.json; os hashes anteriores não identificam o pacote final. Capturas reais inspecionadas: clean-single/split/compact/graph/motor/office/explorer-split/tools.png e videos-desk/cinema/pip-explorer/pip-settings/compact-pip.png. Capturas retornadas ao usuário; nenhuma imagem gerada usada como prova de execução.

Arquivos centrais: src/shared/workspace.ts e preferences.ts; main/game.ts; renderer/App.tsx, WorkspaceFrame.tsx, SuspendedTools.tsx, GraphScene.tsx, GameView.tsx, EngineButton.tsx, Arcade.tsx, ProjectWorkspace.tsx, VideoWorkspace.tsx, motion.tsx e workspace.css. Testes engine/preferences e roteiros clean-workspace/journey/videos. Sem dependência, lockfile ou migration nova; schema5 e histórico do ledger conservados.

## Falhas observadas e limites

O-017: navegação da cidade/controles compactos do grafo cortados por CSS herdado; corrigidos/verificados por nova prova/capturas. O-018: slot de vídeo alto promovia PiP; depois, retorno com scroll antigo fazia o mesmo. Altura limitada e retorno reposicionado, nova regressão completa aprovada. Falhas de roteiro por mouse já sobre Foco, virtualização de CodeMirror, rótulos antigos, sincronização automática da calibração, PiP interceptando botão durante tween e procura de heading oculto foram corrigidas no harness; não contam como aprovações. Scroll exigiu conteúdo real adicional após o player passar a caber corretamente.

Até três áreas únicas, mínimo20% cada, contexto de matéria compartilhado por Caderno/PDF/Vídeo. Cena do grafo até200 nós, lista sem esse corte. Player passa a PiP quando o slot não permite dimensão/clipping seguro da view nativa. Economia/clock local, sem comparação competitiva. Movimento reduzido não pausa o desafio; Pausar é explícito. Diálogos nativos de pasta, Snap Layouts/arraste físico e provas externas da alpha não foram aprovados por este incremento. Pacote local não assinado; nenhum serviço/release publicado. Sem delegação, alteração global ou dados pessoais no repositório.

Produto e provas concluídos; fechamento documental registrado após mover UI-04 para done. Próxima ação humana: usar + Módulo/divisores e avaliar o ritmo. Alpha externa permanece parcial.

Fechamento conferido: node scripts/check-bootstrap.mjs aprovado — 22 tickets, 149 critérios, 107 arquivos Markdown, 436 links locais. Inventário: 97 arquivos em docs, 70 entradas alteradas incluindo os incrementos anteriores e 31 arquivos ainda não rastreados. git diff --check aprovado; scan de whitespace dos 31 arquivos novos sem ocorrências; stage vazio. Capturas/JSON/EXE conferidos como ignorados. Essas contagens não substituem provas externas.
