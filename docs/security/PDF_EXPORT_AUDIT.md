# EXP-01 — auditoria AppSec de exportação local de Markdown em PDF

Data: 03/10/2026. Recorte: incremento EXP-01 do MVP pessoal Windows, Electron/React/TypeScript/SQLite. Auditor independente conforme o pedido do usuário e as oito fases do anexo AppSec. O auditor alterou apenas este parecer e artefatos ignorados; não editou produto/harness/memória, abriu Electron, fez stage/commit/push ou publicou serviço.

**Decisão: APPROVE WITH MITIGATIONS para a fonte congelada abaixo.** Um Low de ausência de audit de sucesso foi confirmado no fluxo de fonte, corrigido pelo implementador e validado pelo auditor com SQLite/FS reais. Nenhuma vulnerabilidade nova confirmada permanece aberta. O advisory High existente de tooling permanece avaliado, sem alegar correção do componente.

## Identidade e cobertura

AGENTS.md, CLAUDE.md, gotcha.md, ALPHA_STATE, EXP-01, memória architecture/guidelines, partes pertinentes de SDD/arquitetura/ADRs, manifests, lockfile e anexo completo foram lidos. project-memory-keeper não está disponível nesta sessão: leitura direta e handoff da fase 7. Revisão manual do incremento, sem novo scan canônico/selo Codex Security nem atribuição de scans de outros tickets.

| Artefato próprio | Identidade |
|---|---|
| Base / branch | 6897adbf3c921acd78a88686572acfc77bb2c705 / codex/pdf-export |
| Captura inicial, anterior à análise | .local/exp01-audit-4c899011 — 196 entradas; 2026-10-03T23:30:02.3863345Z; digest b225d61922b4b12d4e61f7e9eda24f1ffba0fd6a40d9979c662639821108530c |
| Fonte final própria | .local/exp01-audit-final-5532bd4a — 14 arquivos do incremento; 2026-10-03T23:38:19.2750967Z; digest 04b47c95ee6a087e130a405b56233250418605ad42022b37c0edca19c2383816 |
| Lockfile, sem alteração de dependências | SHA256 30f06ba6e378447dd959ab2eec399a15715cc31c2dca5ef03b300d0cd59ec720 |
| Provas próprias | probe.ts/PROBE_RESULTS.json na captura inicial; output-probe.ts, root-probe.ts, respectivos resultados, EXECUTIONS.json e reports npm/Gitleaks na captura final |

Digest = SHA256 da lista ordenada path:sha256 com LF; manifestos registram também bytes. Hash de origem/cópia comparado durante a captura. Verificação independente em Node confirmou os 196 hashes iniciais, 14 finais e ambos os digests; artefatos derivados não entram nesses manifestos. Para resolver imports dos testes finais, Store foi copiado da captura inicial sem mudar bytes: SHA256 d2e760288f14583d8dab762ac9aba6024846f9cd107a407e598a70f138eb7c24.

Cobertura: todos os **14 arquivos** de código/dependências/scripts/testes do incremento:

- package.json; src/shared/pdf-export.ts e contracts.ts; src/preload/index.ts.
- src/main/index.ts, export-notes.ts, pdf-document.tsx, pdf-export.ts e export-output.ts.
- src/renderer/PdfExportPanel.tsx, SettingsWorkspace.tsx e settings.css.
- tests/pdf-export.test.ts e scripts/smoke-pdf-export.ts.

Suporte conferido: Store/audit/SQL, registro das pastas de projetos/vault, build e configuração Electron. A captura final revisa todos os 14 arquivos, com quatro deltas em relação à inicial: helper export-output novo, pdf-export, testes e harness. As demais fontes de suporte continuam iguais à captura inicial. A fonte atual foi comparada com os 14 hashes finais; core fef5821 e UI 38651b4 são checkpoints do implementador. Documentos/memória/quadro posteriores não recebem esse digest. O delta posterior de .gitignore foi lido: apenas /output/pdf/ para ignorar a cópia do PDF fictício, sem alteração de produto/harness. Referências de linha abaixo usam a fonte final, exceto o achado original explicitamente identificado.

