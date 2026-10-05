# NXT-01 — Auditoria independente da expansão de estudo

04/10/2026. **APPROVE WITH MITIGATIONS** para o incremento pessoal local Windows. Nenhum Critical/High novo validado permanece aberto. Duas lacunas Low de rastreabilidade e um bug funcional de agendamento foram corrigidos e verificados. O advisory High de tooling continua registrado na fase 5; este parecer não aprova publicação, nuvem ou distribuição assinada.

Auditor: agente separado do implementador, conforme autorização AppSec original. Revisão manual nas oito fases do anexo, com ferramentas existentes e provas próprias identificadas. Nenhum Electron, edição de produto, stage, commit ou push pelo auditor. Não é selo de scan externo nem reaproveitamento dos pareceres anteriores.

## 1. Contexto, fonte e cobertura

Base `6597e2822b34402bf45411f21bb3f5d1bb98c4e1`, branch `codex/study-expansion`, HEAD capturado `58937e6668182457a85623ba4dff37ef5e6d2ba4` mais working patch. Li AGENTS, CLAUDE, gotcha, ALPHA_STATE, ticket NXT-01, memória architecture/guidelines, manifest/lockfile, partes pertinentes do SDD/ADR-0011 e o anexo AppSec completo. project-memory-keeper não está disponível; leitura direta e handoff abaixo.

Conta Windows delimita o usuário local. Markdown/PDF/imagens/snapshots são entradas não confiáveis. Não há servidor HTTP de produção, IdP, JWT, credenciais obrigatórias ou compliance organizacional neste incremento.

| Captura própria | Digest SHA256 | Cobertura |
| --- | --- | --- |
| `.local/nxt01-audit-ba083570`, 07:18:23.622Z, antes da análise | `9c81297ad09ed039d6d7244e492229d8100029cd414e19adaf81cb27964e6dc4` | 222 arquivos de fonte/contexto; 49 de incremento |
| `.local/nxt01-audit-final-ffa38cb6`, 07:31:43.389Z | `1b04409523751cefdfdfe26791a58434efa60f91a555fac1314cce6abc5455d0` | 224 arquivos; 51 de incremento, incluindo correções/formatação/harness |
| `.local/nxt01-audit-css-172ad250`, 07:41:15.529Z | `c130924dfb7e14df56dac61a0b91719b766bd04632bc2c9a7303cbc3cda1192c` | Primeiro suplemento pointer-events, somente game.css |
| `.local/nxt01-audit-last-60098736`, 07:47:14.336Z | `b32547411204b0496eeacead81e1c60e2e8e4ef09c22e56a0695e4dcba21d238` | 3 CSS com trim de EOF e smoke-game atualizado |
| **Composição final**, `nxt01-audit-last-60098736/COMPOSITE_MANIFEST.json` | **`8fdf739701ddfc02261a8b6f2b0703b473fc5b3fbf53648d55a37c7981fdfd6d`** | 224 entradas do suplemento com 4 overrides; 52 arquivos de incremento iguais ao working tree na medição |

Comparei SHA256 entre origem/cópia e recalculei depois todas as entradas iniciais/finais. Digest: SHA256 de `path:sha256\n` em UTF-8/LF, na ordem de paths do manifesto. Composição aponta para arquivos das duas capturas imutáveis, sem fingir nova cópia integral. Probes/resultados derivados ficam fora das entradas seladas. Documentação/memória posterior e este parecer não fazem parte do selo.

Cobertura dos 52 arquivos, identificada individualmente no manifesto:

| Grupo | Arquivos |
| --- | --- |
| Main/preload | annotations, backups, export-destination, export-images, game, index, pdf-document, pdf-export, store, study, video-player, videos; preload/index |
| Shared | backup, contracts, game, pdf-export, study |
| Renderer | ActivityRail, App, BackupPanel, CityScene, CommandPalette, FlashcardsWorkspace, GameView, GraphWorkspace, NoteEditor, PdfAnnotations, PdfExportPanel, PdfPane, ProjectWorkspace, SettingsWorkspace, TodayWorkspace, VideoWorkspace, motion; game/graph/settings/study CSS |
| Testes/scripts/manifest | annotations/backups/game/preferences/projects/store/study/videos tests; smoke-expansion, smoke-annotations, smoke-knowledge-backup, smoke-game; package.json |

