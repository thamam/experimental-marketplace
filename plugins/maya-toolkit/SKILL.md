# Maya AI Toolkit - Agent Skills

## What This Plugin Does

The Maya AI Toolkit provides comprehensive development workflow automation for Maya AI projects:

- **Task Planning**: Autonomous task preparation with research, breakdown, and Linear issue creation
- **PR Review**: Visual code review walkthrough generation for Theia tool
- **Documentation**: Automated inline and comprehensive documentation
- **Session Management**: Handoff and resume workflows for context continuity

## When to Use This Plugin

### Task Planner (`/prepare-task`)

**Use when:**
- User mentions preparing, scoping, or planning a task
- User provides a Linear issue ID (e.g., "PRO-123") that needs breakdown
- User describes a new feature/bug/refactor that needs analysis
- User says "break down this task", "research this feature", "prepare PRO-X"

**Examples:**
```
User: "Can you prepare PRO-145 for implementation?"
→ Use /prepare-task PRO-145

User: "I need to add real-time sensor alerts, can you help plan this?"
→ Use /prepare-task "Add real-time sensor alerts"

User: "Break down the notification system task"
→ Use /prepare-task with task-planner agent
```

### Theia PR Walkthrough (`/create-theia-inputs`)

**Use when:**
- User completes a PR and wants review guidance
- User says "ready for review", "create walkthrough", "generate PR guide"
- User mentions Theia or visual code review
- After implementing a Linear issue, before code review

**Examples:**
```
User: "I'm done with PRO-89, ready for review"
→ Use /create-theia-inputs

User: "Create a walkthrough for this PR"
→ Use /create-theia-inputs

User: "Generate review notes"
→ Use /create-theia-inputs
```

### Documentation (`documentation-specialist` agent)

**Use when:**
- User requests documentation for files/modules
- User says "add docs", "document this code", "add docstrings"
- Code review reveals missing documentation
- After completing implementation, before PR

**Examples:**
```
User: "Add documentation to the orchestrator module"
→ Use Task tool with documentation-specialist agent

User: "These files need inline comments"
→ Use documentation-specialist agent

User: "Create comprehensive docs for the data-api"
→ Use documentation-specialist agent
```

### Session Management

**Session Handoff (`/session-handoff`)**

**Use when:**
- User says "end session", "handoff", "create summary"
- User needs to pause work and resume later
- Context is getting long and needs summarization
- End of coding session

**Examples:**
```
User: "I need to stop here, create a handoff"
→ Use /session-handoff

User: "Summarize what we did today"
→ Use /session-handoff

User: "Create session notes"
→ Use /session-handoff
```

**Session Resume (`/session-resume`)**

**Use when:**
- User starts a new session and references previous work
- User says "resume from last session", "continue where we left off"
- User asks "what did we work on last time?"

**Examples:**
```
User: "Resume from the last handoff"
→ Use /session-resume

User: "What were we working on?"
→ Use /session-resume

User: "Continue from yesterday's session"
→ Use /session-resume
```

**Context Health (`/context-health`)**

**Use when:**
- Context feels bloated or conversation is very long
- User asks about context size, token usage
- Before creating handoff, to identify what to summarize
- User says "clean up context", "check context health"

**Examples:**
```
User: "Is the context getting too large?"
→ Use /context-health

User: "Should we clean up the conversation?"
→ Use /context-health

User: "Check token usage"
→ Use /context-health
```

## How to Invoke

### Commands (Slash Commands)
```bash
/prepare-task [task-description or Linear-ID]
/create-theia-inputs
/session-handoff
/session-resume
/context-health
```

### Agents (via Task Tool)
```javascript
// Task planning with full autonomy
Task({
  subagent_type: "task-planner",
  prompt: "Prepare PRO-145 for implementation"
})

// PR walkthrough generation
Task({
  subagent_type: "theia-pr-walkthrough",
  prompt: "Generate walkthrough for current PR"
})

// Documentation generation
Task({
  subagent_type: "documentation-specialist",
  prompt: "Add comprehensive documentation to orchestrator/"
})
```

