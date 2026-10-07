# Quadro de tarefas

Incremento atual: [UI-05 — Abas e grade de estudo](done/UI-05.md), concluído na branch codex/study-tabs com GAM-04 preservado. [Validação Windows](../validation/STUDY_TABS.md).

Execução local da alpha iniciada em 02/10/2026; consulte os tickets e as evidências. Os diretórios são todo, doing e done; use os nomes exatos. Cada ID tem um único arquivo no quadro.

## Regra de movimentação

| Pasta | status no frontmatter | outcome permitido | Significado |
| --- | --- | --- | --- |
| todo | todo | a_fazer | Ainda não iniciada |
| doing | doing | em_andamento, bloqueado ou parcial | Trabalho ativo ou com critérios pendentes |
| done | done | concluido | Todos os critérios aprovados com evidência |

Ao começar, mova o ticket para doing, altere status/outcome, atualize esta tabela de links e docs/status/ALPHA_STATE.md. Ao terminar parcialmente, mantenha doing e registre a continuação. Ao concluir, registre cada critério aprovado em docs/validation/ALPHA.md, mova para done, ajuste links e retomada. Execute node scripts/check-bootstrap.mjs.

Exemplo de início no PowerShell, a executar pelo agente na tarefa autorizada:

```powershell
Move-Item .\docs\tasks\todo\ALP-01.md .\docs\tasks\doing\ALP-01.md
```

O comando move o arquivo; editar frontmatter/links/retomada faz parte da mesma alteração. A conclusão depende da evidência, não do fim do tempo reservado.

## Tickets

Último incremento: [GAM-04 — Produção profunda do observatório](done/GAM-04.md), concluído na branch codex/deep-production. Motor declarativo/estudo conectado/catálogo/legado;52testes/provas Windows/modelos/capturas aprovados. Commit6d20ce7 enviado e [PR #11](https://github.com/rafafrd/Nodus/pull/11) aberto para main com prints/Mermaid/badges; próxima ação é revisão.

| Ticket | Entrega | Dependências | Arquivo |
| --- | --- | --- | --- |
| ALP-01 | Fundação executável no Windows | — | [Abrir](done/ALP-01.md) |
| ALP-02 | Prova de compatibilidade do editor Markdown | ALP-01 | [Abrir](doing/ALP-02.md) |
| ALP-03 | Contratos e persistência local mínima | ALP-01 | [Abrir](done/ALP-03.md) |
| ALP-04 | Vault e salvar/reabrir notas | ALP-02, ALP-03 | [Abrir](done/ALP-04.md) |
| ALP-05 | Mesa persistente por matéria | ALP-04 | [Abrir](done/ALP-05.md) |
| ALP-06 | Leitor PDF com retomada | ALP-05 | [Abrir](done/ALP-06.md) |
| ALP-07 | Foco com pausa e estado persistente | ALP-05 | [Abrir](done/ALP-07.md) |
| ALP-08 | Checklist persistente por matéria | ALP-05 | [Abrir](done/ALP-08.md) |
| ALP-09 | Primeiro espelho autenticado na nuvem | ALP-04 | [Abrir](todo/ALP-09.md) |
| ALP-10 | Verificação do fluxo completo e recuperação | ALP-06, ALP-07, ALP-08, ALP-09 | [Abrir](doing/ALP-10.md) |
| ALP-11 | Setup, decisões e retomada | ALP-01 | [Abrir](done/ALP-11.md) |

ALP-01 a ALP-10 seguem a sequência. ALP-11 consolida documentação e pode ser repetido após ALP-04 e no fim da alpha. Todos os tickets atualizam documentação durante a execução; ALP-11 não aprova automaticamente recursos pendentes.

Incremento anterior: [GAM-02 — motor, desafios e Explorer](done/GAM-02.md), concluído na branch feat/engine-explorer. Navegação/edição local, provas Windows, revisão documental e auditoria registradas; commits por fase enviados ao origin.

Incremento anterior: [UI-02 — refinamento e transições suaves](done/UI-02.md), concluído na branch codex/smooth-ui. Oito sugestões aplicadas, transições normais/reduzidas e dados/contexto preservados; [provas Windows](../validation/SMOOTH_UI.md), audit, commits/push e guia registrados.

Incremento anterior: [MED-01 — YouTube, cinema e PiP](done/MED-01.md), concluído na branch codex/youtube-cinema. C1–C7 aprovados com player oficial/rede real, pacote/jornadas Windows e auditoria; commits por fase/push e guia registrados.

Incremento anterior: [CFG-01 — configurações, aparência e perfil](done/CFG-01.md), concluído na branch codex/settings-profile. C1–C6 aprovados com preferências/foto/temas/movimento/gestão, pacote/jornadas Windows, auditoria e commits/push registrados.

Último incremento: [EXP-01 — exportar pasta em PDF escuro](done/EXP-01.md), concluído na branch codex/pdf-export. C1–C6 aprovados com caderno A4 preto de Markdown salvo, pacote/jornadas Windows/renderização, auditoria e commits/push registrados.

## Conteúdo de um ticket

Último incremento: [UI-03 — dashboard editorial e tema original](done/UI-03.md), concluído na branch local codex/editorial-dashboard, conforme referência e pedido de 06/10/2026. Tema anterior preservado em Oliva, classificação de projetos persistida, provas/capturas Windows em [EDITORIAL_DESIGN](../validation/EDITORIAL_DESIGN.md). Alterações locais salvas, sem commit/push/publicação.

Último incremento: [NXT-01 — estudo, revisão e conhecimento](done/NXT-01.md), concluído na branch codex/study-expansion. Nove sugestões entregues com provas Windows, auditoria, commits e push; fases/limites no ticket.

Incremento solicitado após o MVP: [UI-01 — refinamento do frontend](done/UI-01.md), concluído na branch feat/frontend. Ele preserva a situação dos critérios da alpha.

Incremento solicitado após UI-01: [GAM-01 — cidade, farm, grind e loja](done/GAM-01.md), concluído na branch feat/game. Economia local e visual 3D; escopo/evidência próprios. [Guia de uso](../GUIA_DE_USO.md) cobre executável, desenvolvimento, estudos e jogo.

Frontmatter, objetivo, dependências, prompt completo com critérios e verificações, registro de execução e referência de evidência. Use [o template](TEMPLATE.md) para novos tickets. Um prompt preparado não é uma tarefa entregue.

## Fonte e evolução

Os tickets foram extraídos do pacote original em docs/planning. Use o arquivo do quadro para executar e atualizar. O pacote original é histórico e não precisa acompanhar cada movimentação. Alteração material de escopo deve ser registrada, respeitando requisitos escolhidos pelo usuário.

Último incremento: [GAM-03 — janela própria, skins e progressão](done/GAM-03.md), concluído após escolhas explícitas do usuário, com UI-03 preservado. Produção/prestígio, duas skins completas e partidas reais de 140s/159s, pacote/regressões/capturas Windows em [CITY_PROGRESSION](../validation/CITY_PROGRESSION.md). Alterações locais, sem commit/push/publicação.

Último incremento: [UI-04 — ritmo contínuo e espaço de trabalho limpo](done/UI-04.md), concluído conforme escolhas do usuário: um módulo padrão, até três áreas/PDF/Vídeo ajustáveis e foco/checklist suspensos. Branch codex/clean-workspace; UI-03/GAM-03 preservados. [Provas e capturas Windows](../validation/CLEAN_WORKSPACE.md), C1–C8 aprovados, sem commit/push/publicação.
