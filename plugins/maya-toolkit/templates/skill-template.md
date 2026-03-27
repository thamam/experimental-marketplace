<!--
═══════════════════════════════════════════════════════════════════════════
SKILL TEMPLATE - Model-Invoked Capabilities
═══════════════════════════════════════════════════════════════════════════

WHAT IS A SKILL?
- AUTO-INVOKED by Claude Code when relevant to user's request
- Model decides when to use based on description and context
- NOT manually triggered by user (no slash command needed)
- Filename doesn't matter for invocation (description is key)

WHEN TO USE SKILLS (vs Commands or Agents):
✅ Use Skill when:
  - Claude should automatically invoke this based on user's intent
  - The capability should be discoverable by the model
  - It's a response to implicit user needs
  - Examples: Auto-handoff when context full, auto-validation, auto-cleanup

❌ DON'T use Skill when:
  - User needs to manually trigger it → Use COMMAND instead
  - It's complex multi-phase work → Use AGENT (invoked by skill)
  - It should never auto-run → Use COMMAND or AGENT only

SKILLS vs COMMANDS - THE CRITICAL DISTINCTION:
⚠️  SKILL: User says "I need to prepare a task" → Claude auto-invokes skill
⚠️  COMMAND: User types "/prepare-task PRO-123" → Command runs manually
    (You can have BOTH! Skill for auto-invoke, command for manual trigger)

KEY INSIGHT FROM OUR ERROR:
We initially created files in .claude/skills/ thinking they were slash commands.
They're NOT! Skills are auto-invoked by Claude when the model determines they're
relevant based on the description. If you want a user-invoked slash command,
create it in .claude/commands/ instead.

REAL EXAMPLES IN THIS CODEBASE:
- session-handoff (skills/session-handoff.md) - Auto-invoked when context full
- context-health (skills/context-health.md) - Auto-invoked to check context
- prepare-task (skills/prepare-task.md) - Auto-invoked when task prep needed
  (Note: Also exists as command for manual trigger!)

FILE LOCATION:
.claude/skills/skill-name.md

INVOCATION:
Automatic when Claude determines skill is relevant based on:
- Skill description (frontmatter)
- User's current request
- Context and conversation flow

═══════════════════════════════════════════════════════════════════════════
-->

---
# Frontmatter (YAML) - Required metadata for skill discovery
name: skill-name                  # Internal identifier for this skill
description: Clear description of when and why Claude should invoke this skill automatically
# Optional fields:
# model: haiku|sonnet|opus  # Override model for skill execution
---

<!--
═══════════════════════════════════════════════════════════════════════════
SKILL BODY STRUCTURE
═══════════════════════════════════════════════════════════════════════════

The skill body tells Claude:
1. WHEN to auto-invoke this skill (trigger conditions)
2. WHAT to do when invoked (workflow)
3. HOW to integrate with other components (agents, tools)

CRITICAL: The description in frontmatter is how Claude discovers this skill!
Make it specific and action-oriented so Claude knows when to invoke it.

STRUCTURE:
1. Overview - What this skill does
2. Trigger Conditions - When Claude should auto-invoke
3. Workflow Steps - What to do (can delegate to agent)
4. Output Specification - What gets created/returned
5. Integration Points - How this connects to other components

═══════════════════════════════════════════════════════════════════════════
-->

# Skill Name

<!-- Overview: What this skill does and why it exists -->
Brief description of what this skill accomplishes and the problem it solves.

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- TRIGGER CONDITIONS - When Claude should auto-invoke this -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## When to Auto-Invoke

<!-- Be specific! This helps Claude know when to use this skill -->

Claude should automatically invoke this skill when:

### Primary Triggers
- User says [specific phrase or intent]
- Context indicates [specific condition]
- Workflow reaches [specific state]

### Examples of Triggering Situations
- ✅ User: "I need to [action that this skill handles]"
- ✅ User: "[phrase that implies this skill is needed]"
- ✅ Implicit: [context condition, e.g., "context >90% full"]
- ✅ Workflow: [state, e.g., "after completing feature implementation"]

