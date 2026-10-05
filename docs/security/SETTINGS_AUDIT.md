# CFG-01 — auditoria AppSec de configurações, perfil e gestão local

Data: 03/10/2026. Recorte: MVP pessoal/local Windows, Electron/React/TypeScript/SQLite. Autorização: auditor independente solicitado pelo usuário, conforme as oito fases do anexo AppSec. O auditor escreveu apenas este parecer e artefatos ignorados; não alterou produto/harness, abriu Electron, fez commit/push ou publicou serviço.

**Decisão: APPROVE WITH MITIGATIONS para a fonte congelada e o suplemento final abaixo.** Revisão e comparação final concluídas, sem novo achado de vulnerabilidade confirmado. Uma falha funcional de ciclo de vida do player, reproduzida pelo implementador durante CFG-01, foi corrigida no suplemento e comprovada por ele no pacote. O advisory High de tooling continua avaliado, sem declarar sua correção.

## Identidade e cobertura

AGENTS.md, CLAUDE.md, gotcha.md, ALPHA_STATE, CFG-01, arquitetura/guidelines da memória, package.json/lockfile e anexo completo foram lidos. `project-memory-keeper` não está disponível nas ferramentas desta sessão; leitura direta e recomendações de memória na fase 7 substituem esse mecanismo. Auditoria manual do incremento, sem novo scan canônico do plugin ou selo herdado de outro ticket.

| Artefato | Identidade e escopo |
|---|---|
| Base / branch | `92cc3573d9ce9bf7c75fefcab1765bdaab5f92cb` / `codex/settings-profile` |
| Freeze inicial próprio | `.local/cfg01-audit-fb02cc53`, 185 entradas; digest `34a7c877eb78ab87842aa064e7c07fbfbfd9fe5b7d17106a5633e79bf9a264c7` |
| Suplemento intermediário próprio | `.local/cfg01-delta-9d11ec85`, dois harnesses; digest `6bac0ff5de81105e4e087e0840173ef9b53b7020dfa11694c57871f9780db550` |
| Suplemento final próprio | `.local/cfg01-final-bdbd6562`, video-player + dois harnesses; digest `1d13b934690158c4207a51ee02e62c48bd25528f5ad2afdb09c10a403731ef25` |
| Lockfile | SHA256 `30f06ba6e378447dd959ab2eec399a15715cc31c2dca5ef03b300d0cd59ec720`; sem dependência nova |
| Provas próprias | `.local/cfg01-evidence`; probe isolado `.local/cfg01-probe.ts` |

Captura feita antes da revisão, com SHA256 de origem/cópia comparado. Os manifestos registram caminho/hash/tamanho; digest da lista canônica caminho+hash. Os 185 hashes armazenados e as três entradas finais foram conferidos. O suplemento conserva deltas separadamente, sem reatribuir novos bytes ao freeze inicial. Comparação final: 27 arquivos do incremento permanecem iguais à captura inicial; três coincidem com o suplemento final, sem arquivo de código/dependência/script/teste do diff omitido. Core `8f1a47e`, UI `5eb2142` e ajuste de lifecycle/harness `c68a020` são checkpoints do implementador. Documentos/memória de fechamento posteriores não recebem estes digests.

Cobertura inicial: **28 arquivos** de código/dependências/scripts/testes no diff — package.json; main index/preferences/photo-input/app-management; preload index; shared contracts/preferences; renderer ActivityRail, Ambient, App, CityScene, Icon, main, motion, NoteEditor, ProjectEditor, preferences, SettingsWorkspace e game/projects/refinement/settings/styles/themes/videos CSS; tests/preferences.test.ts; scripts/smoke-settings.ts. Suplementos revisam smoke-settings, o delta de smoke-videos e main/video-player, totalizando **30 arquivos distintos** do incremento. Suporte de Store, gates de Arcade/GameView/ProjectWorkspace, navegação/stash/flush, CSP e configuração de build foi conferido quando necessário. Nenhuma aprovação integral retroativa do aplicativo.