## 1. Design e ameaças — STRIDE

| Ativo / fronteira | Cenário | Probabilidade / impacto local | Controle verificado | Limite |
|---|---|---|---|---|
| IPC → leitura/exportação | Spoofing/elevação: outra janela ou guest tenta exportar notas | Baixa após gate / exposição local | Sender + mainFrame + URL exata; dois canais fixos e schemas strict antes da operação | IPC nativo executado pelo implementador |
| Pasta registrada → coletor | Tampering/disclosure: trocar raiz por junction; ../, ADS, alias ou .git expõe conteúdo externo | Média antes dos controles / leitura indevida | Registro no main, lstat/realpath, igualdade canônica da raiz, contenção e revalidação de descendentes | Conta Windows com controle do FS/DB não é adversário isolado pelo app |
| Markdown → HTML/Chromium | Disclosure/elevação: script, imagem file/HTTP, link ou CSS tenta executar/buscar dados | Média antes dos controles / acesso a disco/rede | SSR React, skipHtml, links/imagens inertes; sessão separada sem bridge; JavaScriptfalse, CSP e egress negado | Sem fuzzing completo de parser/Chromium |
| Exportação → Downloads/audit | Repudiation/tampering: sucesso sem evento ou falha sobrescreve PDF existente | Low no contexto local / rastreabilidade e perda de saída | wx, UUID, fsync/close, audit opaco obrigatório; rollback apenas da saída nova | FS e SQLite não formam uma transação atômica contra queda de energia |
| Coletor/SSR/print | DoS: árvore profunda/ampla ou nota/PDF grande | Média / indisponibilidade temporária | 16 níveis, 4000 entradas, 200 notas, 2 MiB/nota, 6 MiB total, um export em andamento, print timeout60s, PDF32MiB | Coleta/SSR síncronos não têm orçamento rígido de CPU/memória |
| Dados privados → PDF local | Disclosure: cópia legível permanece em Downloads | Esperada / confidencialidade local | Ação explícita, destino exibido; sem conteúdo/título/caminho no audit | PDF e dados locais não são criptografados pelo app |

Nova fronteira: arquivo Markdown registrado → cópia HTML inerte no main → janela de impressão efêmera isolada → novo PDF em Downloads. Fonte e rascunho não mudam de autoridade; a exportação usa bytes salvos no disco.

## 2. OWASP/CWE e cenários revisados

- A01/CWE-862/863: src/main/index.ts:43–58 mantém a guarda antes dos dois handlers. Não se aceita root/destination/URL arbitrários; projeto exige UUID e registro SQL parametrizado. A interface chama apenas duas operações específicas do preload, sem fs/shell/ipcRenderer genéricos.
- A03/A10, CWE-20/22/918: export-notes.ts:8–24 rejeita componentes vazios, ponto/traversal, barra invertida, caminhos absolutos, NUL/ADS, links/junctions e escape canônico. Exclusão lexical é complementada por caminho canônico, incluindo auxiliares com caixa/alias. pdf-export.ts:16–25 revalida a raiz registrada antes de usar realpath; vínculo desconhecido falha fechado.
- A03/CWE-77/78/1321: não há execução/shell/eval de conteúdo do produto. Zod strict nega campos extras e __proto__; não há merge de configuração controlada pelo Markdown. SQL usa bindings. Testes usam db.exec exclusivamente para criar/remover triggers identificados de fixture.
- A02/A07/CWE-352: app local sem conta, cookies de autenticação, IdP ou multitenancy. Não se inventou MFA/CSRF/IAM. Capacidade local depende do sender/frame/origem e registro de pasta. Unicode/UTF-8 fatal e NUL são conferidos antes de renderizar; BOM/frontmatter são removidos somente da cópia.
- A04/A05/A08: coleta/read é limitada por descritor, com revalidação dev/ino/size/mtime (export-notes.ts:46–58), não um readFile ilimitado depois de stat. Renderer tem guard de clique; main tem busy independente (pdf-export.ts:34–38). Export não chama save/draft nem migra schema; package adiciona apenas alias npm.
- A09/CWE-778: a única nova lacuna confirmada está descrita e encerrada na fase 6. Falhas usam audit do canal/código e mensagem pública genérica, sem stack/path/texto de arquivo.

