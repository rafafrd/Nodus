# Auditoria AppSec / DevSecOps do MVP local

02/10/2026, Windows 11 Pro 10.0.26200. **Verdict: APPROVE WITH MITIGATIONS para uso pessoal local do MVP 0.1.0.** Nenhum Critical, High ou Medium confirmado; um Low de rastreabilidade foi encontrado, corrigido pelo implementador e verificado nesta auditoria. Esta aprovação não autoriza publicação de serviço nem aprova nuvem, autenticação ou aplicações futuras.

## Escopo, método e identidade da revisão

O método é o papel integral AppSec / DevSecOps anexado pelo usuário nesta sessão, aplicado em oito fases à implementação existente. Foram lidos AGENTS.md, CLAUDE.md, as duas memórias locais, fonte, testes, scripts, configuração e lockfile. A ferramenta `project-memory-keeper` não está disponível entre as ferramentas expostas; a memória foi carregada e atualizada diretamente em `.claude/memory`. Não foi iniciado outro pipeline/workbench de scan.

Branch inicial: `MVP`; HEAD inicial: `5a26d23e1335f6849f9e38ffd0b880d2d0b959ea`; checkpoint final de aplicação: `ec1a66c5f76736c45fe3dd8cf716416938671144`. A revisão inclui a working tree e as correções locais desta sessão. Node host portátil: 24.21.0; npm: 11.19.0, PATH alterado apenas no processo. O pacote executado retorna Electron 44.5.1 e Node embarcado 24.21.0. `release/win-unpacked/resources/app.asar` final testado tem SHA-256 `6e9cd70ef5d2b504be8551bd351d9e39ed9c68f0026fb57fbd17c1f5d3fb9805`.

Stack real: Electron/main/preload; React 19.3.0 e TypeScript 5.9.3; SQLite builtin `node:sqlite`; Markdown canônico com CodeMirror e React Markdown/remark-gfm; PDF.js 6.3.289; Three.js 0.186.1 e GSAP 3.15.0 no renderer. Vite, esbuild e electron-builder são ferramentas de build. Tiptap está em devDependencies para a prova comparativa do editor e não é o editor/persistência do produto.

Não existem servidor de produção, Auth/IdP, JWT, cookies de sessão, tenants, integração cloud ativa, pagamentos, execução de projetos ou upload HTTP. A tabela `sync_operations` isolada não implementa sincronização. Ausência de CSRF, MFA, IAM de nuvem ou políticas Supabase não é achado deste MVP. O usuário Windows é a fronteira de identidade; um processo já comprometido sob a mesma conta não é isolado pelo app.

## Fase 1 — modelo de ameaças e fronteiras

Ativos: Markdown canônico, rascunhos e recovery, banco/índices/IDs, referência PDF selecionada, estado da mesa e foco; capacidade privilegiada do main. Entradas não confiáveis: arquivo Markdown/PDF selecionado e argumentos IPC. Somente assets do app entram no protocolo `study`.

| Ativo / STRIDE | Ameaça e cenário | Probabilidade / impacto | Controle existente | Lacuna ou limite |
| --- | --- | --- | --- | --- |
| Disco / S, E | Outra janela/frame/origem tenta chamar IPC privilegiado | Baixa / alto | webContents, mainFrame e URL exatos; bridge fixa; sandbox/contextIsolation; Zod | Renderer autorizado continua com as operações permitidas; não é um sandbox entre matérias do mesmo dono |
| Notas / T | Caminho escapa do vault ou junction redireciona leitura/gravação | Baixa / alto | Caminho relativo, extensão, contenção canônica, lstat de cada descendente; criação exclusiva | Conferência e acesso não são lock contra processo local concorrente |
| Notas / T | Editor externo muda arquivo após leitura | Plausível / médio | Hash, segunda conferência, temporário/fsync/rename, rascunho e recovery | Janela residual documentada entre conferência e rename; sem transação conjunta FS/DB |
| Dados / I, E | Markdown executa script, carrega imagem remota ou navega; PDF tenta código/ação | Baixa / alto | skipHtml, links/imagens substituídos; PDF em canvas/worker sem viewer scripting; CSP e isolamento | Parser/Chromium continuam dependências de segurança; manter versões corrigidas |
| Rascunho / R | Descarte fica sem registro de sucesso | Observado / baixo | Recovery antes de descarte | SEC-001 corrigido: DELETE e audit juntos em transação |
| Disponibilidade / D | PDF complexo ou muitas operações esgotam recursos | Plausível / médio | Nota 2 MiB; PDF 100 MiB; tamanho de imagem/canvas; validação de argumentos; worker | Sem orçamento global de CPU/memória ou rate limit IPC; não houve fuzzing de corpus malicioso |

