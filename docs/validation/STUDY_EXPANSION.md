# NXT-01 — Evidências da expansão de estudo

04/10/2026. Branch codex/study-expansion, base6597e28. Fixtures identificadas em .local/evidence; nenhum dado pessoal usado.

## Checkpoint 1

Node24.21.0 portátil, Windows nativo. `npm run typecheck`, `npm test` (31/31) e `npm run package:win` aprovados. `npm run test:expansion` aprovado no executável empacotado: Ctrl+K entre matérias, flashcard vinculado à nota, revelar/avaliar/agendar, Hoje/checklist/retorno, fontes byte a byte preservadas, payload estrito e sender estrangeiro negados. Capturas expansion-search/review/today.png e expansion-results.json; log expansion-phase1-tests.log e expansion-phase1-package.log.

Migração v4→v5 aditiva exercitada com SQLite/arquivos reais. Replay vinculado ao payload, versão de revisão e rollback por falha de audit conferidos. XP/moedas permanecem separados. Busca usa títulos/contexto indexados, sem busca de conteúdo completo dos arquivos. Hoje apresenta checklist aberto e foco persistido, sem calendário externo.

O checkpoint 1 cobre somente esses três fluxos; os demais recursos e a identidade final estão registrados abaixo.

## Checkpoints 2 e 3 — Funcionalidades implementadas

As nove sugestões formam o incremento NXT-01. Sem dependências novas e sem mudança do lockfile. SQLite v5 continua aditivo; Markdown e arquivos dos projetos permanecem fontes canônicas. Contratos e preload oferecem operações específicas para marks/moments/backup/destino, guardadas pelo sender/mainFrame/origem existentes.

| Frente | Comportamento entregue | Prova efetivamente executada |
| --- | --- | --- |
| Busca | Ctrl+K, matérias/notas/projetos/vídeos por título/contexto e ações; navegação entre matérias e uma única janela de criação | test:expansion, UI/IPC/SQLite reais e rejeição de argumentos/sender |
| Hoje | Checklist aberto, revisões vencidas, foco persistido no dia e retomada da mesa | test:expansion e testes Study, com pausas fora do tempo |
| Flashcards | Pergunta/resposta/trecho/nota, revelar, avaliações manuais e agenda separada do jogo | Revisão real pela UI; versão/replay/audit rollback, 50 avaliações repetidas e relógio inválido em SQLite |
| PDF | Retângulo normalizado, cor/comentário/nota e lista por documento/versão | test:annotations na página de PDF real; fontes preservadas, hash/ownership/rollback nos testes |
| Vídeos | Momentos manuais com anotação; abrir ponto recria guest isolado, retry conserva momento | test:annotations abre guest oficial com start=75; regressão Videos verifica reprodução/modos/isolamento/crash/retry |
| Backup | Prévia, omissões e snapshot local de DB/recovery/vault/projetos/PDFs disponíveis | test:knowledge-backup pela interface; testes FS/SQLite verificam WAL, contenção, arquivos omitidos, limites e hashes |
| Restore | Validação e cópia separada, referências remapeadas, abrir cópia por fechamento/relaunch | test:knowledge-backup espera reinício real e consulta o perfil/vault/links/cidade do processo novo; fontes originais intactas |
| Grafo | Three.js com notas/relações reais, criar/excluir vínculo, seleção/prévia/abrir nota | test:knowledge-backup exercita canvas e ligação real; auditor revisa gates/reduced-motion/limpeza e preview inerte |
| Cidade | Fonte (45), bancos (15), estufa (90), Dourado/Amanhecer/Noite persistidos | 40 pulsos reais, upgrade e três compras na jornada nova; ledger/preços/replay/audit nos testes Game/Backups |
| PDF preto ampliado | Nota individual salva, capa, imagens locais limitadas e Downloads/destino registrado | test:annotations imprime PDF real de 4 páginas, uma imagem e saída para pasta de fixture; legado PDF mantém isolamento/rollback |

O catálogo da loja ganhou três itens. O roteiro Game antigo ainda usava saldo fixo de 345 para cinco compras e parou corretamente no botão desabilitado da estufa. O harness foi atualizado para somar os preços do catálogo atual, obter o saldo por rodadas reais e conferir os IDs comprados. Não foi injetada carteira nem alterado preço/clock do produto.

## Correções observadas

O-013: o auditor repetiu avaliações Fácil antecipadas e reproduziu due_at fora do intervalo legível pelo driver/Date. Main limita agendamento a 365 dias, valida instante/data e faz rollback se o relógio é inválido. Teste próprio com 50 avaliações e os probes independentes passaram. Seleção do destino PDF exige setting+audit em transação; abrir perfil restaurado exige audit antes de armar relaunch. Trigger SQLite real na jornada Windows confirma erro sem fechar o app; removido o trigger, a mesma cópia abre normalmente.

