# ADR 0014 — Áreas isoladas e divisão opcional

Data: 06/10/2026. Status: aceita para UI-04.

## Contexto

O usuário considerou a mesa visualmente poluída e confirmou um módulo principal por padrão, divisão opcional em até três áreas inteiras/PDF/Vídeo, tamanhos ajustáveis e foco/checklist suspensos. Confirmou também partidas de Oficina mais curtas/intensas, mantendo 36 etapas; isso substitui a meta anterior de 2–4 minutos.

## Decisão

O layout pertence às preferências locais: panes únicos de study/pdf/video/home/review/graph/explorer/city/settings e pesos que somam 100, com mínimo de 20% por área. IPC validado estritamente, sem migration ou reset; perfis anteriores recebem um módulo Caderno por fallback de leitura. Acervo, formatação, relações do grafo, detalhes dos locais e inventário são abertos explicitamente. Os modelos de nota, matéria, PDF e player continuam únicos e conservam contexto/drafts ao ocultar uma área. Não há múltiplas instâncias da mesma área nem um contexto de matéria independente por painel.

Divisores permitem arraste, setas, Shift+seta e Home; alterações de preferências são serializadas. Foco/checklist aparecem por hover/foco de teclado, podem ser fixados por clique e fechados com Escape/controle próprio. O relógio de foco permanece no main quando o painel é recolhido. Cinema deixa áreas, divisores e ferramentas inertes; a superfície nativa do vídeo fica escondida ao abrir ferramentas suspensas, conservando o guest e a reprodução. Player inline respeita a altura disponível; scroll/clipping ou dimensão insuficiente usam PiP. Retornar ao módulo reposiciona a biblioteca para exibir o player inline.

O motor anima imediatamente cada clique e enfileira operações com IDs únicos até o IPC autoritativo confirmar. Fechar espera a fila; resposta desconhecida conserva o ID para retry idempotente. Sem cooldown do motor. Oficina mantém preparação inicial de 3,5/4,5s, 36 etapas, três fases, erros tolerados, pausa/replay/recompensa do main; próximas etapas iniciam na mesma resposta. Partidas antigas não são apagadas; desafios v2 em andamento recebem o novo ritmo ao avançar.

Grafo usa forças de centro/repulsão/conexão até estabilizar, pan amortecido, zoom interpolado e foco animado; seleção destaca vizinhos, labels dependem da escala. A interação foi informada pela [documentação oficial do Obsidian](https://obsidian.md/help/plugins/graph) e pela [API de OrbitControls](https://threejs.org/docs/pages/OrbitControls.html). Animações desligadas/prefers-reduced-motion removem interpolação e calculam layout estático; área oculta/documento oculto interrompe o loop. Câmera e posições sobrevivem à criação/remoção de relações. A lista continua permitindo acessar todas as notas; cena limitada a 200 nós.

## Consequências

Uma ação na navegação lateral substitui a área focada; + Módulo acrescenta área e Tela única conserva a área focada. Clique/foco de um painel direciona atalhos de edição e Oficina, evitando salvar um projeto ou consumir QTE no painel vizinho. Contexto comum de matéria é explícito nos seletores PDF/Vídeo; esconder não duplica player/editor nem encerra foco. Ocultar um desafio não o pausa: Pausar continua sendo escolha explícita. Os controles próprios de janela e temas anteriores permanecem.

Validação por domínio e pacote Windows em [CLEAN_WORKSPACE](../validation/CLEAN_WORKSPACE.md). Não implica nuvem, celular, publicação ou comprovação de fluidez em todos os dispositivos.
