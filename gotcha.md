# gotcha.md — riscos previstos e ocorrências verificadas

Versão: 1.1. Atualizado em 09/10/2026, America/Sao_Paulo. Projeto: app de estudos. Nome do arquivo no bootstrap: gotcha.md.

## Como usar

Leia a visão rápida antes da tarefa e os riscos pertinentes ao módulo em alteração. Esta lista orienta verificações; não declara que todos os problemas aconteceram. Ocorrências reais são registradas na seção própria, com reprodução, ambiente e evidência.

O bootstrap anterior tinha tickets a fazer e nenhuma ocorrência funcional documentada. O estado atual do PC não foi inspecionado nesta geração. Confira o repositório e os registros antes de afirmar que o app está vazio, que um problema existe ou que foi corrigido.

## Visão rápida por tarefa

| Tarefa | Riscos prioritários |
| --- | --- |
| ALP-01 — fundação | G-02 a G-08, G-15, G-26 |
| ALP-02 — editor | G-09, G-10, G-34 |
| ALP-03 — persistência | G-06, G-07, G-25, G-26, G-28 |
| ALP-04 — vault | G-09 a G-12, G-25, G-27, G-28 |
| ALP-05 — mesa | G-12, G-29 |
| ALP-06 — PDF | G-14, G-15, G-29 |
| ALP-07 — foco | G-13, G-29 |
| ALP-08 — checklist | G-29, G-30 |
| ALP-09 — nuvem | G-16 a G-19, G-31, G-33 |
| ALP-10 — jornada | Todos os riscos dos fluxos exercitados |
| ALP-11 — documentação | G-01, G-21 a G-24, G-32, G-40 |

G-35 a G-39 dizem respeito a módulos posteriores. Sua presença não amplia o escopo dos tickets da alpha.

## Riscos previstos