### When NOT to Invoke
- ❌ User explicitly requests different approach
- ❌ [Other condition that should prevent auto-invoke]
- ❌ Skill already invoked recently in this session

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- WORKFLOW SECTION - What to do when invoked -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## Workflow

<!-- Step-by-step process for this skill -->
<!-- Can be simple inline steps OR delegation to agent (recommended) -->

When invoked, this skill executes the following workflow:

### Phase 1: [Discovery/Assessment]
<!-- Initial analysis or data gathering -->
- Understand current context
- Gather required information
- Identify what needs to be done

Example steps:
- Check git status
- Read relevant files
- Query Linear for issues
- Analyze current state

### Phase 2: [Processing/Execution]
<!-- Main work -->

**Option A: Simple inline processing**
```
1. Use [tool] to do [action]
2. Use [tool] to do [action]
3. Validate results
```

**Option B: Delegate to agent (RECOMMENDED)**
```
Use Task tool to delegate complex work to specialized agent:

Task({
  subagent_type: "agent-name",
  prompt: `
    [Instructions for agent with full context]

    Context:
    - Current state: [from Phase 1]
    - User intent: [from conversation]
    - Goal: [what to accomplish]

    Requirements:
    1. [Requirement 1]
    2. [Requirement 2]

    Proceed autonomously, ask questions if needed.
  `
})
```

### Phase 3: [Output/Completion]
<!-- Final steps and deliverables -->
- Create output files
- Update state (Linear, git, etc.)
- Confirm completion to user
- Provide next steps

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- OUTPUT SECTION - What this skill produces -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## Output

**Files Created:**
```
path/to/output-file.md          # Primary output
path/to/metadata.json           # Optional metadata
```

**State Changes:**
- Git: [branches created, commits made]
- Linear: [issues created/updated]
- Files: [what was modified]

**User Message:**
```
✓ [Skill Name] completed

Summary:
- [What was accomplished]
- [Key results]

Output:
- File: path/to/output-file.md
- [Other outputs]

Next steps:
- [Suggested next action]
```

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- EXECUTION STEPS (detailed if not delegating to agent) -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## Detailed Execution Steps

<!-- If NOT delegating to agent, provide detailed steps here -->
<!-- If delegating to agent, this section can be brief or omitted -->

### Step 1: [Action Name] (X min)
**Goal:** What this step accomplishes

**Process:**
1. Sub-step 1
2. Sub-step 2
3. Sub-step 3

**Tools Used:**
- Read - For [purpose]
- Grep - For [purpose]
- Bash - For [purpose]

**Output:** What this step produces

### Step 2: [Action Name] (X min)
**Goal:** What this step accomplishes

**Process:**
[Similar structure as Step 1]

**Validation:**
How to verify this step completed successfully

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- INTEGRATION SECTION - Connections to other components -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## Integration Points

<!-- How this skill connects to the broader Claude Code ecosystem -->

**Agents Used:**
- `agent-name` - Purpose and when delegated
- `another-agent` - Purpose and when delegated

**Related Skills:**
- `related-skill` - How they differ or work together

**Related Commands:**
- `/command-name` - Manual version of this auto-invoked skill

**Tools Required:**
- Read, Write, Bash, Grep, Glob
- mcp__linear__* (if using Linear)
- Task (if delegating to agents)

**External Systems:**
- Linear - For issue tracking
- Git - For version control
- [Other systems this skill interacts with]

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- USER INTERACTION SECTION - How skill interacts with user -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## User Interaction

<!-- Skills can ask questions even though they're auto-invoked -->

**Questions to Ask:**
When auto-invoked, this skill may need to ask:

- "[Question about ambiguous requirement]"
- "[Question about user preference]"
- "[Question about approach choice]"

