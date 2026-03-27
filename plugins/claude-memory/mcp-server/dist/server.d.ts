/**
 * Claude Memory MCP Server
 * Provides memory management tools via MCP protocol
 */
import { type MemoryConfig } from './storage/index.js';
export declare class ClaudeMemoryServer {
    private server;
    private storage;
    private semanticSearch;
    private tools;
    constructor(config: MemoryConfig);
    private setupHandlers;
    start(): Promise<void>;
    stop(): Promise<void>;
}
//# sourceMappingURL=server.d.ts.map