# Remember

Store a memory, note, or piece of knowledge in your persistent memory system.

## Usage

```
/remember <title> | <content> [tags: tag1, tag2]
```

## Examples

```
/remember Project Setup | Use pnpm for package management in this project tags: preferences, workflow
```

```
/remember API Authentication | The API uses JWT tokens with 24h expiration. Refresh tokens are valid for 30 days. tags: api, auth
```

```
/remember Code Style | Always use explicit return types in TypeScript functions tags: coding-standards
```

## Implementation

When this command is invoked, Claude will use the `remember` MCP tool to store the information with:
- Title extracted from before the `|` separator
- Content extracted from after the `|` separator
- Tags parsed from `tags:` if provided
- Automatically categorized as 'note' type
- Indexed for both keyword and semantic search

The memory will be permanently stored in your `.claude-memory/` directory and can be recalled later using `/recall` or `/search-knowledge`.