As classes D e os limites de concorrência acima são riscos residuais de projeto; não são afirmação de exploit validado. Backups, conta Windows protegida e execução local compõem as mitigações desta aprovação.

## Fase 2 — revisão das superfícies e classes de vulnerabilidade

| Superfície e referência | Resultado verificado |
| --- | --- |
| IPC, `src/main/index.ts:22`, `src/shared/contracts.ts:5`, `src/preload/index.ts:3` | Remetente/janela, frame principal e URL exata verificados antes da ação; operações fixas, schemas estritos e limites. Nenhum fs/shell/SQL/exec/ipcRenderer genérico exposto. Propriedade extra, UUID inválido e chave __proto__ rejeitados. Janela auxiliar na própria URL do app e main carregado em data: retornaram FORBIDDEN. Subframe sem bridge e sem require. |
| Protocolo/assets, `src/main/index.ts:92` | Host `app`, resolve de caminho e limite da pasta renderer; sem leitura de vault por URL. Traversal codificado com barras/contrabarras e UNC deram 403; outro host foi bloqueado pela CSP. ASAR contém os assets do pacote; não há controle de integridade criptográfico do ASAR contra processo que já pode substituir a instalação. |
| Renderer/navegação, `src/main/index.ts:75` | Sandbox, contextIsolation e webSecurity true; nodeIntegration/webviewTag false no pacote. Novas janelas e navegação externa negadas; notifications e geolocation negadas em execução. |
| Markdown, `src/renderer/NoteEditor.tsx:38` | ReactMarkdown com skipHtml, sem rehype-raw; links viram span e imagens viram texto. Fixture com script/onerror/javascript:/imagem/iframe preservada no arquivo e sem elementos executáveis nem requisição HTTPS. Texto inserido por React, sem dangerouslySetInnerHTML. |
| Vault, `src/main/vault.ts:33`, `:47`, `:90`, `:124` | Traversal, absoluto, contrabarra, ADS/volume/NUL e junction descendente negados; UTF-8 fatal e limite 2 MiB; ID importado validado com schema UUID; duplicado rejeitado. Hash/revisão e rascunho distinguem conflito da nota canônica. Testes com arquivos/junction reais passaram. |
| SQLite, `src/main/store.ts:11`, `:30`, `src/main/desk.ts:19`, `src/main/checklist.ts:25` | Dados em placeholders; interpolação de nome de tabela somente em conjunto constante interno. foreign_keys, WAL, busy_timeout; migração e mutações relacionadas em transação sem reset. Mesas/etapas/sessões rejeitam referência de outra matéria; rollback real aprovado. |
| PDF, `src/main/desk.ts:32`, `src/renderer/PdfPane.tsx:19` | Renderer só recebe bytes do ID previamente selecionado. Main confere caminho canônico, tipo/tamanho, lê pelo fd limitado e exige cabeçalho PDF. Canvas/worker, assets locais, XFA e WASM desligados. Não integra scripting/HTML/links do viewer. A versão instalada não tem a antiga opção isEvalSupported; não foi sugerida uma API ausente. |
| Logging, `src/main/store.ts:35`, `src/main/index.ts:29`, `src/main/vault.ts:150` | Eventos de mutação, material.read, conflito, alteração externa e rejeição IPC contêm ação, entidade e outcome; sem texto de nota, token ou caminho pessoal. SEC-001 corrigido e retestado. Autosave/polling de nota não geram evento para cada tecla/leitura; log é operacional, não auditoria forense imutável. |
| Scripts/configuração | Spawn do Electron e encerramento de processo em provas locais não usam conteúdo de nota como comando. Não há execução de código importado no produto nem fetch de URL fornecida por documento no main. `.github` tem somente template de PR; não existe pipeline de release com secrets para auditar. |

Classes efetivamente revisadas: acesso/autorização local (CWE-862/863/269), argumentos (CWE-20), traversal/TOCTOU (CWE-22/367), SQL/comando/template/HTML (CWE-89/78/77/79), prototype pollution (CWE-1321), segredo/configuração/logging/integridade. O produto não implementa primitivas próprias de criptografia ou desserialização executável. Não foram encontradas evidências de SQL injection, command injection, SSRF ou conteúdo Markdown executável. CWE-352/918 e isolamento tenant não foram inventados para módulos ausentes. Falhas nativas como CWE-787/125/416 são cobertas por atualização dos runtimes e advisories; não houve auditoria de código C/C++ de Chromium/SQLite nem fuzzing nativo.

