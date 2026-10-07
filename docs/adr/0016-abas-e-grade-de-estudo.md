# ADR 0016 — Abas de trabalho e grade de estudo

Data: 07/10/2026. Status: aceita para UI-05; substitui a navegação e o limite de painéis da ADR 0014. Regras de jogo/foco/player permanecem.

## Contexto

O usuário pediu módulos como subitens laterais, clique para abrir somente aquele módulo, arraste para dividir, abas como navegador e até quatro janelas por aba. Confirmou três painéis internos com a esquerda inteira e dois à direita; clique modifica somente a aba atual.

## Decisão

`settings.preferences.workspaceTabs` guarda UUID da aba ativa e até 32 abas locais. Cada aba guarda até quatro módulos distintos, módulo focado e dois divisores entre 20% e 80%. Um painel ocupa tudo; dois ficam em colunas; três reservam a esquerda inteira; quatro ocupam 2×2 em ordem de leitura. Fechar uma janela recompõe a grade. Ampliar um painel ou clicar no menu deixa somente aquele módulo na aba atual; outras abas são preservadas.

O menu reúne Caderno/PDF/Vídeo/Revisão/Grafo e Hoje/Explorer/Cidade/Ajustes. Arraste usa MIME interno, preview e bloqueio da quinta janela; módulo já presente recebe foco. O botão + oferece divisão sem arraste. Divisores respondem a mouse, setas, Shift+seta e Home. A barra de abas permite +/fechar e setas/Home/End; Ctrl+T cria, Ctrl+W fecha, Ctrl+Tab/Shift+Ctrl+Tab alternam, Ctrl+1…8 selecionam e Ctrl+9 vai à última. A última aba não fecha. Cinema/dialogs não recebem os atalhos.

Perfis sem workspaceTabs recebem uma aba derivada do layout legado somente na leitura, preservando JSON, nome, tema e animações. Novas gravações usam contrato estrito e transação preferências/audit; schema SQLite 6 permanece. Navegação serializada guarda drafts e espera filas de projeto/jogo antes de persistir/exibir a composição; falha de gravação conserva a composição anterior. Resize responde imediatamente e grava ao soltar.

As abas isolam composição, foco e tamanhos, mantendo uma instância de cada módulo. Matéria/nota/documento/player e estado interno dos módulos continuam compartilhados; não são cópias independentes de notas ou múltiplos players. Ocultar conserva editor/drafts e suspende vistas custosas. Player continua um WebContentsView isolado; trocar de aba promove PiP e conserva guest. Arraste/resize escondem temporariamente a view nativa para não interceptar a interação. Cinema permanece inerte; dimensão insuficiente usa PiP. Container queries ajustam controles por largura/altura da janela.

## Consequências

Mesas de estudo configuráveis sem seletores suspensos no topo; foco/checklist suspensos. Restart conserva abas/geometria sem copiar fontes para preferências. Não inclui contextos independentes por aba ou monitores físicos, migration/biblioteca nova. [Provas e limites](../validation/STUDY_TABS.md).

## Complemento UI-06 — menu recolhível

Escolha confirmada em 07/10/2026: recolher esconde o menu inteiro, conservando um botão na barra de abas para expandir. A preferência `sidebarCollapsed` é global ao espaço, não altera composição/divisores/contexto de cada aba e persiste pela transação existente. Default false em perfis antigos, sem regravar na leitura. A linha decorativa fica somente no hover/foco do teclado, com margem antes do ícone. O crescimento da grade é imediato; conteúdo conserva suas instâncias e o player acompanha o painel. [Provas](../validation/SIDEBAR.md).
