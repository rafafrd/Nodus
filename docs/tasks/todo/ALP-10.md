---
id: ALP-10
status: todo
outcome: a_fazer
depends_on: ["ALP-06","ALP-07","ALP-08","ALP-09"]
criteria_count: 5
---

# ALP-10 — Verificação do fluxo completo e recuperação

Estado inicial: A fazer. Dependências: ALP-06, ALP-07, ALP-08, ALP-09. Os critérios e as verificações estão no prompt abaixo. A evidência canônica fica em docs/validation/ALPHA.md, na seção ALP-10.

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
5. Registre o resultado do ticket e a próxima ação. Quando a sessão tiver autorização para executar a alpha em sequência, continue automaticamente no próximo ticket cujas dependências técnicas estejam satisfeitas. Caso contrário, encerre no ticket solicitado. Provas pendentes continuam explícitas e não são aprovadas por avançar.
```

## Execução e retomada

Ambiente/versões: não informado. Alterações: nenhuma. Verificações do app: não executadas. Tempo humano: não informado. Bloqueio atual: nenhum verificado, sem dispensar a conferência das dependências. Próxima ação: iniciar conforme a sequência e condições do ticket.

Atualize este registro com comportamento entregue, arquivos, comandos/roteiros executados, resultados e critérios pendentes. Não transforme comandos sugeridos em evidência de execução.
