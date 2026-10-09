# Dados da alpha

Estado em 07/10/2026: schema v7 real em src/main/store.ts; contratos em src/shared/contracts.ts, game/projects/videos/study/study-activity/backup. Matérias, referências, rascunhos, PDFs, mesas, foco, checklist, revisão e jogo local operantes. sync_operations existe vazia para evolução; não há sincronização implementada.

| Entidade | Campos mínimos | Regra |
| --- | --- | --- |
| Subject | id, nome, configuração visual | ID não muda ao renomear |
| NoteReference | id, subjectId, caminho relativo, hash, título | Corpo vem do Markdown |
| LocalMaterial | id, subjectId, referência de PDF | Binário local |
| Desk | subjectId, nota/PDF/vídeo, tipo de material, página, painéis, próxima ação | Contexto por matéria |
| StudyVideo | UUID, subjectId, título, youtubeId, startSeconds, URL normalizada | Unicidade matéria/vídeo; link local, reprodução remota explícita |
| FocusSession | id, subjectId, duração escolhida, estado, segmentos | Pausa não conta tempo |
| StudyTask | id, subjectId, texto | Identidade estável |
| TaskStep | id, taskId, texto, concluída | Renomear conserva vínculo |
| SyncOperation | id, noteId, revisão, hash, estado, resultado | Reenvio conserva identidade |
| GamePlayer | id=1, coins, xp, state JSON | Perfil único local; main calcula saldo/build/cultivos |
| GameLedger | source única, ação, deltas, instante, rule_version | Origem única para crédito/débito e conciliação |
| GameOperation | UUID, request validado, message | Replay conserva efeito; outro payload é rejeitado |
| GameRound | UUID, state JSON | Pares privados, tentativas/seleção/completion persistidos |
| Flashcard / CardReview | nota opcional, pergunta/resposta/trecho, due/intervalo/versão; UUID/request/rating/at | Main agenda até365dias, replay vinculado e optimistic version; não modifica fonte/XP |
| PdfMark | matéria/PDF/nota opcional, fingerprint SHA256, página/retângulo/cor/comentário | Versões separadas, PDF original intacto |
| VideoMoment | matéria/vídeo, segundos, texto | Vínculo validado e player explícito no ponto manual |
| NoteLink | matéria/origem/destino/rótulo | Dupla única, mesma matéria, referências reais |

NXT-01 cria somente essas cinco tabelas e índice flashcards_due na migração v5. Decorações/atmosphere evoluem JSON do perfil de jogo com default golden, sem redefinir moedas/progresso. Snapshots locais têm manifest v1/SHA256 e cópia consistente do banco; restauração remapeia roots e referências para novo perfil. [ADR-0011](../adr/0011-expansao-estudo-local.md) delimita importação/limites e diferencia ALP-09.

## Autoridade

Arquivo Markdown: corpo e metadados portáveis da nota. SQLite: índices/referências, estado da mesa, sessões, checklist e auditoria. Supabase é requisito futuro de ALP-09: snapshot confirmado para consulta; não substitui o arquivo local nem recebe PDFs.

Identidade, revisão, hash e caminho são conceitos distintos. IDs são estáveis; hash representa bytes/conteúdo explicitamente definido; revisão ordena alterações; caminho localiza arquivo. Não use título, posição na lista ou horário do relógio como substitutos desses conceitos.

## Persistência e evolução

Inicialização/migração versionada, repositórios separados da UI, transações quando houver alterações relacionadas e erro explícito para entrada inválida. Migrações preservam dados existentes. Schema e unidades atuais estão em src/main/store.ts; escolhas registradas em docs/decisions/local-storage.md e docs/decisions/focus-time.md.

UI-01 acrescenta `both` aos valores validados de Desk.tool (`focus`, `checklist`, `both`, `none`): foco e checklist podem coexistir na grade. O campo SQLite existente é TEXT, sem restrição que impeça o valor; schema v1 e dados anteriores são conservados. O modo só caderno e o ajuste do PDF são escolhas transitórias de apresentação; não substituem nota, documento, página ou próxima ação da mesa.

ALP-04 registra o frontmatter efetivo e sua preservação. ALP-09 registra o protocolo de revisões/recibos e as políticas por proprietário. Nenhum desses formatos deve ser anunciado como definitivo antes da respectiva prova.

