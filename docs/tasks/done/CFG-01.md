---
id: CFG-01
status: done
outcome: concluido
depends_on: ["ALP-03","UI-02","MED-01"]
criteria_count: 6
---

# CFG-01 — Configurações, aparência e perfil local

Pedido: aba de configurações com temas, desligar animações, nome/foto editáveis e gerenciamento do app. Branch codex/settings-profile parte de 92cc357; autorização vigente de commits/push por fases.

C1. Área Configurações na barra fixa, navegação/retorno conservam buffers de notas/projetos, PDF e contexto; PiP permanece disponível e áreas ocultas não capturam atalhos.
C2. Três temas sóbrios persistentes (Oliva, Grafite, Azul noite), aplicados à interface/editores/diálogos sem recriar documentos ou cidade.
C3. Controle persistente de animações complementa preferência do sistema; altera GSAP/CSS/Three dinamicamente, mantendo timing essencial de foco/minigames e reprodução remota.
C4. Nome/foto locais editáveis; foto PNG/JPEG limitada/validada e normalizada antes de persistir, opção de remover, restart conserva perfil e preferências. Sem caminhos/HTML/URL remota arbitrários no renderer.
C5. Gerenciamento mostra versão/runtime/pastas e contagens reais; operações de pasta recebem enum e resolvem apenas diretórios registrados. Erros não confirmam sucesso nem eliminam dados.
C6. Testes/argumentos/rollback/pacote e jornada Windows reais, capturas, audit independente, docs/memória/quadro e commits/push registrados com limites.

## Encerramento e retomada

C1–C6 aprovados em [SETTINGS](../../validation/SETTINGS.md) e [ALPHA](../../validation/ALPHA.md). Perfil local/nome/foto,3 temas/off/OS/gestão entregues, sem reset/migration/dep nova. Typecheck,24 testes,pacote Windows, Settings/Videos/Journey/Smooth-ui finais passaram; correção O-011 conservou superfície/retry após restart. [Auditoria independente](../../security/SETTINGS_AUDIT.md) aprovada com mitigações locais; tooling High com exposição avaliada permanece.

Core8f1a47e, UI5eb2142, fixplayerc68a020 e docs/auditccdd75d enviados ao origin/codex/settings-profile, push exit0/upstream configurado em03/10/2026. Gitleaks staged de todas as fases aprovou, incluindo docs/fixtures/tests/harness; quadros/memória/guia atualizados. Fechamento do ticket em checkpoint documental separado. Nenhuma implementação restante neste ticket. Próxima ação humana: abrir a build e usar Ajustes conforme o guia. Alpha externa ALP-02/C5, ALP-09/R8 permanece pendente; nenhum serviço/release publicado.