| ID | Situação | Onde conferir | Conduta e prova esperada |
| --- | --- | --- | --- |
| G-01 | Documentação histórica tratada como estado atual | Sessões novas | Conferir código, Git, ticket e evidência; não recriar a base nem resetar o quadro com base em um snapshot antigo. |
| G-02 | Agente aberto na pasta errada | Bootstrap | Confirmar raiz, arquivos de instrução e working tree antes de editar. |
| G-03 | Override global muda regras da tarefa | Bootstrap | Identificar instruções efetivamente carregadas; tratar conflito sem modificar configurações de outros projetos. |
| G-04 | npm.ps1 bloqueado no PowerShell | ALP-01 | Usar npm.cmd quando necessário; não mudar a política global apenas para contornar esse comando. |
| G-05 | Ferramenta instalada não aparece no PATH | Setup | Reabrir terminal/editor e conferir executável e versão; registrar o erro real. |
| G-06 | Node do host confundido com runtime Electron | ALP-01/03 | Registrar versões separadas e conferir compatibilidade das dependências escolhidas. |
| G-07 | SQLite nativo funciona no host, falha no Electron | ALP-03 | Verificar biblioteca, ABI e empacotamento; instalar ferramentas extras apenas se o diagnóstico exigir. |
| G-08 | Geração de build tratada como execução Windows | ALP-01/10 | Abrir a build empacotada no Windows; sucesso em outro sistema não aprova essa prova. |
| G-09 | Editor visual altera o conteúdo no round-trip | ALP-02/04 | Conferir fixture antes/depois, diff e edição seletiva; preservar ou impedir conversão destrutiva. |
| G-10 | Frontmatter desconhecido descartado | ALP-02/04 | Incluir campo não reconhecido na prova e conservar metadados/representação. |
| G-11 | Watcher reage à própria escrita em ciclo | ALP-04 | Diferenciar hash/revisão lida, escrita do app e alteração externa; exercitar os fluxos. |
| G-12 | Erro de escrita elimina o buffer | ALP-04/05 | Manter texto recuperável, erro visível e nova tentativa; não confirmar salvamento antes da gravação. |
| G-13 | Timer soma callbacks em vez de atividade | ALP-07 | Usar segmentos de tempo, pausa, checkpoint e recuperação; conferir janela sem foco e intervalo fechado. |
| G-14 | PDF funciona somente no servidor de desenvolvimento | ALP-06 | Conferir assets/worker e retomada na build empacotada; testar arquivo ausente e inválido. |
| G-15 | Leitor ou preview recebe privilégios do host | ALP-01/06 e projetos | Expor operações específicas e validar caminhos; preview de projetos tem superfície separada. |
| G-16 | Estado sincronizado sem recibo real | ALP-09 | Persistir operação, mostrar pendência/erro e confirmar somente após resposta; reenviar com o mesmo ID. |
| G-17 | Operação atrasada substitui revisão nova | ALP-09 | Definir revisão e comparação; não usar relógio local como substituto; conservar conflito visível. |
| G-18 | Consulta web depende do desktop ligado | ALP-09/10 | Conferir página hospedada HTTPS no celular com PC desligado e a última revisão confirmada. |
| G-19 | Esconder nota na UI parece controle de acesso | ALP-09 | Verificar políticas/API com proprietário, outro usuário e sessão não autenticada, inclusive acesso por ID. |
| G-20 | Dados pessoais entram no Git do aplicativo | Todos | Manter vault, materiais, bancos e segredos fora do repo; usar fixtures explícitas e conferir o stage. |
| G-21 | Ticket parcial movido para done | Todos | Conferir cada critério; parcial/bloqueado permanece em doing com próxima ação. |
| G-22 | Movimentação quebra links e retomada | Todos | Atualizar frontmatter, índice e ALPHA_STATE junto; executar o verificador documental. |
| G-23 | Reserva humana interpretada como duração da feature | Planejamento | Registrar tempo informado, sem inferir pelo tempo da IA; revisar prazo preservando o escopo escolhido. |
| G-24 | Variação de caixa dos nomes causa referências inconsistentes | Docs | Usar CLAUDE.md, gotcha.md e sdd.md como referenciados; renomeação exige atualizar referências. |
| G-25 | Título/caminho usado como identidade da nota | ALP-03/04 | Manter ID estável e preservar vínculos ao renomear/reabrir; detectar colisão de IDs importados. |
| G-26 | Validação só na interface e gravação parcial | ALP-01/03 | Validar na fronteira privilegiada e aplicar transações; testar argumento inválido e estado posterior. |
| G-27 | Limite do vault validado por comparação ingênua | ALP-04 | Resolver caminhos e conferir o diretório autorizado antes de operar, incluindo tentativa de escape; preservar dados. |
| G-28 | Rascunho/índice se torna fonte concorrente da nota | ALP-03/04 | Arquivo é canônico; distinguir rascunho recuperável e cache reconstruível da versão salva. |
| G-29 | Troca de matéria mistura documento, layout ou foco | ALP-05/06/07/08 | Validar duas mesas diferentes; manter associação da sessão e checkpoint correto. |
| G-30 | Atualização de texto recria etapa ou perde próxima ação | ALP-08 | Preservar IDs, contagem, conclusão e referência de retomada após editar/trocar/reabrir. |
| G-31 | Segredo de servidor inserido no cliente ou log | ALP-09 e IA | Separar configuração pública de segredo; verificar bundle/configuração e não imprimir valores sensíveis. |
| G-32 | Verificador do bootstrap tratado como teste da aplicação | Todos | Registrar seu escopo documental e executar as provas funcionais/integrações pertinentes. |
| G-33 | Fixtures ou mocks apresentados como integração concluída | Todos | Identificar dados de teste e usar fluxos reais; simulação não aprova dependência externa. |
| G-34 | Matriz de compatibilidade aprovada sem editor externo | ALP-02 | Conferir saída no Obsidian/outro editor disponível; marcar ausência dessa prova como não verificada. |
| G-35 | Fonte citada pela IA não corresponde ao material/versão | IA posterior | Referência precisa ser conferível; preservar origem/versão/localizador e identificar conhecimento geral. |
| G-36 | XP convertido em domínio acadêmico | Aprendizagem/jogo posteriores | Manter evidências de desempenho e recompensas separadas; critérios de status acadêmico são visíveis. |
| G-37 | Templates chamados de fine tuning implementado | IA posterior | Descrever o recurso que existe; treino/adaptação de modelo exige decisão e evidência próprias. |
| G-38 | Reenvio duplica recompensa ou compra | Jogo posterior | Origem/operação tem identidade; repetir processamento conserva efeito, rodadas legítimas distintas têm IDs distintos. |
| G-39 | Reagendamento altera compromisso fixo ou duplica evento | Agenda posterior | Preservar vínculos e compromissos fixos; adotar horário externo conforme regra escolhida. |
| G-40 | Sessão lê todo histórico e implementa roadmap inteiro | Todos | Ler o ticket e referências pertinentes; encerrar nele e indicar próximo passo sem executá-lo. |

