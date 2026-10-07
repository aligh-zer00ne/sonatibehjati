#!/usr/bin/env bash
set -Eeuo pipefail

trap 'printf "Deployment failed at line %s. Existing PM2 processes were not restarted unless the failure happened during the restart step.\n" "$LINENO" >&2' ERR

if [[ ${EUID} -eq 0 ]]; then
  printf 'Run this script as the sonatibehjati user, not root.\n' >&2
  exit 1
fi

project_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$project_root"

if [[ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]]; then
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  # shellcheck disable=SC1091
  source "$NVM_DIR/nvm.sh"
  nvm use
fi

export PATH="$HOME/.bun/bin:$PATH"

for command_name in git node npm bun pm2 curl sha256sum flock; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    printf 'Required command is unavailable: %s\n' "$command_name" >&2
    exit 1
  fi
done

if [[ ! -f apps/api/.env ]]; then
  printf 'Missing private API environment file: apps/api/.env\n' >&2
  exit 1
fi

current_branch=$(git branch --show-current)
if [[ "$current_branch" != 'dev' ]]; then
  printf 'Expected branch dev, found: %s\n' "${current_branch:-detached HEAD}" >&2
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  printf 'Tracked files contain uncommitted changes. Commit or inspect them before deployment.\n' >&2
  git status --short
  exit 1
fi

state_directory="$project_root/.deployment/deploy-state"
mkdir -p "$state_directory"
exec 9>"$state_directory/deploy.lock"
if ! flock -n 9; then
  printf 'Another deployment is already running.\n' >&2
  exit 1
fi

dependency_hash=$(
  for dependency_file in bun.lock .nvmrc; do
    sha256sum "$dependency_file"
  done | sha256sum | awk '{print $1}'
)
dependency_hash_file="$state_directory/dependencies.sha256"
previous_dependency_hash=''
if [[ -f "$dependency_hash_file" ]]; then
  previous_dependency_hash=$(<"$dependency_hash_file")
fi

needs_install=false
if [[ "$dependency_hash" != "$previous_dependency_hash" ]]; then
  needs_install=true
fi
for required_binary in prisma eslint next; do
  if [[ ! -x "node_modules/.bin/$required_binary" ]]; then
    needs_install=true
  fi
done

if [[ "$needs_install" == true ]]; then
  printf '\nDependency definitions changed or node_modules is incomplete; running cached Bun install.\n'
  bun install --frozen-lockfile
else
  printf '\nDependency definitions are unchanged; skipping package installation.\n'
fi
printf '%s\n' "$dependency_hash" >"$dependency_hash_file"

printf '\nGenerating clients and checking the project.\n'
npm run db:generate
npm run codegen
npm run lint
npm run typecheck
npm run build

printf '\nApplying pending database migrations.\n'
npm run db:migrate

restart_or_start() {
  local application_name=$1
  if pm2 describe "$application_name" >/dev/null 2>&1; then
    pm2 restart "$application_name" --update-env
  else
    pm2 start deploy/ecosystem.config.js --only "$application_name"
  fi
}

printf '\nRestarting only this project.\n'
restart_or_start sonatibehjati-api
restart_or_start sonatibehjati-storefront
pm2 save

wait_for_url() {
  local label=$1
  local url=$2
  local attempt
  for attempt in {1..20}; do
    if curl --fail --silent --show-error --output /dev/null --max-time 5 "$url"; then
      printf '%s is healthy: %s\n' "$label" "$url"
      return 0
    fi
    sleep 1
  done
  printf '%s did not become healthy: %s\n' "$label" "$url" >&2
  return 1
}

printf '\nChecking local services.\n'
wait_for_url API http://127.0.0.1:4100/health
wait_for_url Storefront http://127.0.0.1:3100/

git rev-parse HEAD >"$state_directory/last-successful-commit"

printf '\nDeployment completed successfully at commit %s.\n' "$(git rev-parse --short HEAD)"
pm2 status
