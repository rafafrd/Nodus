# Material de estudo — nodus.study-material/1

Contrato independente do JSON1.0 de provas/flashcards. Schema executável: src/shared/study-material.ts; domínio: src/main/study-materials.ts. Sem coerção e sem campos extras. O prompt contém o JSON Schema integral gerado pelo mesmo Zod usado na validação.

| Campo | Regra |
| --- | --- |
| schemaVersion | String literal nodus.study-material/1 |
| requestId / subjectId | UUIDs literais do pedido preparado pelo main e do destino |
| language | pt-BR |
| sources | 1–30 objetos `{id,name}`; IDs únicos s01–s30; nome em uma linha,1–160 caracteres |
| notes | 1–8 objetos completos; IDs únicos n01–n08 e títulos distintos normalizados |
| notes[].title | Título em uma linha,1–160 caracteres |
| notes[].markdown | Corpo Markdown,30–60.000 caracteres, sem frontmatter/nulos; o app acrescenta título e origem |
| notes[].sourceIds | 1–30 IDs existentes na lista sources, sem repetição |
| notes[].supplement | null ou descrição não vazia de até 2.000 caracteres dos complementos externos às fontes |

Parser compartilhado com IA-01: limite2 MiB UTF-8,20 níveis,100 elementos/lista,100 propriedades/objeto e5.000 valores; detecta chaves repetidas antes de JSON.parse. Aceita BOM e uma cerca JSON completa como conveniência; não aceita texto externo, comentários ou objetos concatenados. A estrutura validada é a mesma para colagem e arquivo UTF-8.

IPC específico, remetente principal autorizado e argumentos strict: `material-study:prepare/requests/request/response/validate/correction/copy/import`. Nenhum caminho de saída vem do JSON. UUIDs locais novos definem os arquivos, e o main resolve/valida os caminhos dentro do vault. Cópia aguarda o clipboard Windows e compara o texto retornado; erro não confirma sucesso. Resposta inválida pode permanecer como rascunho, nunca como notas importadas.

Um pedido produz um lote. O recibo usa hash canônico do payload validado; formatação, ordem das chaves e cercas não duplicam efeito. A resposta importada fica conservada; outro conteúdo no mesmo pedido é rejeitado, orientando um novo pedido. Edições e mudanças de matéria de uma nota não são revertidas por replay. O histórico mantém a associação do pedido original e abre os títulos atuais das notas.

Reserva persistente, planos internos e status pending/imported coordenam filesystem e SQLite. As notas e o status final/audit entram na mesma transação; falha reverte referências e compensa arquivos intactos criados pelo lote. Retry de reserva interrompida confere conteúdo e caminhos antes de remover órfãos. Arquivos modificados/links são preservados e bloqueiam recuperação destrutiva. Escrita usa criação exclusiva e fsync; não há garantia de transação única entre filesystem e SQLite em perda física de energia.

Fontes são nomes declarados pela IA, sem vínculo automático com PDFs/vídeos locais ou verificação de conteúdo do anexo. Não se fabricam IDs locais para elas. Cada arquivo recebe `study_id`, `study_subject`, `study_ai_request`, `study_ai_format`, corpo original e seção de fontes/complementos. Importação não concede XP, moedas, revisão ou domínio acadêmico.

Exemplo identificado como fixture: tests/fixtures/study-materials/study-material-v1.json. As provas exercitam o fluxo real com essa resposta; não representam chamada a um provedor ou qualidade de um modelo externo.
