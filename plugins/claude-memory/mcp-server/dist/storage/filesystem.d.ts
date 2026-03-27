/**
 * File system management for Claude Memory
 * Handles markdown files for conversations, knowledge, and sessions
 */
import type { Memory, Conversation, KnowledgeEntry, SessionState } from './types.js';
export declare class FileSystemStorage {
    private memoryDir;
    private conversationsDir;
    private knowledgeDir;
    private sessionsDir;
    private archiveDir;
    constructor(memoryDir: string);
    private ensureDirectories;
    saveConversation(conversation: Conversation): {
        path: string;
        size: number;
    };
    loadConversation(id: string): Conversation | null;
    deleteConversation(id: string): void;
    saveKnowledge(entry: KnowledgeEntry): {
        path: string;
        size: number;
    };
    loadKnowledge(id: string): KnowledgeEntry | null;
    deleteKnowledge(id: string): void;
    saveSession(session: SessionState): {
        path: string;
        size: number;
    };
    loadSession(id: string): SessionState | null;
    deleteSession(id: string): void;
    saveMemory(memory: Memory): {
        path: string;
        size: number;
    };
    loadMemory(id: string, type: Memory['type']): Memory | null;
    archiveMemory(id: string, type: Memory['type']): void;
    private conversationToMarkdown;
    private markdownToConversation;
    private knowledgeToMarkdown;
    private markdownToKnowledge;
    private memoryToMarkdown;
    private markdownToMemory;
    getFileSize(id: string, type: Memory['type']): number;
}
//# sourceMappingURL=filesystem.d.ts.map