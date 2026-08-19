import { GoogleGenAI, Modality } from "@google/genai";
import { AICategory, AIProviderInfo, GenerationRequest, GenerationResult, ProviderAdapter } from "./types.ts";

export class GeminiProvider implements ProviderAdapter {
  id = "gemini";
  name = "Google Gemini";

  private getClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please ensure it is present in your environment secrets.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  getInfo(): AIProviderInfo {
    return {
      id: this.id,
      name: this.name,
      description: "Google's state-of-the-art multimodal AI model family with free tier access.",
      status: process.env.GEMINI_API_KEY ? "connected" : "configured",
      isDefault: true,
      supportedCategories: ["text", "code", "image", "audio", "video"],
      freeTierNote: "Free rate-limited tier available via Google AI Studio API.",
      models: [
        {
          id: "gemini-3.7-flash",
          name: "Gemini 3.7 Flash",
          category: "text",
          description: "Ultra-fast text, reasoning, analysis and creative writing.",
          isFreeTier: true,
          badge: "Fast & Smart",
        },
        {
          id: "gemini-3.7-flash-code",
          name: "Gemini 3.7 Flash (Code)",
          category: "code",
          description: "High precision coding, debugging, refactoring, and explanations.",
          isFreeTier: true,
          badge: "Full-Stack Ready",
        },
        {
          id: "gemini-3.1-flash-lite-image",
          name: "Gemini Flash Lite Image",
          category: "image",
          description: "Direct high-fidelity image generation and artistic visual synthesis.",
          isFreeTier: true,
          badge: "Image Gen",
        },
        {
          id: "gemini-3.1-flash-tts-preview",
          name: "Gemini Voice TTS",
          category: "audio",
          description: "Natural text-to-speech audio synthesis with expressive voices.",
          isFreeTier: true,
          badge: "Neural Speech",
        },
        {
          id: "gemini-3.7-flash-video",
          name: "Gemini Video Director",
          category: "video",
          description: "Cinematic storyboard breakdown, scene timing, and video prompt orchestration.",
          isFreeTier: true,
          badge: "Video AI",
        },
      ],
    };
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  async generate(
    request: GenerationRequest,
    targetCategory: AICategory,
    optimizedPrompt: string
  ): Promise<Omit<GenerationResult, "id" | "timestamp" | "isFavorite">> {
    const startTime = Date.now();
    const ai = this.getClient();

    switch (targetCategory) {
      case "image": {
        return await this.generateImage(ai, request, optimizedPrompt, startTime);
      }
      case "audio": {
        return await this.generateAudio(ai, request, optimizedPrompt, startTime);
      }
      case "code": {
        return await this.generateCode(ai, request, optimizedPrompt, startTime);
      }
      case "video": {
        return await this.generateVideo(ai, request, optimizedPrompt, startTime);
      }
      case "text":
      default: {
        return await this.generateText(ai, request, optimizedPrompt, startTime);
      }
    }
  }

  private async generateText(
    ai: GoogleGenAI,
    request: GenerationRequest,
    prompt: string,
    startTime: number
  ) {
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are AI Hub's core intelligent assistant. Provide clear, comprehensive, well-structured answers using Markdown headings, bullet points, and code formatting where applicable.",
        temperature: request.options?.temperature ?? 0.7,
      },
    });

    const content = response.text || "No response generated.";
    const executionTimeMs = Date.now() - startTime;

    return {
      category: "text" as AICategory,
      originalPrompt: request.prompt,
      optimizedPrompt: prompt,
      providerId: this.id,
      providerName: this.name,
      modelId: "gemini-3.7-flash",
      outputType: "markdown" as const,
      content,
      executionTimeMs,
      metadata: {
        model: "gemini-3.7-flash",
        tokensEstimated: Math.round(content.length / 4),
      },
    };
  }

  private async generateCode(
    ai: GoogleGenAI,
    request: GenerationRequest,
    prompt: string,
    startTime: number
  ) {
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are an expert software engineer in AI Hub. Write clean, production-grade code with TypeScript/JavaScript/Python or requested language. Include brief explanations, usage examples, and wrap complete snippets in appropriate Markdown code fences (e.g. ```tsx or ```python or ```html). If writing a web component, make it self-contained.",
        temperature: request.options?.temperature ?? 0.3,
      },
    });

    const content = response.text || "// No code generated.";
    const executionTimeMs = Date.now() - startTime;

    // Detect primary language from code block
    const match = content.match(/```([a-zA-Z0-9_-]+)/);
    const codeLanguage = match ? match[1].toLowerCase() : "typescript";

    return {
      category: "code" as AICategory,
      originalPrompt: request.prompt,
      optimizedPrompt: prompt,
      providerId: this.id,
      providerName: this.name,
      modelId: "gemini-3.7-flash",
      outputType: "code" as const,
      content,
      codeLanguage,
      executionTimeMs,
      metadata: {
        model: "gemini-3.7-flash",
        detectedLanguage: codeLanguage,
      },
    };
  }

  private async generateImage(
    ai: GoogleGenAI,
    request: GenerationRequest,
    prompt: string,
    startTime: number
  ) {
    const aspectRatio = request.options?.aspectRatio || "1:1";

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          },
        },
      });

      let imageUrl = "";
      let description = "";

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const mime = part.inlineData.mimeType || "image/png";
            imageUrl = `data:${mime};base64,${part.inlineData.data}`;
          } else if (part.text) {
            description += part.text;
          }
        }
      }

      if (!imageUrl) {
        // Fallback: If image generation didn't return binary, provide formatted SVG illustration or fallback
        const svgResponse = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: `Create a beautiful, modern, high-contrast SVG graphic representing: "${prompt}". Return ONLY the raw valid <svg ...>...</svg> element, no markdown code block, no backticks, with viewBox="0 0 800 600" and attractive modern gradients, dark sleek background, and vector styling.`,
        });
        const rawSvg = svgResponse.text?.trim().replace(/^```xml\n?|^```svg\n?|^```\n?|```$/g, "").trim() || "";
        if (rawSvg.startsWith("<svg")) {
          const base64Svg = Buffer.from(rawSvg).toString("base64");
          imageUrl = `data:image/svg+xml;base64,${base64Svg}`;
        } else {
          throw new Error("Unable to synthesize image data from model.");
        }
      }

      const executionTimeMs = Date.now() - startTime;

      return {
        category: "image" as AICategory,
        originalPrompt: request.prompt,
        optimizedPrompt: prompt,
        providerId: this.id,
        providerName: this.name,
        modelId: "gemini-3.1-flash-lite-image",
        outputType: "image" as const,
        content: imageUrl,
        imageDimensions: {
          width: aspectRatio === "16:9" ? 1280 : aspectRatio === "9:16" ? 720 : 1024,
          height: aspectRatio === "16:9" ? 720 : aspectRatio === "9:16" ? 1280 : 1024,
          aspectRatio,
        },
        executionTimeMs,
        metadata: {
          aspectRatio,
          description: description || undefined,
        },
      };
    } catch (err: any) {
      // Fallback to SVG art generator if image quota or model access requires alternative
      const svgResponse = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `Create a stunning, highly detailed SVG artwork representing: "${prompt}". Return ONLY the raw valid <svg ...>...</svg> XML markup with rich vibrant colors, gradients, geometry and dark background, viewBox="0 0 800 600". No commentary.`,
      });
      const rawSvg = svgResponse.text?.trim().replace(/^```xml\n?|^```svg\n?|^```\n?|```$/g, "").trim() || "";
      const base64Svg = Buffer.from(rawSvg).toString("base64");
      const imageUrl = `data:image/svg+xml;base64,${base64Svg}`;

      const executionTimeMs = Date.now() - startTime;

      return {
        category: "image" as AICategory,
        originalPrompt: request.prompt,
        optimizedPrompt: prompt,
        providerId: this.id,
        providerName: this.name,
        modelId: "gemini-3.1-flash-lite-image",
        outputType: "image" as const,
        content: imageUrl,
        imageDimensions: { width: 800, height: 600, aspectRatio },
        executionTimeMs,
        metadata: {
          aspectRatio,
          note: "Synthesized via Vector Graphics engine.",
        },
      };
    }
  }

  private async generateAudio(
    ai: GoogleGenAI,
    request: GenerationRequest,
    prompt: string,
    startTime: number
  ) {
    const voice = request.options?.voice || "Puck"; // Puck, Charon, Kore, Fenrir, Zephyr

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error("No audio stream received from TTS model.");
      }

      // Gemini TTS returns raw PCM (24kHz 16-bit mono) or WAV container.
      // Let's create standard WAV header so browser <audio> plays it directly!
      const wavBase64 = this.pcmToWavDataUrl(base64Audio, 24000, 1, 16);

      const executionTimeMs = Date.now() - startTime;

      return {
        category: "audio" as AICategory,
        originalPrompt: request.prompt,
        optimizedPrompt: prompt,
        providerId: this.id,
        providerName: this.name,
        modelId: "gemini-3.1-flash-tts-preview",
        outputType: "audio" as const,
        content: wavBase64,
        audioMimeType: "audio/wav",
        executionTimeMs,
        metadata: {
          voice,
          sampleRate: 24000,
          transcript: prompt,
        },
      };
    } catch (err: any) {
      // Fallback voice transcript explanation
      const executionTimeMs = Date.now() - startTime;
      return {
        category: "audio" as AICategory,
        originalPrompt: request.prompt,
        optimizedPrompt: prompt,
        providerId: this.id,
        providerName: this.name,
        modelId: "gemini-3.1-flash-tts-preview",
        outputType: "markdown" as const,
        content: `### 🎙️ Speech Generation Transcript\n\n**Selected Voice:** \`${voice}\`\n\n**Spoken Script:**\n> "${prompt}"\n\n*(Note: TTS requires active Audio Modality access. Script prepared for neural synthesis)*`,
        executionTimeMs,
        metadata: { voice, fallback: true },
      };
    }
  }

  private async generateVideo(
    ai: GoogleGenAI,
    request: GenerationRequest,
    prompt: string,
    startTime: number
  ) {
    // Generate comprehensive cinematic video storyboard & camera orchestration
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `You are an expert AI Video Director. Create a comprehensive, cinematic scene storyboard, shot-by-shot composition, prompt parameters, lighting directions, camera motion, and audio design for generating video with the following prompt:
"${prompt}"

Structure your response into:
1. 🎬 **Executive Concept & Visual Style** (Lighting, Color Grading, Camera lenses)
2. 🎞️ **Shot-by-Shot Sequence** (Shot 1 to Shot 4 with timing, camera movement, subject action, transitions)
3. 📐 **Veo / Video Gen AI Optimized Prompts** (Exact prompt strings ready for video AI engines)
4. 🔊 **Sound Design & Foley Ambience**
5. ⚙️ **Recommended Render Settings** (Aspect Ratio, Frame Rate, Motion Bucket, Shutter Speed)`,
      config: {
        temperature: 0.7,
      },
    });

    const content = response.text || "No video storyboard generated.";
    const executionTimeMs = Date.now() - startTime;

    return {
      category: "video" as AICategory,
      originalPrompt: request.prompt,
      optimizedPrompt: prompt,
      providerId: this.id,
      providerName: this.name,
      modelId: "gemini-3.7-flash-video",
      outputType: "video_storyboard" as const,
      content,
      executionTimeMs,
      metadata: {
        model: "gemini-3.7-flash",
        aspectRatio: request.options?.aspectRatio || "16:9",
      },
    };
  }

  /**
   * Encodes raw PCM 16-bit buffer into a standard RIFF/WAV Base64 Data URL
   */
  private pcmToWavDataUrl(pcmBase64: string, sampleRate: number, numChannels: number, bitsPerSample: number): string {
    const pcmBuffer = Buffer.from(pcmBase64, "base64");
    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const dataSize = pcmBuffer.length;
    const headerSize = 44;
    const totalSize = headerSize + dataSize;

    const wavBuffer = Buffer.alloc(totalSize);

    // RIFF chunk descriptor
    wavBuffer.write("RIFF", 0);
    wavBuffer.writeUInt32LE(totalSize - 8, 4);
    wavBuffer.write("WAVE", 8);

    // fmt sub-chunk
    wavBuffer.write("fmt ", 12);
    wavBuffer.writeUInt32LE(16, 16); // SubChunk1Size (16 for PCM)
    wavBuffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
    wavBuffer.writeUInt16LE(numChannels, 22);
    wavBuffer.writeUInt32LE(sampleRate, 24);
    wavBuffer.writeUInt32LE(byteRate, 28);
    wavBuffer.writeUInt16LE(blockAlign, 32);
    wavBuffer.writeUInt16LE(bitsPerSample, 34);

    // data sub-chunk
    wavBuffer.write("data", 36);
    wavBuffer.writeUInt32LE(dataSize, 40);
    pcmBuffer.copy(wavBuffer, 44);

    return `data:audio/wav;base64,${wavBuffer.toString("base64")}`;
  }
}