## Ocorrências verificadas da aplicação

### O-001 — conversão básica Tiptap perde elementos da fixture

- Estado: observado; mitigado pela escolha de editor que não serializa a nota.
- Data/ticket/ambiente: 02/10/2026, ALP-02, Windows 11, Node 24.21.0, Tiptap 3.31.4 + StarterKit + Markdown.
- Reprodução: `npx tsx scripts/probe-tiptap.ts` com tests/fixtures/compatibility.md.
- Observado: campo custom_unknown, comentário e custom-element ausentes na saída; fórmula textual conservada. Não se trata de perda de dados pessoais.
- Causa: configuração básica não representa todos os elementos. Uma configuração completa não foi avaliada.
- Mitigação: CodeMirror conserva a fonte, com toolbar e prévia sem conversão de salvamento. Testes de edição seletiva e smoke-editor executados; abertura em editor externo pendente. Evidência: docs/decisions/markdown-editor.md.

As verificações do bootstrap estão em docs/validation/BOOTSTRAP.md. Elas examinam documentos, quadro, links, exclusões Git e comportamento do verificador; não aprovam a janela Electron, o salvamento, o PDF ou a sincronização.

## Formato de uma ocorrência

### O-002 — painel longo empurrava dock e rodapé para fora da janela

- Estado: corrigido e verificado em ALP-05, 02/10/2026, janela Windows 1440×940.
- Reprodução: abrir nota fixture longa e ferramenta; a dimensão mínima implícita da coluna flex expandia o conteúdo além da janela.
- Correção: main-column com altura e mínimo definidos, desk com basis zero; editores/documentos rolam dentro de seus painéis.
- Verificação: smoke-desk comparou bounds do dock/rodapé com innerHeight e captura .local/evidence/desk.png inspecionada. Dados da mesa continuaram preservados.

Use um ID O-NNN e vincule o risco G-NN pertinente, quando houver. Registre causa confirmada separadamente de hipótese. Uma correção só recebe estado verificado após executar uma prova adequada; ao reaparecer, reabra o registro com nova evidência.

### O-003 — descarte de rascunho sem evento de auditoria

- Estado: corrigido e verificado em 02/10/2026, fechamento do MVP/ALP-11.
- Reprodução: criar rascunho e chamar note:discard; backup existia e draft era removido, mas a contagem de audit_events não mudava (19→19 na prova do auditor).
- Impacto/causa: lacuna de rastreabilidade, classificada LOW pelo auditor; ausência da chamada de audit em Vault.discard. Nota/backup não eram perdidos.
- Correção: arquivamento antes da transação; DELETE e note.draft-discard com ID/resultado na mesma transação, sem conteúdo ou caminho nos logs.
- Verificação: testes/vault.test.ts conserva arquivo/backup e confere um evento; prova SQLite do auditor forçou falha de INSERT do evento e confirmou rollback do DELETE. Evidência local .local/security-discard-results.json e relatório final em docs/security/MVP_AUDIT.md.

### O-004 — aviso de carregamento oscilava o tamanho disponível do PDF

- Estado: corrigido e verificado em UI-01, 02/10/2026, Windows 11 10.0.26200, Electron 44.5.1.
- Reprodução: grade com PDF e ajuste de página inteiro; o canvas já aparecia, mas o aviso de carregamento reaparecia e a barra de rolagem alternava.
- Causa: aviso no fluxo do documento acrescentava altura; a barra de rolagem alterava a largura medida pelo ResizeObserver e disparava nova renderização.
- Correção: aviso como overlay, scrollbar-gutter estável e ajuste usando a altura de conteúdo já medida sem descontar padding novamente. Nenhum dado da mesa/nota foi alterado.
- Verificação: preview-frontend --packaged --stage=verified exigiu quatro amostras com canvas renderizado, tamanho constante, altura dentro do painel e ausência do aviso. Captura frontend-verified-pdf-fit.png inspecionada; smoke-pdf empacotado e jornada R1–R7 passaram. Evidência: docs/validation/FRONTEND.md.

### O-005 — audit atual tem advisory High transitivo de tooling

