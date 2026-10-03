# Nodus — como iniciar e usar

Guia da versão local Windows, atualizado em 03/10/2026. O executável ainda se chama **App Estudos**. A branch **codex/youtube-cinema** reúne mesa, Vale Sereno, motor, desafios, Explorer e YouTube com cinema/PiP.

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
git clone --branch codex/youtube-cinema https://github.com/rafafrd/Nodus.git
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

## 7. Dados, backup e perfil de teste

| Dado | Onde fica |
| --- | --- |
| Notas Markdown | Vault que você escolheu |
| PDFs | Arquivos locais selecionados; app conserva referências |
| Projetos | Pastas escolhidas; arquivos são editados no local original |
| Mesa, tarefas, foco, rascunhos/abas de projetos e jogo | Perfil local em %APPDATA%\app-estudos |

Para backup, **feche o app** e copie o vault, os PDFs necessários, suas pastas de projetos e a pasta de perfil inteira. Copiar apenas as notas conserva os arquivos Markdown; copiar o perfil também conserva jogo, mesas e rascunhos. Os arquivos do app não são criptografados pelo próprio aplicativo. Guarde dados pessoais fora do repositório.

Para experimentar com dados separados, na raiz do projeto:

```powershell
$guideProfile = Join-Path (Get-Location).Path '.local\perfil-guia'
& '.\release\win-unpacked\App Estudos.exe' "--user-data-dir=$guideProfile"
```

Esse perfil tem carteira/mesa próprias. Escolha também um vault de teste para as notas. Ao abrir o executável normalmente, você usa o perfil padrão. Antes de mudar para uma versão anterior do app, conserve backup: esta build usa SQLite v3, GAM-01 usava v2 e a antiga MVP usava v1. Uma build antiga não abre schema novo; não apague o banco para contornar isso.

## 8. Diagnóstico rápido

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

A barra fixa troca áreas com transições curtas e conserva seus editores/contexto. As moedas animam até o saldo confirmado, e o ganho aparece junto do motor. Para reduzir movimento, desative **Efeitos de animação** em **Configurações → Acessibilidade → Efeitos visuais** do Windows 11, conforme o [Suporte Microsoft](https://support.microsoft.com/pt-br/accessibility/windows/make-it-easier-to-focus-on-tasks). O app remove animações decorativas, inclusive quando a preferência muda durante uma transição. Salvar não espera a animação terminar.

Refinamento atual: [SMOOTH_UI](validation/SMOOTH_UI.md). Novos fluxos/provas: [ENGINE_EXPLORER](validation/ENGINE_EXPLORER.md); revisão dos documentos: [PRODUCT_DOCS](validation/PRODUCT_DOCS.md).
