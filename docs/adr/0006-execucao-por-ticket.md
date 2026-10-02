# ADR 0006 — execução por ticket e evidência

Data: 01/10/2026. Estado: Aceita para o bootstrap.

## Contexto e decisão

O usuário escolheu um prompt por tarefa em sequência e trabalha em sessões novas. Cada ticket tem contexto próprio, dependências e critérios. AGENTS.md mantém as regras; CLAUDE.md aponta para a mesma fonte. Estado e evidências permitem retomada sem depender do chat.

Quadro em docs/tasks/todo, doing e done. Arquivo do ticket é canônico e existe em uma única pasta. Parcial/bloqueado fica em doing; done exige todos os critérios demonstrados. Retomada e links são atualizados junto da mudança.

## Consequências

Menos dependência de memória do modelo; algum esforço de documentação, focado no que muda. Reserva humana não é estimativa garantida de implementação. Uma dependência com prova de ambiente pendente permite trabalho independente, desde que a limitação seja preservada na evidência; não permite afirmar aprovação da prova ausente.


## Atualização de 02/10/2026 — sequência autorizada

O usuário optou por deixar o agente implementar a alpha em sequência. A unidade de execução continua sendo um ticket, com dependências técnicas e evidências; após o checkpoint, o agente pode avançar sem novo pedido. ALP-11 consolida após ALP-04 e ao final. Instruções históricas de encerrar entre todos os tickets não se aplicam a um pedido sequencial. Publicação, push e roadmap além da alpha não estão incluídos.
