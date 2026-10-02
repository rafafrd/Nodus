---
id: ALP-11
status: todo
outcome: a_fazer
depends_on: ["ALP-01"]
criteria_count: 6
---

# ALP-11 — Setup, decisões e retomada

Estado inicial: A fazer. Dependências: ALP-01. Os critérios e as verificações estão no prompt abaixo. A evidência canônica fica em docs/validation/ALPHA.md, na seção ALP-11.

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

Tarefa: ALP-11 — Setup, decisões e retomada
Dependência: ALP-01. Pode ser executada após a semana 1 e repetida após a semana 2. Documentar um ticket parcial é válido; isso não conclui sua implementação.

Objetivo: organizar documentação curta, correta e suficiente para outra sessão de IA instalar, entender o estado real e continuar o trabalho.

Implementação:
- Leia os scripts/lockfile, configuração, contratos, decisões e evidências reais. Confira documentos contra o código; não apresente uma proposta da arquitetura como recurso já implementado.
- Organize README com pré-requisitos, versões usadas, comandos de instalação/dev/typecheck/build e primeiro uso: matéria, vault, nota, PDF, foco e checklist conforme o estado existente.
- Liste configuração necessária para Supabase/Auth/web e separe claramente recursos locais, serviços configurados e provas ainda pendentes. Exemplos têm nomes de variáveis, nunca valores secretos.
- Consolide docs/decisions/: editor/formato Markdown, persistência/identidade, IPC e decisões da sincronização que efetivamente existirem.
- Em docs/validation/ALPHA.md, mantenha resultado por ticket/critério com comando ou roteiro, ambiente, versão, dado de teste e referência de evidência. Um comando não executado continua como instrução pendente.
- Em docs/status/ALPHA_STATE.md, mantenha tabela de todos os tickets: status, dependências, critérios pendentes, bloqueio e próxima ação concreta. Adicione um resumo de onde uma nova sessão deve começar e como reproduzir problemas abertos.
- Compare a atenção humana observada, quando fornecida, com 180 minutos por semana/360 minutos nas duas semanas. Reservas do backlog não são duração garantida da implementação. Se não houver medida, use “não informado”.
- Quando houver atraso, registre uma previsão revisável preservando o escopo escolhido. Não remova grafo, farm/builds ou projetos da primeira versão pública para fazer o calendário parecer cumprido.
- Corrija documentos e links, sem implementar novos recursos nesta tarefa. Problemas de código encontrados entram na tarefa de origem com reprodução e próximo passo.

Critérios de conclusão:
C1. Setup apresenta comandos realmente usados e versões escolhidas.
C2. Configurações necessárias estão listadas sem segredos.
C3. Cada ticket tem status coerente com evidência.
C4. Decisão do editor registra compatibilidades verificadas.
C5. Uma nova sessão encontra o que funciona, próxima tarefa e problemas abertos.
C6. Checkpoint compara tempo humano observado e reserva, ou registra a ausência da medida.

Validação:
- Confira os comandos contra scripts atuais e execute os que forem pertinentes e disponíveis; preserve a distinção entre execução nova e evidência anterior.
- Verifique existência de arquivos/links locais, consistência dos IDs de tickets e divergências entre README, status e validação.
- Faça uma leitura de retomada: alguém sem esta conversa consegue identificar ambiente, estado, bloqueio e primeira ação? Ajuste as lacunas concretas.
- Se a build Windows ou a consulta na nuvem continua pendente, esse limite deve estar visível no setup e no status. Não mude esses tickets para Concluído pela conclusão da documentação.

Documentação específica: README, docs/decisions/, docs/validation/ALPHA.md e docs/status/ALPHA_STATE.md.
Próxima ação: continuar o primeiro ticket incompleto e suas dependências; se a alpha estiver validada, seguir o bloco seguinte do roadmap. Não o implemente nesta execução.

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
