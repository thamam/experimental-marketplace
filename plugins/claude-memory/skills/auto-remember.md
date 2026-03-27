# Auto-Remember Skill

Automatically captures important information from conversations without manual intervention.

## Purpose

This skill enables Claude to proactively identify and store important information shared during conversations, building your knowledge base organically as you work.

## What Gets Remembered

The skill automatically captures:
- **Project preferences** (package managers, coding styles, conventions)
- **Technical decisions** (architecture choices, library selections)
- **Configuration details** (API endpoints, database connections)
- **User preferences** (work habits, communication style)
- **Important facts** (deadlines, team members, project context)

## How It Works

1. Claude analyzes conversation content in real-time
2. Identifies information that would be useful to remember
3. Categorizes it appropriately (knowledge, preference, fact)
4. Stores it with relevant tags automatically
5. Indexes it for future semantic search

## Usage

This skill activates automatically when enabled. You don't need to do anything special.

Claude will occasionally inform you when important information has been saved:

```
✓ Remembered: You prefer pnpm for package management
✓ Remembered: Project uses PostgreSQL with Prisma ORM
✓ Remembered: API rate limit is 1000 requests/hour
```

## Configuration

The skill respects your privacy:
- Only remembers factual, non-sensitive information
- Skips personal or confidential data automatically
- Can be disabled if you prefer manual memory management

## Benefits

- **Never repeat yourself** - Claude remembers your preferences
- **Builds knowledge over time** - Your personal knowledge base grows organically
- **Reduces context setup** - Less time explaining context in new conversations
- **Maintains continuity** - Conversations feel more connected and contextual

## Manual Override

You can always use `/remember` for explicit control over what gets stored.
