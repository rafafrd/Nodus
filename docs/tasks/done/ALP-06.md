---
id: ALP-06
status: done
outcome: concluido
depends_on: ["ALP-05"]
criteria_count: 6
---

# ALP-06 — Leitor PDF com retomada

Estado inicial: A fazer. Dependências: ALP-05. Os critérios e as verificações estão no prompt abaixo. A evidência canônica fica em docs/validation/ALPHA.md, na seção ALP-06.

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
5. Registre o resultado do ticket e a próxima ação. Quando a sessão tiver autorização para executar a alpha em sequência, continue automaticamente no próximo ticket cujas dependências técnicas estejam satisfeitas. Caso contrário, encerre no ticket solicitado. Provas pendentes continuam explícitas e não são aprovadas por avançar.
```

## Execução e retomada

Ambiente/versões: não informado. Alterações: nenhuma. Verificações do app: não executadas. Tempo humano: não informado. Bloqueio atual: nenhum verificado, sem dispensar a conferência das dependências. Próxima ação: iniciar conforme a sequência e condições do ticket.

Atualize este registro com comportamento entregue, arquivos, comandos/roteiros executados, resultados e critérios pendentes. Não transforme comandos sugeridos em evidência de execução.

### Checkpoint 02/10/2026

Leitor PDF local com worker empacotado, navegação e retomada. Tempo humano: não informado.

### Checkpoint 02/10/2026

Leitor PDF real verificado também empacotado Windows; próximo ALP-07, foco por segmentos. Tempo humano: não informado.
