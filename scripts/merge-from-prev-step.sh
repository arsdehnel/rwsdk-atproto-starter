#!/usr/bin/env bash
set -euo pipefail

BRANCHES=(
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

  compare_branch=""
  # $compare_branch=""
  case "$branch" in
    "post/02-atproto-oauth")  compare_branch="post/01-first-read" ;;
    "post/03-local-dev-setup")  compare_branch="post/02-atproto-oauth" ;;
  esac

  if [ -z "$compare_branch" ]; then
    echo "No compare branch, skipping"
  else
    git merge $compare_branch
  fi

  echo ""
done