## 3. Segredos

Gitleaks 8.30.1, redacted, em diretórios reais:

- Captura inicial de 196 entradas, incluindo testes, fixtures/scripts e lockfile: ~1.37MB, exit0, zero achados.
- Fonte final de 14 arquivos, inclusive helper/teste/harness novos: ~85.11KB, exit0, zero achados.
- Artefatos/probes próprios e fixtures sintéticas também conferidos; zero achados. SQLite binário não foi semanticamente decodificado pelo scanner: SQL/strings de fixtures e scripts foram examinados, sem material pessoal.

Este é audit incremental após os audits anteriores do projeto; não se repetiu todo o histórico de refs, nem se declarou novo scan histórico integral. Documentos/stage de fechamento posteriores exigem o scan próprio do implementador. Nomes, bytes e conteúdo de fixtures são fictícios; nenhum vault/banco pessoal foi usado.

## 4. Dependências e exposição

Node24.21.0/npm do projeto: npm audit --omit=dev --json exit0, zero vulnerabilidades reportadas; audit completo exit1, **8 entradas High / zero Critical**, derivadas de **um advisory**, não oito CVEs distintos. Reports brutos preservados. Electron44.5.1 é runtime embarcado apesar de devDependency, portanto o omit=dev isolado não comprova todo o runtime.

