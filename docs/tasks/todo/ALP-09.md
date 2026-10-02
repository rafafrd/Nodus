---
id: ALP-09
status: todo
outcome: a_fazer
depends_on: ["ALP-04"]
criteria_count: 9
---

# ALP-09 — Primeiro espelho autenticado na nuvem

Estado inicial: A fazer. Dependências: ALP-04. Os critérios e as verificações estão no prompt abaixo. A evidência canônica fica em docs/validation/ALPHA.md, na seção ALP-09.

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
5. Registre o resultado do ticket e a próxima ação. Quando a sessão tiver autorização para executar a alpha em sequência, continue automaticamente no próximo ticket cujas dependências técnicas estejam satisfeitas. Caso contrário, encerre no ticket solicitado. Provas pendentes continuam explícitas e não são aprovadas por avançar.
```

## Execução e retomada

Registro atualizado: consulte os checkpoints abaixo e a seção deste ticket em docs/validation/ALPHA.md. Tempo humano: não informado. Critérios pendentes e próxima ação em docs/status/ALPHA_STATE.md.

Atualize este registro com comportamento entregue, arquivos, comandos/roteiros executados, resultados e critérios pendentes. Não transforme comandos sugeridos em evidência de execução.
