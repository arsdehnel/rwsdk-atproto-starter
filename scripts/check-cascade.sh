#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/check-cascade.sh [--cascade-from <branch>]
# Run this after a cascade rebase to verify the branch chain is healthy.
#
# --cascade-from <branch>: when provided, divergence from parent is treated as
#   an expected/informational note (not an error) for branches downstream of
#   <branch>. Use this for the pre-flight check before running a cascade, where
#   those branches are intentionally diverged and about to be rebased.
#
# Checks:
#   1. Each branch is cleanly based on the previous one (no divergence).
#   2. Each branch's unique commits contain no message that also appears in
#      the immediately preceding branch's unique commits (spurious duplicates).
#   3. post-config.tsx post numbers are sequential (1, 2, 3... or N/A).

BRANCHES=(
  post/series-1/01-get-started
  post/series-1/02-atp-oauth
  post/series-1/03-local-dev
  post/series-1/04-atp-writes
  post/series-1/05-tap-sync
  post/series-2/01-production-oauth
  post/series-2/02-d1-persistence
  post/series-2/03-appview-features
  post/series-2/04-deploy-prep
  post/series-2/05-next-steps
  main
)

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
DIM='\033[2m'
NC='\033[0m'

# Optional: branches downstream of this index get divergence demoted to a note.
cascade_from_idx=-1
if [[ "${1:-}" == "--cascade-from" && -n "${2:-}" ]]; then
  for i in "${!BRANCHES[@]}"; do
    if [[ "${BRANCHES[$i]}" == "$2" ]]; then
      cascade_from_idx=$i
      break
    fi
  done
fi

errors=0
warnings=0

pass() { echo -e "  ${GREEN}✓${NC} $*"; }
warn() { echo -e "  ${YELLOW}⚠${NC}  $*"; ((warnings++)) || true; }
fail() { echo -e "  ${RED}✗${NC} $*"; ((errors++)) || true; }
note() { echo -e "  ${DIM}·${NC} $*"; }

# Fetch a branch from origin if it doesn't exist locally.
ensure_branch() {
  local branch="$1"
  if ! git rev-parse --verify "$branch" &>/dev/null; then
    echo "  (fetching $branch from origin...)"
    git fetch origin "$branch:$branch" 2>/dev/null || true
  fi
}

echo ""
echo "Checking cascade health..."
echo ""

# Make sure every branch in the chain is available locally before checking.
for branch in "${BRANCHES[@]}"; do
  ensure_branch "$branch"
done
echo ""

for (( i=1; i<${#BRANCHES[@]}; i++ )); do
  parent="${BRANCHES[$i-1]}"
  branch="${BRANCHES[$i]}"

  echo "── $branch (parent: $parent)"

  # 1. Check that branch is cleanly based on parent (merge-base == parent tip)
  parent_tip=$(git rev-parse "$parent" 2>/dev/null) || { fail "branch $parent not found"; continue; }
  branch_tip=$(git rev-parse "$branch" 2>/dev/null) || { fail "branch $branch not found"; continue; }
  merge_base=$(git merge-base "$parent" "$branch" 2>/dev/null) || { fail "could not compute merge-base"; continue; }

  if [[ "$merge_base" == "$parent_tip" ]]; then
    pass "cleanly based on $parent"
  elif [[ $cascade_from_idx -ge 0 && $i -gt $cascade_from_idx ]]; then
    note "diverged from $parent — expected, will be fixed by cascade"
  else
    fail "DIVERGED from $parent (merge-base is $(git log --oneline -1 "$merge_base" 2>/dev/null), not parent tip)"
  fi

  # 2. Check for spurious duplicate commit messages
  # Same message in two adjacent branches usually means a migration commit was applied
  # independently to both rather than cascaded. It's a WARNING because the same message
  # can appear with legitimately different content (false positive). Treat it as a signal
  # to investigate, not a hard failure.
  unique_msgs=$(git log --format="%s" "$parent..$branch" 2>/dev/null)
  if [[ $i -ge 2 ]]; then
    grandparent="${BRANCHES[$i-2]}"
    parent_unique_msgs=$(git log --format="%s" "$grandparent..$parent" 2>/dev/null) || true
  else
    parent_unique_msgs=""
  fi

  if [[ -n "$parent_unique_msgs" && -n "$unique_msgs" ]]; then
    dupes=$(comm -12 \
      <(echo "$unique_msgs" | sort) \
      <(echo "$parent_unique_msgs" | sort) \
      2>/dev/null) || true
    if [[ -n "$dupes" ]]; then
      dupe_count=$(echo "$dupes" | wc -l | tr -d ' ')
      unique_count=$(echo "$unique_msgs" | wc -l | tr -d ' ')
      warn "$dupe_count commit message(s) also appear in $parent — possible spurious duplicates (verify content is different):"
      echo "$dupes" | while IFS= read -r line; do
        echo "        \"$line\""
      done
    else
      unique_count=$(echo "$unique_msgs" | wc -l | tr -d ' ')
      pass "$unique_count unique commit(s), no duplicate messages from parent"
    fi
  else
    unique_count=$(echo "$unique_msgs" | wc -l | tr -d ' ')
    pass "$unique_count unique commit(s)"
  fi

  # 3. Check step number in post-config.tsx (only for numbered post branches)
  expected_step=$(echo "$branch" | grep -oE '/0[0-9]-' | grep -oE '[0-9]+') || true
  if [[ -n "$expected_step" ]]; then
    expected_step=$((10#$expected_step))  # strip leading zero
    actual_step=$(git show "$branch:src/app/content/config.tsx" 2>/dev/null \
      | grep -oE '^\s+(step|post): [0-9]+,' | grep -oE '[0-9]+' | head -1) || actual_step=""
    if [[ -z "$actual_step" ]]; then
      warn "no step number found in post-config.tsx"
    elif [[ "$actual_step" == "$expected_step" ]]; then
      pass "post-config step: $actual_step"
    elif [[ $cascade_from_idx -ge 0 && $i -gt $cascade_from_idx ]]; then
      note "post-config step is $actual_step, expected $expected_step — stale, will be fixed"
    else
      fail "post-config step is $actual_step, expected $expected_step"
    fi
  fi

  echo ""
done

echo "────────────────────────────────"
if [[ $errors -gt 0 ]]; then
  echo -e "${RED}$errors error(s)${NC} — cascade needs attention."
  exit 1
elif [[ $warnings -gt 0 ]]; then
  echo -e "${YELLOW}$warnings warning(s)${NC} — review suggested."
  exit 0
else
  echo -e "${GREEN}All checks passed.${NC}"
fi