Todas as referências de linha usam o freeze inicial, exceto video-player e scripts suplementares identificados.

## 1. Design e ameaças — STRIDE

| Ativo / fronteira | Ameaça e cenário | Probabilidade / impacto local | Controle conferido | Limite |
|---|---|---|---|---|
| Perfil, caminhos e IPC | Spoofing/elevação: guest YouTube ou outra janela tenta ler dados/alterar foto/abrir arquivo | Baixa após gate / exposição ou alteração local | Sender, mainFrame, URL exata e Zod antes da operação; seis canais fixos | Provas nativas do implementador separadas da revisão própria |
| Foto → codec main | DoS/injection: SVG, bytes excessivos ou raster de dimensões enormes | Média antes dos limites / consumo de recursos e conteúdo indevido | Bytes 5 MiB, PNG/JPEG e dimensões prévias, verificação após decode, crop/resize/PNG local | Preflight não é validador completo de codec nem orçamento rígido de CPU |
| Preferências / DB | Tampering/repudiation: payload extra, atualização parcial ou audit falha | Média / perfil/preferências inconsistentes | Schemas restritos, valores fechados, SQL bind, save+audit transacionais | Conta Windows continua controlando DB local |
| Nome/foto/pastas | Disclosure: PII vira HTML, URL externa ou log | Baixa após controles / exposição de dados pessoais | React texto, data PNG produzida no main, nenhuma URL/path recebido na foto, logs só ação/resultado | Perfil e caminhos são mostrados ao próprio usuário; SQLite/backups sem criptografia própria |
| Abertura de pasta | CWE-78/22: renderer envia comando, URL ou caminho de arquivo executável | Baixa após controles / execução ou abertura indevida | Enum data/vault, registro no main, realpath e isDirectory antes de shell.openPath | Shell e associações do Windows permanecem fronteira externa; diretórios registrados podem estar em outro disco/rede |
| Notas/projetos/jogo | Tampering/DoS: área oculta aceita Ctrl+S/QTE ou desligar animações muda relógio | Baixa após gates / buffer ou tentativa local | Contexto settings no shortcut, activeArea por área/cinema, stash/flush anterior; controle de movimento só apresentação | Sem prova exaustiva das corridas legadas ou GPU pelo auditor |

Novo fluxo local: arquivo de foto selecionado → bytes → decoder nativo no main → PNG pequeno → settings SQLite → img na UI. Gestão expõe diretórios registrados somente à janela autorizada. Não há upload remoto, conta, token, IdP, nuvem ou isolamento multiusuário acrescentado.

## 2. Diff — controles por cenário

| Cenário | Controle verificado |
|---|---|
| Outro sender tenta preferences/profile/app channels | `main/index.ts:43–45` nega webContents diferente, subframe e URL diferente antes do schema; `:54–68` registra seis operações específicas. `preload/index.ts:4–9` não expõe ipcRenderer, fs ou shell genéricos |
| Campo photo/URL/path entra em update; tema vira CSS arbitrário | `shared/preferences.ts:2–10` restringe tema a três valores, boolean a tipo real, nome a 80 caracteres sem controles internos, update não vazio e schemas strict. Foto aceita somente Uint8Array limitado; folder enum. Provider escreve datasets a partir dos valores retornados, e CSS usa tokens fixos |
| PNG/JPEG provoca decode desnecessário ou persistência de conteúdo original | `photo-input.ts:3–24` limita tamanho e lê header/dimensões antes do codec. `main/index.ts:57–64` verifica decode, dimensão <=4096 e <=4 milhões de pixels, recorta centro e gera PNG256×256; saída <=380 KiB. Persiste apenas a imagem gerada, sem nome/caminho do arquivo |
| Atualização de nome/tema/off/remove deixa sucesso falso após falha de audit | `main/preferences.ts:12–16` valida e faz setting+audit na mesma transação; photo/remove mantêm nome/tema/off. `:6–10` usa defaults diante de JSON/schema inválido sem reescrever o valor corrompido na leitura |
| Gestão monta SQL com nome de tabela/caminho vindo do renderer | `app-management.ts:9–11` usa lista fixa de tabelas e nomes do DB; não recebe nome de tabela. `:13–17` aceita somente enum, resolve pasta registrada, exige caminho absoluto e diretório existente. `main/index.ts:68` chama shell.openPath com esse resultado, sem string de comando |
| Resposta IPC confirma preferência antes de persistir ou mutações concorrentes sobrescrevem foto/nome | `renderer/preferences.tsx:18–25` usa guard/ref de mutação e busy, altera estado só após r.ok. Arquivo é lido por File.arrayBuffer, com limite também no renderer. UI desabilita controles de mutação; segurança depende novamente dos controles do main |
| Nome ou foto vira execução na UI | Avatar `preferences.tsx:28–30` e SettingsWorkspace usam texto JSX; img recebe o data PNG retornado pelo main. Não há HTML executável, eval/Function, URL de foto remota, path genérico ou token em localStorage novo |

