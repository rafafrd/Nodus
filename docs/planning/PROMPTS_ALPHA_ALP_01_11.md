# Prompts de implementação — alpha, semanas 1 e 2

Versão do pacote: 0.1  
Data: 01/10/2026, America/Sao_Paulo  
Base: ARQUITETURA_APP_ESTUDOS.md, ROADMAP_V0_1.md (plano 0.2) e BACKLOG_ALPHA_SEMANAS_1_2.md.  
Estado: instruções preparadas; o aplicativo ainda não foi implementado nesta conversa.

São 11 prompts independentes, um por ticket. Cada bloco inclui contexto para uma sessão nova, dependências, resultado esperado, critérios, verificações e registro de retomada.

## Como usar

1. Disponibilize o repositório à IA e coloque os três documentos de base em docs/, ou anexe-os à sessão. Para ALP-01, o diretório pode estar vazio.
2. Copie o bloco completo de ALP-01. Peça execução no ambiente de desenvolvimento, com acesso aos arquivos do projeto.
3. Ao terminar, revise o status e as evidências. Passe ao próximo prompt quando suas dependências estiverem estáveis. Se faltar uma prova de ambiente, é possível continuar trabalho independente, preservando o critério pendente.
4. Em uma sessão nova, disponibilize novamente o repositório e os documentos. O prompt manda ler docs/status/ALPHA_STATE.md para retomar.
5. Os prompts terminam na tarefa atual. Eles não autorizam uma execução automática dos 11 tickets de uma vez.

O recorte entrega notas Markdown, armazenamento local, mesa, PDF, foco, checklist e primeiro espelho web autenticado. Grafo 3D, farm/loja/builds, editor de projetos, IA e agenda continuam no roadmap da primeira versão pública.

## Ordem e atenção humana

| Prompt | Entrega | Dependências | Reserva de revisão |
| --- | --- | --- | --- |
| ALP-01 | Fundação executável no Windows | — | 40 min |
| ALP-02 | Prova de compatibilidade do editor Markdown | ALP-01 | 45 min |
| ALP-03 | Contratos e persistência local mínima | ALP-01 | 30 min |
| ALP-04 | Vault e salvar/reabrir notas | ALP-02, ALP-03 | 45 min |
| ALP-05 | Mesa persistente por matéria | ALP-04 | 35 min |
| ALP-06 | Leitor PDF com retomada | ALP-05 | 20 min |
| ALP-07 | Foco com pausa e estado persistente | ALP-05 | 20 min |
| ALP-08 | Checklist persistente por matéria | ALP-05 | 15 min |
| ALP-09 | Primeiro espelho autenticado na nuvem | ALP-04 | 45 min |
| ALP-10 | Verificação do fluxo completo e recuperação | ALP-06, ALP-07, ALP-08, ALP-09 | 30 min |
| ALP-11 | Setup, decisões e retomada | ALP-01 | 35 min: 20 na semana 1 + 15 na semana 2 |

ALP-01 a ALP-10 seguem a ordem da tabela. A documentação é atualizada em cada entrega. ALP-11 faz a consolidação final e pode ser repetido no checkpoint da semana 1, após ALP-04, e no da semana 2.

A reserva total é de 6 horas humanas nas duas semanas. Ela cobre orientação, configuração, revisão e testes; não é uma promessa de duração da implementação. Se os checkpoints atrasarem, o prazo será ajustado para preservar as funcionalidades escolhidas.

## Registro comum de retomada

Os prompts usam dois arquivos no repositório:

- docs/status/ALPHA_STATE.md: estado por ticket, dependências, critérios pendentes, bloqueios e próxima ação.
- docs/validation/ALPHA.md: verificações executadas, resultado por critério, ambiente, versões e evidências.

Status do ticket: A fazer, Em andamento, Bloqueado, Parcial ou Concluído. Resultado de critério: aprovado, falhou ou não verificado. Uma prova indisponível conserva o critério pendente; documentar a pendência não aprova a funcionalidade.

## ALP-01 — Fundação executável no Windows

