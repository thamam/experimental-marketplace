/**
 * Unified storage manager for Claude Memory
 * Combines SQLite database and file system storage
 */

import { randomUUID } from 'crypto';
import { MemoryDatabase } from './database.js';
import { FileSystemStorage } from './filesystem.js';
import type {
  Memory,
  Conversation,
  KnowledgeEntry,
  SessionState,
  MemoryFilter,
  SearchResult,
  MemoryConfig
} from './types.js';

export class StorageManager {
  private db: MemoryDatabase;
  private fs: FileSystemStorage;
  private config: MemoryConfig;

  constructor(config: MemoryConfig) {
    this.config = config;
    this.db = new MemoryDatabase(config.memoryDir);
    this.fs = new FileSystemStorage(config.memoryDir);
  }

  // Memory operations
  async createMemory(
    type: Memory['type'],
    title: string,
    content: string,
    tags: string[] = [],
    metadata?: Record<string, unknown>
  ): Promise<Memory> {
    const id = randomUUID();
    const now = Date.now();

    const memory: Memory = {
      id,
      type,
      title,
      content,
      tags,
      createdAt: now,
      updatedAt: now,
      metadata
    };

    // Check size limits before writing — throws if limit exceeded
    await this.enforceStorageLimits();

    // Save to filesystem
    const { path, size } = this.fs.saveMemory(memory);

    // Save metadata to database
    this.db.insertMemory(memory, path, size);

    return memory;
  }

  async getMemory(id: string): Promise<Memory | null> {
    const memoryMeta = this.db.getMemory(id);
    if (!memoryMeta) return null;

    // Load full content from filesystem
    const memory = this.fs.loadMemory(id, memoryMeta.type);
    if (!memory) return null;

    return memory;
  }

  async updateMemory(id: string, updates: Partial<Memory>): Promise<void> {
    const memory = await this.getMemory(id);
    if (!memory) {
      throw new Error(`Memory ${id} not found`);
    }

    const updated: Memory = {
      ...memory,
      ...updates,
      updatedAt: Date.now()
    };

    // Save to filesystem
    this.fs.saveMemory(updated);

    // Update database
    this.db.updateMemory(id, updated);
  }

  async deleteMemory(id: string): Promise<void> {
    const memory = await this.getMemory(id);
    if (!memory) return;

    // Delete from filesystem based on type
    if (memory.type === 'conversation') {
      this.fs.deleteConversation(id);
    } else {
      this.fs.deleteKnowledge(id);
    }

    // Delete from database
    this.db.deleteMemory(id);
  }

  async listMemories(filter?: MemoryFilter): Promise<Memory[]> {
    const memories = this.db.listMemories(filter);

    // Load full content from filesystem
    const fullMemories: Memory[] = [];
    for (const meta of memories) {
      const memory = this.fs.loadMemory(meta.id, meta.type);
      if (memory) {
        fullMemories.push(memory);
      }
    }

    return fullMemories;
  }

  async searchMemories(query: string, limit?: number): Promise<SearchResult[]> {
    const results = this.db.searchMemories(query, limit);

    // Load full content for each result
    const fullResults: SearchResult[] = [];
    for (const result of results) {
      const memory = this.fs.loadMemory(result.memory.id, result.memory.type);
      if (memory) {
        fullResults.push({
          ...result,
          memory
        });
      }
    }

    return fullResults;
  }

  // Conversation operations
  async saveConversation(
    title: string,
    messages: Conversation['messages'],
    metadata?: Record<string, unknown>
  ): Promise<Conversation> {
    // Check size limits before writing — throws if limit exceeded
    await this.enforceStorageLimits();

    const id = randomUUID();
    const now = Date.now();

    const conversation: Conversation = {
      id,
      title,
      messages,
      createdAt: now,
      updatedAt: now,
      metadata
    };

    // Save to filesystem
    const { path } = this.fs.saveConversation(conversation);

    // Insert record into the conversations table so stats are accurate
    this.db.insertConversation(
      conversation.id,
      conversation.title,
      path,
      conversation.messages.length,
      conversation.createdAt,
      conversation.updatedAt,
      conversation.metadata
    );

    return conversation;
  }

  async loadConversation(id: string): Promise<Conversation | null> {
    return this.fs.loadConversation(id);
  }

  // Knowledge operations
  async saveKnowledge(
    title: string,
    content: string,
    category?: string,
    tags: string[] = [],
    sourceConversationId?: string,
    metadata?: Record<string, unknown>
  ): Promise<KnowledgeEntry> {
    const id = randomUUID();
    const now = Date.now();

    const entry: KnowledgeEntry = {
      id,
      title,
      content,
      category,
      tags,
      createdAt: now,
      updatedAt: now,
      sourceConversationId,
      metadata
    };

    // Save to filesystem
    this.fs.saveKnowledge(entry);

    return entry;
  }

  async loadKnowledge(id: string): Promise<KnowledgeEntry | null> {
    return this.fs.loadKnowledge(id);
  }

  // Session operations
  async saveSession(
    title: string,
    context: string,
    files: string[],
    variables: Record<string, unknown>,
    metadata?: Record<string, unknown>
  ): Promise<SessionState> {
    const id = randomUUID();
    const now = Date.now();

    const session: SessionState = {
      id,
      title,
      context,
      files,
      variables,
      createdAt: now,
      metadata
    };

    // Save to filesystem
    this.fs.saveSession(session);

    return session;
  }

  async loadSession(id: string): Promise<SessionState | null> {
    return this.fs.loadSession(id);
  }

  // Archive operations
  async archiveMemory(id: string): Promise<void> {
    const memory = await this.getMemory(id);
    if (!memory) return;

    this.fs.archiveMemory(id, memory.type);
    this.db.archiveMemory(id);
  }

  async archiveOldMemories(daysOld?: number): Promise<number> {
    const days = daysOld || this.config.autoArchiveDays || 90;
    return this.db.archiveOldMemories(days);
  }

  // Storage management
  async getStats() {
    const stats = this.db.getStats();
    return stats;
  }

  private async enforceStorageLimits(): Promise<void> {
    if (!this.config.maxMemorySize) return;

    const stats = await this.getStats();
    const maxSizeMB = this.config.maxMemorySize;

    if (stats.dbSizeMB > maxSizeMB) {
      console.error(`Memory storage exceeds limit (${stats.dbSizeMB.toFixed(2)}MB / ${maxSizeMB}MB)`);
      console.error('Consider archiving old memories or increasing the limit');
      throw new Error(`Storage limit exceeded: ${stats.dbSizeMB.toFixed(2)}MB / ${maxSizeMB}MB. Archive old memories or increase the limit.`);
    }
  }

  close(): void {
    this.db.close();
  }
}

// Export all types
export type {
  Memory,
  Conversation,
  KnowledgeEntry,
  SessionState,
  MemoryFilter,
  SearchResult,
  MemoryConfig,
  VectorEmbedding
} from './types.js';
