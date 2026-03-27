/**
 * Unified storage manager for Claude Memory
 * Combines SQLite database and file system storage
 */
import type { Memory, Conversation, KnowledgeEntry, SessionState, MemoryFilter, SearchResult, MemoryConfig } from './types.js';
export declare class StorageManager {
    private db;
    private fs;
    private config;
    constructor(config: MemoryConfig);
    createMemory(type: Memory['type'], title: string, content: string, tags?: string[], metadata?: Record<string, unknown>): Promise<Memory>;
    getMemory(id: string): Promise<Memory | null>;
    updateMemory(id: string, updates: Partial<Memory>): Promise<void>;
    deleteMemory(id: string): Promise<void>;
    listMemories(filter?: MemoryFilter): Promise<Memory[]>;
    searchMemories(query: string, limit?: number): Promise<SearchResult[]>;
    saveConversation(title: string, messages: Conversation['messages'], metadata?: Record<string, unknown>): Promise<Conversation>;
    loadConversation(id: string): Promise<Conversation | null>;
    saveKnowledge(title: string, content: string, category?: string, tags?: string[], sourceConversationId?: string, metadata?: Record<string, unknown>): Promise<KnowledgeEntry>;
    loadKnowledge(id: string): Promise<KnowledgeEntry | null>;
    saveSession(title: string, context: string, files: string[], variables: Record<string, unknown>, metadata?: Record<string, unknown>): Promise<SessionState>;
    loadSession(id: string): Promise<SessionState | null>;
    archiveMemory(id: string): Promise<void>;
    archiveOldMemories(daysOld?: number): Promise<number>;
    getStats(): Promise<{
        totalMemories: number;
        totalConversations: number;
        totalKnowledge: number;
        totalSessions: number;
        totalEmbeddings: number;
        dbSizeMB: number;
    }>;
    private enforceStorageLimits;
    close(): void;
}
export type { Memory, Conversation, KnowledgeEntry, SessionState, MemoryFilter, SearchResult, MemoryConfig, VectorEmbedding } from './types.js';
//# sourceMappingURL=index.d.ts.map