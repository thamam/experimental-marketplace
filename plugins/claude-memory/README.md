# Claude Memory Plugin

Persistent memory management for Claude Code with conversation history, knowledge base, session persistence, and semantic search.

## Features

- 💾 **Conversation History** - Store and retrieve past conversations with full context
- 📚 **Knowledge Base** - Build and search a personal knowledge base from interactions
- 🔄 **Session Persistence** - Save and restore complete session state (context, files, variables)
- 🔍 **Semantic Search** - Vector-based memory retrieval using local embeddings
- 🏠 **Local-First** - Everything stored locally, no external services required
- 🔒 **Privacy-First** - Your data never leaves your machine
- ⚡ **Fast Search** - Hybrid keyword + semantic search for best results
- 📝 **Human-Readable** - Memories stored as markdown files

## Installation

### Prerequisites

- Node.js >= 20.0.0
- Claude Code CLI

### Install Plugin

```bash
/plugin install claude-memory@A2X
```

### Install MCP Server Dependencies

```bash
cd ~/.claude-code/plugins/claude-memory/mcp-server
npm install
```

### Build MCP Server

```bash
cd ~/.claude-code/plugins/claude-memory/mcp-server
npm run build
```

### Configure Environment (Optional)

```bash
cd ~/.claude-code/plugins/claude-memory/mcp-server
cp .env.example .env
# Edit .env to customize settings
```

## Configuration

The MCP server can be configured via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `MEMORY_DIR` | `~/.claude-memory` | Directory for storing memories |
| `EMBEDDING_MODEL` | `minilm-l6` | Embedding model (see options below) |
| `MAX_MEMORY_SIZE_MB` | `1000` | Maximum storage size in MB |
| `AUTO_ARCHIVE_DAYS` | `90` | Auto-archive memories older than N days |
| `ENABLE_AUTO_INDEXING` | `true` | Enable automatic semantic indexing |

### Embedding Models

| Model | Size | Quality | Speed | Best For |
|-------|------|---------|-------|----------|
| `minilm-l6` | 80MB | Good | Fast | General use (recommended) |
| `minilm-l12` | 120MB | Better | Medium | More accurate search |
| `mpnet-base` | 420MB | Best | Slow | Maximum accuracy |

## Quick Start

### Remember Something

```bash
/remember Project Preferences | Use pnpm for package management tags: workflow, preferences
```

### Recall Information

```bash
/recall pnpm workflow
```

### Semantic Search

```bash
/recall package management preferences semantic
```

### Save Current Conversation

```bash
/save-conversation React hooks discussion
```

### Load Previous Conversation

```bash
/load-conversation <conversation-id>
```

### Save Session State

```bash
/save-session Current project context
```

### Search Knowledge Base

```bash
/search-knowledge authentication patterns
```

## Slash Commands

| Command | Description |
|---------|-------------|
| `/remember` | Store a memory or note |
| `/recall` | Search memories (keyword or semantic) |
| `/list-memories` | List all stored memories |
| `/save-conversation` | Save current conversation |
| `/load-conversation` | Load a previous conversation |
| `/save-session` | Save session state |
| `/restore-session` | Restore a saved session |
| `/search-knowledge` | Semantic search over knowledge base |

## Skills

### Auto-Remember (Automated)
Automatically captures important information from conversations without manual intervention.

### Context-Aware (Automated)
Uses relevant memories to enhance Claude's responses based on past interactions.

### Session-Persistence (Automated)
Automatically saves and restores session state across conversations.

## Agents

### Memory Indexer
Background agent that indexes conversations and builds vector embeddings for semantic search.

### Knowledge Extractor
Extracts structured knowledge from conversations and stores in the knowledge base.

### Semantic Search
Advanced semantic search over memories using vector similarity.

## Storage Structure

```
~/.claude-memory/
├── conversations/          # Conversation transcripts (markdown)
│   ├── <conversation-id>.md
│   └── index.json
├── knowledge/             # Knowledge base entries (markdown)
│   ├── <entry-id>.md
│   └── index.json
├── sessions/              # Session state snapshots (JSON)
│   ├── <session-id>.json
│   └── index.json
├── archive/               # Archived memories
│   └── <archived-id>.md
└── memory.db              # SQLite database (metadata, search index, embeddings)
```

## MCP Tools

The plugin provides these MCP tools for programmatic access:

- `remember` - Store a memory
- `recall` - Search memories
- `list_memories` - List all memories
- `save_conversation` - Save conversation
- `load_conversation` - Load conversation
- `save_session` - Save session
- `restore_session` - Restore session
- `search_knowledge` - Semantic knowledge search
- `get_stats` - Get storage statistics

## Examples

### Building a Knowledge Base

```bash
# Remember coding patterns
/remember TypeScript Error Handling | Always use custom error classes extending Error. Include error codes and context data. tags: typescript, patterns

# Remember project decisions
/remember Database Choice | Using PostgreSQL with Prisma ORM for type safety and migrations. tags: architecture, database

# Remember user preferences
/remember Code Style | Prefer functional components with hooks. Use named exports. tags: react, preferences
```

### Searching Your Knowledge

```bash
# Keyword search
/recall error handling

# Semantic search (understands intent)
/recall how should I handle errors in typescript semantic
```

### Saving Context for Later

```bash
# Save current conversation
/save-conversation API design discussion

# Save session state
/save-session Working on auth module
```

## Troubleshooting

### MCP Server Not Starting

1. Check that dependencies are installed: `cd mcp-server && npm install`
2. Build the server: `npm run build`
3. Check logs in Claude Code

### Semantic Search Not Working

1. Ensure embedding model is downloaded (first run takes longer)
2. Check `EMBEDDING_MODEL` environment variable
3. Verify sufficient disk space for model files

### Storage Size Growing Too Large

1. Adjust `MAX_MEMORY_SIZE_MB` limit
2. Reduce `AUTO_ARCHIVE_DAYS` to archive more aggressively
3. Manually archive or delete old memories:

```bash
# View stats
Use MCP tool: get_stats

# Archive will happen automatically based on AUTO_ARCHIVE_DAYS
```

## Development

### Build

```bash
cd mcp-server
npm run build
```

### Development Mode

```bash
cd mcp-server
npm run dev
```

### Type Check

```bash
cd mcp-server
npm run typecheck
```

## Architecture

- **Storage Layer**: SQLite (metadata) + Markdown files (content)
- **Search Layer**: SQLite FTS (keyword) + Vector embeddings (semantic)
- **Embeddings**: Local transformers (Xenova/transformers.js)
- **MCP Server**: TypeScript with @modelcontextprotocol/server
- **Transport**: stdio (standard MCP protocol)

## Privacy & Security

- **Local-only**: All data stored on your machine
- **No telemetry**: No usage tracking or analytics
- **No external APIs**: Embeddings generated locally
- **Encrypted at rest**: Use filesystem encryption if needed
- **Open source**: Fully auditable code

## Requirements

- Node.js >= 20.0.0
- ~500MB disk space (model + memories)
- Claude Code >= 0.1.0

## License

MIT

## Author

Tomer Hamam (tomerhamam@gmail.com)

## Contributing

Issues and pull requests welcome at the A2X marketplace repository.

---

**Powered by:**
- [@modelcontextprotocol/server](https://github.com/modelcontextprotocol/typescript-sdk) - MCP protocol implementation
- [@xenova/transformers](https://github.com/xenova/transformers.js) - Local embeddings
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - Fast SQLite with FTS

Created with ❤️ for the Claude Code community
