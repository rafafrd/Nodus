# UI-02 — Refinamento e movimento

03/10/2026, Windows 11 10.0.26200, PowerShell nativo. Branch codex/smooth-ui a partir de 0da34c7. Node host portátil 24.21.0, Electron 44.5.1, React 19.3.0, Three.js 0.186.1, GSAP 3.15.0. App local 0.1.0; nenhuma migration ou API privilegiada nova.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| C1 | aprovado | Capturas reais da mesa, leitura, diálogo, Explorer e cidade inspecionadas. SVGs próprios uniformes, cantos retos, controles maiores, fonte de leitura e contraste dos estados. |
| C2 | aprovado | Barra Estudos/Explorer/Cidade fixa. Trocas rápidas conservam DOM do editor/canvas e rascunho real. Foco permanece running no Explorer e paused na cidade, consultado pelo main. |
| C3 | aprovado | Painéis discretos, seleção/disabled legíveis; mesa, Explorer e cidade em 1424×900 e 1040×760. PDF/página 2 e ferramentas continuam acessíveis. |
| C4 | aprovado | CodeMirror com sintaxe colorida, ícones, dirty dot, breadcrumb que revela src, separador por mouse e teclado 190–400 px. BOM/CRLF e Ctrl+S comparados byte a byte, rascunho/conflito/recovery/restart em jornada de regressão real. |
| C5 | aprovado | Luz quente/sombra suave, nomes contextuais acessíveis, peça de motor nível 1. Doze amostras da câmera mostram posições intermediárias; mina→motor durante movimento termina em targetX 1,74. Gesto/nova seleção cancela o tween anterior. |
| C6 | aprovado | Motor real 60→61 moedas e upgrade 25/nível 1/potência 3; ganhos locais e contador interpolado até valor confirmado, sem toast por pulso. Política econômica/UUID/cooldown continuam no main. |
| C7 | aprovado | Retarget de áreas/painéis/câmera, uma área interativa ao terminar, outras inert/aria-hidden/opacity 0. Ctrl+S funciona antes do fim da transição. Preferência reduced-motion alterada durante área/câmera; câmera permanece parada depois do cancelamento. QTE oculto não consome tecla de Estudos; Escape fecha diálogo, editor persistente e PDF2 retornam. Sem erros de renderer nas jornadas. |
| C8 | não verificado | Typecheck, 18 testes, build/pacote e jornada UI-02 passaram. Regressões finais passaram; AppSec concluído, documentação/push em fechamento; implementação 27bd358 e contador d50af65. Consultar o checkpoint abaixo. |

## Implementação e fronteiras

AreaStage mantém áreas já visitadas montadas, sobrepõe saída/entrada e retargeta da pose atual. Só a apresentação espera readiness/transição; stash/Save rodam antes ou durante o movimento. A saída fica inerte imediatamente, a entrada ganha interação no término. A barra de áreas permanece na mesma posição. MutationObserver e tweens são cancelados ao trocar destino/desmontar. Falha de carregar a cena libera a área com erro e controles disponíveis.

usePanelLayout captura retângulos antes de React alterar a grade e anima transforms a partir dessa pose. CodeMirror/PDF não são clonados; largura de layout se estabelece uma vez. useSurfaceMotion retargeta opacity/y sem revert que causaria salto. Diálogo nativo mantém foco/modalidade e trata Escape. Movimento reduzido é observado dinamicamente; não interfere em operações de dados nem no relógio essencial dos desafios.

CityScene conserva câmera/canvas entre áreas; tween ortográfico desloca target e zoom, usa frames intermediários e cede a gestos. RAF decorativo, polling do jogo e timing visual da oficina param na área oculta; geometria/material/renderer, observers e listeners são descartados no desmontar. O polling de notas/foco continua limitado para acompanhar estado canônico. AnimatedNumber/MotorGain usam somente a resposta do main. O contador restaura a amostra antes do primeiro paint para evitar flash do destino; seis amostras/40 ms no executável confirmaram valores intermediários até convergir ao saldo. XP/moedas não medem domínio acadêmico.

Explorer conserva tabs/buffers durante a troca de área e mostra rascunho local pendente, inclusive antes de um restart. Ctrl+S global da área não duplica Mod-s já tratado pelo CodeMirror. Separador guarda somente largura em localStorage; não há sessão/token nele. Fonte de arquivo continua inerte, sem HTML, preview ou execução.

Linguagens são extensões do CodeMirror existente, com versões exatas no lockfile: lang-javascript 6.2.5, html 6.4.12, css 6.3.1, json 6.0.2, language 6.12.4, lezer/highlight 1.2.5. Os parsers de JS/HTML/CSS já eram transitivos; a instalação acrescentou lang-json/Lezer JSON e declarou imports diretos. Sem segundo editor ou kit de componentes. Tipografia/paleta/ícones estão em refinement.css/Icon.tsx, navegação em ActivityRail/App, ciclo de movimento em motion/MotionDialog/CityScene.

