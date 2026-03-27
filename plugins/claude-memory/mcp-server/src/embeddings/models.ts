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

export const EMBEDDING_MODELS: Record<string, EmbeddingModelConfig> = {
  'minilm-l6': {
    name: 'MiniLM-L6',
    modelId: 'Xenova/all-MiniLM-L6-v2',
    dimensions: 384,
    maxTokens: 256,
    description: 'Fast, small (80MB), good quality. Best for most use cases.',
    sizeMB: 80
  },
  'minilm-l12': {
    name: 'MiniLM-L12',
    modelId: 'Xenova/all-MiniLM-L12-v2',
    dimensions: 384,
    maxTokens: 256,
    description: 'Slower, larger (120MB), better quality. More accurate search.',
    sizeMB: 120
  },
  'mpnet-base': {
    name: 'MPNet-Base',
    modelId: 'Xenova/all-mpnet-base-v2',
    dimensions: 768,
    maxTokens: 384,
    description: 'Highest quality (420MB), best accuracy. Slower generation.',
    sizeMB: 420
  }
};

export const DEFAULT_MODEL = 'minilm-l6';

export function getModelConfig(modelName?: string): EmbeddingModelConfig {
  const name = modelName || DEFAULT_MODEL;
  const config = EMBEDDING_MODELS[name];

  if (!config) {
    console.error(`Unknown embedding model: ${name}, falling back to ${DEFAULT_MODEL}`);
    return EMBEDDING_MODELS[DEFAULT_MODEL]!;
  }

  return config;
}

export function listAvailableModels(): EmbeddingModelConfig[] {
  return Object.values(EMBEDDING_MODELS);
}
