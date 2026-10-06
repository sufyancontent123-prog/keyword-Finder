import React, { useState } from 'react';
import { X, Copy, Check, Download, Code2, FileCode, CheckCircle2 } from 'lucide-react';
import { STANDALONE_HTML, STANDALONE_CSS, STANDALONE_JS } from '../data/standaloneExport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js' | 'single'>('single');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  // Single-file bundle: inlines CSS and JS into one HTML file
  const singleFileBundle = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RankViral - SEO & Viral Keyword Intelligence Engine</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
${STANDALONE_CSS}
  </style>
</head>
<body class="bg-[#090d16] text-slate-100 min-h-screen font-sans selection:bg-indigo-500/30 selection:text-indigo-200">

  <!-- Header -->
  <header class="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 shadow-lg text-white font-black text-xl">
          ⚡
        </div>
        <div>
          <h1 class="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            RankViral <span class="text-amber-400 text-sm font-semibold">SEO Engine</span>
          </h1>
          <p class="text-xs text-slate-400">Extract high-intent search terms & viral click-magnet keywords from articles</p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button id="sampleBtn" class="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 hover:border-slate-500 transition-all cursor-pointer">
          📄 Load Sample Article
        </button>
        <select id="platformSelect" class="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none">
          <option value="google">Google SERP</option>
          <option value="ai_search">AI Search (Perplexity/ChatGPT)</option>
          <option value="youtube">YouTube Search</option>
          <option value="social">Viral Social</option>
        </select>
        <select id="goalSelect" class="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none">
          <option value="balanced">Balanced (SEO + Viral)</option>
          <option value="viral_traffic">Max Virality & CTR</option>
          <option value="high_intent_seo">High-Intent SEO</option>
        </select>
      </div>
    </div>
  </header>

  <!-- Main Container -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <div class="text-center max-w-3xl mx-auto space-y-2">
      <div class="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
        🔥 2026 Algorithmic Search Intelligence
      </div>
      <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
        Give Your Article, Get <span class="bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">Viral & SEO-Dominant Keywords</span>
      </h2>
      <p class="text-sm text-slate-400">Extract high-volume ranking terms, viral curiosity hooks, keyword difficulty scores, and SERP snippets.</p>
    </div>

    <!-- Article Input Card -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl relative">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          Source Article Content <span id="wordCountBadge" class="text-xs font-normal text-slate-400">(0 words)</span>
        </h3>
        <div class="flex items-center gap-2">
          <button id="pasteBtn" class="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer">Paste</button>
          <button id="clearBtn" class="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 bg-slate-800/50 border border-slate-700 cursor-pointer">Clear</button>
        </div>
      </div>

      <textarea id="articleInput" placeholder="Paste your article, blog post draft, or newsletter content here..." class="w-full h-56 p-4 mt-4 text-sm bg-slate-950/70 text-slate-100 placeholder-slate-500 border border-slate-800 focus:border-indigo-500 rounded-xl resize-y font-sans leading-relaxed"></textarea>

      <div class="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-4 text-xs text-slate-400">
          <span><strong id="statWords" class="text-white">0</strong> words</span>
          <span><strong id="statChars" class="text-white">0</strong> chars</span>
          <span>~<strong id="statTime" class="text-white">0</strong> min read</span>
        </div>
        <button id="analyzeBtn" class="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:opacity-95 shadow-lg shadow-indigo-600/30 cursor-pointer">
          ⚡ Extract Viral & SEO Keywords
        </button>
      </div>
    </div>

    <!-- Results Area -->
    <div id="resultsSection" class="hidden space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-slate-900 border border-amber-500/20 rounded-2xl p-4 shadow-lg">
          <span class="text-xs font-semibold text-slate-400 uppercase">🔥 Virality Potential</span>
          <div class="mt-2 text-3xl font-black text-white" id="viralityScore">--</div>
          <div class="w-full bg-slate-800 rounded-full h-1.5 mt-2">
            <div id="viralityBar" class="bg-amber-500 h-1.5 rounded-full" style="width: 0%"></div>
          </div>
        </div>
        <div class="bg-slate-900 border border-emerald-500/20 rounded-2xl p-4 shadow-lg">
          <span class="text-xs font-semibold text-slate-400 uppercase">🎯 SEO Readiness</span>
          <div class="mt-2 text-3xl font-black text-white" id="seoScore">--</div>
          <div class="w-full bg-slate-800 rounded-full h-1.5 mt-2">
            <div id="seoBar" class="bg-emerald-500 h-1.5 rounded-full" style="width: 0%"></div>
          </div>
        </div>
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <span class="text-xs font-semibold text-slate-400 uppercase">🧭 Target Niche</span>
          <div class="mt-2 text-sm font-bold text-slate-100" id="primaryTopic">--</div>
        </div>
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <span class="text-xs font-semibold text-slate-400 uppercase">👥 Search Persona</span>
          <div class="mt-2 text-sm font-bold text-slate-100" id="targetAudience">--</div>
        </div>
      </div>

      <!-- Keyword Table -->
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div class="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <h3 class="text-base font-bold text-white">Extracted Viral & SEO Keywords</h3>
          <div class="flex items-center gap-2">
            <button id="copyTagsBtn" class="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer">Copy Tags</button>
            <button id="copyCsvBtn" class="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer">Copy CSV</button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950/80 text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th class="py-3 px-4">Keyword</th>
                <th class="py-3 px-3">Type</th>
                <th class="py-3 px-3">Search Intent</th>
                <th class="py-3 px-3">Viral Score</th>
                <th class="py-3 px-3">SEO Difficulty</th>
                <th class="py-3 px-3">Volume</th>
              </tr>
            </thead>
            <tbody id="keywordsTbody" class="divide-y divide-slate-800 text-slate-200"></tbody>
          </table>
        </div>
      </div>
    </div>
  </main>

  <script>
${STANDALONE_JS}
  </script>
</body>
</html>`;

  const getContent = () => {
    switch (activeTab) {
      case 'html':
        return STANDALONE_HTML;
      case 'css':
        return STANDALONE_CSS;
      case 'js':
        return STANDALONE_JS;
      case 'single':
      default:
        return singleFileBundle;
    }
  };

  const getFilename = () => {
    switch (activeTab) {
      case 'html':
        return 'index.html';
      case 'css':
        return 'style.css';
      case 'js':
        return 'app.js';
      case 'single':
      default:
        return 'rankviral-standalone.html';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getContent());
    setCopied(activeTab);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([getContent()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getFilename();
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Standalone HTML, CSS & JavaScript Code
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ready to Export
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Download or copy the full standalone frontend code to host or run anywhere
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs & Action bar */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('single')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'single'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              🚀 All-in-One HTML (Single File)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('html')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'html'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              index.html
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('css')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'css'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              style.css
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('js')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'js'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              app.js
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
            >
              {copied === activeTab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === activeTab ? 'Copied Code!' : 'Copy Code'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {getFilename()}</span>
            </button>
          </div>
        </div>

        {/* Code Content View */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed max-h-[60vh] select-all">
          <pre className="whitespace-pre-wrap">{getContent()}</pre>
        </div>

        {/* Footer info note */}
        <div className="p-3.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>
            💡 <strong>Tip:</strong> The All-in-One HTML file embeds CSS and JavaScript so you can double click and test it directly in your browser.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
