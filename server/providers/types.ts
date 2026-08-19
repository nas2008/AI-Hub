export type AICategory = 'text' | 'code' | 'image' | 'audio' | 'video';

export interface ProviderModelInfo {
  id: string;
  name: string;
  category: AICategory;
  description: string;
  isFreeTier: boolean;
  maxTokens?: number;
  badge?: string;
}

export interface AIProviderInfo {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'configured' | 'mock' | 'offline';
  supportedCategories: AICategory[];
  models: ProviderModelInfo[];
  isDefault: boolean;
  freeTierNote?: string;
}

export interface GenerationRequest {
  prompt: string;
  category?: AICategory | 'auto';
  providerId?: string;
  modelId?: string;
  options?: {
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
    voice?: string;
    style?: string;
    language?: string;
    temperature?: number;
    optimizePrompt?: boolean;
  };
}

export interface GenerationResult {
  id: string;
  category: AICategory;
  detectedCategory?: AICategory;
  originalPrompt: string;
  optimizedPrompt: string;
  providerId: string;
  providerName: string;
  modelId: string;
  outputType: 'markdown' | 'code' | 'image' | 'audio' | 'video_storyboard';
  content: string; // Markdown text, code, or base64 data URL
  codeLanguage?: string;
  audioMimeType?: string;
  imageDimensions?: { width: number; height: number; aspectRatio: string };
  metadata?: Record<string, any>;
  executionTimeMs: number;
  timestamp: string;
  isFavorite?: boolean;
}

export interface HistoryItem extends GenerationResult {
  tags?: string[];
}

export interface SavedPrompt {
  id: string;
  title: string;
  prompt: string;
  category: AICategory;
  tags: string[];
  isCustom?: boolean;
  description?: string;
  createdAt: string;
}

export interface ProviderAdapter {
  id: string;
  name: string;
  getInfo(): AIProviderInfo;
  isAvailable(): Promise<boolean>;
  generate(request: GenerationRequest, targetCategory: AICategory, optimizedPrompt: string): Promise<Omit<GenerationResult, 'id' | 'timestamp' | 'isFavorite'>>;
}
