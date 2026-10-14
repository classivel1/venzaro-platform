#!/usr/bin/env bash
# Restore into a separate empty staging database; NEVER replace production automatically.
set -euo pipefail
: "${RESTORE_DATABASE_URL:?Set RESTORE_DATABASE_URL for a separate staging database}"
: "${1:?Usage: bash scripts/restore-db.sh /secure/path/venzaro-backup.dump}"
BACKUP="$1"
test -s "$BACKUP"
if [[ -f "$BACKUP.sha256" ]]; then (cd "$(dirname "$BACKUP")" && sha256sum -c "$(basename "$BACKUP").sha256"); fi
pg_restore --no-owner --no-acl --exit-on-error --dbname="$RESTORE_DATABASE_URL" "$BACKUP"
echo "Restore completed to staging. Run schema checks and login tests before any cutover."
