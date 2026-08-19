import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { aiRouterService } from "./server/services/router.ts";
import { storageService } from "./server/services/storage.ts";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Providers list & status
  app.get("/api/providers", (req, res) => {
    try {
      const providers = aiRouterService.getProviders();
      res.json({ success: true, providers });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Classify intent
  app.post("/api/router/classify", (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ success: false, error: "Prompt is required" });
      }
      const classification = aiRouterService.classifyIntent(prompt);
      const optimized = aiRouterService.optimizePrompt(prompt, classification.category);
      res.json({
        success: true,
        classification,
        optimizedPrompt: optimized,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Optimize prompt
  app.post("/api/router/optimize", (req, res) => {
    try {
      const { prompt, category } = req.body;
      if (!prompt) {
        return res.status(400).json({ success: false, error: "Prompt is required" });
      }
      const cat = category === "auto" ? aiRouterService.classifyIntent(prompt).category : category;
      const optimized = aiRouterService.optimizePrompt(prompt, cat || "text");
      res.json({ success: true, optimizedPrompt: optimized, category: cat });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Main Route & Execute
  app.post("/api/router/execute", async (req, res) => {
    try {
      const { prompt, category, providerId, modelId, options } = req.body;
      if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
        return res.status(400).json({ success: false, error: "Please enter a prompt to generate." });
      }

      const result = await aiRouterService.routeAndExecute({
        prompt: prompt.trim(),
        category,
        providerId,
        modelId,
        options,
      });

      res.json({ success: true, result });
    } catch (err: any) {
      console.error("Execution error in /api/router/execute:", err);
      res.status(500).json({
        success: false,
        error: err.message || "An unexpected error occurred during generation.",
      });
    }
  });

  // History Endpoints
  app.get("/api/history", (req, res) => {
    try {
      const history = storageService.getHistory();
      res.json({ success: true, history });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/history/favorite/:id", (req, res) => {
    try {
      const item = storageService.toggleFavorite(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, error: "History item not found" });
      }
      res.json({ success: true, item });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete("/api/history/:id", (req, res) => {
    try {
      const deleted = storageService.deleteHistoryItem(req.params.id);
      res.json({ success: deleted });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete("/api/history", (req, res) => {
    try {
      storageService.clearHistory();
      res.json({ success: true, message: "History cleared" });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Saved Prompts Endpoints
  app.get("/api/saved-prompts", (req, res) => {
    try {
      const prompts = storageService.getSavedPrompts();
      res.json({ success: true, prompts });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/saved-prompts", (req, res) => {
    try {
      const { title, prompt, category, tags, description } = req.body;
      if (!title || !prompt) {
        return res.status(400).json({ success: false, error: "Title and prompt are required" });
      }
      const newPrompt = storageService.addSavedPrompt({
        title,
        prompt,
        category: category || "text",
        tags: Array.isArray(tags) ? tags : ["Custom"],
        description,
      });
      res.json({ success: true, prompt: newPrompt });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete("/api/saved-prompts/:id", (req, res) => {
    try {
      const deleted = storageService.deleteSavedPrompt(req.params.id);
      res.json({ success: deleted });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite development middleware or static production dist
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Hub server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
