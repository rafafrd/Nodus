# Etapas e retomada

02/10/2026 — ALP-08. Tarefas e etapas são UUIDs com vínculo de matéria/tarefa. Adicionar, concluir/desmarcar e editar texto gravam transações reais e eventos locais sem conteúdo. Uma atualização inválida ou referência cruzada é rejeitada; a UI só muda após resposta. Sem passos mostra 0/0 e zero por cento, sem inferência de domínio acadêmico.

Próxima ação usa desks.next_step_id; renomear conserva referência. Escolha de retomada não exige etapa incompleta: usuário pode querer rever uma etapa já marcada. UI mostra contagem, tarefa e etapa escolhida. Novas tarefas/etapas podem ser incluídas; exclusão/reordenação não fazem parte deste recorte.

Teste unitário com SQLite real e scripts/smoke-checklist.ts verificaram duas matérias, duas etapas, marca/desmarca, edição, IDs antes/depois, próxima ação e reinicialização. Referência de outra matéria foi rejeitada sem gravação. A infraestrutura transacional exercitou rollback em ALP-03; falha de I/O SQLite na UI de checklist não foi provocada separadamente.
