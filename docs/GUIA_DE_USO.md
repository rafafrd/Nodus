# Nodus — como iniciar e usar

Guia da versão local Windows, atualizado em 03/10/2026. O executável ainda se chama **App Estudos**. A branch **feat/game** reúne a mesa de estudos e o primeiro jogo, Vale Sereno.

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
git clone --branch feat/game https://github.com/rafafrd/Nodus.git
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

## 5. Jogar em Vale Sereno

Clique em **Seu mundo** na barra lateral. O jogo também funciona antes de criar matérias/vault. Ao entrar, o app preserva seu rascunho e pausa o foco ativo. Use **Voltar à mesa** para continuar os estudos; retome o foco quando quiser voltar a contar tempo.

O perfil começa com **60 moedas, XP zero e quatro canteiros**. O progresso é local e compartilhado entre as matérias desse perfil.

### Um primeiro ciclo

1. Na **Fazenda**, escolha Trigo e plante. Cada semente custa duas moedas; o cultivo amadurece em 45 segundos. Cenoura custa cinco e leva 90 segundos.
2. Enquanto cresce, visite **Mina** ou **Bosque** pelos rótulos na cidade. Coletar rende recursos, moedas e XP; há intervalo de 1,5 segundo entre coletas.
3. Volte à fazenda e clique em **Colher** quando o canteiro estiver pronto. Trigo rende oito moedas, cinco XP e uma unidade de trigo; cenoura rende 18 moedas, dez XP e uma unidade.
4. Em **Mercado**, venda o inventário para ganhar mais moedas. Role o painel lateral para ver todas as opções.
5. Compre melhorias. Elas ficam persistidas; a casa, o moinho e as lanternas aparecem no cenário. Terra fértil abre dois canteiros extras e a picareta dobra a pedra das coletas.

| Melhoria | Preço | Uso |
| --- | --- | --- |
| Moinho | 75 | Quatro moedas/minuto, inclusive com app fechado; até sete dias por visita |
| Terra fértil | 60 | Seis canteiros ao todo |
| Picareta de ferro | 85 | Duas pedras por coleta |
| Casa do viajante | 120 | Sua casa junto à praça |
| Luzes da vila | 50 | Lanternas nas ruas |

Arraste o cenário para explorar e use a roda do mouse ou **+ / −** para aproximar/afastar. **⌖** centraliza a câmera. Os rótulos dos locais também funcionam como botões.

### Memória e personagem

Em **Memória**, escolha 3, 6 ou 9 pares e comece. Encontre conceito/definição, conceito/exemplo e fórmula/situação. Não há limite de tempo. Uma rodada completa rende moedas/XP conforme dificuldade, tentativas e melhor combo. Você pode iniciar outra rodada para continuar progredindo. O primeiro baralho é demonstrativo, com fundamentos curados de matemática/programação.

Em **Personagem**, distribua os pontos de cada nível e clique em **Salvar build · grátis**. Foco melhora o moinho; Revisão melhora recompensas da memória; Planejamento acelera cultivos; Prática melhora moedas de coleta. A maior habilidade determina sua classe. Redistribuir é gratuito.

XP e moedas indicam progressão do jogo. O app não usa esses números como medida de domínio acadêmico. Regras e valores ainda são provisórios: [detalhes do balanceamento](decisions/game-rules.md).

## 6. Dados, backup e perfil de teste

| Dado | Onde fica |
| --- | --- |
| Notas Markdown | Vault que você escolheu |
| PDFs | Arquivos locais selecionados; app conserva referências |
| Mesa, tarefas, foco, rascunhos e jogo | Perfil local em %APPDATA%\app-estudos |

Para backup, **feche o app** e copie o vault, os PDFs necessários e a pasta de perfil inteira. Copiar apenas as notas conserva os arquivos Markdown; copiar o perfil também conserva jogo, mesas e rascunhos. Os arquivos do app não são criptografados pelo próprio aplicativo. Guarde dados pessoais fora do repositório.

Para experimentar com dados separados, na raiz do projeto:

```powershell
$guideProfile = Join-Path (Get-Location).Path '.local\perfil-guia'
& '.\release\win-unpacked\App Estudos.exe' "--user-data-dir=$guideProfile"
```

Esse perfil tem carteira/mesa próprias. Escolha também um vault de teste para as notas. Ao abrir o executável normalmente, você usa o perfil padrão. Antes de mudar para uma versão anterior do app, conserve backup: a build do jogo usa SQLite v2 e a antiga build MVP usava v1.

## 7. Diagnóstico rápido

| Situação | Próximo passo |
| --- | --- |
| npm.ps1 bloqueado | Use npm.cmd, como nos exemplos |
| Versão Node diferente de 24 | Use o runtime portátil deste PC ou prepare Node 24 conforme setup |
| Dependências ausentes | Execute npm.cmd ci na raiz com Node 24 |
| Executável não existe | Execute npm.cmd run package:win e espere concluir |
| Outra app usa porta 5173 | Encerre a instância anterior do desenvolvimento e inicie novamente |
| PDF foi movido | Use o controle de localizar/substituir material para vincular o arquivo atual |
| Nota mostra conflito/rascunho | Leia as versões, preserve seu texto e confirme o salvamento desejado |
| Compra/colheita indisponível | Confira moedas, canteiro pronto e se a melhoria já foi comprada |

Se um comando falhar, registre a mensagem e a etapa. Preserve seu perfil/vault para diagnóstico. As provas desta entrega estão em [GAME](validation/GAME.md), [frontend](validation/FRONTEND.md) e [estado do projeto](status/ALPHA_STATE.md).
