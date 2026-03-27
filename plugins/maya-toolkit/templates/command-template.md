<!--
═══════════════════════════════════════════════════════════════════════════
COMMAND TEMPLATE - User-Invoked Slash Commands
═══════════════════════════════════════════════════════════════════════════

WHAT IS A COMMAND?
- User-invoked via "/command-name" in Claude Code
- Appears in autocomplete when user types "/"
- Manually triggered by user, NOT auto-invoked by Claude
- Filename becomes the command name (e.g., "prepare-task.md" → "/prepare-task")

WHEN TO USE COMMANDS (vs Skills or Agents):
✅ Use Command when:
  - User needs a repeatable workflow they can trigger on demand
  - The task requires user-provided parameters
  - It's a common operation users will want to invoke manually
  - Examples: /commit, /review-pr, /create-theia-inputs, /prepare-task

❌ DON'T use Command when:
  - Claude should invoke it automatically based on context → Use SKILL instead
  - It's a complex multi-phase workflow → Use AGENT (invoked by command/skill)
  - It's a one-time operation → Just do it inline

COMMANDS vs SKILLS - THE CRITICAL DISTINCTION:
⚠️  COMMAND: User types "/prepare-task PRO-123" → Command runs
⚠️  SKILL: Claude sees "I need to prepare a task" → Skill auto-runs
    (Both can exist! Command for manual use, skill for auto-invoke)

REAL EXAMPLES IN THIS CODEBASE:
- /create-theia-inputs (commands/create-theia-inputs.md)
- /prepare-task (commands/prepare-task.md)
- /session-handoff (commands/session-handoff.md)

FILE LOCATION:
.claude/commands/command-name.md

INVOCATION:
/command-name [optional-arguments]

═══════════════════════════════════════════════════════════════════════════
-->

---
# Frontmatter (YAML) - Required metadata
name: command-name                # Must match filename without .md extension
description: Brief one-line summary of what this command does when invoked
# Optional fields:
# allowed-tools: Read, Write, Bash, Grep, Glob  # Restrict available tools
# model: haiku|sonnet|opus  # Override default model (usually leave unset)
---

<!--
═══════════════════════════════════════════════════════════════════════════
COMMAND BODY STRUCTURE
═══════════════════════════════════════════════════════════════════════════

The command body is instructions for Claude Code on what to do when this
command is invoked by the user.

STRUCTURE:
1. Brief user-facing description (1-2 sentences)
2. Optional: Usage examples showing how to invoke
3. Detailed instructions for Claude (what to do, in what order)
4. Optional: Delegation to agents using Task tool
5. Optional: Output specification (files created, messages shown)

NOTE: You're writing instructions FOR Claude, not documentation FOR users.
However, start with user-facing description for clarity.
═══════════════════════════════════════════════════════════════════════════
-->

# Command Name

<!-- Brief user-facing description (shows in help/autocomplete) -->
Brief one-line summary of what this command does and when to use it.

<!-- Optional: Longer explanation for user understanding -->
This command helps users accomplish [specific goal] by [brief approach].
Use this when you need to [specific use case].

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- USAGE SECTION - Show how users invoke this command -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## Usage

```bash
/command-name [required-argument] [optional-argument]
```

**Examples:**
- `/command-name simple` - Simple usage
- `/command-name PRO-123` - With Linear issue ID
- `/command-name "description text" --flag` - With options

<!-- IMPORTANT: $ARGUMENTS variable is available in command body -->
<!-- It contains everything the user typed after the command name -->

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- INSTRUCTIONS SECTION - Tell Claude what to do -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## Instructions for Claude

<!-- These are step-by-step instructions Claude will follow -->

When this command is invoked:

### Step 1: Parse Arguments
<!-- Extract parameters from $ARGUMENTS variable if needed -->
- Extract parameters from user input: $ARGUMENTS
- Validate required arguments are provided
- If missing, ask user for clarification using AskUserQuestion

### Step 2: Pre-flight Checks
<!-- Any validation before main work -->
- Check current git status
- Verify required files exist
- Confirm Linear connection (if using Linear)

### Step 3: Main Workflow
<!-- Core logic - can be simple steps or delegation to agent -->

**Option A: Simple inline workflow**
```
1. Do task A using Read tool
2. Do task B using Grep tool
3. Do task C using Write tool
4. Confirm completion to user
```