```text
Implemente somente esta tarefa no projeto existente. Trabalhe até entregar um resultado verificável; um plano ou uma tela simulada não substitui a implementação.

Contexto: app pessoal de estudos, futuro open source e destaque de portfólio. Desktop Windows primeiro, com Electron, React, TypeScript e integrações locais Node. Markdown no vault é a fonte principal das notas; SQLite guarda referências, índices e estado. Supabase receberá uma cópia para consulta pelo celular. A mesa é sóbria, escura, com documentos centrais, barra lateral e dock; use controles com identidade própria. GSAP, Three.js, grafo, jogo, IA, agenda e projetos completos seguem o roadmap, além deste recorte inicial.

Antes de editar:
- Leia as instruções AGENTS.md aplicáveis, o estado do Git, os scripts e o lockfile. Preserve alterações existentes.
- Procure ARQUITETURA_APP_ESTUDOS.md, ROADMAP_V0_1.md e BACKLOG_ALPHA_SEMANAS_1_2.md no repositório, normalmente em docs/, ou nos anexos. Leia o ticket e as seções relevantes. Use rg para localizar código e contratos.
- Leia docs/status/ALPHA_STATE.md e docs/validation/ALPHA.md, se existirem. Confira as dependências no código e nas evidências; não confie apenas no rótulo de conclusão.
- Resolva escolhas reversíveis de implementação e registre-as. Peça informação apenas quando uma ausência material impedir a solução correta, continuando o trabalho independente dessa resposta.

Faça um plano curto, implemente, execute verificações pertinentes e corrija falhas. Se surgir um bloqueio real, conclua a parte independente e registre o limite. Sucesso em Linux/macOS não comprova Windows; mocks não comprovam uma integração real. Não antecipe funcionalidades de outros tickets.

Tarefa: ALP-01 — Fundação executável no Windows
Dependências: nenhuma.

Objetivo: entregar uma base Electron + React + TypeScript que abre e pode ser empacotada para Windows, com processo principal, preload e interface separados. Use “app-estudos” apenas como identificador temporário, caso o projeto ainda não tenha um.

Implementação:
- Inspecione a estrutura existente. Se estiver vazia, crie a menor estrutura funcional; mantenha somente os apps/pacotes necessários. Se os três documentos de planejamento foram fornecidos, organize cópias em docs/ sem alterar as decisões originais.
- Escolha versões compatíveis, confira a documentação oficial das dependências usadas e registre versões efetivamente instaladas. Use um gerenciador de pacotes e seu lockfile. Documente instalação, desenvolvimento, typecheck e empacotamento.
- Crie uma janela React real, com estado de inicialização e erro compreensível.
- Implemente uma operação tipada que obtém a versão real do aplicativo no processo principal e a mostra na interface, passando pelo preload. Valide remetente e formato dos argumentos na fronteira de IPC; trate falhas com resposta identificada.
- Mantenha contextIsolation e a separação das APIs Node. Exponha operações específicas no preload, em vez de um acesso genérico a IPC, arquivos ou execução. Documente que previews futuros terão uma superfície separada das APIs privilegiadas.
- Não monte módulos vazios para todas as funcionalidades futuras. Deixe as fronteiras necessárias claras no código e em uma decisão curta.

Critérios de conclusão:
C1. Instalação, execução e verificação de tipos funcionam pelos comandos documentados.
C2. A janela inicia, fecha e reabre sem erro de inicialização.
C3. A versão exibida vem da operação real interface → preload → processo principal, com contrato e validação.
C4. A interface recebe apenas operações privilegiadas específicas; a separação de previews futuros está definida.
C5. Uma build empacotada inicia no Windows.

Validação:
- Execute os comandos disponíveis, registre versões e confirme o fluxo de IPC. Verifique uma chamada inválida pela camada de contrato, sem criar um recurso de diagnóstico acessível no produto.
- Gere e abra a build Windows no ambiente adequado. Registre sistema, artefato, comando e resultado de abrir/fechar/reabrir. Compilar para outro sistema ou gerar um arquivo sem abri-lo não comprova C5.
- Se Windows ou o empacotamento estiver indisponível, entregue o trabalho verificável, marque C5 como não verificado/falhou e mantenha o ticket Parcial. Informe a causa e o roteiro exato de continuação.

Documentação específica: setup inicial no README e decisão sobre processos/IPC. Inicialize o registro de todos os tickets como A fazer, alterando somente os status sustentados por evidência.
Próxima tarefa na sequência: ALP-02.

Registro e resposta obrigatórios:
1. Atualize docs/status/ALPHA_STATE.md: ID, status, ambiente, dependências, critérios pendentes, próxima ação e tempo humano observado, se informado. Use “não informado” quando não houver medida; tempo da IA não é tempo de revisão humana.
2. Atualize docs/validation/ALPHA.md: por critério, aprovado, falhou ou não verificado, com comandos/roteiros realmente executados, resultado e evidência. Anote ambiente, versões e dados de teste.
3. Ajuste README e decisões quando o comportamento ou o setup mudar. Não copie segredos nem dados pessoais para documentação ou fixtures.
4. Responda com status, comportamento entregue, arquivos principais, verificações, pendências reproduzíveis e próxima ação. Use A fazer, Em andamento, Bloqueado, Parcial ou Concluído. Só use Concluído quando todos os critérios deste ticket estiverem demonstrados. Um comando sugerido deve aparecer separado de um comando executado.
5. Encerre na tarefa atual. Indique o próximo ticket; a execução dele será iniciada com seu próprio prompt.
```

## ALP-02 — Prova de compatibilidade do editor Markdown

