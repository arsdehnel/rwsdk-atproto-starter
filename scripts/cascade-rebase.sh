#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/cascade-rebase.sh <branch-you-just-changed>
# Rebases every downstream branch in sequence onto the one before it.
# Stops at the first conflict and tells you exactly what to do next.

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

START_BRANCH="${1:-}"

if [[ -z "$START_BRANCH" ]]; then
  echo "Usage: $0 <branch-you-just-changed>"
  echo ""
  echo "Branches:"
  for b in "${BRANCHES[@]}"; do echo "  $b"; done
  exit 1
fi

# Find the index of the starting branch
start_idx=-1
for i in "${!BRANCHES[@]}"; do
  if [[ "${BRANCHES[$i]}" == "$START_BRANCH" ]]; then
    start_idx=$i
    break
  fi
done

if [[ $start_idx -eq -1 ]]; then
  echo "Error: '$START_BRANCH' not found in the branch list."
  exit 1
fi

if [[ $start_idx -eq $(( ${#BRANCHES[@]} - 1 )) ]]; then
  echo "Nothing to cascade — '$START_BRANCH' is the last branch."
  exit 0
fi

ORIGINAL_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Only restore if we're not mid-rebase
restore_branch() {
  if ! git rebase --show-current-patch &>/dev/null 2>&1; then
    git checkout "$ORIGINAL_BRANCH" --quiet 2>/dev/null || true
  fi
}
trap restore_branch EXIT

for (( i=start_idx+1; i<${#BRANCHES[@]}; i++ )); do
  onto="${BRANCHES[$i-1]}"
  branch="${BRANCHES[$i]}"

  echo "[$i/${#BRANCHES[@]}] Rebasing $branch onto $onto..."
  git checkout "$branch" --quiet

  if ! git rebase "$onto" --quiet; then
    trap - EXIT
    echo ""
    echo "Conflict in $branch rebasing onto $onto."
    echo ""
    echo "Resolve the conflict, then:"
    echo "  git rebase --continue"
    echo "  git push --force-with-lease origin $branch"
    echo ""
    echo "Then re-run to continue the cascade:"
    echo "  $0 $branch"
    exit 1
  fi

  git push --force-with-lease origin "$branch" --quiet
  echo "  Pushed."
done

git checkout "$ORIGINAL_BRANCH" --quiet
trap - EXIT

echo ""
echo "Cascade complete."
