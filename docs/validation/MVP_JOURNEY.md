# Jornada integrada do MVP local

02/10/2026, Windows 11 10.0.26200, Node 24.21.0, Electron 44.5.1, app 0.1.0. Artefato: release/win-unpacked/App Estudos.exe. Dados fictícios gerados por scripts/smoke-journey.ts e scripts/test-fixture.ts em .local, sem mocks de integração. Vault configurado previamente pela classe Vault real; PDFs vinculados pela classe Desks real. Diálogos nativos de seleção não automatizados.

Comandos efetivamente executados: npm ci (522 pacotes, auditoria de instalação com zero vulnerabilidades), npm run typecheck, npm test (8 testes aprovados), npm run package:win, npm run test:journey. Dev Vite/Electron também executado por npx tsx scripts/smoke-development.ts com IPC, CSP e worker PDF, sem erros de console/página.

Após os ajustes finais de UUID/título externo/erro de startup e logging do descarte, typecheck, 8 testes, package:win e test:journey foram executados novamente com sucesso. smoke-desktop.mjs --packaged abriu a mesma build duas vezes com isolamento confirmado; smoke-editor.mjs verificou edição seletiva e arquivo inteiro pela mesa atual. SHA-256 do executável final: 73fa445bbb1e99b217bfe4233cf151db98dbb546d04d4f7cdf79a65c7b40d54b; app.asar: 6e9cd70ef5d2b504be8551bd351d9e39ed9c68f0026fb57fbd17c1f5d3fb9805. Metadados locais: .local/evidence/package-results.json. Um rebuild pode gerar outro hash; esta identificação pertence à prova executada.

| Passo | Resultado | Evidência observada |
| --- | --- | --- |
| R1 | aprovado | Duas matérias criadas pelos formulários reais |
| R2 | aprovado local | Notas criadas/editadas/salvas pela UI, PDF real de três páginas, página intermediária, tarefa com duas etapas e foco escolhido de um minuto |
| R3 | aprovado | Foco pausado e etapa marcada; tempo persistido |
| R4 | aprovado | Segunda matéria com nota/PDF/página/layout/checklist próprios |
| R5 | aprovado | Mesmo executável Windows fechado e reaberto |
| R6 | aprovado | IDs, notas, material/página, split 60/40, checklist, próxima etapa e sessão pausada conservados; intervalo fechado sem crédito |
| R7 | aprovado | Alteração externa limpa refletida; nova alteração com buffer pendente conserva arquivo externo e rascunho local |
| R8 | não verificado | Nuvem/celular fora deste MVP; sem serviço, identidade, hospedagem ou consulta com PC desligado |

R2 é local; não substitui uma prova de seleção por diálogo nativo. Capturas: .local/evidence/mvp-journey.png, mvp-compact.png e relatório machine-readable journey-results.json. Captura compacta usa viewport 1040×760 e confirma rodapé dentro da altura. Sem erro de página capturado durante a jornada.

Recuperação complementar executada: scripts/smoke-vault.ts (erro real de arquivo visível com buffer preservado, conflito e reinício), smoke-pdf.ts na build local e empacotada (ausente, relocalização mantendo ID, inválido), smoke-focus.ts (pausa medida, blur de janela, fechamento normal e processo de teste terminado à força com recuperação no último checkpoint) e smoke-checklist.ts (marca/desmarca/renomeia e IDs/retomada após reinício). Testes de arquivos reais incluem junction Windows e rejeição de escape, CRLF/BOM, UUID inválido, duplicação de identidade; SQLite real exercita rollback/migração/referências cruzadas.

Limites reproduzíveis: ALP-02/C5 requer abrir saída da fixture em Obsidian ou outro editor disponível. ALP-09 requer implementação da integração e ambiente definido conforme docs/decisions/mvp-scope.md; nenhum recibo/confirmação remoto existe. Falha de sincronização não exercitada porque não há integração. Concorrência entre editores externos sem lock cooperativo está documentada em docs/decisions/vault-safety.md. A alpha completa continua parcial.

Build emite aviso de chunks acima de 500 kB e metadados/assinatura ainda não definidos; não é falha de execução local. Dependências são fixadas, instalações/builds bem-sucedidos. Atenção humana observada: não informado; reserva original 360 min não usada para inferir duração da implementação.
