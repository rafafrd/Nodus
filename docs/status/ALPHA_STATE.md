# Retomada da alpha

Data de criação do bootstrap: 01/10/2026, America/Sao_Paulo. Atualize a data/ambiente quando houver execução real.

## Estado real

Implementação local da alpha em execução no Windows nativo. Resultados por critério em docs/validation/ALPHA.md.

## Próxima ação

ALP-06: Leitor PDF real verificado também empacotado Windows; próximo ALP-07, foco por segmentos.

## Tickets

| Ticket | Quadro | Situação | Dependências | Critérios pendentes |
| --- | --- | --- | --- | --- |
| ALP-01 | done | Concluído | — | C1–C5 |
| ALP-02 | doing | Parcial | ALP-01 | C1–C6 |
| ALP-03 | done | Concluído | ALP-01 | C1–C6 |
| ALP-04 | done | Concluído | ALP-02, ALP-03 | — |
| ALP-05 | done | Concluído | ALP-04 | — |
| ALP-06 | done | Concluído | ALP-05 | — |
| ALP-07 | todo | A fazer | ALP-05 | C1–C6 |
| ALP-08 | todo | A fazer | ALP-05 | C1–C6 |
| ALP-09 | todo | A fazer | ALP-04 | C1–C9 |
| ALP-10 | todo | A fazer | ALP-06, ALP-07, ALP-08, ALP-09 | C1–C5 |
| ALP-11 | done | Concluído | ALP-01 | — |

## Checkpoints e atenção humana

Semana 1: fundação, editor preservador, persistência e nota salva/reaberta. Semana 2: mesa retomável, PDF/foco/checklist e snapshot consultável com PC desligado.

Reserva: 180 min humanos por semana, 360 min no total. Tempo observado: não informado. O prazo é ajustável para preservar escopo. ALP-11 recebe 20 min na semana 1 e 15 na semana 2; documentar não conclui os outros tickets.

## Decisões/bloqueios

Nome final, licença, editor, hospedagem, versões exatas do app e formatos definitivos ainda pendentes. Configuração externa será necessária em ALP-09. Bloqueios reproduzidos da aplicação: nenhum, pois a implementação não começou. Consulte ADRs e gotcha.md antes da próxima alteração.
