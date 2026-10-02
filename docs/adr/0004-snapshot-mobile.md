# ADR 0004 — consulta de snapshot na nuvem

Data: 01/10/2026. Estado: Aceita como requisito do backlog; protocolo concreto pendente. Ticket: ALP-09.

## Contexto e decisão

Celular deve consultar notas com o PC desligado. A alpha publica snapshots de Markdown em Supabase com Auth, política por proprietário e operação/revisão/hash rastreáveis. Página web independente em HTTPS consulta a última versão confirmada. PDFs e projetos ficam no PC.

## Alternativas e consequências

Servir a página apenas pelo PC não atende independência. Git permanece histórico manual e não é o protocolo do celular. A implementação precisa tratar reenvio idempotente, revisão atrasada, erro visível e separação de segredos do cliente público. O celular consulta notas; edição pelo celular não entra nesta alpha.

## Evidência e revisão

Projeto Supabase, hospedagem, SQL/protocolo e prova com outra identidade/PC desligado são pendentes. ALP-09 registra configuração e evidência real antes de ser concluído.
