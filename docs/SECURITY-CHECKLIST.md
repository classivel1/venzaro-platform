# VENZARO — revisão operacional

- Autenticação Master e revendas separadas, sessões HttpOnly/SameSite, scrypt, revogação ao trocar senhas.
- Operações de escrita autenticadas em `/api/master/*` e `/api/dealer/*` recebem verificação de Origin pela camada middleware (resposta 403 quando ausente ou divergente).
- Rate limiting de login com PostgreSQL por IP declarado pelo proxy, janela de 15 minutos. Para escala e múltiplos provedores, mover a contagem para edge/WAF confiável.
- Endpoints administrativos exigem autorização server-side; não usar chave Master em HTML nem frontend.
- Fotos armazenadas no banco com limites de tamanho/quantidade, cabeçalhos MIME controlados e isolamento de fotos de rascunhos. Para produção pública em escala usar storage com verificação de conteúdo e varredura de malware.
- Comandos SQL usam parâmetros. Esquema é criado automaticamente na primeira consulta; migrações versionadas serão necessárias conforme crescer.
- O build passou anteriormente com avisos de duas vulnerabilidades npm (1 moderada, 1 alta). Investigar `npm audit --omit=dev` e corrigir com lockfile/testes, sem atualização forçada.
- Faltam teste E2E real com proprietário autenticado, auditoria de permissões, recuperação de senha por e-mail, expurgo de sessões expiradas, backup fora do provedor e revisão LGPD.
- Logs não devem conter cookies, senhas nem `DATABASE_URL`.
