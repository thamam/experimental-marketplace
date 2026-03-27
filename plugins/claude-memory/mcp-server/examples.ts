/**
 * Example script to create sample memories
 * Run with: tsx examples.ts
 */

import { homedir } from 'os';
import { join } from 'path';
import { StorageManager, type MemoryConfig } from './src/storage/index.js';
import { SemanticSearch } from './src/embeddings/search.js';
import { MemoryDatabase } from './src/storage/database.js';

const config: MemoryConfig = {
  memoryDir: join(homedir(), '.claude-memory'),
  embeddingModel: 'minilm-l6',
  maxMemorySize: 1000,
  autoArchiveDays: 90,
  enableAutoIndexing: true
};

async function createExamples() {
  console.log('Creating example memories...\n');

  const storage = new StorageManager(config);
  const db = new MemoryDatabase(config.memoryDir);
  const semanticSearch = new SemanticSearch(db, config.embeddingModel);

  // Initialize semantic search
  console.log('Initializing semantic search (downloading model if needed)...');
  await semanticSearch.initialize();
  console.log('✓ Semantic search ready\n');

  // Example 1: Code preferences
  const mem1 = await storage.createMemory(
    'knowledge',
    'TypeScript Preferences',
    `Always use explicit return types for functions. Prefer const over let when possible.
Use named exports instead of default exports for better IDE support.
Configure strict mode in tsconfig.json.`,
    ['typescript', 'coding-style', 'preferences']
  );
  await semanticSearch.indexMemory(mem1.id, mem1.content);
  console.log(`✓ Created: ${mem1.title}`);

  // Example 2: Project setup
  const mem2 = await storage.createMemory(
    'knowledge',
    'Project Package Manager',
    `This project uses pnpm for package management. Always use pnpm install, pnpm add, etc.
The reason is better disk space efficiency and faster installs.`,
    ['project', 'tools', 'package-manager']
  );
  await semanticSearch.indexMemory(mem2.id, mem2.content);
  console.log(`✓ Created: ${mem2.title}`);

  // Example 3: API patterns
  const mem3 = await storage.createMemory(
    'knowledge',
    'Error Handling Patterns',
    `For API errors, always use custom error classes extending Error.
Include error codes, HTTP status, and context data.
Example:
class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}`,
    ['error-handling', 'typescript', 'patterns']
  );
  await semanticSearch.indexMemory(mem3.id, mem3.content);
  console.log(`✓ Created: ${mem3.title}`);

  // Example 4: Database decisions
  const mem4 = await storage.createMemory(
    'knowledge',
    'Database Architecture',
    `Using PostgreSQL with Prisma ORM for the main application database.
Chose Prisma for:
- Type-safe queries
- Automatic migrations
- Excellent TypeScript support
Connection pooling configured for 20 max connections.`,
    ['database', 'architecture', 'prisma']
  );
  await semanticSearch.indexMemory(mem4.id, mem4.content);
  console.log(`✓ Created: ${mem4.title}`);

  // Example 5: Authentication
  const mem5 = await storage.createMemory(
    'knowledge',
    'Authentication Strategy',
    `Using JWT tokens with httpOnly cookies for web app.
Access token: 15 minutes expiry
Refresh token: 7 days expiry
Token rotation on refresh for security.
Stored in Redis for fast lookup and revocation.`,
    ['authentication', 'security', 'jwt']
  );
  await semanticSearch.indexMemory(mem5.id, mem5.content);
  console.log(`✓ Created: ${mem5.title}`);

  // Example 6: Save a conversation
  const conversation = await storage.saveConversation(
    'React Hooks Discussion',
    [
      {
        role: 'user',
        content: 'What are the best practices for using React hooks?',
        timestamp: Date.now() - 60000
      },
      {
        role: 'assistant',
        content: `Best practices for React hooks:
1. Only call hooks at the top level (not in loops/conditions)
2. Use useCallback for stable function references
3. Use useMemo for expensive computations
4. Extract custom hooks for reusable logic
5. Keep effects focused and specific`,
        timestamp: Date.now() - 30000
      },
      {
        role: 'user',
        content: 'How should I handle async operations in useEffect?',
        timestamp: Date.now() - 15000
      },
      {
        role: 'assistant',
        content: `For async operations in useEffect:
1. Create an async function inside the effect
2. Call it immediately
3. Handle cleanup properly
4. Consider using AbortController for cancellation

Example:
useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await api.get('/endpoint');
      setData(data);
    } catch (error) {
      setError(error);
    }
  };
  fetchData();
}, []);`,
        timestamp: Date.now()
      }
    ]
  );
  console.log(`✓ Created conversation: ${conversation.title}`);

  // Example 7: Save a session
  const session = await storage.saveSession(
    'Working on Auth Module',
    'Implementing JWT authentication with refresh token rotation. Currently debugging token expiry logic.',
    [
      'src/auth/jwt.ts',
      'src/auth/middleware.ts',
      'src/auth/refresh.ts',
      'tests/auth.test.ts'
    ],
    {
      currentFeature: 'refresh-token-rotation',
      blockers: ['Need to test token expiry edge cases'],
      nextSteps: ['Add integration tests', 'Deploy to staging']
    }
  );
  console.log(`✓ Created session: ${session.title}`);

  // Show statistics
  console.log('\n📊 Statistics:');
  const stats = await storage.getStats();
  console.log(`  Memories: ${stats.totalMemories}`);
  console.log(`  Conversations: ${stats.totalConversations}`);
  console.log(`  Sessions: ${stats.totalSessions}`);
  console.log(`  Storage: ${stats.dbSizeMB.toFixed(2)} MB`);

  const indexStats = semanticSearch.getIndexStats();
  console.log(`\n🔍 Search Index:`);
  console.log(`  Embeddings: ${indexStats.totalEmbeddings}`);
  console.log(`  Model: ${indexStats.model}`);

  // Test search
  console.log('\n🔎 Testing semantic search for "how to handle errors"...');
  const memories = await storage.listMemories({});
  const results = await semanticSearch.search('how to handle errors', memories, 3);

  console.log(`\nTop ${results.length} results:`);
  for (const result of results) {
    console.log(`  ${(result.similarity! * 100).toFixed(1)}% - ${result.memory.title}`);
  }

  storage.close();
  console.log('\n✅ Examples created successfully!');
  console.log(`\nMemories stored in: ${config.memoryDir}`);
}

createExamples().catch(console.error);