O-014: a área vazia do container Ambiente da vila interceptava Visitar mina após mover a câmera para Fazenda. game.css deixa somente os botões capturarem ponteiro. A mesma jornada Smooth, sem force ou mudança do roteiro, aprovou clique, posições intermediárias, retarget, câmera preservada, gates e movimento reduzido em 1040×760 após o ajuste. Linhas vazias extras no EOF de três CSS foram removidas para diff --check; nova build/empacotamento conservou a identidade do pacote, com assets conferidos byte a byte.

## Verificações e identidade

Windows nativo, Node host/embarcado 24.21.0, Electron 44.5.1, app 0.1.0. `npm run typecheck`, `npm test` (38/38) e `npm run package:win` aprovados. Logs expansion-final-typecheck/tests/package.log em .local/evidence. Build posterior aos ajustes foi comparada byte a byte com os 200 arquivos dist no ASAR por .local/compare-packed-assets.mjs; resultado em expansion-packed-assets.json. Fonte de produto/harness concluída nos commits 58937e6, 1f69692 e 61ef01b; documentação posterior não foi atribuída ao binário.

| Artefato final medido pelo implementador | SHA256 |
| --- | --- |
| release/win-unpacked/App Estudos.exe | `41FC22FB6F59161D9090292B4DAEC223B1B18098B88235EB86668B7FB624AB31` |
| release/win-unpacked/resources/app.asar | `7F1B0ED273E859595ED9B169DD3B224E58A7CBA91A8505854B84504D77BE011F` |
| package-lock.json, inalterado | `30F06BA6E378447DD959AB2EEC399A15715CC31C2DCA5EF03B300D0CD59EC720` |

As três jornadas novas também passaram antes do ajuste final de CSS: expansion-results.json 07:31:23.611Z, annotations-results.json 07:31:31.476Z e knowledge-backup-results.json 07:31:58.710Z. O auditor preservou essas identidades históricas na captura própria. Os arquivos locais foram atualizados pelas repetições abaixo, todas no pacote final identificado acima.

| Comando, exit 0 | Evidência local / horário UTC de 04/10/2026 |
| --- | --- |
| npm run test:smooth-ui | smooth-ui-results.json, 07:40:46.353Z; câmera/retarget/poses intermediárias/flush/gates/reduced/1040×760 |
| npm run test:videos | videos-results.json, 07:42:36.079Z; reprodução oficial real, continuidade, PiP/cinema/off/Settings, isolamento, crash/retry |
| npm run test:pdf-export | export-results.json, 07:42:44.894Z; coleta/print/FS reais, rollback audit, cinco superfícies de impressão isoladas e fontes intactas |
| npm run test:game | game-verified-results.json, 07:51:15.173Z; oito compras, rodadas/cultivos reais, build/ledger/restart e renda passiva com app fechado |
| npm run test:expansion | expansion-results.json, 07:51:22.512Z; busca/Hoje/card/atalhos/fontes e uma janela de criação |
| npm run test:annotations | annotations-results.json, 07:51:30.124Z; marks/moments/PDF individual/capa/imagem/destino registrado |
| npm run test:knowledge-backup | knowledge-backup-results.json, 07:51:57.197Z; grafo/cidade/backup/restore/relaunch real, originais intactos e falha audit sem fechar |
| npm run test:settings | settings-results.json, 07:52:09.815Z; nome/foto/temas/off/contagens/paths/restart sem perder editor/canvas/draft |
| npm run test:journey | journey-results.json, 07:52:22.592Z; R1–R7 estudos/persistência/conflito; R8 nuvem não verificado |
| npm run test:engine-explorer | expansion-regression-test-engine-explorer.log, exit 0; FS/filas/BOMCRLF/recovery/QTE/skillcheck/upgrade/retorno real |

Logs por comando em expansion-regression-test-*.log. O JSON do harness Engine-Explorer conserva um campo de data fixo histórico 2026-10-03; esse campo não foi usado como prova de horário da execução de 04/10. A execução atual é a do comando/log, com arquivo atualizado em 04/10 07:52:38 UTC.

O PDF de annotations-ui-c24vQD/Nodus-Vetores — meu caderno-0c040248.pdf, produzido na repetição final, foi renderizado por Poppler e conferido por pypdf/Pillow: quatro páginas A4, margens pretas nas quatro páginas, uma imagem incorporada, capa/sumário/texto; revisão visual de todas as páginas aprovada. Script .local/inspect-rich-pdf.py e expansion-rich-pdf-inspection.json registram o arquivo/resultado. A nota foi editada intencionalmente de 675 para 717 bytes para inserir a imagem; preservação da exportação foi comparada com os 717 bytes salvos.

