/**
 * Embedding generation using Transformers.js
 * Generates vector embeddings for semantic search
 */
import { pipeline } from '@xenova/transformers';
import { getModelConfig } from './models.js';
export class EmbeddingGenerator {
    model = null;
    modelConfig;
    isInitializing = false;
    initPromise = null;
    constructor(modelName) {
        this.modelConfig = getModelConfig(modelName);
    }
    async initialize() {
        if (this.model)
            return;
        if (this.isInitializing && this.initPromise) {
            return this.initPromise;
        }
        this.isInitializing = true;
        this.initPromise = this._initialize();
        try {
            await this.initPromise;
        }
        finally {
            this.isInitializing = false;
            this.initPromise = null;
        }
    }
    async _initialize() {
        console.error(`Initializing embedding model: ${this.modelConfig.name} (${this.modelConfig.modelId})`);
        console.error(`Model size: ~${this.modelConfig.sizeMB}MB, Dimensions: ${this.modelConfig.dimensions}`);
        try {
            this.model = await pipeline('feature-extraction', this.modelConfig.modelId);
            console.error('Embedding model initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize embedding model:', error);
            throw new Error(`Failed to load embedding model: ${error}`);
        }
    }
    async generateEmbedding(text) {
        await this.initialize();
        if (!this.model) {
            throw new Error('Embedding model not initialized');
        }
        try {
            // Truncate text to max tokens (rough estimate: 1 token ≈ 4 chars)
            const maxChars = this.modelConfig.maxTokens * 4;
            const truncatedText = text.length > maxChars ? text.slice(0, maxChars) : text;
            const output = await this.model(truncatedText, {
                pooling: 'mean',
                normalize: true
            });
            // Convert to array
            const embedding = Array.from(output.data);
            return embedding;
        }
        catch (error) {
            console.error('Failed to generate embedding:', error);
            throw new Error(`Failed to generate embedding: ${error}`);
        }
    }
    async generateBatch(texts) {
        await this.initialize();
        if (!this.model) {
            throw new Error('Embedding model not initialized');
        }
        const embeddings = [];
        // Process in batches to avoid memory issues
        const batchSize = 10;
        for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize);
            const batchEmbeddings = await Promise.all(batch.map(text => this.generateEmbedding(text)));
            embeddings.push(...batchEmbeddings);
        }
        return embeddings;
    }
    getModelInfo() {
        return this.modelConfig;
    }
    isReady() {
        return this.model !== null;
    }
}
//# sourceMappingURL=generator.js.map