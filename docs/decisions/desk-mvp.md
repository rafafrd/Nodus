# Mesa do MVP

02/10/2026 — ALP-05. Sidebar de matérias e notas, caderno central, documento e ferramenta encaixados, dock inferior. Mesa por subject_id: noteId, materialId, page (1-based), split (30–75%), tool, preview e nextStepId. Atualizações parciais são validadas em transação; referências cruzadas entre matérias são rejeitadas. Seleção ativa fica em settings e é retomada no início. Busca por título nas notas da matéria, sem índice semântico.

Three.js 0.186.1 compõe apenas órbitas/estrelas decorativas no cabeçalho; não simula grafo ou dados. GSAP 3.15.0 anima entrada de painéis; ambas carregam por import dinâmico e são descartadas corretamente. Movimento reduzido do sistema respeitado; cenário não intercepta interação. Sem WebGL, cenário fica ausente e a mesa continua funcional.

Resolução exercitada: janela 1440×940 no Windows. Redimensionamento acessível por slider/teclado, foco visível, modal nativo HTML com showModal e campos rotulados. Abrir ferramenta preserva edição; trocar matéria persiste rascunho antes de mudar contexto. Fechamento aplica protocolo do vault. Leitor real e contagem de foco são próximos tickets, sem prova antecipada.
