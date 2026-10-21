# Repo Operations

Scripts for maintaining the multi-branch structure of this repo. None of these are part of the starter kit app.

## `scripts/cascade-rebase.sh`

Rebases every downstream branch in sequence after a change is made to one branch. Pass the branch you just changed; the script walks from there to `main`, rebasing each onto the one before it. Stops at the first conflict and prints exactly what to do next.

```sh
./scripts/cascade-rebase.sh post/03-local-dev-setup
```

On conflict: resolve it, run `git rebase --continue`, push with `--force-with-lease`, then re-run with the conflicting branch as the argument to continue the cascade.

## `scripts/pr-merge-conflict-check.sh`

Checks the open PR for each branch via the GitHub API and reports merge conflict status. Uses the `gh` CLI for auth.

```sh
./scripts/pr-merge-conflict-check.sh
```

## `run-on-branches.sh`

Iterates through all branches and runs whatever commands are in the `# --- commands go here ---` block. Edit the script to add or remove commands. Restores your original branch on exit, even on failure. If commands produce git changes, wraps the commit/push in an `if ! git diff --quiet` check so it only commits when something actually changed.

```sh
./run-on-branches.sh
```

## `scripts/biome-on-all-branches.sh`

Pre-wired version of `run-on-branches.sh` that runs `biome lint --fix` and `biome format --fix` on every branch, then commits and pushes if there are changes.

```sh
./scripts/biome-on-all-branches.sh
```
