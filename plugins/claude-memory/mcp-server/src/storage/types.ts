/**
 * Type definitions for Claude Memory storage layer
 */

export interface Memory {
  id: string;
  type: 'conversation' | 'knowledge' | 'note';
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, unknown>;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  sourceConversationId?: string;
  metadata?: Record<string, unknown>;
}

export interface SessionState {
  id: string;
  title: string;
  context: string;
  files: string[];
  variables: Record<string, unknown>;
  createdAt: number;
  metadata?: Record<string, unknown>;
}

export interface VectorEmbedding {
  id: string;
  memoryId: string;
  embedding: number[];
  model: string;
  createdAt: number;
}

export interface SearchResult {
  memory: Memory;
  score: number;
  similarity?: number;
}

export interface MemoryFilter {
  type?: Memory['type'];
  tags?: string[];
  startDate?: number;
  endDate?: number;
  limit?: number;
  offset?: number;
}

export interface MemoryConfig {
  memoryDir: string;
  embeddingModel: string;
  maxMemorySize?: number; // in MB
  autoArchiveDays?: number;
  enableAutoIndexing?: boolean;
}
