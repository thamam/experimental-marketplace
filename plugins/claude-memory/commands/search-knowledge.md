# Search Knowledge

Perform semantic search over your knowledge base.

## Usage

```
/search-knowledge <query> [category]
```

## Examples

```
/search-knowledge authentication patterns
```

```
/search-knowledge error handling category:typescript
```

## Implementation

When this command is invoked, Claude will:
1. Filter knowledge entries by category (if specified)
2. Use semantic search with vector embeddings
3. Rank results by similarity to your query
4. Return top matches with content previews

This provides deep semantic understanding beyond keyword matching - it understands concepts and intent.
