# VENZARO — Backup e migração do PostgreSQL

## Urgência
O banco Render **venzaro-db** (`dpg-db809c8m7kps73chevk0-a`) está no plano Free e a API informou `expiresAt=2026-11-13T22:39:45Z`. **Não confundir o serviço Web Free com o banco.**
Não criar um segundo banco com custo ou remover o original sem o consentimento do proprietário.

## Antes do prazo
1. Escolher um banco PostgreSQL persistente (Render pago ou provedor compatível), identificar custo, região e janela de migração.
2. Obter `DATABASE_URL` internamente no Render; não enviar pelo chat, não adicionar em arquivos Git ou logs.
3. Em máquina ou runner privado com `pg_dump` versão compatível com PostgreSQL 18, executar `bash scripts/backup-db.sh /caminho/privado`.
4. Validar `.dump`, checksum e **restaurar primeiro em staging vazio** usando `RESTORE_DATABASE_URL` e `bash scripts/restore-db.sh /caminho/privado/backup.dump`.
5. Testar staging: tabelas, número de revendas, anúncios, fotos, usuários, publicação e login. O backup inclui senhas hasheadas, sessões e imagens: armazenar criptografado, com controle de acesso estrito. Preferir invalidar sessões após migração.
6. Parar alterações no banco de origem durante o corte ou executar novo backup depois de congelar as escritas. Restaurar no destino e testar.
7. Alterar **somente** a variável `DATABASE_URL` do serviço `venzaro-platform` no Render, implantá-lo e confirmar `GET /api/ready` com status 200.
8. Verificar cadastros, perfis, fotos, catálogo, Master e logs. Manter o banco antigo intacto até confirmação.
9. Depois de verificação e aprovação, definir política de backup automático criptografado, rotação e teste mensal de restauração.

## Requisitos de produção
- Postgres persistente e políticas de backup do provedor, mais cópia externa verificada.
- Armazenamento de imagens em object storage se o catálogo crescer.
- Alertas do Render, HTTPS, domínio controlado e testes de regressão.
- Não publicar dumps ou segredos no repositório ou artefatos públicos de CI.
- Essa documentação **não constitui um backup executado** nem uma migração realizada.

## Limitações atuais
O conector Render disponível executa consultas SQL apenas de leitura, e o banco possui IP allowlist vazia; ele não oferece download de um `pg_dump` nem alteração do plano na sessão atual. A migração só pode ser concluída com acesso seguro às credenciais e definição do plano de destino.
