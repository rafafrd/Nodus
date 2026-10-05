# Backlog da primeira alpha — semanas 1 e 2

Versão: 0.1  
Data: 01/10/2026, America/Sao_Paulo  
Base: ARQUITETURA_APP_ESTUDOS.md e ROADMAP_V0_1.md, plano 0.2  
Status: backlog proposto. As tarefas estão a fazer; implementação e testes do aplicativo ainda não foram executados nesta conversa.

## 1. Resultado esperado e capacidade

A primeira alpha deve servir a uma sessão pessoal: escolher uma matéria, abrir PDF e nota, registrar etapas, usar o foco e retomar esse contexto após fechar o aplicativo. Uma nota sincronizada deve ser consultável por uma interface web independente do desktop.

O objetivo da semana 1 é assegurar que o app abre no Windows, persiste sua estrutura e preserva Markdown. A semana 2 conecta essa fundação à mesa e à primeira consulta na nuvem.

A capacidade de revisão, configuração e uso é de até 6 horas nas duas semanas. As alocações abaixo são reservas de atenção humana, não estimativas de que toda implementação caiba nesse tempo. A IA pode gerar código durante outros períodos, mas a aceitação de cada tarefa exige evidência.

Se o bloco reservado terminar com um problema aberto, registrar a falha e continuar a tarefa na próxima janela. O prazo do roadmap se ajusta para preservar as funcionalidades escolhidas.

### Escopo dessa alpha

| Funcionalidade | Profundidade inicial |
| --- | --- |
| Matérias | Criar e alternar entre matérias; testar pelo menos duas |
| Notas | Arquivos Markdown, editor visual, salvamento e alterações externas |
| Mesa | Documento e nota lado a lado; tamanho dos painéis e contexto por matéria |
| PDF | Abrir arquivo local, navegar por páginas e restaurar a página |
| Foco | Duração escolhida, início, pausa, retomada e encerramento |
| Checklist | Criar etapas e preservar as etapas concluídas |
| Nuvem | Sincronizar uma nota com identidade/revisão e consultá-la com autenticação |
| Interface | Direção sóbria do observatório, barra lateral e ferramentas claras |
| Distribuição | Prova inicial de build Windows; publicação fica nas etapas posteriores |

Tutor, geração por IA, revisões, Google Agenda e notificações seguem as próximas etapas do roadmap. Grafo 3D, farm/loja/builds e programação JS/TS permanecem na primeira versão pública.

## 2. Ordem das tarefas e reserva de revisão

Todas começam com status “A fazer”.

| ID | Semana | Tarefa | Dependências | Reserva humana |
| --- | --- | --- | --- | --- |
| ALP-01 | 1 | Fundação executável no Windows | — | 40 min |
| ALP-02 | 1 | Prova de compatibilidade do editor Markdown | ALP-01 | 45 min |
| ALP-03 | 1 | Contratos e persistência local mínima | ALP-01 | 30 min |
| ALP-04 | 1 | Vault e integração de salvar/reabrir notas | ALP-02, ALP-03 | 45 min |
| ALP-05 | 2 | Mesa persistente por matéria | ALP-04 | 35 min |
| ALP-06 | 2 | Leitor PDF com retomada | ALP-05 | 20 min |
| ALP-07 | 2 | Foco com pausa e estado persistente | ALP-05 | 20 min |
| ALP-08 | 2 | Checklist persistente por matéria | ALP-05 | 15 min |
| ALP-09 | 2 | Primeiro espelho autenticado na nuvem | ALP-04 | 45 min |
| ALP-10 | 2 | Verificação do fluxo completo e recuperação | ALP-06, ALP-07, ALP-08, ALP-09 | 30 min |
| ALP-11 | 1 e 2 | Setup, decisões e registro da validação | ALP-01 | 35 min |

ALP-11 recebe 20 minutos na semana 1 e 15 minutos na semana 2. A soma é 180 minutos por semana e 360 minutos no total. A documentação é atualizada à medida que as tarefas avançam; essa última reserva organiza o material para retomada.

