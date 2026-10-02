# Sessões de foco

02/10/2026 — ALP-07. Duração escolhida de 1 a 480 minutos, guardada em ms; sessão UUID com segmentos separados. O main usa performance.now para tempo ativo, não callbacks acumulados nem relógio civil. Callback verifica conclusão e checkpoint; pausa fecha segmento e retomada mantém sessão, criando outro segmento. Só uma sessão fica ativa no app, com matéria proprietária visível no rodapé mesmo ao trocar de mesa.

Fechamento normal pausa/grava antes de permitir fechar. Checkpoint periódico tem alvo de 5 s; após encerramento forçado, a sessão é recuperada pausada exatamente no último checkpoint disponível, sem crédito do intervalo fechado. Não há garantia de intervalo máximo quando o event loop estiver bloqueado. A UI identifica recuperação e exige retomada explícita. Concluir duração encerra estado sem novo ciclo; encerrar cedo persiste tempo ativo e estado ended. Não há XP/recompensas.

Testes de cálculo usam relógios controlados identificados como teste unitário, incluindo mudança do relógio civil. Integração real: scripts/smoke-focus.ts com UI, SQLite e tempo efetivo no Windows, pausa observada de 1 s sem crédito, retomada no mesmo ID, janela sem foco, fechar/reabrir e processo de teste terminado à força. Nota e PDF ficaram abertos. Tolerância do roteiro normal até 900 ms entre medida pré-fechamento e checkpoint de fechar; segmentos unitários são exatos.
