import React, { useState, useMemo } from 'react';
import { Eye, Flame, Target, Sparkles, Filter, Info } from 'lucide-react';
import { KeywordItem } from '../types';

interface ArticleHighlighterProps {
  articleText: string;
  keywords: KeywordItem[];
}

export const ArticleHighlighter: React.FC<ArticleHighlighterProps> = ({
  articleText,
  keywords,
}) => {
  const [activeHighlightFilter, setActiveHighlightFilter] = useState<'all' | 'viral' | 'seo'>('all');
  const [selectedKeywordInfo, setSelectedKeywordInfo] = useState<KeywordItem | null>(null);

  // Build sorted list of keyword patterns to avoid partial collisions
  const keywordMap = useMemo(() => {
    const map = new Map<string, KeywordItem>();
    keywords.forEach((k) => {
      map.set(k.keyword.toLowerCase(), k);
    });
    return map;
  }, [keywords]);

  // Highlight keywords within text
  const highlightedContent = useMemo(() => {
    if (!articleText || keywords.length === 0) return articleText;

    // Filter keywords according to selection
    const targetKeywords = keywords.filter((k) => {
      if (activeHighlightFilter === 'viral') return k.type === 'viral' || k.viralScore >= 75;
      if (activeHighlightFilter === 'seo') return k.type === 'primary' || k.type === 'secondary';
      return true;
    });

    if (targetKeywords.length === 0) return articleText;

    // Sort by longest keyword first so multi-word phrases match before substrings
    const sorted = [...targetKeywords].sort((a, b) => b.keyword.length - a.keyword.length);
    const escaped = sorted.map((k) => k.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    let keyIdx = 0;
    while ((match = regex.exec(articleText)) !== null) {
      const matchStart = match.index;
      const matchEnd = regex.lastIndex;
      const matchedWord = match[0];

      // Add text before match
      if (matchStart > lastIndex) {
        parts.push(articleText.slice(lastIndex, matchStart));
      }

      const lower = matchedWord.toLowerCase();
      const meta = keywordMap.get(lower);

      let highlightClass = 'bg-indigo-500/20 text-indigo-200 border-indigo-500/40';
      if (meta?.type === 'viral' || (meta?.viralScore && meta.viralScore >= 80)) {
        highlightClass = 'bg-rose-500/25 text-rose-200 border-rose-500/50';
      } else if (meta?.type === 'primary') {
        highlightClass = 'bg-emerald-500/25 text-emerald-200 border-emerald-500/50';
      } else if (meta?.type === 'question') {
        highlightClass = 'bg-purple-500/25 text-purple-200 border-purple-500/50';
      }

      parts.push(
        <button
          key={`hl-${keyIdx++}`}
          type="button"
          onClick={() => meta && setSelectedKeywordInfo(meta)}
          className={`inline-block px-1.5 py-0.5 my-0.5 rounded text-xs font-semibold border cursor-pointer hover:scale-105 transition-transform ${highlightClass}`}
          title={meta ? `Click to inspect keyword: "${meta.keyword}" (Viral: ${meta.viralScore}, KD: ${meta.difficulty})` : ''}
        >
          {matchedWord}
        </button>
      );

      lastIndex = matchEnd;
    }

    if (lastIndex < articleText.length) {
      parts.push(articleText.slice(lastIndex));
    }

    return parts;
  }, [articleText, keywords, activeHighlightFilter, keywordMap]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Visual In-Article Keyword Heatmap
            </h3>
            <p className="text-xs text-slate-400">
              See exact keyword distribution and density inside your article
            </p>
          </div>
        </div>

        {/* Highlight Filter Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveHighlightFilter('all')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              activeHighlightFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Keywords
          </button>
          <button
            type="button"
            onClick={() => setActiveHighlightFilter('viral')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
              activeHighlightFilter === 'viral'
                ? 'bg-rose-900/60 text-rose-200 border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3 h-3 text-rose-400" />
            Viral Only
          </button>
          <button
            type="button"
            onClick={() => setActiveHighlightFilter('seo')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
              activeHighlightFilter === 'seo'
                ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-3 h-3 text-emerald-400" />
            SEO Only
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
        <span className="text-[11px] font-semibold text-slate-300">Color Legend:</span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-semibold">
          <Flame className="w-2.5 h-2.5" /> Viral Magnets
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
          <Target className="w-2.5 h-2.5" /> Primary Target SEO
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold">
          <Sparkles className="w-2.5 h-2.5" /> Secondary / LSI
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-semibold">
          Questions & PAA
        </span>
        <span className="text-[11px] text-slate-500 ml-auto hidden md:inline">
          Click any highlighted phrase to view instant metrics
        </span>
      </div>

      {/* Selected keyword inspect tooltip */}
      {selectedKeywordInfo && (
        <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-indigo-500/40 flex items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-white text-sm">
              "{selectedKeywordInfo.keyword}"
            </span>
            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold text-[10px]">
              Viral: {selectedKeywordInfo.viralScore}/100
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
              KD: {selectedKeywordInfo.difficulty} ({selectedKeywordInfo.difficultyScore}%)
            </span>
            <span className="text-slate-400">
              Volume: {selectedKeywordInfo.estimatedVolume}
            </span>
            <span className="text-slate-400">
              Intent: {selectedKeywordInfo.searchIntent}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedKeywordInfo(null)}
            className="text-slate-400 hover:text-white text-xs underline"
          >
            Close
          </button>
        </div>
      )}

      {/* Rendered Text with Highlights */}
      <div className="mt-4 p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 max-h-96 overflow-y-auto font-sans leading-relaxed text-slate-300 text-sm whitespace-pre-wrap select-text">
        {highlightedContent}
      </div>
    </div>
  );
};
