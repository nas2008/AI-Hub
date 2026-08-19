import React, { useState, useEffect, useRef } from "react";
import { AICategory, GenerationOptions, IntentClassification } from "../types.ts";

interface PromptComposerProps {
  prompt: string;
  setPrompt: (p: string) => void;
  category: AICategory | "auto";
  setCategory: (c: AICategory | "auto") => void;
  onGenerate: () => void;
  isLoading: boolean;
  options: GenerationOptions;
  setOptions: React.Dispatch<React.SetStateAction<GenerationOptions>>;
  onOptimizePrompt: () => void;
  isOptimizing: boolean;
}

export const PromptComposer: React.FC<PromptComposerProps> = ({
  prompt,
  setPrompt,
  category,
  setCategory,
  onGenerate,
  isLoading,
  options,
  setOptions,
  onOptimizePrompt,
  isOptimizing,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [detectedIntent, setDetectedIntent] = useState<IntentClassification | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Quick category items matching the design
  const categories: { id: AICategory | "auto"; label: string; icon?: string }[] = [
    { id: "auto", label: "Auto Detect" },
    { id: "image", label: "Image" },
    { id: "code", label: "Code" },
    { id: "text", label: "Text" },
    { id: "audio", label: "Audio / Voice" },
    { id: "video", label: "Video" },
  ];

  // Quick prompt inspirations by category
  const promptStarters: Record<string, string[]> = {
    auto: [
      "Create a futuristic cyberpunk city at night with neon reflections",
      "Write a TypeScript API router service with rate limiting",
      "Explain quantum computing principles with a clear analogy",
      "Say in an enthusiastic voice: Welcome to AI Hub's neural center",
    ],
    image: [
      "Cyberpunk street market in the rain, neon reflections, 8k ultra-detailed",
      "Minimalist vector logo for an autonomous AI research lab",
      "Cozy coffee shop interior with soft sunlight and lush plants, oil painting",
    ],
    code: [
      "Create a Python script for a modular API routing layer",
      "Write an accessible React modal dialog component with Tailwind and ARIA",
      "Implement a fast debounce and throttle utility in TypeScript",
    ],
    text: [
      "Write a compelling product launch briefing for an AI Hub app",
      "Summarize the key differences between transformer architectures and RNNs",
      "Draft a professional email proposing a tech architecture upgrade",
    ],
    audio: [
      "Welcome to AI Hub. Your centralized gateway to intelligent multimodal computing.",
      "Attention passengers, the cosmic shuttle to Orbital Station 9 is now boarding.",
    ],
    video: [
      "Cinematic drone shot soaring over mist-shrouded mountain peaks at golden hour",
      "Futuristic starship entering a swirling nebula portal with lens flare",
    ],
  };

  // Real-time intent detection preview when typing in auto mode
  useEffect(() => {
    if (!prompt.trim()) {
      setDetectedIntent(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/router/classify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.classification) {
            setDetectedIntent(data.classification);
          }
        }
      } catch (err) {
        // silent heuristic
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [prompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (prompt.trim() && !isLoading) {
        onGenerate();
      }
    }
  };

  const activeStarters = promptStarters[category] || promptStarters.auto;

  return (
    <div className="w-full space-y-4" id="prompt-composer-container">
      {/* Main Composer Box */}
      <div className="bg-[#161618] border border-slate-800 rounded-2xl p-1 shadow-2xl transition-all focus-within:border-slate-700">
        <div className="p-6 relative">
          <textarea
            ref={textareaRef}
            id="main-prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-xl text-slate-100 placeholder-slate-600 resize-none outline-none min-h-[130px] font-sans leading-relaxed"
            placeholder="Describe what you want to create or calculate..."
          />

          {/* Quick Clear Button & Character Count */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/40">
            <div className="flex items-center gap-3">
              {prompt.length > 0 && (
                <button
                  onClick={() => setPrompt("")}
                  className="hover:text-slate-300 transition-colors flex items-center gap-1"
                >
                  ✕ Clear
                </button>
              )}
              {category === "auto" && detectedIntent && (
                <div className="flex items-center gap-1.5 text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-[11px] font-medium">
                  <span>✨ Auto-Detected:</span>
                  <span className="capitalize font-bold text-white">{detectedIntent.category} AI</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono">{prompt.length} chars</span>
              <span className="text-slate-600 hidden sm:inline">⌘ + Enter to send</span>
            </div>
          </div>
        </div>

        {/* Action & Category Bar */}
        <div className="bg-[#1C1C1F] p-3 rounded-xl border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Category Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5" id="category-selector-tabs">
            {categories.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`cat-btn-${cat.id}`}
                  onClick={() => setCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Right Action Tools & Generate Button */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Options Toggle */}
            <button
              id="options-toggle-btn"
              onClick={() => setShowOptions(!showOptions)}
              title="Configure parameters (aspect ratio, voice, temperature)"
              className={`p-2 rounded-lg text-xs font-semibold border transition-all ${
                showOptions
                  ? "bg-slate-800 text-white border-slate-700"
                  : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              ⚙️ Options
            </button>

            {/* Prompt Optimizer */}
            <button
              id="optimize-prompt-btn"
              onClick={onOptimizePrompt}
              disabled={isOptimizing || !prompt.trim()}
              title="Auto-enhance and optimize this prompt for highest quality output"
              className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 flex items-center gap-1.5"
            >
              <span>{isOptimizing ? "⏳" : "🪄"}</span>
              <span className="hidden sm:inline">Enhance Prompt</span>
            </button>

            {/* Main Generate Button */}
            <button
              id="generate-button"
              onClick={onGenerate}
              disabled={isLoading || !prompt.trim()}
              className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  <span>Routing...</span>
                </>
              ) : (
                <>
                  <span>Generate</span>
                  <span className="text-lg leading-none">→</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Options Drawer */}
        {showOptions && (
          <div className="bg-[#121214] p-4 border-t border-slate-800 rounded-b-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Image Aspect Ratio */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Aspect Ratio (Image)</label>
              <select
                id="select-aspect-ratio"
                value={options.aspectRatio}
                onChange={(e) => setOptions({ ...options, aspectRatio: e.target.value as any })}
                className="w-full bg-[#1C1C1F] border border-slate-700 text-white rounded-lg p-2 outline-none"
              >
                <option value="1:1">1:1 Square (1024x1024)</option>
                <option value="16:9">16:9 Landscape (1280x720)</option>
                <option value="9:16">9:16 Portrait (720x1280)</option>
                <option value="4:3">4:3 Standard</option>
              </select>
            </div>

            {/* Audio Voice */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Voice Profile (Audio)</label>
              <select
                id="select-voice"
                value={options.voice}
                onChange={(e) => setOptions({ ...options, voice: e.target.value })}
                className="w-full bg-[#1C1C1F] border border-slate-700 text-white rounded-lg p-2 outline-none"
              >
                <option value="Puck">Puck (Expressive Male)</option>
                <option value="Charon">Charon (Deep Resonant)</option>
                <option value="Kore">Kore (Warm Female)</option>
                <option value="Fenrir">Fenrir (Authoritative)</option>
                <option value="Zephyr">Zephyr (Smooth &amp; Clear)</option>
              </select>
            </div>

            {/* Prompt Optimizer Setting */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Prompt Auto-Enrichment</label>
              <label className="flex items-center gap-2 bg-[#1C1C1F] border border-slate-700 rounded-lg p-2 cursor-pointer text-slate-200">
                <input
                  type="checkbox"
                  checked={options.optimizePrompt}
                  onChange={(e) => setOptions({ ...options, optimizePrompt: e.target.checked })}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span>Auto-enrich for modality</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompt Starters Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar" id="prompt-starters">
        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] flex-shrink-0">
          Try:
        </span>
        {activeStarters.map((starter, idx) => (
          <button
            key={idx}
            onClick={() => setPrompt(starter)}
            className="flex-shrink-0 bg-[#161618] hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-full transition-all truncate max-w-xs"
          >
            {starter}
          </button>
        ))}
      </div>
    </div>
  );
};
