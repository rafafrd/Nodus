# Quadro de tarefas

Execução local da alpha iniciada em 02/10/2026; consulte os tickets e as evidências. Os diretórios são todo, doing e done; use os nomes exatos. Cada ID tem um único arquivo no quadro.

## Regra de movimentação

| Pasta | status no frontmatter | outcome permitido | Significado |
| --- | --- | --- | --- |
| todo | todo | a_fazer | Ainda não iniciada |
| doing | doing | em_andamento, bloqueado ou parcial | Trabalho ativo ou com critérios pendentes |
| done | done | concluido | Todos os critérios aprovados com evidência |

Ao começar, mova o ticket para doing, altere status/outcome, atualize esta tabela de links e docs/status/ALPHA_STATE.md. Ao terminar parcialmente, mantenha doing e registre a continuação. Ao concluir, registre cada critério aprovado em docs/validation/ALPHA.md, mova para done, ajuste links e retomada. Execute node scripts/check-bootstrap.mjs.

Exemplo de início no PowerShell, a executar pelo agente na tarefa autorizada:

```powershell
Move-Item .\docs\tasks\todo\ALP-01.md .\docs\tasks\doing\ALP-01.md
```

O comando move o arquivo; editar frontmatter/links/retomada faz parte da mesma alteração. A conclusão depende da evidência, não do fim do tempo reservado.

## Tickets

| Ticket | Entrega | Dependências | Arquivo |
| --- | --- | --- | --- |
| ALP-01 | Fundação executável no Windows | — | [Abrir](done/ALP-01.md) |
| ALP-02 | Prova de compatibilidade do editor Markdown | ALP-01 | [Abrir](doing/ALP-02.md) |
| ALP-03 | Contratos e persistência local mínima | ALP-01 | [Abrir](done/ALP-03.md) |
| ALP-04 | Vault e salvar/reabrir notas | ALP-02, ALP-03 | [Abrir](done/ALP-04.md) |
| ALP-05 | Mesa persistente por matéria | ALP-04 | [Abrir](done/ALP-05.md) |
| ALP-06 | Leitor PDF com retomada | ALP-05 | [Abrir](done/ALP-06.md) |
| ALP-07 | Foco com pausa e estado persistente | ALP-05 | [Abrir](done/ALP-07.md) |
| ALP-08 | Checklist persistente por matéria | ALP-05 | [Abrir](done/ALP-08.md) |
| ALP-09 | Primeiro espelho autenticado na nuvem | ALP-04 | [Abrir](todo/ALP-09.md) |
| ALP-10 | Verificação do fluxo completo e recuperação | ALP-06, ALP-07, ALP-08, ALP-09 | [Abrir](doing/ALP-10.md) |
| ALP-11 | Setup, decisões e retomada | ALP-01 | [Abrir](done/ALP-11.md) |

ALP-01 a ALP-10 seguem a sequência. ALP-11 consolida documentação e pode ser repetido após ALP-04 e no fim da alpha. Todos os tickets atualizam documentação durante a execução; ALP-11 não aprova automaticamente recursos pendentes.

## Conteúdo de um ticket

Incremento atual solicitado após o MVP: [UI-01 — refinamento do frontend](doing/UI-01.md), em andamento na branch feat/frontend. Ele preserva a situação dos critérios da alpha.

Frontmatter, objetivo, dependências, prompt completo com critérios e verificações, registro de execução e referência de evidência. Use [o template](TEMPLATE.md) para novos tickets. Um prompt preparado não é uma tarefa entregue.

## Fonte e evolução

Os tickets foram extraídos do pacote original em docs/planning. Use o arquivo do quadro para executar e atualizar. O pacote original é histórico e não precisa acompanhar cada movimentação. Alteração material de escopo deve ser registrada, respeitando requisitos escolhidos pelo usuário.
