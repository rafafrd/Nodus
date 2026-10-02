# App de estudos — início do projeto

App pessoal de estudos. MVP em construção na branch MVP: Electron, React e TypeScript, edição Markdown assistida com prévia, SQLite local. A fundação foi executada e empacotada no Windows; consulta web continua uma etapa externa pendente.

## Começar

Use Node 24 e npm no Windows. A cópia portátil usada nesta execução está em .local/node-v24.21.0-win-x64; ela não é versionada. Com Node 24 no PATH:

```powershell
npm.cmd ci
npm.cmd run dev
npm.cmd run typecheck
npm.cmd test
npm.cmd run package:win
node scripts/smoke-desktop.mjs --packaged
node scripts/check-bootstrap.mjs
```

`npm run start` abre a build local. `package:win` gera release/win-unpacked/App Estudos.exe. O smoke inicia e fecha o app; use apenas dados de teste. O verificador bootstrap examina documentação. Consulte [estado e próxima ação](docs/status/ALPHA_STATE.md) antes de retomar; não rode novamente o bootstrap com -Force.

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

Resultados reais, incluindo provas pendentes, estão na validação e no quadro. Nome definitivo, licença pública e hospedagem ainda não foram definidos. Commits locais por fase foram autorizados; sem push ou publicação.
