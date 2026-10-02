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