- Estado: observado e exposição avaliada em GAM-01, 02/10/2026, Windows/Node 24.21.0. Não corrigido por troca automática de dependência.
- Reprodução: npm audit --json retorna oito entradas High; npm audit --omit=dev --json retorna zero. Lockfile inalterado; o zero histórico do MVP não representa a consulta atual.
- Causa: um advisory GHSA-ch52-4w7c-c8xp em http-cache-semantics 4.2.0, na cadeia de electron-builder. Ataque requer cache HTTP compartilhado entre usuários; não foi encontrado esse caminho no produto/workflow configurado, que usa got sem cache habilitado.
- Impacto e decisão: tooling afetado consta no audit, sem achado de código/exposição confirmada neste recorte local. Continuar o incremento com avaliação explícita; não declarar audit completo limpo nem aplicar downgrade sem compatibilidade/remediação comprovadas.
- Evidência/próxima ação: docs/security/GAME_AUDIT.md registra cadeia, fontes e limites. Reavaliar na preparação de release, ao introduzir cache compartilhado ou quando houver remediação oficial. Dados de teste e empacotamento não exigiram sessão/cache remoto do app.

### O-006 — validação estrita rejeitava salvamento inicial do Explorer

03/10/2026/GAM-02, testes reais no Windows. save passava hash/text à schema strict de open, rejeitando toda gravação depois de preservar draft. Corrigido para referência projectId/path em cada open. tests/projects.test.ts e jornada empacotada/Ctrl+S passaram; problema capturado antes da entrega.

### O-007 — NTFS permite alias de caixa/8.3 para metadados .git

03/10/2026/GAM-02, probe independente em fixture real. Bloqueio literal .git permitia .GIT e GIT~1/config; alias8.3 permitiu ler/gravar config antes da correção. Corrigido com validação case-insensitive e bloqueio de componente .git no caminho canônico após realpath, antes de retornar resolução. Probes read/save negativos deixaram bytes intactos; junction/root substituída também negadas. Ver auditoria GAM-02; não apagar dados/projetos para testar contenção.

### O-008 — ignore de build também ocultava documento de publicação

03/10/2026/GAM-02, git ls-files docs/release vazio e check-ignore indicava release/ para docs/release/README.md. O link existia no PC mas o documento não acompanhava um checkout. Corrigido para /release/ na raiz, mantendo build privada ignorada e incluindo o documento de publicação no commit. O verificador também pulava todo diretório release; agora release/dist são ignorados somente na raiz. Prova em cópia real negou um link interno quebrado em docs/release. Verificação de links/quadro e git ls-files conferem a correção.

### O-009 — carregar arquivo no CodeMirror parecia nova edição

03/10/2026/GAM-02, harness Windows ao usar versão do arquivo depois de recuperar draft. O dispatch programático disparava onChange e mostrava Rascunho em edição apesar da fonte estar atualizada; bytes/draft do disco permaneceram corretos. Correção: distinguir sync de props e entrada do usuário no listener. Prova nova verifica status, decisões rápidas de Save/descarte, recovery e edição seguinte no pacote.

### O-010 — cinema não cancelava listeners da oficina

03/10/2026/MED-01, auditoria independente em fonte congelada: abrir cinema sobre Cidade deixava GameView com activeArea true. inert bloqueava foco/gestos, mas listener global aceitava A e avançava etapa QTE0→1 na prova JSDOM/SQLite real. Corrigido em App.tsx passando activeArea false para GameView e ProjectWorkspace durante cinema; ao fechar, controller restaura modo inline e libera gates. Probe próprio negou entrada oculta e retomou exatamente um passo visível. Jornada no pacote Windows final confirmou etapa/acertos inalterados sob cinema e cancelamento após fechamento. Ver YOUTUBE_AUDIT/YOUTUBE; não usar inert como cancelamento de listeners globais.

### O-NNN — título concreto

- Estado: observado / investigando / corrigido sem nova prova / corrigido e verificado / reaberto.
- Data e ticket: preencher.
- Ambiente: sistema, versão do app/build, dependências e serviço pertinentes.
- Dados de teste: fixture/caminho/identidade não sensível.
- Reprodução: passos mínimos e condição que dispara o problema.
- Esperado: comportamento exigido pelo ticket.
- Observado: resultado real, erro e impacto.
- Causa: confirmada ou hipótese identificada.
- Correção: comportamento/arquivos alterados.
- Verificação: comando ou roteiro executado, resultado, data e referência de evidência.
- Retomada: o que falta, dependência necessária e próxima ação.

