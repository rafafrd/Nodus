# ADR-0022 — Notas de estudo por intercâmbio manual com IA

Status: aceita para IA-02, 09/10/2026.

## Contexto

O usuário relatou o trabalho de escrever/organizar notas. Após experimentar com outra pessoa, pediu um prompt padrão para anexar arquivos em uma IA externa e importar o material, como já faz com as provas. O app conserva Markdown canônico e uma biblioteca local por matéria. IA-01 gera atividades de 10 itens com snapshots de fontes locais; anexos externos não possuem esses IDs ou snapshots.

## Decisão

Adicionar Material com IA às entradas de conteúdo e ao Caderno, sem nova área de navegação. Preparação pede matéria, foco opcional e extensão. O usuário escolhe o provedor e anexa manualmente os arquivos fora do app. Prompt/JSON Schema versionados orientam notas por assunto, fontes por nome e complementos explícitos. Uma prévia de todas as notas antecede a importação em novos arquivos reais do vault.

O contrato `nodus.study-material/1` permanece independente de quiz/flashcards1.0. Reutiliza parser limitado e relatórios, mas não inventa snapshots ou vínculos para anexos externos. Modelos/arquivos não executam HTML, links, imagens ou código na prévia. O domínio exige IDs do main, referências declaradas existentes, limites e unicidade. Precisão e legibilidade dos anexos são conferidas pelo usuário.

SQLite8 adiciona material_requests/material_imports, sem reset nem alteração das tabelas anteriores. Rascunho, prompt e destino persistem; a resposta importada fica conservada. Um pedido cria um lote, com hash canônico/idempotência; nova geração usa novo pedido. Reserva anterior aos arquivos permite recuperar órfãos intactos após interrupção. SQLite registra todas as notas/status/audit em uma transação; rollback compensa os arquivos próprios intactos, e arquivos modificados externamente são preservados. Backup aceita5–8 e restaura separadamente.

## Consequências

O usuário reduz escrita e organização manual e continua podendo editar, praticar ou exportar as notas. Não há chave, dependência nova, chamadas de IA, moeda ou recompensa por importação. Notas anteriores e os contratos de atividades não mudam. O fluxo exige copiar/colar ou abrir JSON e conferir conteúdo; não autentica autoria, fidelidade das fontes ou correção acadêmica. Uma reserva cujo arquivo foi modificado exige preservar/mover a cópia antes de retry, em vez de sobrescrever dados.

[Uso](../features/material-ia-externa.md), [contrato](../contracts/study-material-v1.md), [validação](../validation/STUDY_MATERIALS.md).
