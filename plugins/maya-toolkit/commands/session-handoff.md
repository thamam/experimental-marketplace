---
name: session-handoff
description: Prepare comprehensive end-of-session handoff document
---

# Session Handoff Skill

Prepare a comprehensive handoff document for the next session.

## When to Use

- End of work day
- Context approaching 90%+ capacity
- Before major context-heavy task
- User says "going to bed", "done for today", etc.

## Execution Steps

1. **Git Status Check**
   - Current branch
   - Uncommitted changes
   - Recent commits (last 10)
   - Unpushed commits

2. **Todo State Capture**
   - Export current todos (if any)
   - Identify in-progress tasks
   - List pending tasks

3. **Linear Integration**
   - List issues created/updated today
   - Check issue states
   - Note any blocking issues

4. **PR Status**
   - List open PRs
   - Check merged PRs from today
   - Note any failing checks

5. **Test Status**
   - Recent test runs
   - Known failures
   - Test coverage changes

6. **Write SESSION_HANDOFF.md**

Structure:
```markdown
# Maya AI - Session Handoff
**Date**: YYYY-MM-DD
**Session Focus**: [Main work done]

## 🎯 Current State
- Repository status (branch, uncommitted changes)
- Service states
- Test results

## ✅ Completed This Session
- Major achievements
- PRs merged
- Linear issues closed
- Documentation added

## 📊 Key Metrics
- Lines of code changed
- Tests added/fixed
- Issues resolved

## 🚀 Ready for Tomorrow
### Next Phase Priorities
1. [Priority 1 with context]
2. [Priority 2 with context]
3. [Priority 3 with context]

### Available Resources
- New skills/agents created
- Reference files
- Documentation links

## 🔧 Quick Start Commands
[Essential commands for next session]

## ⚠️ Known Issues
[Blockers, failures, technical debt]

## 📁 Important File Locations
[Key files modified/created]

## 💡 Recommendations for Next Session
- Session management advice
- Workflow tips
- Context preservation notes

## 📞 Handoff Checklist
- [ ] All work committed/pushed
- [ ] PRs created/merged
- [ ] Linear issues updated
- [ ] Tests verified
- [ ] Next priorities identified
```

7. **Confirmation**
   - Summarize what was captured
   - Confirm handoff document location
   - Suggest session restart if context >90%

## Output

- File: `SESSION_HANDOFF.md` in repo root
- Summary message to user
- Context usage report
