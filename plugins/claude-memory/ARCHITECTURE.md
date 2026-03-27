# Claude Memory Plugin - Architecture Documentation

## Overview

The Claude Memory Plugin provides persistent memory management for Claude Code with multi-level memory organization, semantic search capabilities, and local-first storage.

## Memory Levels & Scope

### 1. **User-Level Memory** (Default Scope)
- **Location**: `~/.claude-memory/`
- **Scope**: Shared across all projects and sessions for a single user
- **Persistence**: Permanent (unless archived or deleted)
- **Use Cases**:
  - Personal preferences and coding styles
  - Reusable knowledge and patterns
  - Cross-project learnings
  - General development practices

### 2. **Session-Level Memory**
- **Location**: `~/.claude-memory/sessions/`
- **Scope**: Specific to a working session
- **Persistence**: Saved snapshots that can be restored
- **Use Cases**:
  - Context from current work
  - Active file references
  - Temporary variables and state
  - Session-specific settings

### 3. **Conversation-Level Memory**
- **Location**: `~/.claude-memory/conversations/`
- **Scope**: Individual conversation threads
- **Persistence**: Full conversation history
- **Use Cases**:
  - Complete chat transcripts
  - Debugging history
  - Decision-making discussions
  - Implementation reasoning

### 4. **Knowledge-Level Memory**
- **Location**: `~/.claude-memory/knowledge/`
- **Scope**: Extracted structured knowledge
- **Persistence**: Long-term knowledge base
- **Use Cases**:
  - Code patterns and best practices
  - API documentation notes
  - Architecture decisions
  - Team conventions

## Architecture Diagram

