#!/usr/bin/env bash
# Run Celery worker using the project venv (avoids "bad interpreter" from system celery).
# From repo root:  ./apps/ai-worker/run_worker.sh
# From apps/ai-worker:  ./run_worker.sh
set -e
cd "$(dirname "$0")"
exec uv run celery -A src.celery_app:app worker -Q ingestion --loglevel=info "$@"
