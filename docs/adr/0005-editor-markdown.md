# ADR 0005 — editor visual de Markdown

Data: 02/10/2026. Estado: Aceita para o MVP enxuto. Ticket: ALP-02.

## Contexto

Edição visual não pode destruir o vault compatível com outros editores. A concepção aponta Tiptap como candidato e registra uma integração Markdown beta; confira documentação/versão atual durante a prova.

## Proposta

Tiptap foi avaliado em configuração básica e apresentou perdas. Usar CodeMirror com comandos de formatação e prévia GFM, mantendo o Markdown como representação de trabalho. Esse recorte entrega edição assistida de fonte; WYSIWYG fica para uma prova futura, sem comprometer preservação nesta entrega.

## Consequências e evidência

Não escolher por aparência ou quantidade de extensões. Registre versão, fixture, diff, editor externo e limites em docs/decisions/markdown-editor.md. Depois da prova, atualize esta ADR com escolha e motivos. Matriz local aprovada nos casos registrados em ../decisions/markdown-editor.md; prova no editor externo/Obsidian permanece não verificada (ALP-02/C5).