**Option B: Delegate to agent (recommended for complex workflows)**
```
Use the Task tool to delegate to specialized agent:

Task({
  subagent_type: "agent-name",
  prompt: "Detailed instructions for agent with context from $ARGUMENTS"
})

The agent will handle the complex multi-phase workflow.
```

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- EXAMPLE: Delegation to Agent (RECOMMENDED PATTERN) -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

**Example delegation (most commands should do this):**

Use the Task tool with `subagent_type='specialized-agent'` to perform the work:

```
Task with agent: specialized-agent

Context:
- User arguments: $ARGUMENTS
- Current branch: [check with git status]
- Project: Maya AI

Instructions for agent:
1. [High-level goal]
2. [What to produce]
3. [Where to put output]
4. [Success criteria]

Proceed autonomously, ask user questions if needed.
```

<!-- This pattern keeps commands thin and delegates complex work to agents -->

### Step 4: Output and Confirmation
<!-- What Claude should show/create at the end -->
- Create output file at: `.claude/output-file.md`
- Display summary message to user
- Provide next steps or suggestions

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- EXPECTED OUTPUT SECTION - What gets created/shown -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## Expected Output

**Files Created:**
```
.claude/output-file.md          # Main output file
.claude/metadata.json           # Optional metadata
```

**Console Output:**
```
✓ Command completed successfully

Summary:
- Action 1 completed
- Action 2 completed
- Output written to: .claude/output-file.md

Next steps:
- Suggestion for what user should do next
```

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- PARAMETERS SECTION - If command accepts options/flags -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## Parameters

<!-- Document what arguments this command accepts -->

**Arguments:**
- `[argument-name]` (required) - Description of what this argument is
- `[optional-arg]` (optional) - Description, default behavior

**Flags:**
- `--flag-name` - What this flag does
- `--verbose` - Enable detailed output

**Parsing arguments:**
Claude can access user input via $ARGUMENTS variable and parse as needed.

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- INTEGRATION SECTION - How this connects to other parts -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## Integration Points

<!-- Document connections to other Claude Code components -->

**Agents Used:**
- `agent-name` - What this agent does in the workflow

**Skills Related:**
- `skill-name` - How this relates to auto-invoked skill version

**Linear Integration:**
- Uses Linear API to [what it does with Linear]
- Creates/updates issues in [project name]

**Tools Required:**
- Read - For reading files
- Write - For creating output
- Bash - For git operations
- mcp__linear__* - For Linear integration

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- COMMON MISTAKES SECTION - Learn from our errors! -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## Common Mistakes to Avoid

⚠️  **Command vs Skill Confusion:**
   - This is a COMMAND (user-invoked via /command-name)
   - If you want Claude to auto-invoke this, create a SKILL instead
   - You can have BOTH a command and skill with same name!
   - Command for manual use, skill for auto-invoke

⚠️  **Doing too much in command body:**
   - Commands should delegate complex work to agents
   - Use Task tool to invoke specialized agent
   - Keep command body thin (orchestration only)

⚠️  **Not handling missing arguments:**
   - Always validate $ARGUMENTS
   - Ask user for clarification if needed
   - Provide helpful error messages

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- QUALITY CHECKLIST -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## Quality Checklist

Before using this command pattern:
- [ ] Command name matches filename (without .md)
- [ ] Frontmatter has required fields: name, description
- [ ] User-facing description is clear and concise
- [ ] Usage examples show how to invoke
- [ ] Instructions are step-by-step
- [ ] Complex work delegated to agent (if applicable)
- [ ] Output specification is clear
- [ ] Parameters documented (if command accepts them)
- [ ] Integration points identified
- [ ] Tested with actual invocation

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- REFERENCE EXAMPLES FROM THIS CODEBASE -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## Reference Examples

**Good command examples in this codebase:**
- `.claude/commands/create-theia-inputs.md` - Simple delegation to agent
- `.claude/commands/prepare-task.md` - Complex workflow with agent
- `.claude/commands/session-handoff.md` - End-of-session workflow

**Pattern to follow:**
1. Brief user-facing description
2. Usage examples
3. Delegate to specialized agent using Task tool
4. Specify expected output

<!-- END OF COMMAND TEMPLATE -->
