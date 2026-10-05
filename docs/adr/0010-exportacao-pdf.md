# ADR-0010 — Pasta Markdown em PDF escuro

Estado: aceita para EXP-01, 03/10/2026.

O usuário pediu exportar uma pasta em PDF formatado com fundo preto. O incremento reúne arquivos Markdown salvos do vault ou de projetos cadastrados no Explorer, incluindo subpastas, em um caderno de leitura. Não modifica fontes nem inclui rascunhos, arquivos de código, imagens ou PDFs anexados.

Dois IPCs específicos recebem origem discriminada vault/projectId e, na exportação, subpasta relativa. Main verifica sender/frame/URL, schema strict, vínculo com raiz registrada e contenção canônica; nega links/junctions, volume, .git e pastas ocultas/auxiliares. Coleta limitada: 200 notas, 2 MiB por nota, 6 MiB total, 4.000 entradas, 16 níveis; descritor limitado, UTF-8 fatal e revalidação de identidade/size/mtime. A coleta não constitui snapshot atômico de uma pasta inteira com editores concorrentes.

ReactMarkdown/remarkGfm existentes renderizam HTML estático no main. Frontmatter é ocultado apenas na cópia; HTML é ignorado, imagens viram rótulos e links externos viram texto. Capa/sumário interno, cada nota em página nova, tabelas/código quebráveis e contador CSS de página formam o documento. @page A4 com fundo preto, printBackground e print-color-adjust conservam preto nas margens.

BrowserWindow oculto usa sessão efêmera própria e protocolo nodus-pdf só nessa sessão. Sem preload/Node/JavaScript/webview, com sandbox/contextIsolation/webSecurity, CSP restritiva e requests diferentes da URL interna negados. Permissões/popups/downloads/navegação negados; timeout de 60s cobre load/print, com limpeza da janela/protocolo/storage. Não é orçamento universal de CPU/memória nem timeout do parse/SSR anterior. Electron [printToPDF](https://www.electronjs.org/docs/latest/api/web-contents#contentsprinttopdfoptions) gera bytes reais A4, tagged/outline; retorno limitado a32MiB.

Saída vai para Downloads efetivo do Electron, com nome sanitizado/UUID e open wx, fsync/close antes de confirmar. Audit de sucesso contém somente UUID opaco/action/outcome. Falha de escrita/audit remove somente a saída nova e retorna erro; fontes/exports anteriores conservados. FS/SQLite não compartilham transação: crash ou falha de remoção continuam limites; não prometer atomicidade conjunta. Sem histórico/lista persistente de exports, migration/reset ou dependência nova.

Alternativas: biblioteca PDF nova duplicaria o motor já disponível; reaproveitar janela privilegiada de estudos ampliaria a superfície de conteúdo; aceitar caminho arbitrário pelo renderer romperia a fronteira existente. Destino fixo em Downloads reduz passos e evita um seletor adicional. Visual sempre preto é independente do tema da interface. Evidências efetivas em [PDF_EXPORT](../validation/PDF_EXPORT.md).
