/**
 * cc-community Skill for Claude Code
 *
 * Installation:
 *   1. Clone the repo and run `pnpm build`
 *   2. In Claude Code: `/skill add cc-community /path/to/packages/skill`
 *   3. Configure your API endpoint: set `CC_COMMUNITY_API_URL` env var
 *   4. Register: `/cc-community register`
 *
 * This skill exposes the following slash commands:
 *
 * ── Auth ──
 *   /cc-community register [--github|--wallet]  - Register/link your account
 *   /cc-community profile                         - View your profile
 *
 * ── Messaging ──
 *   /cc-community send <message> [--to @user]   - Send a public message or DM
 *   /cc-community inbox                          - View your direct messages
 *   /cc-community feed                           - View public message feed
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
 * ── Payments ──
 *   /cc-community balance                         - Check your balance
 *   /cc-community pay task <id>                   - Fund a task you created
 *   /cc-community payment history                 - View your payment history
 */

// When this skill is loaded by Claude Code, the instructions above describe
// how to interact with the cc-community ecosystem. The actual HTTP calls
// are handled by Claude Code following these instructions, using the
// ApiClient class imported below for structured API interactions.

export { ApiClient } from "./api/client.js";