A ordem cronológica sugerida é ALP-01 → ALP-02 → ALP-03 → ALP-04 → ALP-05 → ALP-06 → ALP-07 → ALP-08 → ALP-09 → ALP-10. As dependências indicam o que precisa estar estável antes de aceitar cada entrega.

## 3. Tarefas e critérios de conclusão

### ALP-01 — Fundação executável no Windows

**Entrega:** uma base Electron, React e TypeScript que inicia no Windows, com separação entre processo principal, preload e interface. O identificador temporário do projeto pode ser “app-estudos”; nome e marca continuam pendentes.

**Escopo:** estrutura mínima de apps/pacotes, scripts, lockfile, configuração de desenvolvimento e build. Criar os contratos iniciais de comunicação, sem implementar módulos futuros.

**Critérios de conclusão:**
1. Os comandos documentados de instalação, execução e verificação de tipos funcionam.
2. A janela inicia, pode ser fechada e reaberta sem erro de inicialização.
3. Uma operação de IPC que identifica a versão real do aplicativo percorre a interface, o preload e o serviço local, com tipos e validação de argumentos.
4. APIs privilegiadas são expostas por operações específicas; conteúdo de previews futuros terá uma superfície própria.
5. Uma build empacotada inicia no Windows. Eventual falha é registrada com causa e próximo passo, mantendo esse critério pendente.

**Evidência:** comandos executados, versões escolhidas, resultado de desenvolvimento e resultado da build. Uma falha de build conserva a tarefa parcial.

### ALP-02 — Prova de compatibilidade do editor Markdown

**Entrega:** escolher o editor visual a partir de uma prova de abrir, editar, salvar e reabrir conteúdo representativo.

Tiptap é candidato, com integração Markdown documentada como beta [B1]. A tarefa deve verificar a compatibilidade antes de expandir extensões. Se a prova falhar, registrar o caso e avaliar uma alternativa na mesma tarefa.

**Amostra de validação:** título, parágrafos, listas, checklist, link relativo, wikilink, tabela, código, fórmula e frontmatter com um campo desconhecido pelo app. O conjunto corresponde à portabilidade prevista no roadmap.

**Critérios de conclusão:**
1. Botões ou comandos permitem editar os elementos suportados sem escrever Markdown manualmente.
2. Abrir e salvar conserva o sentido do conteúdo, as referências e os metadados.
3. Alterar uma frase conserva as demais partes da amostra.
4. Elementos ainda incompatíveis são identificados; salvar deve preservar seu conteúdo ou impedir uma conversão destrutiva.
5. A nota continua utilizável no Obsidian ou em outro editor de Markdown.
6. A decisão registra os casos aprovados, limitações e motivo da escolha.

**Evidência:** amostra antes/depois, diff e decisão do editor. Mudanças de espaços podem ser aceitáveis; perda de conteúdo ou metadados exige correção.

### ALP-03 — Contratos e persistência local mínima

**Entrega:** tipos, schemas e armazenamento SQLite suficientes para a alpha.

**Modelo mínimo proposto:**
- Matéria: ID estável, nome e configuração visual básica.
- Referência de nota: ID, matéria, caminho relativo, hash e título derivados do arquivo.
- Material local: ID, matéria e referência ao PDF.
- Mesa: matéria, nota/material ativos, página e configuração dos painéis.
- Sessão de foco: ID, duração escolhida, estado e segmentos de tempo ativo.
- Tarefa e etapa: IDs, matéria, texto e estado de conclusão.
- Operação de sincronização: ID, nota/revisão, estado e resultado.

O corpo Markdown fica no arquivo. SQLite guarda índices, referências e estado; o conteúdo da nota permanece a fonte principal.

