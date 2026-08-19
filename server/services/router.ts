import { GoogleGenAI } from "@google/genai";
import { GeminiProvider } from "../providers/gemini.ts";
import { LocalAIProvider } from "../providers/localai.ts";
import { OpenAIProvider } from "../providers/openai.ts";
import {
  AICategory,
  AIProviderInfo,
  GenerationRequest,
  GenerationResult,
  ProviderAdapter,
} from "../providers/types.ts";
import { storageService } from "./storage.ts";

export class AIRouterService {
  private providers: Map<string, ProviderAdapter> = new Map();
  private defaultProviderId = "gemini";

  constructor() {
    this.registerProvider(new GeminiProvider());
    this.registerProvider(new LocalAIProvider());
    this.registerProvider(new OpenAIProvider());
  }

  registerProvider(provider: ProviderAdapter) {
    this.providers.set(provider.id, provider);
  }

  getProviders(): AIProviderInfo[] {
    return Array.from(this.providers.values()).map((p) => p.getInfo());
  }

  /**
   * Fast rule-based + heuristic intent classifier
   */
  classifyIntent(prompt: string): {
    category: AICategory;
    confidence: number;
    reason: string;
    suggestedModel: string;
  } {
    const p = prompt.toLowerCase().trim();

    // Image triggers
    const imagePatterns = [
      /\b(draw|paint|sketch|illustrate|render|photograph|photo of|picture of|image of|artwork of|portrait of|digital art|wallpaper|concept art|vector art|cyberpunk.*city|oil painting|3d render|logo design|watercolor)\b/i,
      /\b(generate (an? )?(image|picture|photo|illustration|art|graphic|drawing|painting))\b/i,
      /\b(visualize|visual of|scenery of|landscape of)\b/i,
    ];

    for (const pat of imagePatterns) {
      if (pat.test(p)) {
        return {
          category: "image",
          confidence: 0.95,
          reason: "Detected image generation and visual synthesis keywords.",
          suggestedModel: "gemini-3.1-flash-lite-image",
        };
      }
    }

    // Audio triggers
    const audioPatterns = [
      /\b(speak|say|voiceover|read out loud|narrate|speech|audio|tts|podcast intro|pronounce|vocalize|sound like)\b/i,
      /\b(text to speech|generate (an? )?audio|voice message|audiobook)\b/i,
    ];

    for (const pat of audioPatterns) {
      if (pat.test(p)) {
        return {
          category: "audio",
          confidence: 0.92,
          reason: "Detected speech synthesis and audio narration directives.",
          suggestedModel: "gemini-3.1-flash-tts-preview",
        };
      }
    }

    // Video triggers
    const videoPatterns = [
      /\b(video of|animate|animation|cinematic video|camera pan|dolly zoom|storyboard|short film|movie scene|video clip|b-roll|timelapse of)\b/i,
      /\b(generate (a )?video|create (a )?video|veo|video prompt)\b/i,
    ];

    for (const pat of videoPatterns) {
      if (pat.test(p)) {
        return {
          category: "video",
          confidence: 0.9,
          reason: "Detected cinematic motion and video directing patterns.",
          suggestedModel: "gemini-3.7-flash-video",
        };
      }
    }

    // Code triggers
    const codePatterns = [
      /\b(write code|function|react component|html|css|javascript|typescript|python|rust|golang|c\+\+|sql query|api endpoint|regex|algorithm|refactor|debug|fix bug|unit test|dockerfile|tailwind|jsx|tsx|bash script|cron job)\b/i,
      /\b(create a component|build a function|implement an? (api|algorithm|class|service))\b/i,
      /(\bconst\s+\w+\s*=|def\s+\w+\s*\(|function\s+\w+\s*\(|<\/?\w+>|import\s+.*\s+from)/,
    ];

    for (const pat of codePatterns) {
      if (pat.test(p)) {
        return {
          category: "code",
          confidence: 0.94,
          reason: "Detected programming syntax, software requirements, or code structure requests.",
          suggestedModel: "gemini-3.7-flash-code",
        };
      }
    }

    // Default to Text
    return {
      category: "text",
      confidence: 0.85,
      reason: "General reasoning, analysis, explanation, or creative writing.",
      suggestedModel: "gemini-3.7-flash",
    };
  }

  /**
   * Intelligently optimizes the prompt for the target modality
   */
  optimizePrompt(prompt: string, category: AICategory): string {
    const trimmed = prompt.trim();
    if (!trimmed) return prompt;

    switch (category) {
      case "image": {
        // If prompt is short and lacks visual descriptors, enrich it
        if (!/(photorealistic|8k|cinematic|octane|volumetric|studio lighting|digital art|masterpiece)/i.test(trimmed)) {
          return `${trimmed}, highly detailed, sharp focus, beautiful composition, rich vibrant lighting`;
        }
        return trimmed;
      }
      case "code": {
        if (!/(clean|typescript|well-commented|error handling|modular)/i.test(trimmed)) {
          return `${trimmed}\n\nPlease provide clean, modern, well-typed, production-ready code with concise comments and clear usage instructions.`;
        }
        return trimmed;
      }
      case "video": {
        if (!/(cinematic|shot|camera|lighting)/i.test(trimmed)) {
          return `Cinematic 4K scene: ${trimmed}. Dynamic lighting, fluid camera movement, atmospheric depth, high production value.`;
        }
        return trimmed;
      }
      case "audio": {
        // Clean markdown backticks or emojis that would sound weird when read aloud
        return trimmed.replace(/[`*_#>-]/g, "").replace(/\s+/g, " ").trim();
      }
      case "text":
      default:
        return trimmed;
    }
  }

  /**
   * Main routing and execution pipeline
   */
  async routeAndExecute(request: GenerationRequest): Promise<GenerationResult> {
    if (!request.prompt || !request.prompt.trim()) {
      throw new Error("Prompt is required for generation.");
    }

    // 1. Determine target category
    let targetCategory: AICategory;
    let detectedCategory: AICategory | undefined;

    if (!request.category || request.category === "auto") {
      const classification = this.classifyIntent(request.prompt);
      targetCategory = classification.category;
      detectedCategory = classification.category;
    } else {
      targetCategory = request.category;
    }

    // 2. Determine prompt optimization
    const shouldOptimize = request.options?.optimizePrompt !== false;
    const optimizedPrompt = shouldOptimize
      ? this.optimizePrompt(request.prompt, targetCategory)
      : request.prompt;

    // 3. Select Provider
    let providerId = request.providerId || this.defaultProviderId;
    let provider = this.providers.get(providerId);

    // Fallback if provider not found or not supporting category
    if (!provider || !provider.getInfo().supportedCategories.includes(targetCategory)) {
      provider = this.providers.get(this.defaultProviderId);
    }

    if (!provider) {
      throw new Error("No available AI provider found to service this category.");
    }

    // 4. Execute Generation
    const rawResult = await provider.generate(request, targetCategory, optimizedPrompt);

    // 5. Build full result object
    const result: GenerationResult = {
      ...rawResult,
      id: "gen-" + Date.now() + "-" + Math.random().toString(36).substr(2, 6),
      detectedCategory,
      timestamp: new Date().toISOString(),
      isFavorite: false,
    };

    // 6. Save to history
    storageService.addHistoryItem(result);

    return result;
  }
}

export const aiRouterService = new AIRouterService();
