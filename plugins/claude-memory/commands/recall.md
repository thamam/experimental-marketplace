# Recall

Search and retrieve memories using keyword or semantic search.

## Usage

```
/recall <query> [semantic]
```

## Examples

```
/recall API authentication
```

```
/recall project setup preferences semantic
```

```
/recall typescript coding standards
```

## Implementation

When this command is invoked, Claude will use the `recall` MCP tool to search your memories:

- **Keyword search (default)**: Fast full-text search using SQLite FTS
- **Semantic search**: Deep semantic understanding using vector embeddings (add `semantic` flag)

The search will return matching memories ranked by relevance, showing:
- Title and type
- Tags
- Preview of content
- Similarity score (for semantic search)
- Memory ID for reference

Results are automatically loaded into Claude's context for use in the conversation.
