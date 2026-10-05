# Git do projeto

Git já está disponível no PC. O script de estrutura não executa Git, não inicializa repositório, não configura autor e não cria commit. Confira o estado existente antes de qualquer operação.

Se esta pasta ainda não for um repositório, inicialize localmente quando desejar:

```powershell
git init -b main
git status --short
git var GIT_AUTHOR_IDENT
```

Respeite identidade/configuração existente. Se faltar autor, configure apenas neste projeto com seus dados reais. Não invente autor nem altere configurações globais. Revise e selecione arquivos pertinentes antes do primeiro commit.

## Durante a implementação

O [pedido de início](CODEX_START.md) autoriza commits locais dos checkpoints em uma branch contínua, como feat/alpha. Preserve implementação e alterações anteriores; não crie branches independentes que percam o código necessário ao ticket seguinte. Se o repositório não estiver preparado, conclua trabalho independente e registre a etapa Git pendente.

Um commit não aprova critérios pendentes. Push, criação de remoto e publicação exigem pedido específico. O Git do app é separado do vault de notas e de cada projeto de programação. Materiais privados, bancos e segredos não são versionados.

## Estado em 03/10/2026

Repositório e origin já existentes; não inicializar novamente. Pedidos posteriores autorizaram pushes de MVP, feat/frontend e feat/game. GAM-02 usa feat/engine-explorer, derivada de 083bdc0, com commits por fase e push no final por pedido explícito. Não implica publicação de serviço/release nem operação nos repositórios do vault/projetos.

UI-02 usa codex/smooth-ui, derivada de 0da34c7. O usuário autorizou outra branch, commits por fase e push no final; essa autorização não exige nova confirmação a cada checkpoint.
