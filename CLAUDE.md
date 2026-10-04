# CLAUDE.md — app de estudos

Versão: 1.1. Atualizado em 02/10/2026, America/Sao_Paulo. Projeto: app pessoal de estudos e produtividade, com futura publicação open source e destaque no portfólio. Nome temporário: app-estudos; não invente uma marca definitiva.

## Entrada e autoridade

Leia AGENTS.md, quando presente, antes de editar; ele mantém as instruções compartilhadas entre agentes. Este arquivo acrescenta contexto do produto e um guia de execução para Claude Code. Leia gotcha.md e docs/status/ALPHA_STATE.md, localize o ticket solicitado e confirme suas dependências no código e nas evidências.

O bootstrap evoluiu para o MVP local na branch MVP: Electron/React/TypeScript, vault, SQLite, mesa, PDF, foco e checklist. A alpha integral continua parcial; confira docs/status/ALPHA_STATE.md e as evidências em cada sessão. Preserve implementações e alterações já existentes; não recrie o projeto nem reponha status iniciais apenas porque documentos históricos dizem que a implementação não começou.

Solicitações atuais do usuário orientam o escopo. Documentação descreve intenção e decisões; scripts, lockfile, código e resultados demonstram o que existe. Uma divergência material precisa ser identificada e resolvida. Escolhas rotineiras e reversíveis podem ser feitas e registradas, sem perguntas desnecessárias.

## Produto e recortes

O app resolve materiais/notas espalhados, acúmulo de conteúdo antes da prova e dificuldade de retomar estudos. O usuário estuda no computador e consulta pelo celular. O espaço inicial é individual.

| Etapa | Resultado esperado |
| --- | --- |
| Alpha, ALP-01 a ALP-11 | Matérias, editor visual preservador, vault Markdown, SQLite, mesa por matéria, PDF, foco, checklist e snapshot web autenticado |
| Primeira versão pública | Núcleo ampliado de estudo/IA/planejamento, celular, grafo 3D, farm/loja/builds e projetos JS/TS com execução local e Git |
| Incrementos seguintes | Python, SQL, laboratórios locais CVE/CTF, formatos de prática e jogo ampliados |

Grafo e execução/Git de projetos permanecem no roadmap. GAM-01 antecipou cidade/farm/loja/memória/builds; GAM-02 acrescenta motor, QTE/skillcheck e Explorer com edição UTF-8 local, por pedidos explícitos. Esses incrementos não concluem a primeira pública. A disponibilidade humana é de até 3 h por semana. As reservas do backlog são atenção para configurar, orientar, revisar e testar, não duração garantida de implementação. Se os checkpoints atrasarem, preserve funcionalidades e revise o prazo. O ticket atual delimita o trabalho desta sessão.

## Direção técnica

| Parte | Direção definida | Conferência necessária |
| --- | --- | --- |
| Ambiente | Windows nativo primeiro; Node.js 24 como base do host; npm | Versões realmente instaladas, scripts e lockfile atuais |
| Desktop | Electron, React e TypeScript | Processo principal, preload, IPC e build Windows |
| Notas | Markdown canônico e editor visual | Preservação e compatibilidade real antes de escolher editor |
| Estado local | SQLite para referências, índices, mesa, sessões e operações | Schema/migrações e integridade dos dados |
| Consulta mobile | Supabase e interface web autenticada | Configuração real, políticas e acesso com PC desligado |
| Movimento | GSAP; Three.js para grafo e base | Aplicação conforme a etapa e a legibilidade |
| IA posterior | OpenRouter com chave própria e perfis | Modelos/limites reais, custos registrados e fontes verificáveis |
| Agenda posterior | Google Agenda, visível/editável no Calendário do iPhone | Vínculos estáveis e reconciliação de alterações externas |

A versão do Node do host e a versão embarcada no Electron são registros separados. Não importe stack ou convenções de outro projeto por familiaridade. Verifique documentação oficial ao usar APIs, dependências ou configurações ainda não comprovadas neste repositório.