```text
Implemente somente esta tarefa no projeto existente. Trabalhe até entregar um resultado verificável; um plano ou uma tela simulada não substitui a implementação.

Contexto: app pessoal de estudos, futuro open source e destaque de portfólio. Desktop Windows primeiro, com Electron, React, TypeScript e integrações locais Node. Markdown no vault é a fonte principal das notas; SQLite guarda referências, índices e estado. Supabase receberá uma cópia para consulta pelo celular. A mesa é sóbria, escura, com documentos centrais, barra lateral e dock; use controles com identidade própria. GSAP, Three.js, grafo, jogo, IA, agenda e projetos completos seguem o roadmap, além deste recorte inicial.

Antes de editar:
- Leia as instruções AGENTS.md aplicáveis, o estado do Git, os scripts e o lockfile. Preserve alterações existentes.
- Procure ARQUITETURA_APP_ESTUDOS.md, ROADMAP_V0_1.md e BACKLOG_ALPHA_SEMANAS_1_2.md no repositório, normalmente em docs/, ou nos anexos. Leia o ticket e as seções relevantes. Use rg para localizar código e contratos.
- Leia docs/status/ALPHA_STATE.md e docs/validation/ALPHA.md, se existirem. Confira as dependências no código e nas evidências; não confie apenas no rótulo de conclusão.
- Resolva escolhas reversíveis de implementação e registre-as. Peça informação apenas quando uma ausência material impedir a solução correta, continuando o trabalho independente dessa resposta.

Faça um plano curto, implemente, execute verificações pertinentes e corrija falhas. Se surgir um bloqueio real, conclua a parte independente e registre o limite. Sucesso em Linux/macOS não comprova Windows; mocks não comprovam uma integração real. Não antecipe funcionalidades de outros tickets.

Tarefa: ALP-02 — Prova de compatibilidade do editor Markdown
Dependência: ALP-01; confirme que a base e sua separação de processos funcionam. Registre eventual prova Windows ainda pendente.

Objetivo: selecionar e integrar um editor visual a partir de uma prova real de abrir, editar, salvar e reabrir Markdown portável. Esta tarefa valida conversão e edição; a integração com o diretório real do vault será ALP-04.

Implementação:
- Avalie primeiro Tiptap, candidato da arquitetura. Confira o estado atual da integração Markdown e das extensões em documentação oficial; a proposta original registra uma integração beta. Não assuma que todo Markdown terá conversão sem perdas.
- Crie uma fixture identificada como dado de teste contendo título, parágrafos, listas, checklist, link relativo, wikilink, tabela, bloco de código, fórmula e frontmatter com campo desconhecido pelo app. Inclua uma frase fácil de alterar e referências cujo destino possa ser conferido.
- Implemente os comandos/botões de edição dos elementos suportados. A prova pode usar uma rota de desenvolvimento ou um componente dedicado; não acrescente um laboratório de compatibilidade à navegação do produto.
- Separe metadados de conteúdo quando isso facilitar preservação. Campos desconhecidos precisam sobreviver ao salvamento. Preserve referências relativas e a semântica dos wikilinks.
- Para um elemento incompatível, preserve sua representação original ou bloqueie o salvamento destrutivo com uma explicação. Não descarte o elemento silenciosamente.
- Se o candidato falhar nos critérios, registre o caso e avalie uma alternativa dentro desta tarefa. Escolha por resultado demonstrado, não pela quantidade de extensões.

Critérios de conclusão:
C1. Botões ou comandos permitem editar os elementos suportados sem escrever Markdown manualmente.
C2. Abrir e salvar preserva sentido, referências e metadados da amostra.
C3. Alterar uma frase preserva as demais partes.
C4. Incompatibilidades são identificadas e seu conteúdo é preservado ou sua conversão destrutiva é impedida.
C5. A nota continua utilizável no Obsidian ou em outro editor Markdown.
C6. A decisão explica casos aprovados, limitações e motivo da escolha.

Validação:
- Faça abrir → salvar sem edição → reabrir, depois altere somente a frase escolhida → salvar → reabrir.
- Guarde a fixture original, a saída e o diff. Mudanças apenas de espaços podem ser aceitáveis; perda de fórmula, referência, tabela ou metadado exige correção.
- Use testes de round-trip para os riscos de conversão e confira a interação visual. Abra a saída em Obsidian/outro editor disponível; se a conferência externa não puder ser feita, registre C5 como não verificado.
- Inclua um caso incompatível para demonstrar preservação ou bloqueio. Não marque compatibilidade com base apenas na aparência do editor.

Documentação específica: docs/decisions/markdown-editor.md, com versão, formato, matriz de elementos, evidências e limites.
Próxima tarefa na sequência: ALP-03.

Registro e resposta obrigatórios:
1. Atualize docs/status/ALPHA_STATE.md: ID, status, ambiente, dependências, critérios pendentes, próxima ação e tempo humano observado, se informado. Use “não informado” quando não houver medida; tempo da IA não é tempo de revisão humana.
2. Atualize docs/validation/ALPHA.md: por critério, aprovado, falhou ou não verificado, com comandos/roteiros realmente executados, resultado e evidência. Anote ambiente, versões e dados de teste.
3. Ajuste README e decisões quando o comportamento ou o setup mudar. Não copie segredos nem dados pessoais para documentação ou fixtures.
4. Responda com status, comportamento entregue, arquivos principais, verificações, pendências reproduzíveis e próxima ação. Use A fazer, Em andamento, Bloqueado, Parcial ou Concluído. Só use Concluído quando todos os critérios deste ticket estiverem demonstrados. Um comando sugerido deve aparecer separado de um comando executado.
5. Encerre na tarefa atual. Indique o próximo ticket; a execução dele será iniciada com seu próprio prompt.
```

## ALP-03 — Contratos e persistência local mínima

```text
Implemente somente esta tarefa no projeto existente. Trabalhe até entregar um resultado verificável; um plano ou uma tela simulada não substitui a implementação.

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
5. Encerre na tarefa atual. Indique o próximo ticket; a execução dele será iniciada com seu próprio prompt.
```

## ALP-04 — Vault e salvar/reabrir notas

```text
Implemente somente esta tarefa no projeto existente. Trabalhe até entregar um resultado verificável; um plano ou uma tela simulada não substitui a implementação.

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
5. Encerre na tarefa atual. Indique o próximo ticket; a execução dele será iniciada com seu próprio prompt.
```

## ALP-05 — Mesa persistente por matéria

