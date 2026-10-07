# DOC-01 — Apresentação do README

07/10/2026, Windows11, branch codex/readme-showcase criada de main/c95aabd, árvore inicialmente limpa. Alteração exclusivamente documental. README reúne funcionalidades integradas e identifica IA externa como implementada/validada no PR13 ainda aberto, sem trazê-la silenciosamente para main.

## Verificações executadas

| Verificação | Resultado |
| --- | --- |
| Conteúdo vs código/package.json/evidências/main | Aprovado:16famílias/305melhorias incluindo permanentes/284conquistas, quatro temas/até quatro painéis/36etapas, scripts e versões atuais |
| Recursos e GFM público | Aprovado:9badges Shields.io e2prints externos retornam200/image;8prints locais e14destinos HTML existem;19imagens com alt,12tabelas e3blocos Mermaid; API Markdown GitHub200 |
| Âncoras | Cinco links correspondem aos títulos; navegação real no GitHub ainda pendente |
| Renderização no navegador | Edge154.0.4258.62 headless abre repositório público; README atualizado/Mermaid/viewport ainda pendentes |
| Bootstrap | Aprovado:26tickets/170critérios/119Markdown/504links antes deste relatório; não testa o app |
| Diff | git diff --check aprovado |

Comandos locais realmente executados com Node24/Python do runtime, sem mudança global:

```text
python -X utf8 .local/check-readme-resources.py
node24 node_modules/tsx/dist/cli.mjs .local/check-readme-content.ts
node24 .local/check-readme-browser.mjs
node24 scripts/check-bootstrap.mjs
git diff --check
```

Os verificadores temporários e HTML/resultados ficam em .local, ignorados. A checagem de recursos usa HTMLParser/HEAD/API GFM, sem baixar imagens para contornar restrições. Capturas do app reutilizam provas reais já versionadas; não são imagens geradas ou um novo teste do aplicativo. API GFM não substitui prova do Mermaid no navegador.

## Compatibilidade e fontes

GitHub remove estilos CSS inline e atributos class/id da entrada: [pipeline oficial](https://github.com/github/markup). README usa div align, tabelas, width/valign, legendas e details; os diagramas ficam em cercas Mermaid próprias conforme [documentação oficial](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams). Badges estáticos via [Shields.io](https://shields.io/badges), sem anunciar CI inexistente. A [API oficial GFM](https://docs.github.com/en/rest/markdown/markdown?apiVersion=2022-11-28) conferiu a primeira conversão/sanitização.

Falhas dos verificadores foram corrigidas: regex inicial confundia query style= do badge com atributo HTML; API GFM não fornece as âncoras enriquecidas da página e muda table para table role. Nenhuma alteração no produto para contornar essas diferenças. O primeiro bootstrap com ticket recém-criado apontou retomada/validação ainda não cadastradas; cadastro completo passou.

## Retomada

C1/C2 aprovados parcialmente pelos checks descritos; C3/C4 aguardam apresentação real, checkpoint Git e conferência final. Nenhum build/teste funcional repetido: não há fonte/dependência/lockfile alterado. Próxima ação: push da proposta documental, conferir a página real e corrigir apresentação antes de encerrar o ticket.
