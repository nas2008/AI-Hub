import React from "react";
import { GenerationResult } from "../types.ts";

interface FavoritesViewProps {
  favorites: GenerationResult[];
  onSelectResult: (result: GenerationResult) => void;
  onToggleFavorite: (id: string) => void;
  onRerun: (prompt: string, category: any) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  onSelectResult,
  onToggleFavorite,
  onRerun,
}) => {
  return (
    <div className="space-y-6" id="favorites-view">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Favorite Generations</h1>
        <p className="text-sm text-slate-400">Your collection of high-value AI outputs and prompt results.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-[#161618] border border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4 text-xl border border-amber-500/20">
            ⭐
          </div>
          <h3 className="text-base font-bold text-white mb-1">No Favorites Starred Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the star icon (☆ Favorite) on any generated result card to save it here for quick access.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((item) => (
            <div
              key={item.id}
              className="bg-[#161618] border border-slate-800 hover:border-amber-500/40 p-5 rounded-2xl transition-all flex flex-col justify-between shadow-xl group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-400 uppercase tracking-tight border border-slate-700">
                      {item.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{item.modelId}</span>
                  </div>
                  <button
                    onClick={() => onToggleFavorite(item.id)}
                    title="Remove from favorites"
                    className="text-amber-400 hover:text-slate-500 transition-colors text-sm"
                  >
                    ★
                  </button>
                </div>

                <p className="text-sm text-white font-semibold line-clamp-2">"{item.originalPrompt}"</p>

                {item.outputType === "image" ? (
                  <div className="rounded-xl overflow-hidden bg-black/40 border border-slate-800 max-h-40 flex items-center justify-center p-2">
                    <img src={item.content} alt={item.originalPrompt} className="max-h-36 object-contain rounded" />
                  </div>
                ) : (
                  <div className="bg-[#0F0F11] border border-slate-800 p-3 rounded-xl text-xs text-slate-300 font-mono line-clamp-3 leading-relaxed">
                    {item.content}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectResult(item)}
                    className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-lg text-xs font-semibold transition-all"
                  >
                    Inspect Result →
                  </button>
                  <button
                    onClick={() => onRerun(item.originalPrompt, item.category)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                    title="Re-run"
                  >
                    ↺
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
