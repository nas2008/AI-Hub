import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { GenerationResult } from "../types.ts";
import { CodePreviewSandbox } from "./CodePreviewSandbox.tsx";

interface GenerationResultViewProps {
  result: GenerationResult;
  onToggleFavorite: (id: string) => void;
  onSavePrompt: (promptText: string, category: string) => void;
  onRerun: (prompt: string, category: any) => void;
}

export const GenerationResultView: React.FC<GenerationResultViewProps> = ({
  result,
  onToggleFavorite,
  onSavePrompt,
  onRerun,
}) => {
  const [activeTab, setActiveTab] = useState<"rendered" | "raw" | "prompt">("rendered");
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [showCodePreview, setShowCodePreview] = useState<boolean>(true);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(label);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Download helper
  const handleDownload = () => {
    if (result.outputType === "image") {
      const link = document.createElement("a");
      link.href = result.content;
      link.download = `ai-hub-image-${result.id}.png`;
      link.click();
    } else if (result.outputType === "audio") {
      const link = document.createElement("a");
      link.href = result.content;
      link.download = `ai-hub-audio-${result.id}.wav`;
      link.click();
    } else {
      const blob = new Blob([result.content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ai-hub-${result.category}-${result.id}.md`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const categoryTheme: Record<string, { badge: string; text: string; bg: string; border: string }> = {
    text: { badge: "Text-AI", text: "text-indigo-400", bg: "bg-indigo-400/10", border: "border-indigo-500/30" },
    image: { badge: "Image-AI", text: "text-pink-400", bg: "bg-pink-400/10", border: "border-pink-500/30" },
    code: { badge: "Code-AI", text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-500/30" },
    audio: { badge: "Audio-AI", text: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-500/30" },
    video: { badge: "Video-AI", text: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-500/30" },
  };

  const theme = categoryTheme[result.category] || categoryTheme.text;

  return (
    <div
      id={`generation-result-${result.id}`}
      className="bg-[#161618] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all"
    >
      {/* Result Header */}
      <div className="bg-[#1C1C1F] border-b border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Left tags */}
        <div className="flex items-center gap-3">
          <span className={`text-[11px] font-bold ${theme.text} ${theme.bg} border ${theme.border} px-2.5 py-1 rounded uppercase tracking-wider`}>
            {theme.badge}
          </span>
          <span className="text-xs font-mono text-slate-300 font-semibold bg-slate-800/80 px-2 py-0.5 rounded">
            {result.modelId}
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            ⚡ {result.executionTimeMs}ms
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Favorite toggle */}
          <button
            id="btn-toggle-favorite"
            onClick={() => onToggleFavorite(result.id)}
            title={result.isFavorite ? "Remove from favorites" : "Add to favorites"}
            className={`p-2 rounded-lg border text-sm transition-all ${
              result.isFavorite
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            {result.isFavorite ? "⭐ Favorited" : "☆ Favorite"}
          </button>

          {/* Copy Prompt */}
          <button
            onClick={() => handleCopy(result.originalPrompt, "prompt")}
            className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-xs font-semibold transition-all"
          >
            {copiedType === "prompt" ? "✓ Copied Prompt" : "📋 Copy Prompt"}
          </button>

          {/* Copy Output */}
          <button
            onClick={() => handleCopy(result.content, "output")}
            className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-xs font-semibold transition-all"
          >
            {copiedType === "output" ? "✓ Copied Output" : "📋 Copy Output"}
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            title="Download result file"
            className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-xs font-semibold transition-all"
          >
            📥 Download
          </button>

          {/* Save Prompt */}
          <button
            onClick={() => onSavePrompt(result.originalPrompt, result.category)}
            title="Save prompt into library"
            className="p-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-lg text-xs transition-all"
          >
            🔖
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#121214] border-b border-slate-800/80 px-4 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("rendered")}
            className={`py-2 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "rendered"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Rendered Output
          </button>
          <button
            onClick={() => setActiveTab("raw")}
            className={`py-2 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "raw"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Raw Content
          </button>
          <button
            onClick={() => setActiveTab("prompt")}
            className={`py-2 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "prompt"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Prompt Inspector
          </button>
        </div>

        {result.category === "code" && activeTab === "rendered" && (
          <button
            onClick={() => setShowCodePreview(!showCodePreview)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            <span>{showCodePreview ? "Hide" : "Show"} Live Sandbox</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-6">
        {/* Tab 1: Rendered View */}
        {activeTab === "rendered" && (
          <div className="space-y-6">
            {/* Image Result */}
            {result.outputType === "image" && (
              <div className="space-y-4">
                <div className="relative group max-w-2xl mx-auto rounded-xl overflow-hidden border border-slate-800 bg-[#0A0A0B] flex items-center justify-center p-2 shadow-2xl">
                  <img
                    src={result.content}
                    alt={result.originalPrompt}
                    className="max-h-[500px] w-auto object-contain rounded-lg shadow-md"
                  />
                  <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 px-2.5 py-1 rounded text-[11px] font-mono text-slate-300">
                    {result.imageDimensions?.aspectRatio || "1:1"}
                  </div>
                </div>
                {result.metadata?.description && (
                  <p className="text-sm text-slate-400 italic text-center max-w-xl mx-auto">
                    {result.metadata.description}
                  </p>
                )}
              </div>
            )}

            {/* Audio Result */}
            {result.outputType === "audio" && (
              <div className="space-y-4 max-w-xl mx-auto bg-[#121214] border border-slate-800 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🎙️</span>
                  <div>
                    <h4 className="font-bold text-white text-sm">Synthesized Audio Speech</h4>
                    <p className="text-xs text-slate-400">Voice: <span className="font-mono text-indigo-400">{result.metadata?.voice || "Puck"}</span> • 24kHz Studio Audio</p>
                  </div>
                </div>
                <audio
                  controls
                  src={result.content}
                  className="w-full rounded-lg"
                  autoPlay={false}
                />
                <div className="bg-[#0A0A0B] p-3 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                  <span className="text-slate-500 font-semibold block mb-1">TRANSCRIPT:</span>
                  "{result.metadata?.transcript || result.optimizedPrompt}"
                </div>
              </div>
            )}

            {/* Code Result */}
            {result.outputType === "code" && (
              <div className="space-y-6">
                {showCodePreview && (
                  <CodePreviewSandbox codeContent={result.content} language={result.codeLanguage} />
                )}
                <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed overflow-x-auto bg-[#0F0F11] border border-slate-800 p-5 rounded-xl">
                  <ReactMarkdown>{result.content}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Text / Markdown Result */}
            {(result.outputType === "markdown" || result.outputType === "video_storyboard") && (
              <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed overflow-x-auto bg-[#0F0F11] border border-slate-800 p-6 rounded-xl space-y-4">
                <ReactMarkdown>{result.content}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Raw Code / Text */}
        {activeTab === "raw" && (
          <div className="relative">
            <pre className="bg-[#0A0A0B] border border-slate-800 text-slate-300 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-[450px] leading-relaxed select-all">
              {result.content}
            </pre>
          </div>
        )}

        {/* Tab 3: Prompt Inspector */}
        {activeTab === "prompt" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#121214] border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">
                Original User Prompt
              </span>
              <p className="text-slate-200 font-medium leading-relaxed bg-[#0A0A0B] p-3 rounded border border-slate-800">
                "{result.originalPrompt}"
              </p>
            </div>

            <div className="bg-[#121214] border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px] block">
                Router Optimized Prompt
              </span>
              <p className="text-slate-200 font-medium leading-relaxed bg-[#0A0A0B] p-3 rounded border border-indigo-500/20">
                "{result.optimizedPrompt}"
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer rerun */}
      <div className="bg-[#121214] border-t border-slate-800/80 px-6 py-3 flex items-center justify-between text-xs text-slate-400">
        <span>Prompt processed via <strong className="text-white">{result.providerName}</strong></span>
        <button
          onClick={() => onRerun(result.originalPrompt, result.category)}
          className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
        >
          Re-run in Studio ↺
        </button>
      </div>
    </div>
  );
};
