# Architectural Decision Records

Uma ADR registra contexto, decisão, alternativas e consequências. Aceita significa direção escolhida, não recurso implementado. Proposta significa escolha ainda em avaliação. Substitua uma decisão por nova ADR com vínculo; mantenha o histórico.

| ADR | Assunto | Estado |
| --- | --- | --- |
| [0001](0001-ambiente-windows.md) | Windows nativo, Node 24 LTS e npm | Aceita para o bootstrap |
| [0002](0002-desktop-electron.md) | Electron, React e TypeScript | Aceita como direção de ALP-01 |
| [0003](0003-vault-e-persistencia.md) | Markdown canônico e SQLite local | Aceita como direção de ALP-02/03/04 |
| [0004](0004-snapshot-mobile.md) | Snapshot Supabase e consulta autenticada | Aceita como requisito de ALP-09; protocolo concreto pendente |
| [0005](0005-editor-markdown.md) | Editor assistido com prévia | Aceita para MVP; prova externa ALP-02 pendente |
| [0006](0006-execucao-por-ticket.md) | Um ticket por sessão e conclusão por evidência | Aceita para o bootstrap |
| [0007](0007-explorer-local.md) | Explorer/editor de fonte local, arquivos canônicos e recuperação | Aceita para GAM-02 |
| [0008](0008-video-isolado.md) | Links YouTube locais e player remoto isolado, cinema/PiP interno | Aceita para MED-01 |
| [0009](0009-preferencias-locais.md) | Preferências/perfil locais, foto normalizada e controle comum de movimento | Aceita para CFG-01 |
| [0010](0010-exportacao-pdf.md) | Pasta Markdown em caderno PDF preto, superfície isolada e saída local | Aceita para EXP-01 |
| [0011](0011-expansao-estudo-local.md) | Revisão, relações, anotações e snapshots locais restaurados separadamente | Aceita para NXT-01 |
| [0013](0013-cidade-progressiva-e-janela.md) | Janela própria, animação acessível e progressão incremental local | Aceita para GAM-03 |
| [0012](0012-tema-editorial.md) | Tema Editorial, apresentação anterior conservada e projetos principais/secundários | Aceita para UI-03 |

| [0014](0014-areas-isoladas.md) | Um módulo padrão, divisão opcional e ritmo contínuo | Aceita para UI-04 |
| [0015](0015-producao-declarativa.md) | Engine/conteúdo/configuração, números grandes e estudo conectado | Aceita para GAM-04 |

Use [o template](TEMPLATE.md) para novas decisões. O estado atual inclui o MVP local implementado; consulte validação. A prova específica do editor fica em docs/decisions/markdown-editor.md; critérios ficam nos tickets.