GAM-01 aplica migração aditiva v1→v2, sem reescrever as tabelas anteriores. src/main/game.ts transaciona ação, ledger, perfil, operação e audit; rodada guarda os pares privados, mas a visão enviada contém somente cartas já reveladas/encontradas. Saldo/XP possuem CHECK não negativo. UUID de operação e source do ledger são índices únicos. [Regras provisórias](../decisions/game-rules.md) definem liquidação/passivo e limites do perfil local.

GAM-02 aplica migração aditiva v2→v3: game_challenges, project_folders e project_drafts. Engine/challengeId entram no JSON de perfil com defaults preservadores; não repetem starter nem resetam carteira/XP/ledger. Desafio guarda estágio/acertos/status, não aceita resultado do cliente; origem challenge:UUID é única. Novos registros usam rule_version=2; histórico v1 permanece.

project_folders registra UUID/raiz canônica/nome; project_drafts guarda projeto+caminho, fonte e hash-base. projectView em settings conserva projeto selecionado, até12 abas e ativa. Arquivo de projeto permanece fonte principal, com recovery em perfil/project-recovery. SQLite conserva rascunho, sem importar arquivos privados para o Git do app. Não há sincronização/execução/Git automático de projetos.

MED-01 migra v3→v4 em transação: videos, desks.video_id e desks.material_view (pdf por default). SQLite conserva título/URL/seleção, não conteúdo audiovisual. Remover limpa seleção/referência/audit conjuntamente. Reiniciar não inicia guest/rede. Notas/PDF/projetos/jogo anteriores permanecem; migrações/testes e a prova nativa têm evidências próprias em YOUTUBE.

CFG-01 usa `settings.preferences` já existente para nome/tema/animations/photoPNG normalizado; schema v4 permanece. UserPreferences valida JSON, conserva raw inválido ao carregar defaults e salva prefs/audit em transação. Não persistir foto original, caminho ou URL arbitrários nem incluir perfil no audit. AppManagement lê contagens e diretórios registrados; não importa conteúdo dos projetos. [ADR-0009](../adr/0009-preferencias-locais.md).

UI-03 amplia preferences com tema editorial e featuredProjectIds (até 40 UUIDs distintos), sem migration adicional ao schema v5 corrente. Ausência da lista em perfis anteriores recebe [] na leitura e conserva o raw salvo. Defaults novos usam Editorial; valor de tema anterior continua válido. Renderer classifica somente IDs presentes no catálogo real. Update/audit mantêm a transação existente. [ADR-0012](../adr/0012-tema-editorial.md).

EXP-01 lê settings.vault e project_folders/subjects para resolver origens/rótulos; não acrescenta tabela ou migration. Fontes Markdown permanecem canônicas. PDF derivado fica em Downloads, sem índice/histórico de exports no banco. audit_events recebe pdf:export/UUID opaco/ok após fsync/close; falha de INSERT exige remoção da saída nova antes de retornar erro. Sem promessa de transação FS/SQLite ou log de título/caminho/texto. [ADR-0010](../adr/0010-exportacao-pdf.md).

GAM-03 preserva schema v5: `skin` e `economy` entram em game_player.state com defaults/contadores derivados do ledger; challenges v2 registram readyAt/misses/startedAt/pausedAt e conservam partidas legadas. Produção, compras, conquistas, prestígio, operação e audit mantêm transação do Game. Prestígio reinicia somente os campos econômicos informados na prévia. Novos registros rule_version3; passivo agrega por minuto/ciclo. `preferences.editorialBackground` recebe true quando ausente, sem regravar raw; janela tem IPC limitado e eventos transitórios. [ADR-0013](../adr/0013-cidade-progressiva-e-janela.md).

UI-04 amplia settings.preferences com workspaceLayout validado (1–3 áreas únicas, pesos finitos ≥20%, soma100). Ausência recebe Caderno100 na leitura, sem regravar raw ou resetar desks. Layout global convive com notas/PDF/página/vídeo/nextStep por matéria; campos legados split/tool ficam preservados. Provider serializa alterações, fechamento espera fila e drafts. Motor mantém operações únicas/fila no renderer; regra temporal e créditos permanecem no main. [ADR-0014](../adr/0014-areas-isoladas.md).

