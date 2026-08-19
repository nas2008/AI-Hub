import fs from "fs";
import path from "path";
import { GenerationResult, HistoryItem, SavedPrompt } from "../providers/types.ts";

const DATA_DIR = path.join(process.cwd(), ".data");
const HISTORY_FILE = path.join(DATA_DIR, "history.json");
const SAVED_PROMPTS_FILE = path.join(DATA_DIR, "saved_prompts.json");

// Default starter templates
const DEFAULT_SAVED_PROMPTS: SavedPrompt[] = [
  {
    id: "sp-1",
    title: "Futuristic Cyberpunk Metropolis",
    prompt: "A breathtaking wide-angle view of a futuristic cyberpunk city at night with neon holographic billboards, flying vehicles, reflective rain-slicked streets, and cinematic 8k lighting.",
    category: "image",
    tags: ["Cyberpunk", "Cityscape", "Cinematic"],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "sp-2",
    title: "TypeScript React Clean Component",
    prompt: "Write a high-performance, accessible React component in TypeScript using Tailwind CSS and Motion. Include interactive hover states, accessibility ARIA attributes, and clear typing.",
    category: "code",
    tags: ["React", "TypeScript", "Tailwind"],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "sp-3",
    title: "Executive Strategic Summary",
    prompt: "Summarize the key trends, opportunities, and risks of modern autonomous AI agents into an executive briefing with bullet points and actionable takeaways.",
    category: "text",
    tags: ["Business", "Executive", "Strategy"],
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "sp-4",
    title: "Sci-Fi Video Scene Storyboard",
    prompt: "Deep space exploration vessel entering a glowing nebula portal, cosmic dust swirling around the titanium hull, dramatic cinematic lens flare and slow camera dolly zoom.",
    category: "video",
    tags: ["Cinematic", "Sci-Fi", "Space"],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "sp-5",
    title: "Inspiring Podcast Intro",
    prompt: "Welcome to AI Frontier, where we explore the bleeding edge of intelligent technology, machine learning breakthroughs, and the future of human creativity.",
    category: "audio",
    tags: ["Podcast", "Voiceover", "Introduction"],
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

class StorageService {
  private history: HistoryItem[] = [];
  private savedPrompts: SavedPrompt[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(HISTORY_FILE)) {
        const raw = fs.readFileSync(HISTORY_FILE, "utf-8");
        this.history = JSON.parse(raw);
      } else {
        this.history = [];
        this.saveHistoryToFile();
      }

      if (fs.existsSync(SAVED_PROMPTS_FILE)) {
        const raw = fs.readFileSync(SAVED_PROMPTS_FILE, "utf-8");
        this.savedPrompts = JSON.parse(raw);
      } else {
        this.savedPrompts = DEFAULT_SAVED_PROMPTS;
        this.saveSavedPromptsToFile();
      }
    } catch (e) {
      console.warn("Storage file initialization note (using in-memory):", e);
      if (this.savedPrompts.length === 0) {
        this.savedPrompts = DEFAULT_SAVED_PROMPTS;
      }
    }
  }

  private saveHistoryToFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(this.history, null, 2), "utf-8");
    } catch (e) {
      console.warn("Failed to write history file, retained in memory:", e);
    }
  }

  private saveSavedPromptsToFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(SAVED_PROMPTS_FILE, JSON.stringify(this.savedPrompts, null, 2), "utf-8");
    } catch (e) {
      console.warn("Failed to write saved prompts file, retained in memory:", e);
    }
  }

  // History methods
  getHistory(): HistoryItem[] {
    return [...this.history].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  addHistoryItem(item: GenerationResult): HistoryItem {
    const historyItem: HistoryItem = {
      ...item,
      isFavorite: false,
    };
    // Keep last 100 entries to maintain high performance
    this.history.unshift(historyItem);
    if (this.history.length > 100) {
      this.history = this.history.slice(0, 100);
    }
    this.saveHistoryToFile();
    return historyItem;
  }

  toggleFavorite(id: string): HistoryItem | null {
    const item = this.history.find((h) => h.id === id);
    if (item) {
      item.isFavorite = !item.isFavorite;
      this.saveHistoryToFile();
      return item;
    }
    return null;
  }

  deleteHistoryItem(id: string): boolean {
    const initialLen = this.history.length;
    this.history = this.history.filter((h) => h.id !== id);
    if (this.history.length !== initialLen) {
      this.saveHistoryToFile();
      return true;
    }
    return false;
  }

  clearHistory(): void {
    this.history = [];
    this.saveHistoryToFile();
  }

  // Saved Prompts methods
  getSavedPrompts(): SavedPrompt[] {
    return [...this.savedPrompts];
  }

  addSavedPrompt(prompt: Omit<SavedPrompt, "id" | "createdAt">): SavedPrompt {
    const newItem: SavedPrompt = {
      ...prompt,
      id: "sp-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
      isCustom: true,
    };
    this.savedPrompts.unshift(newItem);
    this.saveSavedPromptsToFile();
    return newItem;
  }

  deleteSavedPrompt(id: string): boolean {
    const initialLen = this.savedPrompts.length;
    this.savedPrompts = this.savedPrompts.filter((p) => p.id !== id);
    if (this.savedPrompts.length !== initialLen) {
      this.saveSavedPromptsToFile();
      return true;
    }
    return false;
  }
}

export const storageService = new StorageService();
