/**
 * MCP tool implementations for memory operations
 */

import { z } from 'zod';
import type { StorageManager } from '../storage/index.js';
import type { SemanticSearch } from '../embeddings/search.js';

// Tool schemas
export const RememberSchema = z.object({
  title: z.string().describe('Title of the memory'),
  content: z.string().describe('Content to remember'),
  type: z.enum(['conversation', 'knowledge', 'note']).optional().describe('Type of memory'),
  tags: z.array(z.string()).optional().describe('Tags for categorization'),
  metadata: z.record(z.unknown()).optional().describe('Additional metadata')
});

export const RecallSchema = z.object({
  query: z.string().describe('Search query'),
  limit: z.number().optional().describe('Maximum number of results'),
  useSemanticSearch: z.boolean().optional().describe('Use semantic search instead of keyword search')
});

export const ListMemoriesSchema = z.object({
  type: z.enum(['conversation', 'knowledge', 'note']).optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().optional(),
  offset: z.number().optional()
});

export const SaveConversationSchema = z.object({
  title: z.string(),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
    timestamp: z.number().optional()
  })),
  metadata: z.record(z.unknown()).optional()
});

export const LoadConversationSchema = z.object({
  id: z.string().describe('Conversation ID to load')
});

export const SaveSessionSchema = z.object({
  title: z.string(),
  context: z.string(),
  files: z.array(z.string()),
  variables: z.record(z.unknown()),
  metadata: z.record(z.unknown()).optional()
});

export const RestoreSessionSchema = z.object({
  id: z.string().describe('Session ID to restore')
});

export const SearchKnowledgeSchema = z.object({
  query: z.string(),
  category: z.string().optional(),
  limit: z.number().optional()
});

// Tool implementations
export class MemoryTools {
  constructor(
    private storage: StorageManager,
    private semanticSearch: SemanticSearch
  ) {}

  async remember(args: z.infer<typeof RememberSchema>) {
    const memory = await this.storage.createMemory(
      args.type || 'note',
      args.title,
      args.content,
      args.tags || [],
      args.metadata
    );

    // Index for semantic search
    await this.semanticSearch.indexMemory(memory.id, memory.content);

    return {
      content: [
        {
          type: 'text',
          text: `Memory saved successfully!\n\nID: ${memory.id}\nTitle: ${memory.title}\nType: ${memory.type}\nTags: ${memory.tags.join(', ') || 'none'}`
        }
      ]
    };
  }

