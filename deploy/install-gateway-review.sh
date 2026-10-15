#!/usr/bin/env bash
set -Eeuo pipefail

if [[ ${EUID} -eq 0 ]]; then
  printf 'Run as the sonatibehjati project user, not root.\n' >&2
  exit 1
fi
terminal_id=${1:-}
if [[ ! "$terminal_id" =~ ^[0-9]{1,10}$ ]]; then
  printf 'Usage: bash install.sh TERMINAL_ID\n' >&2
  exit 1
fi
bundle_directory=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
bundle_path="$bundle_directory/gateway-review.bundle"
if [[ ! -f "$bundle_path" ]]; then
  printf 'Keep install.sh next to gateway-review.bundle.\n' >&2
  exit 1
fi
project_directory=${SONATI_PROJECT_DIR:-/var/www/sonatibehjati}
cd "$project_directory"
if [[ ! -f apps/api/.env ]]; then
  printf 'Existing project and private API configuration are required.\n' >&2
  exit 1
fi
if ! git diff --quiet || ! git diff --cached --quiet; then
  printf 'Inspect and commit existing tracked edits before installing this release.\n' >&2
  exit 1
fi
git switch dev
if ! git bundle verify "$bundle_path"; then
  # Fetches existing prerequisite history only; the release itself comes from the bundle.
  git fetch origin dev
  git bundle verify "$bundle_path"
fi
git fetch "$bundle_path" dev
git merge --ff-only FETCH_HEAD
npm run payments:review -- "--terminal-id=$terminal_id"
bash deploy/update-production.sh
printf '\nRelease installed. Keep payment-review.conf in Nginx; use /admin/payment-test as the owner.\n'
