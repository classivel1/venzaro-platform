# VENZARO — operações e limites
## Situação
O Render permite somente um banco PostgreSQL free ativo por workspace; o existente pertence ao ViralUp. Não compartilhar bancos de projetos independentes.
O VENZARO ainda depende de um PostgreSQL exclusivo para habilitar APIs persistentes.
## APIs administrativas (uso servidor-servidor)
POST /api/tenants — cria revenda
POST /api/vehicles — cria anúncio em rascunho
GET /api/admin/vehicles?tenantId=<uuid> — lista rascunhos e anúncios de uma revenda
Todas exigem x-admin-api-key. A chave administrativa é global, provisória e NÃO pode ser exposta ao browser.
GET /api/vehicles é público, somente anúncios publicados de revendas ativas.
## Próximas entregas
Provisionar banco isolado; executar migração; implementar autenticação com sessões, RBAC, upload seguro de fotos, UI de administração e planos de assinatura.
Não habilitar endpoints administrativos diretamente em interfaces públicas antes do sistema de login e permissões.
