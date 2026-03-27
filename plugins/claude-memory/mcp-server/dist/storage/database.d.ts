/**
 * SQLite database management for Claude Memory
 * Handles metadata, indexes, and vector embeddings
 */
import type { Memory, VectorEmbedding, MemoryFilter, SearchResult } from './types.js';
export declare class MemoryDatabase {
    private db;
    private memoryDir;
    constructor(memoryDir: string);
    private initializeSchema;
    insertConversation(id: string, title: string, contentPath: string, messageCount: number, createdAt: number, updatedAt: number, metadata?: Record<string, unknown>): void;
    insertMemory(memory: Memory, contentPath: string, fileSize: number): void;
    updateMemory(id: string, updates: Partial<Memory>): void;
    getMemory(id: string): Memory | null;
    listMemories(filter?: MemoryFilter): Memory[];
    deleteMemory(id: string): void;
    archiveMemory(id: string): void;
    private updateFTS;
    private deleteFTS;
    searchMemories(query: string, limit?: number): SearchResult[];
    insertEmbedding(embedding: VectorEmbedding): void;
    getEmbedding(memoryId: string): VectorEmbedding | null;
    getAllEmbeddings(model?: string): VectorEmbedding[];
    getStats(): {
        totalMemories: number;
        totalConversations: number;
        totalKnowledge: number;
        totalSessions: number;
        totalEmbeddings: number;
        dbSizeMB: number;
    };
    archiveOldMemories(daysOld: number): number;
    close(): void;
}
//# sourceMappingURL=database.d.ts.map