import React from 'react';
import { Search, History, BookOpen } from 'lucide-react';
import { SAMPLE_ARTICLES, SampleArticle } from '../data/sampleArticles';

interface HeaderProps {
  platform: string;
  setPlatform: (p: string) => void;
  goal: string;
  setGoal: (g: string) => void;
  engine: string;
  setEngine: (e: string) => void;
  groqConfigured: boolean;
  groqModel?: string | null;
  onSelectSample: (sample: SampleArticle) => void;
  historyCount: number;
  onToggleHistory: () => void;
  onOpenExport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  platform,
  setPlatform,
  goal,
  setGoal,
  engine,
  setEngine,
  groqConfigured,
  groqModel,
  onSelectSample,
  historyCount,
  onToggleHistory,
  onOpenExport,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  RankViral <span className="text-amber-400 font-semibold text-sm">SEO Engine</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Search className="w-2.5 h-2.5" /> 2026 Algorithmic
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Extract high-intent search terms & viral click-magnet keywords from any article
              </p>
            </div>
          </div>

          {/* Quick Controls: Samples, Platform, Goal & History */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Try Sample Dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700/70 hover:border-slate-500 hover:text-white transition-all shadow-sm cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Try Sample</span>
              </button>

              <div className="absolute right-0 mt-1 w-64 p-1.5 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl opacity-0 translate-y-1 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-200 z-50">
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                  Select a test article:
                </div>
                {SAMPLE_ARTICLES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => onSelectSample(sample)}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors group/item cursor-pointer"
                  >
                    <div className="text-xs font-semibold text-white group-hover/item:text-amber-400 flex items-center justify-between">
                      {sample.title}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {sample.category} • {sample.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Platform Selector */}
            <div className="flex items-center bg-slate-900/90 rounded-lg p-1 border border-slate-800 text-xs">
              <span className="text-[11px] text-slate-400 px-1.5 hidden xl:inline">Target:</span>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
              >
                <option value="google" className="bg-slate-900 text-slate-200">Google SERP</option>
                <option value="ai_search" className="bg-slate-900 text-slate-200">AI Search (Perplexity/ChatGPT)</option>
                <option value="youtube" className="bg-slate-900 text-slate-200">YouTube / Video Search</option>
                <option value="social" className="bg-slate-900 text-slate-200">Viral Social (TikTok/X/Threads)</option>
              </select>
            </div>

            {/* Strategy Goal */}
            <div className="flex items-center bg-slate-900/90 rounded-lg p-1 border border-slate-800 text-xs">
              <span className="text-[11px] text-slate-400 px-1.5 hidden xl:inline">Goal:</span>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
              >
                <option value="balanced" className="bg-slate-900 text-slate-200">Balanced (SEO + Viral)</option>
                <option value="viral_traffic" className="bg-slate-900 text-slate-200">Max Virality & CTR</option>
                <option value="high_intent_seo" className="bg-slate-900 text-slate-200">High-Intent Buyer SEO</option>
                <option value="long_tail_questions" className="bg-slate-900 text-slate-200">Long-Tail & PAA Snippets</option>
              </select>
            </div>

            {/* History Toggle */}
            <button
              onClick={onToggleHistory}
              title="View past analyzed articles"
              className="relative p-2 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
            >
              <History className="w-4 h-4" />
              {historyCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center">
                  {historyCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
