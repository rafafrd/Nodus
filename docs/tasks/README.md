# Quadro de tarefas

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

Último incremento: [CFG-01 — configurações, aparência e perfil](done/CFG-01.md), concluído na branch codex/settings-profile. C1–C6 aprovados com preferências/foto/temas/movimento/gestão, pacote/jornadas Windows, auditoria e commits/push registrados.

## Conteúdo de um ticket

Incremento ativo: [EXP-01 — exportar pasta em PDF escuro](doing/EXP-01.md), branch codex/pdf-export.

Incremento solicitado após o MVP: [UI-01 — refinamento do frontend](done/UI-01.md), concluído na branch feat/frontend. Ele preserva a situação dos critérios da alpha.

Incremento solicitado após UI-01: [GAM-01 — cidade, farm, grind e loja](done/GAM-01.md), concluído na branch feat/game. Economia local e visual 3D; escopo/evidência próprios. [Guia de uso](../GUIA_DE_USO.md) cobre executável, desenvolvimento, estudos e jogo.

Frontmatter, objetivo, dependências, prompt completo com critérios e verificações, registro de execução e referência de evidência. Use [o template](TEMPLATE.md) para novos tickets. Um prompt preparado não é uma tarefa entregue.

## Fonte e evolução

Os tickets foram extraídos do pacote original em docs/planning. Use o arquivo do quadro para executar e atualizar. O pacote original é histórico e não precisa acompanhar cada movimentação. Alteração material de escopo deve ser registrada, respeitando requisitos escolhidos pelo usuário.
