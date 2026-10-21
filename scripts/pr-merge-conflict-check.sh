#!/usr/bin/env bash
set -euo pipefail

BRANCHES=(
  main
  post/01-first-read
  post/02-atproto-oauth
  post/03-local-dev-setup
  post/04-atproto-writes
  post/05-tap-sync
  post/06-d1-persistence
  post/07-appview
)

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
OWNER="${REPO%%/*}"

for branch in "${BRANCHES[@]}"; do
  number=$(gh api "repos/$REPO/pulls?head=$OWNER:$branch&state=open" --jq '.[0].number' 2>/dev/null)

  if [[ -z "$number" || "$number" == "null" ]]; then
    echo "[$branch] no open PR"
    continue
  fi

  PR=$(gh api "repos/$REPO/pulls/$number")

  title=$(echo "$PR" | jq -r '.title')
  mergeable=$(echo "$PR" | jq -r '.mergeable')
  url=$(echo "$PR" | jq -r '.html_url')

  case "$mergeable" in
    true)  status="✅ ok" ;;
    false) status="❌ CONFLICT" ;;
    null)  status="⚠️  unknown (GitHub still computing)" ;;
    *)     status="$mergeable" ;;
  esac

  echo "[$branch] PR #$number — $title — $status"
  echo "  $url"
done
