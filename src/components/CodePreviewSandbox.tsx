import React, { useMemo, useState } from "react";

interface CodePreviewSandboxProps {
  codeContent: string;
  language?: string;
}

export const CodePreviewSandbox: React.FC<CodePreviewSandboxProps> = ({ codeContent, language }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Extract previewable content (HTML, SVG, or JS)
  const previewHtml = useMemo(() => {
    // Check if code contains SVG directly
    const svgMatch = codeContent.match(/<svg[\s\S]*?<\/svg>/i);
    if (svgMatch) {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0f172a;
      padding: 20px;
      box-sizing: border-box;
    }
    svg {
      max-width: 100%;
      max-height: 80vh;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
      border-radius: 8px;
    }
  </style>
</head>
<body>
  ${svgMatch[0]}
</body>
</html>`;
    }

    // Check for standard HTML block
    const htmlBlockMatch = codeContent.match(/```html([\s\S]*?)```/i);
    if (htmlBlockMatch) {
      const inner = htmlBlockMatch[1].trim();
      if (inner.includes("<html") || inner.includes("<!DOCTYPE")) {
        return inner;
      }
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>body { margin: 0; padding: 24px; font-family: system-ui, sans-serif; background: #0b0f17; color: #f8fafc; }</style>
</head>
<body>
  ${inner}
</body>
</html>`;
    }

    // Check if whole content looks like HTML
    if (codeContent.trim().startsWith("<!DOCTYPE") || codeContent.trim().startsWith("<html")) {
      return codeContent.trim();
    }

    // Default generic component preview container
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      padding: 32px;
      background: #090d16;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  </style>
</head>
<body>
  <div class="bg-slate-900 border border-slate-800 p-6 rounded-xl max-w-lg w-full text-center shadow-xl">
    <div class="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">⚡</div>
    <h3 class="text-lg font-bold text-white mb-2">Interactive Code Sandbox</h3>
    <p class="text-sm text-slate-400 mb-4">Snippet language: <span class="font-mono text-indigo-400 font-bold">${language || "code"}</span></p>
    <div class="text-xs text-slate-500 font-mono bg-slate-950 p-3 rounded text-left overflow-x-auto">
      Ready for execution in local runtime environment.
    </div>
  </div>
</body>
</html>`;
  }, [codeContent, language]);

  return (
    <div className={`border border-slate-800 rounded-xl overflow-hidden bg-[#0A0A0B] flex flex-col ${isFullscreen ? "fixed inset-4 z-50 shadow-2xl" : "h-[360px]"}`}>
      <div className="h-10 bg-[#161618] border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="font-semibold text-slate-200">Interactive Sandbox Preview</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="hover:text-white px-2 py-1 bg-slate-800/80 rounded text-[11px] transition-colors"
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        </div>
      </div>
      <iframe
        title="Live Sandbox"
        srcDoc={previewHtml}
        sandbox="allow-scripts"
        className="w-full flex-1 border-0 bg-transparent"
      />
    </div>
  );
};
