---
id: ALP-05
status: todo
outcome: a_fazer
depends_on: ["ALP-04"]
criteria_count: 7
---

# ALP-05 — Mesa persistente por matéria

Estado inicial: A fazer. Dependências: ALP-04. Os critérios e as verificações estão no prompt abaixo. A evidência canônica fica em docs/validation/ALPHA.md, na seção ALP-05.

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
5. Registre o resultado do ticket e a próxima ação. Quando a sessão tiver autorização para executar a alpha em sequência, continue automaticamente no próximo ticket cujas dependências técnicas estejam satisfeitas. Caso contrário, encerre no ticket solicitado. Provas pendentes continuam explícitas e não são aprovadas por avançar.
```

## Execução e retomada

Ambiente/versões: não informado. Alterações: nenhuma. Verificações do app: não executadas. Tempo humano: não informado. Bloqueio atual: nenhum verificado, sem dispensar a conferência das dependências. Próxima ação: iniciar conforme a sequência e condições do ticket.

Atualize este registro com comportamento entregue, arquivos, comandos/roteiros executados, resultados e critérios pendentes. Não transforme comandos sugeridos em evidência de execução.
