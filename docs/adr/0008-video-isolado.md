# ADR-0008 — YouTube isolado, cinema e PiP interno

03/10/2026. Aceita para MED-01 local. Pedido: salvar vídeos por matéria e assistir em cinema/PiP, mantendo a mesa e os arquivos preservados.

## Decisão

SQLite v4 adiciona videos e seleção/tipo de material na mesa, em migração transacional sem reconstruir dados. Cada link tem UUID e associação à matéria; ID YouTube e tempo inicial são normalizados no main, com unicidade matéria/vídeo. Salvar não busca metadados nem inicia rede. Título é informado pelo usuário, com fallback identificado pelo ID. Nota Markdown e PDF não mudam de autoridade. Remover limpa seleção e link na mesma transação com audit; não remove material remoto.

Usar um WebContentsView no main, sem preload/Node, sandbox/contextIsolation/webSecurity ativos, sessão efêmera diferente da sessão do app. Não habilitar iframe/webview/conteúdo remoto no renderer privilegiado: CSP frame-src none continua intacta. Novos canais específicos validam remetente/mainFrame/URL e Zod; o guest não recebe a bridge. A URL remota é construída apenas de ID/tempo validados, nunca carregada do texto bruto colado.

O player oficial usa youtube-nocookie, controles/branding originais e nenhuma reprodução automática. Referer/origin identificam o app por local.appestudos.desktop, coerente com o appId de build. Esta identidade local foi aceita na prova de reprodução; distribuição pública ainda precisa conferir identidade do pacote/instalação, sem inferir publicação ou compliance a partir do teste. Referência: [identificação de clientes YouTube](https://developers.google.com/youtube/terms/required-minimum-functionality).

Sessão nega permissões, downloads e popups. Navegação da página principal é negada; frames/requests HTTPS têm allowlist de domínios YouTube/Google/CDN/publicidade. Não interceptar nem remover publicidade/controles do player. disable_non_proxied_udp limita WebRTC segundo a [API Electron](https://www.electronjs.org/docs/latest/api/web-contents#contentssetwebrtciphandlingpolicypolicy); allowlist de URL não é prova universal de contenção de toda rede. Domínios externos permitidos continuam uma superfície remota não confiável.

## Apresentação e consequências

Um único guest conserva reprodução entre mesa/cinema/PiP. A UI envia somente bounds inteiros/visibilidade, limitados à janela no main. A área de vídeo nunca fica abaixo de 200×200; controles próprios estão fora do viewport. GSAP interpola o contêiner em 480ms, com retarget e preferência de movimento reduzido dinâmica. Acompanhar o slot durante o movimento de painéis evita desalinhamento de uma view nativa, que não herda transforms/clipping CSS.

Cinema escurece a mesa e limita interação ao player; inert é complementado pelos gates de teclado/polling/RAF de Cidade/Explorer. Escape recebido no guest é encaminhado ao app. PiP é flutuante dentro desta janela, arrastável pelo cabeçalho ou setas/Shift/Home, contido no resize. Troca de área/matéria/PDF, só caderno ou clipping da biblioteca promove um vídeo inline para PiP. O nome da matéria de origem continua visível. Voltar à mesa seleciona a matéria do vídeo sem recarregar o guest.

Diálogos escondem a view nativa para conservar acesso aos controles do app. Fechar player destrói o guest e para reprodução; mantém o link. Reiniciar conserva a lista/seleção, mas exige abrir o player e acionar Play novamente. Internet, disponibilidade/região/idade e permissão de incorporação pertencem ao YouTube; não baixar conteúdo, contornar restrições ou declarar todos os links reproduzíveis.

## Alternativas e validação

Iframe dentro da UI principal exigiria ampliar sua CSP e misturaria conteúdo remoto com uma superfície privilegiada; foi descartado. Nova janela para cada modo reiniciaria reprodução/contexto; PiP nativo do sistema não oferece o encaixe no fluxo da mesa pedido neste incremento. Não criar servidor local ou chave de YouTube para salvar referências.

[Prova Windows](../validation/YOUTUBE.md) e [audit independente](../security/YOUTUBE_AUDIT.md) têm escopos/identidades próprios. Aceitar a ADR não aprova critérios pendentes nem distribuição pública.
