<div align="center">

<h1>Nodus</h1>
<p><strong>Um espaço para estudar, conectar ideias e construir sua rotina.</strong></p>
<p>Notas, PDFs, aulas, revisão e uma cidade que cresce com seu estudo.<br>Uma mesa local, organizada do seu jeito, no Windows.</p>

<p>
  <a href="docs/validation/ALPHA.md"><img src="https://img.shields.io/badge/est%C3%A1gio-MVP_local-74716a?style=for-the-badge" alt="Estágio: MVP local"></a>
  <a href="docs/validation/HOME_WHITE.md"><img src="https://img.shields.io/badge/Windows-validado-536255?style=for-the-badge" alt="Execução nativa validada no Windows"></a>
  <a href="docs/architecture/data-model.md"><img src="https://img.shields.io/badge/dados-locais-536255?style=for-the-badge" alt="Dados locais"></a>
</p>
<p>
  <img src="https://img.shields.io/badge/Electron-44.5.1-47848f?style=flat-square&logo=electron&logoColor=white" alt="Electron 44.5.1">
  <img src="https://img.shields.io/badge/React-19.3-497f8b?style=flat-square&logo=react&logoColor=white" alt="React 19.3">
  <img src="https://img.shields.io/badge/TypeScript-5.9.3-46688c?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5.9.3">
  <img src="https://img.shields.io/badge/Node.js-24-536255?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js 24">
  <img src="https://img.shields.io/badge/SQLite-local-74716a?style=flat-square&logo=sqlite&logoColor=white" alt="Persistência SQLite local">
</p>

<p>
  <a href="#funcionalidades">Funcionalidades</a> ·
  <a href="#galeria">Galeria</a> ·
  <a href="#ia-externa">IA externa</a> ·
  <a href="#começar-no-windows">Começar</a> ·
  <a href="#arquitetura">Arquitetura</a> ·
  <a href="docs/GUIA_DE_USO.md">Guia de uso</a>
</p>

<a href="docs/validation/evidence/home-white/home-branca.png">
  <img src="docs/validation/evidence/home-white/home-branca.png" width="100%" alt="Home do Nodus no tema Branco: próximo passo de estudo, livro 3D e atalhos para Caderno, Materiais, Revisão e Cidade">
</a>
<p><sub>Seu ponto de partida: próximo passo, escrita rápida e atalhos. Tema Branco, livro 3D e fundo com posição fixa. Captura real no Windows com conteúdo de demonstração.</sub></p>

</div>

---

## Funcionalidades