**Critérios de conclusão:**
1. Primeiro início cria o armazenamento e registra a versão do schema.
2. Criar duas matérias, fechar e reabrir conserva seus dados e IDs.
3. Alterar o nome da matéria conserva seus vínculos.
4. Dados inválidos recebem erro identificado, sem gravação parcial silenciosa.
5. As operações expostas à interface validam identidade e argumentos.
6. A camada de persistência fica separada dos componentes visuais.

**Evidência:** dados antes/depois da reinicialização, versão do schema e resultado da validação de uma entrada inválida.

### ALP-04 — Vault e salvar/reabrir notas

**Entrega:** escolher o diretório do vault, criar uma nota, editar visualmente e gravar Markdown.

**Critérios de conclusão:**
1. A nota criada contém ID persistente e sua associação com a matéria.
2. Salvar conserva frontmatter desconhecido, referências e conteúdo aprovado em ALP-02.
3. Fechar e reabrir restaura o texto a partir do arquivo.
4. Uma alteração por editor externo é detectada e atualiza o app quando a nota está limpa.
5. Se a nota tem alterações locais e o arquivo muda externamente, as duas versões são preservadas para reconciliação.
6. Reabrir o mesmo arquivo conserva a identidade da nota.
7. Erro de escrita é mostrado e mantém o texto em edição recuperável.
8. Operações com arquivos respeitam o diretório selecionado e os caminhos autorizados.

**Evidência:** arquivo real, edição externa, caso de conflito e tentativa de salvamento com falha. A validação usa uma pasta de teste e cópias recuperáveis.

### ALP-05 — Mesa persistente por matéria

**Entrega:** interface de estudo com barra lateral, nota e documento lado a lado, ferramentas de foco e busca/contexto básico.

**Critérios de conclusão:**
1. Trocar de matéria restaura a nota e o documento daquela mesa.
2. Redimensionar os painéis conserva a preferência após reabrir.
3. Os textos e documentos continuam legíveis na direção visual sóbria escolhida.
4. Controles têm rótulos, foco de teclado e estados claros.
5. A ferramenta de foco pode ser aberta sem perder a edição da nota.
6. Fechar o app grava o checkpoint disponível; falhas de gravação são identificadas.
7. A estrutura permite inserir o tutor e outras ferramentas nas etapas seguintes.

**Evidência:** demonstração de duas matérias com documentos e tamanhos diferentes, incluindo fechar/reabrir.

### ALP-06 — Leitor PDF com retomada

**Entrega:** abrir um PDF local e manter seu contexto de leitura na matéria.

**Critérios de conclusão:**
1. O app mostra um PDF real e permite navegar por páginas.
2. A página atual pertence ao checkpoint da mesa.
3. Reabrir o app ou voltar à matéria restaura o documento e a página.
4. Um arquivo removido ou movido produz um estado claro com opção de localizar o arquivo.
5. Arquivo inválido produz erro identificado.
6. A referência local permanece separada da sincronização de notas.

**Evidência:** PDF de teste com pelo menos três páginas, retomada em uma página intermediária e resultado do caso de arquivo ausente.

### ALP-07 — Foco com pausa e estado persistente

**Entrega:** timer de sessão com duração escolhida pelo usuário.

**Critérios de conclusão:**
1. É possível escolher a duração e iniciar a sessão.
2. Pausa interrompe a contagem de tempo ativo; retomada continua o mesmo registro.
3. Encerramento grava o tempo ativo e o resultado básico da sessão.
4. Reabrir o app recupera o estado persistido; eventual intervalo com o app fechado aparece conforme regra explicitada.
5. A contagem depende do tempo dos segmentos, com comportamento conferido quando a janela perde foco.
6. Interagir com o timer conserva nota e documento abertos.

**Regra inicial proposta:** ao fechar o app normalmente, pausar a sessão e gravar um checkpoint. Após falha, recuperar o último checkpoint disponível e mostrar o estado recuperado. Essa regra evita atribuir tempo de estudo sem uma sessão ativa.

