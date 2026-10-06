import React, { useState, useMemo } from 'react';
import {
  Flame,
  Search,
  ArrowUpDown,
  Copy,
  Check,
  HelpCircle,
  TrendingUp,
  Tag,
  SlidersHorizontal,
  Sparkles,
  Zap,
  CheckSquare,
  Square,
} from 'lucide-react';
import { KeywordItem } from '../types';

interface KeywordsTableProps {
  keywords: KeywordItem[];
}

export const KeywordsTable: React.FC<KeywordsTableProps> = ({ keywords }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'viral' | 'primary' | 'secondary' | 'long_tail' | 'question' | 'easy_wins'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'viral_desc' | 'difficulty_asc' | 'volume_desc' | 'frequency_desc'>('viral_desc');
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());

  // Count by category
  const counts = useMemo(() => {
    return {
      all: keywords.length,
      viral: keywords.filter((k) => k.type === 'viral' || k.viralScore >= 80).length,
      primary: keywords.filter((k) => k.type === 'primary').length,
      secondary: keywords.filter((k) => k.type === 'secondary').length,
      long_tail: keywords.filter((k) => k.type === 'long_tail').length,
      question: keywords.filter((k) => k.type === 'question').length,
      easy_wins: keywords.filter((k) => k.difficulty === 'Easy' || k.difficultyScore <= 35).length,
    };
  }, [keywords]);

  // Filter and sort keywords
  const filteredKeywords = useMemo(() => {
    return keywords
      .filter((item) => {
        // Tab filtering
        if (activeTab === 'viral') {
          if (item.type !== 'viral' && item.viralScore < 80) return false;
        } else if (activeTab === 'easy_wins') {
          if (item.difficulty !== 'Easy' && item.difficultyScore > 35) return false;
        } else if (activeTab !== 'all') {
          if (item.type !== activeTab) return false;
        }

        // Search text filtering
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchWord = item.keyword.toLowerCase().includes(query);
          const matchTrigger = item.viralTrigger?.toLowerCase().includes(query);
          const matchIntent = item.searchIntent.toLowerCase().includes(query);
          if (!matchWord && !matchTrigger && !matchIntent) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'viral_desc') {
          return b.viralScore - a.viralScore;
        }
        if (sortBy === 'difficulty_asc') {
          return a.difficultyScore - b.difficultyScore;
        }
        if (sortBy === 'volume_desc') {
          const volumeScore = (v: string) => {
            if (v.includes('100k+')) return 4;
            if (v.includes('20k')) return 3;
            if (v.includes('5k')) return 2;
            return 1;
          };
          return volumeScore(b.estimatedVolume) - volumeScore(a.estimatedVolume);
        }
        if (sortBy === 'frequency_desc') {
          return b.frequencyInArticle - a.frequencyInArticle;
        }
        return 0;
      });
  }, [keywords, activeTab, searchQuery, sortBy]);

  const handleCopySingle = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyword(text);
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  const toggleSelect = (keyword: string) => {
    const next = new Set(selectedKeywords);
    if (next.has(keyword)) {
      next.delete(keyword);
    } else {
      next.add(keyword);
    }
    setSelectedKeywords(next);
  };

  const handleSelectAllFiltered = () => {
    if (selectedKeywords.size === filteredKeywords.length) {
      setSelectedKeywords(new Set());
    } else {
      setSelectedKeywords(new Set(filteredKeywords.map((k) => k.keyword)));
    }
  };

  const handleCopySelected = () => {
    if (selectedKeywords.size === 0) return;
    const text = Array.from(selectedKeywords).join(', ');
    navigator.clipboard.writeText(text);
    setCopiedKeyword('__SELECTED_ALL__');
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'viral':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'primary':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'secondary':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'long_tail':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'question':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getDifficultyColor = (difficulty: string, score: number) => {
    if (difficulty === 'Easy' || score <= 35) {
      return { text: 'text-emerald-400', bg: 'bg-emerald-500', label: 'Easy KD' };
    }
    if (difficulty === 'Medium' || score <= 65) {
      return { text: 'text-amber-400', bg: 'bg-amber-500', label: 'Med KD' };
    }
    return { text: 'text-rose-400', bg: 'bg-rose-500', label: 'Hard KD' };
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Top Filter Tabs Navigation */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Viral & SEO Keyword Engine
              <span className="text-xs font-normal text-slate-400">
                ({filteredKeywords.length} of {keywords.length} terms)
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Rank-tested search phrases, question intent, and virality triggers
            </p>
          </div>
        </div>

        {/* Bulk Action Controls */}
        {selectedKeywords.size > 0 && (
          <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/30 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-medium text-indigo-300">
              {selectedKeywords.size} selected
            </span>
            <button
              type="button"
              onClick={handleCopySelected}
              className="flex items-center gap-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1 rounded-md transition-colors"
            >
              {copiedKeyword === '__SELECTED_ALL__' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copiedKeyword === '__SELECTED_ALL__' ? 'Copied Selected!' : 'Copy Selected'}
            </button>
            <button
              type="button"
              onClick={() => setSelectedKeywords(new Set())}
              className="text-[11px] text-slate-400 hover:text-white"
            >
              Deselect
            </button>
          </div>
        )}
      </div>

      {/* Category Pills Bar */}
      <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'all'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          All Terms ({counts.all})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('viral')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
            activeTab === 'viral'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Flame className="w-3 h-3 text-amber-300" />
          Viral Magnets ({counts.viral})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('primary')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
            activeTab === 'primary'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Zap className="w-3 h-3 text-emerald-300" />
          Primary Target ({counts.primary})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('secondary')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'secondary'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Secondary LSI ({counts.secondary})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('long_tail')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'long_tail'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Long-Tail ({counts.long_tail})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('question')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
            activeTab === 'question'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-3 h-3 text-purple-300" />
          Questions & PAA ({counts.question})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('easy_wins')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
            activeTab === 'easy_wins'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-3 h-3 text-teal-300" />
          Easy KD Wins ({counts.easy_wins})
        </button>
      </div>

      {/* Search and Sort Sub-Bar */}
      <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords, triggers..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-900 text-xs text-slate-200 rounded-md px-2 py-1 border border-slate-800 focus:outline-none"
            >
              <option value="viral_desc">🔥 Virality Potential (High → Low)</option>
              <option value="difficulty_asc">⚡ SEO Difficulty (Easy → Hard)</option>
              <option value="volume_desc">📈 Search Volume (High → Low)</option>
              <option value="frequency_desc">📝 Article Mentions (High → Low)</option>
            </select>
          </div>

          {/* Select all check */}
          <button
            type="button"
            onClick={handleSelectAllFiltered}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-slate-800"
            title="Select all currently filtered keywords"
          >
            {selectedKeywords.size === filteredKeywords.length && filteredKeywords.length > 0 ? (
              <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span className="hidden sm:inline">Select All</span>
          </button>
        </div>
      </div>

      {/* Keywords Table List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/80">
              <th className="py-3 px-4 w-10 text-center">#</th>
              <th className="py-3 px-4">Keyword / Search Query</th>
              <th className="py-3 px-3">Type & Intent</th>
              <th className="py-3 px-3 text-center">Viral Score</th>
              <th className="py-3 px-3">SEO Difficulty</th>
              <th className="py-3 px-3">Search Volume</th>
              <th className="py-3 px-3">In Article</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {filteredKeywords.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  No keywords match your selected filters. Try switching tabs or clearing your search.
                </td>
              </tr>
            ) : (
              filteredKeywords.map((item, idx) => {
                const diff = getDifficultyColor(item.difficulty, item.difficultyScore);
                const isSelected = selectedKeywords.has(item.keyword);
                const isCopied = copiedKeyword === item.keyword;

                return (
                  <tr
                    key={item.keyword + idx}
                    className={`hover:bg-slate-800/40 transition-colors group ${
                      isSelected ? 'bg-indigo-950/20' : ''
                    }`}
                  >
                    {/* Checkbox / Row Number */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleSelect(item.keyword)}
                        className="text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                        ) : (
                          <span className="text-[11px] text-slate-500 group-hover:hidden">
                            {idx + 1}
                          </span>
                        )}
                        {!isSelected && (
                          <Square className="w-3.5 h-3.5 text-slate-600 hidden group-hover:inline-block" />
                        )}
                      </button>
                    </td>

                    {/* Keyword Phrase & Placement Advice */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-sm hover:text-amber-300 transition-colors">
                          {item.keyword}
                        </span>
                        {item.viralTrigger && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20">
                            {item.viralTrigger}
                          </span>
                        )}
                      </div>
                      {item.placementSuggestion && (
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5 text-slate-500" />
                          <span>Tip: {item.placementSuggestion}</span>
                        </p>
                      )}
                    </td>

                    {/* Type & Intent */}
                    <td className="py-3.5 px-3">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getTypeBadgeStyle(
                            item.type
                          )}`}
                        >
                          {item.type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.searchIntent}
                        </span>
                      </div>
                    </td>

                    {/* Viral Potential Score */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <div className="flex items-center gap-1 font-extrabold text-sm text-amber-400">
                          <Flame className="w-3.5 h-3.5" />
                          <span>{item.viralScore}</span>
                        </div>
                        <span className="text-[9px] text-slate-500">/100 viral</span>
                      </div>
                    </td>

                    {/* SEO KD Difficulty */}
                    <td className="py-3.5 px-3">
                      <div className="w-24">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className={`font-bold ${diff.text}`}>{item.difficulty}</span>
                          <span className="text-[10px] text-slate-500">{item.difficultyScore}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${diff.bg}`}
                            style={{ width: `${item.difficultyScore}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Volume */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60">
                        {item.estimatedVolume}
                      </span>
                    </td>

                    {/* Frequency in Article */}
                    <td className="py-3.5 px-3">
                      {item.frequencyInArticle > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <Check className="w-3 h-3" /> {item.frequencyInArticle}x
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20" title="Untapped opportunity: add this term into your article!">
                          <Sparkles className="w-2.5 h-2.5" /> 0x (Gap!)
                        </span>
                      )}
                    </td>

                    {/* Copy Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleCopySingle(item.keyword)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
                        title="Copy keyword"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
