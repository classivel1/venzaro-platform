# VENZARO — migração gratuita Render PostgreSQL → Neon

## Arquitetura escolhida
- **Aplicação:** mantém o serviço Web Free do Render e o GitHub atuais.
- **PostgreSQL:** utilizar um projeto **Neon Free** separado. A conta Neon deve ser conectada/autorizada pelo proprietário.
- **Sem pagamentos:** não selecionar upgrade e não fornecer cartão para migração.
- **Segredos:** DATABASE_URL será configurada somente no ambiente privado Render. Nunca publicar credenciais em commits, logs, mensagens ou formulários públicos.
- **Banco antigo:** manter intacto até testar o novo banco com dados restaurados; data de expiração informada pelo Render: 2026-11-13T22:39:45Z.

## Migração sem perda de dados
1. Conectar Neon ao ChatGPT ou criar um projeto Neon Free na região mais próxima disponível ao Render (atualmente Web Render Virginia).
2. Criar banco vazio de destino, confirmar limite e uso de armazenamento. O VENZARO armazena até 5 fotos por veículo dentro do PostgreSQL; em uso real, 0,5–1 GB pode acabar rapidamente.
3. Obter **dump completo** do PostgreSQL antigo via `pg_dump` com conexão autorizada e segura. O conector Render hospedado **não consegue consultar o banco atual**: a IP allowlist está vazia; não liberar acesso público indiscriminadamente só para esse fluxo.
4. Salvar dump em local privado e criptografado. **Não subir dump para GitHub**, nem mesmo em repositório privado.
5. Executar `scripts/restore-db.sh` usando `RESTORE_DATABASE_URL` apontando ao banco Neon vazio, com cliente PostgreSQL compatível. Validar total de usuários, veículos, fotos, tenants, permissões, status e sessões; preferir revogar sessões após a migração.
6. Congelar novas gravações no banco antigo durante o corte, fazer dump final/restaurar novamente no Neon para não perder alterações.
7. Somente depois de validar Neon, substituir `DATABASE_URL` no Render pela connection string Neon com SSL, preservando os demais env vars. Em conexões Neon usar URL/SSL conforme indicado pelo provedor; a configuração atual de `getPool` usa URL diretamente.
8. Implantar e validar `https://venzaro-platform.onrender.com/api/ready` como `200`. Testar /master, /painel, /veiculos, edição, upload, imagens, catálogo, logs e controle de acesso.
9. Preservar o banco antigo como rollback até validação conclusiva.

## Limitações do Free
- Sem expiração programada de 30 dias como ocorre no Render Free, porém cotas de compute, storage e rede, políticas de suspensão e preços podem mudar.
- O site render.com Free também pode dormir por inatividade e ter cold start.
- Dados/fotos reais exigem backups periódicos fora do Neon. Plano gratuito **não substitui política de disaster recovery**.
- Considerar storage de objetos para as imagens quando o catálogo crescer; imagens no próprio Postgres consomem quota.
- Não declarar migração concluída sem ter verificado dump/restauração e /api/ready com a nova URL.

## Próxima ação dependente do proprietário
**Conectar Neon** no ChatGPT, usando a opção de app sugerida, para permitir provisionamento do projeto e banco. É necessário um meio de exportar o Render Postgres antigo com as credenciais mantidas privadas; o conector hospedado do Render atual informa bloqueio de acesso devido à allowlist vazia.

Fontes oficiais:
- https://neon.com/docs/introduction/plans
- https://neon.com/docs/import/migrate-from-postgres
- https://render.com/docs/free
