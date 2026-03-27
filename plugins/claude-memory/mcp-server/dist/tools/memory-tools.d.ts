/**
 * MCP tool implementations for memory operations
 */
import { z } from 'zod';
import type { StorageManager } from '../storage/index.js';
import type { SemanticSearch } from '../embeddings/search.js';
export declare const RememberSchema: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    type: z.ZodOptional<z.ZodEnum<["conversation", "knowledge", "note"]>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    content: string;
    type?: "conversation" | "knowledge" | "note" | undefined;
    tags?: string[] | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    title: string;
    content: string;
    type?: "conversation" | "knowledge" | "note" | undefined;
    tags?: string[] | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
export declare const RecallSchema: z.ZodObject<{
    query: z.ZodString;
    limit: z.ZodOptional<z.ZodNumber>;
    useSemanticSearch: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    query: string;
    limit?: number | undefined;
    useSemanticSearch?: boolean | undefined;
}, {
    query: string;
    limit?: number | undefined;
    useSemanticSearch?: boolean | undefined;
}>;
export declare const ListMemoriesSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<["conversation", "knowledge", "note"]>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type?: "conversation" | "knowledge" | "note" | undefined;
    tags?: string[] | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}, {
    type?: "conversation" | "knowledge" | "note" | undefined;
    tags?: string[] | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export declare const SaveConversationSchema: z.ZodObject<{
    title: z.ZodString;
    messages: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<["user", "assistant", "system"]>;
        content: z.ZodString;
        timestamp: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        content: string;
        role: "user" | "assistant" | "system";
        timestamp?: number | undefined;
    }, {
        content: string;
        role: "user" | "assistant" | "system";
        timestamp?: number | undefined;
    }>, "many">;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    messages: {
        content: string;
        role: "user" | "assistant" | "system";
        timestamp?: number | undefined;
    }[];
    metadata?: Record<string, unknown> | undefined;
}, {
    title: string;
    messages: {
        content: string;
        role: "user" | "assistant" | "system";
        timestamp?: number | undefined;
    }[];
    metadata?: Record<string, unknown> | undefined;
}>;
export declare const LoadConversationSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const SaveSessionSchema: z.ZodObject<{
    title: z.ZodString;
    context: z.ZodString;
    files: z.ZodArray<z.ZodString, "many">;
    variables: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    context: string;
    files: string[];
    variables: Record<string, unknown>;
    metadata?: Record<string, unknown> | undefined;
}, {
    title: string;
    context: string;
    files: string[];
    variables: Record<string, unknown>;
    metadata?: Record<string, unknown> | undefined;
}>;
export declare const RestoreSessionSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const SearchKnowledgeSchema: z.ZodObject<{
    query: z.ZodString;
    category: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    query: string;
    limit?: number | undefined;
    category?: string | undefined;
}, {
    query: string;
    limit?: number | undefined;
    category?: string | undefined;
}>;
export declare class MemoryTools {
    private storage;
    private semanticSearch;
    constructor(storage: StorageManager, semanticSearch: SemanticSearch);
    remember(args: z.infer<typeof RememberSchema>): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    recall(args: z.infer<typeof RecallSchema>): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    listMemories(args: z.infer<typeof ListMemoriesSchema>): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    saveConversation(args: z.infer<typeof SaveConversationSchema>): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    loadConversation(args: z.infer<typeof LoadConversationSchema>): Promise<{
        content: {
            type: string;
            text: string;
        }[];
        isError: boolean;
    } | {
        content: {
            type: string;
            text: string;
        }[];
        isError?: undefined;
    }>;
    saveSession(args: z.infer<typeof SaveSessionSchema>): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    restoreSession(args: z.infer<typeof RestoreSessionSchema>): Promise<{
        content: {
            type: string;
            text: string;
        }[];
        isError: boolean;
    } | {
        content: {
            type: string;
            text: string;
        }[];
        isError?: undefined;
    }>;
    searchKnowledge(args: z.infer<typeof SearchKnowledgeSchema>): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    getStats(): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
}
//# sourceMappingURL=memory-tools.d.ts.map