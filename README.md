# CC Community

> "Claude Code is the most productive I've ever been — but I'm coding alone. There's no water cooler, no pull request comments, no way to say 'hey, anyone else run into this?'"

Claude Code changes *how* we code. But it doesn't change *who* we code with — or rather, who we *don't* code with. When you're in the zone with an AI agent, you're also invisible to every other developer.

**cc-community fixes that.** It's an open-source skill ecosystem that turns Claude Code from a solo cockpit into a shared space. Send messages to other Claude Code users. Publish tasks with bounties. Get help. Help others. All without leaving your terminal.

**Who this is for:**
- **Claude Code users** who want to connect with other users
- **Solo developers** who miss the community aspect of open source
- **Anyone with a problem** who'd rather pay for a solution than build it alone

## Quick start — 60 seconds

```bash
# Prerequisites: Node.js 20+, pnpm 8+, Docker

git clone https://github.com/AllenSu007/cc-community.git
cd cc-community
pnpm install
cp packages/api/.env.example packages/api/.env
cd packages/api && npx prisma db push && cd ../..
pnpm build
```

Then in Claude Code, add the skill and start the server:

> `/skill add cc-community ./packages/skill`
>
> `/cc-community server start`

```
→ Health:   {"ok":true}
→ API:      http://localhost:3001
→ Database: PostgreSQL on localhost:5432
```

> `/cc-community register`
>
> `/cc-community send "Hello cc-community!"`

## See it work

```
Claude Code User A:
    /cc-community server start

    → Starting PostgreSQL... done
    → Starting API server... API ready at http://localhost:3001

    /cc-community register

    → Registered as testuser

    /cc-community send "Anyone have a good pattern for
                         rate-limiting with Hono?"

    → Public message posted to the feed

Claude Code User B:
    /cc-community feed

    → [testuser] Anyone have a good pattern for
                  rate-limiting with Hono?

    /cc-community send @testuser "Check out the @hono/rate-limiter package"

    → DM sent privately to testuser

Claude Code User A:
    /cc-community inbox

    → [user2] Check out the @hono/rate-limiter package

    /cc-community task create --title "Build a landing page" \
      --desc "Responsive page with Tailwind" --reward 50

    → Task created (OPEN) — 50 USD bounty

Claude Code User B:
    /cc-community task accept cmoy5...

    → Task ASSIGNED

    /cc-community task submit cmoy5... --proof "Done. Link: ..."

    → Task SUBMITTED — awaiting confirmation

Claude Code User A:
    /cc-community task complete cmoy5...

    → Task COMPLETED — reward released to assignee
```

Two users, one community, zero context switching.

## Commands

| Command | What it does |
|---------|-------------|
| `/cc-community server start` | Start PostgreSQL + API server |
| `/cc-community server stop` | Stop the API server |
| `/cc-community server status` | Check if services are running |
| `/cc-community server restart` | Restart the API server |
| `/cc-community register` | Register with GitHub or wallet address |
| `/cc-community profile` | View your profile |
| `/cc-community send <message>` | Post to the public message feed |
| `/cc-community send @user <message>` | Send a private direct message |
| `/cc-community inbox` | Read your direct messages |
| `/cc-community feed` | Browse the public message feed |
| `/cc-community task create --title "..." --desc "..." --reward 50 [--currency USDC] [--payment crypto]` | Create a bounty task |
| `/cc-community task list [--status open]` | List available tasks |
| `/cc-community task show <id>` | View task details |
| `/cc-community task accept <id>` | Accept an open task |
| `/cc-community task submit <id> --proof "..."` | Submit your completed work |
| `/cc-community task complete <id>` | Confirm completion (creator only) |
| `/cc-community task cancel <id>` | Cancel a task (creator only) |
| `/cc-community balance` | Check your payment balance |
| `/cc-community payment history` | View your payment history |

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│  Claude Code    │     │  Claude Code    │
│  + cc-community │     │  + cc-community │
│  Skill (You)    │     │  Skill (Others) │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └──────────┬────────────┘
                    │ HTTPS / JSON
            ┌───────┴────────┐
            │  API Server    │
            │  (Hono + Node) │
            └───────┬────────┘
                    │
         ┌──────────┼──────────────┐
         │          │              │
    PostgreSQL   Stripe       Crypto RPC
    (messages,   (fiat        (USDC
     users,      payments)    escrow)
     tasks)
```

## Packages

| Package | What it is |
|---------|-----------|
| `@cc-community/shared` | TypeScript types and DTOs shared between API and Skill |
| `@cc-community/api` | Hono backend — routes, services, Prisma schema |
| `@cc-community/skill` | Claude Code skill — the package users install |

## How payments work

Two payment methods, one purpose: make sure task creators and solvers can
transact without trust.

**Stripe (fiat):** Creator funds a PaymentIntent when creating the task. The
payment is authorized but not captured. When the creator confirms completion,
the payment is captured and released to the assignee.

**Crypto (USDC):** Creator sends USDC to an escrow address. The task can't be
completed until the creator releases the funds to the assignee's wallet.

Both flows use the same state machine: PENDING → ESCROW → COMPLETED.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
