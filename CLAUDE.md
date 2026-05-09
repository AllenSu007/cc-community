# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**cc-community** — A Claude Code skill ecosystem for community messaging and task bounties.
Users can send messages to each other and publish tasks with rewards (Stripe fiat + crypto).

## Commands

```bash
# Install dependencies
pnpm install

# Run all packages in dev mode (API + watch)
pnpm dev

# Build all packages
pnpm build

# Type-check all packages
pnpm typecheck

# API-specific
cd packages/api
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema to database
pnpm db:migrate     # Create a migration

# Server management (also available as skill commands)
./packages/skill/bin/cc-community-server start   # Start PostgreSQL + API
./packages/skill/bin/cc-community-server stop    # Stop API server
./packages/skill/bin/cc-community-server status  # Check services
```

## Architecture

Monorepo (`pnpm workspaces`) with three packages:

```
packages/
├── shared/          # Shared TypeScript types (DTOs, enums, request/response types)
├── api/             # Hono backend server (Express-like, Node.js)
│   ├── prisma/      # Prisma schema (User, Message, Task, Payment)
│   ├── src/routes/  # Route handlers — auth, messages, tasks, payments
│   ├── src/services/# Business logic — auth, message, task, payment-stripe
│   └── src/middleware/ # Auth middleware (JWT)
└── skill/           # Claude Code Skill package (installed by users)
    ├── skill.json   # Skill metadata
    └── src/api/     # API client for communicating with the backend
```

## Database (PostgreSQL via Prisma)

Key models:
- **User** — GitHub OAuth or wallet-based identity
- **Message** — Public feed messages or direct messages (sender → optional receiver)
- **Task** — Bounty lifecycle: OPEN → ASSIGNED → SUBMITTED → COMPLETED / CANCELLED
- **Payment** — Stripe (fiat) or crypto (USDC) with escrow support

## Key Design Decisions

- **Auth**: Dual identity (GitHub OAuth + EIP-4361 wallet signing), JWT tokens
- **Payments**: Hybrid. Stripe (PaymentIntent + webhook) for fiat, crypto for USDC escrow
- **Task lifecycle**: Strict state machine — creator assigns → assignee submits → creator approves
- **Messaging**: Public feed by default; set `receiverId` for DM