\`\`\`mermaid
graph TB
    subgraph "Claude Code"
        CC[Claude Code CLI]
        Plugin[Claude Memory Plugin]
    end

    subgraph "MCP Layer"
        MCP[MCP Server<br/>stdio transport]
        Tools[MCP Tools<br/>remember, recall, etc.]
    end

    subgraph "Storage Layer"
        SM[Storage Manager]
        DB[(SQLite Database<br/>metadata + search)]
        FS[File System<br/>markdown files]
    end

    subgraph "Search Layer"
        FTS[Full-Text Search<br/>SQLite FTS5]
        VS[Vector Search<br/>Semantic Embeddings]
        Hybrid[Hybrid Search<br/>Keyword + Semantic]
    end

    subgraph "Embedding Layer"
        EG[Embedding Generator<br/>Xenova/transformers.js]
        Models[Local Models<br/>minilm-l6/l12, mpnet]
    end

    subgraph "Storage Structure"
        Conv[conversations/<br/>markdown files]
        Know[knowledge/<br/>markdown files]
        Sess[sessions/<br/>JSON files]
        Arch[archive/<br/>old memories]
        VecDB[(Embeddings<br/>in SQLite)]
    end

    CC --> Plugin
    Plugin --> MCP
    MCP --> Tools
    Tools --> SM
    SM --> DB
    SM --> FS
    SM --> Hybrid
    Hybrid --> FTS
    Hybrid --> VS
    VS --> EG
    EG --> Models
    FS --> Conv
    FS --> Know
    FS --> Sess
    FS --> Arch
    DB --> VecDB
    DB --> FTS
\`\`\`

## Component Architecture

\`\`\`mermaid
graph LR
    subgraph "Storage Manager"
        direction TB
        Create[Create Memory]
        Read[Get Memory]
        Update[Update Memory]
        Delete[Delete Memory]
        Search[Search Memories]
        Archive[Archive Old]
    end

    subgraph "Database Layer"
        direction TB
        Meta[Metadata<br/>SQLite Tables]
        Index[Search Index<br/>FTS5]
        Vectors[Vector Store<br/>BLOB fields]
    end

    subgraph "File System"
        direction TB
        MD[Markdown Files]
        JSON[JSON Sessions]
        Dirs[Directory Structure]
    end

    Create --> Meta
    Create --> MD
    Read --> Meta
    Read --> MD
    Update --> Meta
    Update --> MD
    Delete --> Meta
    Delete --> MD
    Search --> Index
    Search --> Vectors
    Archive --> Dirs
\`\`\`

## Data Flow Diagrams

### Memory Creation Flow

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Claude
    participant MCP
    participant Storage
    participant DB
    participant FS
    participant Embeddings

    User->>Claude: /remember "TypeScript patterns | Use const assertions"
    Claude->>MCP: remember(title, content, tags)
    MCP->>Storage: createMemory(type, title, content, tags)
    Storage->>FS: saveMemory() → markdown file
    FS-->>Storage: {path, size}
    Storage->>DB: insertMemory(metadata)
    Storage->>Embeddings: generateEmbedding(content)
    Embeddings-->>Storage: embedding vector
    Storage->>DB: insertEmbedding(vector)
    Storage-->>MCP: Memory created
    MCP-->>Claude: Success
    Claude-->>User: "Remembered: TypeScript patterns"
\`\`\`

### Memory Recall Flow (Hybrid Search)

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Claude
    participant MCP
    participant Storage
    participant FTS
    participant Vector
    participant FS

    User->>Claude: /recall "error handling patterns"
    Claude->>MCP: recall(query, mode: "semantic")
    MCP->>Storage: searchMemories(query)
    
    par Keyword Search
        Storage->>FTS: Full-text search
        FTS-->>Storage: keyword results + scores
    and Semantic Search
        Storage->>Vector: Generate query embedding
        Vector->>Vector: Cosine similarity search
        Vector-->>Storage: semantic results + similarities
    end
    
    Storage->>Storage: Merge & rank results
    Storage->>FS: Load full content for top results
    FS-->>Storage: Memory content
    Storage-->>MCP: SearchResults[]
    MCP-->>Claude: Formatted memories
    Claude-->>User: Display relevant memories
\`\`\`

### Session Save/Restore Flow

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Claude
    participant MCP
    participant Storage
    participant FS

    Note over User,FS: Save Session
    User->>Claude: /save-session "Auth module work"
    Claude->>MCP: save_session(title, context, files, vars)
    MCP->>Storage: saveSession(data)
    Storage->>FS: Save JSON file
    FS-->>Storage: {path, size}
    Storage-->>MCP: Session ID
    MCP-->>Claude: Success
    Claude-->>User: "Session saved: auth-work-123"

    Note over User,FS: Restore Session
    User->>Claude: /restore-session auth-work-123
    Claude->>MCP: restore_session(id)
    MCP->>Storage: loadSession(id)
    Storage->>FS: Read JSON file
    FS-->>Storage: Session data
    Storage-->>MCP: SessionState
    MCP-->>Claude: Context restored
    Claude-->>User: "Session restored + context loaded"
\`\`\`

## Storage Schema

### SQLite Database Schema

\`\`\`mermaid
erDiagram
    memories ||--o{ embeddings : has
    memories {
        text id PK
        text type "conversation|knowledge|note"
        text title
        text content_path
        text tags "JSON array"
        integer created_at
        integer updated_at
        text metadata "JSON object"
        integer archived "0|1"
        integer file_size
    }

    conversations {
        text id PK
        text title
        text content_path
        integer message_count
        integer created_at
        integer updated_at
        text metadata "JSON"
        integer archived "0|1"
    }

    knowledge ||--o| conversations : references
    knowledge {
        text id PK
        text title
        text content_path
        text category
        text tags "JSON"
        integer created_at
        integer updated_at
        text source_conversation_id FK
        text metadata "JSON"
        integer archived "0|1"
    }

    sessions {
        text id PK
        text title
        text content_path
        integer created_at
        text metadata "JSON"
    }

    embeddings {
        text id PK
        text memory_id FK
        blob embedding "Float32Array"
        text model
        integer created_at
    }

    memories_fts {
        text id
        text title "indexed"
        text content "indexed"
        text tags "indexed"
    }
\`\`\`

### File System Structure

\`\`\`
~/.claude-memory/
├── memory.db                          # SQLite database
├── conversations/                     # Conversation transcripts
│   ├── <uuid>.md                     # Individual conversations
│   └── index.json                    # Quick lookup index
├── knowledge/                        # Knowledge base
│   ├── <uuid>.md                     # Knowledge entries
│   ├── <uuid>.md                     # Notes
│   └── index.json                    # Quick lookup index
├── sessions/                         # Session snapshots
│   ├── <uuid>.json                   # Session state
│   └── index.json                    # Quick lookup index
└── archive/                          # Archived memories
    └── <uuid>.md                     # Old/archived items
\`\`\`

## Memory Lifecycle

\`\`\`mermaid
stateDiagram-v2
    [*] --> Active: Create Memory
    Active --> Active: Update/Edit
    Active --> Searched: User Query
    Searched --> Active: Not Found
    Searched --> Recalled: Found
    Recalled --> Active: Continue Using
    Active --> Archived: Auto-archive (90 days)
    Active --> Archived: Manual Archive
    Archived --> [*]: Cleanup/Delete
    
    note right of Active
        - Full-text indexed
        - Vector embedded
        - Searchable
    end note
    
    note right of Archived
        - Moved to archive/
        - Not searchable
        - Can be restored
    end note
\`\`\`

## Search Strategy

### Hybrid Search Algorithm

\`\`\`mermaid
flowchart TD
    Start[User Query] --> Parse[Parse Query]
    Parse --> Mode{Search Mode?}
    
    Mode -->|keyword| FTS[Full-Text Search<br/>SQLite FTS5]
    Mode -->|semantic| Vector[Vector Search<br/>Cosine Similarity]
    Mode -->|auto/hybrid| Both[Both Searches]
    
    FTS --> ResultsK[Keyword Results<br/>+ BM25 scores]
    Vector --> ResultsV[Semantic Results<br/>+ similarity scores]
    Both --> ResultsK
    Both --> ResultsV
    
    ResultsK --> Merge[Merge & Rank]
    ResultsV --> Merge
    
    Merge --> Boost{Apply Boosts}
    Boost --> Recent[Recent memories +10%]
    Boost --> Tags[Tag matches +15%]
    Boost --> Type[Type filters]
    
    Recent --> Final[Final Ranked List]
    Tags --> Final
    Type --> Final
    
    Final --> Limit[Top N Results]
    Limit --> Load[Load Full Content]
    Load --> Return[Return to User]
\`\`\`

## Embedding Models

| Model | Size | Dimensions | Speed | Quality | Best For |
|-------|------|------------|-------|---------|----------|
| `minilm-l6` | 80MB | 384 | Fast | Good | General use (default) |
| `minilm-l12` | 120MB | 384 | Medium | Better | More accurate search |
| `mpnet-base` | 420MB | 768 | Slow | Best | Maximum accuracy |

### Vector Similarity Calculation

\`\`\`typescript
// Cosine Similarity
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
\`\`\`

## Performance Characteristics

### Storage Limits

| Metric | Default | Configurable |
|--------|---------|--------------|
| Max Memory Size | 1000 MB | `MAX_MEMORY_SIZE_MB` |
| Auto-archive Age | 90 days | `AUTO_ARCHIVE_DAYS` |
| Search Result Limit | 10 | Per-query parameter |
| Embedding Cache | In-memory | Model-dependent |

### Indexing Performance

- **FTS Indexing**: Real-time during memory creation
- **Vector Embedding**: ~100-500ms per memory (model-dependent)
- **Batch Indexing**: Background job for large imports
- **Search Latency**: 
  - Keyword: <50ms
  - Semantic: 100-300ms (includes embedding generation)
  - Hybrid: 150-350ms

## Security & Privacy

\`\`\`mermaid
graph TD
    Data[User Data] --> Local[Local Storage Only]
    Local --> FS[File System<br/>~/.claude-memory]
    Local --> DB[SQLite Database<br/>memory.db]
    
    Embed[Embeddings] --> LocalModel[Local ML Models<br/>Xenova/transformers]
    LocalModel --> NoNetwork[No Network Calls]
    
    FS --> Encrypted{OS-Level Encryption?}
    Encrypted -->|Yes| Secure[Data Encrypted at Rest]
    Encrypted -->|No| Readable[Plain Text Files]
    
    NoNetwork --> Privacy[Complete Privacy]
    Secure --> Privacy
    Readable --> Warning[User Responsibility]
\`\`\`

### Privacy Guarantees

1. **Local-Only Storage**: All data stored on user's machine
2. **No Telemetry**: Zero usage tracking or analytics
3. **No External APIs**: Embeddings generated locally
4. **No Network Calls**: Plugin works offline
5. **Audit-able**: Open source code

### Security Recommendations

1. **File System Encryption**: Enable FileVault (macOS) or BitLocker (Windows)
2. **Backup Strategy**: Regular backups of `~/.claude-memory/`
3. **Access Control**: Proper file permissions on memory directory
4. **Sensitive Data**: Avoid storing secrets or credentials

## Configuration Options

### Environment Variables

\`\`\`bash
# Storage location
MEMORY_DIR=~/.claude-memory

# Embedding model selection
EMBEDDING_MODEL=minilm-l6  # or minilm-l12, mpnet-base

# Storage limits
MAX_MEMORY_SIZE_MB=1000
AUTO_ARCHIVE_DAYS=90

# Features
ENABLE_AUTO_INDEXING=true
\`\`\`

### Runtime Configuration

\`\`\`typescript
interface MemoryConfig {
  memoryDir: string;              // Storage directory
  embeddingModel: string;         // Model to use
  maxMemorySize?: number;         // Max size in MB
  autoArchiveDays?: number;       // Auto-archive threshold
  enableAutoIndexing?: boolean;   // Background indexing
}
\`\`\`

## Integration Points

### Claude Code Plugin System

\`\`\`mermaid
graph LR
    subgraph "Plugin Components"
        Commands[Slash Commands<br/>/remember, /recall]
        Skills[Skills<br/>auto-remember]
        Agents[Agents<br/>indexer, extractor]
        Hooks[Hooks<br/>on-message]
    end
    
    subgraph "MCP Server"
        Tools[MCP Tools]
        Server[stdio Server]
    end
    
    Commands --> Server
    Skills --> Server
    Agents --> Server
    Hooks --> Server
    Server --> Tools
\`\`\`

### MCP Tools API

| Tool | Purpose | Parameters |
|------|---------|------------|
| `remember` | Store memory | title, content, tags, type |
| `recall` | Search memories | query, mode, limit |
| `list_memories` | List all | filter |
| `save_conversation` | Save chat | title, messages |
| `load_conversation` | Load chat | id |
| `save_session` | Save state | title, context, files |
| `restore_session` | Restore state | id |
| `search_knowledge` | Semantic search | query, category |
| `get_stats` | Storage info | - |

## Extension Points

### Custom Indexing

\`\`\`typescript
// Future: Custom indexers
interface MemoryIndexer {
  index(memory: Memory): Promise<void>;
  search(query: string): Promise<SearchResult[]>;
}
\`\`\`

### Custom Storage Backends

\`\`\`typescript
// Future: Pluggable storage
interface StorageBackend {
  save(memory: Memory): Promise<void>;
  load(id: string): Promise<Memory | null>;
  search(query: string): Promise<SearchResult[]>;
}
\`\`\`

### Sync Capabilities (Future)

- Cloud sync (optional)
- Team knowledge bases
- Project-specific memories
- Git-based memory versioning

## Troubleshooting Guide

### Common Issues

1. **MCP Server Not Starting**
   - Check Node.js version (>= 20.0.0)
   - Run `npm install` in mcp-server/
   - Check logs in Claude Code

2. **Semantic Search Not Working**
   - First run downloads models (~80-420MB)
   - Check disk space
   - Verify EMBEDDING_MODEL env var

3. **Storage Growing Too Large**
   - Check stats with `get_stats` tool
   - Adjust AUTO_ARCHIVE_DAYS
   - Manual cleanup of archive/

4. **Search Not Finding Results**
   - Try different search modes (keyword vs semantic)
   - Check for typos in query
   - Verify memory was saved (use list_memories)

## Performance Tuning

### For Large Memory Collections (>1000 items)

1. **Reduce Embedding Model**: Use `minilm-l6` instead of `mpnet-base`
2. **Aggressive Archiving**: Set `AUTO_ARCHIVE_DAYS=30`
3. **Limit Search Results**: Use smaller `limit` in searches
4. **Periodic Cleanup**: Archive old conversations manually

### For Faster Search

1. **Keyword-Only Mode**: Skip semantic search for simple queries
2. **Tag Filtering**: Use specific tags to narrow scope
3. **Type Filtering**: Search only conversations or only knowledge
4. **Index Optimization**: SQLite vacuum periodically

---

## Summary

The Claude Memory Plugin provides a **three-tier memory system**:

1. **User-Level**: Global preferences and knowledge (`~/.claude-memory/`)
2. **Session-Level**: Working context and state (`sessions/`)
3. **Conversation-Level**: Full chat history (`conversations/`)

With **hybrid search** combining:
- Full-text keyword search (SQLite FTS5)
- Semantic vector search (local embeddings)
- Smart ranking and relevance boosting

All while maintaining **complete privacy** through local-only storage and processing.
