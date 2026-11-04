# Repository workflow

## Development requirements

- Keep the original `three_steps_behind_me_level1_v2.html` and `three_steps_codex_handoff.md` as behavioral references unless the user explicitly asks to change them.
- Do not change level 1 rules or its verified 11-step route without explicit user approval.
- Before declaring a development batch complete, run `npm test` and `npm run build`.

## Version-control requirements

- After each completed development batch with passing checks, stage the intended files, create a clear Git commit, and push it to the configured `origin` remote.
- Do not push partial work, failing builds, generated `node_modules/` content, production `dist/` output, credentials, tokens, or local environment files.
- Use concise commit messages that describe the completed feature or fix.
- Report the commit hash and remote repository URL in the final handoff.
- If authentication or network access prevents pushing, keep the verified commit locally and clearly report the blocker instead of silently skipping synchronization.
