# Nodus — como iniciar e usar

Guia da versão local Windows, atualizado em 08/10/2026. O executável ainda se chama **App Estudos**. A branch local **codex/notes-navigation** inclui escrita imediata, captura de material e navegação orientada à matéria, além da implementação de IA-01. Abas/grade, foco, checklist, produção, temas, projetos, YouTube/cinema/PiP, exportação e backups permanecem disponíveis. Este incremento ainda não foi enviado ao remoto.

## 1. Abrir agora neste PC

Abra esta pasta no Explorador de Arquivos e dê dois cliques em **App Estudos.exe**:

```text
C:\Users\Rafael\Documents\Programação\Projetos\Nodus\release\win-unpacked
```

O pacote já foi gerado e testado nesta máquina. Ele contém o runtime; para abrir essa build você pode usar diretamente o executável. Ao mover o app, copie a pasta **win-unpacked inteira**, com resources e os demais arquivos.

Também pode abrir pelo PowerShell:

```powershell
Set-Location -LiteralPath 'C:\Users\Rafael\Documents\Programação\Projetos\Nodus'
& '.\release\win-unpacked\App Estudos.exe'
```

## 2. Rodar pelo código em desenvolvimento

Requisitos da aplicação: **Node.js 24**, npm e o repositório. Git é necessário para clonar/atualizar o código. Os comandos abaixo são para PowerShell.

Neste PC há um Node 24 portátil já preparado. Use-o apenas no terminal atual:

```powershell
Set-Location -LiteralPath 'C:\Users\Rafael\Documents\Programação\Projetos\Nodus'
$env:PATH = (Resolve-Path '.local/node-v24.21.0-win-x64').Path + ';' + $env:PATH
node --version
npm.cmd --version
npm.cmd run dev
```

O comando abre a janela do app. O terminal acompanha logs; feche a janela ou use Ctrl+C para encerrar. Mudanças na interface podem atualizar durante o desenvolvimento. Após mudar main/preload, encerre e inicie novamente para carregar a nova build.

Em um PC novo, prepare Node 24 conforme [setup Windows](setup/windows.md), clone e instale as dependências:

```powershell
git clone https://github.com/rafafrd/Nodus.git
Set-Location -LiteralPath '.\Nodus'
node --version
npm.cmd ci
npm.cmd run dev
```

Confira que node --version começa com v24. A pasta portátil .local não acompanha o Git; o PC novo usa seu próprio Node 24. npm ci usa o lockfile e precisa baixar dependências. O clone traz a main disponível no remoto; UX-01 está apenas neste checkout local. Se já tem o repositório/dependências preparados, basta entrar na pasta e executar npm.cmd run dev. Use npm.cmd quando o PowerShell bloquear npm.ps1.

## 3. Gerar e abrir uma nova build Windows

