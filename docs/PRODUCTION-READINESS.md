# VENZARO — estado de entrega e critérios de produção

## Implementado
- Next.js responsivo, vitrine e busca, veículos demonstrativos identificados separadamente.
- PostgreSQL multi-tenant com revendas, anúncios, contas, sessões e indexação básica.
- Master autenticado com ativação inicial única, gestão de revendas e usuários, suspensão, moderação e edição de título/preço.
- Revenda autenticada com inclusão de anúncios, edição completa, rascunho/publicado/arquivado e troca de senha.
- Redefinição de senha de funcionários pelo Master; revogação de sessões.
- Fotos reais com compressão opcional no navegador, limite de 5 fotos/veículo e ~5,5 MB por veículo guardadas no PostgreSQL.
- Perfis públicos de revenda e WhatsApp comercial configurado pelo Master.
- Metadados de planos e assinatura **manuais**, cores e logotipo por revenda; não representam cobrança real.
- Proteção contra tentativas repetidas de login via tabela PostgreSQL.
- /api/health (processo) e /api/ready (processo + PostgreSQL).

## Dependências reais ainda não concluídas
1. **Persistência de longo prazo:** o banco de teste gratuito do Render tem expiração informada para 2026-11-13; migrar para PostgreSQL persistente antes dessa data e fazer backup/restore testado. Fotos armazenadas no PostgreSQL consomem espaço; usar object storage dedicado para produção em escala.
2. **Cobrança SaaS:** preços, regras de planos, gateways de pagamento, chaves, webhooks e políticas comerciais ainda não foram fornecidos; marcar assinatura manualmente não cria pagamentos.
3. **White label completo:** domínios personalizados, SSL/DNS por organização, branding integral do catálogo, temas avançados e configuração de provedor de e-mail não implantados. A página pública da revenda já aceita cor e logotipo.
4. **Mensageria:** disparos por WhatsApp/e-mail e notificações dependem de opt-in, números reais e provedor com credenciais adequadas.
5. **Auditoria:** implantação compilada não substitui testes E2E de login, autorização, criação, edição, publicação, fotos, senha e recuperação. Para go-live configurar backups, monitoramento, avisos de privacidade/LGPD, antifraude, limites de upload/uso, política de retenção e revisão de dependências.
6. **Segurança:** auditar versão das dependências. Render relatou vulnerabilidades npm; não rodar 'npm audit fix --force' sem testes e análise de breaking changes. Implementar CSRF explícito, trilha de auditoria e rotinas de limpeza de sessões/tentativas expiradas para produção.
7. **Suporte e anúncios:** não há infraestrutura de assinatura de contrato, pagamento do carro, financiamento nem verificação de documentação do veículo.
8. **Dados reais:** não foram fabricados anúncios, revendas nem números de contato. Cadastros devem ser autorizados pelos respectivos responsáveis.

## Verificação operacional
- Site: https://venzaro-platform.onrender.com
- Dashboard Master: /master
- Revendas: /painel
- Catálogo: /veiculos
- Readiness: /api/ready — deve responder 200 apenas com DB acessível e esquema inicializado.
- Dashboard Render: https://dashboard.render.com/web/srv-db7vodaj9qps73b3ftog
- Banco Render: https://dashboard.render.com/d/dpg-db809c8m7kps73chevk0-a

## Regras de segurança
- Nunca colocar DATABASE_URL, SENHAS ou tokens em repositórios públicos.
- Não expor credenciais Master a funcionários de revendas.
- Não considerar um anúncio publicado a partir apenas de dados demonstrativos.
- Não habilitar publicação de fotos de outras revendas.
