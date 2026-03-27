/**
 * Claude Memory MCP Server
 * Provides memory management tools via MCP protocol
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { StorageManager } from './storage/index.js';
import { SemanticSearch } from './embeddings/search.js';
import { MemoryDatabase } from './storage/database.js';
import { MemoryTools, RememberSchema, RecallSchema, ListMemoriesSchema, SaveConversationSchema, LoadConversationSchema, SaveSessionSchema, RestoreSessionSchema, SearchKnowledgeSchema } from './tools/memory-tools.js';
export class ClaudeMemoryServer {
    server;
    storage;
    semanticSearch;
    tools;
    constructor(config) {
        // Initialize storage and search
        this.storage = new StorageManager(config);
        const db = new MemoryDatabase(config.memoryDir);
        this.semanticSearch = new SemanticSearch(db, config.embeddingModel);
        this.tools = new MemoryTools(this.storage, this.semanticSearch);
        // Create MCP server
        this.server = new Server({
            name: 'claude-memory',
            version: '1.0.0'
        }, {
            capabilities: {
                tools: {}
            }
        });
        this.setupHandlers();
    }
    setupHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async (_request) => {
            return {
                tools: [
                    {
                        name: 'remember',
                        description: 'Store a memory, note, or piece of knowledge',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                title: { type: 'string', description: 'Title of the memory' },
                                content: { type: 'string', description: 'Content to remember' },
                                type: {
                                    type: 'string',
                                    enum: ['conversation', 'knowledge', 'note'],
                                    description: 'Type of memory'
                                },
                                tags: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'Tags for categorization'
                                },
                                metadata: {
                                    type: 'object',
                                    description: 'Additional metadata'
                                }
                            },
                            required: ['title', 'content']
                        }
                    },
                    {
                        name: 'recall',
                        description: 'Search and retrieve memories using keyword or semantic search',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                query: { type: 'string', description: 'Search query' },
                                limit: { type: 'number', description: 'Maximum number of results' },
                                useSemanticSearch: {
                                    type: 'boolean',
                                    description: 'Use semantic search instead of keyword search'
                                }
                            },
                            required: ['query']
                        }
                    },
                    {
                        name: 'list_memories',
                        description: 'List all memories with optional filters',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                type: {
                                    type: 'string',
                                    enum: ['conversation', 'knowledge', 'note']
                                },
                                tags: { type: 'array', items: { type: 'string' } },
                                limit: { type: 'number' },
                                offset: { type: 'number' }
                            }
                        }
                    },
                    {
                        name: 'save_conversation',
                        description: 'Save a conversation with all messages',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                title: { type: 'string' },
                                messages: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            role: { type: 'string', enum: ['user', 'assistant', 'system'] },
                                            content: { type: 'string' },
                                            timestamp: { type: 'number' }
                                        },
                                        required: ['role', 'content']
                                    }
                                },
                                metadata: { type: 'object' }
                            },
                            required: ['title', 'messages']
                        }
                    },
                    {
                        name: 'load_conversation',
                        description: 'Load a previously saved conversation',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', description: 'Conversation ID' }
                            },
                            required: ['id']
                        }
                    },
                    {
                        name: 'save_session',
                        description: 'Save current session state (context, files, variables)',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                title: { type: 'string' },
                                context: { type: 'string' },
                                files: { type: 'array', items: { type: 'string' } },
                                variables: { type: 'object' },
                                metadata: { type: 'object' }
                            },
                            required: ['title', 'context', 'files', 'variables']
                        }
                    },
                    {
                        name: 'restore_session',
                        description: 'Restore a previously saved session',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', description: 'Session ID' }
                            },
                            required: ['id']
                        }
                    },
                    {
                        name: 'search_knowledge',
                        description: 'Semantic search over knowledge base',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                query: { type: 'string' },
                                category: { type: 'string' },
                                limit: { type: 'number' }
                            },
                            required: ['query']
                        }
                    },
                    {
                        name: 'get_stats',
                        description: 'Get memory storage and search index statistics',
                        inputSchema: {
                            type: 'object',
                            properties: {}
                        }
                    }
                ]
            };
        });
        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'remember':
                        return await this.tools.remember(RememberSchema.parse(args));
                    case 'recall':
                        return await this.tools.recall(RecallSchema.parse(args));
                    case 'list_memories':
                        return await this.tools.listMemories(ListMemoriesSchema.parse(args || {}));
                    case 'save_conversation':
                        return await this.tools.saveConversation(SaveConversationSchema.parse(args));
                    case 'load_conversation':
                        return await this.tools.loadConversation(LoadConversationSchema.parse(args));
                    case 'save_session':
                        return await this.tools.saveSession(SaveSessionSchema.parse(args));
                    case 'restore_session':
                        return await this.tools.restoreSession(RestoreSessionSchema.parse(args));
                    case 'search_knowledge':
                        return await this.tools.searchKnowledge(SearchKnowledgeSchema.parse(args));
                    case 'get_stats':
                        return await this.tools.getStats();
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        });
    }
    async start() {
        // Initialize semantic search
        console.error('Initializing semantic search...');
        await this.semanticSearch.initialize();
        console.error('Semantic search initialized');
        // Connect to stdio transport
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Claude Memory MCP Server running on stdio');
    }
    async stop() {
        this.storage.close();
        await this.server.close();
    }
}
//# sourceMappingURL=server.js.map