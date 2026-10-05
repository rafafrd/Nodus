# App de estudos — mesa local

App pessoal de estudos. MVP local na branch MVP: Electron, React e TypeScript, notas Markdown com edição assistida/prévia, SQLite, mesa por matéria, PDF, foco e checklist. Three.js compõe o cenário discreto; GSAP anima os painéis. Executado e empacotado no Windows; consulta web é um próximo incremento.

O refinamento UI-01 fica na branch feat/frontend: superfícies retas e grade de quatro módulos, seguindo a referência fornecida pelo usuário. Consulte [a verificação do frontend](docs/validation/FRONTEND.md) para capturas e resultados.

GAM-01 na branch feat/game acrescenta a cidade Vale Sereno, farm/grind, loja, Memória de Conceitos e build. Abra **Cidade** na barra fixa à esquerda. Economia persistida no SQLite, sem precisar de vault; [regras provisórias](docs/decisions/game-rules.md) e [parecer de segurança](docs/security/GAME_AUDIT.md) descrevem o recorte local.

GAM-02 na branch feat/engine-explorer acrescenta motor clicável com upgrades, dois desafios de timing e Explorer/editor de pastas reais com abas, Ctrl+S, hash/conflito e rascunhos recuperáveis. [Provas](docs/validation/ENGINE_EXPLORER.md) e [revisão de docs](docs/validation/PRODUCT_DOCS.md).

UI-02 na branch codex/smooth-ui aplica navegação fixa, tipografia/ícones próprios, sintaxe/caminho e largura do Explorer, câmera/contexto da cidade, feedback do motor e transições GSAP com interrupção e movimento reduzido dinâmico. [Provas](docs/validation/SMOOTH_UI.md).

MED-01 na branch codex/youtube-cinema acrescenta links YouTube por matéria, cinema e PiP interno arrastável. Um player oficial isolado conserva reprodução entre modos; links ficam no SQLite e requerem abertura explícita/internet. [Provas](docs/validation/YOUTUBE.md).

CFG-01 na branch codex/settings-profile acrescenta **Ajustes**: perfil local com nome/foto, três temas, controle de animações e contagens/pastas/versões reais. Preferências persistem sem reset do banco ou recriação dos documentos. [Provas](docs/validation/SETTINGS.md).

EXP-01 na branch codex/pdf-export acrescenta **Ajustes → Dados e app → Exportar pasta em PDF**. Notas Markdown do vault ou de projetos do Explorer, incluindo subpastas, viram um caderno A4 com fundo preto, capa, sumário e páginas numeradas. O PDF é salvo em Downloads; arquivos originais permanecem intactos. [Provas](docs/validation/PDF_EXPORT.md).

**[Guia para iniciar e usar](docs/GUIA_DE_USO.md)**: executável, desenvolvimento, pacote Windows, mesa, jogo e backup.

## Começar

Use Node 24 e npm no Windows. A cópia portátil usada nesta execução está em .local/node-v24.21.0-win-x64; ela não é versionada. Com Node 24 no PATH:

```powershell
npm.cmd ci
npm.cmd run dev
npm.cmd run typecheck
npm.cmd test
npm.cmd run package:win
node scripts/smoke-desktop.mjs --packaged
npm.cmd run test:journey
npm.cmd run test:game
npm.cmd run test:engine-explorer
npm.cmd run test:smooth-ui
npm.cmd run test:videos
npm.cmd run test:settings
npm.cmd run test:pdf-export
node scripts/check-bootstrap.mjs
```

`npm run start` abre a build local. `package:win` gera release/win-unpacked/App Estudos.exe. Os smokes iniciam e fecham instâncias com dados fictícios isolados em .local. O verificador bootstrap examina documentação. Consulte [estado e próxima ação](docs/status/ALPHA_STATE.md) antes de retomar; não rode novamente o bootstrap com -Force.

Nesta máquina o host global estava em Node 26. Para usar o Node 24 portátil que foi conferido contra o checksum oficial, apenas no terminal atual:

```powershell
$env:PATH = (Resolve-Path '.local/node-v24.21.0-win-x64').Path + ';' + $env:PATH
npm.cmd run dev
```

Versões usadas: Node host/embarcado 24.21.0, Electron 44.5.1, React 19.3.0, TypeScript 5.9.3, Vite 8.3.2, PDF.js 6.3.289, Three.js 0.186.1 e GSAP 3.15.0. Todas as dependências estão fixadas no lockfile. Build local sem instalador/assinatura de publicação.

## Primeiro uso

