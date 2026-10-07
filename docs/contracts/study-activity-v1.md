# Contrato de atividades de estudo 1.0

Fonte de verdade: src/shared/study-activity.ts (Zod4 instalado). Tipos são inferidos e o JSON Schema do tipo solicitado vem de z.toJSONSchema. O esquema completo entra no prompt e no pedido de correção; as mesmas regras e verificações de domínio são executadas novamente antes da gravação. O contrato de intercâmbio é independente das tabelas SQLite.

| Campo raiz | Regra |
| --- | --- |
| schemaVersion | String exata 1.0 |
| requestId / materialSnapshotId | UUIDs literais do pedido/snapshot local; correlação, nunca autorização |
| type | quiz ou flashcards, igual ao pedido |
| title | Texto não vazio, até200caracteres |
| language | pt-BR |
| difficulty | easy, medium ou hard, igual ao pedido |
| items | Exatamente10itens do tipo solicitado |

Objetos são estritos, sem campos extras ou coerção. IDs são únicos q01–q10 ou f01–f10. Não há IDs de usuário/matéria escolhidos pela IA: o serviço resolve a matéria pelo pedido registrado no perfil local e exige o vínculo em todas as operações.

Questão: id, topic, question, options, correctOptionId, explanation, provenance. options é uma tupla de quatro objetos {id,text}, com IDs literais A,B,C,D nessa ordem; textos distintos após normalização de espaços. correctOptionId aceita somente um desses quatro IDs. Não aceita índice, lista de respostas ou texto da alternativa.

Cartão: id, topic, front, back, explanation, provenance. Todos os textos são não vazios. Frente é pergunta/conceito; verso é resposta; explicação é separada. Não há lacunas nesta versão.

| provenance.basis | references | supplement |
| --- | --- | --- |
| material |1–40pares {sourceId,chunkId} existentes no snapshot | null |
| general_knowledge | Lista vazia | Texto não vazio identificando complemento e relação com o tema |
| mixed |1–40pares existentes | Texto não vazio identificando o acréscimo |

Uma referência confirma existência do bloco, sem certificar a afirmação acadêmica. O trecho congelado e o estado atual da fonte ficam consultáveis na interface. Conformidade estrutural não detecta toda ambiguidade, repetição conceitual, erro de gabarito ou complemento fora do tema; o prompt orienta qualidade e a revisão oferece as fontes.

## Limites e transporte

- Resposta/arquivo válido:2MiB em UTF-8. A fronteira IPC aceita até8Mi caracteres para relatar excesso; isso não aumenta o limite de importação.
- title/topic:200caracteres; question/front/opção:1.000; back/explanation:4.000; supplement:2.000; IDs de fonte/bloco:120.
- Parser: profundidade20, listas100, propriedades100por objeto, nomes de propriedade120caracteres e5.000valores. Os limites são rejeições, sem recortar conteúdo.
- Prompt final:100.000caracteres por padrão, configuração por pedido de2.000até1.000.000. Inclui instruções, esquema e pacote. Contagem usa length de string JavaScript (unidades UTF-16); não se anuncia estimativa de tokens nem compatibilidade universal com modelos.
- Até30fontes selecionadas. PDF de extração:20MiB/1.000páginas/2MiB de texto extraído; falha pede retirar ou processar externamente. Não há resumo, divisão ou truncamento automático.

Normalizações permitidas: BOM inicial, espaços externos e uma única cerca Markdown (sem linguagem ou json) envolvendo exclusivamente o objeto inteiro. Dentro do JSON, somente espaços ASCII, tabulação, CR e LF são separadores válidos. O parser próprio detecta propriedades duplicadas inclusive com escapes Unicode; não extrai objeto de uma resposta com texto extra, nem completa JSON truncado.

Problemas têm category syntax/schema/domain, code, path, message, expected, received limitado e suggestion; sintaxe inclui linha/coluna reais do texto normalizado e trecho limitado quando disponível. A interface mostra até20problemas, indica o restante e mantém o relatório para correção. Não há log da resposta integral.

## Snapshot, identidade e revisões

Snapshot serializado: ID, nome da matéria e somente fontes selecionadas. Cada fonte contém sourceId/ID local, tipo, título, SHA-256, revisão da nota quando disponível e blocos {id,text,location}. Notas preservam todos os caracteres/blocos de código e usam linhas; PDFs usam página real; momentos de vídeo usam seu UUID/tempo e apenas a anotação existente. URL/título nunca representam conteúdo integral de vídeo/página.

Pedidos/snapshots permanecem em SQLite após fechar o app. Rascunho da resposta é separado da atividade pronta. A propriedade imutável do snapshot é mantida pelo serviço, sem operação de edição. O estado atual da fonte é conferido por hash/acesso; alteração/ausência não destrói o contexto exportado.

Importação valida novamente tudo e grava atividade e10cartões (quando aplicável) em uma transação com audit. Unicidade (requestId, hash canônico SHA-256) retorna a atividade existente. Hash ordena chaves de objetos e conserva ordem de listas/textos. Outro conteúdo no mesmo pedido cria revisão separada, sem modificar sessões/revisões anteriores. Resposta de outro pedido não é remapeada; o usuário pode escolher explicitamente o pedido local correspondente, inclusive de outra matéria.

Fixtures completas e ilustrativas: tests/fixtures/activities/quiz-v1.json e flashcards-v1.json. Seus IDs fictícios são substituídos por IDs reais nas provas; nunca entram no prompt de produção. Os testes validam10itens completos de cada tipo, suplementos e payloads inválidos. Nenhuma fixture é apresentada como resposta de um provedor real.
