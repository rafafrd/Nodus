# Verificação do refinamento do frontend

02/10/2026. UI-01, branch feat/frontend, baseada na MVP ae0c9f6 enviada para origin/MVP. Windows 11 10.0.26200, Node host portátil 24.21.0, Electron 44.5.1, app 0.1.0. O executável efetivamente aberto é release/win-unpacked/App Estudos.exe. Fixtures de SQLite/vault/PDF criadas por serviços reais em .local; não representam dados pessoais nem métricas de uso.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | Mesa com cantos retos, superfícies planas, divisórias finas e quatro módulos: caderno/material/foco/checklist. Capturas desk, reading e compact inspecionadas no Windows; tipografia de leitura, ícones próprios e dock preservam controles reais. |
| C2 | aprovado | Grade persistida após reinicialização, Só caderno/Esc conservando mesa e fonte, Alt+1/2/3, preset real de foco de 15 min, PDF ajustado à altura estável, compacta 1040×760 e movimento reduzido. Jornada R1–R7 e smokes abaixo passaram. |
| C3 | aprovado | Capturas reais compartilhadas durante a execução; série frontend-verified inclui nove estados no executável Windows. Nenhum mock de IPC/banco/leitor substituiu a aplicação. |
| C4 | aprovado | Typecheck, nove testes, empacotamento, jornada, smokes e verificador documental passaram. Documentação registrada; implementação 4e460e0 enviada para origin/feat/frontend e fechamento documental de UI-01. |

## Comportamento e dados

A referência enviada pelo usuário mudou a direção durante a tarefa: as capturas frontend-01/02/03 com cantos arredondados foram substituídas pela grade de módulos. Os painéis são recursos de estudo; não foi acrescentado terminal ou comando privilegiado. A grade é acessível por Módulos/Todos ou Alt+3; ferramentas isoladas continuam disponíveis por Alt+1/2. O modo só caderno e o ajuste de página são transitórios; a escolha de grade pertence à matéria.

Desk.tool admite `both` além dos três valores anteriores, mantendo validação Zod estrita. SQLite v1 conserva os registros, sem reset ou migration destrutiva. O teste da mesa abre o banco anterior, ativa a grade e reabre verificando todos os campos e o isolamento da segunda matéria. O teste de contrato rejeita `terminal` e uma chave `command` adicional.

CodeMirror conserva a fonte integral. A leitura deixa de repetir o primeiro H1 quando ele é igual ao título já visível; somente a apresentação muda. Smokes verificaram edição seletiva e conteúdo restante byte a byte. A prévia continua com HTML ignorado e links/imagens inertes; main/preload não ganharam APIs. Nenhuma dependência foi acrescentada. Three.js tem renderização discreta com pausa em janela oculta e modo estático para movimento reduzido; GSAP conserva entrada breve dos painéis.

## Execuções efetivas

Com Node 24 no PATH, PowerShell nativo:

| Comando | Resultado/escopo |
| --- | --- |
| `npm.cmd run typecheck` | Passou após o ajuste final de PDF. |
| `npm.cmd test` | Nove testes passaram: persistência, isolamento/rollback, Markdown, vault/conflito, PDF, foco e contrato da grade. |
| `npm.cmd run package:win` | Passou; build e pacote x64 local sem assinatura. Avisos de chunks grandes e metadados/duplicação de referências continuam não fatais. |
| `npx.cmd tsx scripts/preview-frontend.ts --packaged --stage=verified` | Passou no executável, incluindo fechar/reabrir a mesma fixture e primeira abertura de um banco vazio. |
| `npm.cmd run test:journey` | R1–R7 passaram no executável: duas mesas, escrita, PDF, foco, checklist e conflito externo. R8 continua não verificado. |
| `npx.cmd tsx scripts/smoke-pdf.ts --packaged` | Passou no executável: worker/fontes, páginas, retomada, ausente/relocalização mantendo ID e inválido sem perda de nota. |
| `npx.cmd tsx scripts/smoke-editor.ts --packaged` | Passou no executável após atualizar o roteiro para interpretar a flag: edição seletiva com toolbar e comparação integral do arquivo. |
| `npx.cmd tsx scripts/smoke-checklist.ts --packaged` | Passou no executável após atualizar o roteiro para interpretar a flag: duas matérias, marca/desmarca, renomeação/IDs, contagem, retomada e referência inválida. |
| `node scripts/check-bootstrap.mjs` | Passou: consistência dos onze tickets da alpha e links locais; não aprova a UI por si só nem contabiliza os quatro critérios de UI-01. |
| `git diff --check` | Passou antes do stage. |
| `gitleaks git . --pre-commit --staged --ignore-gitleaks-allow --redact=100 ...` | Ferramenta já usada pelo projeto, 8.30.1. Zero achados no stage de UI-01 (~78,2 KB), incluindo testes e gerador de fixtures. Relatório .local/gitleaks-frontend-staged.json; não substitui auditoria completa. |

Durante a prova, uma chamada de preview antecipada ao término do pacote falhou ao iniciar o processo. A primeira execução completa também parou num seletor de texto que não considerava a legenda nova da próxima ação. Esses resultados não foram considerados aprovações; a execução `verified` corrigiu o seletor, aguardou o pacote pronto e passou integralmente. A oscilação observada no ajuste do PDF foi corrigida e registrada em gotcha.md, O-004.

## Evidências locais e reprodução

Gerador e roteiro versionado: scripts/preview-frontend.ts. Ele cria matéria/nota/checklist/pausa com os serviços reais, gera um PDF válido de três páginas e abre instâncias de teste isoladas. Exemplo: `npx.cmd tsx scripts/preview-frontend.ts --packaged --stage=review` depois de `npm.cmd run package:win` terminar. `--desk-only` limita a execução à primeira captura e não comprova a jornada completa.

Capturas verificadas: `.local/evidence/frontend-verified-{desk,pdf-fit,reading,checklist,editor,compact,modal,reopened,welcome}.png`. Resultado completo: `.local/evidence/frontend-verified-result.json`; fixture: `.local/frontend-preview-LLvhqW`. Esses dados locais não entram no Git. A grade compacta verificou altura superior a 200 px para cada módulo e todos os painéis/rodapé dentro da janela; o ajuste do PDF verificou tamanho estável e ausência do aviso de carregamento por quatro amostras consecutivas.

Identificação do pacote exercitado, em `.local/evidence/frontend-package-results.json`: SHA-256 do executável `25d5fe72a64cf09fab2179a939f8a5c637e8f3de7773b56746dc6ac1cd7dfdf5`; app.asar `914fd4a499580fc051fc2ad26b2ace94ec735776c74ce395d7b8062af80bfe12`. A prova anterior da MVP em MVP_JOURNEY.md tem hashes próprios e não identifica este rebuild.

Limites: diálogo nativo de seleção não automatizado; Obsidian/editor externo ALP-02/C5 continua pendente. Nuvem/celular e R8 não implementados/verificados neste recorte. O modo compacto não comprova interface mobile. A auditoria por agente em docs/security/MVP_AUDIT.md corresponde ao checkpoint MVP ae0c9f6; este incremento tem revisão do diff/contratos e provas funcionais, sem novo scan completo. Tempo humano não informado.

Git: MVP ae0c9f6 publicada em origin/MVP; implementação UI-01 4e460e0 publicada em origin/feat/frontend. Branch contínua baseada na MVP, sem reescrita de histórico. Ticket movido para done após aprovação dos quatro critérios e envio da implementação.