Não se cria autenticação fictícia para o app pessoal. Nome/foto em claro no DB são dados locais deliberados; o boundary de identidade continua a conta Windows. Não há reset/migration do schema4 nem alteração da fonte Markdown, métodos de escrita de projetos, economia ou relógios.

## 3. Segredos

Gitleaks **8.30.1**, regras padrão, modo diretório, redact100%, max-decode-depth5: freeze inicial **~1,32 MB**, suplemento intermediário **~32,80 KB**, suplemento final **~38,07 KB**, todos **exit0/zero achados**; gitleaks-initial/intermediate/final.json vazios. Inclui testes, fixtures, scripts e documentos capturados; nenhum dado de teste recebe isenção. O próprio relatório e probe de laboratório passaram checagem separada, em gitleaks-report.json.

Vault/bancos/perfis pessoais, builds, node_modules e artefatos ignorados não entram na fonte versionada. Este scan de capturas é incremental; não repete todo o histórico Git nem transforma o scan histórico do MVP em cobertura de bytes novos. Documentos/stage posteriores precisam da checagem própria do implementador.

## 4. Dependências

Auditor executou consultas novas no freeze: `npm audit --omit=dev --json` **exit0/zero**; completo **exit1/oito entradas High/zero Critical/um advisory único**. Artefatos audit-production.json/audit-full.json. Sem dependências ou lockfile novos; package.json acrescenta alias test:settings. Electron é runtime embarcado apesar de devDependency, portanto omit=dev isoladamente não o aprova.

