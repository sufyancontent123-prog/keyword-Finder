import React, { useState } from 'react';
import { Flame, Target, Share2, Copy, Download, Check, Compass, Users, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { AnalysisResult } from '../types';

interface OverviewCardsProps {
  result: AnalysisResult;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ result }) => {
  const { overview, keywords } = result;
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2200);
  };

  const handleCopyCommaSeparated = () => {
    const list = keywords.map((k) => k.keyword).join(', ');
    copyToClipboard(list, 'comma');
  };

  const handleCopyCSV = () => {
    const header = 'Keyword,Type,Search Intent,Viral Score,Difficulty,Volume,Trigger,In-Article Count\n';
    const rows = keywords
      .map(
        (k) =>
          `"${k.keyword.replace(/"/g, '""')}","${k.type}","${k.searchIntent}",${k.viralScore},"${k.difficulty}","${k.estimatedVolume}","${k.viralTrigger || ''}",${k.frequencyInArticle}`
      )
      .join('\n');
    copyToClipboard(header + rows, 'csv');
  };

  const handleDownloadMarkdown = () => {
    const md = `# SEO & Viral Keyword Intelligence Report
**Analyzed Topic:** ${overview.primaryTopic}
**Target Audience:** ${overview.targetAudience}
**Virality Potential Score:** ${overview.viralityScore}/100
**SEO Readiness Score:** ${overview.seoReadinessScore}/100

---
### Strategic Executive Summary
${overview.executiveSummary}

---
### Extracted High-Intent & Viral Keywords (${keywords.length})
| Keyword | Type | Search Intent | Viral Score | KD (Difficulty) | Est. Search Volume |
|---|---|---|---|---|---|
${keywords.map((k) => `| ${k.keyword} | ${k.type} | ${k.searchIntent} | ${k.viralScore}/100 | ${k.difficulty} (${k.difficultyScore}%) | ${k.estimatedVolume} |`).join('\n')}

---
### Recommended SEO Titles
${result.seoTitles.map((t, i) => `${i + 1}. **${t.title}** (${t.characterCount} chars) - Formula: ${t.formula}`).join('\n')}

---
### Recommended Meta Descriptions
${result.metaDescriptions.map((m, i) => `${i + 1}. ${m.description} (${m.characterCount} chars)`).join('\n\n')}

---
### Viral Hooks & Distribution
${result.topViralHooks.map((h, i) => `${i + 1}. [${h.platform}] "${h.hook}" (Viral Power: ${h.viralPower}/100)\n   Why it works: ${h.whyItWorks}`).join('\n\n')}

---
### Content Gaps to Outrank Competitors
${result.contentGapsAndOpportunities.map((g, i) => `${i + 1}. **${g.title}** [${g.impact} Impact]: ${g.actionableTip}`).join('\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SEO-Keywords-${overview.primaryTopic.replace(/\s+/g, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Color logic for scores
  const getViralBadge = (score: number) => {
    if (score >= 80) return { label: 'Viral Explosive Magnet', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' };
    if (score >= 60) return { label: 'High Social Engagement', color: 'text-rose-400 bg-rose-400/10 border-rose-400/20' };
    return { label: 'Moderate Virality', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' };
  };

  const getSeoBadge = (score: number) => {
    if (score >= 80) return { label: 'Page #1 Search Ready', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' };
    if (score >= 60) return { label: 'Strong Organic Potential', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' };
    return { label: 'Needs Long-Tail Depth', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' };
  };

  const viralBadge = getViralBadge(overview.viralityScore);
  const seoBadge = getSeoBadge(overview.seoReadinessScore);

  return (
    <div className="space-y-4">
      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Virality Score */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-amber-500/20 rounded-2xl p-4 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" /> Virality Index
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${viralBadge.color}`}>
              {viralBadge.label}
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tight text-white">
              {overview.viralityScore}
            </span>
            <span className="text-sm font-semibold text-slate-500">/ 100</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-rose-500 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${overview.viralityScore}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Curiosity triggers & headline shareability score
          </p>
        </div>

        {/* Card 2: SEO Readiness */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-400" /> SEO Readiness
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${seoBadge.color}`}>
              {seoBadge.label}
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tight text-white">
              {overview.seoReadinessScore}
            </span>
            <span className="text-sm font-semibold text-slate-500">/ 100</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-400 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${overview.seoReadinessScore}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Algorithm discoverability & search intent match
          </p>
        </div>

        {/* Card 3: Identified Topic */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Compass className="w-4 h-4 text-indigo-400" /> Primary Search Niche
          </div>
          <div className="mt-2.5">
            <h3 className="text-base font-bold text-white line-clamp-1">
              {overview.primaryTopic}
            </h3>
            <p className="text-xs text-indigo-300/90 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-indigo-400" />
              {keywords.length} target keywords extracted
            </p>
          </div>
        </div>

        {/* Card 4: Target Audience Persona */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Users className="w-4 h-4 text-sky-400" /> Target Search Audience
          </div>
          <div className="mt-2.5">
            <h3 className="text-sm font-bold text-slate-200 line-clamp-2">
              {overview.targetAudience}
            </h3>
          </div>
        </div>
      </div>

      {/* Strategic Summary & Quick Export Toolbar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Executive Search Strategy
            </span>
            {result.engineUsed && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                <Zap className="w-2.5 h-2.5 text-amber-400" />
                <span>Engine: {result.engineUsed}</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {overview.executiveSummary}
          </p>
        </div>

        {/* Quick Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyCommaSeparated}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
            title="Copy as comma separated keywords for tags"
          >
            {copiedType === 'comma' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedType === 'comma' ? 'Copied Tags!' : 'Copy Tags'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
            title="Copy as CSV table for Excel / Google Sheets"
          >
            {copiedType === 'csv' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedType === 'csv' ? 'Copied CSV!' : 'Copy CSV'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            title="Download full comprehensive SEO and virality markdown report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report (.md)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
