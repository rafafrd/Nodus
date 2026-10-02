---
id: ALP-01
status: done
outcome: concluido
depends_on: []
criteria_count: 5
---

# ALP-01 — Fundação executável no Windows

Estado inicial: A fazer. Dependências: nenhuma. Os critérios e as verificações estão no prompt abaixo. A evidência canônica fica em docs/validation/ALPHA.md, na seção ALP-01.

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
5. Registre o resultado do ticket e a próxima ação. Quando a sessão tiver autorização para executar a alpha em sequência, continue automaticamente no próximo ticket cujas dependências técnicas estejam satisfeitas. Caso contrário, encerre no ticket solicitado. Provas pendentes continuam explícitas e não são aprovadas por avançar.
```

## Execução e retomada

Registro atualizado: consulte os checkpoints abaixo e a seção deste ticket em docs/validation/ALPHA.md. Tempo humano: não informado. Critérios pendentes e próxima ação em docs/status/ALPHA_STATE.md.

Atualize este registro com comportamento entregue, arquivos, comandos/roteiros executados, resultados e critérios pendentes. Não transforme comandos sugeridos em evidência de execução.

### Checkpoint 02/10/2026

Fundação Electron/React/TypeScript; instalação e prova Windows em execução. Tempo humano: não informado.

### Checkpoint 02/10/2026

Fundação verificada no Windows; próximo ALP-02, prova do editor preservador. Tempo humano: não informado.
