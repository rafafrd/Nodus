# UX-02 — Clareza e animação 3D

Execução Windows nativa em 09/10/2026. Incremento sobre UX-01/GAM-05, na branch local codex/visual-experience. Fixtures geradas e perfis isolados; nenhum vault pessoal aberto. Node24.21.0 portátil, Electron44.5.1, Three.js0.186.1, app0.1.0. Sem dependência/schema/lockfile novos, stage, commit, push ou publicação.

## Critérios

| Critério | Resultado | Prova |
| --- | --- | --- |
| C1 | aprovado | Hoje/primeiro uso, próxima ação baseada no catálogo e checklist existentes; teste de referências ausentes |
| C2 | aprovado | Painel de conteúdo, escrita/título, Markdown/PDF/link YouTube pelos fluxos reais; originais intactos |
| C3 | aprovado | Acervo, navegação, locais nomeados, quatro temas, compacto 1040×760, quatro divisões e retomada |
| C4 | aprovado | Livro/páginas/órbita, água, nuvens, partículas confirmadas, postos, três skins e distrito; dois clipes reais |
| C5 | aprovado | Preferência reduzida dinâmica, minimização, área oculta, perda real de WebGL e ferramentas operáveis |
| C6 | aprovado | Typecheck, 82/82 testes, pacote Windows e sete jornadas/regressões |
| C7 | aprovado | Relatório, 21 capturas, dois clipes, docs/quadro/bootstrap e 204 arquivos idênticos no ASAR |

## Reprodução

