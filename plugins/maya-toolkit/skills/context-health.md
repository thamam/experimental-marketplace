---
name: context-health
description: Check context usage and recommend actions
---

# Context Health Skill

Monitor context window usage and recommend appropriate actions.

## When to Use

- Periodically during long sessions
- Before starting complex tasks
- When user asks about context/memory
- Auto-trigger every 15-20 messages (if supported)

## Execution Steps

1. **Get Context Usage**
   - Run `/context` command via Bash
   - Parse output for token usage
   - Extract key metrics:
     - Total usage (tokens and percentage)
     - Free space remaining
     - Autocompact buffer
     - Major consumers (MCP tools, messages, etc.)

2. **Analyze Usage Patterns**
   - Calculate message history size
   - Identify largest tool consumers
   - Check if approaching limits

3. **Determine Health Status**

   **Healthy (<70%)**
   - Status: 🟢 Healthy
   - Action: Continue normally
   - Message: "Context healthy, plenty of space"

   **Caution (70-85%)**
   - Status: 🟡 Caution
   - Action: Consider wrapping up current task
   - Message: "Context getting full, consider finishing current work"

   **Warning (85-95%)**
   - Status: 🟠 Warning
   - Action: Prepare for handoff soon
   - Message: "Context nearly full, prepare handoff after current task"

   **Critical (>95%)**
   - Status: 🔴 Critical
   - Action: Trigger /handoff immediately
   - Message: "Context critical, triggering handoff now"

4. **Provide Recommendations**

   Based on status, recommend:
   - Continue working (Healthy)
   - Finish current task, then handoff (Caution)
   - Create handoff after this message (Warning)
   - Auto-trigger handoff skill (Critical)

5. **Optional Optimization Suggestions**

   If context getting full:
   - "Consider disabling unused MCP servers"
   - "Large conversation history - handoff recommended"
   - "Complex task ahead - consider fresh session"

## Output Format

```
🔍 Context Health Check

Status: [🟢/🟡/🟠/🔴] [Healthy/Caution/Warning/Critical]
Usage: [XXX]k / 200k tokens ([XX]%)
Free Space: [XX]k tokens ([XX]%)

Breakdown:
- System prompt: [X]k ([X]%)
- System tools: [X]k ([X]%)
- MCP tools: [X]k ([X]%)
- Custom agents: [X]k ([X]%)
- Messages: [X]k ([X]%)

Recommendation: [Action to take]

[Optional optimization suggestions]
```

## Auto-Actions

If status is Critical (>95%):
- Automatically invoke `/handoff` skill
- Skip user confirmation
- Prepare for session restart

## Integration Points

- Bash: Run `/context` command
- session-handoff: Auto-trigger if critical
- User notification: Alert about context state
