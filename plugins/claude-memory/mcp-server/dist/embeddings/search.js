/**
 * Vector similarity search
 * Implements cosine similarity for semantic search
 */
import { randomUUID } from 'crypto';
import { EmbeddingGenerator } from './generator.js';
export class SemanticSearch {
    generator;
    db;
    constructor(db, modelName) {
        this.db = db;
        this.generator = new EmbeddingGenerator(modelName);
    }
    async initialize() {
        await this.generator.initialize();
    }
    /**
     * Index a memory by generating and storing its embedding
     */
    async indexMemory(memoryId, text) {
        const embedding = await this.generator.generateEmbedding(text);
        const modelInfo = this.generator.getModelInfo();
        const vectorEmbedding = {
            id: randomUUID(),
            memoryId,
            embedding,
            model: modelInfo.modelId,
            createdAt: Date.now()
        };
        this.db.insertEmbedding(vectorEmbedding);
    }
    /**
     * Search for similar memories using cosine similarity
     */
    async search(query, memories, topK = 10) {
        // Generate query embedding
        const queryEmbedding = await this.generator.generateEmbedding(query);
        const modelInfo = this.generator.getModelInfo();
        // Get all embeddings for the current model
        const embeddings = this.db.getAllEmbeddings(modelInfo.modelId);
        // Create a map of memory IDs to embeddings
        const embeddingMap = new Map();
        for (const emb of embeddings) {
            embeddingMap.set(emb.memoryId, emb.embedding);
        }
        // Calculate similarities
        const results = [];
        for (const memory of memories) {
            const memoryEmbedding = embeddingMap.get(memory.id);
            if (!memoryEmbedding) {
                // If no embedding exists, index it now then retrieve the stored embedding
                await this.indexMemory(memory.id, memory.content);
                const stored = this.db.getEmbedding(memory.id);
                if (stored) {
                    embeddingMap.set(memory.id, stored.embedding);
                }
            }
            const embedding = embeddingMap.get(memory.id);
            if (!embedding)
                continue;
            const similarity = this.cosineSimilarity(queryEmbedding, embedding);
            results.push({
                memory,
                score: similarity,
                similarity
            });
        }
        // Sort by similarity (descending) and return top K
        results.sort((a, b) => b.score - a.score);
        return results.slice(0, topK);
    }
    /**
     * Batch index multiple memories
     */
    async batchIndex(memories) {
        const texts = memories.map(m => m.text);
        const embeddings = await this.generator.generateBatch(texts);
        const modelInfo = this.generator.getModelInfo();
        for (let i = 0; i < memories.length; i++) {
            const memory = memories[i];
            const embedding = embeddings[i];
            if (!memory || !embedding)
                continue;
            const vectorEmbedding = {
                id: randomUUID(),
                memoryId: memory.id,
                embedding,
                model: modelInfo.modelId,
                createdAt: Date.now()
            };
            this.db.insertEmbedding(vectorEmbedding);
        }
    }
    /**
     * Calculate cosine similarity between two vectors
     */
    cosineSimilarity(vecA, vecB) {
        if (vecA.length !== vecB.length) {
            throw new Error('Vectors must have the same length');
        }
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            const a = vecA[i] ?? 0;
            const b = vecB[i] ?? 0;
            dotProduct += a * b;
            normA += a * a;
            normB += b * b;
        }
        const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
        if (magnitude === 0)
            return 0;
        return dotProduct / magnitude;
    }
    /**
     * Get statistics about indexed memories
     */
    getIndexStats() {
        const modelInfo = this.generator.getModelInfo();
        const embeddings = this.db.getAllEmbeddings(modelInfo.modelId);
        return {
            totalEmbeddings: embeddings.length,
            model: modelInfo.name,
            dimensions: modelInfo.dimensions
        };
    }
    isReady() {
        return this.generator.isReady();
    }
}
//# sourceMappingURL=search.js.map