**Evidência:** sessão curta com pausa, retomada, encerramento e reabertura. Registrar o tempo observado e o tempo armazenado.

### ALP-08 — Checklist persistente

**Entrega:** tarefa com etapas vinculada à matéria.

**Critérios de conclusão:**
1. Criar uma tarefa e adicionar pelo menos duas etapas.
2. Marcar e desmarcar uma etapa altera seu estado persistido.
3. Fechar, reabrir ou trocar de matéria conserva as etapas e suas associações.
4. A mesa mostra etapas concluídas e total de etapas.
5. O usuário pode ajustar o texto de uma etapa mantendo sua identidade.
6. O checkpoint identifica a tarefa ou próxima etapa escolhida para retomar.

**Evidência:** uma tarefa em cada matéria, com estados diferentes antes/depois de reiniciar.

### ALP-09 — Primeiro espelho autenticado na nuvem

**Entrega:** publicar uma cópia versionada de uma nota em Supabase e consultá-la por uma interface web mínima. O serviço web precisa estar disponível independentemente do PC para demonstrar o requisito.

**Escopo inicial:** autenticação, políticas por proprietário, snapshot de Markdown, identificação/revisão, estado de sincronização e tela de consulta. O restante do acesso mobile e as notificações chegam nas etapas seguintes.

**Critérios de conclusão:**
1. Configuração identifica o projeto e o usuário autorizado.
2. Salvar uma nota produz uma operação rastreável com ID, hash e revisão.
3. A interface informa confirmação, pendência ou erro de sincronização.
4. Enviar de novo a mesma operação mantém uma nota e o mesmo resultado de processamento.
5. O usuário autenticado consulta o snapshot pela interface web.
6. Outra identidade não consegue acessar aquela nota nos casos verificados.
7. Com o desktop desligado, a última versão confirmada continua consultável.
8. A sincronização envia a nota e os metadados necessários; o PDF permanece no PC.
9. Credenciais de servidor e segredos permanecem fora do cliente público e do repositório.

**Evidência:** revisão antes/depois, caso de reenvio, verificação de acesso com outra identidade e consulta pelo celular com o PC desligado.

**Dependências externas:** conta/projeto Supabase e hospedagem web gerenciada com HTTPS. Se configuração, disponibilidade ou autorização impedir a prova, a tarefa permanece parcial e o bloqueio entra no checkpoint.

### ALP-10 — Verificação do fluxo completo e recuperação

**Entrega:** verificar a jornada da alpha, registrar problemas e resolver os que impedem o uso.

**Roteiro principal:**
1. Criar duas matérias.
2. Na primeira, abrir um PDF, editar uma nota, criar etapas e iniciar foco.
3. Pausar e marcar uma etapa.
4. Trocar para a segunda matéria e estabelecer outro contexto.
5. Fechar o app e reabrir.
6. Conferir dados, documentos, página, tarefa e estado de foco em cada matéria.
7. Fazer alteração externa na nota e conferir detecção.
8. Sincronizar, desligar o desktop e consultar a nota pela web.

**Critérios de conclusão:**
- A jornada principal passa na build usada para a alpha.
- Nenhum resultado confirmado sofre perda silenciosa no roteiro verificado.
- Falhas de arquivo e de sincronização ficam visíveis, com dados recuperáveis.
- Problemas remanescentes têm reprodução, impacto e próximo passo.
- O relatório diferencia verificações concluídas, falhas e itens ainda não verificados.

**Evidência:** registro do roteiro com resultado por passo, versões e build. Uma captura ou vídeo curto pode complementar os arquivos e resultados.

### ALP-11 — Setup, decisões e retomada

**Entrega:** documentação curta para instalar, entender e continuar a alpha.

**Arquivos sugeridos para a implementação futura:**
- README: pré-requisitos, comandos e uso inicial.
- docs/decisions: escolha do editor, formato, persistência e contratos relevantes.
- docs/validation/ALPHA.md: evidências e pendências dos tickets.
- docs/status: etapa atual, próximos passos e bloqueios.

