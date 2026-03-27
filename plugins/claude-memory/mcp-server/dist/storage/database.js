/**
 * SQLite database management for Claude Memory
 * Handles metadata, indexes, and vector embeddings
 */
import Database from 'better-sqlite3';
import { existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
export class MemoryDatabase {
    db;
    memoryDir;
    constructor(memoryDir) {
        this.memoryDir = memoryDir;
        // Ensure directory exists
        if (!existsSync(memoryDir)) {
            mkdirSync(memoryDir, { recursive: true });
        }
        const dbPath = join(memoryDir, 'memory.db');
        this.db = new Database(dbPath);
        this.db.pragma('journal_mode = WAL');
        this.db.pragma('foreign_keys = ON');
        this.initializeSchema();
    }
    initializeSchema() {
        // Memories table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK(type IN ('conversation', 'knowledge', 'note')),
        title TEXT NOT NULL,
        content_path TEXT NOT NULL,
        tags TEXT, -- JSON array
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        metadata TEXT, -- JSON object
        archived INTEGER DEFAULT 0,
        file_size INTEGER DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type);
      CREATE INDEX IF NOT EXISTS idx_memories_created ON memories(created_at);
      CREATE INDEX IF NOT EXISTS idx_memories_archived ON memories(archived);
      CREATE INDEX IF NOT EXISTS idx_memories_tags ON memories(tags);
    `);
        // Conversations table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content_path TEXT NOT NULL,
        message_count INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        metadata TEXT,
        archived INTEGER DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_conversations_created ON conversations(created_at);
      CREATE INDEX IF NOT EXISTS idx_conversations_archived ON conversations(archived);
    `);
        // Knowledge base table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS knowledge (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content_path TEXT NOT NULL,
        category TEXT,
        tags TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        source_conversation_id TEXT,
        metadata TEXT,
        archived INTEGER DEFAULT 0,
        FOREIGN KEY (source_conversation_id) REFERENCES conversations(id)
      );

      CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge(category);
      CREATE INDEX IF NOT EXISTS idx_knowledge_tags ON knowledge(tags);
      CREATE INDEX IF NOT EXISTS idx_knowledge_archived ON knowledge(archived);
    `);
        // Sessions table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content_path TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        metadata TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at);
    `);
        // Vector embeddings table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS embeddings (
        id TEXT PRIMARY KEY,
        memory_id TEXT NOT NULL,
        embedding BLOB NOT NULL,
        model TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (memory_id) REFERENCES memories(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_embeddings_memory ON embeddings(memory_id);
      CREATE INDEX IF NOT EXISTS idx_embeddings_model ON embeddings(model);
    `);
        // Full-text search virtual table
        this.db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS memories_fts USING fts5(
        id UNINDEXED,
        title,
        content,
        tags,
        tokenize = 'porter unicode61'
      );
    `);
    }
    // Conversation CRUD operations
    insertConversation(id, title, contentPath, messageCount, createdAt, updatedAt, metadata) {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO conversations (id, title, content_path, message_count, created_at, updated_at, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, title, contentPath, messageCount, createdAt, updatedAt, metadata ? JSON.stringify(metadata) : null);
    }
    // Memory CRUD operations
    insertMemory(memory, contentPath, fileSize) {
        const stmt = this.db.prepare(`
      INSERT INTO memories (id, type, title, content_path, tags, created_at, updated_at, metadata, file_size)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(memory.id, memory.type, memory.title, contentPath, JSON.stringify(memory.tags), memory.createdAt, memory.updatedAt, memory.metadata ? JSON.stringify(memory.metadata) : null, fileSize);
        // Update FTS index
        this.updateFTS(memory.id, memory.title, memory.content, memory.tags);
    }
    updateMemory(id, updates) {
        const fields = [];
        const values = [];
        if (updates.title !== undefined) {
            fields.push('title = ?');
            values.push(updates.title);
        }
        if (updates.tags !== undefined) {
            fields.push('tags = ?');
            values.push(JSON.stringify(updates.tags));
        }
        if (updates.metadata !== undefined) {
            fields.push('metadata = ?');
            values.push(JSON.stringify(updates.metadata));
        }
        fields.push('updated_at = ?');
        values.push(Date.now());
        values.push(id);
        const stmt = this.db.prepare(`
      UPDATE memories SET ${fields.join(', ')} WHERE id = ?
    `);
        stmt.run(...values);
        // Update FTS if title or tags changed
        if (updates.title || updates.tags || updates.content) {
            const memory = this.getMemory(id);
            if (memory) {
                this.updateFTS(id, memory.title, memory.content, memory.tags);
            }
        }
    }
    getMemory(id) {
        const stmt = this.db.prepare(`
      SELECT * FROM memories WHERE id = ? AND archived = 0
    `);
        const row = stmt.get(id);
        if (!row)
            return null;
        return {
            id: row.id,
            type: row.type,
            title: row.title,
            content: '', // Will be loaded from file
            tags: JSON.parse(row.tags || '[]'),
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            metadata: row.metadata ? JSON.parse(row.metadata) : undefined
        };
    }
    listMemories(filter = {}) {
        let query = 'SELECT * FROM memories WHERE archived = 0';
        const params = [];
        if (filter.type) {
            query += ' AND type = ?';
            params.push(filter.type);
        }
        if (filter.startDate) {
            query += ' AND created_at >= ?';
            params.push(filter.startDate);
        }
        if (filter.endDate) {
            query += ' AND created_at <= ?';
            params.push(filter.endDate);
        }
        if (filter.tags && filter.tags.length > 0) {
            // Escape % and _ in tag values to prevent wildcard expansion in LIKE
            const escapedTags = filter.tags.map(tag => tag.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_'));
            const tagConditions = filter.tags.map(() => "tags LIKE ? ESCAPE '\\'").join(' OR ');
            query += ` AND (${tagConditions})`;
            params.push(...escapedTags.map(tag => `%"${tag}"%`));
        }
        query += ' ORDER BY created_at DESC';
        if (filter.limit) {
            query += ' LIMIT ?';
            params.push(filter.limit);
        }
        if (filter.offset) {
            query += ' OFFSET ?';
            params.push(filter.offset);
        }
        const stmt = this.db.prepare(query);
        const rows = stmt.all(...params);
        return rows.map(row => ({
            id: row.id,
            type: row.type,
            title: row.title,
            content: '',
            tags: JSON.parse(row.tags || '[]'),
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            metadata: row.metadata ? JSON.parse(row.metadata) : undefined
        }));
    }
    deleteMemory(id) {
        const stmt = this.db.prepare('DELETE FROM memories WHERE id = ?');
        stmt.run(id);
        this.deleteFTS(id);
    }
    archiveMemory(id) {
        const stmt = this.db.prepare('UPDATE memories SET archived = 1 WHERE id = ?');
        stmt.run(id);
    }
    // Full-text search
    updateFTS(id, title, content, tags) {
        const deleteStmt = this.db.prepare('DELETE FROM memories_fts WHERE id = ?');
        deleteStmt.run(id);
        const insertStmt = this.db.prepare(`
      INSERT INTO memories_fts (id, title, content, tags)
      VALUES (?, ?, ?, ?)
    `);
        insertStmt.run(id, title, content, tags.join(' '));
    }
    deleteFTS(id) {
        const stmt = this.db.prepare('DELETE FROM memories_fts WHERE id = ?');
        stmt.run(id);
    }
    searchMemories(query, limit = 10) {
        const stmt = this.db.prepare(`
      SELECT
        m.*,
        fts.rank
      FROM memories_fts fts
      JOIN memories m ON fts.id = m.id
      WHERE memories_fts MATCH ?
        AND m.archived = 0
      ORDER BY fts.rank
      LIMIT ?
    `);
        const rows = stmt.all(query, limit);
        return rows.map(row => ({
            memory: {
                id: row.id,
                type: row.type,
                title: row.title,
                content: '',
                tags: JSON.parse(row.tags || '[]'),
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                metadata: row.metadata ? JSON.parse(row.metadata) : undefined
            },
            score: Math.abs(row.rank)
        }));
    }
    // Vector embeddings operations
    insertEmbedding(embedding) {
        const stmt = this.db.prepare(`
      INSERT INTO embeddings (id, memory_id, embedding, model, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
        const buffer = Buffer.from(new Float32Array(embedding.embedding).buffer);
        stmt.run(embedding.id, embedding.memoryId, buffer, embedding.model, embedding.createdAt);
    }
    getEmbedding(memoryId) {
        const stmt = this.db.prepare('SELECT * FROM embeddings WHERE memory_id = ?');
        const row = stmt.get(memoryId);
        if (!row)
            return null;
        const buffer = row.embedding;
        const embedding = Array.from(new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4));
        return {
            id: row.id,
            memoryId: row.memory_id,
            embedding,
            model: row.model,
            createdAt: row.created_at
        };
    }
    getAllEmbeddings(model) {
        let query = 'SELECT * FROM embeddings';
        const params = [];
        if (model) {
            query += ' WHERE model = ?';
            params.push(model);
        }
        const stmt = this.db.prepare(query);
        const rows = stmt.all(...params);
        return rows.map(row => {
            const buffer = row.embedding;
            const embedding = Array.from(new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4));
            return {
                id: row.id,
                memoryId: row.memory_id,
                embedding,
                model: row.model,
                createdAt: row.created_at
            };
        });
    }
    // Database statistics
    getStats() {
        const memories = this.db.prepare('SELECT COUNT(*) as count FROM memories WHERE archived = 0').get();
        const conversations = this.db.prepare('SELECT COUNT(*) as count FROM conversations WHERE archived = 0').get();
        const knowledge = this.db.prepare('SELECT COUNT(*) as count FROM knowledge WHERE archived = 0').get();
        const sessions = this.db.prepare('SELECT COUNT(*) as count FROM sessions').get();
        const embeddings = this.db.prepare('SELECT COUNT(*) as count FROM embeddings').get();
        const totalFileSize = this.db.prepare('SELECT SUM(file_size) as total FROM memories WHERE archived = 0').get();
        // Also count filesystem size of conversation files (saved outside the memories table)
        let conversationFsBytes = 0;
        const conversationsDir = join(this.memoryDir, 'conversations');
        if (existsSync(conversationsDir)) {
            try {
                const files = readdirSync(conversationsDir);
                for (const file of files) {
                    if (file.endsWith('.md')) {
                        const filePath = join(conversationsDir, file);
                        conversationFsBytes += statSync(filePath).size;
                    }
                }
            }
            catch (e) {
                console.error('[getStats] Failed to read conversations directory:', e);
                // Non-fatal: best-effort size accounting
            }
        }
        return {
            totalMemories: memories.count,
            totalConversations: conversations.count,
            totalKnowledge: knowledge.count,
            totalSessions: sessions.count,
            totalEmbeddings: embeddings.count,
            dbSizeMB: ((totalFileSize.total || 0) + conversationFsBytes) / (1024 * 1024)
        };
    }
    // Cleanup operations
    archiveOldMemories(daysOld) {
        const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
        const stmt = this.db.prepare(`
      UPDATE memories
      SET archived = 1
      WHERE created_at < ? AND archived = 0
    `);
        const result = stmt.run(cutoffDate);
        return result.changes;
    }
    close() {
        this.db.close();
    }
}
//# sourceMappingURL=database.js.map