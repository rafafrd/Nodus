# App de estudos — início do projeto

App pessoal de faculdade, produtividade e conhecimento, com futura publicação open source e destaque no portfólio. Windows nativo primeiro; desktop Electron/React/TypeScript, vault Markdown, SQLite e snapshot web autenticado. Este bootstrap cria documentos e tarefas; não implementa o app.

## Começar

1. Execute o script único de preparação em uma pasta local de projeto. Confira as mensagens sobre arquivos criados.
2. Para consultar o modo de geração e as configurações posteriores, use [o bootstrap](docs/setup/bootstrap.md), [Windows](docs/setup/windows.md) e [Git](docs/setup/git.md).
3. Abra a raiz no Codex e envie [o pedido de início sequencial](docs/setup/CODEX_START.md).
4. Para retomar, consulte [o estado](docs/status/ALPHA_STATE.md). Não execute o bootstrap com -Force para continuar a implementação.

```powershell
node .\scripts\check-bootstrap.mjs
```

Esse comando verifica os documentos. ALP-01 cria package.json, instalação, desenvolvimento, testes e empacotamento do aplicativo. Não há npm install do app antes dessa implementação.

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

Todos os tickets começam em todo/a_fazer e critérios não verificados. Código da aplicação, serviço Supabase e build Windows não estão incluídos. Nome definitivo, licença, editor comprovado e hospedagem continuam pendentes. O script prepara arquivos; o agente implementa o app quando receber o pedido de início.
