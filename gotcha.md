# gotcha.md — riscos previstos e ocorrências verificadas

Versão: 1.1. Atualizado em 02/10/2026, America/Sao_Paulo. Projeto: app de estudos. Nome do arquivo no bootstrap: gotcha.md.

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
