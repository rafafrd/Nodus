# ADR 0007 — Explorer local e editor de fonte

Data: 03/10/2026. Estado: Aceita. Ticket GAM-02; navegação, visualização e edição confirmadas pelo usuário.

## Decisão

Pastas escolhidas no diálogo nativo registram capacidades específicas no main, sem dar fs/shell genéricos ao renderer. Explorer lateral, árvore e até12 abas retomáveis; arquivos existentes UTF-8 até1MiB em CodeMirror, como fonte inerte. A arquitetura de execução/preview isolado do roadmap não é necessária para ler fonte; essa etapa não executa projetos.

Arquivo é canônico, SQLite v3 registra raízes/view/drafts com hash-base. Antes de substituir arquivo, conservar backup no perfil, comparar hash, escrever temporário exclusivo e revalidar destino. Travessia/ADS, junction/symlink e .git (caixa e alias canônico8.3) são negados. NUL/Unicode malformado e texto grande são recusados antes de alterar draft/fonte. Abrir texto não carrega links/HTML/JS como aplicação.

## Alternativas e consequências

Adiar edição contrariaria a resposta explícita do usuário. Um editor completo/execução/Git aumentaria o escopo sem necessidade do ticket. Reusar CodeMirror já instalado permite preservar fonte/CRLF/BOM e teclado, sem dependência nova. Não adicionamos framework de linguagem/autocomplete neste incremento.

Conflito conserva duas versões e exige revisão/Save explícito. Fechamento/troca de área espera draft; arquivo ausente preserva texto, mas não é recriado automaticamente. Metadados Git permanecem separados; arquivos pessoais não entram no repo do app.

Hash+rename não é lock cooperativo. FS/SQLite não têm commit conjunto: erro do audit após rename pode ocorrer com arquivo já atualizado; draft/recovery persistem e a UI informa erro. A conta Windows continua controlando FS/SQLite. Sem sincronização, criptografia própria ou garantia de proteção contra processo local com a mesma autoridade.

## Evidências

[ENGINE_EXPLORER](../validation/ENGINE_EXPLORER.md), testes reais projects/engine, pacote Windows e auditoria incremental. Diálogo nativo existe; seleção humana nesse diálogo não foi automatizada na prova.
