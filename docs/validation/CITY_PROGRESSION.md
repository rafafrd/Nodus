# GAM-03 — Janela própria, ambientes e progressão

06/10/2026, Windows 11 10.0.26200, Electron 44.5.1, app 0.1.0, Node 24.19.0 local. Branch codex/city-progression criada de codex/editorial-dashboard/80e0805, conservando UI-03. Sem subagentes, commit, push ou publicação. [Ticket](../tasks/done/GAM-03.md), [ADR](../adr/0013-cidade-progressiva-e-janela.md), [análise/regras](../decisions/city-progression.md), [guia](../GUIA_DE_USO.md).

## Implementação verificada

Faixa própria de 34px, três botões acessíveis e região CSS draggable. IPC específico e estrito; remetente/frame/URL principal exigidos. Fechar usa o handshake existente de drafts/foco. Fundo Editorial monocromático de 90s, independente, persistido; animações gerais, movimento reduzido, documento oculto e minimização interrompem o efeito. A automação mantém document.hidden false ao minimizar: o evento nativo também é usado, e data-running false foi conferido no Windows.

Cyberpunk e New York têm geometria completa, materiais, atmosfera e iluminação próprias; o mesmo canvas/câmera/locais/cultivos é conservado. Cinco produtores com preços crescentes e compras ×1/×10, 21 tecnologias encadeadas, 27 conquistas persistentes e quatro melhorias permanentes. Economia autoritativa, taxa antiga liquidada antes de mudar bônus, frações persistidas e produção offline limitada. Prestígio opcional com prévia/checkbox/confirmação e rejeição de prévia obsoleta; reset parcial preserva estudos e progresso explicitado na UI.

Oficina nova: 36 etapas, três fases, ritmo normal/tranquilo, preparação e janelas menores, tolerância de seis/dez erros, pausa/retomada persistente e cancelamento gratuito. Tempo/pontuação/recompensa vêm do main. Partidas legadas de três etapas conservam suas regras.

## Comandos e resultados

Todos com o runtime Node 24.19.0 no PATH somente do processo. Fixtures reais de demonstração em .local, serviços/SQLite/vault/IPC efetivos; nenhum perfil pessoal usado.

| Verificação | Resultado |
| --- | --- |
| npm run typecheck | aprovado |
| npm test | 42 testes aprovados após as alterações de domínio, registro passivo e fechamento durante carga |
| npx tsx --test tests/economy.test.ts | 2 aprovados na reconferência final, incluindo agregação de 20 consultas/segundos em uma linha de ledger por minuto |
| npm run package:win | aprovado, 441 módulos; avisos de chunks grandes/metadado author/dependências repetidas sem falha |
| preview-frontend.ts --packaged --stage=progression-release | aprovado: mesa/PDF/leitura/grade/ferramentas/compacto/movimento reduzido/restart/perfil vazio |
| smoke-city-progression.ts --packaged --fixture=.local/frontend-preview-bLxy18 | aprovado: duas partidas completas em tempo real e os demais fluxos abaixo |
| preview-frontend.ts --packaged --stage=progression-final --desk-only | aprovado no pacote final, fixture .local/frontend-preview-0DXIYb |
| smoke-city-progression.ts --packaged --fixture=.local/frontend-preview-0DXIYb --skip-workshops | aprovado no pacote final: controles/IPC/fundo/skins/economia/prestígio/pausa/draft/restart/capturas |
| npm run test:journey | R1–R7 aprovados no pacote final; R8 externo não verificado |
| npm run test:videos | aprovado no pacote final: YouTube real/cinema/PiP/isolar/retomar/crash e retry; faixa de janela acessível, PiP abaixo de 46px e QTE oculto durante sua janela de resposta sem consumir entrada |
| .local/check-final-window.ts | aprovado: foco ativo pausado pelo botão próprio e fundo desligado independente conservados após reinício; incorporado ao roteiro smoke-city-progression |
| smoke-city-progression.ts --packaged --fixture=.local/frontend-preview-Ij5HZP --skip-workshops | aprovado na reconferência final com foco ativo/fundo desligado/draft no mesmo fechamento, foco paused/recovered=false após reinício; nenhum pageerror |

Produção foi preparada antes da abertura pela classe Game com relógio de fixture acelerado por sete dias. Durante as partidas completas o app usou seu relógio real, sem seed de pontuação, moedas artificiais ou substituição de IPC.

