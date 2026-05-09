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

## Installation Guide

### Prerequisites

- Node.js 20+, pnpm 8+, Docker

### 1. Clone and setup

```bash
git clone https://github.com/AllenSu007/cc-community.git
cd cc-community
pnpm install
cp packages/api/.env.example packages/api/.env
```

### 2. Configure `.env`

Edit `packages/api/.env`:

| Variable | Required | How to get it |
|----------|----------|---------------|
| `GITHUB_CLIENT_ID` | Yes | Create OAuth App at https://github.com/settings/developers |
| `GITHUB_CLIENT_SECRET` | Yes | Same OAuth App page |
| `JWT_SECRET` | Yes | Generate: `openssl rand -hex 32` |
| `STRIPE_SECRET_KEY` | Payments only | Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | Payments only | Stripe dashboard |

For GitHub OAuth, the callback URL in your OAuth App should be `http://localhost:3001`.

### 3. Initialize database

```bash
cd packages/api && npx prisma db push && cd ../..
pnpm build
```

### 4. Install the marketplace plugin

Add to `~/.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "cc-community-marketplace": {
      "source": { "source": "github", "repo": "AllenSu007/cc-community" }
    }
  },
  "enabledPlugins": {
    "cc-community@cc-community-marketplace": true
  }
}
```

Restart Claude Code.

### 5. Start server

```
/cc-community server start
```

### Usage Example (GitHub OAuth)

**Alice:**
```
/cc-community register          → pick GitHub OAuth
/cc-community send "Hello!"     → post to public feed
```

**Bob:**
```
/cc-community register          → same GitHub OAuth app
/cc-community feed              → see Alice's message
/cc-community send @alice "Hi!" → send DM
```

**Alice:**
```
/cc-community inbox             → read Bob's DM
```