Use os arquivos de configuração existentes. Por padrão, configuração local fica em .env quando a implementação precisar dela; não espalhe variáveis por novos arquivos sem necessidade. Exemplos/documentação não contêm segredos. A fundação não precisa de chave OpenRouter, conta Supabase ou Docker.

## Mapa de leitura

| Arquivo/pasta | Papel |
| --- | --- |
| AGENTS.md | Regras compartilhadas dos agentes |
| gotcha.md | Riscos previstos e ocorrências verificadas |
| docs/status/ALPHA_STATE.md | Retomada e resumo do estado |
| docs/tasks/todo, doing e done | Ticket canônico, prompt, critérios e execução |
| docs/validation/ALPHA.md | Resultado e evidência por critério |
| docs/architecture/ | Módulos, limites e autoridade dos dados |
| docs/sdd.md | Especificação de implementação |
| docs/adr/ | Decisões duradouras e seu estado |
| docs/decisions/ | Provas específicas, como a escolha do editor |
| docs/setup/ | Ambiente, Git e primeira sessão |
| docs/planning/ | Cópias históricas de arquitetura, roadmap, backlog e prompts |

Leia seletivamente o assunto da tarefa. Não carregue o planejamento completo e todos os prompts em cada sessão. Se um arquivo necessário faltar, localize a referência equivalente; se a ausência impedir correção, informe a lacuna sem inventar seu conteúdo.

## Rotina por tarefa

1. Inspecione git status, estrutura, scripts, lockfile e instruções aplicáveis. Use rg para localizar arquivos e contratos. Preserve alterações do usuário.
2. Leia o ticket solicitado, o estado, os gotchas pertinentes e as decisões relevantes. Identifique resultado observável, dependências e critérios.
3. Faça um plano curto. Comece apenas o ticket autorizado e atualize seu estado para doing/em_andamento.
4. Implemente incrementos funcionais. Execute verificações pertinentes, investigue falhas e corrija enquanto houver ação concreta para cumprir os critérios.
5. Quando um bloqueio real impedir parte da prova, conclua trabalho independente, preserve resultados e registre reprodução, impacto e próxima ação. Parcial ou bloqueado não é concluído.
6. Atualize ticket, evidência, retomada e documentos afetados. Revise o diff e encerre com o resultado real. Em pedido restrito a um ticket, indique o próximo sem iniciá-lo. Em pedido de alpha sequencial, continue conforme AGENTS.md, mantendo uma tarefa por vez e dependências verificadas.

Faça perguntas curtas quando faltar informação material sobre comportamento, dados ou ambiente. Não substitua uma integração funcional por uma simulação para encerrar o trabalho. Fixtures são permitidas quando identificadas e usadas pelo fluxo real. Delegação a outros agentes depende de solicitação explícita do usuário.

## Invariantes dos dados e integrações

Markdown é a fonte principal do corpo das notas. A representação de trabalho atual é fonte Markdown em CodeMirror, com prévia separada (ADR-0005). JSON de editor não é usado para salvar notas. Preserve frontmatter desconhecido, links, wikilinks, tabelas, fórmulas, código e conteúdo ainda não representável. Faça prova de abrir/salvar/reabrir e edição seletiva; a aparência do editor não comprova preservação.

Nota, matéria, tarefa, etapa, sessão e operação têm identidades estáveis. Renomear não pode romper vínculos. Hash, revisão, caminho e ID têm funções distintas. SQLite guarda estado/referências; migrações preservam dados. Rascunho de recuperação é distinguido da nota canônica.

Alteração externa atualiza nota limpa. Se existir edição local pendente, preserve ambas as versões e permita reconciliação. Erro de escrita deve ficar visível e conservar texto recuperável. Operações privilegiadas validam remetente, argumentos, entidades e caminhos autorizados.

A mesa pertence à matéria e recupera nota, documento, página, layout e próxima ação. Foco usa duração escolhida e segmentos de atividade: pausa não conta; fechamento normal pausa/grava; intervalo fechado não é creditado automaticamente; recuperação mostra o checkpoint disponível.

