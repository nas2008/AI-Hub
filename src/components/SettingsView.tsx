import React, { useState } from "react";
import { AIProviderInfo } from "../types.ts";

interface SettingsViewProps {
  providers: AIProviderInfo[];
  onExportData: () => void;
  onClearAll: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  providers,
  onExportData,
  onClearAll,
}) => {
  const [localUrl, setLocalUrl] = useState("http://localhost:11434");
  const [copiedStatus, setCopiedStatus] = useState(false);

  const handleTestLocal = () => {
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl" id="settings-view">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Settings &amp; AI Providers</h1>
        <p className="text-sm text-slate-400">Configure routing preferences, review connected AI models, and manage data privacy.</p>
      </div>

      {/* Connected Providers List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Connected AI Providers</h2>
        <div className="space-y-3">
          {providers.map((p) => (
            <div
              key={p.id}
              className="bg-[#161618] border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-white text-base">{p.name}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      p.status === "connected"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    }`}
                  >
                    {p.status === "connected" ? "● Active & Connected" : "Configured Adapter"}
                  </span>
                  {p.isDefault && (
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                      Default Router
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{p.description}</p>
                {p.freeTierNote && (
                  <p className="text-[11px] text-emerald-400 font-mono pt-1">
                    ✓ {p.freeTierNote}
                  </p>
                )}

                {/* Models available */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {p.models.map((m) => (
                    <span
                      key={m.id}
                      className="text-[10px] bg-[#0F0F11] border border-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono"
                    >
                      {m.name} {m.badge && `(${m.badge})`}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Local & Custom Model Config */}
      <div className="bg-[#161618] border border-slate-800 p-6 rounded-2xl space-y-4 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💻</span>
          <div>
            <h3 className="font-bold text-white text-base">Local AI / Ollama Daemon Endpoint</h3>
            <p className="text-xs text-slate-400">Connect a local Ollama or LocalAI instance to run 100% private models offline.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <input
            type="text"
            value={localUrl}
            onChange={(e) => setLocalUrl(e.target.value)}
            className="flex-1 bg-[#1C1C1F] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none font-mono"
            placeholder="http://localhost:11434"
          />
          <button
            onClick={handleTestLocal}
            className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-bold transition-all"
          >
            {copiedStatus ? "✓ Connected Locally" : "Test Endpoint"}
          </button>
        </div>
      </div>

      {/* Free-First Architecture & Security Transparency */}
      <div className="bg-[#161618] border border-slate-800 p-6 rounded-2xl space-y-4 shadow-lg">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <span>🛡️</span>
          <span>Free-First Architecture &amp; Security Policy</span>
        </h3>
        <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            <span><strong>No Secret API Keys in Frontend:</strong> All model calls are executed strictly server-side through the Express router gateway.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            <span><strong>Zero User Cost:</strong> Designed to operate on legal free tiers (Google AI Studio free tier, Ollama open-source models).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            <span><strong>Modular Extensibility:</strong> Easily add or swap providers (OpenAI, LocalAI, HuggingFace) by implementing the ProviderAdapter interface.</span>
          </li>
        </ul>
      </div>

      {/* Data Management & Privacy */}
      <div className="bg-[#161618] border border-slate-800 p-6 rounded-2xl space-y-4 shadow-lg">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <span>📦</span>
          <span>Data Management &amp; Export</span>
        </h3>
        <p className="text-xs text-slate-400">
          All your generation records and saved prompts are stored locally in your workspace backend.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onExportData}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            <span>📥</span>
            <span>Export History as JSON</span>
          </button>

          <button
            onClick={onClearAll}
            className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/60 rounded-lg text-xs font-bold transition-all"
          >
            Wipe Generation History
          </button>
        </div>
      </div>
    </div>
  );
};
