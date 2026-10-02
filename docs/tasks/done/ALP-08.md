---
id: ALP-08
status: done
outcome: concluido
depends_on: ["ALP-05"]
criteria_count: 6
---

# ALP-08 — Checklist persistente por matéria

Estado inicial: A fazer. Dependências: ALP-05. Os critérios e as verificações estão no prompt abaixo. A evidência canônica fica em docs/validation/ALPHA.md, na seção ALP-08.

## Prompt de execução

```text
Implemente somente esta tarefa no projeto existente. Trabalhe até entregar um resultado verificável; um plano ou uma tela simulada não substitui a implementação.

No bootstrap deste projeto, o arquivo deste ticket em docs/tasks/ é canônico. Ao iniciar, mova-o para doing e atualize status/outcome. Ao encerrar, registre a execução nele; parcial ou bloqueado permanece em doing, e done exige todos os critérios aprovados. Atualize também os links do quadro e a tabela de retomada. Não marque ALP-11 como concluído apenas por este pacote documental existir.

Contexto: app pessoal de estudos, futuro open source e destaque de portfólio. Desktop Windows primeiro, com Electron, React, TypeScript e integrações locais Node. Markdown no vault é a fonte principal das notas; SQLite guarda referências, índices e estado. Supabase receberá uma cópia para consulta pelo celular. A mesa é sóbria, escura, com documentos centrais, barra lateral e dock; use controles com identidade própria. GSAP, Three.js, grafo, jogo, IA, agenda e projetos completos seguem o roadmap, além deste recorte inicial.

Antes de editar:
- Leia as instruções AGENTS.md aplicáveis, o estado do Git, os scripts e o lockfile. Preserve alterações existentes.
- Procure ARQUITETURA_APP_ESTUDOS.md, ROADMAP_V0_1.md e BACKLOG_ALPHA_SEMANAS_1_2.md no repositório, normalmente em docs/, ou nos anexos. Leia o ticket e as seções relevantes. Use rg para localizar código e contratos.
- Leia docs/status/ALPHA_STATE.md e docs/validation/ALPHA.md, se existirem. Confira as dependências no código e nas evidências; não confie apenas no rótulo de conclusão.
- Resolva escolhas reversíveis de implementação e registre-as. Peça informação apenas quando uma ausência material impedir a solução correta, continuando o trabalho independente dessa resposta.

Faça um plano curto, implemente, execute verificações pertinentes e corrija falhas. Se surgir um bloqueio real, conclua a parte independente e registre o limite. Sucesso em Linux/macOS não comprova Windows; mocks não comprovam uma integração real. Não antecipe funcionalidades de outros tickets.

Tarefa: ALP-08 — Checklist persistente por matéria
Dependência: ALP-05, reutilizando tarefas/etapas de ALP-03.

Objetivo: criar uma tarefa de estudo com etapas, acompanhar conclusão e indicar o que retomar na mesa da matéria.

Implementação:
- Reutilize os repositórios e contratos existentes para criar tarefa e etapas com IDs estáveis e vínculo à matéria.
- Permita adicionar pelo menos duas etapas, marcar/desmarcar e ajustar o texto.
- Salve as alterações reais e mostre erros de persistência, sem exibir uma confirmação definitiva antes de gravar.
- Mostre concluídas/total de forma simples e coerente, incluindo tarefa sem etapas.
- Permita escolher uma tarefa ou próxima etapa para retomar; persista essa referência no checkpoint da mesa. Renomear a etapa não pode quebrar o vínculo.
- Preserve os estados separados por matéria durante troca e reinicialização.
- Esta tarefa entrega a base do progresso. Gamificação, conquistas, loja e redistribuição de agenda serão implementadas depois; não adicione contadores de XP fictícios.

Critérios de conclusão:
C1. É possível criar tarefa com pelo menos duas etapas.
C2. Marcar/desmarcar altera o estado persistido.
C3. Trocar matéria e fechar/reabrir conserva etapas e associações.
C4. A mesa mostra concluídas e total.
C5. Editar texto mantém identidade da etapa.
C6. Checkpoint identifica tarefa ou próxima etapa escolhida.

Validação:
- Crie uma tarefa em cada uma de duas matérias, com estados diferentes.
- Marque e desmarque, edite um texto e escolha o ponto de retomada. Registre os IDs antes/depois.
- Alterne matérias, feche/reabra e compare estado, contagem e próxima ação.
- Verifique que uma falha de escrita aparece e permite nova tentativa. Use a infraestrutura de teste de persistência existente quando útil, evitando testes que só reproduzem os componentes.

Documentação específica: vínculo tarefa/etapa/matéria e referência de retomada.
Próxima tarefa na sequência: ALP-09.

Registro e resposta obrigatórios:
1. Atualize docs/status/ALPHA_STATE.md: ID, status, ambiente, dependências, critérios pendentes, próxima ação e tempo humano observado, se informado. Use “não informado” quando não houver medida; tempo da IA não é tempo de revisão humana.
2. Atualize docs/validation/ALPHA.md: por critério, aprovado, falhou ou não verificado, com comandos/roteiros realmente executados, resultado e evidência. Anote ambiente, versões e dados de teste.
3. Ajuste README e decisões quando o comportamento ou o setup mudar. Não copie segredos nem dados pessoais para documentação ou fixtures.
4. Responda com status, comportamento entregue, arquivos principais, verificações, pendências reproduzíveis e próxima ação. Use A fazer, Em andamento, Bloqueado, Parcial ou Concluído. Só use Concluído quando todos os critérios deste ticket estiverem demonstrados. Um comando sugerido deve aparecer separado de um comando executado.
5. Registre o resultado do ticket e a próxima ação. Quando a sessão tiver autorização para executar a alpha em sequência, continue automaticamente no próximo ticket cujas dependências técnicas estejam satisfeitas. Caso contrário, encerre no ticket solicitado. Provas pendentes continuam explícitas e não são aprovadas por avançar.
```

## Execução e retomada

Registro atualizado: consulte os checkpoints abaixo e a seção deste ticket em docs/validation/ALPHA.md. Tempo humano: não informado. Critérios pendentes e próxima ação em docs/status/ALPHA_STATE.md.

Atualize este registro com comportamento entregue, arquivos, comandos/roteiros executados, resultados e critérios pendentes. Não transforme comandos sugeridos em evidência de execução.

### Checkpoint 02/10/2026

Checklist persistente por matéria, IDs de etapas e referência de retomada. Tempo humano: não informado.

### Checkpoint 02/10/2026

Checklist local verificado. MVP local implementado; ALP-09 fica fora deste recorte sem serviço/hospedagem. Executar jornada local ALP-10 e consolidar ALP-11. Tempo humano: não informado.
