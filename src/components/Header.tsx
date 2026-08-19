import React from "react";

interface HeaderProps {
  activeProviderName: string;
  totalGenerations: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeProviderName = "Google Gemini Router",
  totalGenerations,
}) => {
  return (
    <header
      id="app-header"
      className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0A0A0B]/90 backdrop-blur-md z-10 flex-shrink-0"
    >
      {/* Left router status */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 hidden sm:inline-block">
          Active Router
        </span>
        <div
          id="router-status-badge"
          className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
          <span className="text-xs font-bold text-emerald-400 tracking-tight">ALL SYSTEMS ONLINE</span>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 border border-slate-800 px-2.5 py-0.5 rounded-md font-mono">
          <span className="text-indigo-400">⚡</span>
          <span>{activeProviderName}</span>
        </div>
      </div>

      {/* Right User & Plan */}
      <div className="flex items-center gap-5">
        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 bg-[#161618] border border-slate-800 px-3 py-1 rounded-lg font-mono">
          <span>Generations:</span>
          <span className="text-white font-bold">{totalGenerations}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-bold text-white leading-none">Personal Hub</p>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter font-semibold">Free Tier Plan</p>
          </div>
          <div
            id="user-avatar"
            className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shadow-inner"
          >
            <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-purple-600 opacity-80 flex items-center justify-center text-xs font-bold text-white">
              AI
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