UI-05 acrescenta workspaceTabs: UUID ativo,1–32abas com UUIDs únicos;1–4módulos distintos por aba, foco pertencente à composição, columnSplit/rowSplit finitos20–80%. Schema6 permanece. Ausência recebe uma aba derivada do workspaceLayout legado somente na leitura, sem regravar o raw. Update/audit transacionais, fila de navegação/gravação e fechamento preservam fontes/drafts. A geometria 2D e o foco pertencem à aba; matéria/nota/PDF/player continuam compartilhados. [ADR-0016](../adr/0016-abas-e-grade-de-estudo.md).

GAM-04 migra v5→v6 transacionalmente: game_player.coins e game_ledger.coins passam a TEXT, conservando IDs/saldo/XP/JSON/origens/at/rule_version. economic_receipts guarda elegibilidade, consumo e créditos por fonte única. Novos créditos usam rule_version4; fontes anteriores conservam versão. Histórico acadêmico vira baseline, sem repetir recompensas antigas. Validação de backup aceita schema5/6 antes de migrar a cópia restaurada. [Economia e fórmulas](economy.md).

UI-06 acrescenta `settings.preferences.sidebarCollapsed`, booleano com default false para perfis anteriores. Update/audit usam a mesma transação e fila do provider; leitura não regrava JSON legado, abas/divisores permanecem e falha conserva o estado. O menu oculto sai da navegação por teclado/leitor de tela; botão de reabertura permanece na barra de abas. [Prova Windows](../validation/SIDEBAR.md).


## IA-01 — Snapshot e atividade local (schema7)

UX-01 conserva schema7. settings.recentNotes guarda até 30 IDs abertos; leitura ordena notas da matéria por esse histórico. Mover nota exige hash atual/rascunho salvo e troca notes.subject_id/frontmatter study_subject, conservando ID/caminho/corpo. Transação remove referências antigas de desks; falha restaura o arquivo. Cartões/marcações/snapshots conservam coleções históricas; abertura resolve matéria atual e relações incluem endpoints movidos. Importação externa copia com criação exclusiva, transação de catálogo e remoção da cópia em falha. Busca lê notas registradas/rascunhos sob demanda, sem varredura de pastas externas. [ADR-0018](../adr/0018-notas-e-navegacao.md).

| Tabela | Conteúdo e vínculo |
| --- | --- |
| activity_snapshots | ID/matéria/pacote JSON imutável/criação; apenas fontes selecionadas/hash/blocos |
| activity_requests | ID/matéria/snapshot/tipo/dificuldade/prompt/limite/data; resposta em rascunho separado |
| study_activities | Pedido/hash canônico/payload/tipo/título/revisão/data; unicidade pedido+hash |
| activity_cards | Atividade/item/cartão Study; remoção de cartão conserva payload/proveniência |
| quiz_sessions | Atividade/escolhas/versão/início/fim; guarda tentativas anteriores |

Migração7 adiciona tabelas sem reset. Importação inclui atividade,10cartões e audit na mesma transação. Resposta inválida pode permanecer como rascunho do pedido, nunca como atividade pronta. Conteúdo diferente cria revisão distinta; replay encontra a mesma atividade. Sessões exigem vínculo da matéria/versão e só expõem gabarito após finalizar. O limite do trecho/explicação no contrato existente de cartões passa de2.000para4.000caracteres para preservar atividades válidas; o agendamento/economia permanecem iguais. Backup manifest usa user_version real e aceita5/6/7. [Contrato](../contracts/study-activity-v1.md).

GAM-05 mantém SQLite7. `game_player.state.farm` armazena IDs permanentes de construção/preferência e postos `{stock,carryMs,settledAt}`. Perfis anteriores recebem campos vazios com baseline do main; prestígio conserva o objeto inteiro. `economy.motorEarned` e `engine.lastGain` passam a Amount (`number|string`) junto das cotações `budget/remaining/referenceRate/power`. Ledger/operações existentes registram custo material/recolhimento atômico e replay; inventário continua inteiro seguro. Backup real conserva postos e frações. [ADR-0019](../adr/0019-projetos-e-postos-da-farm.md).
