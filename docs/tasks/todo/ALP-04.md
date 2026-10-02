---
id: ALP-04
status: todo
outcome: a_fazer
depends_on: ["ALP-02","ALP-03"]
criteria_count: 8
---

# ALP-04 — Vault e salvar/reabrir notas

Estado inicial: A fazer. Dependências: ALP-02, ALP-03. Os critérios e as verificações estão no prompt abaixo. A evidência canônica fica em docs/validation/ALPHA.md, na seção ALP-04.

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

Tarefa: ALP-04 — Vault e salvar/reabrir notas
Dependências: ALP-02 e ALP-03. Confirme a prova do editor, os contratos e a persistência. Se houver uma incompatibilidade de Markdown que impeça salvar com segurança, trate-a antes de aceitar este ticket.

Objetivo: selecionar um diretório de vault, criar uma nota ligada à matéria, editar visualmente e salvar Markdown real, preservando edição externa e dados recuperáveis.

Implementação:
- Reutilize o editor aprovado e os repositórios existentes. Faça seleção explícita do diretório e mantenha a referência do vault.
- Grave ID persistente e associação à matéria em metadados portáveis, conforme a decisão de formato. Não derive identidade do título; reabrir o mesmo arquivo precisa manter o ID.
- Preserve frontmatter desconhecido e todo conteúdo aprovado em ALP-02. Ao importar arquivo existente, explique e registre o tratamento da identidade sem reescrever o vault inteiro.
- Trate o arquivo como fonte principal. Atualize hash/índice depois do salvamento confirmado. Defina estados claros de edição, salvando, salvo, conflito e erro.
- Faça escrita recuperável e compare a revisão/hash lido antes de substituir o arquivo. O watcher deve diferenciar salvamento do app de alteração externa, evitando ciclos.
- Alteração externa em nota limpa atualiza a interface. Se existir edição local pendente, preserve ambas as versões para reconciliação; não escolha silenciosamente a última.
- Preserve o buffer quando uma escrita falhar, com uma forma verificável de recuperá-lo. Se houver rascunho local, identifique-o como recuperação, separado do arquivo canônico.
- Valide caminhos no processo privilegiado. Resolva caminhos relativos e o limite do diretório autorizado, incluindo tentativa de escape; a interface não pode pedir leitura/escrita arbitrária.

Critérios de conclusão:
C1. Nota criada tem ID persistente e vínculo com matéria.
C2. Salvar preserva metadados desconhecidos, referências e conteúdo aprovado em ALP-02.
C3. Fechar/reabrir recupera o texto do arquivo.
C4. Alteração externa atualiza uma nota limpa.
C5. Conflito entre edição local e externa preserva as duas versões para reconciliação.
C6. Reabrir o mesmo arquivo conserva a identidade.
C7. Erro de escrita é visível e mantém o texto recuperável.
C8. Operações respeitam diretório e caminhos autorizados.

Validação:
- Use pasta de teste e cópias recuperáveis. Crie, edite, salve, confira o arquivo fora do app e reinicie.
- Edite externamente primeiro com buffer limpo e depois com buffer alterado. Demonstre as duas versões no conflito e a recuperação escolhida.
- Provoque uma falha controlada de escrita sem danificar arquivos pessoais; confirme erro, buffer e nova tentativa.
- Verifique uma tentativa de caminho fora do diretório e a preservação dos dados. Use testes para conversão, conflito e escrita quando eles atingirem esses riscos.
- Guarde arquivos/diffs e explique o comportamento ao fechar com edição pendente.

Documentação específica: formato da nota, política de salvamento, alterações externas e recuperação.
Próxima tarefa na sequência: ALP-05.

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
