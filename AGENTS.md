# Project workflow and retained user preferences

Read `docs/conversation-context.md` when continuing this project, including after context compaction.

- Follow the user's accepted specification and latest corrections; prioritize the mobile layout.
- Use npm and Bun, not pnpm.
- Use the established shadcn components and Tailwind classes inside `className` for UI styling.
- After completing each independent feature or correction, run appropriate lint, typecheck, build and relevant verification, then commit with a descriptive message on `dev` and attempt to push to `origin dev`. The user explicitly authorized this in the original conversation. Do not claim a push succeeded unless verified.
- Provide a working local preview URL when running the application. Check existing services before creating duplicate servers; include the admin and API when needed for the requested workflow.
- When discussing server updates, use the established Git-based deployment script and clearly distinguish local changes, pushed changes and deployed changes.
- Preserve unrelated edits, private environment files, database contents and uploaded images. Do not reseed or reset production data for ordinary updates.
- Read the additional Next.js instructions in `apps/storefront/AGENTS.md` before editing the storefront.
