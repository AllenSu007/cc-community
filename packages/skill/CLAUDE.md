# cc-community Skill

This skill enables cc-community commands (`/cc-community`) in Claude Code.
It provides messaging and task-bounty functionality for Claude Code users.

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
1. Request a device code from GitHub:
   ```bash
   curl -s -X POST https://github.com/login/device/code \
     -H "Accept: application/json" \
     -d "client_id=$GITHUB_CLIENT_ID&scope=read:user"
   ```
   → returns `{ device_code, user_code, verification_uri, interval }`
2. Tell the user to visit `verification_uri` (usually `https://github.com/login/device`) and enter the `user_code`
3. Poll GitHub every `interval` seconds until the user authorizes:
   ```bash
   curl -s -X POST https://github.com/login/oauth/access_token \
     -H "Accept: application/json" \
     -d "client_id=$GITHUB_CLIENT_ID&device_code=$DEVICE_CODE&grant_type=urn:ietf:params:oauth:grant-type:device_code"
   ```
   → repeat until you get `{ access_token }` (not `{ error: "authorization_pending" }`)
4. POST the `accessToken` to the API: `POST /api/auth/github/token` with `{ accessToken }`
5. Store the returned JWT token

**Wallet authentication:**
1. Prompt for wallet address, signature, and message
2. POST `/api/auth/wallet` with `{ walletAddress, signature, message }`
3. Store the returned JWT token

Store the JWT and use it in the `Authorization: Bearer <token>` header for all subsequent API calls.

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

## Environment Variables

- `CC_COMMUNITY_API_URL` — API server URL (default: http://localhost:3001)
- `CC_COMMUNITY_PROJECT_PATH` — path to the cc-community project root for server management commands
