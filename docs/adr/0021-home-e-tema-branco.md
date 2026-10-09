# ADR-0021 — Home com fundo fixo animado e tema branco

Estado: aceita para UX-03, 09/10/2026.

## Contexto

O usuário pediu uma Home com animações nos componentes e no fundo, mas com o fundo sem se mover, e um tema branco. O checkout já contém UX-01/GAM-05/UX-02. A decisão interpreta o fundo imóvel como câmera e posição fixas, com luz animada e rolagem independente do conteúdo.

## Decisão

Reutilizar a área `home` como **Início**. DayOverview conserva próxima ação, catálogo, tarefas, indicadores e escrita imediata; HomeWorkspace acrescenta entradas para Caderno, Materiais, Revisão e Cidade. Perfis novos começam em Início. O fallback de compatibilidade de layouts antigos continua em estudo, e abas/composições válidas anteriores são preservadas.

O fundo usa Three.js com plano/shader, câmera ortográfica fixa, grade, anéis e luz suave. Fica atrás da área de rolagem e não intercepta eventos. Limite aproximado de 15 quadros/s e DPR até 1,25. Componentes entram escalonados com GSAP, e cartões/botões respondem ao hover/foco. A composição existente do livro continua na próxima ação.

O controle comum de animação e movimento reduzido deixam a composição estática. Área oculta, documento invisível e minimização interrompem o loop. Perda real de contexto WebGL mantém o fundo CSS e controles DOM; desmontagem remove eventos, observadores e recursos GPU. Animação não modifica notas, relógios ou economia.

**Branco** entra no enum de preferências validado existente e é salvo pelo contrato atual. Paleta clara própria, `color-scheme: light`, texto escuro e detalhes verdes. Ajustes pontuais cobrem estilos escuros antigos sem filtrar imagens, PDFs ou cidade. Grafo adapta nós/arestas, e realce de código usa variáveis de sintaxe com os tons anteriores como fallback nos demais temas. Não recriar o editor ao mudar de tema.

## Consequências

Sem nova tabela, migration, dependência ou mudança de lockfile. Schema SQLite permanece 7; temas anteriores, layouts, fontes Markdown/PDF e rascunhos seguem os mesmos contratos. A Home acrescenta apresentação e atalhos aos recursos existentes.

[Validação Windows, fotos e clipe](../validation/HOME_WHITE.md). A execução em um host não comprova desempenho em todos os GPUs nem compreensão por uma pessoa leiga. Pendências humanas/externas de GAM-05 e da alpha permanecem nos tickets existentes.
