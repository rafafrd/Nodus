# Memória da arquitetura e fronteiras

02/10/2026. MVP pessoal, local, Windows. Não há autenticação, servidor HTTP de produção, IdP, sincronização ou requisitos de compliance implementados. O sistema operacional delimita o usuário local; SQLite, vault, rascunhos e backups não são criptografados pelo app. Dados privados ficam fora do Git.

Stack efetiva: package.json/package-lock.json; main e preload Electron, renderer React/TypeScript, SQLite builtin node:sqlite, CodeMirror com prévia React Markdown. Caminhos do disco e SQL ficam no main. Preload oferece operações fixas e callbacks específicos. Sender, frame, URL e argumentos Zod são verificados. Renderer tem sandbox, contextIsolation e webSecurity; Node desligado. Protocolo study carrega somente assets empacotados. Conteúdo Markdown é dado, sem HTML executável ou imagens remotas.

Ativos: arquivos canônicos Markdown, rascunhos, índices, identidade estável e mesas. Fronteiras: arquivo importado → main; renderer → IPC; DB/FS → UI. Acesso a notas se limita ao vault selecionado, com proteção de traversal e junction/symlink. PDFs selecionados são referências locais específicas, quando o leitor for integrado. SSRF/auth/tenant/cloud ainda não aplicáveis ao MVP local.

A auditoria final deve atualizar esta memória a partir do código, sem tratar desenhos futuros como controles presentes. Registro completo em docs/decisions e docs/validation.