## Automatic Detection Patterns

Claude should **automatically** invoke this plugin when:

1. **Task Planning Keywords**: "prepare", "scope", "break down", "plan", "research task", "PRO-XXX needs breakdown"
2. **PR Review Keywords**: "ready for review", "walkthrough", "review guide", "theia", "completed PRO-XXX"
3. **Documentation Keywords**: "add docs", "document", "docstrings", "inline comments", "code documentation"
4. **Session Keywords**: "handoff", "resume", "end session", "summarize work", "continue from"
5. **Context Keywords**: "context health", "token usage", "clean up", "too long"

## Integration Requirements

**Linear API:**
- Requires `LINEAR_API_KEY` environment variable
- Uses Linear MCP server: `https://mcp.linear.app/sse`
- Team: "Product" (or user-specified)
- Project: "Maya Demo Sprint" (or user-specified)

**Git:**
- Works with git worktrees for task preparation
- Uses current branch for PR walkthroughs
- Expects dev branch for new task branches

## Output Files

- **Task Planner**: Creates `TASK_PLAN.md`, `RESEARCH_NOTES.md` in git worktree
- **Theia Walkthrough**: Creates `.claude/theia-walkthrough.md`
- **Session Handoff**: Creates `SESSION_HANDOFF.md` or `SESSION_HANDOFF_YYYYMMDD.md`
- **Documentation**: Edits files in-place with inline comments/docstrings

## User Interaction Style

All agents are designed to:
- Ask clarifying questions when ambiguous
- Provide progress updates during long operations
- Show summaries with Linear links and file locations
- Offer next-step recommendations
- Work autonomously after initial clarification

## Proactive Usage

Claude should **proactively suggest** this plugin when:

1. User completes an implementation → "Ready to create a PR walkthrough?"
2. User describes a complex task → "Would you like me to break this down with /prepare-task?"
3. User struggles with scope → "I can use task-planner to research and scope this"
4. Context is very long (>50 messages) → "Should I create a session handoff to clean up?"
5. User finishes debugging → "Want me to document the fix before we close?"

## Example Workflow

**Full Task Lifecycle:**

```
1. User: "I need to add sensor threshold alerts"
   → Claude: "/prepare-task 'Add sensor threshold alerts'"
   → Creates: Worktree, research notes, Linear issues (PRO-140-143)

2. User: "Start with PRO-141"
   → Claude: Creates feature branch, implements

3. User: "Ready for review"
   → Claude: "/create-theia-inputs"
   → Creates: .claude/theia-walkthrough.md

4. User: "Add docs before PR"
   → Claude: Uses documentation-specialist agent
   → Edits: Files with inline documentation

5. User: "End session here"
   → Claude: "/session-handoff"
   → Creates: SESSION_HANDOFF.md

6. [Next Day] User: "Resume from yesterday"
   → Claude: "/session-resume"
   → Reads: SESSION_HANDOFF.md, continues work
```

## Plugin Metadata

- **Version**: 1.0.0
- **Agents**: 3 (task-planner, theia-pr-walkthrough, documentation-specialist)
- **Skills**: 4 (prepare-task, session-handoff, session-resume, context-health)
- **Commands**: 5 (slash command variants of skills + create-theia-inputs)
- **Templates**: 3 (agent-template, skill-template, command-template)
- **Requirements**: Linear API, Git, Maya AI codebase structure

## Learning Resources

After installation, users can explore:
- Individual agent files in `agents/` for detailed workflows
- Skill files in `skills/` for usage examples
- Templates in `templates/` for creating custom components
- README.md for comprehensive documentation

## Support

For issues, feature requests, or contributions:
- GitHub: maya-ai repository
- Maintainer: Tomer Hamam (tomerhamam@gmail.com)