O Nodus reúne o material da matéria e o contexto que você precisa para retomar. Comece pela Home, escreva uma ideia ou abra um material; acrescente painéis quando fizer sentido. Os recursos abaixo estão implementados e validados localmente. A [situação de integração](#estado-do-projeto) distingue a main desta entrega em revisão.

### Um início claro

**Início** mostra seu próximo passo: criar a primeira matéria, revisar cartões, continuar uma tarefa ou retomar o estudo. **Escrever agora** leva diretamente à nota; **Adicionar conteúdo** reúne escrita, Markdown, PDF e aula, com a matéria de destino visível. Perfis novos começam na Home; perfis anteriores conservam suas abas e composições.

Componentes entram em sequência e cartões respondem à interação. O livro usa Three.js, e o fundo WebGL anima luz com câmera e posição fixas: permanece no lugar enquanto o conteúdo rola. O controle geral de animações e movimento reduzido deixam a composição estática; minimizar ou sair da área pausa o fundo.

Escolha **Ajustes → Aparência → Branco** para a paleta clara. Editorial, Oliva, Grafite e Azul noite continuam disponíveis. Todos os cinco temas preservam documentos e rascunhos; Branco também adapta o grafo e o realce de código.

[Home, fotos e clipe real](docs/reports/HOME_BRANCO_2026-10-09.md) · [83 testes e prova Windows](docs/validation/HOME_WHITE.md).

### Uma mesa para estudar

| Área | O que você pode fazer |
| :--- | :--- |
| **Matérias e notas** | Escrever imediatamente, editar o título sugerido, usar modelos, importar Markdown e mover a nota entre matérias. CodeMirror conserva o arquivo canônico; conflitos externos mantêm as duas versões e rascunhos são recuperáveis. |
| **Captura de conteúdo** | Transformar uma seleção de PDF, comentário ou momento de aula em nota com origem conferível; criar cartão ou conexão a partir da seleção, sem reescrever o trecho. |
| **Abas e painéis** | Manter até **quatro módulos por aba**, arrastar subitens laterais para dividir a tela e ajustar os separadores. Clicar no menu deixa a aba atual somente com o módulo escolhido. |
| **PDF** | Ler arquivos locais, retomar a página, ajustar o documento à área e guardar marcações com comentários vinculados às notas. |
| **Aulas em vídeo** | Salvar links YouTube por matéria, anotar momentos e usar cinema ou PiP interno arrastável. O player oficial abre por ação do usuário e precisa de internet. |
| **Flashcards e revisão** | Criar cartões manualmente, revelar o verso e registrar autoavaliação. A revisão espaçada acompanha o próximo vencimento. |
| **Grafo de notas** | Explorar relações manuais entre notas reais, focar um conceito e abrir sua fonte; câmera com pan/zoom e movimento reduzido. |
| **Foco, checklist e Início** | Planejar etapas e próxima ação, escolher a duração do foco, pausar/retomar e consultar o resumo da rotina. Home animada com atalhos; foco e checklist ficam em ferramentas suspensas. |
| **Busca** | Usar `Ctrl+K` no catálogo e buscar no acervo de notas por título, corpo ou rascunho. |
| **Explorer** | Registrar pastas, organizar projetos principais/secundários e editar arquivos UTF-8 existentes em abas, com conflito e recuperação. |
| **Exportação e backup** | Exportar notas/pastas para PDF preto com capa e sumário. Criar snapshots locais e restaurar em uma cópia separada, preservando o perfil original. |

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>Branco ou Editorial</h3>
      <p>Papel claro, texto escuro e detalhes verdes no Branco; fundo quase preto, grid e títulos serifados no Editorial. Oliva, Grafite e Azul noite completam os cinco temas.</p>
    </td>
    <td width="50%" valign="top">
      <h3>Seu espaço, sua escolha</h3>
      <p>Recolha o menu inteiro, use uma janela ou componha a grade. Fundo Editorial animado e animações da interface podem ser desligados; o movimento reduzido do Windows é respeitado.</p>
    </td>
  </tr>
</table>

Com três painéis, a esquerda ocupa toda a altura e a direita fica dividida. Com quatro, a grade vira **2×2**. Abas preservam composição, foco e tamanhos; matéria, documento e player continuam compartilhados entre elas.

```mermaid
flowchart LR
  Menu["Subitens do menu lateral"] -->|Clique| Solo["Um módulo na aba atual"]
  Menu -->|Arraste ou +| Split["Acrescentar painel"]
  Split --> Two["2: duas colunas"]
  Two --> Three["3: esquerda inteira + direita dividida"]
  Three --> Four["4: grade 2 x 2"]
  Tabs["Abas independentes de layout"] --> Save["Composição e tamanhos salvos"]
  Solo --> Save
  Four --> Save
```

### Uma cidade que acompanha a rotina

O **Observatório** conecta minutos efetivos de Foco e revisões elegíveis à produção da cidade. XP e moedas pertencem ao jogo; não são uma medida de domínio acadêmico.

| Sistema | Experiência disponível |
| :--- | :--- |
| **Produção** | **16 famílias de instalações**, compras ×1/×10/×100/MAX, participação na taxa e conexões entre produtores. |
| **Melhorias e descobertas** | Catálogo de **305 melhorias** e **284 conquistas**, com requisitos, especializações, sinergias e marcos progressivos. |
| **Sinais e combinações** | Oportunidades guardadas durante o foco, efeitos temporários e combinação de tipos diferentes depois de estudar. |
| **Produção offline** | Até sete dias por padrão, com extensão pelo legado e resumo do retorno. |
| **Prestígio opcional** | Prévia do novo ciclo e bônus permanentes. Notas, materiais e histórico de estudo são preservados. Você pode continuar sem reiniciar. |
| **Projetos da farm** | Depósito e postos do bosque/mina com custos materiais, próximo objetivo e atalhos de coleta. Cada posto produz **1 material/minuto**, guarda até **200** e pausa quando cheio; recolher leva o estoque ao inventário. |
| **Motor e Oficina** | Apoio do motor proporcional à produção instalada, ganho/orçamento restante reais e alternativas ao esgotar. QTE e calibração com **36 etapas** e dificuldade crescente, preparo somente antes de começar. |
| **Vila e personagem** | Cultivo, coleta, mercado, Memória de Conceitos e distribuição gratuita de pontos da build. |
| **Cenários completos** | Vale Sereno, **Cyberpunk** e **New York**, com construções, iluminação e atmosfera próprias. |

```mermaid
flowchart LR
  Focus["Minutos efetivos de Foco"] --> Receipt["Registro de estudo elegível"]
  Review["Revisões devidas"] --> Receipt
  Receipt --> City["Produção do Observatório"]
  City --> Network["Instalações e sinergias"]
  Network --> Discoveries["Melhorias e descobertas"]
  Discoveries --> Legacy["Legado opcional"]
  Legacy --> Network
  Notes["Notas e histórico acadêmico"] --> Preserve["Conservados entre ciclos"]
```

[Regras atuais da economia](docs/architecture/economy.md) · [Modelos de equilíbrio e limites](docs/decisions/deep-production-balance.md).

Na Vila, siga o ciclo **coletar → construir → automatizar → reinvestir**. O Depósito libera os dois postos; você escolhe qual construir primeiro. Estoques acompanham a pausa, construções sobrevivem ao prestígio e cultivos continuam manuais. Água, ambiente, rodas, cargas e partículas 3D respondem ao estado confirmado do jogo nas três skins. [Regras, simulação e provas da farm](docs/validation/FARM_PROJECTS.md).

## Galeria

Capturas do executável real no Windows, com **fixtures de demonstração**. Saldo e progresso de jogo foram preparados para mostrar sistemas avançados; não representam tempo de estudo humano. Clique nas imagens para ampliar. A interface de algumas capturas anteriores conserva a navegação da versão em que foram registradas.

<table>
  <tr>
    <td width="50%" align="center" valign="top">
      <a href="docs/validation/evidence/home-white/home-editorial.png"><img src="docs/validation/evidence/home-white/home-editorial.png" width="100%" alt="Home animada do Nodus no tema Editorial com próxima tarefa e atalhos"></a>
      <p><strong>Home Editorial</strong><br><sub>Próximo passo, escrita rápida e livro 3D.</sub></p>
    </td>
    <td width="50%" align="center" valign="top">
      <a href="docs/validation/evidence/home-white/caderno-branco.png"><img src="docs/validation/evidence/home-white/caderno-branco.png" width="100%" alt="Caderno do Nodus no tema Branco com editor Markdown e acervo de notas"></a>
      <p><strong>Caderno Branco</strong><br><sub>Paleta clara com contraste e rascunho preservado.</sub></p>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center" valign="top">
      <a href="docs/validation/evidence/notes-ux/pdf-selection.png"><img src="docs/validation/evidence/notes-ux/pdf-selection.png" width="100%" alt="Seleção real de um PDF e captura do trecho em nota com origem preservada"></a>
      <p><strong>Capture sem reescrever</strong><br><sub>Trecho do PDF vira nota com página e fonte.</sub></p>
    </td>
    <td width="50%" align="center" valign="top">
      <a href="docs/validation/evidence/farm-projects/all-projects.png"><img src="docs/validation/evidence/farm-projects/all-projects.png" width="100%" alt="Cidade com Depósito e dois postos construídos, objetivos e estoques automáticos"></a>
      <p><strong>Construir e automatizar</strong><br><sub>Depósito, bosque e mina com estoque próprio.</sub></p>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center" valign="top">
      <a href="docs/validation/evidence/study-tabs/four.png"><img src="docs/validation/evidence/study-tabs/four.png" width="100%" alt="Quatro módulos do Nodus em uma grade 2 por 2"></a>
      <p><strong>Quatro painéis por aba</strong><br><sub>Material e ferramentas juntos, com divisores ajustáveis.</sub></p>
    </td>
    <td width="50%" align="center" valign="top">
      <a href="docs/validation/evidence/sidebar/compact-four.png"><img src="docs/validation/evidence/sidebar/compact-four.png" width="100%" alt="Grade de quatro painéis adaptada a uma janela de 1040 por 760 pixels com menu recolhido"></a>
      <p><strong>Mesa compacta</strong><br><sub>Menu recolhido e módulos adaptados a 1040×760.</sub></p>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center" valign="top">
      <a href="docs/evidence/gam-04/upgrades.png"><img src="docs/evidence/gam-04/upgrades.png" width="100%" alt="Melhorias de produção com requisitos e custos no Observatório"></a>
      <p><strong>Produção e melhorias</strong><br><sub>Requisitos, especializações e sinergias entre instalações.</sub></p>
    </td>
    <td width="50%" align="center" valign="top">
      <a href="docs/evidence/gam-04/achievements.png"><img src="docs/evidence/gam-04/achievements.png" width="100%" alt="Descobertas e conquistas progressivas do Observatório"></a>
      <p><strong>Descobertas</strong><br><sub>Marcos do ciclo, progresso e conquistas já reveladas.</sub></p>
    </td>
  </tr>
</table>

<details>
<summary><strong>Explorar os três cenários da cidade</strong></summary>

<table>
  <tr>
    <td width="33%" align="center">
      <a href="docs/evidence/gam-04/district-original.png"><img src="docs/evidence/gam-04/district-original.png" width="100%" alt="Vila Vale Sereno e distrito produtivo"></a>
      <p><strong>Vale Sereno</strong><br><sub>Casas, jardins e luz natural.</sub></p>
    </td>
    <td width="33%" align="center">
      <a href="docs/evidence/gam-04/district-cyberpunk.png"><img src="docs/evidence/gam-04/district-cyberpunk.png" width="100%" alt="Cidade Cyberpunk com torres, iluminação neon e distrito produtivo"></a>
      <p><strong>Cyberpunk</strong><br><sub>Torres, néon e infraestrutura futurista.</sub></p>
    </td>
    <td width="33%" align="center">
      <a href="docs/evidence/gam-04/district-newyork.png"><img src="docs/evidence/gam-04/district-newyork.png" width="100%" alt="Cidade New York com prédios urbanos e distrito produtivo"></a>
      <p><strong>New York</strong><br><sub>Avenidas, brownstones e skyline urbano.</sub></p>
    </td>
  </tr>
</table>

</details>

<div align="center">
  <p><sub>Provas: <a href="docs/validation/HOME_WHITE.md">Home e Branco</a> · <a href="docs/validation/NOTES_UX.md">escrita e captura</a> · <a href="docs/validation/FARM_PROJECTS.md">farm</a> · <a href="docs/validation/STUDY_TABS.md">abas e grade</a> · <a href="docs/validation/DEEP_PRODUCTION.md">Observatório</a></sub></p>
</div>

## IA externa

<div align="center">
  <a href="https://github.com/rafafrd/Nodus/pull/13"><img src="https://img.shields.io/badge/IA_externa-integrada_%C3%A0_main-536255?style=for-the-badge" alt="IA externa integrada à main pelo PR 13"></a>
  <p><strong>Escolha sua IA. Traga a atividade de volta ao Nodus.</strong></p>
</div>

**Integrado à main pelo [PR #13](https://github.com/rafafrd/Nodus/pull/13).** Questionários e flashcards usam fontes selecionadas, por um fluxo manual sem chave de API nem chamadas automáticas.

```mermaid
flowchart LR
  Sources["Selecionar materiais da matéria"] --> Prompt["Copiar prompt completo"]
  Prompt --> AI["Colar em qualquer IA"]
  AI --> JSON["Trazer o JSON"]
  JSON --> Check{"Validar no app"}
  Check -->|Válido| Study["Importar e estudar"]
  Check -->|Inválido| Fix["Copiar pedido de correção"]
  Fix --> AI
```

| Atividade | Como funciona |
| :--- | :--- |
| **Questionário** | Dez questões, quatro alternativas A–D e uma correta. Respostas retomáveis; gabarito, explicações e KPIs ao finalizar. |
| **Flashcards** | Dez cartões com frente, verso e explicação, revelação manual e autoavaliação integrada à revisão existente. |
| **Importação e correção** | Colagem ou arquivo JSON, prévia, validação estrita e pedido de correção com problemas concretos. Original preservado e reimportação sem duplicar a atividade. |
| **Fontes conferíveis** | Snapshot com conteúdo integral, IDs e localizações; complementos de conhecimento geral identificados e acesso ao trecho original. |

<table>
  <tr>
    <td width="50%" align="center" valign="top">
      <a href="docs/validation/evidence/external-activities/prompt.png"><img src="docs/validation/evidence/external-activities/prompt.png" width="100%" alt="Seleção de fontes e prompt completo para IA externa"></a>
      <p><strong>Preparar o prompt</strong><br><sub>Fontes de demonstração e conteúdo integral.</sub></p>
    </td>
    <td width="50%" align="center" valign="top">
      <a href="docs/validation/evidence/external-activities/results.png"><img src="docs/validation/evidence/external-activities/results.png" width="100%" alt="Questionário concluído com resultado, gabarito e explicações"></a>
      <p><strong>Estudar e conferir o resultado</strong><br><sub>Atividade real importada a partir de uma fixture JSON.</sub></p>
    </td>
  </tr>
</table>

[Fluxo e limites](docs/features/atividades-ia-externa.md) · [Contrato JSON 1.0](docs/contracts/study-activity-v1.md). Validar o formato não certifica correção acadêmica; as referências permitem conferir o material.

## Começar no Windows

Use **Node.js 24** e npm. O `package-lock.json` fixa as dependências; não é necessário configurar uma chave de IA para iniciar a mesa local.

```powershell
git clone https://github.com/rafafrd/Nodus.git
cd Nodus
npm.cmd ci
npm.cmd run dev
```

| Objetivo | Comando |
| :--- | :--- |
| Desenvolver | `npm.cmd run dev` |
| Gerar a build local | `npm.cmd run build` |
| Abrir a build local | `npm.cmd run start` |
| Conferir TypeScript | `npm.cmd run typecheck` |
| Executar testes | `npm.cmd test` |
| Conferir documentação | `npm.cmd run check:docs` |
| Gerar o pacote Windows | `npm.cmd run package:win` |

O pacote é gerado em `release/win-unpacked/App Estudos.exe`. Para mover a build, copie a pasta **win-unpacked inteira**. O executável ainda se chama **App Estudos**; esta entrega é um pacote local, sem instalador, assinatura ou release publicada.

### Seu primeiro estudo

1. Em **Início**, clique em **Escrever agora**. No primeiro uso, o app prepara a pasta de notas e pede o nome da matéria.
2. Escreva diretamente; ajuste o título sugerido e use `Ctrl+S`. **Adicionar conteúdo** também permite importar Markdown, trazer um PDF ou guardar uma aula.
3. Clique em **PDFs** ou **Aulas** para usar o módulo sozinho; arraste um subitem lateral para o centro para adicioná-lo à aba atual.
4. Crie outras abas pelo `+`, ajuste os divisores e recolha o menu para liberar espaço.
5. Abra as ferramentas de **Foco** e **Checklist**, ou visite Revisão para criar e estudar cartões.
6. Volte depois: matéria, página, layout e rascunhos são retomados. O foco pausa no fechamento normal.

| Atalho | Ação |
| :--- | :--- |
| `Ctrl+S` | Salvar a nota ou arquivo em edição |
| `Ctrl+K` | Buscar no catálogo local |
| `Ctrl+T` / `Ctrl+W` | Criar / fechar aba da mesa |
| `Ctrl+Tab` / `Ctrl+Shift+Tab` | Trocar aba da mesa |
| `Ctrl+1` … `Ctrl+9` | Selecionar aba da mesa |
| `Esc` no cinema | Voltar para a mesa |

[Guia completo: estudar, jogar, exportar e restaurar](docs/GUIA_DE_USO.md).

## Arquitetura

| Camada | Tecnologias e responsabilidade |
| :--- | :--- |
| **Interface** | React 19.3, TypeScript 5.9.3, CodeMirror 6 e CSS próprio; módulos e preferências locais. |
| **Desktop** | Electron 44.5.1; main/preload com operações específicas, IPC tipado e validação de argumentos/remetente. |
| **Persistência** | Markdown canônico no vault; SQLite para estado, relações, sessões e operações. Migrações aditivas. |
| **Documentos** | PDF.js 6.3.289, prévia Markdown e exportação PDF pelo Electron. |
| **Visualização** | Three.js 0.186.1 para Home/livro/grafo/cidade e GSAP 3.15.0 para entradas/transições, com movimento reduzido. |
| **Domínio e build** | Zod 4.6.5, Decimal.js 10.6.0, Vite 8.3.2, esbuild e electron-builder. |

Código e versões exatas em [package.json](package.json) e [package-lock.json](package-lock.json). [Arquitetura](docs/architecture/README.md) · [Modelo de dados](docs/architecture/data-model.md) · [Decisões](docs/adr/README.md).

## Estado do projeto

| Situação | Escopo |
| :--- | :--- |
| **Disponível na main** | Mesa Windows, notas/PDF/vídeos, revisão, abas/grade, grafo, Explorer, quatro temas, exportação, backup, cidade com produção profunda e atividades importadas de IA externa pelo [PR #13](https://github.com/rafafrd/Nodus/pull/13). |
| **Nesta entrega em revisão** | Branch `codex/home-white`: escrita/organização/captura simplificadas (UX-01), projetos e postos da farm (GAM-05), clareza/animação 3D (UX-02), Home em Início e quinto tema Branco (UX-03). [Fotos/clipe](docs/reports/HOME_BRANCO_2026-10-09.md) · [Provas Windows](docs/validation/HOME_WHITE.md) · [Guia](docs/GUIA_DE_USO.md). |
| **Avaliação de uso pendente** | Compreensão do próximo projeto e seu benefício por uma pessoa leiga: GAM-05/C8 continua parcial, com [roteiro pronto](docs/validation/FARM_PROJECTS.md). |
| **Ainda pendente** | Consulta autenticada no celular com PC desligado, integração de agenda, tutor com geração automática, execução/Git de projetos e extração automática de relações. |

A alpha integral permanece **parcial**. A consulta em nuvem, parte da prova de edição externa e a jornada completa desktop/mobile continuam em seus tickets. Nome definitivo, licença pública e hospedagem ainda não foram definidos. As funcionalidades locais têm evidências próprias; os testes deste repositório não substituem uma prova externa pendente.

Notas ficam nas pastas escolhidas. Banco e rascunhos ficam no perfil local do app; cópias de segurança são privadas, sem criptografia própria. Faça backup antes de migrar versões. YouTube usa rede após abertura explícita; o núcleo de notas, PDF, foco e jogo funciona localmente. Explorer edita arquivos existentes, sem executá-los.

## Documentação

| Preciso de… | Documento |
| :--- | :--- |
| **Usar o aplicativo** | [Guia de uso](docs/GUIA_DE_USO.md) |
| **Saber o que está concluído** | [Estado e próxima ação](docs/status/ALPHA_STATE.md) · [Quadro de tickets](docs/tasks/README.md) |
| **Conferir provas e limitações** | [Validação da alpha](docs/validation/ALPHA.md) · [Histórico de execução](docs/status/RUN_LOG.md) |
| **Entender estudo e navegação** | [Home e Branco](docs/validation/HOME_WHITE.md) · [Escrita/captura](docs/validation/NOTES_UX.md) · [Abas e grade](docs/validation/STUDY_TABS.md) |
| **Entender o jogo** | [Economia atual](docs/architecture/economy.md) · [Farm e postos](docs/validation/FARM_PROJECTS.md) · [Produção profunda](docs/validation/DEEP_PRODUCTION.md) |
| **Entender o código** | [Arquitetura](docs/architecture/README.md) · [SDD](docs/sdd.md) · [ADRs](docs/adr/README.md) |
| **Contribuir com contexto** | [AGENTS.md](AGENTS.md) · [CLAUDE.md](CLAUDE.md) · [Gotchas observados](gotcha.md) |

<div align="center">
  <hr>
  <p><strong>Abra um material. Conecte uma ideia. Retome de onde parou.</strong></p>
  <p><sub>Projeto pessoal em evolução · Windows primeiro · Dados locais · Estudo e jogo com progressos distintos</sub></p>
</div>
