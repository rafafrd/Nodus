# Uso dos agentes

AGENTS.md mantém as regras compartilhadas; CLAUDE.md acrescenta contexto. Abra a raiz do repositório. Leia a retomada e o ticket ativo, consultando arquitetura/SDD/decisões conforme a tarefa exigir.

## Iniciar a implementação

Use o [pedido de início](CODEX_START.md). Ele autoriza ALP-01 a ALP-10 em sequência e ALP-11 como checkpoint após ALP-04 e ao final. Trabalhe em um ticket por vez. A implementação já existente sempre prevalece sobre o estado inicial deste pacote.

## Retomar

Uma sessão nova começa por docs/status/ALPHA_STATE.md, Git e evidências pertinentes. Preserve resultados e continue a próxima ação concreta. Atualize [o diário](../status/RUN_LOG.md) após cada checkpoint. Não copie o estado inicial por cima de uma implementação.

## Verificação

Os tickets só vão para done quando os critérios estão demonstrados. Falhas de ambiente ou serviço ficam explícitas; trabalho independente pode continuar. O verificador do bootstrap checa documentos, não a aplicação. Instalação/login do Codex são feitos pelo usuário; este pacote não altera a configuração global do agente.

Fonte: [instruções com AGENTS.md](https://developers.openai.com/codex/guides/agents-md).
