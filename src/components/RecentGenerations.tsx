import React from "react";
import { GenerationResult } from "../types.ts";

interface RecentGenerationsProps {
  history: GenerationResult[];
  onSelectResult: (result: GenerationResult) => void;
}

export const RecentGenerations: React.FC<RecentGenerationsProps> = ({
  history,
  onSelectResult,
}) => {
  if (!history || history.length === 0) {
    return null;
  }

  // Display top 3 recent items
  const recentItems = history.slice(0, 3);

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case "text":
        return {
          tag: "Text-AI",
          text: "text-indigo-400",
          bg: "bg-indigo-400/10",
          hoverBorder: "hover:border-indigo-500/50",
          hoverText: "text-indigo-400",
        };
      case "image":
        return {
          tag: "Image-AI",
          text: "text-pink-400",
          bg: "bg-pink-400/10",
          hoverBorder: "hover:border-pink-500/50",
          hoverText: "text-pink-400",
        };
      case "code":
        return {
          tag: "Code-AI",
          text: "text-emerald-400",
          bg: "bg-emerald-400/10",
          hoverBorder: "hover:border-emerald-500/50",
          hoverText: "text-emerald-400",
        };
      case "audio":
        return {
          tag: "Audio-AI",
          text: "text-amber-400",
          bg: "bg-amber-400/10",
          hoverBorder: "hover:border-amber-500/50",
          hoverText: "text-amber-400",
        };
      case "video":
        return {
          tag: "Video-AI",
          text: "text-cyan-400",
          bg: "bg-cyan-400/10",
          hoverBorder: "hover:border-cyan-500/50",
          hoverText: "text-cyan-400",
        };
      default:
        return {
          tag: "AI Gen",
          text: "text-indigo-400",
          bg: "bg-indigo-400/10",
          hoverBorder: "hover:border-indigo-500/50",
          hoverText: "text-indigo-400",
        };
    }
  };

  const formatTimeAgo = (timestampStr: string) => {
    const diffMs = Date.now() - new Date(timestampStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="mt-12" id="recent-generations-section">
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-4">
        <span className="flex-shrink-0">Recent Generations</span>
        <div className="h-[1px] w-full bg-slate-800"></div>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {recentItems.map((item) => {
          const style = getCategoryStyles(item.category);
          return (
            <div
              key={item.id}
              onClick={() => onSelectResult(item)}
              className={`bg-[#161618] border border-slate-800 p-4 rounded-xl ${style.hoverBorder} transition-all cursor-pointer group flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-bold ${style.text} ${style.bg} px-2 py-0.5 rounded uppercase tracking-tighter`}
                  >
                    {style.tag}
                  </span>
                  <span className="text-[10px] text-slate-600 font-mono">
                    {formatTimeAgo(item.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-slate-300 font-medium line-clamp-2 leading-relaxed">
                  {item.originalPrompt}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-slate-500 font-mono">{item.modelId}</span>
                <span className={`text-xs ${style.hoverText} font-bold`}>View Result →</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
