# Ambiente Windows nativo

Escolha confirmada: Windows nativo. O bootstrap evoluiu para o MVP local; ambiente realmente usado está registrado abaixo e no README. Os comandos de instalação desta seção são instruções para um novo PC, não um registro de ferramentas instaladas globalmente nesta sessão.

## 1. Conferir ferramentas

No PowerShell, confira o que já existe:

```powershell
git --version
node --version
npm.cmd --version
```

Base inicial: Node.js 24 LTS e Git for Windows. Instale apenas o que faltar. Node 24 foi conferido como LTS na documentação oficial em 01/10/2026; ALP-01 deve registrar a versão exata usada e compatibilidade com as dependências.

```powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
```

Após instalar, reabra o terminal e confira versões. Se o instalador LTS oferecer outra versão principal no futuro, compare com .node-version e revise a escolha antes de implementar.

VS Code é opcional para inspecionar arquivos. Instale pelo [site oficial](https://code.visualstudio.com/download); abra a pasta por File → Open Folder ou por code . quando o comando estiver disponível.

## 2. Abrir Codex

Use Codex em uma superfície local: aplicativo desktop, CLI ou extensão de IDE. Para começar pelo aplicativo Windows, siga [a documentação oficial](https://developers.openai.com/codex/windows/windows-app). O caminho de instalação documentado é:

```powershell
winget install --id 9PLM9XGG6VKS -s msstore
```

Abra o aplicativo, entre com sua conta e escolha a pasta local app-estudos. A sessão precisa ter acesso a essa pasta e ao terminal Windows. Confira as permissões exibidas pelo aplicativo conforme seu modo de trabalho.

Se já usa Codex CLI, abra o PowerShell na raiz e execute codex. Para instalar/atualizar a CLI, siga [o guia atual da CLI](https://developers.openai.com/codex/cli), usando a opção Windows ou npm exibida naquele guia. Este pacote não fixa versão/modelo do Codex nem altera a configuração global.

## 3. Validar o pacote

```powershell
Set-Location C:\dev\app-estudos
node .\scripts\check-bootstrap.mjs
```

O comando usa apenas Node e verifica arquivos/links/tarefas. ALP-01 já criou a aplicação: consulte README para npm ci, dev, typecheck, testes e package:win. Nesta execução: host portátil Node 24.21.0, Electron 44.5.1/Node embarcado 24.21.0, Windows 11 10.0.26200. Host global era Node 26.3.0 e não foi alterado. Para usar a cópia local existente, acrescente a pasta .local/node-v24.21.0-win-x64 ao PATH apenas do terminal atual.

Siga [Git](git.md) e [a primeira sessão](agents.md). Janela Electron e executável Windows já foram abertos, fechados e reabertos nas provas locais; confira docs/validation/MVP_JOURNEY.md para comandos, resultado e identificação do artefato.

## Recursos das tarefas seguintes

| Quando | Recurso |
| --- | --- |
| ALP-01 | Electron/React/TypeScript e ferramenta de build, instalados pela implementação |
| ALP-03 | SQLite; ferramentas C++ somente se a dependência escolhida precisar compilar |
| ALP-09 | Projeto Supabase, Auth e hospedagem web HTTPS |
| IA nas semanas seguintes | Chave própria OpenRouter e limites configurados |
| Laboratórios futuros | Docker/WSL2 instalados pelo usuário e verificados pelo app |

Não é necessário provisionar Supabase, Docker, WSL2, OpenRouter, Python ou SQL para a primeira tarefa.

## Diagnóstico curto

npm.ps1 bloqueado: execute npm.cmd. Executável não encontrado após instalação: reabra terminal/editor e confira PATH. Falha do Codex em máquina gerenciada: registre o erro e consulte o guia Windows, sem alterar políticas globais para mascará-lo.

Fontes: [Node releases](https://nodejs.org/en/about/previous-releases), [Git instalação](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git), [Codex Windows](https://developers.openai.com/codex/windows), [AGENTS.md](https://developers.openai.com/codex/guides/agents-md).
