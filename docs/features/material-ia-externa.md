# Material de estudo com IA externa

Use **Adicionar conteúdo → Material com IA**, no Início ou menu lateral, ou o botão **Material com IA** do Caderno. O material de origem não precisa estar cadastrado no Nodus.

1. Confira **Guardar na matéria**, escreva um foco opcional e escolha Essencial, Equilibrado ou Completo.
2. Clique em **Preparar prompt → Copiar prompt**. Na IA que você preferir, cole o texto e anexe seus PDFs, slides ou outros materiais que ela consiga ler.
3. Traga o JSON completo da resposta: cole em **Trazer a resposta da IA** ou use **Abrir arquivo JSON**.
4. Clique em **Conferir material**. Se o formato precisar de ajuste, use **Copiar pedido de correção** na mesma conversa da IA e traga a resposta completa corrigida.
5. Abra as notas da prévia e confira explicações, fontes e complementos com os anexos. Clique em **Adicionar notas ao caderno**.

As notas são arquivos Markdown novos, editáveis e organizados na matéria escolhida. Abra cada uma para ler, escrever sua explicação ou usar os questionários/flashcards existentes em Prática. Tabelas, código e fórmulas permanecem no Markdown; a apresentação de fórmulas segue o leitor atual.

**Continuar um pedido** retoma o prompt e a resposta, inclusive um JSON ainda incompleto. Fechar o diálogo ou o aplicativo espera a gravação do rascunho. Depois de importar, o pedido abre as notas pelos títulos atuais. Repetir o mesmo JSON encontra o lote já criado e preserva suas edições; para gerar outro material, use **Novo pedido**.

O prompt pede de 1 a 8 notas por assunto e até 30 fontes identificadas pelo nome do anexo. Cada nota cita fontes existentes na resposta e identifica os complementos da IA. O app verifica o formato e os vínculos, mas não tem os anexos dessa conversa para comprovar os nomes ou a precisão acadêmica. Confira-os antes de importar. Se a IA não conseguir ler os arquivos, peça outra forma de enviar o material; o Nodus não realiza OCR neste fluxo.

O arquivo de resposta precisa ser JSON UTF-8 de até 2 MiB. A prévia não executa HTML, código, imagens nem links da resposta. Os anexos são enviados por você diretamente ao serviço escolhido; o Nodus não chama provedores nem exige chave. O app conserva localmente o prompt, a resposta e as notas; não copia os anexos dessa conversa para o vault.

Se ocorrer uma falha de gravação, o lote não fica parcialmente registrado. Uma reserva persistente permite recuperar arquivos intactos de uma importação interrompida ao repetir o pedido. Se um desses arquivos tiver sido alterado externamente, ele é preservado e o app informa o caminho antes de continuar. Não remova edições necessárias; guarde uma cópia e siga a mensagem. Backups locais incluem pedidos, recibos, notas e edições, e restauram em outra pasta.

[Contrato de intercâmbio](../contracts/study-material-v1.md) · [Decisão](../adr/0022-material-ia-externa.md) · [Provas Windows](../validation/STUDY_MATERIALS.md)
