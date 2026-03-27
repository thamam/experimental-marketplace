/**
 * File system management for Claude Memory
 * Handles markdown files for conversations, knowledge, and sessions
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import type { Memory, Conversation, KnowledgeEntry, SessionState } from './types.js';

export class FileSystemStorage {
  private memoryDir: string;
  private conversationsDir: string;
  private knowledgeDir: string;
  private sessionsDir: string;
  private archiveDir: string;

  constructor(memoryDir: string) {
    this.memoryDir = memoryDir;
    this.conversationsDir = join(memoryDir, 'conversations');
    this.knowledgeDir = join(memoryDir, 'knowledge');
    this.sessionsDir = join(memoryDir, 'sessions');
    this.archiveDir = join(memoryDir, 'archive');

    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    [
      this.memoryDir,
      this.conversationsDir,
      this.knowledgeDir,
      this.sessionsDir,
      this.archiveDir,
      join(this.conversationsDir, 'index.json'),
      join(this.knowledgeDir, 'index.json'),
      join(this.sessionsDir, 'index.json')
    ].forEach(path => {
      const dir = path.endsWith('.json') ? dirname(path) : path;
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      // Create index files if they don't exist
      if (path.endsWith('.json') && !existsSync(path)) {
        writeFileSync(path, JSON.stringify([], null, 2));
      }
    });
  }

  // Conversation operations
  saveConversation(conversation: Conversation): { path: string; size: number } {
    const filename = `${conversation.id}.md`;
    const filepath = join(this.conversationsDir, filename);

    const markdown = this.conversationToMarkdown(conversation);
    writeFileSync(filepath, markdown, 'utf-8');

    const stats = statSync(filepath);

    return {
      path: filepath,
      size: stats.size
    };
  }

  loadConversation(id: string): Conversation | null {
    const filename = `${id}.md`;
    const filepath = join(this.conversationsDir, filename);

    if (!existsSync(filepath)) {
      return null;
    }

    const content = readFileSync(filepath, 'utf-8');
    return this.markdownToConversation(id, content);
  }

  deleteConversation(id: string): void {
    const filename = `${id}.md`;
    const filepath = join(this.conversationsDir, filename);

    if (existsSync(filepath)) {
      unlinkSync(filepath);
    }
  }

  // Knowledge operations
  saveKnowledge(entry: KnowledgeEntry): { path: string; size: number } {
    const filename = `${entry.id}.md`;
    const filepath = join(this.knowledgeDir, filename);

    const markdown = this.knowledgeToMarkdown(entry);
    writeFileSync(filepath, markdown, 'utf-8');

    const stats = statSync(filepath);

    return {
      path: filepath,
      size: stats.size
    };
  }

  loadKnowledge(id: string): KnowledgeEntry | null {
    const filename = `${id}.md`;
    const filepath = join(this.knowledgeDir, filename);

    if (!existsSync(filepath)) {
      return null;
    }

    const content = readFileSync(filepath, 'utf-8');
    return this.markdownToKnowledge(id, content);
  }

  deleteKnowledge(id: string): void {
    const filename = `${id}.md`;
    const filepath = join(this.knowledgeDir, filename);

    if (existsSync(filepath)) {
      unlinkSync(filepath);
    }
  }

  // Session operations
  saveSession(session: SessionState): { path: string; size: number } {
    const filename = `${session.id}.json`;
    const filepath = join(this.sessionsDir, filename);

    writeFileSync(filepath, JSON.stringify(session, null, 2), 'utf-8');

    const stats = statSync(filepath);

    return {
      path: filepath,
      size: stats.size
    };
  }

  loadSession(id: string): SessionState | null {
    const filename = `${id}.json`;
    const filepath = join(this.sessionsDir, filename);

    if (!existsSync(filepath)) {
      return null;
    }

    const content = readFileSync(filepath, 'utf-8');
    return JSON.parse(content);
  }

  deleteSession(id: string): void {
    const filename = `${id}.json`;
    const filepath = join(this.sessionsDir, filename);

    if (existsSync(filepath)) {
      unlinkSync(filepath);
    }
  }

  // Memory operations (generic)
  saveMemory(memory: Memory): { path: string; size: number } {
    let dir: string;
    switch (memory.type) {
      case 'conversation':
        dir = this.conversationsDir;
        break;
      case 'knowledge':
        dir = this.knowledgeDir;
        break;
      case 'note':
        dir = this.knowledgeDir; // Notes go to knowledge dir
        break;
      default:
        throw new Error(`Unknown memory type: ${memory.type}`);
    }

    const filename = `${memory.id}.md`;
    const filepath = join(dir, filename);

    const markdown = this.memoryToMarkdown(memory);
    writeFileSync(filepath, markdown, 'utf-8');

    const stats = statSync(filepath);

    return {
      path: filepath,
      size: stats.size
    };
  }

  loadMemory(id: string, type: Memory['type']): Memory | null {
    let dir: string;
    switch (type) {
      case 'conversation':
        dir = this.conversationsDir;
        break;
      case 'knowledge':
      case 'note':
        dir = this.knowledgeDir;
        break;
      default:
        throw new Error(`Unknown memory type: ${type}`);
    }

    const filename = `${id}.md`;
    const filepath = join(dir, filename);

    if (!existsSync(filepath)) {
      return null;
    }

    const content = readFileSync(filepath, 'utf-8');
    return this.markdownToMemory(id, type, content);
  }

  // Archive operations
  archiveMemory(id: string, type: Memory['type']): void {
    let sourceDir: string;
    switch (type) {
      case 'conversation':
        sourceDir = this.conversationsDir;
        break;
      case 'knowledge':
      case 'note':
        sourceDir = this.knowledgeDir;
        break;
      default:
        return;
    }

    const filename = `${id}.md`;
    const sourcePath = join(sourceDir, filename);
    const archivePath = join(this.archiveDir, filename);

    if (existsSync(sourcePath)) {
      const content = readFileSync(sourcePath, 'utf-8');
      writeFileSync(archivePath, content, 'utf-8');
      unlinkSync(sourcePath);
    }
  }

  // Markdown conversion utilities
  private conversationToMarkdown(conversation: Conversation): string {
    let md = `# ${conversation.title}\n\n`;
    md += `**Created:** ${new Date(conversation.createdAt).toISOString()}\n`;
    md += `**Updated:** ${new Date(conversation.updatedAt).toISOString()}\n\n`;

    if (conversation.metadata) {
      md += `**Metadata:**\n\`\`\`json\n${JSON.stringify(conversation.metadata, null, 2)}\n\`\`\`\n\n`;
    }

    md += `---\n\n`;

    for (const msg of conversation.messages) {
      md += `## ${msg.role.toUpperCase()}\n\n`;
      md += `${msg.content}\n\n`;
      md += `*${new Date(msg.timestamp).toISOString()}*\n\n`;
      md += `---\n\n`;
    }

    return md;
  }

  private markdownToConversation(id: string, markdown: string): Conversation {
    const lines = markdown.split('\n');
    const title = lines[0]?.replace(/^#\s*/, '') || 'Untitled';

    let createdAt = Date.now();
    let updatedAt = Date.now();
    let metadata: Record<string, unknown> | undefined;
    const messages: Conversation['messages'] = [];

    let currentRole: 'user' | 'assistant' | 'system' | null = null;
    let currentContent = '';
    let currentTimestamp = Date.now();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      if (line.startsWith('**Created:**')) {
        createdAt = new Date(line.replace('**Created:**', '').trim()).getTime();
      } else if (line.startsWith('**Updated:**')) {
        updatedAt = new Date(line.replace('**Updated:**', '').trim()).getTime();
      } else if (line.startsWith('## USER')) {
        if (currentRole) {
          messages.push({ role: currentRole, content: currentContent.trim(), timestamp: currentTimestamp });
        }
        currentRole = 'user';
        currentContent = '';
      } else if (line.startsWith('## ASSISTANT')) {
        if (currentRole) {
          messages.push({ role: currentRole, content: currentContent.trim(), timestamp: currentTimestamp });
        }
        currentRole = 'assistant';
        currentContent = '';
      } else if (line.startsWith('## SYSTEM')) {
        if (currentRole) {
          messages.push({ role: currentRole, content: currentContent.trim(), timestamp: currentTimestamp });
        }
        currentRole = 'system';
        currentContent = '';
      } else if (line.startsWith('*') && line.endsWith('*') && currentRole) {
        const timestamp = line.replace(/\*/g, '').trim();
        currentTimestamp = new Date(timestamp).getTime();
      } else if (currentRole && !line.startsWith('---')) {
        currentContent += line + '\n';
      }
    }

    if (currentRole) {
      messages.push({ role: currentRole, content: currentContent.trim(), timestamp: currentTimestamp });
    }

    return {
      id,
      title,
      messages,
      createdAt,
      updatedAt,
      metadata
    };
  }

  private knowledgeToMarkdown(entry: KnowledgeEntry): string {
    let md = `# ${entry.title}\n\n`;

    if (entry.category) {
      md += `**Category:** ${entry.category}\n`;
    }

    if (entry.tags.length > 0) {
      md += `**Tags:** ${entry.tags.join(', ')}\n`;
    }

    md += `**Created:** ${new Date(entry.createdAt).toISOString()}\n`;
    md += `**Updated:** ${new Date(entry.updatedAt).toISOString()}\n`;

    if (entry.sourceConversationId) {
      md += `**Source:** Conversation ${entry.sourceConversationId}\n`;
    }

    md += `\n---\n\n`;
    md += entry.content;

    if (entry.metadata) {
      md += `\n\n---\n\n**Metadata:**\n\`\`\`json\n${JSON.stringify(entry.metadata, null, 2)}\n\`\`\`\n`;
    }

    return md;
  }

  private markdownToKnowledge(id: string, markdown: string): KnowledgeEntry {
    const lines = markdown.split('\n');
    const title = lines[0]?.replace(/^#\s*/, '') || 'Untitled';

    let category: string | undefined;
    let tags: string[] = [];
    let createdAt = Date.now();
    let updatedAt = Date.now();
    let sourceConversationId: string | undefined;
    let contentStartIndex = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      if (line.startsWith('**Category:**')) {
        category = line.replace('**Category:**', '').trim();
      } else if (line.startsWith('**Tags:**')) {
        tags = line.replace('**Tags:**', '').trim().split(',').map(t => t.trim());
      } else if (line.startsWith('**Created:**')) {
        createdAt = new Date(line.replace('**Created:**', '').trim()).getTime();
      } else if (line.startsWith('**Updated:**')) {
        updatedAt = new Date(line.replace('**Updated:**', '').trim()).getTime();
      } else if (line.startsWith('**Source:**')) {
        sourceConversationId = line.replace('**Source:** Conversation', '').trim();
      } else if (line === '---') {
        contentStartIndex = i + 1;
        break;
      }
    }

    const content = lines.slice(contentStartIndex).join('\n').trim();

    return {
      id,
      title,
      content,
      category,
      tags,
      createdAt,
      updatedAt,
      sourceConversationId
    };
  }

  private memoryToMarkdown(memory: Memory): string {
    let md = `# ${memory.title}\n\n`;

    if (memory.tags.length > 0) {
      md += `**Tags:** ${memory.tags.join(', ')}\n`;
    }

    md += `**Type:** ${memory.type}\n`;
    md += `**Created:** ${new Date(memory.createdAt).toISOString()}\n`;
    md += `**Updated:** ${new Date(memory.updatedAt).toISOString()}\n`;

    md += `\n---\n\n`;
    md += memory.content;

    if (memory.metadata) {
      md += `\n\n---\n\n**Metadata:**\n\`\`\`json\n${JSON.stringify(memory.metadata, null, 2)}\n\`\`\`\n`;
    }

    return md;
  }

  private markdownToMemory(id: string, type: Memory['type'], markdown: string): Memory {
    const lines = markdown.split('\n');
    const title = lines[0]?.replace(/^#\s*/, '') || 'Untitled';

    let tags: string[] = [];
    let createdAt = Date.now();
    let updatedAt = Date.now();
    let contentStartIndex = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      if (line.startsWith('**Tags:**')) {
        tags = line.replace('**Tags:**', '').trim().split(',').map(t => t.trim());
      } else if (line.startsWith('**Created:**')) {
        createdAt = new Date(line.replace('**Created:**', '').trim()).getTime();
      } else if (line.startsWith('**Updated:**')) {
        updatedAt = new Date(line.replace('**Updated:**', '').trim()).getTime();
      } else if (line === '---') {
        contentStartIndex = i + 1;
        break;
      }
    }

    const content = lines.slice(contentStartIndex).join('\n').trim();

    return {
      id,
      type,
      title,
      content,
      tags,
      createdAt,
      updatedAt
    };
  }

  // Get file size
  getFileSize(id: string, type: Memory['type']): number {
    const memory = this.loadMemory(id, type);
    if (!memory) return 0;

    let dir: string;
    switch (type) {
      case 'conversation':
        dir = this.conversationsDir;
        break;
      case 'knowledge':
      case 'note':
        dir = this.knowledgeDir;
        break;
      default:
        return 0;
    }

    const filepath = join(dir, `${id}.md`);
    if (!existsSync(filepath)) return 0;

    const stats = statSync(filepath);
    return stats.size;
  }
}