1. Crie uma matéria pelo botão + da barra lateral e escolha uma pasta de notas (vault).
2. Crie uma nota ou importe um .md já dentro desse vault. A importação adiciona apenas identidade e associação ao frontmatter se ausentes. Este MVP usa um vault por banco.
3. Use Editar para fonte e toolbar; Leitura abre a prévia. Ctrl+S salva no arquivo. HTML e imagens remotas da nota não são executados/carregados; fórmulas e wikilinks são conservados na fonte, com limites da prévia descritos na [decisão do editor](docs/decisions/markdown-editor.md).
4. Abra um PDF local, navegue por páginas e redimensione o caderno pelo separador/teclado. Documento, página e layout pertencem à matéria.
5. No dock, abra foco para escolher minutos, pausar/retomar/encerrar; ou checklist para criar tarefas, etapas e próxima ação (→). Módulos/Todos (Alt+3) abre caderno, PDF, foco e checklist em uma grade; Alt+1/2 abre uma ferramenta. Só caderno amplia a nota; Esc volta à mesa. O leitor PDF permite ajustar à largura ou ver a página inteira.
6. Troque matéria ou reabra: cada mesa retoma seu contexto. Fechar preserva rascunho sem tratá-lo como nota salva; foco pausa. Conflito externo mostra as duas versões para revisão explícita.
7. Em Seu mundo, acione e melhore o motor para farm ativo; jogue QTE/skillcheck na Oficina, plante/colha, visite mina/bosque, venda recursos e compre melhorias no Mercado. Memória rende recompensas por rodada concluída; Personagem permite distribuir/redistribuir pontos grátis. Entrar pausa o foco e preserva o rascunho; Voltar à mesa retoma o estudo. Moedas/XP são do jogo, sem avaliação de domínio acadêmico.

8. Em Explorer, abra uma pasta real, navegue na árvore e edite arquivos UTF-8 existentes em abas. Ctrl+S grava; conflitos externos conservam versões e fechamento conserva draft. Sem execução/Git de projetos neste incremento.

Banco, rascunhos e backups ficam em `%APPDATA%/app-estudos`; vault/PDFs ficam nas pastas escolhidas. Não são criptografados pelo app. Instância de teste isolada: execute `App Estudos.exe --user-data-dir=C:\caminho\de\teste` com uma pasta de teste. Testes usam .local e conteúdo fictício; não configure dados pessoais nesses diretórios.

## Mapa

| Caminho | Uso |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Regras compartilhadas e execução sequencial |
| [CLAUDE.md](CLAUDE.md) | Contexto do produto e guia complementar |
| [gotcha.md](gotcha.md) | Riscos previstos e ocorrências reais |
| [docs/tasks/README.md](docs/tasks/README.md) | Tickets da alpha e incrementos com dependências/critérios |
| [docs/status/ALPHA_STATE.md](docs/status/ALPHA_STATE.md) | Estado e próxima ação |
| [docs/status/RUN_LOG.md](docs/status/RUN_LOG.md) | Histórico dos checkpoints |
| [docs/validation/ALPHA.md](docs/validation/ALPHA.md) | Evidência por critério |
| [docs/validation/FRONTEND.md](docs/validation/FRONTEND.md) | Refinamento UI-01, execução e capturas |
| [docs/GUIA_DE_USO.md](docs/GUIA_DE_USO.md) | Como iniciar no Windows, estudar, jogar e preservar dados |
| [docs/validation/GAME.md](docs/validation/GAME.md) | Jogo GAM-01, pacote/jornada e identificação |
| [docs/security/GAME_AUDIT.md](docs/security/GAME_AUDIT.md) | Revisão do incremento e avaliação de tooling |
| [docs/security/MVP_AUDIT.md](docs/security/MVP_AUDIT.md) | Auditoria final por agente, provas e limites |
| [docs/architecture/README.md](docs/architecture/README.md) | Módulos e contratos |
| [docs/sdd.md](docs/sdd.md) | Especificação da alpha |
| [docs/adr/README.md](docs/adr/README.md) | Decisões arquiteturais |
| [docs/PROMPTS_ALPHA_ALP_01_11.md](docs/PROMPTS_ALPHA_ALP_01_11.md) | Banco de prompts desta edição |

## Recorte e estado

Alpha: escolher matéria, abrir nota/PDF, registrar etapas, usar foco com duração escolhida, retomar a mesa e consultar pelo celular uma nota confirmada na nuvem com PC desligado. Farm/loja/builds ganharam um primeiro incremento local por pedido explícito após a mesa; grafo 3D, integração de notas/IA, agenda e execução/Git de projetos seguem o roadmap; navegação/edição local foram antecipadas em GAM-02. Tempo humano disponível: até 3 horas por semana; o prazo se ajusta para preservar o escopo.

Resultados reais, incluindo provas pendentes, estão na validação e no quadro. [Recorte inicial](docs/decisions/mvp-scope.md): ALP-01 e ALP-03–08 locais implementados, ALP-02 parcial por conferência em editor externo, ALP-09 a fazer e ALP-10 parcial sem a jornada de nuvem. ALP-11 documenta os checkpoints. Nome definitivo, licença pública e hospedagem ainda não definidos. Push das branches autorizado posteriormente pelo usuário; sem publicação de release/serviço.

Auditoria independente: aprovação com mitigações para uso pessoal local, zero achados abertos, um Low de logging corrigido e confirmado no pacote. Perfil Windows protegido, dados fora do Git e recovery preservado são as mitigações do recorte; pacote sem assinatura e dados sem criptografia própria. As provas e o modelo de ameaças estão no relatório acima. Próxima prova humana: abrir a build, criar uma matéria com vault de teste e conferir a saída .local/evidence/editor-output.md em editor externo.

Em Material → Vídeos → + Link, salve a URL/título e abra o player. Cinema escurece a mesa; Escape volta. PiP segue no Explorer, pode ser arrastado pelo título ou movido por setas/Shift/Home. Fechar para reprodução e conserva o link; restart não conecta automaticamente.
