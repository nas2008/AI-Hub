import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar.tsx";
import { Header } from "./components/Header.tsx";
import { PromptComposer } from "./components/PromptComposer.tsx";
import { GenerationResultView } from "./components/GenerationResultView.tsx";
import { RecentGenerations } from "./components/RecentGenerations.tsx";
import { HistoryView } from "./components/HistoryView.tsx";
import { SavedPromptsView } from "./components/SavedPromptsView.tsx";
import { FavoritesView } from "./components/FavoritesView.tsx";
import { SettingsView } from "./components/SettingsView.tsx";
import {
  AICategory,
  AIProviderInfo,
  GenerationOptions,
  GenerationResult,
  NavTab,
  SavedPrompt,
} from "./types.ts";

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>("dashboard");
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState<AICategory | "auto">("auto");
  const [options, setOptions] = useState<GenerationOptions>({
    aspectRatio: "1:1",
    voice: "Puck",
    style: "Cinematic",
    language: "typescript",
    temperature: 0.7,
    optimizePrompt: true,
  });

  const [currentResult, setCurrentResult] = useState<GenerationResult | null>(null);
  const [history, setHistory] = useState<GenerationResult[]>([]);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [providers, setProviders] = useState<AIProviderInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Initial data loading
  useEffect(() => {
    fetchHistory();
    fetchSavedPrompts();
    fetchProviders();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        if (data.history) {
          setHistory(data.history);
          if (data.history.length > 0 && !currentResult) {
            setCurrentResult(data.history[0]);
          }
        }
      }
    } catch (e) {
      console.warn("Could not fetch history:", e);
    }
  };

  const fetchSavedPrompts = async () => {
    try {
      const res = await fetch("/api/saved-prompts");
      if (res.ok) {
        const data = await res.json();
        if (data.prompts) setSavedPrompts(data.prompts);
      }
    } catch (e) {
      console.warn("Could not fetch saved prompts:", e);
    }
  };

  const fetchProviders = async () => {
    try {
      const res = await fetch("/api/providers");
      if (res.ok) {
        const data = await res.json();
        if (data.providers) setProviders(data.providers);
      }
    } catch (e) {
      console.warn("Could not fetch providers:", e);
    }
  };

  // Main Generate Action
  const handleGenerate = async (customPrompt?: string, customCategory?: AICategory | "auto") => {
    const textToRun = customPrompt || prompt;
    const catToRun = customCategory || category;

    if (!textToRun || !textToRun.trim()) {
      showToast("Please enter a prompt to generate.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/router/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToRun.trim(),
          category: catToRun,
          options,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Generation request failed.");
      }

      setCurrentResult(data.result);
      // Prepend to history state
      setHistory((prev) => [data.result, ...prev.filter((h) => h.id !== data.result.id)]);
      showToast(`Routed to ${data.result.providerName} (${data.result.modelId})`, "success");
      setCurrentTab("dashboard");
    } catch (err: any) {
      console.error("Generate error:", err);
      showToast(err.message || "Failed to generate AI response.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Optimize Prompt
  const handleOptimizePrompt = async () => {
    if (!prompt.trim()) return;
    setIsOptimizing(true);
    try {
      const res = await fetch("/api/router/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, category }),
      });
      const data = await res.json();
      if (data.success && data.optimizedPrompt) {
        setPrompt(data.optimizedPrompt);
        showToast("Prompt enhanced for highest AI quality!", "success");
      }
    } catch (e) {
      showToast("Could not optimize prompt.", "error");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Favorite toggle
  const handleToggleFavorite = async (id: string) => {
    try {
      const res = await fetch(`/api/history/favorite/${id}`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setHistory((prev) =>
          prev.map((item) => (item.id === id ? { ...item, isFavorite: data.item.isFavorite } : item))
        );
        if (currentResult && currentResult.id === id) {
          setCurrentResult({ ...currentResult, isFavorite: data.item.isFavorite });
        }
        showToast(data.item.isFavorite ? "Added to favorites ⭐" : "Removed from favorites", "info");
      }
    } catch (e) {
      showToast("Failed to update favorite.", "error");
    }
  };

  // Delete history item
  const handleDeleteHistoryItem = async (id: string) => {
    try {
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
      if (res.ok) {
        setHistory((prev) => prev.filter((h) => h.id !== id));
        if (currentResult && currentResult.id === id) {
          setCurrentResult(null);
        }
        showToast("Record removed from history.", "info");
      }
    } catch (e) {
      showToast("Failed to delete history item.", "error");
    }
  };

  // Clear history
  const handleClearHistory = async () => {
    try {
      const res = await fetch("/api/history", { method: "DELETE" });
      if (res.ok) {
        setHistory([]);
        setCurrentResult(null);
        showToast("History successfully cleared.", "info");
      }
    } catch (e) {
      showToast("Failed to clear history.", "error");
    }
  };

  // Save prompt
  const handleCreateSavedPrompt = async (promptData: {
    title: string;
    prompt: string;
    category: AICategory;
    tags: string[];
  }) => {
    try {
      const res = await fetch("/api/saved-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promptData),
      });
      if (res.ok) {
        const data = await res.json();
        setSavedPrompts((prev) => [data.prompt, ...prev]);
        showToast("Prompt saved to your library!", "success");
      }
    } catch (e) {
      showToast("Failed to save prompt.", "error");
    }
  };

  const handleDeleteSavedPrompt = async (id: string) => {
    try {
      const res = await fetch(`/api/saved-prompts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSavedPrompts((prev) => prev.filter((p) => p.id !== id));
        showToast("Prompt deleted.", "info");
      }
    } catch (e) {
      showToast("Failed to delete prompt.", "error");
    }
  };

  // Use prompt in Studio
  const handleUsePrompt = (promptText: string, targetCategory: AICategory) => {
    setPrompt(promptText);
    setCategory(targetCategory);
    setCurrentTab("dashboard");
    showToast("Prompt loaded into composer.", "info");
  };

  // Re-run
  const handleRerun = (promptText: string, targetCategory: AICategory) => {
    setPrompt(promptText);
    setCategory(targetCategory);
    handleGenerate(promptText, targetCategory);
  };

  // Export Data JSON
  const handleExportData = () => {
    const exportPayload = {
      exportDate: new Date().toISOString(),
      appName: "AI Hub",
      version: "2.4.0",
      totalGenerations: history.length,
      history,
      savedPrompts,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ai-hub-backup-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Workspace data exported as JSON.", "success");
  };

  const favorites = history.filter((h) => h.isFavorite);

  return (
    <div className="flex h-screen w-full bg-[#0A0A0B] text-slate-200 font-sans overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        generationsCount={history.length}
        favoritesCount={favorites.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#0A0A0B]">
        {/* Top Header */}
        <Header
          activeProviderName={providers.find((p) => p.isDefault)?.name || "Google Gemini"}
          totalGenerations={history.length}
        />

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-8">
          <div className="max-w-4xl mx-auto w-full pb-12">
            {/* Tab 1: Dashboard / Studio */}
            {currentTab === "dashboard" && (
              <div className="space-y-10" id="dashboard-tab-content">
                {/* Hero Header */}
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
                    What are you building today?
                  </h1>
                  <p className="text-slate-400 text-base sm:text-lg">
                    One prompt. Intelligent routing. Infinite possibilities.
                  </p>
                </div>

                {/* Prompt Composer Box */}
                <PromptComposer
                  prompt={prompt}
                  setPrompt={setPrompt}
                  category={category}
                  setCategory={setCategory}
                  onGenerate={() => handleGenerate()}
                  isLoading={isLoading}
                  options={options}
                  setOptions={setOptions}
                  onOptimizePrompt={handleOptimizePrompt}
                  isOptimizing={isOptimizing}
                />

                {/* Active Generation Result */}
                {currentResult && (
                  <div className="space-y-3 pt-4" id="active-result-section">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-4 w-full">
                        <span className="flex-shrink-0 text-white font-semibold">Latest Output</span>
                        <div className="h-[1px] w-full bg-slate-800"></div>
                      </h2>
                    </div>

                    <GenerationResultView
                      result={currentResult}
                      onToggleFavorite={handleToggleFavorite}
                      onSavePrompt={(promptText, cat) =>
                        handleCreateSavedPrompt({
                          title: promptText.slice(0, 32) + "...",
                          prompt: promptText,
                          category: cat as AICategory,
                          tags: ["Saved from Studio"],
                        })
                      }
                      onRerun={handleRerun}
                    />
                  </div>
                )}

                {/* Recent Generations Cards */}
                <RecentGenerations
                  history={history}
                  onSelectResult={(item) => {
                    setCurrentResult(item);
                    window.scrollTo({ top: 300, behavior: "smooth" });
                  }}
                />
              </div>
            )}

            {/* Tab 2: History View */}
            {currentTab === "history" && (
              <HistoryView
                history={history}
                onSelectResult={(item) => {
                  setCurrentResult(item);
                  setCurrentTab("dashboard");
                }}
                onToggleFavorite={handleToggleFavorite}
                onDeleteHistoryItem={handleDeleteHistoryItem}
                onClearHistory={handleClearHistory}
                onRerun={handleRerun}
              />
            )}

            {/* Tab 3: Saved Prompts & Templates View */}
            {currentTab === "saved_prompts" && (
              <SavedPromptsView
                savedPrompts={savedPrompts}
                onUsePrompt={handleUsePrompt}
                onCreateSavedPrompt={handleCreateSavedPrompt}
                onDeleteSavedPrompt={handleDeleteSavedPrompt}
              />
            )}

            {/* Tab 4: Favorites View */}
            {currentTab === "favorites" && (
              <FavoritesView
                favorites={favorites}
                onSelectResult={(item) => {
                  setCurrentResult(item);
                  setCurrentTab("dashboard");
                }}
                onToggleFavorite={handleToggleFavorite}
                onRerun={handleRerun}
              />
            )}

            {/* Tab 5: Settings & Providers View */}
            {currentTab === "settings" && (
              <SettingsView
                providers={providers}
                onExportData={handleExportData}
                onClearAll={handleClearHistory}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="p-4 bg-slate-900/10 border-t border-slate-900/40 text-center flex-shrink-0">
          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">
            Protected by hub-router-v2.1 • end-to-end api encryption active
          </p>
        </footer>
      </main>

      {/* Global Toast Notification */}
      {toast && (
        <div
          id="global-toast"
          className={`fixed bottom-6 right-6 px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-2xl z-50 transition-all flex items-center gap-2.5 ${
            toast.type === "success"
              ? "bg-[#161618] text-emerald-300 border-emerald-500/40"
              : toast.type === "error"
              ? "bg-[#161618] text-rose-300 border-rose-500/40"
              : "bg-[#161618] text-slate-200 border-slate-700"
          }`}
        >
          <span>
            {toast.type === "success" ? "✓" : toast.type === "error" ? "⚠️" : "ℹ️"}
          </span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
