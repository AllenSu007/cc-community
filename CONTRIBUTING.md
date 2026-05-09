# Contributing

## Development Setup

```bash
pnpm install
cp packages/api/.env.example packages/api/.env
docker compose up -d postgres
cd packages/api && pnpm db:push && cd ../..
pnpm dev
```

## Project Structure

- `packages/shared/` — Types shared between API and Skill
- `packages/api/` — Hono server, routes, services, Prisma schema
- `packages/skill/` — Claude Code skill package

## Coding Conventions

- TypeScript strict mode across all packages
- ESM modules (`"type": "module"`)
- No semicolons (Prettier default)
- Functions over classes for services
- Route handlers thin, business logic in services

## Pull Request Process

1. Ensure all builds pass: `pnpm build && pnpm typecheck`
2. Update README.md if adding new commands
3. Update Prisma schema if adding/modifying models, then run `pnpm db:generate`
4. Keep PRs focused — one feature per PR
