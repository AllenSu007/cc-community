/**
 * Server management commands for cc-community skill.
 *
 * These commands are invoked when Claude Code runs:
 *   /cc-community server start
 *   /cc-community server stop
 *   /cc-community server status
 *   /cc-community server restart
 *
 * The actual execution uses the `cc-community-server` CLI script.
 * Claude Code reads these instructions and runs the appropriate shell commands.
 *
 * ## Environment
 *
 * - `CC_COMMUNITY_PROJECT_PATH` — path to the cc-community project root
 *   (optional; defaults to current working directory or auto-detection)
 * - `CC_COMMUNITY_API_URL` — API server URL (default: http://localhost:3001)
 *
 * ## Command implementations
 *
 * ### /cc-community server start
 * 1. Run `cc-community-server start` (or the equivalent docker/pnpm commands)
 * 2. Wait for health check at $CC_COMMUNITY_API_URL/health
 * 3. Report the API URL to the user
 *
 * ### /cc-community server stop
 * 1. Kill the API server process
 * 2. Confirm to the user
 *
 * ### /cc-community server status
 * 1. Check PostgreSQL connectivity
 * 2. Check API health endpoint
 * 3. Report status to the user
 *
 * ### /cc-community server restart
 * 1. Stop the server
 * 2. Start the server
 */

export const serverCommands = {
  start: {
    description: "Start PostgreSQL and the cc-community API server",
    usage: "/cc-community server start",
    steps: [
      'Run: docker compose up -d postgres (from project root)',
      'Run: pnpm dev (starts the Hono API server)',
      'Verify: curl $CC_COMMUNITY_API_URL/health returns {"ok":true}',
    ],
  },
  stop: {
    description: "Stop the cc-community API server",
    usage: "/cc-community server stop",
    steps: [
      'Run: pkill -f "tsx.*index.ts" (kills the API dev server)',
      'Confirm to the user that the server stopped',
    ],
  },
  status: {
    description: "Check if PostgreSQL and the API server are running",
    usage: "/cc-community server status",
    steps: [
      'Check PostgreSQL: docker compose exec postgres pg_isready -U cc_community',
      'Check API: curl $CC_COMMUNITY_API_URL/health',
      'Report both statuses to the user',
    ],
  },
  restart: {
    description: "Restart the API server",
    usage: "/cc-community server restart",
    steps: [
      'Stop: pkill -f "tsx.*index.ts"',
      'Wait 1 second',
      'Start: pnpm dev',
      'Verify: curl $CC_COMMUNITY_API_URL/health',
    ],
  },
};
