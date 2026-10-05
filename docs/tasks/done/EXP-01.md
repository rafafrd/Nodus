---
id: EXP-01
status: done
outcome: concluido
depends_on: ["ALP-04","CFG-01"]
criteria_count: 6
---

# EXP-01 — Exportar pasta de notas em PDF escuro

Pedido: reunir uma pasta em PDF formatado, com fundo preto. Branch codex/pdf-export parte de6897adb; autorização vigente de commits por fase/push final. Escopo: arquivos Markdown salvos de vault/projetos registrados, pasta/subpastas, capa/sumário, leitura offline. Não é backup nem conversão de arquivos de código/PDF/imagens.

C1. Origem/pasta selecionáveis em Ajustes, dados de vault/projetos reais; main revalida raiz/subpasta e nega caminhos arbitrários, links/junctions e metadados/auxiliares.
C2. Markdown formatado com títulos/listas/tabelas/código e Unicode; frontmatter oculto na cópia, fonte/rascunhos intactos. Conteúdo HTML/remoto não ganha execução/rede.
C3. PDF A4 real com capa/sumário/notas/paginação, fundo preto e contraste legível em todas as páginas; páginas renderizadas/inspecionadas.
C4. Download local com nome único/sem sobrescrita, erros preservam fontes; limites de bytes/itens/notas/profundidade/geração, guard de operação e recursos isolados limpos.
C5. UI comunica origem/arquivos salvos/destino/estado/erros, mantém demais áreas e configurações; jornada empacotada real sem mock de IPC/FS/geração.
C6. Testes pertinentes/typecheck/pacote Windows/audit independente, docs/guia/memória/evidências, Gitleaks/commits/push e quadro registrados com limites.

## Encerramento e retomada

C1–C6 aprovados em [PDF_EXPORT](../../validation/PDF_EXPORT.md) e [ALPHA](../../validation/ALPHA.md):28 testes/typecheck/package/export/Settings/Journey passaram no Windows, PDFs3/13 páginas renderizados/inspecionados. [Audit independente](../../security/PDF_EXPORT_AUDIT.md) APPROVE WITH MITIGATIONS, Low/O-012 corrigido com trigger SQLite/FS real; nenhuma vulnerabilidade nova confirmada aberta. Advisory High existente de tooling permanece avaliado.

Core fef5821/UI38651b4/docs-audit32eb884 enviados ao origin/codex/pdf-export, push exit0/upstream configurado em03/10/2026. Scans staged core/UI/documental (24arquivos/46,52KB) sem achados, incluindo fixtures/testes/scripts/docs/memória; bootstrap/inventário/links aprovados. Movimentação/quadro ficam em checkpoint documental de encerramento. PDF Skill usada na revisão; dependências existentes ReactMarkdown/GFM/Electron, sem biblioteca/migration nova. Downloads é destino fixo; apenas Markdown salvo entra. Nenhuma implementação restante neste ticket; próxima ação humana: exportar sua pasta conforme o guia. Limites/ausência de atomicidade FS/SQLite e alpha externa pendente preservados na validação; nenhum serviço/release publicado.
