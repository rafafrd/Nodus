# PDF local

02/10/2026 — ALP-06. PDF.js 6.3.289 renderiza em canvas no renderer sandboxed; worker URL emitida por Vite, CMaps e fontes padrão copiadas da dependência para assets estáticos e empacotadas. WebAssembly desativado para conservar CSP sem unsafe-eval; XFA não habilitado. HTML/ações/links do PDF não recebem execução ou navegação. Esta versão removeu a antiga opção isEvalSupported; o código instalado foi conferido, sem eval/Function dinâmico nesse caminho.

Preload recebe somente leitura por materialId. Main autoriza o arquivo específico escolhido no diálogo, verifica caminho canônico, tipo regular, tamanho de até 100 MiB e cabeçalho PDF, faz leitura limitada e identifica arquivo ausente/inválido. Não expõe caminho de leitura arbitrário. Relocalizar conserva ID e associação. PDFs não entram em nenhum snapshot. Página 1-based é persistida na mesa; UI valida limites reais do documento. Canvas limita escala, altura e DPR, com texto da página disponível para tecnologia assistiva.

Provas executadas com PDFs fictícios de três páginas, gerados por scripts/test-fixture.ts: navegar, trocar duas matérias, fechar/reabrir, ausente, relocalização e conteúdo inválido. Leitor executado tanto na build local quanto no executável Windows empacotado, com worker e fontes reais. Saídas em .local/evidence/pdf-dev.png e pdf-packaged.png.

Limites: sem OCR, anotação avançada ou entrada de senha; PDF protegido produz estado explícito. Imagens/encodings que exigem recursos de PDF.js desativados podem falhar com erro de renderização. Não foram exercitados todos os formatos PDF. [API oficial](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html).