```text
Implemente somente esta tarefa no projeto existente. Trabalhe até entregar um resultado verificável; um plano ou uma tela simulada não substitui a implementação.

Contexto: app pessoal de estudos, futuro open source e destaque de portfólio. Desktop Windows primeiro, com Electron, React, TypeScript e integrações locais Node. Markdown no vault é a fonte principal das notas; SQLite guarda referências, índices e estado. Supabase receberá uma cópia para consulta pelo celular. A mesa é sóbria, escura, com documentos centrais, barra lateral e dock; use controles com identidade própria. GSAP, Three.js, grafo, jogo, IA, agenda e projetos completos seguem o roadmap, além deste recorte inicial.

Antes de editar:
- Leia as instruções AGENTS.md aplicáveis, o estado do Git, os scripts e o lockfile. Preserve alterações existentes.
- Procure ARQUITETURA_APP_ESTUDOS.md, ROADMAP_V0_1.md e BACKLOG_ALPHA_SEMANAS_1_2.md no repositório, normalmente em docs/, ou nos anexos. Leia o ticket e as seções relevantes. Use rg para localizar código e contratos.
- Leia docs/status/ALPHA_STATE.md e docs/validation/ALPHA.md, se existirem. Confira as dependências no código e nas evidências; não confie apenas no rótulo de conclusão.
- Resolva escolhas reversíveis de implementação e registre-as. Peça informação apenas quando uma ausência material impedir a solução correta, continuando o trabalho independente dessa resposta.

Faça um plano curto, implemente, execute verificações pertinentes e corrija falhas. Se surgir um bloqueio real, conclua a parte independente e registre o limite. Sucesso em Linux/macOS não comprova Windows; mocks não comprovam uma integração real. Não antecipe funcionalidades de outros tickets.

Tarefa: ALP-05 — Mesa persistente por matéria
Dependência: ALP-04, usando os contratos de ALP-03.

Objetivo: montar a mesa de estudo com barra lateral, nota central, área de documento e ferramentas acessíveis, mantendo um contexto por matéria.

Direção visual confirmada:
- Observatório espacial escuro e sóbrio durante o estudo: contraste para leitura, brilho discreto e materiais em destaque.
- Barra lateral para matérias/vistas e dock para ferramentas rápidas.
- Painéis encaixados com ferramentas flutuantes. Indicadores compactos nas bordas.
- Controles com identidade própria, sem reproduzir a aparência padrão dos kits Radix/shadcn.
- GSAP pode trazer transições leves se útil; a mesa não precisa de um cenário 3D nesta tarefa. Grafo e base ricos chegam depois.

Implementação:
- Integre o editor e o vault reais. Acrescente seleção da nota e vínculo de uma referência local de documento à matéria.
- Persista nota/material ativos, configuração dos painéis e ferramenta aberta, conforme os contratos disponíveis. Cada matéria recupera seu próprio contexto.
- Permita redimensionar os painéis e abrir/fechar uma ferramenta de foco sem descartar a nota em edição.
- O painel do documento usa a referência real; o renderizador de páginas será ALP-06. O painel de foco pode ser aberto agora; a contagem será ALP-07. Não simule PDF renderizado ou timer funcionando para passar os critérios.
- Entregue busca/contexto básico suficiente para encontrar notas da matéria, reutilizando o índice disponível. Evite construir uma busca semântica ou um sistema completo de janelas.
- Garanta rótulos, ordem de foco e operação por teclado. Animações não podem esconder erros nem interferir no salvamento.
- Ao trocar de matéria e fechar, grave o checkpoint e preserve edição pendente pela política de ALP-04. Falha deve aparecer e permitir recuperação.
- Mantenha pontos de integração simples para tutor e ferramentas posteriores. Não preencha a navegação com funcionalidades simuladas.

Critérios de conclusão:
C1. Trocar de matéria restaura a nota e a referência de documento daquela mesa.
C2. Tamanhos dos painéis persistem após reabrir.
C3. Textos e documentos têm espaço legível na direção sóbria.
C4. Controles têm rótulos, foco de teclado e estados claros.
C5. Abrir a ferramenta de foco preserva a edição.
C6. Fechar grava o checkpoint disponível e identifica falhas.
C7. A estrutura permite inserir tutor e outras ferramentas depois.

Validação:
- Prepare duas matérias com notas e referências reais diferentes e tamanhos distintos. Alterne, abra a ferramenta, feche/reabra e compare o contexto.
- Verifique a nota com edição ainda pendente durante a troca e a abertura do painel.
- Confira teclado e legibilidade na resolução usada. Capturas podem complementar a evidência, sem substituir a prova de persistência.
- Registre claramente os limites desta etapa: leitura de páginas e contagem ainda dependem dos próximos tickets.

Documentação específica: estrutura da mesa e campos persistidos.
Próxima tarefa na sequência: ALP-06.

Registro e resposta obrigatórios:
1. Atualize docs/status/ALPHA_STATE.md: ID, status, ambiente, dependências, critérios pendentes, próxima ação e tempo humano observado, se informado. Use “não informado” quando não houver medida; tempo da IA não é tempo de revisão humana.
2. Atualize docs/validation/ALPHA.md: por critério, aprovado, falhou ou não verificado, com comandos/roteiros realmente executados, resultado e evidência. Anote ambiente, versões e dados de teste.
3. Ajuste README e decisões quando o comportamento ou o setup mudar. Não copie segredos nem dados pessoais para documentação ou fixtures.
4. Responda com status, comportamento entregue, arquivos principais, verificações, pendências reproduzíveis e próxima ação. Use A fazer, Em andamento, Bloqueado, Parcial ou Concluído. Só use Concluído quando todos os critérios deste ticket estiverem demonstrados. Um comando sugerido deve aparecer separado de um comando executado.
5. Encerre na tarefa atual. Indique o próximo ticket; a execução dele será iniciada com seu próprio prompt.
```

## ALP-06 — Leitor PDF com retomada

