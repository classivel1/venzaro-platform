# Backend VENZARO — etapa inicial
## Configuração
1. Provisionar PostgreSQL e configurar DATABASE_URL como segredo no Render.
2. Executar database/schema.sql no banco.
3. Definir VENZARO_ADMIN_API_KEY como segredo aleatório com pelo menos 32 caracteres, nunca no repositório.
4. Opcional: DATABASE_SSL=true se o provedor usar certificado verificável.
5. GET /api/vehicles lista apenas anúncios publicados de revendas ativas (filtros tenant, category e q).
6. POST /api/tenants e POST /api/vehicles exigem cabeçalho x-admin-api-key. Novos anúncios começam como draft.
## Segurança e limitações
A chave de API é provisória e exclusiva do backend administrativo; não a exponha no navegador.
Ainda não existe autenticação de usuários, sessões, permissões por revenda, fluxo de publicação, upload de imagens ou pagamentos.
A interface /veiculos ainda usa dados demonstrativos, não os dados desta API.
Não habilitar cadastro público de anúncios até implementar autenticação e autorização por tenant.
