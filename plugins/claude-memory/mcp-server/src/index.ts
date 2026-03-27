/**
 * Entry point for Claude Memory MCP Server
 */

import { homedir } from 'os';
import { join } from 'path';
import { ClaudeMemoryServer } from './server.js';
import type { MemoryConfig } from './storage/types.js';

// Load configuration from environment variables
const config: MemoryConfig = {
  memoryDir: process.env.MEMORY_DIR || join(homedir(), '.claude-memory'),
  embeddingModel: process.env.EMBEDDING_MODEL || 'minilm-l6',
  maxMemorySize: process.env.MAX_MEMORY_SIZE_MB ? parseInt(process.env.MAX_MEMORY_SIZE_MB) : 1000,
  autoArchiveDays: process.env.AUTO_ARCHIVE_DAYS ? parseInt(process.env.AUTO_ARCHIVE_DAYS) : 90,
  enableAutoIndexing: process.env.ENABLE_AUTO_INDEXING !== 'false'
};

// Create and start server
const server = new ClaudeMemoryServer(config);

// Handle shutdown
process.on('SIGINT', async () => {
  console.error('\nShutting down Claude Memory MCP Server...');
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('\nShutting down Claude Memory MCP Server...');
  await server.stop();
  process.exit(0);
});

// Start server
server.start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
