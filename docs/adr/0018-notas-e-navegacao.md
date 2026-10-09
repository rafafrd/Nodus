# ADR-0018 — Escrita simples e reaproveitamento de material

Estado: aceita e implementada em UX-01, 08/10/2026.

## Contexto

Escrever e organizar notas por matéria exige decisões antes de começar. Os módulos existentes já cobrem o estudo; o incremento reduz esse trabalho dentro dos mesmos módulos. A fonte Markdown e a identidade das notas precisam sobreviver à simplificação.

## Decisão

Nova nota cria imediatamente um arquivo com título provisório e abre o corpo para escrever. O título é editável e pode ser sugerido no primeiro salvamento. CodeMirror conserva o prefixo original (frontmatter e primeiro título) separado da edição comum; Fonte completa oferece a edição anterior. Não há conversão para uma árvore de editor visual. Modelos opcionais acrescentam estrutura sem substituir conteúdo.

Mudança de matéria altera somente study_subject e o vínculo no catálogo, com hash, transação e compensação do arquivo em falha. ID, caminho físico, corpo e referências relativas permanecem. Mesas deixam de apontar para a nota na matéria antiga; cartões, marcações e snapshots históricos conservam suas coleções/origens. Abrir uma referência resolve a matéria atual da nota. Conexões antigas aparecem nas duas matérias dos endpoints; criar novas conexões continua exigindo notas da matéria escolhida. Snapshot de nota movida indica fonte alterada, conserva o trecho congelado e permite acessar sua origem atual.

Importar vários Markdown usa seleção nativa explícita. Arquivos externos são copiados para o vault com criação exclusiva, preservando os originais; UTF-8/identidade/caminho/tamanho são validados. Cada arquivo tem resultado independente. Falha de catálogo/audit desfaz a importação externa e remove somente a cópia criada pela operação. Arquivos já no vault seguem a importação existente.

Busca consulta somente notas registradas e rascunhos locais, oculta o frontmatter nos trechos e ignora acentos. A lista por matéria prioriza as últimas notas abertas; settings.recentNotes guarda até 30 IDs. Não há indexação de pastas arbitrárias, serviço ou migration nova.

TextLayer do PDF.js permite seleção de texto digital. Capturas de texto/comentário/momento acrescentam citação e referência nodus-source com UUID, página/segundo e hash do PDF. O renderer resolve a referência no catálogo e usa IPC específico para material/player; mudança do PDF é informada sem substituir o trecho original. Comentários atendem PDFs sem texto; OCR não é implementado. Praticar este material usa IA-01 com a fonte selecionada, mantendo o envio manual.

Matéria atual, Nova nota e Minhas notas ficam visíveis no menu. Primeiro uso orienta pasta/matéria/escrita; nomes PDFs/Aulas/Conexões/Projetos são consistentes nas áreas e abas. Controles avançados ficam em divulgações opcionais; abas, divisões e recolhimento permanecem.

## Alternativas e consequências

Converter Markdown para um editor visual foi descartado neste incremento pelas perdas observadas em ALP-02. Mover arquivos entre diretórios poderia quebrar imagens e links relativos; a organização por matéria permanece lógica. Classificação automática/IA integrada/OCR/transcrição e novos módulos ficam fora deste pedido.

A busca lê arquivos locais sob demanda e pode precisar de índice incremental para catálogos grandes; não foi feito benchmark de grande volume. Cabe ao usuário salvar o rascunho antes de mover a nota. [Provas e limites](../validation/NOTES_UX.md).
