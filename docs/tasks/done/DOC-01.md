---
id: DOC-01
status: done
outcome: concluido
depends_on: ["UI-06", "GAM-04"]
criteria_count: 4
---

# DOC-01 — README atual e demonstrações para main

## Objetivo e dependências

Atualizar README.md com funcionalidades reais da main, capturas demonstrativas, Mermaid, badges Shields.io, divs/tabelas compatíveis com a renderização do GitHub. Branch codex/readme-showcase criada de origin/main/c95aabd, árvore inicialmente limpa. Preservar o PR13 e apresentar IA externa como em revisão enquanto não integrado. Sem alterar fontes, dependências ou dados pessoais.

## Prompt e critérios

C1. Apresentação clara das funcionalidades integradas, limites e estado da IA externa conferidos no código/remote/evidências.
C2. Galeria reutiliza capturas reais de fixtures, com legendas, alt, links válidos e proveniência; dados pessoais ficam fora.
C3. Divs/tabelas, badges e três diagramas Mermaid renderizam; navegação e links são conferidos na apresentação do GitHub.
C4. Guia inicial/scripts/stack consistentes com package.json; bootstrap/diff/verificações documentados e entrega Git para main sem misturar código do PR13.

## Execução e retomada

07/10/2026, Windows nativo. README reorganizado, capturas existentes inspecionadas e APIs/regras oficiais de GitHub/Shields conferidas. O GitHub remove CSS inline/class/id; a composição usa atributos permitidos, HTML e Markdown com respiro entre blocos. C1–C4 aprovados:10prints/9badges/12tabelas/3Mermaid, recursos200/alt,5âncoras reais/1440×1000/430×932/claro-escuro. Código confirma16/305/284 e scripts/stack; [provas](../../validation/README_SHOWCASE.md). Commits e6d7e18/ff11163 enviados, stages40,71KB/17,92KB sem segredos; [PR #14](https://github.com/rafafrd/Nodus/pull/14) aberto para main/draft=false e anexado ao chat. Diff exclusivamente documental, sem código do PR13. Nenhuma implementação restante; próxima ação humana: revisar/integrar PR14. IA externa conserva o status de PR13 em revisão.
