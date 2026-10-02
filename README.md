# App de estudos — início do projeto

App pessoal de estudos. MVP local na branch MVP: Electron, React e TypeScript, notas Markdown com edição assistida/prévia, SQLite, mesa por matéria, PDF, foco e checklist. Three.js compõe o cenário discreto; GSAP anima os painéis. Executado e empacotado no Windows; consulta web é um próximo incremento.

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
5. No dock, abra foco para escolher minutos, pausar/retomar/encerrar; ou checklist para criar tarefas, etapas e próxima ação (→).
6. Troque matéria ou reabra: cada mesa retoma seu contexto. Fechar preserva rascunho sem tratá-lo como nota salva; foco pausa. Conflito externo mostra as duas versões para revisão explícita.

Banco, rascunhos e backups ficam em `%APPDATA%/app-estudos`; vault/PDFs ficam nas pastas escolhidas. Não são criptografados pelo app. Instância de teste isolada: execute `App Estudos.exe --user-data-dir=C:\caminho\de\teste` com uma pasta de teste. Testes usam .local e conteúdo fictício; não configure dados pessoais nesses diretórios.

## Mapa

| Caminho | Uso |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Regras compartilhadas e execução sequencial |
| [CLAUDE.md](CLAUDE.md) | Contexto do produto e guia complementar |
| [gotcha.md](gotcha.md) | Riscos previstos e ocorrências reais |
| [docs/tasks/README.md](docs/tasks/README.md) | Onze tickets com dependências e critérios |
| [docs/status/ALPHA_STATE.md](docs/status/ALPHA_STATE.md) | Estado e próxima ação |
| [docs/status/RUN_LOG.md](docs/status/RUN_LOG.md) | Histórico dos checkpoints |
| [docs/validation/ALPHA.md](docs/validation/ALPHA.md) | Evidência por critério |
| [docs/architecture/README.md](docs/architecture/README.md) | Módulos e contratos |
| [docs/sdd.md](docs/sdd.md) | Especificação da alpha |
| [docs/adr/README.md](docs/adr/README.md) | Decisões arquiteturais |
| [docs/PROMPTS_ALPHA_ALP_01_11.md](docs/PROMPTS_ALPHA_ALP_01_11.md) | Banco de prompts desta edição |

## Recorte e estado

Alpha: escolher matéria, abrir nota/PDF, registrar etapas, usar foco com duração escolhida, retomar a mesa e consultar pelo celular uma nota confirmada na nuvem com PC desligado. Grafo 3D, farm/loja/builds, IA, agenda e projetos JS/TS seguem o roadmap da primeira versão pública. Tempo humano disponível: até 3 horas por semana; o prazo se ajusta para preservar o escopo.

Resultados reais, incluindo provas pendentes, estão na validação e no quadro. [Recorte desta entrega](docs/decisions/mvp-scope.md): ALP-01 e ALP-03–08 locais implementados, ALP-02 parcial por conferência em editor externo, ALP-09 a fazer e ALP-10 parcial sem a jornada de nuvem. ALP-11 documenta os checkpoints. Nome definitivo, licença pública e hospedagem ainda não definidos. Commits locais por fase; sem push/publicação.
