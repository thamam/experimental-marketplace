/**
 * Embedding generation using Transformers.js
 * Generates vector embeddings for semantic search
 */
import { type EmbeddingModelConfig } from './models.js';
export declare class EmbeddingGenerator {
    private model;
    private modelConfig;
    private isInitializing;
    private initPromise;
    constructor(modelName?: string);
    initialize(): Promise<void>;
    private _initialize;
    generateEmbedding(text: string): Promise<number[]>;
    generateBatch(texts: string[]): Promise<number[][]>;
    getModelInfo(): EmbeddingModelConfig;
    isReady(): boolean;
}
//# sourceMappingURL=generator.d.ts.map