# ADR 0003 — Markdown canônico e SQLite local

Data: 01/10/2026. Estado: Aceita como direção do backlog. Tickets: ALP-02/03/04.

## Contexto e decisão

Notas precisam de editor visual e compatibilidade com Obsidian/outros editores. O corpo fica em arquivo Markdown; metadados portáveis acompanham a nota. SQLite mantém referências, índices, estado e operações. JSON interno do editor é representação de trabalho, não a fonte canônica do corpo.

## Alternativas e consequências

Guardar notas apenas em formato proprietário dificultaria editar fora do app. Guardar todo estado em Markdown misturaria conteúdo e estado transitório da mesa. O desenho escolhido exige preservação de conteúdo/metadados, IDs estáveis, watcher e reconciliação de alterações externas.

## Evidência e revisão

Formato definitivo, biblioteca SQLite, migrações e política de recuperação serão registrados pelos tickets. Round-trip do editor e conflito ainda não foram verificados.

## Acompanhamento em 03/10/2026

ALP-03/04 foram implementados/verificados com node:sqlite, migrações e conflito/draft/backup reais. ADR-0005 escolheu fonte Markdown assistida em CodeMirror; JSON interno não é usado nesta implementação. Prova externa do editor permanece pendente em ALP-02/C5. Ver ../validation/ALPHA.md e ../decisions/vault-safety.md.
