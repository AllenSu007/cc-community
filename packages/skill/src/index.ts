/**
 * cc-community Skill for Claude Code
 *
 * Installation:
 *   1. Clone the repo and run `pnpm build`
 *   2. In Claude Code: `/skill add cc-community /path/to/packages/skill`
 *   3. Set `CC_COMMUNITY_API_URL` env var (default: http://localhost:3001)
 *   4. Optional: set `CC_COMMUNITY_PROJECT_PATH` if running from outside project directory
 *   5. Register: `/cc-community register`
 *
 * ── Server ──
 *   /cc-community server start                    - Start PostgreSQL + API server
 *   /cc-community server stop                     - Stop the API server
 *   /cc-community server status                   - Check if services are running
 *   /cc-community server restart                  - Restart the API server
 *
 *   When `/cc-community server start` is invoked:
 *     1. Run `docker compose up -d postgres` from the project root
 *     2. Start the API dev server with `pnpm dev`
 *     3. Verify at $CC_COMMUNITY_API_URL/health
 *
 * ── Auth ──
 *   /cc-community register                        - Register with GitHub or wallet
 *   /cc-community profile                         - View your profile
 *
 *   When `/cc-community register` is invoked:
 *     1. Ask the user if they want GitHub OAuth or wallet-based auth
 *     2. For GitHub: run the OAuth flow, POST /api/auth/github with the code
 *     3. For Wallet: prompt for wallet address + signature, POST /api/auth/wallet
 *     4. Store the returned JWT token for subsequent API calls
 *
 * ── Messaging ──
 *   /cc-community send <message>                  - Post to the public message feed
 *   /cc-community send @user <message>             - Send a private DM
 *   /cc-community inbox                           - View your direct messages
 *   /cc-community feed                            - Browse the public message feed
 *
 *   When sending a message:
 *     - POST /api/messages with { content, receiverId, isPublic }
 *     - Without @user: isPublic=true, receiverId=null
 *     - With @user: isPublic=false, receiverId=<user's id>
 *
 * ── Tasks ──
 *   /cc-community task create --title "..." --desc "..." --reward 100 [--currency USDC] [--payment stripe|crypto]
 *   /cc-community task list [--status open|assigned|submitted|completed]
 *   /cc-community task show <id>
 *   /cc-community task accept <id>
 *   /cc-community task submit <id> [--proof "..."]
 *   /cc-community task complete <id>
 *   /cc-community task cancel <id>
 *
 *   Task state machine: OPEN → ASSIGNED → SUBMITTED → COMPLETED
 *   A task can be CANCELLED by the creator at any point before COMPLETED.
 *
 * ── Payments ──
 *   /cc-community balance                         - Check your balance
 *   /cc-community pay task <id>                   - Fund a task you created
 *   /cc-community payment history                 - View your payment history
 *
 *   Stripe flow:
 *     POST /api/payments/stripe/create-payment-intent → returns clientSecret
 *     Stripe webhook handles completed/failed callbacks
 *
 *   Crypto flow:
 *     POST /api/payments/crypto/escrow  (fund with USDC)
 *     POST /api/payments/crypto/release (release to assignee on completion)
 *
 * ── API Reference ──
 *   Base URL: ${CC_COMMUNITY_API_URL:-http://localhost:3001}
 *   Auth:     Bearer token in Authorization header
 *   Content:  application/json
 */

export { ApiClient } from "./api/client.js";
export { serverCommands } from "./commands/server.js";
