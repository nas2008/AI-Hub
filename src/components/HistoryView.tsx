import React, { useState } from "react";
import { AICategory, GenerationResult } from "../types.ts";

interface HistoryViewProps {
  history: GenerationResult[];
  onSelectResult: (result: GenerationResult) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
  onRerun: (prompt: string, category: AICategory) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectResult,
  onToggleFavorite,
  onDeleteHistoryItem,
  onClearHistory,
  onRerun,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.originalPrompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.modelId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6" id="history-view-container">
      {/* View Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Generation History</h1>
          <p className="text-sm text-slate-400">Track and inspect all historical requests and routed outputs.</p>
        </div>

        {history.length > 0 && (
          <div>
            {showConfirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-400 font-semibold">Clear all records?</span>
                <button
                  onClick={() => {
                    onClearHistory();
                    setShowConfirmClear(false);
                  }}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold"
                >
                  Yes, Clear
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-900 rounded-lg text-xs font-semibold transition-all"
              >
                Clear History
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] bg-[#161618] border border-slate-800 rounded-xl px-3 py-2 flex items-center gap-2">
          <span className="text-slate-500 text-sm">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts, models, keywords..."
            className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-xs text-slate-500 hover:text-slate-300">
              ✕
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {["all", "text", "code", "image", "audio", "video"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-[#161618] text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* History Items List */}
      {filteredHistory.length === 0 ? (
        <div className="bg-[#161618] border border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4 text-xl border border-indigo-500/20">
            🕒
          </div>
          <h3 className="text-base font-bold text-white mb-1">No Generation Records</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {history.length === 0
              ? "Your generated prompts and AI responses will automatically appear here."
              : "No history items match your search filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="bg-[#161618] border border-slate-800 hover:border-slate-700 p-4 rounded-xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2.5 text-xs">
                  <span className="font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">
                    {item.category}
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">{item.modelId}</span>
                  <span className="text-slate-600 text-[11px]">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                  <span className="text-slate-600 text-[11px]">⚡ {item.executionTimeMs}ms</span>
                </div>
                <p className="text-sm text-slate-200 font-medium line-clamp-1">{item.originalPrompt}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onToggleFavorite(item.id)}
                  title={item.isFavorite ? "Favorited" : "Mark as favorite"}
                  className={`p-2 rounded-lg border text-xs transition-all ${
                    item.isFavorite
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-[#1C1C1F] text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  {item.isFavorite ? "⭐" : "☆"}
                </button>

                <button
                  onClick={() => onSelectResult(item)}
                  className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold transition-all"
                >
                  Inspect Result
                </button>

                <button
                  onClick={() => onRerun(item.originalPrompt, item.category)}
                  className="px-3 py-1.5 bg-[#1C1C1F] hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold transition-all"
                >
                  ↺ Re-run
                </button>

                <button
                  onClick={() => onDeleteHistoryItem(item.id)}
                  title="Delete record"
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
