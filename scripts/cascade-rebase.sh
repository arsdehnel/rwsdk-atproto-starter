#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/cascade-rebase.sh <branch-you-just-changed>
# Rebases every downstream branch in sequence onto the one before it.
# Stops at the first conflict and tells you exactly what to do next.

BRANCHES=(
  post/series-1/01-get-started
  post/series-1/02-atp-oauth
  post/series-1/03-local-dev
  post/series-1/04-atp-writes
  post/series-1/05-tap-sync
  post/series-2/01-production-oauth
  post/series-2/02-d1-tap-pipeline
  post/series-2/03-appview-features
  post/series-2/04-production-ready
  # post/series-2/05-??? — uncomment and set name when branch is created
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

# Pre-flight: verify the cascade is healthy before making any changes.
# --cascade-from tells the check that divergence downstream of START_BRANCH is
# expected (those branches are what this cascade is about to fix).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Running pre-flight cascade health check..."
if ! "$SCRIPT_DIR/check-cascade.sh" --cascade-from "$START_BRANCH"; then
  echo ""
  echo "Fix the errors above before running the cascade."
  exit 1
fi

ORIGINAL_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Record each branch's current tip before the cascade begins.
# Used with --onto so each rebase only replays the branch's own unique commits,
# not the entire upstream history (which causes spurious conflicts after any
# intermediate branch is modified and gets new SHAs).
# Uses a plain indexed array (bash 3.2-compatible; no declare -A needed).
OLD_TIPS=()
for i in "${!BRANCHES[@]}"; do
  OLD_TIPS[$i]=$(git rev-parse "${BRANCHES[$i]}" 2>/dev/null) || true
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
  old_onto_tip="${OLD_TIPS[$((i-1))]}"

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

# Post-cascade health check to catch any spurious commit buildup.
"$SCRIPT_DIR/check-cascade.sh"
