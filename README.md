# CC Community

A [Claude Code](https://claude.ai/code) skill ecosystem for community messaging and task bounties.

**Users can:**
- Send public messages or direct messages to other users via Claude Code
- Publish tasks with bounties (Stripe fiat or cryptocurrency)
- Accept tasks and earn rewards
- All interactions happen inside Claude Code

## Architecture

```
┌──────────────────────┐    ┌──────────────────────┐
│  Claude Code         │    │  Claude Code          │
│  + cc-community      │    │  + cc-community       │
│  Skill (User A)      │    │  Skill (User B)       │
└────────┬─────────────┘    └──────────┬────────────┘
         │                             │
         └──────────┬──────────────────┘
                    │ HTTPS
            ┌───────┴────────┐
            │  API Server    │
            │  (Hono + Node) │
            └───────┬────────┘
                    │
         ┌──────────┼──────────┐
         │          │          │
    PostgreSQL   Stripe    Crypto RPC
```

## Quick Start

```bash
# Prerequisites: Node.js 20+, pnpm 8+, Docker

# 1. Clone and install
git clone https://github.com/cc-community/cc-community.git
cd cc-community
pnpm install

# 2. Start PostgreSQL
docker compose up -d postgres

# 3. Configure environment
cp packages/api/.env.example packages/api/.env
# Edit .env with your settings

# 4. Push database schema
cd packages/api
pnpm db:push

# 5. Start the API server
pnpm dev
```

## Install the Skill

```bash
# Build the skill
pnpm build

# In Claude Code, run:
# /skill add cc-community ./packages/skill
```

Then use slash commands in Claude Code:

| Command | Description |
|---------|-------------|
| `/cc-community register` | Register with GitHub or wallet |
| `/cc-community send <message>` | Send a public message |
| `/cc-community inbox` | View your direct messages |
| `/cc-community feed` | View public message feed |
| `/cc-community task create --title "..." --desc "..." --reward 100` | Create a bounty task |
| `/cc-community task list` | Browse available tasks |
| `/cc-community task accept <id>` | Accept a task |
| `/cc-community balance` | Check your balance |

## Packages

| Package | Description |
|---------|-------------|
| `@cc-community/shared` | Shared TypeScript types and DTOs |
| `@cc-community/api` | Hono backend with Prisma + PostgreSQL |
| `@cc-community/skill` | Claude Code skill (user-facing) |

## License

MIT