Use o Node24 portátil do projeto no PATH, sem alterar o host global. Scripts usam SQLite real do Node e executável Electron empacotado. Os perfis são criados em .local e permanecem fora do Git.

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run package:win
node.exe node_modules/tsx/dist/cli.mjs scripts/smoke-visual-experience.ts
node.exe node_modules/tsx/dist/cli.mjs scripts/smoke-notes-ux.ts
node.exe node_modules/tsx/dist/cli.mjs scripts/smoke-farm.ts
node.exe node_modules/tsx/dist/cli.mjs scripts/smoke-deep-economy.ts --packaged --visual-only
node.exe node_modules/tsx/dist/cli.mjs scripts/smoke-study-tabs.ts --packaged
node.exe node_modules/tsx/dist/cli.mjs scripts/smoke-videos.ts --packaged
node.exe node_modules/tsx/dist/cli.mjs scripts/smoke-journey.ts --packaged
node.exe scripts/check-bootstrap.mjs
```

## Escopo das provas

A jornada nova cria notas/matérias/checklist e material fictício. Materiais para os três projetos são uma fixture explícita de inventário, paga através das ações reais. As jornadas Farm e Deep Production mantêm suas próprias fixtures declaradas. Não são uma medida de tempo de um jogador.

O painel de conteúdo usa os mesmos contratos privilegiados. Na jornada nova, o resultado do seletor nativo é preenchido pelo harness com arquivos de teste conhecidos. Importação, validação, cópia, SQLite e PDF.js são reais. Operar o diálogo de arquivos do Windows manualmente não está aprovado por essa seleção automatizada.

Os clipes WebM são gravados do canvas real com captureStream/MediaRecorder. Neste host, parar essa gravação deixou tiles antigos do compositor em capturas posteriores, apesar de display:none/opacity0/aria-hidden corretos no DOM. A captura sem gravador em processo novo confirmou a interface limpa. O roteiro agora tira as fotos antes dos vídeos e grava em outro processo. Nenhum arquivo de imagem foi reconstruído como prova de interface.

O livro usa 52 draw calls; a cidade da fixture simples usa 468 draw calls/7.919 triângulos. A amostra curta no host registrou aproximadamente 30 quadros/s. Isso comprova movimento nesse ambiente, não desempenho universal em hardware distinto. O distrito tem 119 objetos de geometria, conservados entre skins e sem escalar com as unidades econômicas.

O modo reduzido desenha uma composição estática e conserva os ganhos/estoques calculados no main. Ocultar/minimizar pausa o loop; retornar não concede tempo econômico pelo renderer. A extensão WEBGL_lose_context provoca perda real de GPU para verificar que Motor e ferramentas continuam operáveis.

## Arquivos principais

- [DayOverview](../../src/renderer/DayOverview.tsx), [StudySculpture](../../src/renderer/StudySculpture.tsx), [ContentShelf](../../src/renderer/ContentShelf.tsx) e [study-navigation](../../src/shared/study-navigation.ts).
- [App](../../src/renderer/App.tsx), [ActivityRail](../../src/renderer/ActivityRail.tsx), [VideoWorkspace](../../src/renderer/VideoWorkspace.tsx), [motion](../../src/renderer/motion.tsx) e [experience.css](../../src/renderer/experience.css).
- [FarmScene](../../src/renderer/FarmScene.ts), [CityEffects](../../src/renderer/CityEffects.ts), [CityScene](../../src/renderer/CityScene.tsx), [UrbanScene](../../src/renderer/UrbanScene.ts), [ProductionDistrict](../../src/renderer/ProductionDistrict.ts).
- [Jornada nova](../../scripts/smoke-visual-experience.ts) e [teste da próxima ação](../../tests/study-navigation.test.ts).

## Limites

Compreensão humana ainda não avaliada; GAM-05/C8 permanece doing/parcial. As provas externas da alpha (nuvem/celular/editor externo) continuam pendentes nos tickets existentes. Não houve publicação nem execução com dados pessoais. O pacote continua local e sem assinatura, conforme a configuração existente. Baseline do checkout anterior preservada em .local/visual-baseline.

## Resultados e artefatos finais

| Verificação executada | Evidência | Resultado |
| --- | --- | --- |
| Typecheck | [Log](evidence/visual-experience/typecheck.log) | aprovado |
| Suíte de domínio/persistência/IPC | [82/82 testes](evidence/visual-experience/tests.log) | aprovado |
| Build e pacote Windows | [Log](evidence/visual-experience/package.log), [204 hashes](evidence/visual-experience/package.json) | aprovado |
| Jornada nova de apresentação/conteúdo/3D | [Resultado](evidence/visual-experience/windows.json), [log](evidence/visual-experience/visual.log) | aprovado; erros de renderer/shader vazios |
| Notas UX e primeiro uso | [Resultado](evidence/visual-experience/notes-ux.json), [log](evidence/visual-experience/notes-ux.log) | aprovado |
| Farm: produção real, estoques, motor, offline/restart | [Resultado](evidence/visual-experience/farm.json), [log](evidence/visual-experience/farm.log) | aprovado |
| Distrito: três skins, movimento reduzido, geometria limitada | [Log](evidence/visual-experience/district.log) | aprovado |
| Abas: arraste, teclado, quatro painéis, contexto/restart | [Resultado](evidence/visual-experience/study-tabs.json), [log](evidence/visual-experience/study-tabs.log) | aprovado |
| Player oficial: rede real, cinema/PiP, crash/retry, isolamento | [Resultado](evidence/visual-experience/videos.json), [log](evidence/visual-experience/videos.log) | aprovado |
| Jornada MVP R1–R7: estudo, PDF, foco/checklist, conflito/restart | [Resultado](evidence/visual-experience/journey.json), [log](evidence/visual-experience/journey.log) | aprovado; R8 externo permanece não verificado |
| Relatório HTML: imagens/links, dois vídeos reproduzidos, larguras 1280/480 | [Resultado Edge isolado](evidence/visual-experience/report.json) | aprovado; quadros de vídeo decodificados |
| Preservação do checkout anterior e stage vazio | [Resultado](evidence/visual-experience/preservation.json) | aprovado; 100 dos 115 arquivos de baseline byte idênticos, incluindo todos os 68 críticos |
| Consistência documental e whitespace do diff | [Bootstrap](evidence/visual-experience/bootstrap.log), [diff](evidence/visual-experience/diff.log) | aprovado; 30 tickets/203 critérios |

O pacote validado é release/win-unpacked/App Estudos.exe. SHA256 do executável: 8b733ef704c85078bfcaaa20f339d2f2d1f77c15078bb23c38dadd7e418084a0. SHA256 do ASAR: 5abcfe1dc44ec86500611e709a182fbb5484da447c54c50abe3fa516a0728ae9. Nenhuma alteração de fonte de produto ocorreu depois dessas jornadas.

O [manifesto](evidence/visual-experience/manifest.json) registra bytes/hashes das 21 capturas originais, dois clipes e demais provas. São 18 capturas da nova jornada e três do distrito; screenshots adicionais de regressões ficam em .local, conforme os respectivos resultados. Os logs foram sanitizados apenas para substituir o caminho absoluto do workspace. O relatório está em [Bom dia](../reports/BOM_DIA_2026-10-09.md), também disponível como [galeria HTML com vídeos](../reports/BOM_DIA_2026-10-09.html).

Na prova do relatório, Edge cancelou uma requisição de metadados/range ao iniciar o vídeo local; ela está registrada separadamente. Ambos os clipes avançaram mais de um segundo e decodificaram 23 quadros, sem erro de mídia. A conferência de preservação permite somente a movimentação do próprio UX-02 de doing para done; nenhum arquivo herdado foi removido. Main/preload/shared, editor/persistência e evidências anteriores permaneceram byte idênticos ao baseline.

### Galeria

| Apresentação | Captura |
| --- | --- |
| Hoje e próxima ação | [Ampla](evidence/visual-experience/hoje.png), [compacta](evidence/visual-experience/hoje-compacto.png) |
| Conteúdo e acervo | [Entrada](evidence/visual-experience/adicionar-conteudo.png), [notas](evidence/visual-experience/acervo.png), [PDF](evidence/visual-experience/pdf.png), [aulas](evidence/visual-experience/aulas.png) |
| Primeiro uso | [Preparação](evidence/visual-experience/primeiro-uso.png), [primeira nota](evidence/visual-experience/primeira-nota.png) |
| Projetos na Cidade | [Contorno](evidence/visual-experience/projeto-em-construcao.png), [conclusão 3D](evidence/visual-experience/construcao-3d.png), [compacta](evidence/visual-experience/cidade-compacta.png) |
| Três skins | [Vale Sereno](evidence/visual-experience/cidade-valeserene.png), [Cyberpunk](evidence/visual-experience/cidade-cyberpunk.png), [New York](evidence/visual-experience/cidade-newyork.png) |
| Quatro temas | [Editorial](evidence/visual-experience/hoje-compacto.png), [Oliva](evidence/visual-experience/tema-olive.png), [Midnight](evidence/visual-experience/tema-midnight.png), [Graphite](evidence/visual-experience/tema-graphite.png) |
| Distrito produtivo | [Original](evidence/visual-experience/district-original.png), [Cyberpunk](evidence/visual-experience/district-cyberpunk.png), [New York](evidence/visual-experience/district-newyork.png) |
| Animações gravadas do canvas | [Livro e ideias](evidence/visual-experience/ideias-3d.webm), [Cidade viva](evidence/visual-experience/cidade-viva.webm) |
