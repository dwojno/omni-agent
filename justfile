default:
    just --list

run:
    pnpm concurrently "pnpm just ai run" "just web run"

web *ARGS:
    pnpm just -f ./apps/web/justfile {{ARGS}}

ai *ARGS:
    pnpm just -f ./apps/ai-worker/justfile {{ARGS}}

