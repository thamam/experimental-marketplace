---
name: prepare-task
description: Prepare and scope a new task with research, breakdown, and Linear registration
---

# Prepare Task Skill

Comprehensive task preparation workflow that creates a git worktree, researches requirements, breaks down work, and registers in Linear.

## Usage

```bash
/prepare-task [task-description or Linear-issue-id]
```

**Examples:**
- `/prepare-task PRO-123` - Prepare existing Linear issue
- `/prepare-task "Add real-time sensor alerts"` - New task from description
- `/prepare-task PRO-45 --validate` - Validate and update existing task

## Workflow

This skill delegates to the `task-planner` agent which handles:

1. **Task Discovery** (5 min)
   - If Linear ID: Fetch issue details, comments, description
   - If description: Create initial task outline
   - Identify task type: new feature, bug fix, refactor, enhancement

2. **Git Worktree Setup** (1 min)
   - Create new worktree from `dev` branch
   - Name: `task-prep-[issue-id or slug]`
   - Location: `../maya-ai-worktrees/task-prep-[name]/`
   - Switch context to worktree

3. **Research Phase** (10-20 min)
   - **Codebase Research** (deep-research agent):
     - Find relevant files and components
     - Identify architectural patterns
     - Check existing implementations
     - Find similar features
   - **Web Research** (if needed):
     - Best practices
     - Library documentation
     - Similar implementations
   - **Ask User Questions**:
     - Clarify ambiguities
     - Confirm assumptions
     - Gather requirements

4. **Task Breakdown** (10 min)
   - Break into atomic subtasks (max 2-4 hours each)
   - Define clear success criteria for each
   - Identify dependencies between subtasks
   - Estimate effort (S/M/L)
   - Create task tree structure

5. **Linear Registration** (5 min)
   - Create parent issue (if new task)
   - Create sub-issues for each subtask
   - Link dependencies
   - Set labels, project, team
   - Add detailed descriptions with DoD

6. **Handoff Document** (5 min)
   - Create `TASK_PLAN.md` in worktree
   - Include research findings
   - Include task breakdown
   - Include implementation approach
   - Include Linear links

## Output

**Worktree Created:**
```
../maya-ai-worktrees/task-prep-PRO-123/
├── TASK_PLAN.md          # Complete task plan
├── RESEARCH_NOTES.md     # Research findings
└── [codebase files]
```

**Linear Issues:**
```
PRO-123: Add real-time sensor alerts (Parent)
├── PRO-124: Design alert data model (Subtask 1)
├── PRO-125: Implement alert detection logic (Subtask 2)
├── PRO-126: Create alert notification system (Subtask 3)
└── PRO-127: Add alert history UI (Subtask 4)
```

**Summary Report:**
```
📋 Task Preparation Complete: PRO-123

🔍 Research Summary:
- Found 3 similar implementations
- Identified AlertManager pattern in codebase
- WebSocket notification already available

📊 Task Breakdown:
✓ 4 subtasks created (PRO-124 to PRO-127)
✓ All subtasks have clear DoD
✓ Dependencies mapped
✓ Estimated effort: 12-16 hours total

📁 Worktree: ../maya-ai-worktrees/task-prep-PRO-123/
📝 Plan: TASK_PLAN.md
🔗 Linear: https://linear.app/neuronbox/issue/PRO-123

🎯 Ready to start: PRO-124 (Design alert data model)
   Suggested branch: feature/pro-124-alert-data-model
```

## Agent Integration

This skill invokes the **task-planner** agent with this prompt:

```
Prepare task: [task-description or issue-id]

Context:
- Current branch: dev
- Team: Product
- Project: Maya Demo Sprint

Requirements:
1. Create git worktree from dev
2. Research codebase and web as needed
3. Ask user questions to clarify
4. Break down into atomic subtasks
5. Register in Linear with sub-issues
6. Create handoff document

Proceed autonomously, ask questions when needed.
```

## User Interaction

The task-planner agent will ask questions like:

- "Should alerts be stored in database or memory?"
- "What alert severity levels do you want? (info/warning/critical)"
- "Should alerts be per-facility or global?"
- "Real-time via WebSocket or polling?"

User can answer inline, agent adapts the plan.

## Validation Mode

For existing tasks that need updating:

```bash
/prepare-task PRO-123 --validate
```

Agent will:
- Read existing Linear issue
- Check if assumptions still valid
- Verify codebase hasn't changed
- Update subtasks if needed
- Mark outdated info
- Add new findings

## Options

- `--validate` - Validate and update existing task
- `--research-only` - Just research, no Linear updates
- `--skip-worktree` - Use current directory
- `--brief` - Quick breakdown without deep research
