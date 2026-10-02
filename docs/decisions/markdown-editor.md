# Prova do editor Markdown

Estado: ALP-02 parcial, 02/10/2026. Escolhido CodeMirror 6 com prévia React Markdown e botões de formatação para o MVP enxuto. Edição assistida de fonte, não WYSIWYG. O texto original é a representação de trabalho; nenhum ciclo parse/serialize participa do salvamento.

| Elemento | Resultado |
| --- | --- |
| Título e parágrafos | Conservados; toolbar e prévia |
| Listas e checklist | Conservados; toolbar e prévia GFM |
| Link relativo e wikilink | Conservados na fonte; navegação não ativa neste MVP |
| Tabela | Conservada; toolbar e prévia GFM |
| Código | Conservado; toolbar e prévia |
| Fórmula | Conservada na fonte; tipografia matemática ainda não adicionada |
| Frontmatter desconhecido | Conservado e omitido apenas na prévia |
| Edição seletiva sem perda | Teste executado preserva todos os outros bytes da fixture LF |
| Abertura em editor externo | Não verificado |

Tiptap 3.31.4 + StarterKit + Markdown foi instalado como dependência de desenvolvimento para uma prova reproduzível: `npx tsx scripts/probe-tiptap.ts`. A configuração básica perdeu `custom_unknown`, comentário e custom-element. Fórmula textual sobreviveu. Isso não declara que todas as configurações/extensões de Tiptap falham; uma integração completa exige trabalho adicional, dispensável para o MVP enxuto. [Documentação oficial](https://tiptap.dev/docs/editor/markdown) ainda identifica Markdown como beta.

Fixture: tests/fixtures/compatibility.md, referência fictícia reference.md. Saída observada do candidato: .local/evidence/tiptap-roundtrip.md. Editor real exercitado em Electron por scripts/smoke-editor.mjs: preenchimento integral e botão Negrito conservaram frontmatter, fórmula e bloco desconhecido; captura e saída em .local/evidence. HTML da nota não é executado; imagem remota não carrega; links da prévia são texto. A fonte continua acessível para elementos que a prévia não interpreta.

Prova em editor externo não executada; C5 continua não verificado. Abertura/salvamento no vault e reinicialização serão comprovados em ALP-04. Lockfile registra versões exatas do CodeMirror e demais bibliotecas.