Também li suporte pertinente de vault/projects/desk, coleta/saída de PDF, foto/preferences/motion, fixture e configuração de build. Lockfile/deps intactos: SHA256 `30f06ba6e378447dd959ab2eec399a15715cc31c2dca5ef03b300d0cd59ec720`. As linhas abaixo referem-se ao suplemento final; quando indicado “inicial”, ao primeiro freeze.

## 2. Modelo STRIDE aplicado

| Cenário concreto | STRIDE | Controle checado / limite |
| --- | --- | --- |
| Outra janela/iframe invoca backup, marcas ou revisão | Spoofing/elevação | Wrapper verifica sender, mainFrame, URL inicial exata antes do schema/action; 23 canais específicos novos |
| Renderer injeta path de restore, preço, dueAt ou URL de seek | Tampering/elevação | DTOs strict, UUID/capacidades em memória, clock/preço main; picker resolve paths no main |
| Snapshot contém traversal, ADS, device name, alias, junction ou SQL extra | Tampering/elevação | Schema Windows/canonicalização por segmento/hash; DB readOnly sem extensões/schema exato/quick_check/FK; clone separado |
| Snapshot muda após seleção | Tampering | Receipt vincula hash do manifesto; restore revalida conteúdo e remove somente cópia nova em falha |
| Destino/ativação são confirmados sem evento | Repudiation | Lacunas corrigidas: setting+audit TX e audit antes de armar relaunch |
| Imagem/Markdown tenta rede, HTML ou leitura fora da origem | Informação/elevação | Contenção/raster limitado; SSR skipHtml/escape; impressão sem JS/rede/preload |
| Marca/momento/relação recebe ID de outra matéria | Informação/tampering | Owner resolvido no main; SQL parametrizado; nota também vinculada |
| Repetição ou payload trocado duplica review/compra | Tampering | UUID/request/version/TX; ledger e preços autoritativos |
| Pasta/codec/DB malformado esgota recursos | DoS | Limites de bytes/entradas/profundidade, pré-checagem do codec; sem orçamento universal de CPU/fuzzing |
| Snapshot copia conteúdo privado legítimo | Informação | Aviso de cópia local sem criptografia; exclusão por nomes conhecidos não sanitiza segredos no conteúdo |

Não validei caminho novo de execução arbitrária, capacidade main no guest YouTube ou sobrescrita de fontes pelo restore. Conta Windows comprometida/controlando FS não é isolada por esses controles.

## 3. Revisão de código — OWASP/CWE e controles concretos

**IPC e banco.** `main/index.ts:53`, `:67` e preload/contracts mantêm sender===window.webContents, frame===mainFrame e URL exata; schema antes da ação. Paths de snapshot/destino vêm do diálogo main; restore/activate recebem receipt de sessão, não perfil arbitrário. Inputs/textos são SQL bound; tabelas dinâmicas de suporte são enums internos. `store.ts:48` adiciona cinco tabelas/índice sem reset e `:13` nega versão futura.

**Backup.** Leitura integral de `backups.ts` e shared/backup: paths negam Windows separators/ADS/NUL/controles/device names/trailing dot-space; duplicatas case-insensitive. `:11`/`:13` revalidam canonicalização/links por segmento; `:17` compara size/mtime/dev/ino e caminho. `:137` usa VACUUM INTO parametrizado, incluindo SQLite ativo/WAL. Limites:100MiB/arquivo,64MiB/DB,300MiB total, até5.000arquivos,16níveis,10.000entradas; manifesto2MiB. `:10` exclui NodusBackups/NodusRestored e auxiliares/credenciais conhecidas, inclusive quando Documentos é origem.

`:175` abre DB readOnly, allowExtension=false, trusted_schema=OFF; versão5/schema igual ao Store gerado, quick_check/FK exigidos antes do Store restaurado. SQL/trigger extra é rejeitado mesmo com hash recalculado. `:186` restaura com wx em novo UUID, revalida hashes, remapeia vault/projetos/PDFs e remove destino antigo de export (`:209`). Fonte ausente conserva referência/omissão sem fallback externo. Cleanup só remove filho novo. Hash detecta alteração, não autentica o criador de snapshot forjado. SQLite e fontes externas não formam snapshot/commit conjunto.

**Study/anotações.** `study.ts:43`–`:50` vincula review ao payload/version e clock main, sem XP/moedas. `annotations.ts:15` verifica owner e SHA256 dos bytes reais; marcas usam coordenadas normalizadas/cor enum, até2.000/documento. `:31`–`:36` verifica vídeo/momento/owner, tempo0–86400, até500/vídeo; não aceita JS/URL para seek. Relações (`study.ts:52`) conferem ambas as notas, negam self-link/limitam1.000por matéria. Remoção de vídeo limpa momentos na mesma TX. Não alego validação semântica de conhecimento nem validação criptográfica do autor do conteúdo.

