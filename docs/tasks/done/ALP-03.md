---
id: ALP-03
status: done
outcome: concluido
depends_on: ["ALP-01"]
criteria_count: 6
---

# ALP-03 — Contratos e persistência local mínima

Estado inicial: A fazer. Dependências: ALP-01. Os critérios e as verificações estão no prompt abaixo. A evidência canônica fica em docs/validation/ALPHA.md, na seção ALP-03.

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

Tarefa: ALP-03 — Contratos e persistência local mínima
Dependência: ALP-01. A sequência executa esta tarefa após ALP-02, mas a escolha do editor não é dependência do armazenamento.

Objetivo: criar contratos tipados, validação de entrada e SQLite suficientes para a alpha. O corpo das notas permanece em arquivos Markdown.

Modelo mínimo, ajustável aos contratos existentes:
- Matéria: ID estável, nome e configuração visual básica.
- Referência de nota: ID, matéria, caminho relativo ao vault, hash e título derivado do arquivo.
- Material local: ID, matéria e referência ao PDF.
- Mesa: matéria, nota/material ativos, página e configuração dos painéis.
- Sessão de foco: ID, duração escolhida, estado e segmentos de tempo ativo.
- Tarefa e etapa: IDs, matéria, texto e estado de conclusão.
- Operação de sincronização: ID, nota/revisão, estado e resultado.

Implementação:
- Use SQLite na camada local, fora dos componentes visuais. Centralize repositórios/serviços e reutilize os contratos IPC da base.
- Crie schema versionado e inicialização/migração reproduzível. Preserve dados já existentes; não use reset do banco como estratégia de migração.
- Defina unidades, campos obrigatórios, estados e referências. Gere IDs independentes do nome e da posição na lista.
- Valide os dados na fronteira privilegiada, incluindo identidade das entidades e associações. Rejeite referências inexistentes e entradas inválidas com erro identificado.
- Use transações nas alterações relacionadas. Falha parcial não pode parecer um salvamento completo.
- Entregue criar/listar/renomear matéria e a estrutura de persistência necessária às próximas tarefas. Não implemente antecipadamente PDF, timer ou sincronização.
- Registre onde fica o banco e como usar uma instância de teste isolada. Os campos derivados das notas serão reconstruíveis a partir do vault, sem tornar SQLite a fonte principal do corpo Markdown.

Critérios de conclusão:
C1. Primeiro início cria o armazenamento e registra a versão do schema.
C2. Duas matérias preservam dados e IDs após fechar/reabrir.
C3. Renomear matéria conserva seus vínculos.
C4. Dados inválidos recebem erro identificado, sem gravação parcial silenciosa.
C5. Operações da interface validam identidade e argumentos.
C6. Persistência fica separada dos componentes visuais.

Validação:
- Use banco de teste: crie duas matérias, associe uma referência mínima, renomeie, feche/reabra e compare IDs/associações.
- Execute verificações pertinentes de migração/inicialização e rejeição de entrada inválida. Confira que o estado anterior permanece íntegro após a rejeição.
- Teste a integração real de SQLite. Se houver módulo nativo, confirme compatibilidade com Electron e empacotamento, registrando o que ainda falta no Windows.
- Anote versão do schema e resultados antes/depois da reinicialização.

Documentação específica: decisão curta sobre persistência, identidade e formato dos contratos.
Próxima tarefa na sequência: ALP-04.

Registro e resposta obrigatórios:
1. Atualize docs/status/ALPHA_STATE.md: ID, status, ambiente, dependências, critérios pendentes, próxima ação e tempo humano observado, se informado. Use “não informado” quando não houver medida; tempo da IA não é tempo de revisão humana.
2. Atualize docs/validation/ALPHA.md: por critério, aprovado, falhou ou não verificado, com comandos/roteiros realmente executados, resultado e evidência. Anote ambiente, versões e dados de teste.
3. Ajuste README e decisões quando o comportamento ou o setup mudar. Não copie segredos nem dados pessoais para documentação ou fixtures.
4. Responda com status, comportamento entregue, arquivos principais, verificações, pendências reproduzíveis e próxima ação. Use A fazer, Em andamento, Bloqueado, Parcial ou Concluído. Só use Concluído quando todos os critérios deste ticket estiverem demonstrados. Um comando sugerido deve aparecer separado de um comando executado.
5. Registre o resultado do ticket e a próxima ação. Quando a sessão tiver autorização para executar a alpha em sequência, continue automaticamente no próximo ticket cujas dependências técnicas estejam satisfeitas. Caso contrário, encerre no ticket solicitado. Provas pendentes continuam explícitas e não são aprovadas por avançar.
```

## Execução e retomada

Ambiente/versões: não informado. Alterações: nenhuma. Verificações do app: não executadas. Tempo humano: não informado. Bloqueio atual: nenhum verificado, sem dispensar a conferência das dependências. Próxima ação: iniciar conforme a sequência e condições do ticket.

Atualize este registro com comportamento entregue, arquivos, comandos/roteiros executados, resultados e critérios pendentes. Não transforme comandos sugeridos em evidência de execução.

### Checkpoint 02/10/2026

SQLite nativo do Node embarcado, schema versionado, contratos e matérias reais. Tempo humano: não informado.

### Checkpoint 02/10/2026

Matérias e SQLite reais verificados; próximo ALP-04, vault e recuperação. Tempo humano: não informado.
