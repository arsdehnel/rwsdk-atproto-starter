#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/cascade-rebase.sh <branch-you-just-changed>
# Rebases every downstream branch in sequence onto the one before it.
# Stops at the first conflict and tells you exactly what to do next.

BRANCHES=(
  post/01-first-read
  post/02-atproto-oauth
  post/03-local-dev-setup
  post/04-atproto-writes
  post/05-tap-sync
  post/06-d1-persistence
  post/07-appview
  main
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

# Record each branch's current tip before the cascade begins.
# Used with --onto so each rebase only replays the branch's own unique commits,
# not the entire upstream history (which causes spurious conflicts after any
# intermediate branch is modified and gets new SHAs).
declare -A OLD_TIPS
for b in "${BRANCHES[@]}"; do
  OLD_TIPS[$b]=$(git rev-parse "$b" 2>/dev/null) || true
done

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
  old_onto_tip="${OLD_TIPS[$onto]}"

  echo "[$i/${#BRANCHES[@]}] Rebasing $branch onto $onto..."
  git checkout "$branch" --quiet

  if ! git rebase --onto "$onto" "$old_onto_tip" --quiet; then
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
echo ""

# Run the health check to catch any spurious commit buildup early.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -x "$SCRIPT_DIR/check-cascade.sh" ]]; then
  "$SCRIPT_DIR/check-cascade.sh"
fi
