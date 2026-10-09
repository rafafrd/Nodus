---
id: GAM-05
status: doing
outcome: parcial
depends_on: ["GAM-04", "UX-01"]
criteria_count: 8
---

# GAM-05 — Projetos e automação da farm

## Objetivo e dependências

Implementar o plano aprovado: coletar → construir → automatizar → reinvestir na Cidade atual. GAM-04 existe no código; preservar integralmente as alterações locais de UX-01. Branch local codex/farm-projects, sem commit/push/publicação autorizados.

## Prompt de execução

C1. Depósito (10 madeiras/5 pedras), posto do bosque (20 madeiras/10 pedras/10 trigos), posto da mina (30 pedras/15 madeiras/5 cenouras); escolha de ordem após depósito e um próximo objetivo com progresso, faltantes, benefício e atalhos de coleta. Ao concluir, apontar para instalações/melhorias existentes.
C2. Postos produzem 1 material/minuto, estoque individual de 200, recolhimento manual sem XP/recompensa/counter de coleta; cultivos continuam manuais.
C3. Transação única para custos/resultado/recibo; insuficiência, duplicata, replay/conflito e rollback comprovados no Store real.
C4. Relógio do main, frações, estoque cheio, regressão, offline, reinício, perfil antigo sem retroatividade, backup e prestígio preservados no JSON atual, sem migration/tabela/moeda nova.
C5. Motor proporcional à produção instalada, pisos atuais, orçamento diário máximo entre 1.200 e dois minutos de produção; números grandes no main, melhorias permanentes e nível, eventos sem ampliar orçamento, ganho real/restante/alternativas e ausência de recompensa aparente quando zero.
C6. Construções operantes nas três skins, confirmação visual, pacote Windows e interface compacta; regressão de estudos/UX-01.
C7. Simulação com/sem estudo e documentação/evidências; não apresentar simulação como progressão humana. Verificações pertinentes e check-bootstrap.
C8. Avaliação com usuário leigo: entende o próximo objetivo e o benefício sem explicação. Prova humana necessária; automação/capturas não aprovam esse critério.

## Execução e retomada

09/10/2026, Windows11 10.0.26200/Node24.21.0 portátil/Electron44.5.1. C1–C7 entregues: três projetos/estoques/motor/UI,81testes/typecheck/backup/simulação/pacote Windows204assets/jornadas farm/UX-01/MVP e capturas de fixtures. [Evidências e roteiro humano](../../validation/FARM_PROJECTS.md). Dados/compras/cultivos/prestígio e todas as alterações locais UX-01/DOC-01 conservados. Sem dependência/migration/stage/commit/push/publicação.

C8 não verificado: não houve avaliação com usuário leigo. Por isso permanece doing/parcial; nenhum bloqueio técnico ou implementação pendente. Próxima ação concreta: executar o roteiro leigo da validação, registrar entendimento do objetivo/benefício sem explicação e ajustar se necessário. Não apresentar o modelo de progressão como tempo humano ou retenção comprovada.
