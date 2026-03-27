# Maya AI Toolkit

Comprehensive development workflow automation for Maya AI projects. This plugin provides task planning, PR review generation, documentation, and session management tools.

## Overview

The Maya AI Toolkit bundles multiple specialized agents and skills that automate common development workflows:

- 🎯 **Task Planner** - Research, scope, and break down tasks with Linear integration
- 📝 **PR Walkthrough** - Generate navigational review guides for Theia tool
- 📚 **Documentation Specialist** - Automated inline and comprehensive documentation
- 🔄 **Session Management** - Handoff and resume workflows for context continuity

## Installation

### From A2X Marketplace

```bash
# Add the A2X marketplace
/plugin marketplace add tomerhamam/A2X-marketplace

# Install maya-toolkit
/plugin install maya-toolkit@A2X
```

### Requirements

**Environment Variables:**
```bash
# Required for Linear integration
export LINEAR_API_KEY="lin_api_your_key_here"
```

Get your Linear API key from: https://linear.app/settings/api

**MCP Configuration:**

Add Linear MCP server to `~/.claude/config/.mcp.json`:
```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.linear.app/sse"],
      "env": {
        "LINEAR_API_KEY": "${LINEAR_API_KEY}"
      }
    }
  }
}
```

## Components

### Agents

#### 1. task-planner
**Purpose:** Autonomous task preparation with research, scoping, and Linear registration

**Workflow:**
1. Create isolated git worktree from dev
2. Deep research (codebase + web)
3. Clarify requirements with user
4. Break down into atomic subtasks
5. Register in Linear with clear DoD

**Usage:**
```bash
# Via slash command
/prepare-task PRO-123
/prepare-task "Add real-time sensor alerts"

# Via Task tool
Task({
  subagent_type: "task-planner",
  prompt: "Prepare PRO-145 for implementation"
})
```

**Output:**
- Git worktree: `../maya-ai-worktrees/task-prep-PRO-XXX/`
- Files: `TASK_PLAN.md`, `RESEARCH_NOTES.md`
- Linear issues: Parent + sub-issues with full context

#### 2. theia-pr-walkthrough
**Purpose:** Generate navigational breadcrumbs for Theia visual code review tool

**Workflow:**
1. Analyze git diff and changed files
2. Map changes to Linear requirements
3. Group by feature/component
4. Create navigation points with file:line references
5. Generate review checklist

**Usage:**
```bash
# Via slash command
/create-theia-inputs

# Via Task tool
Task({
  subagent_type: "theia-pr-walkthrough",
  prompt: "Generate walkthrough for current PR"
})
```

**Output:**
- File: `.claude/theia-walkthrough.md`
- Includes: Linear mapping, feature groups, navigation points, review checklist

#### 3. documentation-specialist
**Purpose:** Add comprehensive documentation to codebases

**Workflow:**
1. Read target files/directories
2. Identify missing docstrings/comments
3. Generate context-aware documentation
4. Follow project conventions
5. Create documentation PR if requested

**Usage:**
```bash
# Via Task tool
Task({
  subagent_type: "documentation-specialist",
  prompt: "Add comprehensive documentation to orchestrator/"
})
```

**Output:**
- Edits files in-place with inline documentation
- Follows Python/JavaScript/TypeScript conventions
- Can create separate docs PR

### Skills & Commands

#### /prepare-task
Prepare and scope a new task with research, breakdown, and Linear registration

**Examples:**
```bash
/prepare-task PRO-123          # Prepare existing Linear issue
/prepare-task "Add alerts"     # New task from description
/prepare-task PRO-45 --validate # Validate existing task
```

**Options:**
- `--validate` - Validate and update existing task
- `--research-only` - Just research, no Linear updates
- `--skip-worktree` - Use current directory
- `--brief` - Quick breakdown without deep research

#### /create-theia-inputs
Generate Theia walkthrough for current PR

**When to use:**
- After completing PR implementation
- Before code review
- When you want guided review notes

**Output:** `.claude/theia-walkthrough.md`

#### /session-handoff
Create comprehensive session handoff document

