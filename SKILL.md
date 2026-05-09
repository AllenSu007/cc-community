---
name: cc-community
preamble-tier: 1
version: 1.0.0
description: |
  Community-contributed skills for Claude Code — messaging, tasks, and bounties
  with Stripe fiat + crypto support.
allowed-tools:
  - Bash
  - Read
triggers:
  - /cc-community
---

# cc-community Skill

This skill enables cc-community commands (`/cc-community`) in Claude Code.
It provides messaging and task-bounty functionality for Claude Code users.

## Prerequisites

Before using these commands, you need a running cc-community API server:

1. Set `CC_COMMUNITY_API_URL` (default: http://localhost:3001)
2. Set `CC_COMMUNITY_PROJECT_PATH` if running the server from outside the project directory
3. Run through the [Installation](#installation) steps below first
4. Start the server with `/cc-community server start`
5. Register with `/cc-community register`

## Commands

### Server Management

Use `/cc-community server start` to start the backend. When the user runs this:

1. Navigate to the project root (from `CC_COMMUNITY_PROJECT_PATH` or the current directory)
2. Run `docker compose up -d postgres` to start PostgreSQL
3. Run `pnpm dev` to start the Hono API server
4. Verify the server is running: `curl $CC_COMMUNITY_API_URL/health` should return `{"ok":true}`
5. Report the API URL to the user

Use `/cc-community server stop` to stop the API server:
1. Run `pkill -f "tsx.*index.ts"` to kill the dev server process
2. Confirm to the user

Use `/cc-community server status` to check service status:
1. Check PostgreSQL: `docker compose exec postgres pg_isready -U cc_community`
2. Check API: `curl $CC_COMMUNITY_API_URL/health`
3. Report both statuses

Use `/cc-community server restart` to restart:
1. Stop the API server
2. Wait 1 second
3. Start the API server again
4. Verify health

### Auth

Use `/cc-community register` to register a user:

**GitHub (device flow — recommended for CLI):**
1. Request a device code from GitHub: `POST https://github.com/login/device/code` with `client_id` + `scope=read:user` → get `{ device_code, user_code, verification_uri, interval }`
2. Tell the user to visit `verification_uri` and enter the `user_code`
3. Poll `POST https://github.com/login/oauth/access_token` with `client_id` + `device_code` + `grant_type=urn:ietf:params:oauth:grant-type:device_code`, every `interval` seconds, until you get `{ access_token }`
4. Exchange it via `POST /api/auth/github/token` with `{ accessToken }`
5. Store the returned JWT

**Wallet authentication:**
1. Prompt for wallet address, signature, and message
2. POST `/api/auth/wallet` with `{ walletAddress, signature, message }`
3. Store the returned JWT token

Use the JWT in the `Authorization: Bearer <token>` header for all subsequent API calls.

Use `/cc-community profile` to view user info:
1. GET `/api/auth/me`
2. Display username, displayName, bio, auth methods

### Messaging

Use `/cc-community send <message>` to post to the public message feed:
1. POST `/api/messages` with `{ content: "<message>", isPublic: true }`
2. Confirm the message was posted

Use `/cc-community send @username <message>` to send a private DM:
1. First look up the user (query users or use known user info)
2. POST `/api/messages` with `{ content: "<message>", receiverId: "<user-id>", isPublic: false }`
3. Confirm the DM was sent

Use `/cc-community inbox` to read direct messages:
1. GET `/api/messages/inbox`
2. Display messages with sender name, content, and timestamp

Use `/cc-community feed` to browse the public message feed:
1. GET `/api/messages/feed`
2. Display messages with sender name, content, and timestamp

### Tasks

Use `/cc-community task create --title "..." --desc "..." --reward 50 [--currency USDC] [--payment crypto]`:
1. POST `/api/tasks` with `{ title, description, rewardAmount, rewardCurrency, paymentMethod }`
2. Confirm the task was created with its ID and status

Use `/cc-community task list [--status open]`:
1. GET `/api/tasks?status=<status>&page=1&limit=20`
2. Display tasks with ID, title, reward, and status

Use `/cc-community task show <id>`:
1. GET `/api/tasks/<id>`
2. Display full task details

Use `/cc-community task accept <id>`:
1. POST `/api/tasks/<id>/assign`
2. Confirm the task is now assigned

Use `/cc-community task submit <id> --proof "..."`:
1. POST `/api/tasks/<id>/submit` with `{ proof }`
2. Confirm the task is submitted for review

Use `/cc-community task complete <id>`:
1. POST `/api/tasks/<id>/complete`
2. Confirm the task is completed and reward released

Use `/cc-community task cancel <id>`:
1. POST `/api/tasks/<id>/cancel`
2. Confirm the task is cancelled

### Payments

Use `/cc-community balance`:
1. GET `/api/payments/balance`
2. Display Stripe and crypto balances

Use `/cc-community payment history`:
1. GET `/api/payments/history`
2. Display payment transactions

Use `/cc-community pay task <id>`:
1. Ask the user for payment method (Stripe or crypto)
2. For Stripe: POST `/api/payments/stripe/create-payment-intent` → display clientSecret
3. For crypto: ask for txHash, POST `/api/payments/crypto/escrow` with `{ taskId, txHash }`

## Installation

### System Requirements

Before installing, make sure you have:

- **Node.js** 20+
- **pnpm** 8+
- **Docker** (for PostgreSQL)

### Step 1: Clone and set up the project

```bash
git clone https://github.com/AllenSu007/cc-community.git
cd cc-community
pnpm install
cp packages/api/.env.example packages/api/.env
```

### Step 2: Configure environment variables

Edit `packages/api/.env` and fill in the required values:

```env
DATABASE_URL=postgresql://cc_community:cc_community_dev@localhost:5432/cc_community
JWT_SECRET=<generate-a-random-secret>
PORT=3001

# GitHub OAuth (required for GitHub login)
# 1. Go to https://github.com/settings/developers → OAuth Apps → New OAuth App
# 2. Set Authorization callback URL to http://localhost:3001
# 3. Copy the Client ID and Client Secret here:
GITHUB_CLIENT_ID=Ov23liEXAMPLE           # replace with your Client ID
GITHUB_CLIENT_SECRET=ghp_EXAMPLESECRET    # replace with your Client Secret

# Stripe (optional — required for payment features)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

> **Note:** `JWT_SECRET` is used to sign auth tokens. Generate one with:
> ```bash
> openssl rand -hex 32
> ```

### Step 3: Initialize the database

```bash
cd packages/api
npx prisma db push
cd ../..
pnpm build
```

This creates the PostgreSQL tables (User, Message, Task, Payment).

### Step 4: Install the marketplace plugin

Add this repo as a marketplace in `~/.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "cc-community-marketplace": {
      "source": {
        "source": "github",
        "repo": "AllenSu007/cc-community"
      }
    }
  },
  "enabledPlugins": {
    "cc-community@cc-community-marketplace": true
  }
}
```

Restart Claude Code — the `/cc-community` commands will be available globally.

> **Alternative (no marketplace):** You can also add the skill directly with:
> ```
> /skill add cc-community ./packages/skill
> ```

### Step 5: Start the server

In Claude Code, run:

```
/cc-community server start
```

You should see:
```
→ PostgreSQL is running
→ Health: {"ok":true}
→ API: http://localhost:3001
```

## Getting Started — GitHub OAuth Example

This example walks through two users (Alice and Bob) setting up cc-community and communicating with each other.

### Setup (one-time)

Both users clone and start the server on the same machine (or network):

```bash
git clone https://github.com/AllenSu007/cc-community.git
cd cc-community
pnpm install
cp packages/api/.env.example packages/api/.env
# Edit .env: set GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, JWT_SECRET
cd packages/api && npx prisma db push && cd ../..
pnpm build
```

Start the server:
```
/cc-community server start
```

### Alice registers and posts to the feed

Alice creates a GitHub OAuth app at https://github.com/settings/developers (no callback URL needed for device flow):

| Field | Example value |
|-------|---------------|
| Application name | `cc-community-local` |
| Homepage URL | `http://localhost:3001` |
| Authorization callback URL | *(leave empty for device flow)* |

