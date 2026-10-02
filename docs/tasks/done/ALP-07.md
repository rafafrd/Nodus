---
id: ALP-07
status: done
outcome: concluido
depends_on: ["ALP-05"]
criteria_count: 6
---

# ALP-07 — Foco com pausa e estado persistente

Estado inicial: A fazer. Dependências: ALP-05. Os critérios e as verificações estão no prompt abaixo. A evidência canônica fica em docs/validation/ALPHA.md, na seção ALP-07.

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
5. Registre o resultado do ticket e a próxima ação. Quando a sessão tiver autorização para executar a alpha em sequência, continue automaticamente no próximo ticket cujas dependências técnicas estejam satisfeitas. Caso contrário, encerre no ticket solicitado. Provas pendentes continuam explícitas e não são aprovadas por avançar.
```

## Execução e retomada

Ambiente/versões: não informado. Alterações: nenhuma. Verificações do app: não executadas. Tempo humano: não informado. Bloqueio atual: nenhum verificado, sem dispensar a conferência das dependências. Próxima ação: iniciar conforme a sequência e condições do ticket.

Atualize este registro com comportamento entregue, arquivos, comandos/roteiros executados, resultados e critérios pendentes. Não transforme comandos sugeridos em evidência de execução.

### Checkpoint 02/10/2026

Foco por tempo monotônico, segmentos e checkpoint de recuperação. Tempo humano: não informado.

### Checkpoint 02/10/2026

Foco e recuperação verificados; próximo ALP-08, etapas e próxima ação. Tempo humano: não informado.
