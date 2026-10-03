# Documentação

## Leitura para começar

[Setup Windows](setup/windows.md) → [Git](setup/git.md) → [agentes](setup/agents.md) → [retomada](status/ALPHA_STATE.md) → [ticket](tasks/README.md). Use a arquitetura e o SDD conforme o escopo da tarefa.

| Documento | Autoridade e uso |
| --- | --- |
| [PRD](product/PRD.md) | Problema, decisões do produto e recortes |
| [Arquitetura](architecture/README.md) | Limites e módulos; distingue proposta de implementação |
| [Modelo de dados](architecture/data-model.md) | Entidades e autoridade dos armazenamentos |
| [SDD](sdd.md) | Fluxos e contratos esperados para a alpha |
| [Design](design/README.md) | Direção visual da mesa, grafo e base |
| [ADRs](adr/README.md) | Decisões duradouras, aceitas ou propostas |
| [Provas/decisões](decisions/README.md) | Resultados específicos, como a compatibilidade do editor |
| [Tarefas](tasks/README.md) | Ticket ativo e critérios; local canônico de execução |
| [Retomada](status/ALPHA_STATE.md) | Índice do estado atual e próxima ação |
| [Validação alpha](validation/ALPHA.md) | Evidência por critério |
| [Guia de uso](GUIA_DE_USO.md) | Iniciar app, usar mesa/jogo e preservar dados |
| [Validação do jogo](validation/GAME.md) | Cidade/economia e jornada Windows de GAM-01 |
| [Validação bootstrap](validation/BOOTSTRAP.md) | Revisão deste pacote documental |
| [Publicação](release/README.md) | Decisões e provas necessárias ao lançamento |

## Planejamento original

Os arquivos em planning/ são cópias do planejamento produzido antes do bootstrap. Sua data e o texto histórico foram preservados. Expressões como “ainda não há repositório” descrevem a concepção original; para o estado atual, consulte status/ALPHA_STATE.md. Não mantenha uma cópia ativa de cada ticket também no backlog histórico.

- [Arquitetura original](planning/ARQUITETURA_APP_ESTUDOS.md)
- [Roadmap original, plano 0.2](planning/ROADMAP_V0_1.md)
- [Backlog original](planning/BACKLOG_ALPHA_SEMANAS_1_2.md)
- [Pacote original de prompts](planning/PROMPTS_ALPHA_ALP_01_11.md)

## Consistência

Ticket e evidência detalhada são canônicos. A pasta descreve posição no quadro; o frontmatter descreve status/outcome. A retomada resume esses resultados. Quando mover um ticket, atualize seus links e a retomada. Código/scripts/lockfile são a evidência do que existe; uma ADR aceita não prova que o recurso foi entregue.


## Entrada desta edição

[Bootstrap único](setup/bootstrap.md), [pedido sequencial](setup/CODEX_START.md), [prompts atualizados](PROMPTS_ALPHA_ALP_01_11.md) e [diário de execução](status/RUN_LOG.md). Documentos em planning são snapshots históricos; não reintroduzem instruções antigas de parada.
