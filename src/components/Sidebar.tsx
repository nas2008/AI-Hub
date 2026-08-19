import React from "react";
import { NavTab } from "../types.ts";

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  generationsCount: number;
  favoritesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  generationsCount,
  favoritesCount,
}) => {
  const navItems: { id: NavTab; label: string; icon: string; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: "⚡" },
    { id: "history", label: "History", icon: "🕒", badge: generationsCount },
    { id: "saved_prompts", label: "Saved Prompts", icon: "🔖" },
    { id: "favorites", label: "Favorites", icon: "⭐", badge: favoritesCount > 0 ? favoritesCount : undefined },
  ];

  return (
    <aside id="app-sidebar" className="w-64 border-r border-slate-800 flex flex-col bg-[#0F0F11] flex-shrink-0 select-none">
      <div className="p-6">
        {/* Brand Header */}
        <div
          id="brand-logo"
          onClick={() => onSelectTab("dashboard")}
          className="flex items-center gap-3 text-indigo-400 mb-8 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/40 group-hover:border-indigo-400 transition-colors">
            <div className="w-4 h-4 bg-indigo-400 rounded-sm group-hover:scale-110 transition-transform"></div>
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-white block leading-none">AI HUB</span>
            <span className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold">Router &amp; Studio</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5" id="main-navigation">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all text-left ${
                  isActive
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm"
                    : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 text-center text-sm ${isActive ? "opacity-100" : "opacity-60"}`}>
                    {item.icon}
                  </span>
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-indigo-400/20 text-indigo-300" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Settings link & System Indicator */}
      <div className="mt-auto p-6 border-t border-slate-800/80 space-y-4">
        <button
          id="nav-btn-settings"
          onClick={() => onSelectTab("settings")}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
            currentTab === "settings"
              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
              : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200 border border-transparent"
          }`}
        >
          <span className={`w-5 h-5 text-center text-sm ${currentTab === "settings" ? "opacity-100" : "opacity-60"}`}>
            ⚙️
          </span>
          <span className="font-medium text-sm">Settings &amp; Providers</span>
        </button>

        <div className="bg-[#161618] border border-slate-800/80 rounded-xl p-3">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-slate-500 uppercase tracking-wider font-semibold text-[9px]">Engine Status</span>
            <span className="text-emerald-400 font-mono font-bold text-[10px]">READY</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            <span className="truncate">Multi-Modal Router v2.4</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