Snapshots de notas são confirmados por resposta real do servidor. Reenvio usa o mesmo ID e mantém o resultado de processamento. Operação atrasada não substitui revisão nova. Políticas precisam ser verificadas com proprietário, outra identidade e sessão não autenticada. PDFs, projetos e índice integral dos materiais permanecem locais.

## Aprendizagem, planejamento e jogo

XP e moedas ficam separados das evidências acadêmicas. Status de tópico depende do desempenho com critérios visíveis; confiança declarada pelo usuário é outro dado. Correções e explicações são consolidadas no fim da sessão; dificuldade é escolhida antes e revisões se ajustam ao desempenho.

O tutor usa referências conferíveis dos materiais e identifica complemento de conhecimento geral. Quando o usuário trava, ajuda com outro exemplo do conceito antes de voltar ao exercício. Templates de prompts não devem ser apresentados como treinamento ou fine tuning já implementado.

Planejamento preserva compromissos fixos, prioriza provas/entregas próximas e oferece plano essencial mostrando conteúdo excluído quando não couber. Mudança de horário pelo Google/iPhone é adotada e continua elegível para futuros reagendamentos.

Estudo e minigames podem gerar XP/moedas; respec é gratuito e a classe deriva da build. Primeiro jogo: Memória de Conceitos, sem limite de tempo, com pares conceito/definição, conceito/exemplo e fórmula/situação. Não acrescente regras de economia diferentes das escolhidas nem implemente o jogo durante tickets de fundação.

## Interface e capacidades locais

Mesa de estudo escura e sóbria: materiais grandes no centro, indicadores compactos nas bordas, barra lateral, dock, painéis encaixados e ferramentas flutuantes. Controles têm identidade própria, rótulos, foco e estados claros. Evite a aparência padrão de kits Radix/shadcn.

Grafo futuro e ampliação da base permitem cenários mais ricos; a vila isométrica local já existe em GAM-01/02. Grafo abre prévia lateral; base é isométrica. Animação não esconde erro, interrompe edição ou prejudica leitura. Celebração futura de conquista tem opção de pular.

A interface chama operações específicas do preload; não ganha acesso genérico ao disco ou execução. Preview futuro de projetos fica separado das APIs privilegiadas. Execução de projetos usa o ambiente local; laboratórios de vulnerabilidades conhecidas vêm depois, com Docker/WSL2 instalados pelo usuário e verificados pelo app.

Explorer atual é editor de fonte inerte para arquivos existentes, com pastas registradas, caminhos contidos, hash, backup e drafts. Não oferece terminal, execução ou Git de projetos. Ver ADR-0007 e evidências GAM-02.

## Quadro e evidências

| Pasta | status | outcome |
| --- | --- | --- |
| todo | todo | a_fazer |
| doing | doing | em_andamento, parcial ou bloqueado |
| done | done | concluido |

Um ID tem um arquivo no quadro. Atualize frontmatter, links e retomada ao mover. Done exige todos os critérios aprovados com evidência. Uma dependência com prova de ambiente pendente pode permitir trabalho independente; o critério ausente continua pendente.

Registre aprovado, falhou ou não verificado por critério. Anote comandos/roteiros realmente executados, sistema, versões/build, dados de teste, resultado e referência de evidência. Não invente execução, métricas, tempo humano, URLs ou disponibilidade de serviços.

node scripts/check-bootstrap.mjs verifica consistência documental. A aplicação precisa das próprias provas: preservação, persistência, contratos inválidos, conflito, tempo, reenvio, UI e build. Gere testes para riscos concretos; não espelhe componentes para aumentar quantidade. Sucesso em Linux não aprova Windows, e gerar instalador sem abri-lo não prova execução.

## Git e encerramento

Git do app, Git do vault e Git de cada projeto são separados. Use a branch de tarefa conforme o fluxo do repositório; selecione somente alterações pertinentes no stage. Commit, push e publicação seguem as instruções e autorizações do usuário, sem pedir novamente o que já foi autorizado. Preserve alterações existentes e configurações globais.