**Confirmation Points:**
- Confirm before [major action, e.g., creating Linear issues]
- Ask for approval if [condition, e.g., large scope detected]

**Progress Updates:**
- Inform user when starting: "Auto-invoking [skill name] to [goal]"
- Update during phases: "Completed phase 1, starting phase 2..."
- Summarize at end: "[What was accomplished]"

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- OPTIONS/MODES SECTION - If skill supports variations -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## Modes and Options

<!-- If skill can operate in different modes based on context -->

### Standard Mode
- Default behavior when auto-invoked
- [What it does in standard mode]

### Quick Mode
- Triggered when [condition, e.g., user says "brief"]
- [Abbreviated workflow]

### Deep Mode
- Triggered when [condition, e.g., complex task detected]
- [Extended workflow with more thorough analysis]

### Validation Mode
- Triggered when [condition, e.g., updating existing work]
- [Validation-focused workflow]

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- ERROR HANDLING SECTION - What to do when things go wrong -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## Error Handling

**If [condition] fails:**
- Fallback approach: [what to do instead]
- User message: [how to inform user]
- Recovery: [how to recover or retry]

**If user cancels mid-workflow:**
- Save partial progress to: [location]
- Clean up: [what to undo]
- Inform user of state

**If external system unavailable:**
- Example: Linear API down
- Fallback: [local-only approach]
- Message: [explain limitation to user]

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- COMMON MISTAKES - Learn from our errors! -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## Common Mistakes to Avoid

⚠️  **Skill vs Command Confusion:**
   - This is a SKILL (auto-invoked by Claude when relevant)
   - Users DON'T type "/skill-name" to trigger this
   - If you want manual user trigger, create COMMAND instead
   - You can have BOTH skill (auto) and command (manual) versions!

⚠️  **Description not specific enough:**
   - Vague description = Claude won't know when to invoke
   - Make frontmatter description very specific about WHEN to use
   - Include triggering phrases and conditions

⚠️  **Doing too much inline:**
   - Skills should delegate complex work to agents
   - Use Task tool to invoke specialized agent
   - Keep skill body focused on orchestration

⚠️  **Not handling user interruption:**
   - Users might want to cancel auto-invoked skill
   - Always allow graceful exit
   - Save partial progress if possible

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- QUALITY CHECKLIST -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## Quality Checklist

Before finalizing this skill:
- [ ] Frontmatter has clear, specific description
- [ ] Description makes it obvious WHEN to auto-invoke
- [ ] Trigger conditions are well-defined
- [ ] Workflow is step-by-step and clear
- [ ] Complex work delegated to agent (if applicable)
- [ ] Output specification is complete
- [ ] User interaction points identified
- [ ] Error handling covered
- [ ] Integration points documented
- [ ] Tested by triggering the conditions naturally

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- DISCOVERY SECTION - Help Claude find and use this skill -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## Skill Discovery Hints

<!-- Additional context to help Claude know when to invoke -->

**User intent patterns that should trigger this skill:**
- "I need to [action]"
- "[Phrase indicating this need]"
- "[Implicit signal, e.g., 'context getting full']"

**Context signals:**
- State: [specific condition]
- Timing: [after what event]
- Metrics: [threshold that triggers]

**Keywords and phrases:**
- [Keyword 1], [keyword 2], [keyword 3]
- These in user message → consider invoking

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- REFERENCE EXAMPLES FROM THIS CODEBASE -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## Reference Examples

**Good skill examples in this codebase:**
- `.claude/skills/session-handoff.md` - Auto-invoked at end of session
- `.claude/skills/context-health.md` - Auto-invoked to monitor context
- `.claude/skills/prepare-task.md` - Auto-invoked when task prep needed

**Pattern to follow:**
1. Very specific frontmatter description
2. Clear trigger conditions
3. Delegate complex work to agent via Task tool
4. Inform user what's happening (since auto-invoked)
5. Provide clear output and next steps

<!-- END OF SKILL TEMPLATE -->
