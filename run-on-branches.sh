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

ORIGINAL_BRANCH=$(git rev-parse --abbrev-ref HEAD)

restore_branch() {
  git checkout "$ORIGINAL_BRANCH" --quiet
}
trap restore_branch EXIT

for branch in "${BRANCHES[@]}"; do
  echo "=== $branch ==="
  git checkout "$branch" --quiet

  # --- commands go here ---
  biome lint --fix
  biome format --fix
  git add .
  git commit -m "fix: biome formatting and linting"
  git push
  # --- end commands ---

  echo ""
done
