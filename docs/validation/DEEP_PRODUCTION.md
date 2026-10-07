# GAM-04 — Provas da Produção profunda

07/10/2026. Windows11 10.0.26200 x64, Node24.19.0 executado diretamente do runtime local, Electron44.5.1, electron-builder26.15.3. Branch codex/deep-production criada de main/b112df6, PR10 já integrado. Fixtures explicitamente isoladas em .local; nenhum perfil pessoal usado.

## Verificações executadas

| Verificação | Resultado efetivo |
| --- | --- |
| `tsx --test tests/*.test.ts` em Node24 |52 aprovados,0 falhas,0 skipped;7043,7575ms na execução final |
| `tsc --noEmit` | Aprovado; repetido após ajuste dos scripts de captura |
| `node scripts/build.mjs` | Aprovado;452 módulos Vite, warning existente de chunks>500KB |
| `node node_modules/electron-builder/cli.js --win --dir` | Aprovado, pacote Windows x64 real; sem assinatura/release |
| Conferência dist→app.asar |201 arquivos idênticos byte a byte no pacote final |
| `tsx scripts/smoke-deep-economy.ts --packaged` | Aprovado no mesmo pacote: UI/IPC/SQLite,1min de Foco real, compras10/100/MAX, sinais, combo, prestígio/permanente/restart |
| `tsx scripts/smoke-deep-economy.ts --packaged --visual-only` | Aprovado; aguarda skin do canvas já renderizado nas três variantes;103 objetos e movimento reduzido |
| `tsx scripts/smoke-clean-workspace.ts` | Aprovado no mesmo pacote: três áreas/larguras, draft/foco/PDF/restart,61cliques e40 ao fechar, grafo/redução, duas Oficinas36 |
| `tsx scripts/smoke-journey.ts` | R1–R7 aprovados no mesmo pacote; fontes/conflitos/checklist/retomada preservados |
| `tsx scripts/simulate-economy.ts 30`,45,60 | Três modelos determinísticos finais concluídos; alvo inicial3–7dias aprovado no modelo |

Os comandos acima foram invocados pelo executável explícito Node24 com `node_modules/tsx/dist/cli.mjs`/`typescript/lib/tsc.js` quando aplicável. npm.ps1 do host invoca Node26 apesar do PATH; não foi mudado globalmente. A instalação pontual de decimal.js10.6.0 avisou desse desvio, e as verificações/empacotamento finais usaram Node24 direto. Lockfile mudou somente a declaração de dependência direta já presente transitivamente.

Pacote final: EXE SHA256 `f3747cfc06cad5486461cfe718673d0a1a736ff393e00247828177c63638f18e`; ASAR SHA256 `a6a622d886df70acc38e5f89d64049ce1bb654564a8a847e5cda12458d2eb415`. Manifesto completo fica em `.local/evidence/deep-package.json`; executável/banco/vault não são versionados.

## O que os testes comprovam

Fatia de quatro famílias validada antes de expandir;17ª família genérica, lotes telescópicos e MAX na fronteira. Compra100/MAX real em SQLite, preço autoritativo/desconto, replay/insuficiência e audit rollback. Índice/sinergia/evento compõem taxa; saldo acima de Number soma1 sem perder unidade. Schema5→6 conserva IDs, XP, ledger/regra antiga e direito de prestígio; backups/restore com schema validado permanecem cobertos pela suíte.

Foco monotônico exclui pausa/app fechado. Revisão devida tem elegibilidade/recibo único, revisão antecipada não rende novamente. Falha do audit econômico conserva revisão acadêmica; retry credita uma vez. Histórico anterior vira baseline. Minigames salvos antigos mantêm recompensa; motor informa ganho parcial real e continua cliques/XP após orçamento diário.

Sinais ficam guardados durante Foco. Ativação/replay/cache são únicos; dois tipos fazem combo, duplicado continua guardado. Expiração divide a taxa offline corretamente; ausência20dias credita até7, guarda até24sinais, reinício conserva tudo. Teste com relógio avançando entre chamadas comprova contagem de retorno e que fração de milissegundo não indica cap.

Prestígio confere prévia/ciclo/ganho, rejeita obsoleto, pode ser cancelado, faz rollback em falha real e conserva fontes/drafts/XP/build/cultivos/skins/achievements. A UI empacotada confirmou reset, compra de Ferramentas herdadas e reinício. Captura adicional após reinício verifica saldo0/Foco1min/permanente; não é seed do reset.

Oficina real final: QTE6816ms e calibração31545ms com entradas automáticas no relógio do main,36/36 etapas cada. Isso comprova fluxo contínuo/ritmo, **não duração humana**. Grafo oculto/reduzido fica sem movimento;61cliques consecutivos e40pendentes ao fechar são conservados. Journey verificou edição externa e conflito sem perda.

## Capturas e rastreabilidade

[Galeria versionada](../evidence/gam-04/README.md): capturas do executável real,1440×1000 e1040×760. Perfil avançado de demonstração recebe saldo/lifetime e instalações pelo serviço real; timestamp é preparado para exercitar retorno. Esses valores não representam progresso humano nem saldo de usuário. A sessão de Foco de1min, compras, eventos, reset/permanente e reinício passam pelos fluxos reais. Imagens foram inspecionadas; não há vault pessoal, caminho privado ou token nelas. Mostradas no chat e incluídas no PR conforme pedido.

JSONs de checks completos com diretórios de fixture ficam ignorados. Versões sanitizadas dos resultados/modelos ficam na galeria. Uma primeira prova revelou O-019/distrito oculto em skin e O-020/resumo de retorno; ambos corrigidos e reconferidos. O roteiro de captura também foi corrigido para aguardar animação do diálogo e o frame da skin, em vez de capturar a transição anterior.

## Limites e entrega

Primeiro prestígio no modelo:30min/dia=5,15dias;45=4,30;60=4,10. [Relatório](../decisions/deep-production-balance.md) inclui checkpoints e ROI marginal. Não mede diversão humana nem equilíbrio de meses/endgame; revisão/família/evento/build/minigame podem mudar o tempo. Missões semanais/coleções/platinums ficam preparados pelo contrato comum, sem afirmar implementação.

Não foram repetidos todos os roteiros históricos com seletores antigos. Nesta versão, o roteiro canônico econômico é test:deep-economy; suite de integração, clean-workspace e Journey foram executados. YouTube/rede não foi alterado nem revalidado nesta tarefa. Nuvem/celular continuam pendentes na alpha; nenhum serviço, release, merge ou assinatura foi publicado.

C1–C8 aprovados. Bootstrap23tickets/157critérios/113Markdown/483links, diff/stage seletivo/Gitleaks326,60KB sem achados. Commit6d20ce7 enviado com upstream para origin/codex/deep-production; [PR #11](https://github.com/rafafrd/Nodus/pull/11) aberto/draft=false/base main/head conferido, corpo exato com3Mermaid/6badges/12prints. Imagem publicada retorna200/image/png; PR anexado ao chat. Checkpoint documental de fechamento preserva as fontes do pacote; próxima ação é revisão pelo mantenedor.
