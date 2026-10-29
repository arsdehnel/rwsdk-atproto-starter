#!/bin/sh
set -eu

# atproto devnet init: create invite code and seed test accounts.
# Runs as a one-shot container after PDS and PLC are healthy.

PDS_URL="http://pds:3000"
DATA_DIR="/devnet-data"

log() { echo "[init] $*"; }

apk add --no-cache curl jq >/dev/null 2>&1

# ── Create invite code ────────────────────────────────────────────
log "Creating invite code..."
INVITE_RESPONSE=$(curl -s -X POST "${PDS_URL}/xrpc/com.atproto.server.createInviteCode" \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(printf 'admin:%s' "${PDS_ADMIN_PASSWORD}" | base64)" \
  -d '{"useCount": 10}')

INVITE_CODE=$(echo "$INVITE_RESPONSE" | jq -r '.code')
log "Invite code: ${INVITE_CODE}"

# ── Create test accounts ──────────────────────────────────────────
create_account() {
  local handle="$1"
  local email="$2"
  local password="$3"
  local var_prefix="$4"

  log "Creating account: ${handle}"
  # Use -s (silent) not -sf: -f aborts on HTTP 4xx/5xx which combined with
  # set -eu would exit the whole script before we can log the error.
  RESULT=$(curl -s -X POST "${PDS_URL}/xrpc/com.atproto.server.createAccount" \
    -H "Content-Type: application/json" \
    -d "{
      \"handle\": \"${handle}\",
      \"email\": \"${email}\",
      \"password\": \"${password}\",
      \"inviteCode\": \"${INVITE_CODE}\"
    }")

  DID=$(echo "$RESULT" | jq -r '.did')

  if [ "$DID" = "null" ] || [ -z "$DID" ]; then
    log "WARNING: Failed to create ${handle}: $(echo "$RESULT" | jq -r '.message // "unknown error"')"
    return 0
  fi

  log "Created ${handle} → ${DID}"
  printf '%s_HANDLE=%s\n%s_DID=%s\n%s_PASSWORD=%s\n' \
    "$var_prefix" "$handle" \
    "$var_prefix" "$DID" \
    "$var_prefix" "$password" \
    >> "${DATA_DIR}/accounts.env"
}

: > "${DATA_DIR}/accounts.env"
printf 'DEVNET_INVITE_CODE=%s\n' "$INVITE_CODE" >> "${DATA_DIR}/accounts.env"

create_account "alice${HANDLE_DOMAIN}" "alice@devnet.test" "alice-devnet-pass" "ALICE"
create_account "bob${HANDLE_DOMAIN}" "bob@devnet.test" "bob-devnet-pass" "BOB"
create_account "carol${HANDLE_DOMAIN}" "carol@devnet.test" "carol-devnet-pass" "CAROL"

chmod 666 "${DATA_DIR}/accounts.env" 2>/dev/null || true

log "Done. Credentials written to data/accounts.env"

# ── Register test accounts with Tap ──────────────────────────────
# Pre-register the test DIDs so Tap delivers webhook events for them
# immediately, without waiting for an OAuth login. In production, Tap
# connects to the Bluesky relay and uses collection signals instead —
# no per-DID registration needed.
TAP_URL="http://tap:2480"
DIDS=$(grep '_DID=' "${DATA_DIR}/accounts.env" | sed 's/.*_DID=//' | tr '\n' ',' | sed 's/,$//')

if [ -n "$DIDS" ]; then
  JSON_ARRAY=$(printf '[%s]' "$(echo "$DIDS" | sed 's/,/","/g' | sed 's/^/"/' | sed 's/$/"/')")
  log "Registering DIDs with Tap: ${DIDS}"
  curl -sf -X POST "${TAP_URL}/repos/add" \
    -H "Content-Type: application/json" \
    -H "Authorization: Basic $(printf 'admin:%s' "${TAP_ADMIN_PASSWORD}" | base64)" \
    -d "{\"dids\": ${JSON_ARRAY}}" \
    && log "Tap registration complete." \
    || log "WARNING: Tap registration failed (Tap may not be running)."
fi