Não versionar vault pessoal, PDFs, bancos de usuário, chaves ou tokens. Ao mudar dependências, registre motivo/compatibilidade e atualize o lockfile correspondente. Não reescreva histórico, elimine trabalho ou publique serviços para esconder critérios pendentes.

Na resposta final da tarefa, apresente status, comportamento entregue, arquivos principais, verificações com resultados, pendências reproduzíveis e próxima ação. Atualize arquitetura/SDD/ADR quando a decisão ou comportamento mudar. Registre em gotcha.md ocorrências realmente observadas, separadas de riscos.

## Decisões ainda abertas

Nome/marca final, licença de publicação, prova externa do editor assistido (ALP-02/C5), hospedagem web, modelos/perfis concretos e valores de orçamento não foram fechados nesta base. Confirme decisões novas no repositório ou com o usuário quando elas forem necessárias ao ticket; não reabra escolhas já tomadas.

## Incremento MED-01

Links YouTube por matéria e seleção de material em SQLite v4; conteúdo remoto só após abrir o player. Cinema/PiP interno compartilham um WebContentsView isolado, sessão efêmera e sem preload/Node/bridge/protocolo de estudos. Main valida remetente e vínculo por matéria. Não conceder capacidades privilegiadas ao vídeo nem cobrir seus controles com overlays. PiP arrasta pelo cabeçalho próprio e continua nas outras áreas. Cinema exige gates dos listeners das áreas persistentes além de inert. Ver ADR-0008 e docs/validation/YOUTUBE.md; disponibilidade remota não equivale à preservação local dos links.

## Incremento CFG-01

Perfil/preferências locais usam settings.preferences no schema v4 existente. Seis IPCs específicos e strict preservam guarda sender/mainFrame/origem. Foto PNG/JPEG até5MiB/4MP/4096lado: dimensões antes do codec, decode/crop/resize nativo→PNG256; sem path/URL e sem nome/foto/caminho em audit. Salvamento transaciona preferences/audit. Defaults de JSON inválido não reescrevem raw no load.

PreferencesProvider carrega antes do App, confirma após IPC; CSS vars mudam três paletas sem remount. motionPreference combina off app/OS e limpa listeners; tempo essencial de foco/desafios/vídeo permanece. Quarta área deve conservar filas/rascunhos e gates de área/cinema. Gestão só enum data/vault e diretórios registrados; sem reset/updater/terminal. ADR-0009/SETTINGS registram provas e limites; audit independente tem fonte congelada distinta do pacote Windows do implementador.

## Incremento EXP-01

Exportar Markdown salvo de vault/projeto registrado em A4 preto. DTO discriminado/strict, raiz canônica/links/auxiliares negados, leituras limitadas UTF-8 sem alteração da fonte. HTML estático ReactMarkdown/GFM existente; conteúdo externo inerte. BrowserWindow oculto isolado/efêmero, sem JS/Node/preload, protocolo interno e requests restritos. Save em Downloads usa wx/fsync/close e audit opaco de sucesso; falha de audit remove somente saída nova. FS/DB não são uma transação conjunta. Guia/ADR-0010/PDF_EXPORT registram escopo, limites e provas próprias; schema4/deps conservados.

## NXT-01 — Expansão local

Schema5 adiciona revisão manual/ratings versionados e idempotentes, marks por SHA256 e momentos/relações, sem reset ou conversão Markdown. Catálogo de títulos/Hoje/grafo usam registros reais; XP não mede domínio. Grafo Three/GSAP ativo/reduced-motion e preview inerte não executam projetos. PDF ampliado aceita nota salva/capa, PNG/JPEG local contido e destino nativo registrado; dimensões antes do codec, CSP data controlado, audit opaco. Snapshot v1/SQLite VACUUM INTO+fontes e restore em novo perfil/Documents: validar hashes/paths Windows/schema exato/quick_check/FK antes de remapear todas as raízes. Nunca recuperar paths antigos por fallback. Browser storage fica fora; cópias privadas sem criptografia não vão ao Git. Fechamento normal preserva drafts/foco antes de relaunch. ADR-0011/STUDY_EXPANSION delimitam limites, probes e destinos; ALP-09 continua pendente.
