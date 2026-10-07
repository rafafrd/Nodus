# ADR-0015 — Economia declarativa e estudo conectado

Status: aceita para GAM-04. Data: 07/10/2026.

## Contexto

O Game existente já transacionava carteira, ledger, compras, cultivos, builds, memória, Oficina, conquistas e prestígio. Foco/revisões tinham registros acadêmicos reais, mas não recompensas econômicas. Catálogo fixo de cinco famílias e Number não sustentavam a escala pedida. Missões semanais, coleções e platinums continuam futuros.

## Decisão

Reutilizar Game/IPC/ledger e quatro builds. Separar cálculo puro (`economy.ts`), definições validadas (`economy-content.ts`/`economy-validation.ts`) e curvas versionadas (`economy-balance.ts`). Efeitos conhecidos e condições declarativas compõem produção, custos, sinergias, eventos, descoberta e legado. Adicionar conteúdo com esses tipos não exige outra árvore de habilidades, moeda ou engine de conquistas.

Saldo e deltas inteiros usam soma/subtração BigInt exatas; fórmulas usam decimal.js10.6.0, precisão80 algarismos significativos e expoente limitado a±1000. JSON conserva Number somente quando a conversão é segura/exata; demais valores são strings decimais. SQLite6 migra carteira/ledger para TEXT transacionalmente, preservando IDs/XP/origens/versões anteriores. Não usar SUM SQLite para reconciliar valores grandes. A dependência direta pequena já constava transitivamente no lockfile; não houve atualização geral de dependências.

Foco rende por minutos efetivos persistidos, sem pausa/tempo fechado. Revisões devidas geram elegibilidade no serviço acadêmico e recibo econômico no Game; retry econômico conserva revisão já salva. Histórico pré-migração vira baseline, sem crédito retroativo. XP e critérios de aprendizagem permanecem no domínio existente.

Motor conserva cliques/animação/XP livres, com recompensa secundária limitada a64/pulso e1.200/dia. Eventos ficam guardados sem expiração; ativação é bloqueada durante Foco, até dois tipos temporários simultâneos. Ausência liquida a taxa anterior por segmentos de expiração, até7/14dias. Prestígio opcional reinicia somente a ficção descrita na prévia; estudo/fontes/XP/inventário/skins/histórico ficam preservados. Ganho disponível pela regra antiga também é conservado.

## Consequências e limites

Catálogo inicial16 famílias,265 melhorias do ciclo e40 permanentes;264 conquistas normais e20 secretas. Conteúdo futuro usa o contrato comum de atividades e condições, mas não anunciamos missões/coleções/platinums operantes. Renderização representa marcos, sem objeto por unidade. Simulador compara estratégias de ROI e estudo; não substitui avaliação humana ao longo de semanas, nem valida toda a economia de meses. Relógio/banco são locais, sem antifraude remoto. Não foi criada monetização, notificação ou recompensa com prazo obrigatório durante estudo.

Fórmulas, extensão, migração e resultados: [arquitetura econômica](../architecture/economy.md), [balanceamento](../decisions/deep-production-balance.md), [provas](../validation/DEEP_PRODUCTION.md).
