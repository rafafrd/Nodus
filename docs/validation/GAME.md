# GAM-01 — execução do jogo no Windows

02/10/2026, Windows 11 10.0.26200, Node portátil 24.21.0, Electron 44.5.1/Node embarcado 24.21.0, App Estudos 0.1.0, branch feat/game baseada em 884593e. Primeiro incremento local solicitado depois de UI-01; não conclusão do roadmap público.

## Critérios e provas

| Critério | Resultado | Evidência efetivamente observada |
| --- | --- | --- |
| C1 | aprovado | Cidade procedural Three.js com fazenda, mercado, mina, bosque, praça, moinho e casas. Seleção pelos botões de locais, zoom/centralização e screenshots no pacote; câmera pan/raycast implementados e inspecionados. Cantos retos, versão compacta 1040×760 e rodapé dentro da janela. Não foi feita medição de GPU. |
| C2 | aprovado | Quatro trigos plantados pela UI e colhidos após 45 s reais; venda retirou os quatro do inventário. Mina/bosque renderam recursos; cinco compras com ganhos reais fizeram aparecer moinho/casa/luzes e mais dois canteiros. Picareta dobrou pedra. Seis cenouras plantadas. App fechado por um minuto real e retomado: pelo menos quatro moedas passivas creditadas. |
| C3 | aprovado | Memória leve/normal/desafio resolvida pela UI apenas com labels revelados; seis rodadas completas, IDs/recompensas distintos. Deck demonstrativo curado e XP do jogo identificados. Build Prática mudou classe para Explorador, respec grátis voltou a Viajante. Rodada normal incompleta com primeira carta revelada retomada após reinício; seletor refletiu normal. |
| C4 | aprovado | 13 testes passaram, quatro específicos de game: replay/hash, insuficiência, maturação, cooldown global, venda, fração/cap/relógio do moinho, main calcula pares/prêmio, migration v1→v2 e rollback. Jornada IPC real rejeitou preço injetado, colheita precoce, saldo insuficiente e recompra; replay não repetiu efeito. SQL final conciliou carteira/XP e um evento de recompensa por rodada. Probe adicional do auditor provocou falhas reais de INSERT/UPDATE e verificou rollback/retry. |
| C5 | aprovado | package:win exit 0; test:game --packaged e test:journey R1–R7 exit 0. Rascunho permaneceu separado do arquivo durante jogo/restart e foi salvo pela UI com bytes iguais ao esperado; contexto do PDF/página/divisão e foco pausado preservados. Sem pageerrors. Novos canais rejeitaram outra janela no pacote; configuração isolada conferida. |
| C6 | aprovado | Regras, auditoria, docs/memória, guia de uso e evidência salvas. Economia 728047d e interface/jornadas 49489ad enviadas para origin/feat/game; quadro/retomada encerrados em checkpoint documental de 03/10/2026. Snapshot final de alterações incluindo testes/harness/relatório e stage documental de 18 arquivos: Gitleaks zero achados. Check-bootstrap e diff --check passaram. |

## Comandos executados

Usando PATH local do Node 24, sem mudar configuração global:

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
node_modules/.bin/tsx.cmd scripts/preview-game.ts --stage=02
npm.cmd run package:win
npm.cmd run test:game
npm.cmd run test:journey
node_modules/.bin/tsx.cmd scripts/smoke-game-security.ts
```

Typecheck exit 0, 13/13 testes, build/pacote e comandos finais de jornada/probe exit 0. Vite avisa chunks maiores que 500 KB; jogo/Three/Orbit/GSAP carregam por imports dinâmicos, sem alterar o bundle canônico do editor para resolver esse aviso. Não foi afirmada otimização medida de carregamento/GPU. electron-builder avisa ausência de author e pacote sem assinatura, mantendo o recorte local.

Tentativas intermediárias do harness falharam: preview procurava o nome do botão com ícone; aria-label explícito resolveu. Jornada usava inputValue em contenteditable e depois procurava a última linha fora da viewport virtualizada do CodeMirror. Asserções corrigidas para navegar ao fim, conferir draft via IPC e salvar pela UI/comparar bytes; a jornada final completa passou. Probe hostil data: não tinha crypto.randomUUID Web em contexto inseguro; usa node:crypto apenas na janela controlada de teste. Essas falhas não foram registradas como provas aprovadas.

## Dados e capturas

Fixture final de jogo: .local/game-journey-biS7kB, vault/PDFs fictícios do helper real scripts/test-fixture.ts. Perfil começou com 60 moedas/XP zero; não houve injeção de carteira, relógio ou pares secretos. Jogador automatizado aprende somente cartas públicas reveladas e conhece o significado dos pares curados. Seis rodadas deram 32/50/76/73/72/81 moedas e 27/46/67/68/67/68 XP. XP antes de fechar: 372, carteira 79, cinco melhorias, seis cultivos, três pedras/uma madeira. Ganhos acadêmicos não foram fabricados.

Evidência ignorada pelo Git, conservada localmente:

- .local/evidence/game-verified-results.json: jornada, IDs de rodada, estado antes do restart.
- .local/evidence/game-ipc-results.json: outra janela negada nos dois canais e preferências do renderer.
- .local/evidence/journey-results.json: regressão local R1–R7; R8 nuvem explicitamente não verificado.
- game-01-city.png e game-02-city/shop.png: capturas de progresso compartilhadas.
- game-verified-planted/city/shop/memory/build/compact/resumed-memory/study-return.png: capturas efetivas do pacote. Cidade e compacta inspecionadas visualmente; nenhuma imagem sintética usada como execução.

## Identificação do binário

SHA256 após package:win concluído e antes das jornadas, sem rebuild posterior:

| Artefato | SHA256 |
| --- | --- |
| release/win-unpacked/resources/app.asar | 4F88555428CCD802588DDA0524058DB7C4EE3C0DFCC449862B06A64FD740CA84 |
| release/win-unpacked/App Estudos.exe | A2B6ECDD5AB11C4D5B3583F0F0D2CAD1CA67D4EADCB3839527FF606E81853276 |

## Segurança e limites

[Parecer independente](../security/GAME_AUDIT.md): revisão de fonte/domínio e SQLite, zero vulnerabilidade de código confirmada, aprovação com mitigações para uso pessoal local. Scan do plugin tem cobertura parcial e digest inicial separado do pacote/commit final. Complemento do implementador: probe no executável Windows negou game:get e game:action enviados por uma segunda janela com IPC direto; sandbox/contextIsolation/webSecurity true e Node desligado conferidos no renderer principal. Esse teste não reclassifica a cobertura canônica do plugin nem substitui seu snapshot.

Audit produção zero; audit completo tem oito entradas High de um advisory de cache HTTP em tooling electron-builder, sem caminho aplicável encontrado na configuração atual. Exposição/fontes/remediação futura descritas no parecer; não foi aplicado downgrade automático nem declarado audit completo limpo. Fixtures/tests são incluídos no scan final de segredos do checkpoint.

Sem sincronização, IA/geração de decks de notas, missões/conquistas semanais, multiplayer ou moeda real. Baralho demonstrativo, balanceamento provisório e autoridade do relógio local. Vault/SQLite sem criptografia própria; pacote sem assinatura, sem instalador/publicação. Diálogo nativo de escolha de PDF não automatizado (fixtures vinculadas pelos serviços reais). ALP-02/C5 externo e ALP-09/R8 mantêm seus resultados pendentes. Próxima ação humana após fechamento: abrir release/win-unpacked/App Estudos.exe e entrar em Seu mundo para avaliar ritmo/arte com perfil de teste.