## Manutenção

Atualize no fim da tarefa quando houver ocorrência nova, confirmação de hipótese ou mudança relevante. Preserve os IDs e o histórico necessário para entender a regressão. Não copie toda a execução do ticket para cá; mantenha os resultados detalhados em docs/validation/ALPHA.md e links/referências para eles.

Use linhas longas para os parágrafos Markdown, deixando o editor fazer a quebra visual. Mantenha frontmatter e nomes de arquivo consistentes com o quadro e com o AGENTS.md.


## Execução sequencial desta edição

O fluxo atual permite avançar entre tickets quando autorizado no pedido de início. Instruções de encerramento presentes nos snapshots históricos em docs/planning não devem reintroduzir uma parada entre tickets. O ticket canônico em docs/tasks, AGENTS.md e o pedido atual orientam a execução. Avançar não transforma uma prova pendente em aprovação.

O script de bootstrap é para a preparação inicial. Rodá-lo novamente depois de implementar com -Force pode repor arquivos documentais iniciais; o backup preserva os arquivos substituídos, mas não torna esse reset adequado. Para continuar o projeto, use docs/status/ALPHA_STATE.md.

## O-011 — Player remoto aberto sem superfície após reinício (CFG-01, 03/10/2026)

Observado no pacote Windows: VideoPlayer.open chamava close e publicava closed antes de loading/ready; a entrega IPC concorrente podia limpar video no renderer depois da resposta de abertura. Guest existia/carregava, mas surface e botão de retry ausentes. Probe real em .local/evidence/settings-player-probe.log registrou eventos/DOM e crash controlado. Correção: dispose privado remove recursos sem publicar; close explícito continua notificando. Harness de regressão espera guest+DOM e superfície, verifica ausência de closed transitório ao abrir e crash/retry após restart. Aprovação da correção depende da nova build/jornada final registrada em SETTINGS, não do hash anterior.

## O-012 — Exportação concluída sem evento de sucesso (EXP-01, 03/10/2026)

Observado pelo auditor na fonte inicial: printToPDF e gravação confirmavam sucesso em Downloads, mas handler só auditava erros. Correção export-output exige audit pdf:export/UUID opaco/ok depois de write/fsync/close; falha remove apenas a saída nova e retorna erro sem recibo. Sem título/path/texto no evento. Teste unitário, probe independente e pacote real com trigger abort SQLite verificaram ausência de PDF novo/evento, arquivo anterior/fontes intactos e retomada após remover trigger. Provas em docs/validation/PDF_EXPORT.md. FS/SQLite não compartilham atomicidade contra crash/falha de cleanup; não alegar transação conjunta.

## O-013 — Intervalo de revisão ilimitado (NXT-01, 04/10/2026)

Probe SQLite independente repetiu avaliações Fácil antecipadas na biblioteca e encontrou due_at acima do intervalo aceito pelo driver/Date, com erro em SELECT após 15 avaliações. Correção no main limita intervalo a 365 dias, valida instante/data finitos e faz rollback por relógio inválido. Teste real com 50 avaliações e rollback passou. Destino PDF/ativação de cópia também passaram a exigir audit antes de confirmar estado/fechamento, sem caminhos privados no evento.

## O-014 — Área vazia de controles interceptava marcador da cidade (NXT-01, 04/10/2026)

Regressão Windows empacotada test:smooth-ui falhou ao clicar Visitar mina após mover a câmera para Fazenda: o container largo de Ambiente da vila interceptava o ponto do marcador. Correção em game.css deixa o container com pointer-events:none e somente os botões com pointer-events:auto. Novo pacote e mesma jornada aprovaram clique/câmera/retarget/movimento reduzido e viewport 1040×760, sem force ou mudança do roteiro. Fonte e identificação do pacote em STUDY_EXPANSION.

## O-015 — Canvas do grafo cobria o grid do tema Editorial (UI-03, 06/10/2026)

