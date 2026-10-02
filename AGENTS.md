# Instruções do projeto

## Contexto e prioridade

Este projeto é um app pessoal de estudos, com futura publicação open source e portfólio. Windows nativo é o ambiente inicial. A entrega atual é um bootstrap de documentação; Electron, React e TypeScript serão implementados em ALP-01. Não confunda o desenho do sistema com código existente.

Siga a solicitação atual do usuário, estas instruções e o ticket ativo. Documentação pode estar desatualizada: confira código, scripts, lockfile e evidências antes de aceitar uma afirmação. Se houver contradição material que altere o comportamento esperado, exponha-a e peça a decisão necessária, continuando o trabalho independente dela.

## Entrada de uma sessão

1. Leia git status, gotcha.md e docs/status/ALPHA_STATE.md.
2. Localize o ticket solicitado em docs/tasks/todo, doing ou done. Leia seu objetivo, dependências, critérios e prompt de execução.
3. Leia apenas as partes relevantes de docs/sdd.md, arquitetura, ADRs e validação. Os documentos completos de concepção em docs/planning são referências; não carregue todos sem necessidade.
4. Confira as dependências no código/evidências. Verificação Windows pendente não impede trabalho independente em outro ambiente, mas continua pendente.
5. Faça um plano curto e implemente somente o ticket atual. Se a tarefa ainda não começou, mova-a para doing e atualize seu frontmatter e a retomada.

## Ciclo de execução

Inspecione → implemente um incremento → execute verificações pertinentes → corrija falhas → registre evidência. Continue enquanto houver ação concreta para satisfazer os critérios. Se houver bloqueio real de ambiente, serviço ou decisão, conclua a parte independente, preserve dados e registre reprodução, impacto e próxima ação.

Não use mocks como prova de integração. Fixtures são permitidas quando identificadas e usadas nos fluxos reais. Não invente resultados, comandos executados, versões, tempo humano, URLs de serviço ou sucesso de build. Diferencie aprovado, falhou e não verificado. Corrija a documentação ao descobrir uma divergência.

Faça perguntas curtas quando faltar informação material; escolhas reversíveis de implementação podem ser resolvidas e documentadas. Não adicione fluxos de aprovação para alterações rotineiras já autorizadas. Não delegue a outros agentes sem solicitação explícita do usuário.

## Fronteiras técnicas

- Electron: processo principal e preload concentram capacidades privilegiadas. Interface usa operações específicas e IPC tipado/validado; previews de projetos futuros ficam em uma superfície isolada.
- Vault: Markdown é a fonte principal do corpo das notas. Preserve frontmatter desconhecido, referências, fórmulas, tabelas e código. Edição externa e conflito precisam preservar dados.
- SQLite: estado, referências, índices e operações; migrations não podem resetar dados existentes para facilitar o desenvolvimento.
- Nuvem: snapshots versionados de notas, identidade e recibo de processamento. PDFs e projetos permanecem no PC. Reenvio não duplica o efeito nem substitui revisão mais nova por antiga.
- Desktop e mobile compartilham domínio quando necessário, sem um framework interno antecipado para todas as funcionalidades futuras.
- Visual: mesa escura e sóbria, documentos centrais, barra lateral/dock, painéis encaixados e ferramentas flutuantes. Controles próprios; evite a aparência genérica de kits. GSAP e Three.js servem às vistas previstas no roadmap, sem reduzir legibilidade.
- XP e moedas não medem domínio acadêmico. Git do app, Git do vault e Git dos projetos são repositórios distintos.

## Ambiente e alterações

Use Windows nativo para a prova de execução/empacotamento inicial. Sucesso em Linux não comprova Windows. Verifique versões e APIs em documentação oficial quando necessário. A base do host é Node.js 24 LTS; use npm e mantenha um lockfile da aplicação quando ALP-01 o criar. Dependências necessárias à tarefa podem ser adicionadas, com motivo e compatibilidade registrados.

Use rg para buscas. Preserve alterações existentes. Não altere configurações globais do Git/Codex ou arquivos de outros projetos para resolver um problema local. Não inclua vault pessoal, banco de usuário, tokens ou materiais privados no repositório. Arquivos de exemplo têm valores vazios/fictícios claramente identificados. Chaves do app não são necessárias para executar a fundação.

Crie uma branch local por ticket quando apropriado, seguindo docs/setup/git.md. Commit e push seguem o pedido do usuário; respeite autorizações já dadas. Antes de stage, confira o diff e selecione apenas arquivos da tarefa. Não publique uma versão ou serviço para comprovar um critério sem ambiente e escopo de publicação definidos.

## Verificação e encerramento

Priorize riscos reais: preservação Markdown, persistência, argumentos inválidos, conflito, tempo de foco, empacotamento e reenvio. Não escreva testes que apenas espelhem componentes nem repita toda a suíte sem falha/mudança que justifique.

Atualize o ticket, docs/status/ALPHA_STATE.md, docs/validation/ALPHA.md e os documentos realmente afetados. Registre no gotcha.md somente problemas novos e observados, separados das hipóteses já listadas. Uma decisão duradoura entra em docs/adr; docs/decisions contém resultados específicos das provas.

Todo/doing/done descreve a posição no quadro. Outcome descreve a situação: a_fazer, em_andamento, bloqueado, parcial ou concluido. Parcial/bloqueado permanece em doing. Mova para done somente com todos os critérios aprovados e evidências registradas; atualize links e execute node scripts/check-bootstrap.mjs. Consulte docs/tasks/README.md.

Responda com status, comportamento entregue, arquivos principais, verificações efetivamente executadas, limites e próxima ação. Em pedido restrito a um ticket, encerre nele. Em pedido de alpha sequencial, aplique o fluxo abaixo e avance sem pedir nova autorização entre tickets.


## Alpha em sequência e retomada

Quando o usuário pedir a implementação sequencial da alpha, execute ALP-01 a ALP-10, uma tarefa por vez. Execute ALP-11 após ALP-04 e novamente no checkpoint final. Essa autorização substitui instruções históricas de aguardar novo pedido depois de cada ticket; não amplia o escopo para o roadmap seguinte.

Confira dependências no código e nas evidências. Uma prova externa pendente não impede trabalho que não depende dela, mas não pode ser apresentada como aprovada. Se a compatibilidade do editor ainda não foi resolvida, não construa uma persistência que dependa de uma conversão comprovadamente destrutiva. Serviços, credenciais e provas Windows/celular ausentes ficam registrados, enquanto trabalho independente continua.

Use uma branch local de trabalho, como feat/alpha, partindo do estado existente. Não crie branches independentes que deixem o ticket seguinte sem o código anterior. Antes de cada checkpoint, revise o diff, faça verificações pertinentes e atualize ticket, retomada, validação e docs/status/RUN_LOG.md. Commits locais por checkpoint são permitidos quando o prompt de início os autorizar; não faça push nem publique serviços por essa autorização.

Ao retomar uma sessão, continue a primeira ação concreta registrada, preservando código e resultados anteriores. Não recrie arquivos iniciais nem resete o quadro. Se a sessão parar por limite ou bloqueio real, deixe arquivos salvos, critérios pendentes, comandos de reprodução e próximo passo. Um arquivo de instruções organiza a execução; não cria um processo permanente nem supera limites da sessão.

Escolhas reversíveis e dependências locais necessárias são resolvidas e documentadas. Pergunte somente quando informação ausente alterar materialmente a solução ou impedir a continuação correta. Não registre dados fictícios como produção, não invente provas e não transforme ausência de configuração em integração concluída.
