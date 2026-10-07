# ADR 0013 — Janela própria e progressão incremental local

Data: 06/10/2026. Estado: Aceita. Ticket: GAM-03.

## Contexto

O usuário pediu controles de janela próprios, movimento Editorial discreto/desligável, skins completas e maior profundidade na cidade. Confirmou produção automática, upgrades encadeados, conquistas e prestígio opcional; partidas da Oficina de aproximadamente 2–4 minutos; cenários Cyberpunk/New York conservando os locais e funções.

## Decisão

Janela principal frameless, com faixa HTML de 34px, região CSS draggable e botões no-drag. Preload expõe somente getWindowState/controlWindow/onWindowState; ações minimizar/toggle-maximize/fechar passam pela mesma validação de sender/mainFrame/URL existente. Fechar chama window.close e conserva o handshake de drafts/foco. Maximização/restauração externa publica estado. A faixa fica disponível durante carga das preferências. Cinema/PiP respeitam sua altura. APIs conferidas nas documentações oficiais de [title bar](https://www.electronjs.org/docs/latest/tutorial/custom-title-bar) e [drag regions](https://www.electronjs.org/docs/latest/tutorial/custom-window-interactions).

Fundo Editorial usa camada monocromática sem interação, transform de 90s e baixa opacidade. `preferences.editorialBackground` é independente de `animations`; ausência recebe true na leitura compatível, sem regravar o raw anterior. Movimento reduzido do sistema, animações gerais desligadas, minimização nativa e documento oculto interrompem o movimento. Nenhuma dependência nova.

Economia permanece autoritativa em Game/SQLite: cinco produtores, 21 tecnologias, 27 conquistas e quatro melhorias permanentes. Estado fica em game_player.state, com defaults e contadores derivados do ledger anterior quando o campo economy estiver ausente. Tabelas/schema v5 e fontes de estudo são preservados. Liquidação da taxa anterior precede compras/melhorias/conquistas/build/prestígio. Frações ficam salvas; consultas/replays não duplicam tempo. Produção de uma mesma janela de minuto/ciclo acumula em uma linha de ledger; operações ativas conservam origens únicas. Novos registros usam rule_version3; versões antigas não são reescritas.

Prestígio exige prévia/checkbox/confirmação e envia ganho/ciclo esperados; o main rejeita uma prévia obsoleta. Reinicia moedas, produtores/tecnologias do ciclo e nível do motor; encerra a Oficina ativa. Conserva estudo, XP/build, inventário, canteiros/cultivos, compras do mercado, skins, memória, conquistas, contadores da jornada e melhorias permanentes. Não há reset de vault, projetos, revisão ou foco.

Oficina nova usa 36 etapas, três fases progressivas, preparação com prazo mínimo, erros tolerados e pausa persistente. Timing usa a recepção no main; o renderer mostra o marcador e não fornece pontuação/tempo. Partidas legadas conservam suas três etapas e regras originais. Skins têm geometrias completas próprias, compartilham as coordenadas dos locais e reutilizam o renderer/câmera/plantas; não influenciam saldo ou dificuldade.

## Alternativas

TitleBarOverlay foi considerado; a faixa HTML permite botões próprios conforme o pedido. Um motor econômico separado e novas tabelas não são necessários para este perfil local. A ascensão de Cookie Clicker foi adaptada ao app: reset parcial escolhido pelo usuário, parâmetros menores e metas da cidade separadas do estudo. Não foram copiados assets ou textos do jogo.

## Consequências e revisão

Balanceamento é reversível e está em shared/economy.ts e shared/game.ts. Limite de 100 unidades por produtor/ciclo e valores inteiros seguros. Produção offline de 7 dias, ampliável a 14; relógio local e perfil editável pelo proprietário não constituem economia competitiva. Animações decorativas podem parar sem congelar o timing do jogo; para parar uma partida, use Pausar. [Análise/regras](../decisions/city-progression.md), [ticket](../tasks/done/GAM-03.md), [provas e limites](../validation/CITY_PROGRESSION.md): QTE140s/calibração159s reais, pacote Windows, skins/prestígio/foco/draft/restart aprovados.