```text
Implemente somente esta tarefa no projeto existente. Trabalhe até entregar um resultado verificável; um plano ou uma tela simulada não substitui a implementação.

Contexto: app pessoal de estudos, futuro open source e destaque de portfólio. Desktop Windows primeiro, com Electron, React, TypeScript e integrações locais Node. Markdown no vault é a fonte principal das notas; SQLite guarda referências, índices e estado. Supabase receberá uma cópia para consulta pelo celular. A mesa é sóbria, escura, com documentos centrais, barra lateral e dock; use controles com identidade própria. GSAP, Three.js, grafo, jogo, IA, agenda e projetos completos seguem o roadmap, além deste recorte inicial.

Antes de editar:
- Leia as instruções AGENTS.md aplicáveis, o estado do Git, os scripts e o lockfile. Preserve alterações existentes.
- Procure ARQUITETURA_APP_ESTUDOS.md, ROADMAP_V0_1.md e BACKLOG_ALPHA_SEMANAS_1_2.md no repositório, normalmente em docs/, ou nos anexos. Leia o ticket e as seções relevantes. Use rg para localizar código e contratos.
- Leia docs/status/ALPHA_STATE.md e docs/validation/ALPHA.md, se existirem. Confira as dependências no código e nas evidências; não confie apenas no rótulo de conclusão.
- Resolva escolhas reversíveis de implementação e registre-as. Peça informação apenas quando uma ausência material impedir a solução correta, continuando o trabalho independente dessa resposta.

Faça um plano curto, implemente, execute verificações pertinentes e corrija falhas. Se surgir um bloqueio real, conclua a parte independente e registre o limite. Sucesso em Linux/macOS não comprova Windows; mocks não comprovam uma integração real. Não antecipe funcionalidades de outros tickets.

Tarefa: ALP-06 — Leitor PDF com retomada
Dependência: ALP-05.

Objetivo: transformar a área de documento em um leitor de PDF local real, vinculado à matéria, restaurando o arquivo e a página após troca ou reinicialização.

Implementação:
- Reutilize a seleção/referência de material e o checkpoint da mesa. Escolha uma biblioteca de leitura compatível com o projeto e confira sua documentação oficial.
- Abra o PDF autorizado, renderize páginas e permita navegar com controles claros. Mostre página atual e total; valide limites de página.
- Persista a página no contexto daquela matéria, sem misturar o documento ou a posição de outra mesa.
- Faça assets e workers necessários funcionarem também no empacotamento Electron. Não aceite uma configuração que funciona apenas no servidor de desenvolvimento.
- Mantenha a fronteira de arquivos autorizados: o leitor obtém o PDF pelo mecanismo local permitido, sem ganhar uma API genérica de acesso ao disco.
- Para arquivo movido/removido, mostre o estado e permita localizar o arquivo novamente, mantendo a associação do material quando apropriado. Para PDF inválido, mostre erro identificado.
- Os PDFs permanecem locais. A sincronização futura da nota não inclui o binário do documento. Não acrescente OCR, extração por IA ou anotações avançadas ao PDF nesta tarefa.

Critérios de conclusão:
C1. Mostra PDF real e permite navegar por páginas.
C2. Página atual é gravada no checkpoint.
C3. Voltar à matéria ou reabrir restaura documento e página.
C4. Arquivo ausente/movido tem estado claro e opção de localizar.
C5. PDF inválido produz erro identificado.
C6. Referência local e binário ficam separados da sincronização de notas.

Validação:
- Use um PDF de teste com pelo menos três páginas, identificado como fixture, e pare em página intermediária.
- Troque de matéria, volte, feche/reabra e confira arquivo e página. Teste documento diferente na segunda matéria para detectar mistura de contexto.
- Mova/remova uma cópia de teste e exercite localizar novamente. Tente abrir um arquivo inválido e confira erro sem perda da nota ou da mesa.
- Verifique o leitor em desenvolvimento e na build empacotada disponível. Se a prova Windows estiver pendente, deixe esse limite explícito; não confunda assets funcionando no navegador com empacotamento validado.

Documentação específica: biblioteca/versão do leitor, configuração de assets e comportamento de retomada.
Próxima tarefa na sequência: ALP-07.

Registro e resposta obrigatórios:
1. Atualize docs/status/ALPHA_STATE.md: ID, status, ambiente, dependências, critérios pendentes, próxima ação e tempo humano observado, se informado. Use “não informado” quando não houver medida; tempo da IA não é tempo de revisão humana.
2. Atualize docs/validation/ALPHA.md: por critério, aprovado, falhou ou não verificado, com comandos/roteiros realmente executados, resultado e evidência. Anote ambiente, versões e dados de teste.
3. Ajuste README e decisões quando o comportamento ou o setup mudar. Não copie segredos nem dados pessoais para documentação ou fixtures.
4. Responda com status, comportamento entregue, arquivos principais, verificações, pendências reproduzíveis e próxima ação. Use A fazer, Em andamento, Bloqueado, Parcial ou Concluído. Só use Concluído quando todos os critérios deste ticket estiverem demonstrados. Um comando sugerido deve aparecer separado de um comando executado.
5. Encerre na tarefa atual. Indique o próximo ticket; a execução dele será iniciada com seu próprio prompt.
```

## ALP-07 — Foco com pausa e estado persistente