Observado na captura real editorial-graph.png inicial, Electron/Windows: CSS do host recebia o grid, mas scene.background opaco (#0c1210) cobria a grade e conservava a paleta verde. Correção: renderer com alpha, fundo transparente e nós/linhas neutros somente em Editorial; preferências anteriores conservam as cores da cena. A troca de tema usa o mesmo renderer e redesenha. Captura final inspecionada confirma grid; smoke-knowledge-backup no pacote final aprovou nó/seleção/câmera/relação/abrir fonte e restart/restauração com fontes intactas. [Evidência](docs/validation/EDITORIAL_DESIGN.md).

## O-016 — Contraste sobre skins e fundo herdado da Oficina (GAM-03, 06/10/2026)

Corrigido e verificado no Electron/Windows. Capturas reais mostraram texto verde pouco legível do painel da cidade sobre o cenário Cyberpunk e fundo gradiente verde herdado na Oficina Editorial. Correção: moldura neutra com fundo escuro no painel das skins e CSS do tema Editorial aplicado à Oficina, cards, texto e faixas; outros temas conservam a apresentação. Pacote final e roteiro curto capturaram progression-cyberpunk.png, progression-newyork.png e progression-office.png, inspecionadas com contraste/grid/bordas aprovados. Nenhuma mudança nas regras dos desafios após a execução completa de 140s/159s. [Evidência e hashes](docs/validation/CITY_PROGRESSION.md).

## O-017 — Controles herdados cortados nos módulos estreitos (UI-04, 06/10/2026)

Corrigido e verificado no Electron/Windows. Capturas iniciais mostraram navegação horizontal da cidade truncada na nova coluna e controles do grafo além do painel de 1040×760. Causa: regras anteriores mais específicas e cabeçalho sem quebra. workspace.css aplica ícone/nome em coluna, limita larguras e permite quebra dos seletores/ações do grafo. Roteiro clean-workspace e inspeção das capturas compactas/motor conferiram bounds, acesso às ações e ausência do corte. Nenhuma alteração de dados para corrigir o layout. [Evidência](docs/validation/CLEAN_WORKSPACE.md).

## O-018 — Player promovido a PiP ao abrir ou retornar ao módulo (UI-04, 06/10/2026)

Corrigido e verificado no pacote Windows. Vídeo em tela única tinha slot 16:9 mais alto que a biblioteca; a proteção do WebContentsView contra clipping corretamente promovia PiP, inclusive ao sair do cinema. Slot limitado pela altura disponível em workspace.css. A prova com três momentos reais também encontrou retorno ao módulo com scroll antigo, promovendo PiP novamente; returnToDesk agora reposiciona a biblioteca antes do modo inline. test:videos final aprovou abertura/cinema/Escape, scroll real/PiP/retorno entre matérias, ferramentas suspensas com view escondida, continuidade de reprodução/guest, movimento reduzido/compacto e restart/crash/retry. [Evidência e pacote](docs/validation/CLEAN_WORKSPACE.md).

## O-019 — Distrito capturado pelo grupo da skin original (GAM-04,07/10/2026)

Observado no executável Windows: ao acrescentar o distrito Three.js antes de agrupar a vila original, o filtro capturou seu root; Cyberpunk/New York o ocultavam junto da vila. Corrigido excluindo district.root do agrupamento. Prova final do canvas nas três skins,103meshes e movimento reduzido passou. Capturas aguardam a skin efetivamente renderizada, evitando frame anterior. [Evidência](docs/validation/DEEP_PRODUCTION.md). Nenhuma pendência.

## O-020 — Resumo offline confundia resto temporal com limite (GAM-04,07/10/2026)

Captura Windows de8h mostrava limite offline embora abaixo de7dias: delta>elapsed incluía o resto do quantum. A leitura também condicionava contagem de sinais/descobertas à igualdade exata entre chamadas de Date.now. Corrigido comparando com cap real e usando a referência do relatório criado na transação; ausência real e tempo creditado ficam separados. Teste com relógio que avança1ms entre chamadas e reconferência Windows aprovados; não duplica contagem em consulta seguinte. [Evidência](docs/validation/DEEP_PRODUCTION.md). Nenhuma pendência.

## O-021 — Grafo conservava largura intrínseca ao voltar de aba ampliada (UI-05,07/10/2026)

Corrigido e verificado no executável Windows. A primeira captura study-tabs-tabs.png mostrou cabeçalho/canvas do Grafo além do painel após abrir Grafo sozinho, fechar a aba e reconstruir quatro janelas. A coluna implícita da grade do Grafo assumia a largura intrínseca do canvas anterior. workspace.css agora define minmax(0,1fr) e min-width:0 no layout. O roteiro final mede controles/canvas dentro do painel nesse retorno, e a captura final foi inspecionada com ambos visíveis e grafo centralizado. [Evidência](docs/validation/STUDY_TABS.md).


## O-022 — Texto externo longo sem espaços transbordava a área de prática (IA-01,07/10/2026)

Observado na captura Windows ao exercitar explicação válida de4.000caracteres sem espaços: o parágrafo excedia a largura da área e deslocava horizontalmente o conteúdo. Corrigido com overflow-wrap:anywhere e min-width:0 na prática/opções, conservando todos os caracteres. A jornada final mede scrollWidth/clientWidth durante a revelação, e valida1040×760 dividido com PDF; capturas finais inspecionadas. [Prova](docs/validation/atividades-ia-externa.md). Nenhuma pendência.


## O-023 — CSS antigo ocupava o espaço de escrita (UX-01,08/10/2026)

Observado nas primeiras capturas do executável Windows: main-column recebia grade antiga, aviso ocupava espaço flexível e input do título herdava fonte12px. Correção: notes-ux.css carregado após workspace.css, coluna/aviso flex e seletor explícito do título. Menu compacto ganhou largura para nomes completos. Pacote final/jornada/capturas amplas e1040×760 inspecionados; escrita, PDF, grafo e ferramentas ficam acessíveis. Nenhuma alteração de dados para o layout. [Provas](docs/validation/NOTES_UX.md).


## O-024 — Cartão da farm interceptava câmera e flex comprimia motor (GAM-05,09/10/2026)

Observados nas primeiras provas/capturas Windows: o objetivo no canto inferior esquerdo cobria Centralizar cidade; controles foram movidos para a direita. Em1040×760, expansão dos postos também invadia o seletor de skin; altura do cartão passou a reservar o cabeçalho, com rolagem própria. O conteúdo adicional do motor fez flex comprimir/clipping do botão; filhos agora conservam altura e a área rola. Jornada/capturas finais confirmaram controles acessíveis, cabeçalho separado e botão do motor sem compressão. [Prova](docs/validation/FARM_PROJECTS.md).

## O-025 — Roteiro UX selecionava fonte oculta após entrar em Leitura (GAM-05,09/10/2026)

A regressão de UX-01 interrompeu por timeout: .first() escolheu o widget da fonte do CodeMirror que ficava oculto após a transição, em vez do botão da prévia. O roteiro passou a selecionar dentro de .markdown-preview. A captura após trocar PDF também passou a aguardar canvas/texto do material atual e usar duplo clique estável. Reconferência no executável passou incluindo fonte/página2, seleção/criação sem nota, restart e primeiro uso. Nenhuma alteração do editor por essa ocorrência. [Prova](docs/validation/FARM_PROJECTS.md).

## O-026 — Preferência reduzida podia encerrar o livro antes do quadro estático (UX-02,09/10/2026)

Observado na jornada Windows ao alternar movimento reduzido durante um quadro do livro: o limitador de 30 quadros/s podia adiar o desenho final. O guard passou a não pular o quadro quando a preferência reduzida está ativa; a cena registra estado estático e não mantém loop contínuo. Reconferência final no pacote aprovada, incluindo alternância dinâmica, minimização e retorno. [Prova](docs/validation/VISUAL_EXPERIENCE.md).

## O-027 — Gravação do canvas deixava tiles antigos em capturas posteriores (UX-02,09/10/2026)

Observado neste Chromium/Windows depois de captureStream/MediaRecorder: screenshots posteriores exibiam tiles de uma área anterior, embora o DOM estivesse com display:none/opacity0/aria-hidden corretos. A mesma navegação em processo novo, sem gravador, produziu captura limpa. O harness agora captura as fotos antes dos clipes e grava em outro processo. Evidências finais usam screenshots originais; não foi atribuída perda de dados nem falha de navegação ao app por esse artefato da instrumentação. [Prova](docs/validation/VISUAL_EXPERIENCE.md).

## O-028 — Raiz selecionada do projeto conservava ouro claro no tema Branco (UX-03,09/10/2026)

Observado na captura real do editor: o botão da raiz selecionada herdava a cor dourada do tema escuro e ficava pouco legível na nova paleta clara. white.css aplica texto verde escuro e fundo ativo próprio; a reconferência final mostra pasta/arquivo/código legíveis. O realce de código também usa variáveis claras com fallback original nos temas anteriores. Nenhuma alteração dos arquivos ou remount do editor para trocar cores. [Prova e foto final](docs/validation/HOME_WHITE.md).
