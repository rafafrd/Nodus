# Padrões verificados e riscos

02/10/2026. Preservar Markdown como fonte; a configuração básica Tiptap 3.31.4 perdeu campos/comentários/bloco personalizado na fixture, por isso o MVP usa editor assistido sem parse/serialize no salvamento. Não usar esse candidato básico como persistência.

SQL parametrizado, UUID estável, foreign_keys ativo e migração em transação. Nunca resetar banco para migrar. Não expor ipcRenderer, fs, shell, caminho arbitrário ou exec ao renderer. UI não confirma salvamento antes de resposta; conflito conserva fonte externa e rascunho. Conteúdo de notas, tokens e caminhos pessoais não entram em eventos de auditoria.

Rascunhos são recuperação, não autoridade do corpo. Backup antes de substituir arquivo; limites de concorrência com editor externo em docs/decisions/vault-safety.md. Fixtures/testes também entram na busca de segredos. Dependências do produto e da cadeia de build devem ser avaliadas separadamente e com evidências reais.

Esta memória não declara auditoria de segurança concluída. A revisão final solicitada atualizará controles, achados, cenários e verdict.
