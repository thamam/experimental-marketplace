# List Memories

List all stored memories with optional filters.

## Usage

```
/list-memories [type] [tags]
```

## Examples

```
/list-memories
```

```
/list-memories knowledge
```

```
/list-memories tags:typescript,patterns
```

## Implementation

When this command is invoked, Claude will use the `list_memories` MCP tool to retrieve memories filtered by:
- Type (conversation, knowledge, note)
- Tags
- Date range
- Limit/offset for pagination

Results show:
- Title
- Type
- Tags
- Creation date
- Memory ID

This is useful for browsing your memory collection and finding specific IDs for loading or deleting.