Capturas reais em .local/evidence: expansion-search/review/today/pdf-marks/video-moments/rich-export/graph/city-night/backup/restored.png. Perfis e arquivos fictícios permanecem ignorados, sem dados pessoais. O harness usa app.setPath para conter documentos/Downloads da fixture; isso é configuração real do Electron, sem simular IPC/FS/print/relaunch.

## Limites verificados

- Busca cobre títulos/contextos e ações; não indexa conteúdo integral de arquivos. Hoje não inclui calendário externo.
- Flashcards e relações são manuais. XP/moedas não avaliam domínio acadêmico. Grafo desenha até 200 notas por matéria; lista acessa todas.
- Marcas PDF são áreas/comentários, sem seleção de texto/escrita do original. Hash separa versões, sem remapear anotações automaticamente.
- Tempo de vídeo é informado manualmente. Abrir momento reinicia o guest; os modos seguintes conservam esse novo player. PiP continua interno.
- Backup não é nuvem/ZIP/merge ou substituição do perfil. Hash detecta corrupção/alteração após prévia, sem autenticar autor. Schema exato/FK/paths limitam importação, sem validar todos os valores de negócio de um banco intencionalmente forjado.
- Backup é privado e sem criptografia própria. Credenciais conhecidas por nome/extensão ficam fora; tokens no corpo de notas/drafts entram na cópia. Arquivos externos não têm snapshot atômico conjunto com SQLite; leituras conferem identidade/stat e fontes não são sobrescritas.
- Diálogos nativos de escolher pasta não foram automatizados. Destino PDF registrado, snapshot criado/importado por capacidade e output/restore/relaunch reais foram testados; métodos de validação do picker receberam probes próprios. Isso não comprova interação humana com o diálogo do Windows.
- Nuvem/celular/ALP-09 e prova externa ALP-02/C5 continuam pendentes. Nenhum serviço/release publicado.

## Auditoria e encerramento

Auditor independente recebeu o incremento base 6597e28 → 58937e6 + working tree, com o anexo AppSec original e memória/manifests do projeto. [Relatório](../security/STUDY_EXPANSION_AUDIT.md): APPROVE WITH MITIGATIONS para uso local, sem vulnerabilidade nova confirmada aberta. Composição final `8fdf739701ddfc02261a8b6f2b0703b473fc5b3fbf53648d55a37c7981fdfd6d`, 224 entradas/52 fontes; 14/14 testes, dez grupos de probes e callbacks/FS/SQLite reais próprios aprovados. Auditor não executou Electron. Capturas iniciais/suplementos, execução Windows/pacote e documentos posteriores têm identidades separadas.

Npm audit independente atual: produção zero; completo um High do advisory legado GHSA-ch52-4w7c-c8xp na cadeia de tooling. Lockfile intacto; exposição por cache HTTP sensível compartilhado não foi demonstrada no fluxo atual, mas o advisory não foi corrigido/encerrado. Não executar atualização/downgrade automático sem resolução compatível e nova prova de pacote.

Gitleaks staged do implementador: fase 1 (59,54 KB), core (22 arquivos/69,25 KB), interface/harness (19 arquivos/60,02 KB) e documentos/memória/parecer (22 arquivos/66,58 KB), exit 0/sem achados, incluindo testes/fixtures. Diff cached --check aprovado. Somente EOF extra do parecer foi removido antes do stage documental; conteúdo/digest da fonte independente não mudou.

Checkpoint documental 7cbdd8a: inventário leu 87 arquivos de docs; bootstrap 19 tickets/127 critérios/97 Markdown/363 links locais aprovado. Checkpoints 58937e6/1f69692/61ef01b/7cbdd8a enviados ao origin/codex/study-expansion em 04/10/2026, push exit 0/upstream configurado. C1–C12 aprovados, ticket movido para done/concluido; quadro/links/retomada atualizados em checkpoint separado, com scan e reconferência próprios. Nenhum serviço/release publicado. Fonte/pacote permanecem os identificados acima; a próxima ação humana é usar os fluxos pelo guia. Alpha externa continua parcial.

Reconferência final após movimentar o ticket: inventário 87 arquivos de docs, bootstrap 19 tickets/127 critérios/97 Markdown/366 links locais aprovado. Scans de fechamento e estado final do Git são registrados pelo comando real, sem alterar fonte/binário/parecer para declarar integração externa.
