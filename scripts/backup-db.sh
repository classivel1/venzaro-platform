#!/usr/bin/env bash
# VENZARO encrypted-at-rest backup is the OPERATOR'S responsibility.
# Requires DATABASE_URL, pg_dump (Postgres 18 compatible), and local private storage.
set -euo pipefail
: "${DATABASE_URL:?Set DATABASE_URL from your private environment, never the repository}"
umask 077
OUT_DIR="${1:-./private-backups}"
mkdir -p "$OUT_DIR"
DATE="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$OUT_DIR/venzaro-$DATE.dump"
pg_dump --no-owner --no-acl --format=custom --file="$OUT" "$DATABASE_URL"
test -s "$OUT"
sha256sum "$OUT" > "$OUT.sha256"
echo "Backup stored privately: $OUT"
echo "IMPORTANT: Store securely in encrypted off-site storage and test a restore."
