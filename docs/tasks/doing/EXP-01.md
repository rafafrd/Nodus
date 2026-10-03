---
id: EXP-01
status: doing
outcome: em_andamento
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

## Plano e retomada

Coleta contida/limitada → template seguro de Markdown → printToPDF em superfície isolada → seleção na UI → PDF real/renderização/erros/regressões → audit/docs/checkpoints/push. C1–C5 aprovados em [PDF_EXPORT](../../validation/PDF_EXPORT.md) e [ALPHA](../../validation/ALPHA.md):28 testes/typecheck/package/export/Settings/Journey passaram no Windows, PDF3/13 páginas renderizado e inspecionado. Audit independente validou correção O-012 com trigger real; relatório em fechamento. Core fef5821 e UI38651b4 commitados após Gitleaks staged/seleção de arquivos. Sem push ainda.

Relatório independente encerrado em [PDF_EXPORT_AUDIT](../../security/PDF_EXPORT_AUDIT.md), APPROVE WITH MITIGATIONS; nenhuma vulnerabilidade nova confirmada aberta. Docs/memória conferidos, inventário83docs e bootstrap18tickets/115critérios/93Markdown/328links aprovados. Primeira ação restante: scan/commit documental, push e fechamento C6/quadro. PDF Skill usada na revisão; dependências existentes ReactMarkdown/GFM/Electron, sem biblioteca/migration nova. Downloads é destino fixo; apenas Markdown salvo entra. Limites/ausência de atomicidade FS/SQLite e alpha externa pendente preservados na validação.
