---
name: session-resume
description: Load previous session handoff and restore context
---

# Session Resume Skill

Resume work from previous session by loading handoff document and restoring context.

## When to Use

- Start of new session
- After session restart
- When SESSION_HANDOFF.md exists and is recent (<24h)

## Execution Steps

1. **Check for Handoff Document**
   - Look for `SESSION_HANDOFF.md` in repo root
   - Verify it's recent (modified within last 24 hours)
   - If not found or stale, inform user and skip

2. **Read Handoff Document**
   - Parse all sections
   - Extract key information:
     - Current branch
     - Last commit
     - Next priorities
     - Known issues
     - Quick start commands

3. **Validate Git State**
   - Check current branch matches handoff
   - Warn if branch diverged
   - Check for uncommitted changes
   - List any new commits since handoff

4. **Restore Todo List**
   - Parse "Next Phase Priorities" section
   - Use TodoWrite to create todo items
   - Mark all as "pending" initially
   - Preserve priority order

5. **Check Linear Issues**
   - Verify mentioned issues still exist
   - Check if states changed since handoff
   - Alert if blocking issues resolved

6. **Verify Service States**
   - Quick health check (if services running)
   - Compare to handoff expectations
   - Note any discrepancies

7. **Summarize for User**
   - What session are we resuming from
   - What was completed
   - What's next (top 3 priorities)
   - Any warnings or changes detected

## Output Format

```
📂 Resuming Session from [Date]

✅ Last Session Completed:
- [Key achievement 1]
- [Key achievement 2]
- [Key achievement 3]

📋 Restored Todos:
1. [Priority 1 - pending]
2. [Priority 2 - pending]
3. [Priority 3 - pending]

⚠️ Notes:
- [Warning if git state changed]
- [Warning if Linear issues changed]
- [Any other important updates]

🎯 Ready to work on: [Top priority]
```

## Error Handling

- **No handoff found**: Inform user, ask what to work on
- **Stale handoff (>24h)**: Warn user, ask if still relevant
- **Git state mismatch**: Warn user, show differences
- **Handoff malformed**: Parse what's possible, warn about issues

## Integration Points

- TodoWrite: Restore task list
- Linear: Verify issue states
- Git: Validate repo state
- Bash: Check service health
