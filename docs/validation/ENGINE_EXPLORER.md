# Motor, desafios e Explorer — GAM-02

03/10/2026. Windows11 10.0.26200, Node24.21.0 portátil, Electron44.5.1/Node24.21.0, React19.3.0/TS5.9.3. Branch feat/engine-explorer parte de083bdc0. Dados fictícios em .local; nenhum vault/projeto pessoal usado.

## Comportamento entregue

Motor como entrada/fonte principal ativa, 10 upgrades/cooldown/replay; dois desafios reais, QTE e skillcheck, com botões/teclado e ritmo tranquilo/normal. Memória sem cronômetro, farm/moinho/loja/build anteriores mantidos. Explorer abre projetos reais em árvore/abas, edita UTF-8/BOM/CRLF, salva com hash/backup e recupera draft/conflito ao fechar/trocar vista. Seleção de pasta registra capacidade; source HTML/JS não é executado.

## Execuções efetivas

| Execução | Resultado |
| --- | --- |
| npm.cmd run typecheck | Passou |
| npm.cmd test | 18/18 passaram: SQLite/FS reais, migrações v1/v2→v3, perfil anterior sem reset, cooldown/replay/prêmio único/rollback, texto/caminho/junction/encoding/limite e preservação |
| npm.cmd run package:win | Pacote Windows gerado; sem assinatura/instalador. Avisos de tamanho de chunks, author e referências repetidas em tooling, sem falha |
| tsx scripts/smoke-engine-explorer.ts | Executável real, dois projetos, árvore/abas, edição seletiva1→2 conservando BOM/CRLF, Ctrl+S, duas versões externas, revisão+Save explícito, fechar imediatamente após digitar/reabrir, rascunho recuperado, troca Explorer/cidade/mesa; resolução/Save serializados, editor bloqueado durante mutation |
| Jornada motor/desafios no mesmo harness | Motor60→61, upgrade25→saldo36/potência3, pulso→39. QTE teclado3/3 recebe24/12; skillcheck com espera/tempo real3/3 recebe36/15. Sem injetar saldo/clock/resultado na jornada |
| tsx scripts/smoke-journey.ts | R1–R7 passaram novamente no pacote: matérias/Markdown/PDF/contextos/checklist/foco/restart/conflito. R8 não verificado |
| tsx scripts/smoke-game.ts --packaged | Cultivo/45s reais, colheita/venda/coleta/cinco compras/build/memória, reinício, produção passiva com tempo real fechado e retorno estudo passaram; ledger conciliado |
| tsx scripts/smoke-game-security.ts | Outra janela negada em game:get/action e project:list/choose/save, inclusive tentativa de abrir diálogo; sandbox/isolation/Node-off/webSecurity mantidos, sem alteração econômica |

Limites pertinentes: diálogos nativos não foram selecionados automaticamente; raízes/PDFs foram registrados pelos serviços reais em fixture, sem mock de IPC. Editor externo e nuvem não verificados. Fechamento normal preserva draft; encerramento forçado só recupera a última gravação concluída. Comparação hash/rename não bloqueia outro processo de FS e FS/SQLite não fazem commit conjunto. Falha de audit após rename foi reproduzida: fonte pode estar atualizada, draft e recovery permanecem, Save retorna erro. Fonte UTF-8 até1MiB; binários/links/junctions/.git recusados; sem execução/Git/terminal/criação/deleção de arquivos.

## Evidências e capturas

Resultados reais: .local/evidence/engine-explorer-results.json, engine-project-ipc-results.json, game-verified-results.json e journey-results.json. Capturas engine-explorer-engine/editor/conflict/resumed/qte/skillcheck/compact/study-return.png. Mostram fixture identificada, sem materiais pessoais. A árvore e fonte são dos projetos atelier-demo/caderno-demo. Capturas ficam locais neste PC; harness reproduz em outro Windows.

Viewport1040×760 e movimento reduzido exercitados, incluindo voltar aos estudos/PDFpágina2. Timing do skillcheck permanece por ser mecânica necessária; animações decorativas respeitam preferência. Nenhuma medição de GPU/CPU ou teste mobile foi alegada.

## Segurança e identificação

Auditoria incremental independente do agente autorizado: [ENGINE_EXPLORER_AUDIT](../security/ENGINE_EXPLORER_AUDIT.md). [Revisão das docs](PRODUCT_DOCS.md), [ADR](../adr/0007-explorer-local.md), [regras](../decisions/game-rules.md) e [guia](../GUIA_DE_USO.md). A identificação abaixo separa pacote e snapshot de fonte; o relatório distingue o scan inicial do suplemento final.

A revisão de fonte sugeriu possível concorrência Save/descarte; operações passaram a compartilhar fila/guard e CodeMirror fica readOnly enquanto gravam/decidem. A primeira nova prova detectou status falso de edição após carregar arquivo (callback programático disparava onChange), sem perda de bytes/draft; sincronização por props agora não é tratada como edição do usuário. Harness inclui eventos rápidos nos dois sentidos, fonte/draft/recovery e nova edição. Rerun final aprovado: Save→Usar arquivo e Usar arquivo→Save em eventos rápidos preservaram a operação inicial; nenhum Save ocorreu após descarte, texto descartado foi arquivado em recovery e a edição seguinte permaneceu recuperável.

## Identificação final do pacote

- app.asar SHA256: 0907DBC2E6D9E5EF9DD96256E045D3F6A6008212A2AC249AE2810BC5319E1143
- App Estudos.exe SHA256: 53AC4B45D41E2CA2A628193F25AD2803D2FF4EA73917F2A2701EDDCB09AC960A
- Snapshot final fonte MANIFEST: a8be0350038b400a77879663aaf6b203a47dd01e208a135bbe331970a4bd387d, .local/gam02-audit-final-3bffc756; baseline083bdc0/core62dbd60. Digest é da lista de hashes de bytes do workspace, não hash do Git/ASAR. Includes assets PDF gerados; nenhum dado pessoal.
- Jornada final npm.cmd run test:engine-explorer passou nesse pacote depois do bloqueio de edição/serialização/sync de props. R1–R7 e jogo legado foram repetidos no mesmo pacote final: journey-results.json em 2026-10-03T17:34:34Z e game-verified-results.json em 2026-10-03T17:40:00Z. O harness do jogo deixou de usar uma data fixa; essas datas identificam execuções reais novas.
