> Checkpoint histórico do recorte inicial de02/10/2026, antes dos pedidos posteriores. Jogo e Explorer/editor locais foram antecipados em GAM-01/02; pushes autorizados depois desse checkpoint. Estado atual em ../status/ALPHA_STATE.md.

# Recorte desta entrega

02/10/2026. Pedido atual: MVP bem enxuto, baseado na documentação, front com Three.js e GSAP, commits por fase na branch MVP e auditoria final por agente. A execução entrega o núcleo local de ALP-01 a ALP-08, com documentação de ALP-11 e jornada local de ALP-10. ALP-02 continua parcial por prova em editor externo ausente; a implementação é edição assistida com prévia, preservadora, não WYSIWYG.

Consulta pelo celular/nuvem (ALP-09) foi apresentada como escolha ao usuário durante a execução; não houve definição de Supabase/hospedagem nesta sessão. Como escolha de recorte para o MVP enxuto, esta entrega permanece local, sem implementar cliente fictício, estado sincronizado ou serviço. ALP-09 fica a fazer. Isso não aprova a alpha completa nem altera os requisitos do ticket canônico. Código e migrações independentes de ALP-09 devem ser implementados no próximo incremento se o usuário mantiver o recorte alpha integral.

Configuração necessária na etapa de nuvem: projeto Supabase definido, URL e chave pública publishable/anon, identidade de teste/proprietário, URLs de retorno de Auth e origem HTTPS de hospedagem independente, duas contas de teste para políticas e prova no celular com PC desligado. Segredo service_role nunca vai para renderer/web/Git. O MVP atual não lê .env e não pede credenciais. Nenhum serviço foi publicado, nenhum push feito.

Grafo 3D, farm/builds, projetos, tutor/IA, agenda e gamificação permanecem no roadmap da primeira versão pública; as órbitas da mesa são decoração. Marca final/licença pública não escolhidas. Reserva humana original 360 minutos, observação não informada; não há prazo de implementação inferido a partir do tempo da IA.
