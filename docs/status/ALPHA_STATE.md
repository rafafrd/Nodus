# Retomada da alpha

Bootstrap criado em 01/10/2026. Última execução: 02/10/2026, Windows 11 10.0.26200, America/Sao_Paulo, Node 24.21.0, app 0.1.0.

## Estado real

MVP local implementado e executado no Windows nativo, branch MVP e commits por fase. Alpha integral parcial. Resultados por critério em docs/validation/ALPHA.md; jornada local em docs/validation/MVP_JOURNEY.md.

## Próxima ação

UI-01 em andamento na branch feat/frontend: refinar mesa/leitura/ferramentas e compartilhar capturas reais. MVP ae0c9f6 enviada para origin/MVP por solicitação do usuário. ALP-02/C5 externo e ALP-09 permanecem pendentes.

## Tickets

| Ticket | Quadro | Situação | Dependências | Critérios pendentes |
| --- | --- | --- | --- | --- |
| ALP-01 | done | Concluído | — | — |
| ALP-02 | doing | Parcial | ALP-01 | C5 |
| ALP-03 | done | Concluído | ALP-01 | — |
| ALP-04 | done | Concluído | ALP-02, ALP-03 | — |
| ALP-05 | done | Concluído | ALP-04 | — |
| ALP-06 | done | Concluído | ALP-05 | — |
| ALP-07 | done | Concluído | ALP-05 | — |
| ALP-08 | done | Concluído | ALP-05 | — |
| ALP-09 | todo | A fazer | ALP-04 | C1, C2, C3, C4, C5, C6, C7, C8, C9 |
| ALP-10 | doing | Parcial | ALP-06, ALP-07, ALP-08, ALP-09 | C1, C3 |
| ALP-11 | done | Concluído | ALP-01 | — |

## Checkpoints e atenção humana

Semana 1: fundação, editor preservador, persistência e nota salva/reaberta. Semana 2: mesa retomável, PDF/foco/checklist e snapshot consultável com PC desligado.

Reserva: 180 min humanos por semana, 360 min no total. Tempo observado: não informado. O prazo é ajustável para preservar escopo. ALP-11 recebe 20 min na semana 1 e 15 na semana 2; documentar não conclui os outros tickets.

## Decisões/bloqueios

Editor escolhido: CodeMirror com edição assistida de fonte e prévia, conforme ADR-0005; prova no editor externo ainda pendente. Versões exatas estão no lockfile e README. Recorte local em docs/decisions/mvp-scope.md; ALP-09 não implementado, sem serviço/hospedagem/identidade definidos. Nome final e licença pública seguem pendentes. Tiptap com perda na prova básica e overflow da mesa foram observados e tratados (gotcha.md). Consulte ADRs antes da próxima alteração.
