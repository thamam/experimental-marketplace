/**
 * Vector similarity search
 * Implements cosine similarity for semantic search
 */
import { MemoryDatabase } from '../storage/database.js';
import type { SearchResult, Memory } from '../storage/types.js';
export declare class SemanticSearch {
    private generator;
    private db;
    constructor(db: MemoryDatabase, modelName?: string);
    initialize(): Promise<void>;
    /**
     * Index a memory by generating and storing its embedding
     */
    indexMemory(memoryId: string, text: string): Promise<void>;
    /**
     * Search for similar memories using cosine similarity
     */
    search(query: string, memories: Memory[], topK?: number): Promise<SearchResult[]>;
    /**
     * Batch index multiple memories
     */
    batchIndex(memories: Array<{
        id: string;
        text: string;
    }>): Promise<void>;
    /**
     * Calculate cosine similarity between two vectors
     */
    private cosineSimilarity;
    /**
     * Get statistics about indexed memories
     */
    getIndexStats(): {
        totalEmbeddings: number;
        model: string;
        dimensions: number;
    };
    isReady(): boolean;
}
//# sourceMappingURL=search.d.ts.map