# Pedido de início da alpha

Este é um template de autorização da alpha, não uma ordem permanente. Preserve o MVP e retome pelo estado/ticket; pedidos posteriores de branch/push/jogo/Explorer já registrados prevalecem no respectivo escopo.

Abra a raiz do projeto no Codex. Copie somente o bloco abaixo. Ele autoriza a implementação local em sequência e commits locais; não publica o projeto.

```text
Implemente a alpha deste projeto em sequência, começando por ALP-01 e seguindo até ALP-10. Execute ALP-11 após ALP-04 e novamente ao final.

Esta solicitação substitui a orientação histórica de encerrar e aguardar um novo pedido após cada ticket. Trabalhe em uma tarefa por vez e avance automaticamente quando suas dependências técnicas estiverem satisfeitas.

Comece conferindo AGENTS.md, CLAUDE.md, gotcha.md, o estado do Git e docs/status/ALPHA_STATE.md. Use os tickets em docs/tasks como fonte canônica. Leia arquitetura, SDD e decisões conforme a tarefa exigir; não carregue todo o histórico em cada etapa.

Você está autorizado a editar arquivos deste projeto, instalar dependências locais necessárias, executar builds e testes, corrigir falhas, atualizar documentação e fazer commits locais dos checkpoints. Use uma branch local de trabalho a partir do estado atual. Revise o diff e selecione somente arquivos pertinentes antes de cada commit. Não altere configuração global, faça push, publique serviços, reescreva histórico ou inicie módulos fora da alpha por esta autorização.

Resolva escolhas reversíveis e registre decisões. Continue até implementar e verificar o escopo autorizado; um plano, uma primeira implementação ou uma tela simulada não encerra o trabalho.

Após cada ticket, atualize seu estado, docs/status/ALPHA_STATE.md, docs/validation/ALPHA.md e docs/status/RUN_LOG.md. Só marque como concluído quando todos os critérios estiverem demonstrados. Mocks não comprovam integrações; comandos sugeridos não são comandos executados.

Se faltar credencial, serviço, acesso ou prova de ambiente, conclua o trabalho independente e avance em tarefas que não dependem do bloqueio. Dependência técnica não satisfeita continua bloqueando o trabalho que exige aquele contrato. Preserve resultados parciais e dados. Peça minha intervenção apenas quando necessária, sem solicitar segredos no chat.

Ao encerrar por conclusão, bloqueio real ou limite da sessão, deixe arquivos salvos, o estado real, as verificações, pendências reproduzíveis e a próxima ação concreta registrados para outra sessão. Não declare a alpha concluída enquanto seus critérios externos estiverem pendentes.
```

Para uma nova sessão, use: “Retome a alpha sequencial conforme AGENTS.md e docs/status/ALPHA_STATE.md. Confira código e evidências, preserve alterações e continue da próxima ação concreta registrada.”