Tempos efetivos: áreas 240/460 ms, painel de layout 420 ms, superfície 320 ms, contador 420 ms, câmera 850 ms, diálogo 260/160 ms. Usam curvas power3.out/power3.inOut; movimentos de área são 12–18 px. Referências de API consultadas: [GSAP to](https://gsap.com/docs/v3/GSAP/gsap.to/), [preferência de movimento](https://gsap.com/docs/v3/GSAP/gsap.matchMedia/), [técnica FLIP](https://gsap.com/docs/v3/Plugins/Flip/), [OrbitControls](https://threejs.org/docs/#OrbitControls). A captura/interpolação dos painéis é própria; o plugin Flip não foi adicionado/importado.

## Execuções e reprodução

Na raiz, com Node 24 no PATH, depois de package:win terminar:

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run package:win
npm.cmd run test:smooth-ui
npm.cmd run test:engine-explorer
npm.cmd run test:journey
npm.cmd run test:game
node scripts/check-bootstrap.mjs
```

typecheck e 18 testes passaram. package:win passou; persistem avisos não fatais de chunks grandes, autor ausente e referências duplicadas no empacotador. Log final em .local/evidence/smooth-ui-package.log. Jornada UI-02 final passou no executável: .local/evidence/smooth-ui-results.json, timestamp 2026-10-03T20:37:08.736Z, fixture smooth-ui-QaZlN9. Ela cria vault/SQLite/PDF e pasta atelier-demo com serviços reais, arquivo fictício UTF-8 BOM/CRLF, sem mocks de IPC ou arquivos pessoais.

Capturas: .local/evidence/smooth-ui-{study,dialog,reading,explorer,city,camera,compact-explorer,compact-city,compact-study}.png. Vídeo real da jornada: .local/evidence/smooth-ui-motion.webm. Foram inspecionadas e compartilhadas com o usuário. Esses artefatos e o perfil de teste permanecem locais/ignorados.

A primeira prova adicional de QTE oculto parou por seletor exact que omitia o sufixo “· sem custo” do botão Encerrar tentativa. Esse run não foi aprovado; o seletor foi corrigido para o prefixo, e a execução completa acima passou. A rodada de desenvolvimento e o primeiro pacote são provas preliminares, não identidade do pacote final.

## Identificação do pacote final

SHA256 medido após o último ajuste de movimento, antes das regressões finais:

| Arquivo | SHA256 |
| --- | --- |
| release/win-unpacked/resources/app.asar | EAD0249697389E1D02F82C7BA4BEF76C86D20E50A7ADF814D933F414EE7F4F0F |
| release/win-unpacked/App Estudos.exe | C2220B123C6EA6C6B07783DCE27E0F5CE6FD8D32F7753582743CC19770127624 |

O pacote é local x64 sem instalador/assinatura de distribuição. Hash do pacote e digest do audit de fonte são evidências distintas. Não medimos uma garantia universal de FPS/latência em outros GPUs; a prova mede poses/interrupção/dados e registra a renderização desta máquina. Diálogo de pasta nativo, editor externo, nuvem/celular/R8 e publicação continuam não verificados ou fora deste ticket.

## Checkpoint de encerramento

Regressões finais passaram no pacote identificado acima: engine/Explorer com dois projetos, conflito/BOM/CRLF/recovery e fechamento imediato; QTE/skillcheck 3/3; R1–R7 com duas matérias, notas/PDF/foco/checklist/retomada/conflito; jogo legado com memória em três dificuldades, quatro cultivos maduros, venda/coleta/cinco compras/build/respec/replay e produção passiva após 61 s fechado. Ledger concilia carteira/XP e mantém prêmio único por rodada. Não houve erro de renderer. AppSec independente concluído: [SMOOTH_UI_AUDIT](../security/SMOOTH_UI_AUDIT.md), APPROVE WITH MITIGATIONS para fonte local, zero achado de código aberto. Freeze 4728bccd… e suplemento f30de98c… identificam a revisão, com quatro testes próprios, probes de componentes/contador e Gitleaks incluindo fixtures; native/18 testes do implementador não são provas executadas pelo auditor. Audit produção zero; completo mantém oito High do mesmo advisory de tooling, com exposição e configuração reavaliadas. Evidências de regressão: .local/evidence/ui02-{smooth,engine-explorer,journey,game}.log e JSON das jornadas correspondentes: smooth-ui-results.json, engine-explorer-results.json, journey-results.json e game-verified-results.json. Os quatro roteiros foram repetidos após o ajuste final do contador no pacote SHA acima e passaram. Implementação 27bd358, ajuste de contador d50af65; Gitleaks dos dois stages passou (83,13KB e 940 bytes, sem achados). Parecer de fonte é registrado separadamente; nenhum parecer GAM-02 é atribuído automaticamente à UI-02.