QTE normal: 36/36 acertos, **140 segundos**, três fases, 300 moedas/60 XP. Calibração normal: 36/36 acertos, **159 segundos**, três fases, 375 moedas/60 XP. Recompensa proporcional/tolerância/rollback/replay/ritmo tranquilo e legado também foram testados nos serviços reais com relógio controlado. Duração é aproximada e depende do jogador; pausa e tentativas malsucedidas podem ampliá-la ou encerrar antes.

No roteiro Electron, maximizar/restaurar/minimizar e rótulos foram conferidos pelo estado nativo; região draggable pelo CSS efetivo. Argumento inválido retornou INVALID_ARGUMENT; janela distinta de prova recebeu FORBIDDEN para janela/get, comando e prestígio. Fundo mudou transform, desligou pelo controle independente e parou com movimento reduzido/minimização. As três skins reutilizaram canvas/câmera e conservaram cultivo. Compra real, bloqueio de tecnologia, conquistas, cancelamento e confirmação de prestígio, melhoria permanente, teclado oculto sem efeito e pausa/retomada passaram. Fechar/reabrir conservou draft de projeto, fonte BOM/CRLF byte a byte, vault, skin, prestígio e legado. Foco ativo pausou sem recuperação de crash, e fundo desligado continuou false com animações gerais true. Nenhum pageerror nos roteiros aprovados.

Na primeira regressão de vídeo, o PiP anteriormente deslocado para a esquerda cobria o botão Oficina; a captura confirmou a sobreposição. O roteiro agora reposiciona pelo controle real Home antes de clicar. A repetição passou sem force, sem alteração de produto, com reprodução/guest conservados. Na prova adicional de foco, startFocus corretamente rejeitou uma sessão já pausada; o roteiro foi corrigido para retomar a sessão existente. Esses erros de roteiro não foram apresentados como falhas do domínio.

## Pacotes e rastreabilidade

Partidas completas no EXE SHA256 c63b0cfa3f41e67d03f59e54731e8dba24d517ee66a84caa310a8d4ad4ba9442 / ASAR 93926ed879a1570ec8b46db5df0a4b00242555dd73705fe91b265526dc4da025. Depois, somente apresentação da Oficina em editorial.css foi neutralizada, removendo o fundo verde herdado. O roteiro completo de cinco minutos não foi repetido após esse ajuste CSS; fluxo curto e regressões foram executados no pacote final.

Pacote final: release/win-unpacked/App Estudos.exe, SHA256 **9b31036518c5cfcf34dcd221efcd307cc4561366ad7fcea6d32601683bf0bb1d**; resources/app.asar SHA256 **c5924ce9fb06dc7dea12e081cc42174e0ebbcbe9d49d7000bc419c74795d807c**. Todos os **201 arquivos dist** comparados byte a byte com o ASAR, sem diferenças. Main/preload mantêm os hashes da execução completa: 0230c13147bb20db844440ec8963a210ab8f30aafaab31698bb615c1cc5b3caa / b9784b9c338b29967e10eee8f0bcbb6a7742309c84283d56a14cb0c3236f1931.

Provas locais ignoradas: .local/evidence/progression-workshops-results.json e progression-workshops-package.json preservam a execução completa; progression-results.json, progression-final-results.json, progression-package.json, journey-results.json e frontend-progression-*.png registram os checkpoints. O script local verify-progression-package.mjs confere os assets/hashes. Capturas reais progression-cyberpunk.png, progression-newyork.png, progression-production.png, progression-prestige.png, progression-settings.png, progression-office.png e progression-compact-city.png foram inspecionadas; as partidas completas têm cópias workshops-progression-*-completed.png. O-016 registra os problemas visuais observados e corrigidos.

## Limites e fechamento

Sem migrations, dependências novas ou cópia de assets/textos do Cookie Clicker. Relógio e perfil são locais/editáveis pelo proprietário; a economia não é competitiva. Movimento reduzido não congela o desafio: Pausar é o controle explícito. Arraste físico/Snap Layouts do Windows não foram automatizados, embora a região CSS e controles nativos tenham sido conferidos. Diálogos de pasta e provas externas da alpha continuam em seus próprios tickets; nenhuma integração externa pendente foi aprovada por esta entrega.

Produto e verificações Windows concluídos; nenhum trabalho de implementação restante. Fechamento: node scripts/check-bootstrap.mjs aprovado — 21 tickets, 141 critérios, 104 arquivos Markdown, 410 links locais; npm run typecheck final e git diff --check aprovados. Avisos CRLF→LF não indicam erro de whitespace nem alteram configurações globais. Revisão do diff/inventário preserva as alterações UI-03 e mantém pacote, capturas, fixtures e perfis em pastas ignoradas. Próxima ação humana: usar o pacote e avaliar os cenários/ritmo conforme o guia. Alpha externa segue parcial.
