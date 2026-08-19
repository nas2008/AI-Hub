import React, { useState } from "react";
import { AICategory, SavedPrompt } from "../types.ts";

interface SavedPromptsViewProps {
  savedPrompts: SavedPrompt[];
  onUsePrompt: (promptText: string, category: AICategory) => void;
  onCreateSavedPrompt: (prompt: { title: string; prompt: string; category: AICategory; tags: string[] }) => void;
  onDeleteSavedPrompt: (id: string) => void;
}

export const SavedPromptsView: React.FC<SavedPromptsViewProps> = ({
  savedPrompts,
  onUsePrompt,
  onCreateSavedPrompt,
  onDeleteSavedPrompt,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPrompt, setNewPrompt] = useState("");
  const [newCategory, setNewCategory] = useState<AICategory>("text");
  const [newTags, setNewTags] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrompt.trim()) return;

    onCreateSavedPrompt({
      title: newTitle.trim(),
      prompt: newPrompt.trim(),
      category: newCategory,
      tags: newTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });

    setNewTitle("");
    setNewPrompt("");
    setNewTags("");
    setShowModal(false);
  };

  const filtered = savedPrompts.filter((sp) => {
    const matchesCat = filterCategory === "all" || sp.category === filterCategory;
    const matchesQuery =
      sp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sp.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sp.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6" id="saved-prompts-view">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Saved Prompts &amp; Templates</h1>
          <p className="text-sm text-slate-400">Library of curated prompt engineering blueprints and custom saved prompts.</p>
        </div>

        <button
          id="btn-create-prompt-modal"
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
        >
          <span>+</span>
          <span>Save New Prompt</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] bg-[#161618] border border-slate-800 rounded-xl px-3 py-2 flex items-center gap-2">
          <span className="text-slate-500 text-sm">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates or tags..."
            className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {["all", "text", "code", "image", "audio", "video"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                filterCategory === cat
                  ? "bg-indigo-600 text-white"
                  : "bg-[#161618] text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-[#161618] border border-slate-800 hover:border-indigo-500/40 p-5 rounded-2xl transition-all flex flex-col justify-between group shadow-lg"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-tight">
                    {item.category}
                  </span>
                  {item.isCustom && (
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                      Custom
                    </span>
                  )}
                </div>

                {item.isCustom && (
                  <button
                    onClick={() => onDeleteSavedPrompt(item.id)}
                    title="Delete prompt"
                    className="text-slate-600 hover:text-rose-400 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
                {item.title}
              </h3>

              <p className="text-xs text-slate-300 bg-[#0F0F11] border border-slate-800/80 p-3 rounded-xl leading-relaxed line-clamp-3">
                "{item.prompt}"
              </p>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => navigator.clipboard.writeText(item.prompt)}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                📋 Copy Text
              </button>

              <button
                onClick={() => onUsePrompt(item.prompt, item.category)}
                className="px-3.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>Use Prompt</span>
                <span>→</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#161618] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg">Save New Prompt</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Next.js App Router Architecture"
                  className="w-full bg-[#1C1C1F] border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-[#1C1C1F] border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-indigo-500"
                >
                  <option value="text">Text / Analysis</option>
                  <option value="code">Code / Development</option>
                  <option value="image">Image / Art</option>
                  <option value="audio">Audio / Voice</option>
                  <option value="video">Video / Storyboard</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Prompt Body</label>
                <textarea
                  required
                  rows={4}
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="Write your reusable prompt..."
                  className="w-full bg-[#1C1C1F] border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-indigo-500 resize-none font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. React, Architecture, TypeScript"
                  className="w-full bg-[#1C1C1F] border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold"
                >
                  Save Prompt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
