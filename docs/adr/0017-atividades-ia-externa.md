# ADR-0017 — Intercâmbio manual de atividades com IA externa

Data:07/10/2026. Estado: aceita para IA-01.

## Contexto

O usuário quer gerar quiz/flashcards em qualquer IA escolhida por ele, sem chaves ou chamadas do aplicativo, e concluir a jornada com prática real. Notas, PDFs locais, momentos de vídeo, revisão e SQLite já existem; quiz e extração de texto PDF para pacote são incrementos necessários.

## Decisão

Contrato estrito/versionado em Zod4, com tipos e JSON Schema gerados da mesma definição. Parser limitado preserva evidência de propriedades duplicadas antes da validação. Regras de identidade/quantidade/referências são repetidas no gravador. A matéria vem do pedido local; IDs do JSON não autorizam acesso.

Pacote JSON de seleção explícita, sem CLI Repomix: conteúdo completo, hashes e blocos/localizações estáveis. PDF.js existente extrai em BrowserWindow efêmera isolada, sem preload/Node/IPC privilegiado; sessão só serve assets próprios e nega rede/permissões/navegação. Nenhum exemplo do material é executado.

SQLite7 adiciona snapshots, pedidos, atividades, vínculos de cartões e tentativas. Request/hash canônico fornece idempotência; novo payload cria revisão imutável. A transação inclui cartões e audit, sem disponibilizar atividade parcial. Cartões reutilizam Study.review; quiz mantém escolhas/versão/tentativa e expõe gabarito somente ao finalizar.

Clipboard Windows é aguardado e conferido antes de confirmar sucesso. Colagem/arquivo passam pelo mesmo serviço. Erros conservam original/relatório e produzem pedido de correção manual com orçamento explícito. Não há heurística semântica, correção paga ou envio automático.

## Consequências

Pedidos podem ser retomados depois de fechar o app, com o contexto exportado conservado mesmo se a fonte mudar. Backups aceitam versões5/6/7 e incluem as tabelas novas. Renderização é texto React inerte. Validação prova estrutura e referências existentes, sem certificar qualidade acadêmica. Provedor, custos e privacidade ao colar ficam sob escolha do usuário. Sem dependência nova/alteração de chaves; IA integrada/nuvem continuam fora deste incremento.

Ver [contrato](../contracts/study-activity-v1.md), [fluxo](../features/atividades-ia-externa.md) e [provas](../validation/atividades-ia-externa.md).
