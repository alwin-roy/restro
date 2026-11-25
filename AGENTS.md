<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Restro — AI Coding Agent Guidelines

## 1. Single Source of Truth: HANDOFF.md
All AI agents working on this project must consult and maintain [HANDOFF.md](file:///c:/Users/alwin/Documents/freelancing/restro/HANDOFF.md) located in the project root.

### Mandatory Workflow for Every Agent Session:
1. **At the start of every task:** Read `HANDOFF.md` to understand the current architecture, completed features, technology stack, and previous development decisions.
2. **During the task:**
   - Adhere strictly to the single-restaurant architecture (NOT a SaaS / multi-tenant app).
   - Prioritize mobile-first responsive design across all viewports.
   - Respect client/server component boundaries.
   - Do not implement unrequested features or mock databases.
   - Never commit sensitive secrets or credentials.
3. **At the end of every task:**
   - Update `HANDOFF.md` incrementally with any changes, updated status, or architectural decisions.
   - Append a new entry to the Change Log (Section G) detailing the date, files modified/created, validation results, and next steps.
   - Provide a brief handoff summary in your final response to the user.