## Fase 3 — busca de segredos, fonte integral e histórico

Gitleaks 8.30.1 obtido da [release oficial](https://github.com/gitleaks/gitleaks/releases/tag/v8.30.1); ZIP Windows x64 conferido com SHA-256 oficial `d29144deff3a68aa93ced33dddf84b7fdc26070add4aa0f4513094c8332afc4e`. Executável apenas em `.local/security-tools`, sem instalação global. Regras padrão, redação 100%, decodificação até cinco níveis, sem baseline/supressão e ignorando comentários gitleaks:allow.

Primeira passagem: 120 arquivos de fonte/configuração/documentação/fixtures, inclusive dotfiles e arquivos não rastreados/ignorados pelo Git quando pertencem à fonte; 608.561 bytes; zero achados, exit 0. Excluídos somente `.git`, dependências, builds/assets copiados, ferramentas/fixtures descartáveis de `.local` e diretórios de dados pessoais. Isso não equivale a auditar um vault pessoal, que está fora do escopo/repositório. `.env`/chaves de fonte, se presentes fora desses diretórios, não seriam omitidos pelo inventário `rg --hidden --no-ignore`.

Histórico: `gitleaks git . --log-opts='--all --full-history' --ignore-gitleaks-allow --redact=100 ...`; sete commits alcançáveis em todos os refs na primeira passagem, 892.087 bytes; zero achados, exit 0. Inclui arquivos removidos dos commits; objetos órfãos não alcançáveis por refs não são reivindicados como cobertos. Fixtures entram tanto no scan de fonte quanto no histórico; não foi necessário justificar nenhum segredo como fictício. Revisão complementar dos sinks e configurações não encontrou credenciais. Não foram impressos valores sensíveis.

Passagem final após correção/checkpoint `ec1a66c`: **122 arquivos, 636.232 bytes, zero achados; oito commits alcançáveis, 931.331 bytes, zero achados**, ambos exit 0. Inclui scripts/testes novos, este relatório e as memórias. A mudança documental posterior desta passagem atualiza somente os números/resultados aqui, sem conteúdo de credencial.

Inventário e saídas locais: `.local/security-source-manifest.txt`, `.local/security-source-final-manifest.txt`, `.local/gitleaks-source.json`, `.local/gitleaks-source-final.json`, `.local/gitleaks-history.json`. Fonte foi congelada em `.local/security-source` para preservar a evidência anterior às correções; snapshot final em `.local/security-source-final`. Scan por regras não é prova matemática de ausência de toda forma possível de segredo.

## Fase 4 — dependências e exposição a CVEs

Executados `npm audit --omit=dev --json` e `npm audit --json` com Node portátil/npm do projeto: **zero vulnerabilidades nos dois** (Critical 0, High 0, Moderate 0, Low 0). Metadata: 132 prod, 439 dev, 582 total; categorias opcionais/peer sobrepõem esses conjuntos. Saídas `.local/audit-production.json` e `.local/audit-full.json`. Não foi usado npm audit fix nem alterado o lockfile.

Electron é devDependency por distribuição/build, mas é runtime embarcado; por isso o audit completo é necessário. Node/Chromium/SQLite embarcados também não se tornam seguros apenas pela classificação npm. Foram consultados advisories oficiais, além do scan do registro:

| Advisory histórico relevante | Exposição no MVP auditado |
| --- | --- |
| [Electron CVE-2026-54257 / GHSA-q6m5-f73j-m9mc](https://github.com/electron/electron/security/advisories/GHSA-q6m5-f73j-m9mc), Critical | Afeta 42.3.1/42.3.2; corrigido em 42.3.3. Electron efetivo 44.5.1 fora desse intervalo. |
| [Electron CVE-2026-102677 / GHSA-qmv3-fv6v-rmhq](https://github.com/electron/electron/security/advisories/GHSA-qmv3-fv6v-rmhq), High, CVSS 7.8 | Cache de preload corrigido na linha 44 em beta.6; versão efetiva posterior. Não há High aberto aceito apenas por mitigação. |
| [Electron CVE-2026-102675 / GHSA-j84w-jfhq-vhvj](https://github.com/electron/electron/security/advisories/GHSA-j84w-jfhq-vhvj), High, CVSS 7.4 | Versão 44 corrigida em beta.5; handler atual usa protocol.handle. corsEnabled sozinho não é controle de autorização: o advisory corrigiu essa recomendação. Scheme só serve assets e não carrega conteúdo web não confiável. |
| [PDF.js CVE-2026-16633 / GHSA-hq66-cqwq-w95j](https://github.com/mozilla/pdf.js/security/advisories/GHSA-hq66-cqwq-w95j), High | Correção publicada em 6.2.108; instalada 6.3.289. A integração é getDocument/render canvas, sem scripting do viewer, e CSP proíbe scripts arbitrários. |

Esses advisories históricos não são contados como CVEs ativos do lockfile. Resultado zero é a consulta realizada em 02/10/2026, não uma garantia para releases posteriores. Atualizações de Electron/PDF.js e novo audit pertencem a cada release. As [orientações oficiais de segurança Electron](https://www.electronjs.org/docs/latest/tutorial/security) fundamentam o isolamento, IPC, permissões, navegação e CSP revisados.

## Fase 5 — defaults/configuração e defesa em profundidade

CSP de produção verificada no pacote: default-src/script-src/connect-src self; object-src/frame-src/base-uri none; worker-src self blob; fontes locais/blob/data. Não permite script inline nem unsafe-eval e remove WebSocket/nonce autorizado de desenvolvimento. `unsafe-inline` é exclusivo de style-src para layout, CodeMirror e animações controlados pelo app; fonte de nota não vira estilo/HTML. Script inline, eval pelo webContents nativo e fetch HTTPS foram efetivamente negados. Avaliação via debugger/CDP pode ignorar CSP e não foi usada como prova de que eval estaria permitido no produto.

Dev Vite limita-se a 127.0.0.1:5173/strictPort; main só aceita o dev URL exato fora de pacote. Produto não inicia listener HTTP e não requer chaves. Não há cookies/CORS de servidor, buckets, IAM ou TLS próprio para configurar. O controle do protocolo não deve ser reutilizado para conteúdo web ou vault futuro.

Mitigações/limites do uso local: perfil Windows e seus ACLs protegem os dados; vault, SQLite e recovery estão em texto legível, sem criptografia própria. ASAR/diretório Windows não são assinatura/autenticação do artefato; configuração atual produz pacote privado sem assinatura. Hash+rename não é lock cooperativo. Backups/rascunhos reduzem impacto, mas não criam isolamento de processo sob a mesma conta. Esses limites estão em [vault-safety](../decisions/vault-safety.md), [runtime-mvp](../decisions/runtime-mvp.md) e na memória de arquitetura, e não são High fabricados para impedir o MVP pessoal.

## Fase 6 — achado e validação da correção

### [LOW] SEC-001 — descarte explícito de rascunho sem evento de sucesso

**Arquivo:** `src/main/vault.ts:150` (antes: DELETE sem evento em 153; depois: transação em 153–156). **Classe:** OWASP A09 / CWE-778 / STRIDE Repudiation. **Ativo:** rastreabilidade das decisões de recuperação, não o conteúdo canônico da nota.

**Cenário explorável:** código já executando no renderer autorizado chama discardDraft com ID de nota existente, ou o usuário usa a ação legítima de descartar. O rascunho sai de SQLite sem evidência da ação no audit_events, dificultando distinguir descarte de falha de recuperação. Não se demonstrou XSS/renderer comprometido nem perda da nota: o backup de rascunho já existia. Severidade Low pelo escopo local individual e efeito recuperável.

**Resultado inicial preservado:** fixture real, draft apagado, arquivo de recovery presente, eventos 19 → 19. `.local/security-runtime-initial.json` preserva a observação anterior à correção.

**Correção mínima aplicada pelo implementador:** arquivar antes; DELETE FROM drafts e audit('note.draft-discard', id, 'ok') na mesma transação. Nenhum texto/caminho no evento. **Segunda camada:** manter recovery e rollback se o registro de auditoria falhar; futuramente definir retenção/exportação de eventos sem conteúdo pessoal.

**Verificação:** teste `tests/vault.test.ts:53` passou; probe real SQLite confirmou um evento, recovery idêntico e nota intacta. Trigger de fixture provocou falha real no INSERT do audit: DELETE revertido, draft conservado e sem falso evento de sucesso. No pacote final, chamada real por preload/IPC descartou draft, conservou nota e gerou exatamente um evento note.draft-discard. Estado: **corrigido e verificado**, sem achado Low aberto. Saídas `.local/security-discard-results.json` e `.local/security-runtime-results.json`.

## Fase 7 — evidências e memória

| Execução efetiva da auditoria | Resultado |
| --- | --- |
| `npm test` com Node 24.21.0 | 8/8; banco/arquivos/junctions reais, sem mocks de integração |
| `node node_modules/tsx/dist/cli.mjs --test tests/vault.test.ts` após correção | 1/1; critério de logging adicionado pelo implementador |
| `node node_modules/tsx/dist/cli.mjs .local/security-discard.ts` | Sucesso e falha de audit exercitados em SQLite real; rollback confirmado |
| `node node_modules/tsx/dist/cli.mjs .local/security-runtime.ts` no executável Windows | IPC/origem/subframe, markup malicioso, CSP, assets, popup/navegação/permissões, privacidade do log e descarte via IPC aprovados |
| npm audit prod/completo; Gitleaks fonte/histórico | Zero vulnerabilidades reportadas; zero segredos detectados |
| `node scripts/check-bootstrap.mjs`; diff-check das memórias/relatório | 11 tickets, 70 critérios, 65 Markdown e 76 links locais consistentes; sem erro de whitespace nas mudanças rastreadas da auditoria. Verificação documental, não segurança funcional |

As fixtures foram criadas exclusivamente em `.local`; nenhum vault/DB pessoal foi aberto. Janela/origem auxiliar foram criadas pelo harness privilegiado apenas para exercitar a negação; não são capacidades do renderer. Primeiras tentativas do harness ajustaram observação de linhas virtuais CodeMirror e a diferença entre avaliação debugger e webContents; nenhuma delas é registrada como falha de segurança do app.

Smoke desktop, pacote, jornada R1–R7, PDF e foco anteriores constam em [ALPHA](../validation/ALPHA.md) e [MVP_JOURNEY](../validation/MVP_JOURNEY.md); não são reivindicados aqui como nova execução completa pelo auditor. Diálogo nativo de seleção não foi automatizado; fixture foi autorizada por serviços reais. Não houve fuzzing exaustivo, scanner de código nativo, prova contra processo host comprometido nem integração externa fictícia.

Memória atualizada diretamente: arquitetura recebe fronteiras confirmadas/PDF integrado/riscos residuais; guidelines recebe SEC-001, transação para alteração+evento, recuperação e scans de fixtures/histórico. Não foi delegado trabalho, modificado código pelo auditor, instalado software global, feito push/publicação ou iniciado serviço externo de scan.

## Fase 8 — Security Verdict

**Decision: APPROVE WITH MITIGATIONS — exclusivamente MVP pessoal local Windows.** Mitigações exigidas no uso atual: perfil Windows protegido, vault/userData fora do Git, recovery/rascunhos conservados e pacote tratado como artefato privado sem assinatura. Não há High pendente nem aceitação inventada em nome do tech lead.

| Severity | Open | Mitigated / fixed | Notes |
| --- | --- | --- | --- |
| Critical | 0 | 0 | Nenhum confirmado |
| High | 0 | 0 | Nenhum confirmado; nenhum ativo no audit consultado |
| Medium | 0 | 0 | Riscos residuais indicados no modelo não são exploits demonstrados |
| Low | 0 | 1 | SEC-001 corrigido, rollback e pacote verificados |

**Secrets:** clean no scan da fonte e histórico cobertos; zero achados. **Dependencies:** zero vulnerabilidades reportadas pelos dois npm audits; zero CVEs ativos identificados (Critical 0, High 0, Medium 0, Low 0). **Threat model:** presente e atualizado nesta mudança.

**Required before release local:** nenhuma correção de segurança pendente para o recorte pessoal auditado. **Antes de distribuição pública de binário:** definir assinatura/proveniência e verificação do artefato; repetir scans sobre o commit/lockfile e pacote de release; manter política de atualização de Electron/PDF.js. Código open source e serviço de produção são decisões distintas; nuvem/auth precisam de modelo e auditoria próprios quando implementados.

**Follow-ups:** retenção de logs/recovery sem dados pessoais; orçamento de recursos de PDF/importação se houver uso com acervo não confiável; lock/handles se o produto prometer concorrência forte; criptografia apoiada no SO se o modelo incluir dispositivo perdido. Essas ações não ampliam o MVP atual.