**When to use:**
- End of coding session
- Before context compaction
- When pausing work to resume later

**Output:** `SESSION_HANDOFF.md` or `SESSION_HANDOFF_YYYYMMDD.md`

#### /session-resume
Resume previous session from handoff document

**When to use:**
- Starting new session
- After context was compacted
- Continuing from previous day's work

**Reads:** Latest `SESSION_HANDOFF*.md` file

#### /context-health
Check context health and suggest cleanup

**When to use:**
- Context feels bloated
- Before creating handoff
- Checking token usage

**Output:** Context analysis with cleanup recommendations

### Templates

#### agent-template.md
Template for creating new Claude Code agents with frontmatter and structure

#### skill-template.md
Template for creating new skills with usage examples

#### command-template.md
Template for creating new slash commands

## Workflows

### Full Task Lifecycle

```
1. Prepare Task
   /prepare-task "Add sensor threshold alerts"
   → Creates: Worktree, research notes, Linear PRO-140-143

2. Implement First Subtask
   User: "Start with PRO-141"
   → Creates: feature/pro-141-alert-data-model
   → Implements: Alert data models

3. Create PR Walkthrough
   /create-theia-inputs
   → Creates: .claude/theia-walkthrough.md
   → Maps: Changes to PRO-141 requirements

4. Add Documentation
   Use documentation-specialist agent
   → Edits: Files with inline documentation
   → Follows: Project conventions

5. End Session
   /session-handoff
   → Creates: SESSION_HANDOFF.md
   → Includes: Progress, next steps, context

6. Resume Next Day
   /session-resume
   → Reads: SESSION_HANDOFF.md
   → Continues: Where you left off
```

### Quick Documentation Pass

```
# Document entire module
Task({
  subagent_type: "documentation-specialist",
  prompt: "Add documentation to orchestrator/ module"
})

# Document specific files
Task({
  subagent_type: "documentation-specialist",
  prompt: "Add docstrings to data-api/endpoints_api.py"
})
```

### Task Research & Planning

```
# Existing Linear task
/prepare-task PRO-89

# New feature from description
/prepare-task "Add real-time notifications via WebSocket"

# Validate old task against current codebase
/prepare-task PRO-45 --validate
```

## Configuration

### Linear Integration

**Team ID:** Found in Linear URL: `linear.app/yourteam/issue/PRO-123`
**Project ID:** Get from Linear project settings

Update `task-planner.md` if needed:
```markdown
team: "Your Team Name"
project: "Your Project Name"
```

### Git Worktrees

Task planner creates worktrees at:
```
/Users/yourname/personal/repos/maya-ai-worktrees/task-prep-[name]/
```

Update path in `agents/task-planner.md:77-80` if needed.

### Environment File

Task planner symlinks `.env` from main repo. Update path in `agents/task-planner.md:94-97` if needed:
```bash
ln -s /path/to/your/maya-ai/.env .env
```

## Best Practices

### Task Planning
- ✅ Use `/prepare-task` for any non-trivial feature/bug
- ✅ Let agent ask clarifying questions
- ✅ Review research notes before starting implementation
- ✅ Validate task breakdown in Linear
- ✅ Create feature branch from recommended name

### PR Review
- ✅ Run `/create-theia-inputs` before requesting review
- ✅ Ensure Linear issue is linked in PR
- ✅ Review checklist matches acceptance criteria
- ✅ Navigation points reference key changes

### Documentation
- ✅ Document after implementation, before PR
- ✅ Let agent follow project conventions
- ✅ Review generated docs for accuracy
- ✅ Update if domain-specific terms need clarification

### Session Management
- ✅ Create handoff at natural stopping points
- ✅ Include next steps in handoff
- ✅ Resume from handoff to restore context
- ✅ Check context health periodically

## Troubleshooting

### Linear API Not Working

**Check:**
1. `LINEAR_API_KEY` is set in environment
2. MCP server is configured in `~/.claude/config/.mcp.json`
3. API key is valid: https://linear.app/settings/api

**Test:**
```bash
# In Claude session
"Get issue PRO-123"
# Should retrieve issue details
```