**GHSA-ch52-4w7c-c8xp / CVE-2026-93748 / CWE-524**, http-cache-semantics <=4.2.0: divulgação de resposta autenticada em cache HTTP compartilhado com max-stale. Consulta oficial em03/10: nenhuma versão corrigida, High8.7 CVSS4; npm informa7.5 CVSS3.1. [Advisory oficial](https://github.com/advisories/GHSA-ch52-4w7c-c8xp).

Cadeia existente electron-builder/app-builder-lib → @electron/get3.1.0 → Got11.8.6 → cacheable-request7.0.4 → http-cache-semantics4.2.0. Downloader instalado passa opções ao Got; defaults `cache: undefined` e branch cacheable-request só quando configurado (`got/dist/source/index.js:65`, `core/index.js:1088`) foram relidos. O workflow não habilita cache HTTP compartilhado/autenticado; este diff não acrescenta cliente de rede. Cache de artefatos e cache Chromium YouTube são mecanismos distintos. Exposição local segue documentada na memória/gotcha, sem corrigir a CVE ou aplicar downgrade automático. Reavaliar ao mudar cache/CI/distribuição e quando houver remediação compatível.

## 5. Configuração, foto, shell e movimento

CSP da mesa continua img-src self/data, script-src self/nonce e sem unsafe-eval; styles unsafe-inline preexistente é necessário aos estilos de apresentação atuais, sem novo script inline. React texto e normalização PNG complementam a CSP. Sessão remota YouTube não recebe o perfil, paths ou bridge. Configuração de sandbox/contextIsolation/webSecurity, Node desligado, sessão remota separada e autorização IPC continuam intactas.

A API oficial da versão instalada informa que createFromBuffer tenta PNG/JPEG; crop e resize retornam nova imagem, e toPNG produz Buffer. A sequência do produto corresponde a essas APIs. Limites pré/pós decode oferecem camadas distintas; um header aceito não comprova imagem válida, metadados ou codec sem falhas. O auditor não executou nativeImage nem fez fuzzing do codec. [NativeImage Electron44.5.1](https://github.com/electron/electron/blob/v44.5.1/docs/api/native-image.md).

Shell.openPath retorna string vazia no sucesso e mensagem de erro no insucesso; o handler confere o resultado e retorna erro genérico. Resolver diretório no main é necessário porque a API pode abrir arquivos pela associação padrão do sistema. Nenhum comando, URL ou arquivo arbitrário vindo do renderer chega ao sink. Conta Windows pode alterar o registro/disco; não se afirma sandbox contra o próprio usuário ou atomicidade entre realpath/stat e abertura pelo shell. [Shell Electron44.5.1](https://github.com/electron/electron/blob/v44.5.1/docs/api/shell.md#shellopenpathpath).

Movimento: `preferences.tsx:6–10` combina sistema reduce **OU** opção persistida off; eventos do sistema e nodus:appearance notificam consumidores, com remoção simétrica. useReducedMotion em motion mantém essa combinação. CityScene/Ambient leem a mesma fonte e removem listeners/RAF/observers no teardown; câmera é interrompida no evento e cidade redesenha por demanda sob reduce. themes.css:15 remove animações/transições CSS sob off. Isso não muda timing essencial de Arcade/foco/main nem reprodução do guest.

App inclui settings no gate do shortcut de estudo (`:72–77`), mantém áreas visitadas montadas e navega pela fila existente de stash/flush (`:151–164`). Explorer/cidade/configurações recebem activeArea por área e cinema (`:199–201`). AreaStage mantém camadas ocultas inert/aria-hidden; esses atributos complementam, não autorizam IPC nem cancelam por si mesmos listeners. Tokens de tema nos editores não recriam CodeMirror nem serializam texto. Foto/nome não são interpolados em CSS/HTML.

Logs: preferences.update/profile.photo/profile.photo-remove persistem ação, entidade null e resultado ok na transação. Erros de IPC usam canal/outcome e mensagem pública genérica; sem nome, bytes/foto ou caminho pessoal nos eventos. Caminhos reais aparecem na seção Dados por intenção do usuário, sem passagem ao remoto. Não há telemetria/log remoto novo.

## 6. Achados e provas próprias

**Nenhuma vulnerabilidade nova confirmada neste recorte; nenhuma correção de produto solicitada pelo auditor.** A revisão conferiu os controles acima em cenários concretos, sem usar checklist ou resultados documentais como execução.

Execuções próprias em Windows/Node24.21.0:

- `tests/preferences.test.ts` congelado: **3/3 passaram**, zero fail/skip, tests-preferences.txt. Persistência/restart/schema4; rollback real por trigger SQLite na auditoria; outro setting e matéria preservados; foto/schema/header/bounds; contagens e pastas reais, entradas extras/arquivo/ausente negados.
- `cfg01-probe.ts` / probe-results.json: SQLite/FS reais em perfil isolado identificado. Oito payloads hostis negados; __proto__ não propagado; nome literal preservado como dado; audit sem nome/path/foto, falha de audit em foto reverte setting; JSON/schema corrupto retorna defaults sem reescrever. Schema4 e linhas da matéria intactos.
- Mesmo probe: PNG4MP admitido no preflight, uma coluna acima e lado4097 negados; 33 truncamentos, JPEG malformado, GIF/WebP/SVG e JPEG com5MiB só de marcadores negados; tipos/bytes inválidos no schema negados. São provas do parser/preflight, sem afirmar decode nativo ou rejeição universal de todo arquivo malformado.
- Mesmo probe: resolução de diretório em disco real, quatro payloads path/command e diretório relativo negados. shell.openPath não foi executado pelo auditor. Matriz real motionPreference false/true/true/true e remoção dos listeners passaram em JSDOM com MediaQuery controlado; Avatar real escapou inicial textual. Unidade de browser com globals de laboratório, sem alegar IPC, Windows reduce nativo, foco/inert ou GPU.
- Gitleaks, npm audit e verificação de185 hashes conforme fases3/4 e identidade. Não foi repetida a suíte inteira do app, sem delta de domínio que justificasse.

A primeira versão do probe supunha que newline inicial no nome seria rejeitado, mas trim o normaliza corretamente; a fixture foi corrigida para controle interno. O ambiente Node do probe também precisou de global React para JSX fora do pipeline Vite. Execução final passou; falhas de preparação foram preservadas e não classificadas como defeitos do produto.

Provas **do implementador**, lidas e distintas da execução própria: `.local/evidence/settings-results.json`, **2026-10-03T22:58:35.202Z**, packaged=true, perfil `settings-ncTLPa`, exit0 informado no pacote final. Upload real PNG/JPEG pelo input e IPC, normalização256×256, inválido mantém foto, remoção mantém nome; três cores computadas distintas; off/on/câmera e preferência OS; mesmo DOM/editor/canvas; viewport1040×760; dados/runtime/contagens reais; shell.openPath pasta de dados fixture r.ok; seis novos canais de outro sender retornam FORBIDDEN, estado intacto; restart/perfil/foto/tema/off, Markdown e projeto BOM/CRLF/draft. errors vazio. O harness cria uma janela deliberadamente insegura apenas para essa prova hostil e a destrói em finally; essa configuração não pertence ao produto.

Suplemento dos scripts: smoke-settings confere a confirmação IPC/dataset ao clicar, viewport real compacto e abertura de diretório da fixture. smoke-videos acrescenta PiP→Configurações/off/cinema com mesmo guest/reprodução, readiness limitada por polling do guest/video real e verificação de superfície/ausência de closed intermediário antes de crash/retry após restart. Revisão/scan são próprios; execuções dessas jornadas são do implementador. Vídeos final: `.local/evidence/videos-results.json`, **2026-10-03T22:59:01.257Z**, perfil `videos-hGNlm2`, packaged=true, errors vazio; reprodução real do YouTube, isolamento/permissões/IPC, CFG-PiP/off/cinema e crash/retry passaram. Nenhum resultado antigo de MED-01 foi atribuído ao script novo.

### Falha funcional corrigida pelo implementador: closed intermediário durante open

O probe nativo do implementador `.local/probe-video-open.mts`, log settings-player-probe.log, mostrou closed/loading/ready em sequência, guest presente e surface=false; após crash, error sem botão de retry. Causa na fonte inicial: `VideoPlayer.open:23` chamava close, publicando closed durante uma abertura e permitindo ao hook limpar seu vídeo. Isso prejudicava controle/recuperação do player; não houve cenário adversarial externo ou bypass de IPC validado pelo auditor.

Correção revisada no suplemento final: `video-player.ts:23` chama dispose privado (`:51–54`), que limpa view/current antes de remover/fechar o WebContents antigo sem publicar closed. Close explícito (`:55–58`), remove e encerramento da janela continuam publicando closed. URL é validada antes do descarte; callbacks de load/crash da view antiga continuam negados por identidade. Sessão, allowlist, RTC, permissões, preferências, sender e bounds não mudaram. A prova final do implementador confere superfície após restart, nenhum closed transitório, erro/crash e retry pelo YouTube real. O auditor revisou fonte/probe/log, sem executar Electron ou apresentar mock como integração.

Logs finais `.local/evidence/settings-final-settings.log`, settings-final-videos.log, settings-final-journey.log e settings-final-smooth-ui.log foram lidos; o implementador informou exit0 no mesmo pacote para as quatro jornadas. R8 nuvem/mobile e testes externos continuam fora do recorte local.

Identidade do **pacote final** medida pelo auditor: ASAR SHA256 `08F62C1D9197BBE07118BF48076F6FC16847AC21697A01C0DAF3CD00E48EE5EA`; EXE SHA256 `ED36D014CF9FC59F69BF56940F37E858902BCB1FBDCED49742EA325F10871CF3`. Os hashes anteriores ao fix de lifecycle identificavam outro pacote e não aprovam esta execução. Hash é identidade; não se extraiu ASAR, comparou módulos com fonte ou executou o binário pelo auditor.

Limites: sem Electron/nativeImage/shell/player/GPU próprios; sem headers/EXIF ou todas as codificações raster analisados em runtime; sem fuzzing exaustivo de codec/concorrência. A preferência de movimento não é relógio de domínio. APIs legadas de notas e gestão do perfil pela conta Windows mantêm os limites documentados. Não há nova certificação de distribuição pública, nuvem, criptografia do DB ou assinatura/proveniência do pacote.

## 7. Handoff de memória

Recomendações ao implementador; o auditor não escreve memória:

- Arquitetura: foto por bytes, limite5MiB/header4MP/4096, decoder no main e PNG256 persistido em settings existente; nenhum path/URL remoto no IPC de foto. Perfil é local e não autenticado, com PII em SQLite protegido pela conta Windows.
- Guidelines: normalizar imagem antes de persistir e conferir dimensão antes/depois de decode; preflight de header não substitui codec válido nem orçamento universal. Foto/update/remove e audit na mesma transação; rollback deve conservar valor anterior sem conteúdo privado nos logs.
- Arquitetura/guidelines: abertura por enum e diretório registrado, realpath/isDirectory e confirmação de shell.openPath; não expor path/exec genérico ou string de shell ao renderer. Contagens consultam tabelas fixas.
- Guidelines: off persistido OR reduce do sistema; listeners simétricos, RAF/tweens cancelados e redraw sob reduce. Timing essencial permanece no domínio. Adicionar nova área aos gates de atalhos e polling, além de inert.
- Guidelines/gotcha: limpeza para substituir player não deve emitir o evento de fechamento explícito. Preservar identidade da view nos callbacks e provar superfície/erro/retry após restart, além da presença do guest remoto; ausência temporária de um elemento loading não comprova readiness.
- Memória de riscos: advisory High de tooling permanece avaliado, não corrigido; reavaliar cache/CI/publicação. Identidades de fonte, suplemento, pacote e jornadas de outro executor permanecem distintas.

## 8. Veredicto delimitado

**Decision: APPROVE WITH MITIGATIONS para a fonte pessoal/local congelada `34a7c877…`, composta com o suplemento final `1d13b934…`.** Comparação final concluída, sem vulnerabilidade nova confirmada em aberto. Falha funcional de lifecycle corrigida/revisada e comprovada pelo implementador no pacote final. Nenhuma aprovação de bytes não revisados.

| Severidade | Aberto | Corrigido / mitigado | Observação |
|---|---|---|---|
| Critical | 0 | 0 | Nenhum confirmado/reportado pelo audit |
| High | 0 de código | 1 advisory existente de tooling | Oito entradas npm; exposição avaliada, componente afetado permanece |
| Medium | 0 | 0 | Nenhum confirmado |
| Low | 0 | 0 | Nenhum novo confirmado |

**Secrets:** clean nas capturas/suplementos/relatório identificados, incluindo testes/fixtures. **Dependencies:** um advisory High/zero Critical; produção omit=dev zero com limite registrado. **Threat model:** presente, com arquivo raster → codec privilegiado e pastas → shell. Nenhuma ação de produto/auditoria pendente deste parecer. Fechamento de memória/docs/stage posterior cabe ao implementador. Uma eventual distribuição pública exige revisão própria do release.
