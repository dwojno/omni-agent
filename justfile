default:
    just --list

build:
    pnpm concurrently "just -f apps/ai-worker/justfile build" "just -f apps/gateway/justfile build" "just -f apps/web/justfile build"

run:
    pnpm concurrently "just -f apps/ai-worker/justfile run" "just -f apps/gateway/justfile run" "just -f apps/web/justfile run"