### Worktree Creation Fails

**Check:**
1. Parent directory exists: `../maya-ai-worktrees/`
2. Worktree name doesn't already exist
3. On `dev` branch or specify different base branch

**Fix:**
```bash
mkdir -p /Users/yourname/personal/repos/maya-ai-worktrees
```

### Agent Not Loading

**Check:**
1. Plugin installed: `/plugin list`
2. Agent files in correct directory
3. Frontmatter is valid YAML
4. Restart Claude Code

### Theia Walkthrough Empty

**Check:**
1. Git diff has changes: `git diff dev...HEAD`
2. On feature branch, not dev/main
3. Linear issue is referenced in commits

## Examples

### Example 1: New Feature Task

```
User: "I need to add email notifications for critical alerts"

Claude: "I'll use /prepare-task to research and scope this task."

[Creates worktree, researches email libraries, asks questions]

Output:
- Worktree: task-prep-email-notifications/
- Research: Compared SendGrid vs AWS SES
- Linear Issues:
  - PRO-150: Add email notification system (Parent)
    - PRO-151: Configure email service (2h)
    - PRO-152: Create email templates (3h)
    - PRO-153: Add notification triggers (4h)
    - PRO-154: Add user preferences (3h)

User: "Let's start with PRO-151"
```

### Example 2: PR Review Walkthrough

```
User: "I'm done with PRO-89, ready for review"

Claude: "I'll create a Theia walkthrough for your PR."

[Analyzes git diff, maps to Linear PRO-89]

Output: .claude/theia-walkthrough.md
- Overview: WebSocket reconnection with exponential backoff
- Section 1: Frontend Connection Logic
  - frontend/src/App.jsx:45-78 - reconnectAttempt state
  - frontend/src/App.jsx:102-145 - Exponential backoff
- Section 2: Configuration
  - frontend/vite.config.js:12-15 - WebSocket proxy
- Review Checklist:
  - [ ] Reconnection works after disconnect → Section 1
  - [ ] Max 5 retries enforced → Section 1
  - [ ] Backoff caps at 10s → Section 1
```

### Example 3: Documentation Pass

```
User: "Add docs to the orchestrator before we merge"

Claude: Uses documentation-specialist agent

[Reads orchestrator/, identifies missing docstrings]

Edits:
- orchestrator/main.py:
  - Added module docstring
  - Added function docstrings for process_message, create_graph
  - Added inline comments for WebSocket error handling
- orchestrator/maya/tools/:
  - Added docstrings for all tool functions
  - Added parameter descriptions

User: "Great, now create the PR"
```

## Version History

- **v1.0.0** (2025-01-XX)
  - Initial release
  - Task planner with Linear integration
  - Theia PR walkthrough generator
  - Documentation specialist
  - Session management (handoff, resume, context-health)
  - Agent, skill, and command templates

## Contributing

To extend this toolkit:

1. **Create new agent:**
   - Copy `templates/agent-template.md`
   - Add to `agents/` directory
   - Update `plugin.json` components.agents

2. **Create new skill:**
   - Copy `templates/skill-template.md`
   - Add to `skills/` directory
   - Update `plugin.json` components.skills

3. **Update SKILL.md:**
   - Add usage patterns for new components
   - Include automatic detection keywords

## Support

**Issues:** GitHub repository (maya-ai)
**Maintainer:** Tomer Hamam (tomerhamam@gmail.com)
**Documentation:** This README + individual agent/skill files

## License

MIT License - See parent repository for details

## Related Resources

- [Claude Code Docs](https://code.claude.com/docs)
- [Linear API](https://developers.linear.app/)
- [MCP Documentation](https://modelcontextprotocol.io/)
- [Theia Code Review Tool](../../docs/theia-pr-review.md) (project-specific)

---

**Quick Start:**
```bash
# Install
/plugin marketplace add tomerhamam/A2X-marketplace
/plugin install maya-toolkit@A2X

# Configure Linear
export LINEAR_API_KEY="lin_api_your_key_here"

# Test
/prepare-task PRO-123
/create-theia-inputs
/session-handoff
```
