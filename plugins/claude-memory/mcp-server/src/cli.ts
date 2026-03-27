#!/usr/bin/env node
/**
 * CLI for managing Claude Memory
 * Provides commands for listing, searching, and managing memories
 */

import { homedir } from 'os';
import { join } from 'path';
import { StorageManager, type MemoryConfig } from './storage/index.js';
import { SemanticSearch } from './embeddings/search.js';
import { MemoryDatabase } from './storage/database.js';

const config: MemoryConfig = {
  memoryDir: process.env.MEMORY_DIR || join(homedir(), '.claude-memory'),
  embeddingModel: process.env.EMBEDDING_MODEL || 'minilm-l6',
  maxMemorySize: 1000,
  autoArchiveDays: 90,
  enableAutoIndexing: true
};

const storage = new StorageManager(config);
const db = new MemoryDatabase(config.memoryDir);
const semanticSearch = new SemanticSearch(db, config.embeddingModel);

const command = process.argv[2];
const args = process.argv.slice(3);

async function main() {
  try {
    switch (command) {
      case 'list':
        await listMemories();
        break;

      case 'search':
        await searchMemories(args[0] || '');
        break;

      case 'stats':
        await showStats();
        break;

      case 'archive':
        await archiveOld(parseInt(args[0] || '90'));
        break;

      case 'help':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    storage.close();
  }
}

async function listMemories() {
  const memories = await storage.listMemories({ limit: 50 });

  console.log(`\nTotal memories: ${memories.length}\n`);

  for (const memory of memories) {
    console.log(`📝 ${memory.title}`);
    console.log(`   Type: ${memory.type} | Tags: ${memory.tags.join(', ') || 'none'}`);
    console.log(`   Created: ${new Date(memory.createdAt).toLocaleString()}`);
    console.log(`   ID: ${memory.id}`);
    console.log();
  }
}

async function searchMemories(query: string) {
  if (!query) {
    console.error('Usage: claude-memory search <query>');
    return;
  }

  console.log(`\nSearching for: "${query}"\n`);

  // Keyword search
  const keywordResults = await storage.searchMemories(query, 10);
  console.log(`Keyword results: ${keywordResults.length}`);
  for (const result of keywordResults) {
    console.log(`  - ${result.memory.title} (score: ${result.score.toFixed(2)})`);
  }

  // Semantic search
  console.log(`\nInitializing semantic search...`);
  await semanticSearch.initialize();

  const memories = await storage.listMemories({ limit: 100 });
  const semanticResults = await semanticSearch.search(query, memories, 10);

  console.log(`\nSemantic results: ${semanticResults.length}`);
  for (const result of semanticResults) {
    console.log(`  - ${result.memory.title} (similarity: ${((result.similarity || 0) * 100).toFixed(1)}%)`);
  }
}

async function showStats() {
  const stats = await storage.getStats();
  const indexStats = semanticSearch.getIndexStats();

  console.log(`\n📊 Memory Statistics\n`);
  console.log(`Storage:`);
  console.log(`  - Total memories: ${stats.totalMemories}`);
  console.log(`  - Conversations: ${stats.totalConversations}`);
  console.log(`  - Knowledge entries: ${stats.totalKnowledge}`);
  console.log(`  - Sessions: ${stats.totalSessions}`);
  console.log(`  - Database size: ${stats.dbSizeMB.toFixed(2)} MB`);
  console.log();
  console.log(`Search Index:`);
  console.log(`  - Total embeddings: ${indexStats.totalEmbeddings}`);
  console.log(`  - Model: ${indexStats.model}`);
  console.log(`  - Dimensions: ${indexStats.dimensions}`);
  console.log();
}

async function archiveOld(days: number) {
  console.log(`\nArchiving memories older than ${days} days...`);

  const count = await storage.archiveOldMemories(days);

  console.log(`✓ Archived ${count} memories`);
}

function showHelp() {
  console.log(`
Claude Memory CLI

Usage:
  claude-memory <command> [args]

Commands:
  list                 List all memories
  search <query>       Search memories (keyword + semantic)
  stats                Show memory statistics
  archive [days]       Archive memories older than N days (default: 90)
  help                 Show this help message

Environment Variables:
  MEMORY_DIR          Memory storage directory (default: ~/.claude-memory)
  EMBEDDING_MODEL     Embedding model (minilm-l6, minilm-l12, mpnet-base)

Examples:
  claude-memory list
  claude-memory search "authentication patterns"
  claude-memory stats
  claude-memory archive 180
  `);
}

main();