**Critérios de conclusão:**
1. O setup descreve os comandos realmente usados e as versões escolhidas.
2. Configurações exigidas estão listadas; segredos não aparecem na documentação.
3. Cada ticket tem status coerente com sua evidência.
4. A decisão do editor registra compatibilidades verificadas.
5. Um novo ciclo de trabalho encontra o que funciona, a próxima tarefa e os problemas abertos.
6. O checkpoint compara o tempo humano observado com a reserva disponível.

## 4. Regras de execução e aceitação

### Entrada de cada tarefa

O pedido para a IA precisa conter:
- ID, objetivo e dependências concluídas;
- arquivos e contratos atuais do projeto;
- resultado observável esperado;
- critérios de conclusão deste backlog;
- dados de teste e limites de alteração;
- documentação a atualizar.

A implementação deve seguir as dependências e produzir um fluxo verificável. Partes que exigem uma decisão nova ou uma configuração indisponível precisam aparecer no resultado.

### Evidência de saída

| Campo | Conteúdo esperado |
| --- | --- |
| Status | A fazer, em andamento, bloqueada, parcial ou concluída |
| Mudanças | Comportamento final e arquivos alterados |
| Verificações | Comandos/roteiros efetivamente executados e resultados |
| Dados usados | Arquivos, matérias e identidades de teste |
| Pendências | Falha reproduzível, impacto, dependência e próximo passo |
| Retomada | Próximo ticket ou continuação do ticket atual |

Dados demonstrativos podem facilitar a validação, desde que estejam identificados e usem os fluxos funcionais reais. Uma interface desenhada, um comando sugerido ou uma integração simulada não satisfazem os critérios de conclusão de uma integração funcional.

### Verificações prioritárias

- Manual: salvar/reabrir, edição externa, duas mesas, PDF, foco, checklist e consulta pelo celular.
- Automatizada quando útil: round-trip do Markdown, validação de argumentos, conflitos de versão, persistência e reenvio idempotente.
- A build Windows deve ser exercitada; sucesso em outro sistema não comprova esse comportamento.

As verificações devem atingir riscos reais da alpha. O conjunto pode crescer quando uma falha ou alteração justificar, mantendo o tempo de revisão concentrado nas jornadas críticas.

## 5. Checkpoints das duas semanas

### Fim da semana 1

Resultado desejado: app executável, editor com compatibilidade demonstrada, armazenamento inicial e nota salva/reaberta.

Registrar tempo de configuração, qualidade do código gerado, retrabalho e falhas do empacotamento. Editor incompatível ou salvamento inseguro mantêm o foco na fundação antes de ampliar a mesa.

### Fim da semana 2

Resultado desejado: uma sessão pessoal retomável e uma nota consultável na nuvem com o PC desligado.

Avaliar:
- Quais critérios realmente passaram?
- Quanto tempo humano foi consumido?
- Quais tarefas precisam continuar?
- A previsão das próximas etapas precisa mudar?

A decisão confirmada é preservar as funcionalidades escolhidas e estender o prazo quando necessário. A alpha progride por critérios de entrega, com datas revistas a partir da execução.

## 6. Referências técnicas da implementação

- [B1 — Tiptap: integração Markdown e limitações atuais](https://tiptap.dev/docs/editor/markdown)
- [Electron: modelo de processos](https://www.electronjs.org/docs/latest/tutorial/process-model)
- [Electron: fronteiras de segurança](https://www.electronjs.org/docs/latest/tutorial/security)
- [Electron: distribuição](https://www.electronjs.org/docs/latest/tutorial/distribution-overview)
- [Supabase: arquitetura e autenticação](https://supabase.com/docs/guides/getting-started/architecture)

As referências fundamentam capacidades das tecnologias. Tickets, alocações e critérios são propostas para esta alpha; as evidências serão produzidas durante a implementação.
