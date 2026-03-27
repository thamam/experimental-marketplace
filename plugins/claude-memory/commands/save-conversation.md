# Save Conversation

Save the current conversation with all messages to your memory system.

## Usage

```
/save-conversation <title>
```

## Examples

```
/save-conversation React component refactoring discussion
```

```
/save-conversation API design brainstorming 2025-12-30
```

## Implementation

When this command is invoked, Claude will:
1. Extract all messages from the current conversation
2. Format them with roles (user/assistant/system) and timestamps
3. Store as a markdown file in `.claude-memory/conversations/`
4. Add metadata including creation time and message count
5. Return the conversation ID for future reference

Saved conversations can be loaded later using `/load-conversation <id>` to continue where you left off.