  async recall(args: z.infer<typeof RecallSchema>) {
    const limit = args.limit || 10;

    let results;

    if (args.useSemanticSearch) {
      // Semantic search using embeddings
      const memories = await this.storage.listMemories({ limit: 100 }); // Get more for semantic search
      results = await this.semanticSearch.search(args.query, memories, limit);

      const formatted = results.map((r, i) =>
        `${i + 1}. **${r.memory.title}** (Similarity: ${(r.similarity! * 100).toFixed(1)}%)\n` +
        `   Type: ${r.memory.type} | Tags: ${r.memory.tags.join(', ') || 'none'}\n` +
        `   ${r.memory.content.slice(0, 200)}${r.memory.content.length > 200 ? '...' : ''}\n` +
        `   ID: ${r.memory.id}\n`
      ).join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `Found ${results.length} memories using semantic search:\n\n${formatted || 'No results found.'}`
          }
        ]
      };
    } else {
      // Keyword search using FTS
      const searchResults = await this.storage.searchMemories(args.query, limit);

      const formatted = searchResults.map((r, i) =>
        `${i + 1}. **${r.memory.title}** (Score: ${r.score.toFixed(2)})\n` +
        `   Type: ${r.memory.type} | Tags: ${r.memory.tags.join(', ') || 'none'}\n` +
        `   ${r.memory.content.slice(0, 200)}${r.memory.content.length > 200 ? '...' : ''}\n` +
        `   ID: ${r.memory.id}\n`
      ).join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `Found ${searchResults.length} memories:\n\n${formatted || 'No results found.'}`
          }
        ]
      };
    }
  }

  async listMemories(args: z.infer<typeof ListMemoriesSchema>) {
    const memories = await this.storage.listMemories(args);

    const formatted = memories.map((m, i) =>
      `${i + 1}. **${m.title}**\n` +
      `   Type: ${m.type} | Tags: ${m.tags.join(', ') || 'none'}\n` +
      `   Created: ${new Date(m.createdAt).toLocaleString()}\n` +
      `   ID: ${m.id}\n`
    ).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `Total memories: ${memories.length}\n\n${formatted || 'No memories found.'}`
        }
      ]
    };
  }

  async saveConversation(args: z.infer<typeof SaveConversationSchema>) {
    // Add timestamps if missing
    const messages = args.messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp || Date.now()
    }));

    const conversation = await this.storage.saveConversation(
      args.title,
      messages,
      args.metadata
    );

    return {
      content: [
        {
          type: 'text',
          text: `Conversation saved successfully!\n\nID: ${conversation.id}\nTitle: ${conversation.title}\nMessages: ${conversation.messages.length}`
        }
      ]
    };
  }

  async loadConversation(args: z.infer<typeof LoadConversationSchema>) {
    const conversation = await this.storage.loadConversation(args.id);

    if (!conversation) {
      return {
        content: [
          {
            type: 'text',
            text: `Conversation ${args.id} not found.`
          }
        ],
        isError: true
      };
    }

    const formatted = conversation.messages.map(msg =>
      `**${msg.role.toUpperCase()}** (${new Date(msg.timestamp).toLocaleString()}):\n${msg.content}\n`
    ).join('\n---\n\n');

    return {
      content: [
        {
          type: 'text',
          text: `# ${conversation.title}\n\n${formatted}`
        }
      ]
    };
  }

  async saveSession(args: z.infer<typeof SaveSessionSchema>) {
    const session = await this.storage.saveSession(
      args.title,
      args.context,
      args.files,
      args.variables,
      args.metadata
    );

    return {
      content: [
        {
          type: 'text',
          text: `Session saved successfully!\n\nID: ${session.id}\nTitle: ${session.title}\nFiles: ${session.files.length}`
        }
      ]
    };
  }

  async restoreSession(args: z.infer<typeof RestoreSessionSchema>) {
    const session = await this.storage.loadSession(args.id);

    if (!session) {
      return {
        content: [
          {
            type: 'text',
            text: `Session ${args.id} not found.`
          }
        ],
        isError: true
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `# Session: ${session.title}\n\n` +
            `**Context:**\n${session.context}\n\n` +
            `**Files:**\n${session.files.map(f => `- ${f}`).join('\n')}\n\n` +
            `**Variables:**\n\`\`\`json\n${JSON.stringify(session.variables, null, 2)}\n\`\`\``
        }
      ]
    };
  }

  async searchKnowledge(args: z.infer<typeof SearchKnowledgeSchema>) {
    const memories = await this.storage.listMemories({
      type: 'knowledge',
      limit: 100
    });

    // Filter by category if provided
    const filtered = args.category
      ? memories.filter(m => m.metadata?.category === args.category)
      : memories;

    // Semantic search
    const results = await this.semanticSearch.search(args.query, filtered, args.limit || 10);

    const formatted = results.map((r, i) =>
      `${i + 1}. **${r.memory.title}** (Similarity: ${(r.similarity! * 100).toFixed(1)}%)\n` +
      `   ${r.memory.content.slice(0, 300)}${r.memory.content.length > 300 ? '...' : ''}\n` +
      `   ID: ${r.memory.id}\n`
    ).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `Found ${results.length} knowledge entries:\n\n${formatted || 'No results found.'}`
        }
      ]
    };
  }

  async getStats() {
    const stats = await this.storage.getStats();
    const indexStats = this.semanticSearch.getIndexStats();

    return {
      content: [
        {
          type: 'text',
          text: `# Memory Statistics\n\n` +
            `**Storage:**\n` +
            `- Total memories: ${stats.totalMemories}\n` +
            `- Conversations: ${stats.totalConversations}\n` +
            `- Knowledge entries: ${stats.totalKnowledge}\n` +
            `- Sessions: ${stats.totalSessions}\n` +
            `- Database size: ${stats.dbSizeMB.toFixed(2)} MB\n\n` +
            `**Search Index:**\n` +
            `- Total embeddings: ${indexStats.totalEmbeddings}\n` +
            `- Model: ${indexStats.model}\n` +
            `- Dimensions: ${indexStats.dimensions}`
        }
      ]
    };
  }
}