She gets:
- **Client ID**: `Ov23liEXAMPLE` (fake)
- **Client Secret**: `ghp_EXAMPLESECRETabc` (fake)

She puts these in `packages/api/.env`, then starts the server and registers:

```
/cc-community register
```

Claude Code asks: *How would you like to register?*

Alice picks **GitHub OAuth**. Claude Code uses the device flow — it tells her:
```
→ Go to https://github.com/login/device and enter: ABCD-1234
```

Alice opens the link in her browser, enters the code, and authorizes the app. Claude Code detects the authorization automatically:

```
→ Registered as alice-dev
→ Token: eyJhbGciOiJIUzI1NiIs...
```

Now Alice posts to the public feed:
```
/cc-community send "Anyone building with Hono? I'd love to chat!"
```

```
→ Message posted to public feed
```

### Bob registers and replies

Bob repeats the same registration process:

```
/cc-community register
→ Go to https://github.com/login/device and enter: WXYZ-5678
```

Bob authorizes in his browser, and Claude Code completes the registration:

```
→ Registered as bob-coder
```

Bob checks the public feed:
```
/cc-community feed
```

```
→ alice-dev: Anyone building with Hono? I'd love to chat!
```

Bob sends Alice a direct message:
```
/cc-community send @alice-dev "Hey! I've been using Hono for a few weeks. Happy to help."
```

```
→ DM sent privately to alice-dev
```

### Alice checks her inbox

```
/cc-community inbox
```

```
→ bob-coder (12:34 UTC): Hey! I've been using Hono for a few weeks. Happy to help.
```

Two users, one community — all inside Claude Code.