[GHSA-ch52-4w7c-c8xp / CVE-2026-93748](https://github.com/advisories/GHSA-ch52-4w7c-c8xp): CWE-524, High, CVSS 4.0 8.7; npm usa CVSS 3.1 7.5. Afeta http-cache-semantics<=4.2.0; advisory sem versão corrigida na consulta de 03/10/2026. Cenário requer cache HTTP compartilhado sensível e request max-stale para obter resposta/Set-Cookie de outro usuário.

Cadeia instalada conferida: electron-builder26.15.3 → app-builder-lib → @electron/get3.1.0 → got11.8.6 → cacheable-request7.0.4 → http-cache-semantics4.2.0. Got tem cache:undefined por padrão; GotDownloader passa opções ao got. Não foi encontrado cache HTTP compartilhado autenticado habilitado em configuração/código/scripts atuais. Cache de artefatos no disco e sessão Chromium não são esse cache HTTP. EXP-01 não acrescenta dependência nem usa esse componente para imprimir.

**Avaliação, não correção:** manter a mitigação local documentada na memória e nos audits anteriores; reavaliar antes de mudar CI/download/cache/distribuição. Não aplicar automaticamente a sugestão npm de downgrade do builder para26.5.0 como se provasse remoção do advisory. Nenhum aceite fictício de tech lead/compliance foi atribuído ao projeto pessoal.

## 5. Configuração e menor privilégio

pdf-document.tsx:6/20–25 gera HTML com React SSR, Markdown/GFM sem raw HTML; títulos/paths são texto escapado. Links de notas viram spans, imagens viram rótulos; únicos hrefs são fragmentos controlados do sumário. CSS é constante, sem entrada do usuário/url/import. style-src unsafe-inline serve só a esse CSS fixo, com script-src/default-src none; não implica script inline permitido.

pdf-export.ts:41–55: partition única sem persist:, sem sessão/protocolo de estudos ou preload/bridge; JS/Node/subframe/worker/webview desligados, sandbox/contextIsolation/webSecurity ligados, diálogos/permissões/downloads/popups/navegação/redirect negados. onBeforeRequest aceita somente nodus-pdf://document/index.html; o handler retorna exclusivamente HTML produzido no main e CSP por header + meta. Nenhum fetch de URL de nota. [API printToPDF](https://github.com/electron/electron/blob/v44.5.1/docs/api/web-contents.md#contentsprinttopdfoptions) e [session/protocol](https://github.com/electron/electron/blob/v44.5.1/docs/api/session.md) oficiais foram consultados; revisão de código não é prova nativa de todos os protocolos/versões de rede.

A geração usa A4/printBackground/preferCSSPageSize; timeout termina a operação e finally destrói a janela, remove handler e limpa storage, liberando busy. Falha da limpeza de storage é tolerada em sessão efêmera. Não há serviços HTTP, buckets/IAM/CORS de nuvem novos. TLS não participa da impressão offline.

## 6. Achado, correção e validação

### [LOW, corrigido] Exportação sensível sem audit de sucesso

**Arquivo original:** captura inicial src/main/pdf-export.ts:55–57; src/main/index.ts:50–52 registra somente falhas. **Classe:** OWASP A09 / CWE-778 / STRIDE Repudiation. **Ativo:** rastreabilidade da cópia de conteúdo local.

**Cenário:** uma exportação autorizada conclui a escrita do PDF em Downloads; o histórico registra tentativas negadas/falhas, mas nenhum evento diferencia a cópia concluída. O operador não consegue confirmar esse efeito pelo audit. Confirmado no fluxo de fonte; sem alegar exploração externa ou autenticador imutável contra a própria conta Windows.

**Correção aplicada pelo implementador:** src/main/export-output.ts:6–20 e pdf-export.ts:53–54. Criar arquivo com wx, escrever/fsync/close, registrar pdf:export + UUID completo opaco + ok antes de responder. Falha da escrita/audit apaga apenas o arquivo exclusivamente criado pela operação e retorna erro. Nenhum título, caminho ou conteúdo entra no evento.

**Defesa em profundidade:** handler de erro permanece; UUID identifica operação sem PII; fonte/draft nunca são escritos pelo export; falha SQLite e saída prévia recebem prova real. Limite: interrupção do processo entre FS/audit e falha de unlink não têm commit conjunto nem garantia de rollback contra o SO.

**Provas próprias efetivamente executadas:**

| Execução | Resultado e limite |
|---|---|
| 3 testes da captura inicial | 3/3; Markdown/subpastas/preservação, contratos/encoding/limites, SSR inerte |
| 4 testes da captura final | 4/4; inclui FS/Store reais, trigger abort, audit opaco e saída anterior intacta |
| probe.ts | 34 verificações: traversal/ADS/UNC/pontos/junction/.GiT, bytes/frontmatter preservados, schemas extras/prototype, HTML/URL/imagem inertes, depth/entrylimits |
| output-probe.ts | FS + SQLite reais: UUID sem PII, dois sucessos únicos; trigger abort sem evento/saída nova; pasta indisponível falha; PDF anterior, fonte e draft intactos |
| root-probe.ts | Método root extraído/transpilado sem mudar sua fonte: vault/projeto registrado, inexistente, raízes substituídas por junction, junction ancestral, .GiT e raiz do volume; funções com Store/FS reais, sem IPC/Electron |
| verify-manifests.mjs | 210 hashes armazenados e dois digests conferidos |

JSDOM apenas analisa o HTML real produzido por exportDocument; não prova execução Chromium, rede ou print. O output probe usa bytes PDF fictícios identificados para testar FS/audit, sem chamar isso de impressão. A primeira tentativa do probe SSR falhou por expectativa de espaço em [Imagem: HTTP]; corrigiu-se apenas o harness ignorado, sem bug do produto associado. Testes/probes não executaram projetos reais.

**Evidência do implementador, lida e atribuída separadamente:** export-results.json de 2026-10-03T23:36:13.972Z, fixture pdf-export-6Y2vrl: UI → IPC → FS → printToPDF nativos, nomes únicos, projeto/vault, vazio sem artefato, trigger SQLite real sem artefato/recibo, concorrência com um EXPORT_BUSY, dois IPCs foreign FORBIDDEN e zero pageerrors. Cinco superfícies observadas com JS/Node=false, sandbox/contextIsolation/webSecurity=true, sem preload, sessão diferente/storage null; quatro eventos opacos ok. Não é execução do auditor.

export-pdf-inspection.json do implementador registra amostra de 3 páginas e documento longo de 13 páginas A4, Unicode/texto, ausência de JavaScript e seis pixels de borda negros por página, com renders Poppler/Pillow/pypdf. Isso comprova as amostras, não cada pixel/cada documento possível. Implementador informou 28/28 testes, typecheck/package Windows, Settings e Journey/R1–R7 aprovados no mesmo pacote.

Hashes do pacote medidos pelo auditor: ASAR D78522E47736BD1137B8B13A0D7A2ABF0CB50AF46A6F3A94BB35B246367F6BDC; EXE 0CDB145AFB54C60B24534F6BB41DFA0609ACCA6844127177331413A793E35226. São identidades dos arquivos, sem extração/comparação fonte-ASAR ou execução própria.

**Limites não escondidos:** orçamento60s inicia em load/print, depois da coleta/SSR síncronos; tamanho/quantidade não garante CPU/memória absoluta nem evita toda nota patológica. PDF32MiB é conferido após geração. Sem simulação própria de diskfull/timeout/crash de print, corrida FS exaustiva, novo probe NTFS8.3, ataque de todos os protocolos ou fuzzing Chromium/parser. As checagens canônicas e de descritor reduzem riscos; não oferecem lock cooperativo contra alteração deliberada pela mesma conta, hardlinks ou transação FS/SQLite contra queda de energia. O destino Downloads é local e não cifrado; não há aprovação de nuvem/assinatura/distribuição pública.

## 7. Handoff de memória

Recomendações ao implementador; auditor não altera memória:

- Arquitetura: exportação é leitura de Markdown salvo em pastas registradas e cópia local em Downloads; rascunho/código/PDF/imagem não entram como fonte. HTML fica em sessão própria efêmera, sem bridge/JS/rede e com URL única do protocolo de impressão.
- Guidelines: canonizar depois de negar links da raiz registrada; revalidar descendentes, descritor/bytes/encoding e componentes auxiliares canônicos. Negar nomes lexicais não basta para aliases Windows.
- Guidelines/gotcha: cópia sensível exige evento opaco de sucesso após escrita durável e antes da resposta. Audit falha deve rejeitar a operação/remover só a saída nova; nunca logar título/caminho/texto. Preservar trigger SQLite/FS real como regressão.
- Riscos: limite de entrada/print não equivale a orçamento global de parser/memória; futura exportação de árvores maiores pede isolamento/budget próprio. FS/SQLite não têm commit contra crash.
- Tooling: High permanece avaliado, não remediado; cache/CI/publicação requer nova avaliação. Fonte, suplemento, pacote e provas de executores distintos devem continuar identificados; scan staged posterior inclui scripts/testes/fixtures/documentos.

## 8. Veredicto delimitado

**Decision: APPROVE WITH MITIGATIONS**, somente para fonte local de EXP-01: captura inicial b225d619… composta/revisada na final 04b47c95…. Nenhum fix de produto/audit pendente neste parecer; o Low foi corrigido e verificado. Não se certificam bytes posteriores ao freeze nem todo o app retroativamente.

| Severidade | Aberto | Corrigido / mitigado | Observação |
|---|---|---|---|
| Critical | 0 | 0 | Nenhum confirmado/reportado |
| High | 0 novo de código | 1 advisory existente de tooling | Oito entradas npm; exposição avaliada, componente afetado permanece |
| Medium | 0 | 0 | Nenhum confirmado |
| Low | 0 | 1 corrigido | CWE-778, evento de exportação e rollback verificados |

**Secrets:** clean nas capturas/artefatos identificados, incluindo testes/fixtures; fechamento posterior tem scan próprio. **Dependencies:** um CVE/advisory High, zero Critical reportado; produção omit=dev zero com limite registrado. **Threat model:** presente, nova fronteira Markdown → print isolado → Downloads.

**Required before release local:** nenhum ajuste de produto pendente deste audit; registro de memória/docs e scan staged posterior pertencem ao fechamento do implementador. **Follow-ups:** reavaliar recursos/advisory ao ampliar exportação, habilitar cache/CI ou distribuir publicamente; assinatura/proveniência e revisão de release exigem escopo próprio.
