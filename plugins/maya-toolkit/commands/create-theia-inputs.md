Generate navigational walkthrough for Theia PR review tool.

Use the Task tool with subagent_type='theia-pr-walkthrough' to create a lightweight, breadcrumb-style walkthrough that helps reviewers maintain orientation while exploring PR changes.

**Context:**
The walkthrough feeds into Theia - an AI-augmented code review tool that already shows code, diffs, and diagrams. Your job is to provide the BIG PICTURE and WHY, not implementation details.

**What the agent will create:**
- High-level PR overview (what problem, what approach)
- Sections grouped by feature/component (not individual files)
- File:line navigation points for Theia to jump to
- Mapping to Linear requirements/acceptance criteria
- Key decisions and attention points
- Review checklist

**What it WON'T include:**
- Code snippets (Theia shows these)
- Line-by-line explanations
- Import/config boilerplate
- Obvious implementation details

**Output:** `.claude/theia-walkthrough.md`

Invoke the agent now to analyze the most recent PR and generate the walkthrough.