```text
Implemente somente esta tarefa no projeto existente. Trabalhe até entregar um resultado verificável; um plano ou uma tela simulada não substitui a implementação.

Contexto: app pessoal de estudos, futuro open source e destaque de portfólio. Desktop Windows primeiro, com Electron, React, TypeScript e integrações locais Node. Markdown no vault é a fonte principal das notas; SQLite guarda referências, índices e estado. Supabase receberá uma cópia para consulta pelo celular. A mesa é sóbria, escura, com documentos centrais, barra lateral e dock; use controles com identidade própria. GSAP, Three.js, grafo, jogo, IA, agenda e projetos completos seguem o roadmap, além deste recorte inicial.

Antes de editar:
- Leia as instruções AGENTS.md aplicáveis, o estado do Git, os scripts e o lockfile. Preserve alterações existentes.
- Procure ARQUITETURA_APP_ESTUDOS.md, ROADMAP_V0_1.md e BACKLOG_ALPHA_SEMANAS_1_2.md no repositório, normalmente em docs/, ou nos anexos. Leia o ticket e as seções relevantes. Use rg para localizar código e contratos.
- Leia docs/status/ALPHA_STATE.md e docs/validation/ALPHA.md, se existirem. Confira as dependências no código e nas evidências; não confie apenas no rótulo de conclusão.
- Resolva escolhas reversíveis de implementação e registre-as. Peça informação apenas quando uma ausência material impedir a solução correta, continuando o trabalho independente dessa resposta.

Faça um plano curto, implemente, execute verificações pertinentes e corrija falhas. Se surgir um bloqueio real, conclua a parte independente e registre o limite. Sucesso em Linux/macOS não comprova Windows; mocks não comprovam uma integração real. Não antecipe funcionalidades de outros tickets.

Tarefa: ALP-07 — Foco com pausa e estado persistente
Dependência: ALP-05. Integre o painel de foco existente e o modelo de sessões/segmentos de ALP-03.

Objetivo: permitir duração escolhida pelo usuário, início, pausa, retomada e encerramento, com tempo ativo persistente.

Regra inicial do backlog:
- Ao fechar normalmente, pause e grave checkpoint.
- Após falha, recupere o último checkpoint disponível e mostre o estado recuperado.
- O tempo com o app fechado não é creditado automaticamente. Retomada após reabrir depende de ação do usuário.

Implementação:
- Permita escolher uma duração válida por sessão; não imponha Pomodoro fixo.
- Modele estados e segmentos de atividade. Pausa/resume pertence ao mesmo ID de sessão, sem duplicar o registro.
- Calcule tempo ativo a partir dos segmentos e de uma referência de tempo adequada, em vez de somar segundos a cada callback. Re-renderizar ou perder foco não pode reiniciar nem distorcer a sessão.
- Persista os checkpoints necessários e explicite a precisão da recuperação após encerramento inesperado.
- Encerrar grava duração escolhida, tempo ativo e resultado básico. Defina o comportamento quando a duração termina, sem começar outro ciclo automaticamente.
- Preserve nota, PDF e seleção da matéria durante as interações. Se trocar de matéria, deixe claro a qual matéria a sessão pertence.
- Não implemente XP, streak, recompensas, planejamento automático ou KPIs de aprendizagem neste ticket.

Critérios de conclusão:
C1. Usuário escolhe duração e inicia.
C2. Pausa interrompe tempo ativo; retomada conserva o registro.
C3. Encerramento persiste tempo ativo e resultado básico.
C4. Reabrir recupera estado e aplica a regra explícita para o intervalo fechado.
C5. Tempo dos segmentos se mantém correto com a janela sem foco.
C6. Interagir conserva nota e documento abertos.

Validação:
- Faça uma sessão curta, pause, aguarde um intervalo observável, retome e encerre. Compare tempo observado, tempo exibido e tempo persistido, indicando tolerância.
- Feche normalmente durante uma sessão, reabra e confirme a pausa, a identidade e a ausência de crédito pelo intervalo fechado.
- Exercite recuperação de falha em uma instância de teste e registre o último checkpoint recuperado.
- Tire o foco da janela por parte da sessão e confira a contagem.
- Use teste do cálculo/estados se necessário para validar os riscos de tempo; não trate uma contagem visual animada como evidência de persistência.

Documentação específica: estados, unidades, política de fechamento e recuperação.
Próxima tarefa na sequência: ALP-08.

Registro e resposta obrigatórios:
1. Atualize docs/status/ALPHA_STATE.md: ID, status, ambiente, dependências, critérios pendentes, próxima ação e tempo humano observado, se informado. Use “não informado” quando não houver medida; tempo da IA não é tempo de revisão humana.
2. Atualize docs/validation/ALPHA.md: por critério, aprovado, falhou ou não verificado, com comandos/roteiros realmente executados, resultado e evidência. Anote ambiente, versões e dados de teste.
3. Ajuste README e decisões quando o comportamento ou o setup mudar. Não copie segredos nem dados pessoais para documentação ou fixtures.
4. Responda com status, comportamento entregue, arquivos principais, verificações, pendências reproduzíveis e próxima ação. Use A fazer, Em andamento, Bloqueado, Parcial ou Concluído. Só use Concluído quando todos os critérios deste ticket estiverem demonstrados. Um comando sugerido deve aparecer separado de um comando executado.
5. Encerre na tarefa atual. Indique o próximo ticket; a execução dele será iniciada com seu próprio prompt.
```

## ALP-08 — Checklist persistente por matéria

```text
Implemente somente esta tarefa no projeto existente. Trabalhe até entregar um resultado verificável; um plano ou uma tela simulada não substitui a implementação.

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
5. Encerre na tarefa atual. Indique o próximo ticket; a execução dele será iniciada com seu próprio prompt.
```

## ALP-09 — Primeiro espelho autenticado na nuvem

