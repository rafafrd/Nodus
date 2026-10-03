# SDD — especificação de implementação da alpha

Versão: 0.3, 03/10/2026. Núcleo local implementado: contratos reais em src/shared/contracts.ts, operações em main/preload e schema v4 em src/main/store.ts. As seções de snapshot descrevem ALP-09 ainda não implementado no MVP local. Base: PRD, arquitetura e backlog original.

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

## Incremento GAM-02 — motor, desafios e projetos

Motor, QTE e skillcheck estendem game:get/game:action e a mesma transação perfil/ledger/operação/audit. Preços, cooldown de 300ms, limite de 10 upgrades, teclas/tempo/zonas e recompensas pertencem ao main. Renderer envia apenas ação/UUID; nenhuma pontuação ou instante é aceito. [Regras](decisions/game-rules.md) registram a revisão 2. Memória permanece sem cronômetro.

Explorer: project:list/choose/tree/open/save/draft/discard/view em src/shared/projects.ts. Seleção de pasta nativa registra capacidade específica, até 40 projetos e 12 abas. Árvore exibe até 500 itens por pasta e texto UTF-8 até 1MiB. src/main/projects.ts resolve caminhos/canonicalização, bloqueia traversal, junction/symlink e metadados .git inclusive aliases de caixa/8.3. HTML/JS é texto inerte no CodeMirror, sem executar preview/terminal/Git.

Arquivo de projeto é canônico; SQLite guarda referência/abas e rascunho com hash-base. Save conserva backup, confere hash antes de rename e não confirma erro como sucesso. Conflito mantém edição e versão externa; conservar edição exige revisão e novo Save explícito. Fechar/trocar vista espera persistir rascunhos. Arquivo ausente conserva draft e impede Save. UTF-8/BOM/CRLF são preservados pela edição seletiva verificada. FS e SQLite não formam uma transação única: falha do audit após rename conserva draft e recovery, informa erro e requer conferência do disco. [ADR-0007](adr/0007-explorer-local.md) e [prova Windows](validation/ENGINE_EXPLORER.md).

## MED-01 — vídeos, cinema e PiP

video:list/add/remove e player:open/layout/close em src/shared/videos.ts, preload/index.ts e main/index.ts. UUID/vínculo/título/URL são validados no main. Videos normaliza formatos de YouTube/tempo e transaciona registro/removal/audit; schema v4 conserva dados anteriores e default PDF. Desk retorna videoId/materialView e rejeita vídeo de outra matéria. Seleção persiste por matéria, sem abrir rede no bootstrap.

Player WebContentsView usa sessão própria efêmera, sem APIs privilegiadas/preload/Node; a URL é construída de ID validado. CSP principal frame-src none não muda. Permissions/popups/downloads/navegação e requests por domínio têm controles específicos; Referer identifica appId. [ADR-0008](adr/0008-video-isolado.md).

Material oferece PDFs/Vídeos. Um guest alterna posição/tamanho entre inline, cinema e PiP interno sem recarregar. GSAP480ms/retarget/reduced-motion, header de arraste/teclado, resize/clipping e Escape recebido no guest. Cinema usa inert e gates explícitos de áreas; fechar destrói guest e libera gates. Link é conservado; o usuário abre/aciona Play novamente após restart. Sem downloads, chave de API ou promessa de reprodução de links que o YouTube restringe. [Validação](validation/YOUTUBE.md).
