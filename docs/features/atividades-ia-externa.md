# Atividades usando qualquer IA externa

Na matéria, abra Prática → Criar questionário ou Criar flashcards. A área Revisão → Atividades também contém a biblioteca e os pedidos salvos.

1. Selecione notas, PDFs e anotações de vídeo da mesma matéria. A lista informa disponibilidade; salve rascunhos de notas antes de preparar. Vídeo sem anotação/transcrição útil precisa ser processado ou retirado; PDF digitalizado precisa de OCR externo. Nenhuma fonte selecionada é omitida silenciosamente.
2. Escolha dificuldade e prepare o prompt. O app congela as fontes, mostra o tamanho final e mantém o pedido salvo. Se o limite for ultrapassado, retire fontes maiores e prepare novamente. Todo o conteúdo incluído permanece intacto.
3. Use Copiar prompt. “Copiado” só aparece depois da conclusão e conferência do clipboard Windows. O texto integral fica disponível para conferência/cópia manual se houver falha.
4. Cole em qualquer IA escolhida por você, na conversa desejada. O app não abre o provedor nem envia materiais pela rede. Não precisa de chave, cadastro ou integração paga.
5. Volte ao pedido, cole o JSON em Colar resposta ou abra um arquivo .json. Ambas as entradas usam a mesma validação. Confira título/tipo/10itens/matéria/complementos e use Importar e começar.

Se houver erro, o app apresenta “Não foi possível importar”, o caminho/regra e a ação necessária. Copie o pedido de correção e cole na mesma conversa da IA; conserve ali o pacote original. Importe a resposta completa corrigida e valide novamente. O original colado permanece disponível, inclusive no pedido reaberto após validação.

O pedido de correção inclui metadados reais, esquema, referências válidas, relatório e resposta anterior como dado. Se ultrapassar o orçamento, a interface identifica relatório curto para a mesma conversa, sem fingir que um JSON recortado está completo. Pode copiar o prompt original novamente. Não há correção automática, chamada paga ou exigência de edição manual do JSON.

## Estudar

Questionário: responda as10questões; cada escolha é salva. Pode sair/fechar e retomar pela biblioteca. Gabarito, explicações, acertos, percentual e duração aparecem depois de finalizar. A duração é o tempo decorrido entre início e finalização, inclusive períodos com o app fechado; não equivale ao tempo de Foco. Nova tentativa conserva o resultado anterior. Importar outra revisão conserva todas as tentativas anteriores.

Flashcards: leia a frente e use Revelar resposta para ver verso/explicação. Avalie Ainda não, Difícil, Lembrei ou Fácil pelo mecanismo de revisão existente. Autoavaliação não é tratada como acerto de múltipla escolha. Os cartões também pertencem ao domínio de revisão já existente.

Itens com material permitem Conferir trecho. O app mostra o snapshot e avisa quando a fonte mudou ou está ausente. Abrir fonte local leva à nota, página PDF ou anotações do vídeo; abrir um vídeo seleciona seu contexto sem iniciar automaticamente o player remoto. Complementos de conhecimento geral são identificados na revisão/revelação.

Importar não concede XP, moedas, domínio, conquistas ou resultado. Revisão de flashcard segue as regras de Study.review já existentes; questionário persiste seus KPIs, sem criar um novo algoritmo de revisão/economia. A indicação de origem e as fontes ajudam a revisar a qualidade acadêmica: JSON válido não significa conteúdo correto.

## Implementação e limites

[Contrato1.0](../contracts/study-activity-v1.md), [decisão](../adr/0017-atividades-ia-externa.md) e [verificação](../validation/atividades-ia-externa.md). Empacotador do domínio inspirado na saída estruturada do [Repomix](https://repomix.com/guide/output) e na [seleção explícita](https://repomix.com/pt-br/guide/command-line-options), sem nova dependência/CLI global e sem exportar repositório/vault/configurações inteiros. Zod4 já instalado fornece [JSON Schema](https://zod.dev/json-schema).

O app usa o perfil local SQLite como fronteira de posse, não identidade de nuvem. Integrações futuras de IA/Supabase permanecem independentes. A tarefa não alterou .env, dependências, lockfile ou algoritmos de revisão/economia.