```text
Implemente somente esta tarefa no projeto existente. Trabalhe até entregar um resultado verificável; um plano ou uma tela simulada não substitui a implementação.

Contexto: app pessoal de estudos, futuro open source e destaque de portfólio. Desktop Windows primeiro, com Electron, React, TypeScript e integrações locais Node. Markdown no vault é a fonte principal das notas; SQLite guarda referências, índices e estado. Supabase receberá uma cópia para consulta pelo celular. A mesa é sóbria, escura, com documentos centrais, barra lateral e dock; use controles com identidade própria. GSAP, Three.js, grafo, jogo, IA, agenda e projetos completos seguem o roadmap, além deste recorte inicial.

Antes de editar:
- Leia as instruções AGENTS.md aplicáveis, o estado do Git, os scripts e o lockfile. Preserve alterações existentes.
- Procure ARQUITETURA_APP_ESTUDOS.md, ROADMAP_V0_1.md e BACKLOG_ALPHA_SEMANAS_1_2.md no repositório, normalmente em docs/, ou nos anexos. Leia o ticket e as seções relevantes. Use rg para localizar código e contratos.
- Leia docs/status/ALPHA_STATE.md e docs/validation/ALPHA.md, se existirem. Confira as dependências no código e nas evidências; não confie apenas no rótulo de conclusão.
- Resolva escolhas reversíveis de implementação e registre-as. Peça informação apenas quando uma ausência material impedir a solução correta, continuando o trabalho independente dessa resposta.

Faça um plano curto, implemente, execute verificações pertinentes e corrija falhas. Se surgir um bloqueio real, conclua a parte independente e registre o limite. Sucesso em Linux/macOS não comprova Windows; mocks não comprovam uma integração real. Não antecipe funcionalidades de outros tickets.

Tarefa: ALP-09 — Primeiro espelho autenticado na nuvem
Dependência: ALP-04. Use contratos, fila/estado e persistência de ALP-03. A execução numérica ocorre após ALP-08, mas mesa, PDF e timer não são dependências do protocolo de notas.

Objetivo: enviar um snapshot versionado de Markdown a Supabase e consultá-lo em uma página web autenticada, disponível independentemente do PC.

Dependências externas: projeto Supabase e hospedagem web gerenciada com HTTPS. Use configuração e ambiente explicitamente fornecidos para esta tarefa. Se estiverem ausentes, complete código, migrações e verificações locais independentes, documente a configuração necessária e mantenha a prova externa pendente. Não solicite chaves secretas em texto na conversa.

Implementação:
- Inspecione os serviços já configurados e confira a documentação oficial necessária. Entregue migrações reproduzíveis, Auth e políticas por proprietário. Preserve tabelas/dados existentes.
- Reutilize autenticação existente; se não existir, escolha e documente um fluxo mínimo apropriado ao espaço pessoal. A interface web precisa reconhecer o proprietário autenticado.
- Depois de um salvamento local confirmado, gere operação persistida com ID estável, nota, proprietário, revisão e hash. Defina exatamente o conteúdo coberto pelo hash e a regra de revisão.
- Publique snapshot do Markdown e metadados necessários. O arquivo local continua a fonte principal; este recorte web permite consulta.
- Torne o reenvio idempotente: a mesma operação conserva identidade, resultado/recibo e uma única nota lógica. Uma confirmação remota deve atualizar o estado local somente depois da resposta real.
- Evite que uma operação antiga substitua um snapshot mais novo. Rejeição ou conflito precisa ficar visível; não sobrescreva a nota local silenciosamente.
- Mostre pendente, confirmado e erro, com tentativa de novo envio. Perda de rede/credencial inválida conserva o arquivo e a operação.
- Crie a tela web mínima de consulta responsiva, com autenticação e renderização adequada do Markdown. Trate o conteúdo como dado e não execute HTML/scripts arbitrários.
- Envie notas/metadados, mantendo PDFs e projetos no PC. Não sincronize o banco SQLite inteiro.
- Separe configuração pública do cliente de credenciais de servidor. Segredos não entram no bundle público, Git, logs ou fixtures. Não acrescente OpenRouter, notificações ou agenda neste ticket.
- Use a hospedagem gerenciada disponibilizada. Documente build, variáveis e configuração; prova servida apenas pelo desktop/localhost não demonstra independência do PC.

Critérios de conclusão:
C1. Configuração identifica projeto e usuário autorizado.
C2. Salvar gera operação rastreável com ID, hash e revisão.
C3. Interface informa confirmação, pendência ou erro reais.
C4. Reenviar a mesma operação conserva uma nota lógica e o mesmo resultado de processamento.
C5. Proprietário autenticado consulta snapshot pela web.
C6. Outra identidade não acessa aquela nota nos casos testados.
C7. Com desktop desligado, a última versão confirmada segue consultável.
C8. Apenas nota e metadados necessários são enviados; PDF permanece local.
C9. Credenciais de servidor e segredos estão fora do cliente público e do repositório.

Validação:
- Use notas/contas de teste. Salve duas revisões e registre IDs, hashes, revisão remota e confirmação local.
- Reenvie a mesma operação e confira recibo/quantidade de notas; exercite envio atrasado e falha recuperável.
- Confira políticas com proprietário, usuário diferente e sessão não autenticada, incluindo tentativa direta por ID. Resultado de UI escondida não comprova bloqueio de acesso.
- Abra a página HTTPS no celular com o desktop desligado e registre URL/ambiente, revisão exibida e resultado. Não registre tokens.
- Inspecione os arquivos enviados e o bundle/configuração quanto à separação de segredos.
- Diferencie teste local, integração em serviço real e consulta com PC desligado. Se algum critério não puder ser demonstrado, use Parcial/Bloqueado com a pendência exata.

Documentação específica: migrações, variáveis exemplificadas sem valores secretos, protocolo/reenvio, Auth/políticas e setup web.
Próxima tarefa na sequência: ALP-10.

Registro e resposta obrigatórios:
1. Atualize docs/status/ALPHA_STATE.md: ID, status, ambiente, dependências, critérios pendentes, próxima ação e tempo humano observado, se informado. Use “não informado” quando não houver medida; tempo da IA não é tempo de revisão humana.
2. Atualize docs/validation/ALPHA.md: por critério, aprovado, falhou ou não verificado, com comandos/roteiros realmente executados, resultado e evidência. Anote ambiente, versões e dados de teste.
3. Ajuste README e decisões quando o comportamento ou o setup mudar. Não copie segredos nem dados pessoais para documentação ou fixtures.
4. Responda com status, comportamento entregue, arquivos principais, verificações, pendências reproduzíveis e próxima ação. Use A fazer, Em andamento, Bloqueado, Parcial ou Concluído. Só use Concluído quando todos os critérios deste ticket estiverem demonstrados. Um comando sugerido deve aparecer separado de um comando executado.
5. Encerre na tarefa atual. Indique o próximo ticket; a execução dele será iniciada com seu próprio prompt.
```

## ALP-10 — Verificação do fluxo completo e recuperação

