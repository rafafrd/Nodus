# Architectural Decision Records

Uma ADR registra contexto, decisão, alternativas e consequências. Aceita significa direção escolhida, não recurso implementado. Proposta significa escolha ainda em avaliação. Substitua uma decisão por nova ADR com vínculo; mantenha o histórico.

| ADR | Assunto | Estado |
| --- | --- | --- |
| [0001](0001-ambiente-windows.md) | Windows nativo, Node 24 LTS e npm | Aceita para o bootstrap |
| [0002](0002-desktop-electron.md) | Electron, React e TypeScript | Aceita como direção de ALP-01 |
| [0003](0003-vault-e-persistencia.md) | Markdown canônico e SQLite local | Aceita como direção de ALP-02/03/04 |
| [0004](0004-snapshot-mobile.md) | Snapshot Supabase e consulta autenticada | Aceita como requisito de ALP-09; protocolo concreto pendente |
| [0005](0005-editor-markdown.md) | Editor assistido com prévia | Aceita para MVP; prova externa ALP-02 pendente |
| [0006](0006-execucao-por-ticket.md) | Um ticket por sessão e conclusão por evidência | Aceita para o bootstrap |

Use [o template](TEMPLATE.md) para novas decisões. O estado atual inclui o MVP local implementado; consulte validação. A prova específica do editor fica em docs/decisions/markdown-editor.md; critérios ficam nos tickets.
