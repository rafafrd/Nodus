# SDD — especificação de implementação da alpha

Versão: 0.2, 02/10/2026. Núcleo local implementado: contratos reais em src/shared/contracts.ts, operações em main/preload e schema v1 em src/main/store.ts. As seções de snapshot descrevem ALP-09 ainda não implementado no MVP local. Base: PRD, arquitetura e backlog original.

## Escopo verificável

Duas matérias, notas Markdown portáveis, mesas separadas, PDF com página salva, foco por duração escolhida, checklist e consulta autenticada de snapshot com o PC desligado. O ticket ativo define o incremento e a aceitação.

## Contratos esperados

| Caso de uso | Entrada | Saída/efeito | Ticket |
| --- | --- | --- | --- |
| Consultar versão | Chamada validada | Versão real do app ou erro identificado | ALP-01 |
| Criar/renomear matéria | Dados válidos e ID quando necessário | Matéria persistida com identidade estável | ALP-03 |
| Abrir/salvar nota | Referência autorizada, conteúdo, revisão lida | Arquivo confirmado ou conflito/erro recuperável | ALP-04 |
| Salvar checkpoint | Matéria e campos da mesa | Estado recuperável | ALP-05 |
| Abrir PDF | Referência autorizada | Documento/página ou erro/localizar arquivo | ALP-06 |
| Iniciar/pausar/retomar foco | Sessão/duração/ação válida | Estado e segmentos persistidos | ALP-07 |
| Alterar etapa | IDs válidos, texto/conclusão | Checklist persistido, contagem e próxima ação | ALP-08 |
| Enviar snapshot | Usuário, operação, nota, revisão, hash | Recibo consistente e snapshot por proprietário | ALP-09 |

Métodos/canais locais estão em src/shared/contracts.ts, src/preload/index.ts e src/main/index.ts. Os contratos validam remetente, argumentos, identidade das entidades e autorização/caminho pertinentes. Falha não pode devolver confirmação de gravação. Contratos de snapshot permanecem esperados para ALP-09.

## Abrir, editar e salvar

1. Selecionar vault e arquivo autorizado; ler conteúdo/hash e metadados.
2. Manter a fonte original na edição assistida; renderizar prévia separadamente, sem conversão de volta para o salvamento (ADR-0005).
3. Salvar somente após conferir a versão externa e validar preservação.
4. Confirmar arquivo, atualizar índice e estado salvo.
5. Se houver alteração externa, atualizar nota limpa ou preservar versões com buffer alterado.
6. Se a escrita falhar, mostrar erro e recuperar o texto em edição.

A prova do editor inclui título, parágrafos, listas, checklist, link relativo, wikilink, tabela, código, fórmula e campo desconhecido no frontmatter. Conversão destrutiva é impedida ou o conteúdo original é preservado.

## Mesa e documentos

Mesa pertence à matéria; troca e reinicialização restauram nota, documento, página, layout e próxima ação. Abra ferramenta sem perder buffer. Checkpoint e política de fechamento precisam tratar erro de gravação. PDF tem localização recuperável quando o arquivo mover/desaparecer. Assets/worker são conferidos na build.

Direção visual de UI-01, solicitada em 02/10/2026: sem cantos arredondados; painéis encaixados e divisórias finas, inspirados na organização de terminais da referência. Os painéis representam caderno, material PDF, foco e checklist. Módulos/Alt+3 abre a grade; o modo só caderno amplia a nota e retorna por Esc. Three.js permanece discreto no cabeçalho e GSAP na entrada dos painéis; respeitam preferência de movimento reduzido.

## Sessões e etapas

Foco tem ID único, duração escolhida e segmentos de tempo ativo. Pausa interrompe atividade; retomada mantém ID. Fechar normalmente pausa e grava; recuperação após falha mostra o último checkpoint disponível. Intervalo fechado não é creditado automaticamente.

Checklist conserva IDs e relações ao alterar texto, marcar/desmarcar ou trocar de matéria. A próxima ação aponta para tarefa/etapa existente. Planejamento automático e recompensas não entram neste incremento.

## Snapshot e acesso web

Salvamento local confirmado pode gerar operação persistida. O mesmo ID é reutilizado no reenvio; o servidor devolve o mesmo resultado. Defina revisão e hash, impeça escrita atrasada sobre revisão nova e conserve erro/pendência até confirmação real.

Auth e políticas por proprietário precisam ser testadas com dono, outra identidade e sessão não autenticada. A página web funciona em hospedagem HTTPS independente; o último snapshot confirmado segue disponível com o PC desligado. Apenas nota/metadados necessários são enviados.

## Qualidade e rastreabilidade

GAM-01, solicitado após UI-01, acrescenta cidade isométrica, cultivo/colheita, coleta/venda, cinco melhorias, memória demonstrativa e build gratuita. Contratos específicos game:get e game:action em src/shared/game.ts; a economia/rodada é calculada e persistida no main. Entrar pausa o foco e preserva o buffer; voltar retoma a mesa. Ver [regras provisórias](decisions/game-rules.md); integração de notas/IA e sincronização do jogo continuam no roadmap.

Critérios ALP-01 a ALP-11 nos tickets e resultados em docs/validation/ALPHA.md. Testes atingem preservação, persistência, contratos inválidos, conflito, tempo e reenvio. Build não aberta e configuração externa ausente continuam não verificadas.

Depois de implementar um fluxo, atualize aqui seus contratos reais ou aponte para o código/schema correspondente. Preserve a diferença entre planejado e implementado e evite listas duplicadas de critérios.
