# Persistência local

02/10/2026 — ALP-03. SQLite usa `node:sqlite` DatabaseSync do Node 24.21.0 embarcado no Electron 44.5.1. Não há binding nativo de terceiros nem rebuild de SQLite. Arquivo em `app.getPath('userData')/study.sqlite`, independente do vault; testes usam `--user-data-dir` com pasta isolada em .local ou diretório temporário explicitamente criado.

Schema v1 no código src/main/store.ts: matérias, referências de notas, rascunhos de recuperação, materiais, mesas, sessões/segmentos, tarefas/etapas, operações futuras e registro local de eventos sem conteúdo pessoal. Chaves estrangeiras ativadas; consultas parametrizadas; migração em transação, WAL e busy_timeout. Versão futura desconhecida é rejeitada, sem reset. Corpo canônico não fica na tabela de notas; rascunho identifica base_hash e instante de recuperação.

IDs UUID não derivam do nome. Zod strictObject valida entradas no main, junto da verificação de remetente do IPC. A renomeação preserva a mesa e o ID. Testes executados com SQLite real no host e no Electron verificaram persistência, rollback e rejeição de argumentos. As tabelas futuras não implicam que os respectivos recursos já estejam implementados.
