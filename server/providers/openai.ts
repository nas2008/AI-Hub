import { AICategory, AIProviderInfo, GenerationRequest, GenerationResult, ProviderAdapter } from "./types.ts";

export class OpenAIProvider implements ProviderAdapter {
  id = "openai";
  name = "OpenAI / Compatible Gateway";

  getInfo(): AIProviderInfo {
    return {
      id: this.id,
      name: this.name,
      description: "Standard OpenAI API format supporting OpenAI models or any v1/chat/completions compatible endpoint.",
      status: process.env.OPENAI_API_KEY ? "connected" : "configured",
      isDefault: false,
      supportedCategories: ["text", "code", "image", "audio"],
      freeTierNote: "Requires BYOK (Bring Your Own Key) or self-hosted LiteLLM/vLLM proxy.",
      models: [
        {
          id: "gpt-4o-mini",
          name: "GPT-4o Mini",
          category: "text",
          description: "Lightweight, fast conversational model with generous tier pricing.",
          isFreeTier: false,
          badge: "OpenAI Compatible",
        },
        {
          id: "dall-e-3",
          name: "DALL-E 3",
          category: "image",
          description: "Photorealistic image rendering via OpenAI image endpoint.",
          isFreeTier: false,
          badge: "Image Gen",
        },
      ],
    };
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  async generate(
    request: GenerationRequest,
    targetCategory: AICategory,
    optimizedPrompt: string
  ): Promise<Omit<GenerationResult, "id" | "timestamp" | "isFavorite">> {
    const startTime = Date.now();
    return {
      category: targetCategory,
      originalPrompt: request.prompt,
      optimizedPrompt,
      providerId: this.id,
      providerName: this.name,
      modelId: request.modelId || "gpt-4o-mini",
      outputType: targetCategory === "code" ? "code" : targetCategory === "image" ? "image" : "markdown",
      content: `### 🤖 OpenAI Compatible Adapter\n\nPrompt received: "${optimizedPrompt}"\n\n*This endpoint provides a standard OpenAI v1/chat/completions integration adapter ready for custom proxy endpoints or configured keys.*`,
      executionTimeMs: Date.now() - startTime,
      metadata: {
        adapter: "OpenAIProvider",
      },
    };
  }
}
