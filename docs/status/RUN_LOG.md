# Diário de execução da alpha

Estado inicial: nenhum ticket implementado. Este arquivo registra checkpoints reais de execução; não preencha datas, comandos, testes ou resultados que não ocorreram.

## Formato de entrada

### Data/hora e ticket

- Ambiente e versão/build usada:
- Comportamento entregue:
- Arquivos/commit, quando existente:
- Verificações executadas e resultados:
- Critérios pendentes e bloqueios:
- Próxima ação concreta e como reproduzir:

Use entradas curtas e mantenha o histórico. O estado atual está em [ALPHA_STATE.md](ALPHA_STATE.md), e a evidência por critério em [ALPHA.md](../validation/ALPHA.md).

### 02/10/2026 — ALP-01: Em andamento

Fundação Electron/React/TypeScript; instalação e prova Windows em execução.

### 02/10/2026 — ALP-01: Concluído

Fundação verificada no Windows; próximo ALP-02, prova do editor preservador.

### 02/10/2026 — ALP-02: Em andamento

Avaliar Tiptap e integrar editor com preservação de bytes e prévia.

### 02/10/2026 — ALP-02: Parcial

Editor assistido preservador integrado; C5 externo pendente. Prosseguir ALP-03 independente dessa prova.

### 02/10/2026 — ALP-03: Em andamento

SQLite nativo do Node embarcado, schema versionado, contratos e matérias reais.

### 02/10/2026 — ALP-03: Concluído

Matérias e SQLite reais verificados; próximo ALP-04, vault e recuperação.

### 02/10/2026 — ALP-04: Em andamento

Vault autorizado, identidade portável, gravação atômica e rascunhos recuperáveis; fase na branch MVP.

### 02/10/2026 — ALP-04: Concluído

Vault e recuperação verificados; consolidar ALP-11 antes da mesa.

### 02/10/2026 — ALP-11: Em andamento

Checkpoint após ALP-04: setup, decisões, memória de arquitetura e retomada.

### 02/10/2026 — ALP-11: Concluído

Documentação do primeiro checkpoint coerente; repetir ALP-11 no final. Próximo ALP-05.

### 02/10/2026 — ALP-05: Em andamento

Mesa por matéria com contexto persistente e interface Three.js/GSAP discreta.

### 02/10/2026 — ALP-05: Concluído

Mesa persistente verificada; próximo ALP-06, renderização PDF real.

### 02/10/2026 — ALP-06: Em andamento

Leitor PDF local com worker empacotado, navegação e retomada.

### 02/10/2026 — ALP-06: Concluído

Leitor PDF real verificado também empacotado Windows; próximo ALP-07, foco por segmentos.

### 02/10/2026 — ALP-07: Em andamento

Foco por tempo monotônico, segmentos e checkpoint de recuperação.

### 02/10/2026 — ALP-07: Concluído

Foco e recuperação verificados; próximo ALP-08, etapas e próxima ação.

### 02/10/2026 — ALP-08: Em andamento

Checklist persistente por matéria, IDs de etapas e referência de retomada.

### 02/10/2026 — ALP-08: Concluído

Checklist local verificado. MVP local implementado; ALP-09 fica fora deste recorte sem serviço/hospedagem. Executar jornada local ALP-10 e consolidar ALP-11.

### 02/10/2026 — ALP-10: Em andamento

Jornada integrada do MVP local no executável Windows; R8 nuvem fora do recorte e não verificado.

### 02/10/2026 — ALP-10: Parcial

MVP local R1–R7 verificado; alpha completa continua parcial por R8/nuvem. Consolidar ALP-11 e auditoria solicitada.

### 02/10/2026 — ALP-11: Concluído

MVP local implementado/verificado na branch MVP; auditoria final em andamento. Após review, abrir executável e conferir editor externo; ALP-09 é próximo incremento da alpha integral.

### 02/10/2026 — ALP-11: Concluído

MVP local entregue, auditoria final concluida e commits por fase na MVP. Primeira acao humana: abrir release/win-unpacked/App Estudos.exe com vault de teste e conferir .local/evidence/editor-output.md em editor externo para ALP-02/C5. ALP-09 permanece proximo incremento da alpha integral.
