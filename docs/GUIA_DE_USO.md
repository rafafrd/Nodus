# Nodus — como iniciar e usar

Guia da versão local Windows, atualizado em 04/10/2026. O executável ainda se chama **App Estudos**. A branch **codex/study-expansion** reúne mesa, Vale Sereno, motor, desafios, Explorer, YouTube/cinema/PiP, configurações exportação escura, busca, Hoje, revisão, grafo e cópias de segurança.

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
git clone --branch codex/pdf-export https://github.com/rafafrd/Nodus.git
Set-Location -LiteralPath '.\Nodus'
node --version
npm.cmd ci
npm.cmd run dev
```

Confira que node --version começa com v24. A pasta portátil .local não acompanha o Git; o PC novo usa seu próprio Node 24. npm ci usa o lockfile e precisa baixar dependências. Se já tem o repositório/dependências preparados, basta entrar na pasta e executar npm.cmd run dev. Use npm.cmd quando o PowerShell bloquear npm.ps1.

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

## 4. Preparar sua mesa de estudos

1. Clique em **+** ao lado de **Suas matérias** e crie uma matéria.
2. Clique em **Escolher pasta de notas**. Escolha um vault dedicado fora da pasta do repositório, por exemplo uma pasta NodusVault em Documentos. Nessa pasta ficam os arquivos Markdown.
3. Crie uma **Nova nota**, informe o título e escreva em **Editar**. A toolbar ajuda com negrito, listas, código e tabela. **Leitura** abre a prévia.
4. Clique em **Salvar** ou pressione **Ctrl+S**. Confira **Salvo no arquivo**. Um rascunho recuperado ainda precisa ser salvo para virar a versão do arquivo.
5. Clique em **Abrir PDF**, escolha um PDF local e navegue pelas páginas. O separador altera a divisão caderno/material. Ajuste à largura ou à página inteira pelos controles do leitor.
6. Abra **Foco**, escolha os minutos e inicie. Você pode pausar, retomar e encerrar. Em **Checklist**, crie tarefa/etapas, marque conclusão e selecione a próxima etapa com a ação de retomada.
7. Troque de matéria: cada mesa conserva nota, PDF, página, divisão e próxima etapa. Reabrir restaura esse contexto.

**Importar Markdown** vincula um .md que já esteja no vault escolhido. A edição assistida preserva a fonte Markdown; HTML executável/imagens remotas não entram na prévia. Se houver edição externa concorrente, o app apresenta as versões para você escolher/revisar. Confira a versão desejada antes de salvar.

| Atalho | Ação |
| --- | --- |
| Ctrl+S | Salvar a nota |
| Alt+1 | Foco |
| Alt+2 | Checklist |
| Alt+3 | Grade com foco e checklist |
| Esc | Voltar do modo Só caderno à mesa |

O botão **Módulos** abre a grade com caderno, PDF e ferramentas. **Só caderno** amplia a nota.

## 4.1. Guardar vídeos do YouTube

1. Na matéria desejada, abra **Material → Vídeos → + Link**.
2. Cole o link do YouTube e, se quiser, dê um título para encontrar a aula depois. Links watch, youtu.be, Shorts, live e embed são reconhecidos. O tempo inicial do link é conservado; links repetidos na mesma matéria conservam a entrada e o tempo original.
3. Clique em **Salvar link**. Ele fica nesta matéria, sem conectar ao YouTube. Não precisa escolher vault para salvar vídeos.
4. Clique em **Abrir player** ou no vídeo da lista; depois use **Play** do YouTube. Esta etapa precisa de internet. Volume, legendas, velocidade e progresso usam os controles oficiais.
5. No cabeçalho do player, **Modo cinema** amplia o vídeo e escurece a mesa. **Esc** ou **Sair do cinema** volta; também funciona com o player focado.
6. **Vídeo em PiP** cria o player flutuante dentro do app. Arraste pelo título; com o título focado, use setas, Shift+setas para passos maiores, ou Home para o canto inferior direito. Ele permanece no Explorer e fica contido ao redimensionar a janela.
7. **Voltar vídeo à mesa** retorna à matéria de origem. Trocar área/PDF/matéria, expandir caderno ou rolar o vídeo para fora do painel passa para PiP. A reprodução continua no mesmo player entre modos.
8. **Fechar player** para a reprodução e conserva o link. O **×** da lista remove o link salvo. Reabrir o app restaura lista/seleção; abrir o player novamente é uma ação sua.

PDF e vídeo têm seleções separadas: voltar a **PDFs** conserva o documento/página. Notas/rascunhos continuam pelo fluxo normal de salvar/retomar. Cinema suspende interação e atalhos de áreas cobertas; ver o vídeo não muda recompensas do jogo.

Vídeos privados, indisponíveis, restritos por idade/região ou sem incorporação podem ser recusados pelo YouTube. O app não baixa o vídeo nem contorna essa restrição. Uma falha de conexão/processo mostra **Tentar novamente**; erros específicos do vídeo aparecem no player oficial. PiP fica dentro desta janela, não por cima de outros programas. Movimento reduzido acompanha a configuração já descrita no guia.

## 5. Jogar em Vale Sereno

Clique em **Cidade** na barra fixa à esquerda. O jogo também funciona antes de criar matérias/vault. Ao entrar, o app preserva seu rascunho e pausa o foco ativo. Use **Voltar à mesa** para continuar os estudos; retome o foco quando quiser voltar a contar tempo.

O perfil começa com **60 moedas, XP zero e quatro canteiros**. O progresso é local e compartilhado entre as matérias desse perfil.

### Um primeiro ciclo

1. A cidade abre no **Motor da vila**. Clique em **Acionar motor**: começa em uma moeda por pulso, com intervalo de 0,3 s. O primeiro upgrade custa **25 moedas** e aumenta a produção para **3 por pulso**. Upgrades seguintes crescem de preço, até o nível 10. A cada 10 pulsos, recebe 1 XP.
2. Junte moedas para melhorar o motor ou comprar instalações no mercado. Esse é o caminho principal de farm ativo.
3. Na **Fazenda**, escolha Trigo e plante. Cada semente custa duas moedas; o cultivo amadurece em 45 segundos. Cenoura custa cinco e leva 90 segundos.
4. Enquanto cresce, visite **Mina** ou **Bosque** pelos rótulos na cidade. Coletar rende recursos, moedas e XP; há intervalo de 1,5 segundo entre coletas.
5. Volte à fazenda e clique em **Colher** quando o canteiro estiver pronto. Trigo rende oito moedas, cinco XP e uma unidade de trigo; cenoura rende 18 moedas, dez XP e uma unidade.
6. Em **Mercado**, venda o inventário para ganhar mais moedas. Role o painel lateral para ver todas as opções.
7. Compre melhorias. Elas ficam persistidas; a casa, o moinho e as lanternas aparecem no cenário. Terra fértil abre dois canteiros extras e a picareta dobra a pedra das coletas.

| Melhoria | Preço | Uso |
| --- | --- | --- |
| Moinho | 75 | Quatro moedas/minuto, inclusive com app fechado; até sete dias por visita |
| Terra fértil | 60 | Seis canteiros ao todo |
| Picareta de ferro | 85 | Duas pedras por coleta |
| Casa do viajante | 120 | Sua casa junto à praça |
| Luzes da vila | 50 | Lanternas nas ruas |

Arraste o cenário para explorar e use a roda do mouse ou **+ / −** para aproximar/afastar. O botão de mira centraliza a câmera. Selecionar um local aproxima a câmera suavemente; arrastar ou usar a roda interrompe o deslocamento. Os nomes aparecem ao selecionar, passar o mouse ou usar foco de teclado. Os rótulos dos locais também funcionam como botões.

### Oficina: QTE e skillcheck

Abra **Oficina** e escolha **Tranquilo** para começar. A tentativa é gratuita.

- **Sincronizar o motor:** pressione A/S/D/W conforme a tecla grande ou clique no botão da tecla. Acerte3 etapas antes de cada barra esvaziar; recebe24moedas/12XP. Uma tecla errada ou tempo esgotado encerra sem descontar moedas.
- **Calibrar a válvula:** espere o marcador entrar na faixa dourada e pressione **Espaço** ou **Calibrar válvula**. São3 calibrações; cada acerto aumenta a recompensa, até36moedas/15XP. O marcador vai e volta; pode esperar outra passagem.

Tranquilo dá mais tempo/faixa maior; Normal exige mais precisão. **Encerrar tentativa** permite trocar desafio sem custo. Ao sair, a tentativa continua: QTE pode expirar; a válvula e a memória são retomáveis. Movimento reduzido suspende decoração da cidade, mas o marcador necessário ao timing continua visível.

### Memória e personagem

Em **Memória**, escolha 3, 6 ou 9 pares e comece. Encontre conceito/definição, conceito/exemplo e fórmula/situação. Não há limite de tempo. Uma rodada completa rende moedas/XP conforme dificuldade, tentativas e melhor combo. Você pode iniciar outra rodada para continuar progredindo. O primeiro baralho é demonstrativo, com fundamentos curados de matemática/programação.

Em **Personagem**, distribua os pontos de cada nível e clique em **Salvar build · grátis**. Foco melhora o moinho; Revisão melhora recompensas da memória; Planejamento acelera cultivos; Prática melhora moedas de coleta. A maior habilidade determina sua classe. Redistribuir é gratuito.

XP e moedas indicam progressão do jogo. O app não usa esses números como medida de domínio acadêmico. Regras e valores ainda são provisórios: [detalhes do balanceamento](decisions/game-rules.md).

## 6. Explorer: seus projetos e arquivos

1. Clique em **Explorer** na barra fixa à esquerda; ela também oferece **Estudos** e **Cidade** em todas as áreas.
2. Use **Abrir pasta** ou **+** e escolha uma pasta de projeto no diálogo do Windows. Os projetos ficam na lista lateral, separados do vault de notas e do Git do app.
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
2. Em **Aparência**, escolha **Oliva**, **Grafite** ou **Azul noite**. O tema aplica e salva imediatamente, incluindo editores. Desative **Animações da interface** para parar transições/câmera/decoração; a preferência de movimento reduzido do Windows também é respeitada. Foco, timing dos desafios e reprodução dos vídeos continuam funcionando.
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
| QTE terminou sem prêmio | Tente o ritmo Tranquilo; use a tecla indicada dentro do prazo |
| Compra/colheita indisponível | Confira moedas, canteiro pronto e se a melhoria já foi comprada |

Se um comando falhar, registre a mensagem e a etapa. Preserve seu perfil/vault para diagnóstico. As provas desta entrega estão em [GAME](validation/GAME.md), [frontend](validation/FRONTEND.md) e [estado do projeto](status/ALPHA_STATE.md).

A barra fixa troca áreas com transições curtas e conserva seus editores/contexto. As moedas animam até o saldo confirmado, e o ganho aparece junto do motor. Para reduzir movimento, desligue **Animações da interface** em **Ajustes → Aparência** ou desative **Efeitos de animação** em **Configurações → Acessibilidade → Efeitos visuais** do Windows 11, conforme o [Suporte Microsoft](https://support.microsoft.com/pt-br/accessibility/windows/make-it-easier-to-focus-on-tasks). O app remove animações decorativas, inclusive quando a preferência muda durante uma transição. Salvar não espera a animação terminar.

Refinamento atual: [SMOOTH_UI](validation/SMOOTH_UI.md). Novos fluxos/provas: [ENGINE_EXPLORER](validation/ENGINE_EXPLORER.md); revisão dos documentos: [PRODUCT_DOCS](validation/PRODUCT_DOCS.md).

## 10. Estudo conectado e cópias de segurança

**Ctrl+K** ou a lupa da barra abre a busca global por títulos de notas, matérias, projetos, vídeos e ações. Use setas/Enter ou clique. Abrir uma fonte conserva rascunhos; a busca não lê o conteúdo completo dos arquivos. **Hoje** reúne tarefas abertas do checklist, revisões vencidas, minutos de foco registrados no dia e **Retomar mesa**. Pausas ficam fora do tempo; não há integração com agenda externa.

**Revisão** permite criar flashcards manuais. Na nota, o botão **Criar flashcard do trecho** usa a seleção do editor, ou o início do texto quando não há seleção. Revise pergunta/resposta e salve. **Revelar resposta** libera as avaliações: **Esqueci** agenda em 10 minutos, **Difícil** mantém intervalo curto, **Lembrei** amplia, **Fácil** amplia mais, até 365 dias. O cartão guarda nota/trecho de origem e **Abrir nota** retorna ao caderno. Os filtros de vencidos/biblioteca e matéria ajudam a organizar. A avaliação é sua; XP e moedas continuam sendo apenas progresso do jogo.

No PDF, clique **Marcar área**, arraste sobre a página e salve comentário/cor. Pode vincular a marca à nota aberta. A lista abaixo das páginas permite ir ao trecho, abrir a nota e excluir. São áreas destacadas, sem alterar o PDF ou selecionar seu texto. Se o arquivo mudar, recarregue/localize o material; marcas de outra versão ficam conservadas e separadas para evitar trechos incorretos.

Em **Material → Vídeos**, **Momentos da aula** guarda uma anotação com o tempo informado por você, como 12:30 ou 1:02:10 (até 24 horas). Clique no momento para abrir o vídeo naquele ponto. A ação reinicia o player para saltar; depois cinema/PiP/mesa continuam disponíveis. O app não captura automaticamente a posição da reprodução.

**Grafo** mostra notas da matéria e relações salvas. Escolha origem/destino e o nome da relação, depois **Conectar notas**; repetir a mesma dupla atualiza o nome. Selecione um nó ou use a lista para ver a prévia e **Abrir no caderno**. Arraste/role para explorar; até 200 notas ficam no cenário e a lista acessa todas. HTML/imagens remotas permanecem inertes. Movimento reduzido e animações desligadas também valem para a câmera.

Na cidade, **Mercado** oferece **Fonte do jardim** (45), **Bancos do jardim** (15) e **Estufa de vidro** (90). São decorações, sem renda adicional. **Dourado**, **Amanhecer** e **Noite** mudam o ambiente e ficam salvos. Motor, desafios e economia seguem as regras anteriores.

Em **Ajustes → Dados e app → Cópias de segurança**, clique **Conferir prévia do backup**, confira arquivos/omissões e **Criar backup agora**. A cópia inclui banco de estudo, preferências, rascunhos/recuperações, vault, arquivos dos projetos e PDFs disponíveis; vai para **Documentos/NodusBackups**. Salve as edições que quer como arquivos; rascunhos já preservados também entram no banco. Git, dependências, ocultos, links, saídas de snapshots, cache do navegador e credenciais conhecidas por nome/extensão ficam fora. Tokens escritos nas suas notas continuam sendo conteúdo privado da cópia. Proteja essa pasta: não há criptografia própria. Limites: 300 MiB, 5.000 arquivos, 16 níveis, 100 MiB por arquivo e 64 MiB de banco. Projetos/PDFs ausentes e notas excluídas são comunicados na prévia/recibo.

Para restaurar, use a cópia recém-criada ou **Selecionar backup para restaurar** e escolha a pasta que contém snapshot.json. Confira a prévia e clique **Restaurar em uma cópia**. Hashes, caminhos e estrutura do banco são conferidos antes de abrir; fontes atuais permanecem no lugar. A cópia fica em **Documentos/NodusRestored**, com outro perfil/vault/projetos/PDFs. **Abrir cópia restaurada** reinicia o app após preservar os rascunhos atuais. Para voltar ao perfil original, feche e abra normalmente pelo seu atalho. PDFs/projetos ausentes continuam ausentes na cópia, sem acessar o caminho original. Não é restauração na nuvem nem merge de perfis. [Validação e limites](validation/STUDY_EXPANSION.md).
