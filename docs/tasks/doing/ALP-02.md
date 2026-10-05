---
id: ALP-02
status: doing
outcome: parcial
depends_on: ["ALP-01"]
criteria_count: 6
---

# ALP-02 — Prova de compatibilidade do editor Markdown

Estado inicial: A fazer. Dependências: ALP-01. Os critérios e as verificações estão no prompt abaixo. A evidência canônica fica em docs/validation/ALPHA.md, na seção ALP-02.

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
5. Registre o resultado do ticket e a próxima ação. Quando a sessão tiver autorização para executar a alpha em sequência, continue automaticamente no próximo ticket cujas dependências técnicas estejam satisfeitas. Caso contrário, encerre no ticket solicitado. Provas pendentes continuam explícitas e não são aprovadas por avançar.
```

## Execução e retomada

Registro atualizado: consulte os checkpoints abaixo e a seção deste ticket em docs/validation/ALPHA.md. Tempo humano: não informado. Critérios pendentes e próxima ação em docs/status/ALPHA_STATE.md.

Atualize este registro com comportamento entregue, arquivos, comandos/roteiros executados, resultados e critérios pendentes. Não transforme comandos sugeridos em evidência de execução.

### Checkpoint 02/10/2026

Avaliar Tiptap e integrar editor com preservação de bytes e prévia. Tempo humano: não informado.

### Checkpoint 02/10/2026

Editor assistido preservador integrado; C5 externo pendente. Prosseguir ALP-03 independente dessa prova. Tempo humano: não informado.
