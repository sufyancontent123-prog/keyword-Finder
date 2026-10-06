import React, { useState } from 'react';
import {
  Globe,
  Smartphone,
  Monitor,
  Flame,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Share2,
  ChevronRight,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { SeoTitle, MetaDescription, ViralHook } from '../types';

interface ViralHooksAndSERPProps {
  seoTitles: SeoTitle[];
  metaDescriptions: MetaDescription[];
  viralHooks: ViralHook[];
  primaryTopic: string;
}

export const ViralHooksAndSERP: React.FC<ViralHooksAndSERPProps> = ({
  seoTitles,
  metaDescriptions,
  viralHooks,
  primaryTopic,
}) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedTitleIdx, setSelectedTitleIdx] = useState(0);
  const [selectedMetaIdx, setSelectedMetaIdx] = useState(0);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const activeTitle = seoTitles[selectedTitleIdx] || seoTitles[0] || {
    title: 'How to Rank Higher with Viral SEO in 2026',
    characterCount: 45,
  };
  const activeMeta = metaDescriptions[selectedMetaIdx] || metaDescriptions[0] || {
    description: 'Discover the ultimate viral keywords and SEO strategies to dominate Google search results and attract massive audience engagement.',
    characterCount: 142,
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const slug = primaryTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return (
    <div className="space-y-6">
      {/* 1. Google SERP Simulator */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Live Google SERP Simulator
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Snippet Optimized
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Preview how your article will look on Page 1 search results
              </p>
            </div>
          </div>

          {/* Device switch */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setDeviceMode('desktop')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                deviceMode === 'desktop'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop SERP</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode('mobile')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                deviceMode === 'mobile'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile SERP</span>
            </button>
          </div>
        </div>

        {/* The Google SERP Result Card (Google styling) */}
        <div className="mt-4 p-5 rounded-xl bg-[#202124] border border-slate-700/60 font-sans shadow-inner">
          <div className={deviceMode === 'mobile' ? 'max-w-md mx-auto bg-[#171717] p-4 rounded-xl border border-slate-800' : ''}>
            {/* SERP URL header */}
            <div className="flex items-center gap-2 text-xs text-[#bdc1c6] mb-1">
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[11px] text-white font-bold">
                W
              </div>
              <div>
                <div className="text-xs text-[#dadce0] font-medium leading-none">YourDomain.com</div>
                <div className="text-[11px] text-[#9aa0a6] leading-none mt-0.5">
                  https://yourdomain.com › blog › <span className="text-[#8ab4f8]">{slug}</span>
                </div>
              </div>
            </div>

            {/* Google Blue Link Heading */}
            <h4 className="text-[#8ab4f8] hover:underline cursor-pointer text-base sm:text-lg font-normal leading-snug mt-1">
              {activeTitle.title}
            </h4>

            {/* Snippet Description */}
            <p className="text-xs sm:text-sm text-[#bdc1c6] mt-1.5 leading-relaxed font-sans">
              <span className="text-[#9aa0a6]">Oct 5, 2026 — </span>
              {activeMeta.description}
            </p>

            {/* Rich snippet badges */}
            <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-slate-700/40 text-[11px] text-[#9aa0a6]">
              <span className="text-amber-400">★★★★★ 4.9 (128 reviews)</span>
              <span>• Free Guide</span>
              <span>• 7 min read</span>
            </div>
          </div>
        </div>

        {/* Title Selector Selector Pills */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Select Title Variant:</span>
            <div className="flex items-center gap-1">
              {seoTitles.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedTitleIdx(i)}
                  className={`w-6 h-6 rounded-md text-xs font-bold transition-all ${
                    selectedTitleIdx === i
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Select Meta Variant:</span>
            <div className="flex items-center gap-1">
              {metaDescriptions.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedMetaIdx(i)}
                  className={`w-6 h-6 rounded-md text-xs font-bold transition-all ${
                    selectedMetaIdx === i
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. High-Converting SEO Titles List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              High-CTR Viral SEO Titles & Meta Headlines
            </h3>
            <p className="text-xs text-slate-400">
              Formulated for maximum search engine click-throughs and curiosity
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {seoTitles.map((item, idx) => {
            const isOptimalLength = item.characterCount <= 60;
            const isCopied = copiedItem === `title-${idx}`;

            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-sm group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span
                      className={`px-1.5 py-0.5 rounded font-mono font-medium ${
                        isOptimalLength
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {item.characterCount} chars {isOptimalLength ? '✓ optimal' : '(near limit)'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      CTR: {item.clickThroughPotential}
                    </span>
                    <span className="text-slate-400">
                      Formula: <span className="text-indigo-300">{item.formula}</span>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(item.title, `title-${idx}`)}
                  className="self-end sm:self-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy Title'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Viral Social & Algorithmic Hooks */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Viral Distribution Hooks & Scroll-Stoppers
            </h3>
            <p className="text-xs text-slate-400">
              High-converting hooks for Twitter/X threads, TikTok/Reels, LinkedIn, and newsletters
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {viralHooks.map((hook, idx) => {
            const isCopied = copiedItem === `hook-${idx}`;

            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {hook.platform}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-extrabold text-amber-400">
                      <Flame className="w-3.5 h-3.5" />
                      {hook.viralPower}/100 power
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-100 leading-snug">
                    "{hook.hook}"
                  </p>

                  <p className="text-xs text-slate-400 mt-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 font-semibold">Why it works:</span>{' '}
                    {hook.whyItWorks}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleCopy(hook.hook, `hook-${idx}`)}
                    className="flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied ? 'Copied' : 'Copy Hook'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Meta Descriptions */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Search Engine Meta Descriptions
            </h3>
            <p className="text-xs text-slate-400">
              Optimized for 145-160 characters to prevent Google truncation
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {metaDescriptions.map((meta, idx) => {
            const isCopied = copiedItem === `meta-${idx}`;
            const isGoodLength = meta.characterCount >= 130 && meta.characterCount <= 165;

            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-2xl">
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                    {meta.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span
                      className={`px-1.5 py-0.5 rounded font-mono font-medium ${
                        isGoodLength
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {meta.characterCount} characters {isGoodLength ? '✓ ideal' : ''}
                    </span>
                    {meta.includedKeywords && meta.includedKeywords.length > 0 && (
                      <span className="text-slate-400">
                        Keywords: {meta.includedKeywords.join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(meta.description, `meta-${idx}`)}
                  className="self-end sm:self-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy Meta'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
