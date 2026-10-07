# SDD — especificação de implementação da alpha

Versão: 0.4, 04/10/2026. Núcleo local implementado: contratos reais em src/shared/contracts.ts, operações em main/preload e schema v5 em src/main/store.ts. Snapshot na nuvem/ALP-09 permanece futuro; cópia/restauração local NXT-01 é descrita abaixo. Base: PRD, arquitetura e backlog original.

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
| Listar pastas de exportação | source vault/projectId, strict | Raiz/subpastas canônicas contidas, sem links/auxiliares | EXP-01 |
| Exportar pasta em PDF | source e folder relativo, strict | A4 preto em Downloads; recibo path/notes/bytes/skipped só após gravação/audit ou erro | EXP-01 |
| Estudo conectado | shared/study: search/card/mark/moment/link strict, vínculos no main | Catálogo real, Hoje, revisão versionada, marcas por fingerprint e momentos/relações persistentes | NXT-01 |
| Snapshot local | shared/backup: manifest estrito e capacidade UUID | Prévia/criar/importar/restaurar separados, sem substituição de fontes/perfil | NXT-01 |

NXT-01: schema5/migração aditiva e DTOs shared/study/backup ampliam main/preload. card:review valida versão/UUID/payload e agenda com relógio do main/cap365dias, sem XP. mark:list/add/remove vincula fingerprint/área/página e moment:list/add/remove/open conserva nota temporal do vídeo; seek recria guest, demais modos o conservam. link:list/save/remove persiste relações intra-matéria, sem extrair significado automaticamente do Markdown. backup:preview/create/choose/restore/activate usa snapshots locais e IDs de capacidade; não representa ALP-09. Destino PDF escolhido é registrado no main+audit; nota individual/imagens opcionais seguem superfície de impressão isolada. Detalhes e consequências em [ADR-0011](adr/0011-expansao-estudo-local.md).
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

## CFG-01 — configurações locais

UI-03 complementa esta área: tema Editorial e featuredProjectIds no contrato existente, com default [] compatível com perfis anteriores, até 40 UUIDs distintos e update/audit transacionais. Nenhum canal ou privilégio novo. Editorial delimita apresentação via data-theme; Oliva conserva o visual anterior. Hoje histórico é uma apresentação separada; mesa/editor/cidade conservam os mecanismos existentes. Catálogo/árvore separam principais/secundários e a vista geral mantém buffers/abas. [ADR-0012](adr/0012-tema-editorial.md), [provas](validation/EDITORIAL_DESIGN.md).

preferences:get/update, profile:photo/photo-remove e app:management/folder em shared/preferences.ts/contracts.ts/preload/main. Payload strict validado e sender/mainFrame/origem verificados pelo handler existente. Foto recebe bytes limitados PNG/JPEG, preflight de dimensões e nativeImage→PNG256×256 no main; audit não registra nome/foto/caminho. Pasta só enum data/vault, resolve diretório registrado e erro do shell é explícito. Schema v4/arquivos canônicos anteriores conservados.

Provider lê antes da mesa, confirma após IPC e aplica CSS datasets; tema não remonta editores/cidade. Quarta área usa filas/gates existentes; atalhos dos estudos são desativados nas configurações. Observador compartilhado combina off do app com reduced-motion do sistema para GSAP/Three/CSS; foco/QTE/skillcheck/vídeos mantêm tempo essencial. Gestão consulta contagens/versões/pastas reais e orienta backup. [ADR-0009](adr/0009-preferencias-locais.md), [provas](validation/SETTINGS.md).

GAM-03 amplia o incremento local com faixa própria/IPC de janela, efeito Editorial de baixo movimento com preferência independente e sistema de skins geográficas. Economia incremental permanece no Game/main: produtores/tecnologias/conquistas/prestígio com reset parcial confirmado, liquidação por taxa anterior e histórico preservado. Oficina nova tem36 etapas/três fases/pausa e usa tempo recebido no main; partidas legadas não são resetadas. [ADR-0013](adr/0013-cidade-progressiva-e-janela.md), [regras](decisions/city-progression.md).

UI-04 usa shared/workspace e preferences existentes para layout global (áreas únicas/pesos), sem migration. AreaStage pode manter até três áreas visíveis; cada modelo/editor/player permanece único. WorkspaceFrame controla foco/divisores, SuspendedTools revela foco/checklist. Atalhos de nota/projeto/QTE seguem a área focada. GameView enfileira cliques e registra flush no fechamento; Game não aplica cooldown do motor e prepara somente etapa0 da Oficina. GraphScene separa cena/forças/câmera dos dados de GraphWorkspace. [ADR-0014](adr/0014-areas-isoladas.md).