**PDF/imagens.** `export-images.ts:13`–`:38` nega URL/data/file, escape/ADS/encoding inválido, auxiliares, links e arquivo>2MiB. Header≤4MP/4096 é checado antes de nativeImage; PNG normalizado≤2MiB. Main limita50imagens/12MiB/20avisos sem path absoluto no erro. React SSR escapa títulos/texto, skipHtml/links inertes; imagens só data: produzido pelo main. `pdf-export.ts:50` mantém sessão efêmera/protocolo exato, egress/permissões/download/navegação negados e janela sandbox/contextIsolation/webSecurity, sem JS/Node/preload. `:62` revalida destino pela função pura; savePdfOutput mantém wx/fsync/audit opaco antes do recibo. Nota individual usa arquivo salvo, não buffer ainda em edição; fontes/drafts não são regravados pelo export.

**Renderer.** Busca usa catálogo real/comandos fixos, textos React. Grafo preview usa ReactMarkdown/GFM inerte com30.000chars, até 200nós/lista completa; GraphScene mantém área/visibilidade/reduced vivos, cancela tween/RAF e remove listeners/observer/geometrias/materiais/OrbitControls. App espera stash/flush antes da navegação; ProjectWorkspace conserva filas de save/discard e seleciona projeto por ID registrado. Ctrl+K/atalhos checam modal/cinema/área; AreaStage mantém inert/aria-hidden nas áreas ocultas. CSS final `game.css:190` deixa faixa vazia atravessar cliques e mantém botões clicáveis. O trim dos três CSS foi comparado e é apenas EOF.

Nenhum dangerouslySetInnerHTML, eval/Function, exec de projeto ou token localStorage entrou no produto. LocalStorage de suporte continua somente largura numérica do Explorer190–400. evaluate/CDP presentes em scripts são adaptações de prova sobre fixtures, sem exposição aos materiais/YouTube.

**Game.** Decorações usam SHOP/preço fixo e débito main (`game.ts:107`), saldo/compra duplicada negados, request/operação vinculados (`:73`). Ambiente é enum visual (`:80`), sem crédito adicional de XP/moedas; save/receipt/audit na TX (`:150`). Perfil antigo recebe golden sem reset. Último smoke-game calcula custo do catálogo e obtém saldo por rodadas reais, até 20; confere oito IDs sem injetar carteira.

## 4. Segredos, incluindo fixtures

Gitleaks8.30.1 interno, redact, sem instalar/configurar ferramenta:

- Inicial/fonte/contexto/patch: exit0, aproximadamente1,72MB, zero achados.
- Suplemento/testes/fixtures/harness/probes: scan final exit0, aproximadamente1,80MB, zero (`GITLEAKS-FINAL.json`).
- Commit `base..58937e6`:1 commit,59,54KB, exit0, zero (`GITLEAKS-COMMITS.json`).
- Primeiro CSS:18,09KB, exit0, zero. Último suplemento CSS/harness:50,30KB, exit0, zero (`nxt01-audit-last-60098736/GITLEAKS.json`).

Fixture .env contém explicitamente `not-a-real-token` e entrou no scan. Não usei dados pessoais/tokens nos probes. Histórico anterior à base não foi rescaneado aqui. Não alego ausência universal de segredos ou criptografia de backup; stage/docs posteriores precisam do scan do implementador.

## 5. Dependências e advisory

