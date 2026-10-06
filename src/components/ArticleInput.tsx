import React, { useState } from 'react';
import { Clipboard, Trash2, ArrowRight, Zap, FileText, Check, Clock, AlignLeft } from 'lucide-react';
import { SAMPLE_ARTICLES } from '../data/sampleArticles';

interface ArticleInputProps {
  articleText: string;
  setArticleText: (text: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  onSelectSampleId: (id: string) => void;
}

export const ArticleInput: React.FC<ArticleInputProps> = ({
  articleText,
  setArticleText,
  onAnalyze,
  isLoading,
  onSelectSampleId,
}) => {
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState(false);

  // Compute live statistics
  const trimmed = articleText.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const charCount = articleText.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 220));
  const sentenceCount = trimmed ? (trimmed.match(/[.!?]+(\s|$)/g) || []).length : 0;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setArticleText(text);
        setPasted(true);
        setTimeout(() => setPasted(false), 2000);
      }
    } catch {
      // Clipboard access might be restricted; user can paste manually
    }
  };

  const handleClear = () => {
    setArticleText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading && wordCount >= 10) {
        onAnalyze();
      }
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md relative overflow-hidden group">
      {/* Subtle background glow effect */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Controls of Input Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Source Article Content
              {wordCount > 0 && (
                <span className="text-xs font-normal text-slate-400">
                  ({wordCount} words)
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-400">
              Paste your blog post, article draft, newsletter, or essay
            </p>
          </div>
        </div>

        {/* Action buttons (Paste, Clear, Samples) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePaste}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:text-white transition-all"
            title="Paste text from clipboard"
          >
            {pasted ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5 text-slate-400" />}
            <span>{pasted ? 'Pasted!' : 'Paste'}</span>
          </button>

          {articleText && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 bg-slate-800/50 hover:bg-rose-500/10 border border-slate-700/60 hover:border-rose-500/30 transition-all"
              title="Clear text"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Textarea */}
      <div className="relative mt-4">
        <textarea
          value={articleText}
          onChange={(e) => setArticleText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste or write your article here...
e.g. 'Why Autonomous AI Agents Are Replacing Prompt Engineering in 2026. For the past three years, developers focused on crafting perfect prompt formulas. Today, self-directed agents take high-level goals, plan recursive workflows, and execute autonomously...'"
          className="w-full h-56 sm:h-64 p-4 text-sm bg-slate-950/70 text-slate-100 placeholder-slate-500 border border-slate-800 focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 rounded-xl resize-y transition-all leading-relaxed font-sans"
        />

        {/* Quick Sample Selector Chips if text is empty */}
        {!articleText && (
          <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center gap-2 p-3 bg-slate-900/90 rounded-lg border border-slate-800/90 pointer-events-auto">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Quick Test Samples:
            </span>
            {SAMPLE_ARTICLES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => onSelectSampleId(sample.id)}
                className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-md border border-slate-700 hover:border-indigo-500 transition-all"
              >
                {sample.title.split(':')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Live Content Metrics Bar & Analyze CTA */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Real-time word & stats telemetry */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-200 font-semibold">{wordCount}</span> words
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="text-slate-200 font-semibold">{charCount.toLocaleString()}</span> chars
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-200 font-semibold">~{readingTime} min</span> read
          </div>
          {sentenceCount > 0 && (
            <div className="hidden md:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              <span className="text-slate-200 font-semibold">{sentenceCount}</span> sentences
            </div>
          )}
        </div>

        {/* Primary CTA */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="hidden lg:inline text-[11px] text-slate-500">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">⌘+Enter</kbd>
          </span>

          <button
            type="button"
            onClick={onAnalyze}
            disabled={isLoading || wordCount < 10}
            className={`relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white shadow-xl transition-all duration-200 ${
              isLoading || wordCount < 10
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:via-rose-500 hover:to-indigo-500 shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.99] cursor-pointer'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Extracting Viral & SEO Keywords...</span>
              </>
            ) : (
              <>
                <span>Extract Viral & SEO Keywords</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