Na raiz do projeto, usando Node 24:

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run package:win
& '.\release\win-unpacked\App Estudos.exe'
```

Espere package:win terminar sem erro antes de abrir o executável. A saída é um pacote de pasta, sem instalador/assinatura de publicação nesta versão. Para usar o código local sem empacotar:

```powershell
npm.cmd start
```

start gera a build e abre Electron. A aplicação atual funciona localmente no Windows; consulta web/celular sincronizada continua no roadmap, sem serviço de nuvem configurado para este recorte.

## 4. Preparar seu espaço de estudo

O app inicia no **Caderno**. No primeiro uso, clique em **Preparar pasta de notas** para usar Documentos/NodusNotes ou **Escolher outra pasta** para uma pasta dedicada fora do repositório. Em seguida, **Criar primeira matéria**. O menu mostra **Matéria atual**; trocar esse seletor abre suas notas, PDFs e aulas daquela matéria.

Clique em **Nova nota** e escreva imediatamente, sem formulário de título. Ao salvar uma nota ainda chamada Sem título, o primeiro conteúdo sugere um nome; você pode editar o título acima do texto a qualquer momento. **Guardar em** muda a matéria após salvar, mantendo identidade, conteúdo, cartões e conexões. A organização por matéria muda no app; o arquivo continua no caminho original para conservar referências relativas.

**Usar modelo** acrescenta Aula, Conceito ou Exercício à nota. É opcional e preserva o texto que já existe. **Minhas notas** abre a lista da matéria, com as últimas abertas primeiro e **Importar notas Markdown**. A seleção aceita vários arquivos UTF-8 de até 2 MiB cada; arquivos externos são copiados para a pasta de notas e os originais permanecem intactos. O aviso informa quantos entraram e eventuais falhas por arquivo. Identidade duplicada ou de outra matéria precisa ser corrigida, sem remapeamento silencioso.

Na escrita comum ficam ocultos os metadados e o título Markdown. Abra **Mais formatação e fonte → Ver fonte completa** quando precisar do arquivo inteiro; os campos de identidade devem ser conservados. Há ações diretas de negrito/lista, **Criar cartão do trecho** e **Relacionar nota**. O cartão por seleção já conhece matéria/nota e usa o trecho como resposta; preencha a pergunta. Relações conectam notas da matéria e podem ser exploradas em **Conexões**.

**Leitura** mostra a prévia. **Salvar** ou **Ctrl+S** grava no arquivo; confira **Salvo no arquivo**. Rascunhos recuperados permanecem separados da fonte até salvar. Fórmulas, campos desconhecidos, referências e código permanecem no Markdown; edição externa concorrente apresenta as versões para revisão. **Buscar/Ctrl+K** encontra títulos, palavras do conteúdo e rascunhos, com um trecho e a matéria no resultado.

Todos os módulos ficam no menu lateral: Caderno, PDFs, Aulas, Revisão, Conexões, Início, Projetos, Cidade e Ajustes. **Como navegar** explica matéria e divisões. **Clique** deixa somente aquele módulo na aba atual, preservando outras abas. **Arraste para o espaço central** para acrescentar uma janela; a prévia mostra a divisão. O botão **+** do subitem aparece no hover/foco e oferece a mesma ação pelo teclado. Cada aba aceita até quatro módulos distintos; arrastar um já aberto apenas o foca.

Use o botão **Recolher menu lateral**, à esquerda das abas, para esconder o menu inteiro e ampliar o espaço de trabalho. O mesmo botão **Expandir menu lateral** o reabre; Enter/Espaço também funcionam. A escolha fica salva ao reiniciar e não altera suas abas, janelas ou divisores. A linha ao lado de cada módulo aparece apenas no hover/foco, com espaço antes do ícone.

No topo ficam as **abas de trabalho**, com **+** para criar e **×** para fechar. Cada aba conserva seus módulos, painel focado e divisores após reinício. Uma janela ocupa tudo; duas dividem em colunas; três usam esquerda inteira e dois à direita; quatro formam **2×2**. Arraste os divisores para ajustar largura/altura. Com foco no divisor, use setas, Shift+seta para 5% e Home para voltar a 50%; limites20–80%. O **×** do painel o fecha, e o ícone **Ampliar** o deixa sozinho na aba. Cabeçalhos e conteúdo se adaptam ao tamanho do painel.

Atalhos: **Ctrl+T** cria uma aba; **Ctrl+W** fecha a atual, conservando pelo menos uma; **Ctrl+Tab/Shift+Ctrl+Tab** alternam; **Ctrl+1…8** selecionam pelo número e **Ctrl+9** vai à última. Na barra, setas/Home/End também selecionam. Até32abas locais. Composição/foco/tamanhos são independentes; matéria, nota, documento, player e estado interno dos módulos são compartilhados entre abas. Os rascunhos permanecem ao trocar ou fechar abas. [Decisão](adr/0016-abas-e-grade-de-estudo.md), [provas Windows](validation/STUDY_TABS.md).

**PDFs** e **Aulas** podem ficar junto do Caderno ou de qualquer outra área. Em **PDFs → Adicionar PDF**, escolha o arquivo local; documento e página ficam associados à matéria. Selecione um trecho de texto digital e clique em **Adicionar à nota**; sem nota aberta, **Criar nota do trecho** cria uma. Comentários de marcações também podem ser levados à nota. A captura inclui documento, página e versão, com espaço para sua observação. Em Leitura, clique na fonte para voltar ao PDF; se o arquivo mudou, o app avisa e conserva o trecho capturado. PDF sem texto pode usar comentários; não há OCR.

Em **Aulas**, os momentos anotados oferecem **Adicionar à nota** com a referência do vídeo/segundo. A fonte abre o player oficial naquele tempo. **Praticar este material**, em PDFs/Aulas, abre a prática de IA externa com a fonte selecionada; o envio à IA continua manual, como descrito no [guia da prática](features/atividades-ia-externa.md). Vídeo fornece suas anotações locais, sem transcrição automática.

Caderno/PDFs/Aulas compartilham o contexto de matéria, escolhido em Minhas notas ou nos seletores. Há uma instância de cada área; duas matérias independentes em dois cadernos não fazem parte deste incremento. [Provas de UX-01](validation/NOTES_UX.md).

**Foco** e **Checklist** ficam no rodapé. Passe o mouse ou use Tab para revelar; clique para fixar, feche pelo × ou Escape. O foco continua contando quando seu painel fica recolhido. Checklist conserva tarefas, etapas e próxima ação por matéria. Entrar na Cidade pausa o foco ativo como antes.

| Atalho | Ação |
| --- | --- |
| Ctrl+S | Salvar a nota/projeto da área focada |
| Alt+1 | Revelar foco |
| Alt+2 | Revelar checklist |
| Esc | Fechar ferramentas suspensas/acervo ou sair do cinema |

## 4.1. Guardar vídeos do YouTube

1. Na matéria desejada, abra **Aulas → Salvar link do YouTube**.
2. Cole o link do YouTube e, se quiser, dê um título para encontrar a aula depois. Links watch, youtu.be, Shorts, live e embed são reconhecidos. O tempo inicial do link é conservado; links repetidos na mesma matéria conservam a entrada e o tempo original.
3. Clique em **Salvar link**. Ele fica nesta matéria, sem conectar ao YouTube. Não precisa escolher vault para salvar vídeos.
4. Clique em **Abrir player** ou no vídeo da lista; depois use **Play** do YouTube. Esta etapa precisa de internet. Volume, legendas, velocidade e progresso usam os controles oficiais.
5. No cabeçalho do player, **Modo cinema** amplia o vídeo e escurece a mesa. **Esc** ou **Sair do cinema** volta; também funciona com o player focado.
6. **Vídeo em PiP** cria o player flutuante dentro do app. Arraste pelo título; com o título focado, use setas, Shift+setas para passos maiores, ou Home para o canto inferior direito. Ele permanece no Explorer e fica contido ao redimensionar a janela.
7. **Voltar vídeo à mesa** retorna à matéria de origem. Recolher a área de Vídeo, trocar matéria ou rolar o vídeo para fora do painel passa para PiP. A reprodução continua no mesmo player entre modos.
8. **Fechar player** para a reprodução e conserva o link. O **×** da lista remove o link salvo. Reabrir o app restaura lista/seleção; abrir o player novamente é uma ação sua.

PDF e vídeo têm seleções separadas: abrir o módulo **PDF** conserva o documento/página. Notas/rascunhos continuam pelo fluxo normal de salvar/retomar. Cinema suspende interação e atalhos de áreas cobertas; ver o vídeo não muda recompensas do jogo.

Vídeos privados, indisponíveis, restritos por idade/região ou sem incorporação podem ser recusados pelo YouTube. O app não baixa o vídeo nem contorna essa restrição. Uma falha de conexão/processo mostra **Tentar novamente**; erros específicos do vídeo aparecem no player oficial. PiP fica dentro desta janela, não por cima de outros programas. Movimento reduzido acompanha a configuração já descrita no guia.

## 5. Jogar no Observatório (GAM-06)

Clique em **Cidade** na barra à esquerda. O jogo é opcional, local e **independente do estudo**: Foco e revisões dão só XP e conquistas de estudo, nunca centelhas ou produção. Ele nunca abre sozinho, não envia notificações e não pede atenção durante uma sessão de Foco. Um perfil novo começa com 15 centelhas.

### O Observatório

1. **Núcleo** (à esquerda): clique para ganhar centelhas. Não há limite diário. As melhorias *Núcleo afinado* dobram o clique; as *Lentes* fazem cada clique somar 1% da produção por segundo. Os cliques são enviados em lotes e o saldo do topo já mostra os que estão a caminho.
2. **Loja** (à direita): escolha ×1, ×10, ×100 ou máx e compre instalações. Cada linha mostra o ganho por segundo e, quando ainda não dá, em quanto tempo dará. A próxima família aparece como **???** até o total produzido alcançá-la. Melhorias ao alcance ficam no topo, ordenadas por preço.
3. **Cidade** (ao centro): construções crescem conforme as quantidades; casas, fonte, lanternas, moinho e postos surgem sozinhos em marcos do total produzido. Arraste para explorar; os botões abaixo aproximam, afastam e centralizam.
4. **Lampejo**: um ponto de luz aparece sobre a cidade depois de 4 a 9 minutos **com a Cidade na tela** (o tempo em outras áreas não conta) e fica 12 segundos. Clique para receber **Maré** (produção ×5 por 1 min), **Achado** (até 12 minutos de produção) ou **Faísca** (clique ×200 por 10 s). Perder um Lampejo não custa nada. Com Foco ativo, nenhum aparece.
5. O **ticker** no topo traz notícias do vale conforme seu progresso.

### Minigames: Mira, Memória, Horta e Conselho

Você chega a qualquer minigame de três jeitos:
- pelo grupo **MINIGAMES** do menu do jogo;
- pela lista **Minigames** abaixo do núcleo, que mostra o estado de cada um ("2 prontas para colher", "Abre com 10 Coletores · 4/10");
- pela etiqueta **JOGAR ▸** no mapa, onde um anel no chão pulsa quando o minigame está aberto.

Um ponto ao lado do nome indica que há algo esperando você.

- **Mira** (sempre aberta): escolha **Leve**, **Normal**, **Difícil** ou **Insano** e clique em **Começar rodada**. Depois de uma contagem de 3 s, quadrados aparecem e somem sozinhos; o quadrado externo que se fecha mostra quanto tempo falta. Acerte o mais perto possível do centro: o centro vale 300, o meio 100 e a borda 50. Clicar no vazio derruba a precisão.
  - A rodada dura cerca de 20 s e paga minutos de produção conforme o nível e a precisão.
  - **Sair da rodada**, trocar de área ou minimizar a janela encerra a rodada sem pagar.
  - Precisa de mouse ou toque.
- **Horta** (abre com 10 Coletores): escolha a semente e plante; cada uma custa um minuto de produção. Trigo-luz (3 min) paga 8 minutos de produção; Raiz-âmbar (8 min) deixa o clique ×3 por 5 minutos; Flor-de-orvalho (15 min) soma 3% de produção **enquanto estiver plantada** e paga pouco ao colher. Plantas maduras esperam o tempo que for preciso.
- **Conselho** (abre com 5 Oficinas): três cadeiras de força 100%, 60% e 35%. Cada pauta tem ganho e custo (por exemplo, *Turno estendido*: mais produção, clique mais fraco). Trocar uma pauta gasta uma deliberação; elas voltam uma a cada 30 minutos, até três. Esvaziar uma cadeira é grátis.
- **Memória de Conceitos**: 3, 6 ou 9 pares, sem limite de tempo; a recompensa é medida em minutos de produção.

### Conquistas, Legado e Perfil

**Conquistas** mostra as próximas, as conquistadas, as de estudo e as notas secretas; cada conquista de jogo soma 0,2% à produção. **Legado** abre o recomeço voluntário: confira a prévia, marque que entendeu e confirme para ganhar insígnias (+5% de produção cada) e comprar melhorias permanentes; Horta, Conselho, marcos da vila e conquistas continuam. **Perfil** guarda XP, nível e a build, que define só a classe; ali também ficam cenário (Vale Sereno, Cyberpunk, New York) e ambiente (Dourado, Amanhecer, Noite).

Em **Ajustes → Aparência**, **Som do jogo** regula o volume dos sons curtos da Cidade, ou deixa mudo. Se você jogava antes de GAM-06, o progresso foi convertido na primeira abertura, com um backup `backups/antes-regras-jogo-v3-*.sqlite` na pasta de dados: [o que mudou e como reverter](adr/0026-jogo-incremental-independente.md).

XP e centelhas não medem domínio acadêmico. [Design do jogo](design/GAME_DESIGN.md) · [provas](validation/GAM_06_GAME.md).

## 6. Explorer: seus projetos e arquivos

1. Clique em **Explorer** na barra fixa à esquerda; ela também oferece **Estudos** e **Cidade** em todas as áreas.
2. Use **Abrir pasta** ou **+** e escolha uma pasta de projeto no diálogo do Windows. Os projetos ficam na lista lateral, separados do vault de notas e do Git do app.
   **Visão geral** abre o catálogo sem fechar abas. Use **Tornar principal** ou **Tornar secundário** nos cards para organizar as pastas; a escolha é salva neste perfil e retomada ao reabrir. Projetos novos aparecem em secundários. **Explorar** seleciona a árvore do projeto; abra um arquivo nela para editar.
3. Clique no nome do projeto e expanda as pastas. Clique em um arquivo para abrir uma aba. Pode manter arquivos de projetos diferentes abertos; o limite é12 abas/40 projetos.
4. Edite e pressione **Ctrl+S** ou **Salvar**. Confira **Salvo no arquivo**: isso grava no arquivo real. Um ponto na aba indica edição pendente.
5. Troque de aba/projeto/área ou feche normalmente: o rascunho fica no perfil e as abas são retomadas. **Rascunho recuperado** ainda não é arquivo salvo.
6. Se outra ferramenta editar o arquivo, a edição limpa é atualizada; com texto pendente, aparece **Arquivo alterado fora do app**. Abra **Ver versão externa**, escolha **Usar arquivo externo** ou **Conservar minha edição para revisão**, revise e salve explicitamente.

Arraste o separador ao lado da árvore para ajustar sua largura. Com foco no separador, **←/→** alteram 10 px e **Home/End** usam os limites; dois cliques voltam à largura inicial. Clique nas pastas do caminho acima do editor para revelá-las na árvore. TS/TSX/JS/JSX, JSON, HTML, CSS e Markdown têm cores de sintaxe; são texto, sem executar o arquivo.

**↻** atualiza a árvore; **Estudos** volta à mesa e **Cidade** abre o jogo. Arquivos de texto UTF-8, inclusive BOM/CRLF, até1MiB são aceitos. Binários, junctions/links e metadados .git são bloqueados; node_modules não entra na árvore. Se o arquivo desaparecer, seu rascunho é preservado e Save fica indisponível até recuperar o arquivo no computador.

Este incremento edita arquivos existentes como fonte. Criar/deletar arquivos, terminal, execução/preview HTML ou JS, Git de projetos e autocomplete de linguagem ficam para tickets posteriores. Alterações de arquivos geram cópias em project-recovery no perfil. Se ocorrer erro depois de gravar no disco, o app conserva o rascunho/backup; confira o arquivo antes de tentar de novo.

## 7. Configurações: perfil, temas e app

Clique **Ajustes** ou no perfil, no rodapé da barra fixa. Voltar aos estudos conserva os documentos e rascunhos; um vídeo em PiP continua disponível.

1. Em **Perfil**, digite o nome e clique **Salvar perfil**. **Adicionar/Trocar foto** abre seleção de arquivo; use PNG ou JPEG até 5 MB, 4 milhões de pixels e 4096 px por lado. O app recorta o centro e prepara foto quadrada de 256×256. **Remover foto** conserva o nome. Nome e foto ficam neste PC.
2. Em **Aparência**, escolha **Editorial**, **Oliva**, **Grafite** ou **Azul noite**. Editorial usa fundo quase preto, grid, bordas finas, títulos serifados e interface compacta; é o padrão de novos perfis. Oliva conserva o design anterior. Perfis existentes mantêm a escolha salva: selecione Editorial para adotar o novo visual. O tema aplica e salva imediatamente, incluindo editores. Desative **Animações da interface** para parar transições/câmera/decoração; a preferência de movimento reduzido do Windows também é respeitada. Foco, timing dos desafios e reprodução dos vídeos continuam funcionando.
3. Em **Dados e app**, consulte matérias/notas/PDFs/vídeos/projetos/rascunhos, versão/runtime e tamanho do banco. **Atualizar dados** renova a consulta. Use **Abrir pasta de dados/notas** para encontrar os diretórios registrados e os atalhos para gerenciar notas/projetos. O caminho da tela é o efetivo, inclusive em perfil de teste.

As escolhas são retomadas ao reabrir. Esta área também cria backups e restaura uma cópia separada, conforme a seção 10.

### Exportar uma pasta em PDF

1. Salve as notas/arquivos que quer incluir; rascunhos ainda não salvos ficam fora da exportação.
2. Abra **Ajustes → Dados e app** e encontre **Sua pasta, em um caderno PDF**.
3. Escolha **Pasta de notas** ou um projeto já aberto no **Explorer**. Em **Pasta**, escolha a origem inteira ou uma subpasta; as subpastas dela também entram.
4. Clique **Exportar pasta em PDF**. Pode escolher uma nota individual em **Conteúdo**, informar **Título da capa**, marcar **Incluir imagens locais PNG/JPEG** e usar **Escolher pasta de destino**. Ao terminar, a tela mostra o caminho efetivo. Sem escolha, o destino é Downloads; cada exportação usa um nome novo.

O caderno A4 tem fundo preto inclusive nas margens, texto claro, capa, sumário clicável e páginas numeradas. Inclui apenas arquivos **.md**, em ordem de caminho/número; cada nota começa em uma nova página. Títulos, listas, citações, tabelas e código são formatados. O bloco inicial de frontmatter fica oculto no PDF; os arquivos originais conservam todos os bytes. Imagens opcionais PNG/JPEG locais contidas na origem podem ser incluídas; imagens remotas/omitidas ficam como indicação textual, links externos como texto e fórmulas/wikilinks como fonte Markdown, sem buscar recursos na rede. Arquivos de código, PDFs anexados e pastas auxiliares/ocultas não são reunidos nesse caderno.

Se a pasta não tem Markdown ou excede os limites, a tela explica o problema. Escolha uma subpasta menor: até **200 notas**, **2 MiB por nota**, **6 MiB de texto total**, **4.000 entradas** e **16 níveis**. Uma geração por vez; notas inválidas ou alteradas durante a leitura interrompem a operação. O PDF é uma cópia para leitura, e o backup completo segue abaixo. [Provas da exportação](validation/PDF_EXPORT.md).

## 8. Dados, backup e perfil de teste

| Dado | Onde fica |
| --- | --- |
| Notas Markdown | Vault que você escolheu |
| PDFs | Arquivos locais selecionados; app conserva referências |
| Projetos | Pastas escolhidas; arquivos são editados no local original |
| Cadernos PDF exportados | Downloads ou pasta escolhida; caminho mostrado após exportar |
| Mesa, tarefas, foco, rascunhos/abas de projetos e jogo | Perfil local em %APPDATA%\app-estudos |

Para uma cópia manual completa, **feche o app** e copie o vault, os PDFs necessários, suas pastas de projetos e a pasta de perfil inteira. Copiar apenas as notas conserva os arquivos Markdown; copiar o perfil também conserva jogo, mesas e rascunhos. Os arquivos do app não são criptografados pelo próprio aplicativo. Guarde dados pessoais fora do repositório.

Para experimentar com dados separados, na raiz do projeto:

```powershell
$guideProfile = Join-Path (Get-Location).Path '.local\perfil-guia'
& '.\release\win-unpacked\App Estudos.exe' "--user-data-dir=$guideProfile"
```

Esse perfil tem carteira/mesa próprias. Escolha também um vault de teste para as notas. Ao abrir o executável normalmente, você usa o perfil padrão. Antes de mudar para uma versão anterior do app, conserve backup: esta build usa SQLite v5 desde NXT-01; MED-01 usava v4; GAM-02 usava v3 e GAM-01 usava v2; a antiga MVP usava v1. Uma build antiga não abre schema novo; não apague o banco para contornar isso.

## 9. Diagnóstico rápido

| Situação | Próximo passo |
| --- | --- |
| npm.ps1 bloqueado | Use npm.cmd, como nos exemplos |
| Versão Node diferente de 24 | Use o runtime portátil deste PC ou prepare Node 24 conforme setup |
| Dependências ausentes | Execute npm.cmd ci na raiz com Node 24 |
| Executável não existe | Execute npm.cmd run package:win e espere concluir |
| Outra app usa porta 5173 | Encerre a instância anterior do desenvolvimento e inicie novamente |
| PDF foi movido | Use o controle de localizar/substituir material para vincular o arquivo atual |
| Nota mostra conflito/rascunho | Leia as versões, preserve seu texto e confirme o salvamento desejado |
| Arquivo bloqueado no Explorer | Confira UTF-8, tamanho até1MiB e se é arquivo regular dentro da pasta, sem link/.git |
| Nenhum Lampejo aparece | Ele só conta tempo com a Cidade na tela e nunca aparece durante o Foco; pause o Foco se quiser jogar |
| Compra/colheita indisponível | Confira moedas, canteiro pronto e se a melhoria já foi comprada |

Se um comando falhar, registre a mensagem e a etapa. Preserve seu perfil/vault para diagnóstico. As provas desta entrega estão em [GAME](validation/GAME.md), [frontend](validation/FRONTEND.md) e [estado do projeto](status/ALPHA_STATE.md).

A barra fixa troca áreas com transições curtas e conserva seus editores/contexto. As moedas animam até o saldo confirmado, e o ganho aparece junto do motor. Para reduzir movimento, desligue **Animações da interface** em **Ajustes → Aparência** ou desative **Efeitos de animação** em **Configurações → Acessibilidade → Efeitos visuais** do Windows 11, conforme o [Suporte Microsoft](https://support.microsoft.com/pt-br/accessibility/windows/make-it-easier-to-focus-on-tasks). O app remove animações decorativas, inclusive quando a preferência muda durante uma transição. Salvar não espera a animação terminar.

Refinamento atual: [SMOOTH_UI](validation/SMOOTH_UI.md). Novos fluxos/provas: [ENGINE_EXPLORER](validation/ENGINE_EXPLORER.md); revisão dos documentos: [PRODUCT_DOCS](validation/PRODUCT_DOCS.md).

## 10. Estudo conectado e cópias de segurança

**Ctrl+K** ou a lupa da barra abre a busca global por títulos de notas, matérias, projetos, vídeos e ações. Use setas/Enter ou clique. Abrir uma fonte conserva rascunhos; a busca não lê o conteúdo completo dos arquivos. **Início** reúne tarefas abertas do checklist, revisões vencidas, minutos de foco registrados no dia e **Retomar mesa**. Pausas ficam fora do tempo; não há integração com agenda externa.

**Revisão** permite criar flashcards manuais. Na nota, o botão **Criar flashcard do trecho** usa a seleção do editor, ou o início do texto quando não há seleção. Revise pergunta/resposta e salve. **Revelar resposta** libera as avaliações: **Esqueci** agenda em 10 minutos, **Difícil** mantém intervalo curto, **Lembrei** amplia, **Fácil** amplia mais, até 365 dias. O cartão guarda nota/trecho de origem e **Abrir nota** retorna ao caderno. Os filtros de vencidos/biblioteca e matéria ajudam a organizar. A avaliação é sua; XP e moedas continuam sendo apenas progresso do jogo.

No PDF, clique **Marcar área**, arraste sobre a página e salve comentário/cor. Pode vincular a marca à nota aberta. A lista abaixo das páginas permite ir ao trecho, abrir a nota e excluir. São áreas destacadas, sem alterar o PDF ou selecionar seu texto. Se o arquivo mudar, recarregue/localize o material; marcas de outra versão ficam conservadas e separadas para evitar trechos incorretos.

Em **Material → Vídeos**, **Momentos da aula** guarda uma anotação com o tempo informado por você, como 12:30 ou 1:02:10 (até 24 horas). Clique no momento para abrir o vídeo naquele ponto. A ação reinicia o player para saltar; depois cinema/PiP/mesa continuam disponíveis. O app não captura automaticamente a posição da reprodução.

**Grafo** mostra notas da matéria e relações salvas. Escolha origem/destino e o nome da relação, depois **Conectar notas**; repetir a mesma dupla atualiza o nome. Selecione um nó ou use a lista para ver a prévia e **Abrir no caderno**. Arraste/role para explorar; até 200 notas ficam no cenário e a lista acessa todas. HTML/imagens remotas permanecem inertes. Movimento reduzido e animações desligadas também valem para a câmera.

Fonte, bancos e estufa são decorações; desde GAM-06 surgem sozinhas em marcos do total produzido. **Dourado**, **Amanhecer** e **Noite** (em **Perfil**) mudam o ambiente e ficam salvos.

Em **Ajustes → Dados e app → Cópias de segurança**, clique **Conferir prévia do backup**, confira arquivos/omissões e **Criar backup agora**. A cópia inclui banco de estudo, preferências, rascunhos/recuperações, vault, arquivos dos projetos e PDFs disponíveis; vai para **Documentos/NodusBackups**. Salve as edições que quer como arquivos; rascunhos já preservados também entram no banco. Git, dependências, ocultos, links, saídas de snapshots, cache do navegador e credenciais conhecidas por nome/extensão ficam fora. Tokens escritos nas suas notas continuam sendo conteúdo privado da cópia. Proteja essa pasta: não há criptografia própria. Limites: 300 MiB, 5.000 arquivos, 16 níveis, 100 MiB por arquivo e 64 MiB de banco. Projetos/PDFs ausentes e notas excluídas são comunicados na prévia/recibo.

Para restaurar, use a cópia recém-criada ou **Selecionar backup para restaurar** e escolha a pasta que contém snapshot.json. Confira a prévia e clique **Restaurar em uma cópia**. Hashes, caminhos e estrutura do banco são conferidos antes de abrir; fontes atuais permanecem no lugar. A cópia fica em **Documentos/NodusRestored**, com outro perfil/vault/projetos/PDFs. **Abrir cópia restaurada** reinicia o app após preservar os rascunhos atuais. Para voltar ao perfil original, feche e abra normalmente pelo seu atalho. PDFs/projetos ausentes continuam ausentes na cópia, sem acessar o caminho original. Não é restauração na nuvem nem merge de perfis. [Validação e limites](validation/STUDY_EXPANSION.md).

## 11. Janela, fundo e cidade progressiva

A faixa superior do Nodus tem **Minimizar**, **Maximizar/Restaurar** e **Fechar**. Arraste pela região do nome para mover a janela. Fechar conserva rascunhos e pausa o foco pelo fluxo normal. Cinema e vídeo flutuante deixam a faixa disponível.

Em **Ajustes → Aparência**, **Fundo animado** (desde UI-08, para todos os temas) liga ou desliga o movimento lento da grade e da luz atrás das áreas sem leitura; desligado, o fundo continua visível como um quadro parado. **Intensidade do fundo** escolhe Sutil, Padrão ou Vivo, sempre com texto legível. Movimento reduzido do Windows, animações gerais desligadas e janela minimizada também param o fundo. [Provas](validation/UI_08_BACKDROP.md).

Em **Cidade → Vila**, use **Cenário** para escolher **Vale Sereno**, **Cyberpunk** ou **New York**. A escolha é gratuita e salva. Construções/iluminação/materiais/atmosfera mudam; locais, cultivos, controles e progresso permanecem. Os três ambientes Dourado/Amanhecer/Noite continuam disponíveis em cada skin.

Produção, conquistas, prestígio e a Oficina descritos aqui pertencem às regras de GAM-03 e foram substituídos em GAM-06: veja a seção 5.

[Regras e análise de Cookie Clicker](decisions/city-progression.md), [ticket concluído](tasks/done/GAM-03.md), [provas do pacote e limites](validation/CITY_PROGRESSION.md). Pacote local atualizado, sem commit/push/publicação.

## 12. Grafo fluido e áreas isoladas

Grafo abre o cenário inteiro, com lista/relações recolhidas. Arraste para explorar, use roda/+ / − para zoom e selecione um nó para focar e abrir seus detalhes. **Notas e relações** abre a lista, origem/destino e conexões; o × recolhe. A câmera preserva sua posição ao conectar notas. Setas e +/− com foco no canvas também navegam. Cena até 200 nós; lista permite todas as notas. Em Ajustes → Aparência, desligar animações, ou usar movimento reduzido do Windows, aplica pan/zoom imediato e grafo estático.

Desde GAM-07, o menu da Cidade tem três grupos: CIDADE (Observatório), MINIGAMES (Mira, Memória, Horta, Conselho) e PROGRESSO (Conquistas, Legado, Perfil). Os rótulos da cena levam à aba correspondente. Movimento reduzido mantém números e estados, sem números flutuantes nem animações decorativas.

[Decisão de áreas](adr/0014-areas-isoladas.md), [provas e limites](validation/CLEAN_WORKSPACE.md). Alterações locais sem commit/push/publicação.

## 13. Produção conectada ao estudo (histórico)

Desde GAM-06, o estudo **não** gera Produção nem centelhas: Foco e revisões dão XP e conquistas de estudo. O que esta seção descrevia (regras de GAM-04) está no histórico do Git e em [DEEP_PRODUCTION](validation/DEEP_PRODUCTION.md); as regras atuais estão na seção 5 e em [economia](architecture/economy.md).


## Criar atividades em qualquer IA

Na matéria, Prática → Criar questionário/Criar flashcards. Selecione fontes e dificuldade, prepare e copie o prompt. Cole na IA escolhida, importe o JSON por texto/arquivo e use Importar e começar. Erro oferece relatório e pedido de correção para a mesma conversa. Revisão → Atividades retoma pedidos/tentativas salvos. [Passo a passo e limites](features/atividades-ia-externa.md).


## 14. Projetos e postos da Vila (histórico)

Depósito, postos, coleta e mercado (GAM-05) foram consolidados em GAM-06: as construções surgem sozinhas em marcos do total produzido, e materiais e estoques antigos viraram centelhas na conversão. Registro histórico em [FARM_PROJECTS](validation/FARM_PROJECTS.md); regras atuais na seção 5.


## 15. Próxima ação, conteúdo e animações 3D

**Início** destaca seu próximo passo: criar a primeira matéria, revisar cartões pendentes, continuar uma tarefa ou retomar a mesa. **Continuar esta tarefa** abre a matéria e seu checklist. **Escrever agora** abre uma nota diretamente; no primeiro uso, conduz à preparação da pasta e à criação da matéria.

Use **Adicionar conteúdo** no Início ou no menu lateral. Confira a matéria indicada e escolha **Escrever uma nota**, **Trazer um PDF**, **Guardar uma aula** ou **Importar notas**. PDF usa o seletor de arquivos; aula usa o diálogo de link YouTube; importação aceita Markdown e conserva os arquivos originais. Sem matéria, comece pela escrita/primeira matéria. Os rascunhos e a retomada seguem os fluxos existentes.

**Minhas notas** mostra seu acervo e identifica a nota aberta. A descrição sob a área selecionada no menu explica seu uso. Botões de tarefa e matéria permitem voltar ao estudo com seu contexto. Nomes dos locais ficam visíveis na Cidade ampla; em espaços menores, também aparecem ao focar ou passar o ponteiro.

O livro do Início/primeiro uso responde ao ponteiro e mostra páginas e ideias conectadas. A Cidade tem água, nuvens/luzes, contorno da próxima construção e partículas quando um clique no núcleo é confirmado. As três skins conservam as mesmas regras.

Em **Ajustes → Aparência**, desligar animações mantém as cenas estáticas; a preferência reduzida do sistema também é respeitada. Minimizar ou mudar para outra área pausa a animação. Se o cenário 3D falhar, os objetivos e ferramentas continuam disponíveis. O relógio visual não concede recursos.

[Relatório com fotos e clipes](reports/BOM_DIA_2026-10-09.md), [galeria com vídeos](reports/BOM_DIA_2026-10-09.html), [provas e limites](validation/VISUAL_EXPERIENCE.md).

## 16. Home e tema Branco

Abra **Início** no menu lateral. A Home apresenta seu próximo passo, tarefas, matérias e quatro atalhos: **Caderno**, **Materiais**, **Revisão** e **Cidade**. Perfis novos começam nessa tela; seu perfil atual conserva a última aba e composição usadas.

Os componentes entram em sequência e os cartões respondem ao ponteiro e ao foco. O fundo tem luz suave animada por WebGL, com posição e câmera fixas: ele permanece no lugar ao rolar o conteúdo. **Ajustes → Aparência → Animações da interface** permite deixar tudo estático; movimento reduzido do sistema também é respeitado. Minimizar ou sair do Início pausa o fundo.

Para a aparência clara, escolha **Ajustes → Aparência → Branco**. O tema cobre menus, caderno, materiais, revisão, conexões, projetos, cidade e diálogos, com realce de código próprio. Imagens, PDFs e o cenário 3D conservam suas cores. A escolha continua após reiniciar, e trocar o tema preserva seus rascunhos.

[Capturas, clipe e validação](validation/HOME_WHITE.md), [decisão](adr/0021-home-e-tema-branco.md).