Node24.21.0 portátil/npm do projeto. Consultas próprias frescas: `npm audit --omit=dev --json` exit0/zero; completo exit1/**1High**, zero Critical, um advisory único. JSONs preservados. É resultado atual do registry, diferente das contagens propagadas em pareceres anteriores, sem mudança de lock.

Cadeia medida: electron-builder26.15.3→app-builder-lib26.15.3→@electron/get3.1.0→got11.8.6→cacheable-request7.0.4→http-cache-semantics4.2.0. Electron44.5.1 segue no audit completo: é runtime embarcado apesar de devDependency.

[GHSA-ch52-4w7c-c8xp / CVE-2026-93748](https://github.com/advisories/GHSA-ch52-4w7c-c8xp), CWE-524: max-stale pode divulgar respostas/cookies entre usuários de cache HTTP compartilhado contendo informação sensível. Advisory oficial consultado em04/10 afeta≤4.2.0 e não lista versão corrigida; npm agora indica `fixAvailable:true`. Esse flag não comprova resolução segura da cadeia nem autoriza downgrade automático do Electron.

Got tem `cache:undefined` (`node_modules/got/dist/source/index.js:65`); GotDownloader passa opções ao stream. Não encontrei cache HTTP autenticado/multiusuário configurado pelo app/scripts; cenário do advisory não foi demonstrado no fluxo local/YouTube/PDF. Continua risco de tooling, não corrigido/falso positivo. Preservar separação dos downloads de artefatos de credenciais/cache privado; verificar resolução compatível e repetir audit+package em manutenção/release. Não executei audit fix nem alterei lock/global.

## 6. Configuração aplicável

BrowserWindow principal, wrapper/preload, VideoPlayer, print surface e build foram inspecionados. Janela principal mantém sandbox/contextIsolation/webSecurity, Node ausente. Guest YouTube permanece sessão isolada sem preload, permissões/downloads/popups/navegações negados. Momento recria embed oficial com start validado; cinema/PiP conservam guest como antes.

Não há IaC/cloud/TLS/server-auth/CI novo para alegar aprovado. Perfis/vault/backups continuam locais sem criptografia/assinatura própria. CDP nos harness pertence às fixtures. Não publiquei serviço/release.

## 7. Validação, achados e limites

### Provas do auditor

Artefatos/JSONs em `.local/nxt01-audit-final-ffa38cb6`:

- Inicial 12/12 e suplemento **14/14**, exit0, Study/Annotations/Backups/Game com FS/SQLite reais (`own-test-results.log`). Repetição justificada por destino/cap novos; v1/v4→v5, bytes/drafts/economia, owner/replay e trigger de audit exercitados.
- `independent-probes.ts`/`PROBE_RESULTS.json`,07:34:00.675Z: **10 grupos aprovados**. 26 paths Windows hostis, alias por caixa, manifesto alterado pós-seleção, remap de setting importado/marcador externo intacto, junction na origem/snapshot, Documentos como vault sem recursão, imagens/encoding/header negados antes do callback, SSR escapado,50 reviews/quatro clocks inválidos/replay e destino+audit TX/rollback.
- `seal-and-activation.ts`/`SEAL_AND_ACTIVATION_RESULTS.json`: callback real extraído por AST, Store/Backups/FS reais; trigger aborta antes de armar perfil/agendar close; sucesso registra UUID. Apenas observadores de schedule/close: não é IPC/relaunch nativo.
- Método real chooseDestination extraído por AST/transpilação, Store/FS reais: setting+audit rollback. Não carrega Electron nem comprova picker/printToPDF.
- `IDENTITIES.json` e manifestos verificam hashes iniciais/finais, delta e JSONs do implementador; última composição verifica52 fontes/EOF CSS.

A primeira tentativa do probe suplementar terminou porque minha consulta usou coluna result em vez de outcome; corrigi só o artefato e rerun de todos os grupos passou. Header/SSR usam normalização controlada e não certificam codec/GPU/rede/pixels.

### Achados corrigidos

| ID/classificação | Cenário inicial/local | Fix final/prova |
| --- | --- | --- |
| NXT-A01, Low, CWE-778 | `pdf-export.ts:35` inicial persistia destino sem evento, indistinguível de alteração externa de setting | `:36` canonicalização pura+setSetting/audit pdf:destination, null, ok na TX; export só revalida (`:62`). Trigger real prova rollback/evento sem path/título |
| NXT-A02, Low, CWE-778 | `main/index.ts:71` inicial armava ativação/relaunch sem evento de sucesso | Mesma linha:resolve/valida receipt, audit UUID, então relaunchProfile/setImmediate.close. Callback/DB/FS prova audit falho sem armação/agendamento; native do implementador abaixo |
| NXT-B01, bug funcional de disponibilidade, sem exploit externo validado | `study.ts:28` inicial:15 easy reviews antecipados via biblioteca, UUID/version legítimos, geram número SQLite inseguro/RangeError ERR_OUT_OF_RANGE. TX preservava versão 14, mas próxima avaliação falhava | `study.ts:49`–`:50` cap 365, at safe, dias finite, due no intervalo Date, CLOCK_INVALID antes do UPDATE.50 reviews e NaN/Infinity/limites negados preservam card/receipt. Reprodução inicial em `CARD_PROBE_RESULTS.json` |
| NXT-H01, hardening funcional | Snapshot de Documentos podia incluir NodusBackups/NodusRestored | Exclusão `backups.ts:10` e Documents getter nativo atual; probe backup→clone→backup com vault=Documents comprova omissões |
| NXT-H02, bug visual observado pelo implementador | Faixa vazia de ambientes interceptava mina após câmera | `game.css:190` none na faixa/auto nos botões; delta/EOF selados e scan. Interação nativa não reproduzida pelo auditor |

Enviei os três primeiros achados antes da correção. A01/A02 fechados; B01 resolvido. Sem Critical aberto aprovado por prazo, checklist genérico ou recomendação vaga.

### Evidência Windows do implementador — execução separada

Li harness e JSONs, mas **não executei essas jornadas**:

| Arquivo em .local/evidence / dataUTC | Evidência lida |
| --- | --- |
| expansion-results.json,07:31:23.611Z | Pacote, busca/navegação/card/Hoje, payload extra negado,2foreign FORBIDDEN, errors[] |
| annotations-results.json,07:31:31.476Z | Marca/comentário/PDF original intacto, guest real start75, nota/capa/imagem/destino fixture. `nativePickerAutomated:false`; picker não automatizado, serviço de destino real na fixture |
| knowledge-backup-results.json,07:31:58.710Z | Grafo/relação,40pulsos/upgrade/3compras/noite, UIbackup/restore, relaunch real, raízes remapeadas/originais preservados,3foreign FORBIDDEN, errors[]; harness também testa trigger de ativação sem fechar |

Na prova de annotations, a nota foi editada intencionalmente675→717bytes para adicionar imagem; comparação pós-export é com717, não alegação de que export preservou675. Implementador informou typecheck/38 testes/package aprovados. Provas/regressões finais e hashes pertencem a [STUDY_EXPANSION](../validation/STUDY_EXPANSION.md).

As três jornadas acima antecedem pointer-events/EOF/harness final. Hashes históricos medidos pelo auditor: ASAR `484899e651bb1f5662cca5c15f5baead8376736a2fab5fbe8d85534e20e99a93`; EXE `912bb89498fa7c09ddd348bdfe207a6b4f99160c0108e58070624314e8bdba8d`. Não identificam automaticamente o pacote posterior. Não comparei fonte embutida nem afirmo equivalência TS/ASAR. A root mede/executa/registra a identidade final separadamente.

### Limites

Somente fixtures identificadas, sem projetos reais executados. Nenhum Electron/printToPDF/picker/YouTube/GPU/relaunch nativo pelo auditor, nenhum fuzzing universal, simulação de queda de energia ou atacante com controle da mesma conta. FS/SQLite e fontes não têm commit conjunto/locks cooperativos; checagens reduzem races, não eliminam toda concorrência. DB/SSR/codecs têm limites de tamanho, sem orçamento universal de CPU/memória. Hash não autentica snapshot; backup inclui conteúdo privado legítimo e não o sanitiza.

## 8. Decisão e memória

**APPROVE WITH MITIGATIONS**, composição `8fdf7397…`: fronteiras locais revisadas, Low corrigidos, intervalo resolvido, sem correção de fonte pendente identificada neste recorte. Advisory High de tooling permanece com exploração contextual não demonstrada; aprovação local não o encerra.

Handoff para root, sem editar memória compartilhada:

1. Schema5 aditivo; cartões/relações/marcas/momentos são metadados. Markdown/PDF continuam canônicos; review UUID/request/version, cap 365, clock main, sem XP/moedas.
2. Snapshot local limitado/não autenticado; exclusões por nome não garantem segredo removido. Receipt de sessão, clone/roots remapeados, sem herdar pdfDestination. Audit antes de armar relaunch.
3. Destino PDF main/canônico, setting+audit TX, revalidação sem nova escolha; imagens raster locais limitadas/normalizadas, data: produzido pelo main.
4. Flush/filas, inert/gates de área/cinema/reduced continuam essenciais. GSAP/Three são apresentação; economia main.
5. Captura/suplemento/binário/documentação são identidades distintas. Audit atual prod 0 / full 1 High não é permanente. Scan staged final inclui docs/fixtures/harness posteriores ao selo.

Fechamento funcional/documental, identidade das jornadas Windows finais e commit/push ficam com o implementador no ticket autorizado.
