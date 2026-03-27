/**
 * Embedding model configurations
 * Supports multiple models with different trade-offs
 */
export interface EmbeddingModelConfig {
    name: string;
    modelId: string;
    dimensions: number;
    maxTokens: number;
    description: string;
    sizeMB: number;
}
export declare const EMBEDDING_MODELS: Record<string, EmbeddingModelConfig>;
export declare const DEFAULT_MODEL = "minilm-l6";
export declare function getModelConfig(modelName?: string): EmbeddingModelConfig;
export declare function listAvailableModels(): EmbeddingModelConfig[];
//# sourceMappingURL=models.d.ts.map