```text
Implemente somente esta tarefa no projeto existente. Trabalhe até entregar um resultado verificável; um plano ou uma tela simulada não substitui a implementação.

Contexto: app pessoal de estudos, futuro open source e destaque de portfólio. Desktop Windows primeiro, com Electron, React, TypeScript e integrações locais Node. Markdown no vault é a fonte principal das notas; SQLite guarda referências, índices e estado. Supabase receberá uma cópia para consulta pelo celular. A mesa é sóbria, escura, com documentos centrais, barra lateral e dock; use controles com identidade própria. GSAP, Three.js, grafo, jogo, IA, agenda e projetos completos seguem o roadmap, além deste recorte inicial.

Antes de editar:
- Leia as instruções AGENTS.md aplicáveis, o estado do Git, os scripts e o lockfile. Preserve alterações existentes.
- Procure ARQUITETURA_APP_ESTUDOS.md, ROADMAP_V0_1.md e BACKLOG_ALPHA_SEMANAS_1_2.md no repositório, normalmente em docs/, ou nos anexos. Leia o ticket e as seções relevantes. Use rg para localizar código e contratos.
- Leia docs/status/ALPHA_STATE.md e docs/validation/ALPHA.md, se existirem. Confira as dependências no código e nas evidências; não confie apenas no rótulo de conclusão.
- Resolva escolhas reversíveis de implementação e registre-as. Peça informação apenas quando uma ausência material impedir a solução correta, continuando o trabalho independente dessa resposta.

Faça um plano curto, implemente, execute verificações pertinentes e corrija falhas. Se surgir um bloqueio real, conclua a parte independente e registre o limite. Sucesso em Linux/macOS não comprova Windows; mocks não comprovam uma integração real. Não antecipe funcionalidades de outros tickets.

Tarefa: ALP-10 — Verificação do fluxo completo e recuperação
Dependências: ALP-06, ALP-07, ALP-08 e ALP-09, além de suas dependências transitivas.

Objetivo: executar a jornada integrada da alpha na build usada para avaliação, corrigir problemas que impeçam o uso e registrar limites com evidência. Não basta revisar o código ou repetir o status dos tickets.

Preparação:
- Confira código, evidências e versão da build. Se houver dependência parcial, execute a parte verificável da jornada e mantenha os passos afetados como não verificados.
- Use vault, banco, PDFs e contas de teste isolados, com cópias recuperáveis. Registre sistema, versão do app, artefato e comandos de preparação.
- Ajuste somente falhas dentro do escopo desta alpha. Não comece módulos das semanas seguintes para contornar um problema.

Roteiro principal:
R1. Criar duas matérias.
R2. Na primeira, abrir PDF real, ir a uma página intermediária, editar/salvar nota, criar tarefa com etapas e iniciar foco com duração escolhida.
R3. Pausar foco e marcar uma etapa.
R4. Trocar para a segunda matéria e estabelecer nota, documento, página e layout diferentes.
R5. Fechar o aplicativo e abrir a mesma build novamente.
R6. Conferir, por matéria, IDs, nota, arquivo/página, layout, checklist, próxima ação e estado/tempo de foco.
R7. Alterar a nota externamente e conferir detecção. Verificar também conflito com edição local pendente.
R8. Sincronizar uma revisão, desligar o desktop e consultar essa nota pela página web no celular.

Casos de recuperação:
- Arquivo ausente ou inválido, falha controlada de escrita e erro de sincronização devem produzir estado visível e conservar dados recuperáveis.
- Confira que pausa e intervalo fechado não foram contados como tempo ativo e que repetir o envio não duplicou a nota.
- Ao encontrar defeito, registre reprodução, impacto e causa conhecida; corrija e repita o passo afetado e as verificações relacionadas. Não refaça toda a suíte sem motivo.

Critérios de conclusão:
C1. A jornada principal passa na build usada para a alpha, incluindo Windows.
C2. Nenhum resultado confirmado sofre perda silenciosa no roteiro verificado.
C3. Falhas de arquivo e sincronização ficam visíveis, com dados recuperáveis.
C4. Problemas remanescentes têm reprodução, impacto e próximo passo.
C5. Relatório separa passos aprovados, falhas e não verificados.

Evidência:
- Em docs/validation/ALPHA.md, registre resultado por R1–R8 e por caso de recuperação, ambiente/build, dados usados, resultado observado e evidência local.
- Comandos e testes automatizados podem apoiar o roteiro, mas não substituem a prova da build Windows, da UI ou da consulta com PC desligado.
- Captura/vídeo curto é opcional e complementar. Não declare “tudo passou” se os passos externos não foram executados.
- Quando o ambiente impedir uma prova, forneça o roteiro preciso para concluí-la, com estado esperado. O ticket permanece Parcial; não aceite automaticamente os critérios ausentes.

Documentação específica: relatório integrado e defeitos/limites remanescentes.
Próxima tarefa na sequência: ALP-11, para organizar o checkpoint.

Registro e resposta obrigatórios:
1. Atualize docs/status/ALPHA_STATE.md: ID, status, ambiente, dependências, critérios pendentes, próxima ação e tempo humano observado, se informado. Use “não informado” quando não houver medida; tempo da IA não é tempo de revisão humana.
2. Atualize docs/validation/ALPHA.md: por critério, aprovado, falhou ou não verificado, com comandos/roteiros realmente executados, resultado e evidência. Anote ambiente, versões e dados de teste.
3. Ajuste README e decisões quando o comportamento ou o setup mudar. Não copie segredos nem dados pessoais para documentação ou fixtures.
4. Responda com status, comportamento entregue, arquivos principais, verificações, pendências reproduzíveis e próxima ação. Use A fazer, Em andamento, Bloqueado, Parcial ou Concluído. Só use Concluído quando todos os critérios deste ticket estiverem demonstrados. Um comando sugerido deve aparecer separado de um comando executado.
5. Encerre na tarefa atual. Indique o próximo ticket; a execução dele será iniciada com seu próprio prompt.
```

## ALP-11 — Setup, decisões e retomada

```text
Implemente somente esta tarefa no projeto existente. Trabalhe até entregar um resultado verificável; um plano ou uma tela simulada não substitui a implementação.

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
5. Encerre na tarefa atual. Indique o próximo ticket; a execução dele será iniciada com seu próprio prompt.
```
