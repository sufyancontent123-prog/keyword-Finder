import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Flame,
  Search,
  Eye,
  SlidersHorizontal,
  Lightbulb,
  FileText,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Share2,
  TrendingUp,
} from 'lucide-react';
import { Header } from './components/Header';
import { ArticleInput } from './components/ArticleInput';
import { OverviewCards } from './components/OverviewCards';
import { KeywordsTable } from './components/KeywordsTable';
import { ViralHooksAndSERP } from './components/ViralHooksAndSERP';
import { ArticleHighlighter } from './components/ArticleHighlighter';
import { ContentGapAudit } from './components/ContentGapAudit';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ExportModal } from './components/ExportModal';
import { SAMPLE_ARTICLES, SampleArticle } from './data/sampleArticles';
import { AnalysisResult, SavedAnalysis } from './types';

const STORAGE_KEY = 'rankviral_history_v1';

export default function App() {
  const [articleText, setArticleText] = useState<string>('');
  const [platform, setPlatform] = useState<string>('google');
  const [goal, setGoal] = useState<string>('balanced');
  const [engine, setEngine] = useState<string>('auto');
  const [groqConfigured, setGroqConfigured] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'keywords' | 'serp_titles' | 'heatmap' | 'gaps'>('keywords');
  const [history, setHistory] = useState<SavedAnalysis[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Check backend engine configuration
  useEffect(() => {
    fetch('/api/engine-status')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.groqConfigured === 'boolean') {
          setGroqConfigured(data.groqConfigured);
          if (data.groqConfigured) {
            setEngine('groq');
          }
        }
      })
      .catch(() => {
        // ignore network error
      });
  }, []);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (newAnalysis: AnalysisResult, text: string) => {
    const item: SavedAnalysis = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      articleTitleSnippet: text.slice(0, 60).replace(/\n/g, ' ') + '...',
      wordCount: newAnalysis.overview.wordCount,
      viralityScore: newAnalysis.overview.viralityScore,
      seoScore: newAnalysis.overview.seoReadinessScore,
      articleText: text,
      result: newAnalysis,
    };

    const updated = [item, ...history.filter((h) => h.id !== item.id)].slice(0, 15);
    setHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleDeleteHistory = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleSelectSample = (sample: SampleArticle) => {
    setArticleText(sample.content);
    setError(null);
  };

  const handleSelectSampleById = (id: string) => {
    const found = SAMPLE_ARTICLES.find((s) => s.id === id);
    if (found) {
      setArticleText(found.content);
      setError(null);
    }
  };

  const handleSelectHistoryItem = (item: SavedAnalysis) => {
    setArticleText(item.articleText);
    setResult(item.result);
    setError(null);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  // Loading animation step timer
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 1300);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const loadingSteps = [
    'Scanning article structure and latent semantics...',
    'Identifying viral curiosity triggers & psychological hooks...',
    'Extracting search-intent keywords & calculating KD difficulty...',
    'Generating high-CTR SEO titles & SERP snippets...',
    'Finalizing competitive content gap report...',
  ];

  // Perform Analysis
  const handleAnalyze = async () => {
    if (!articleText.trim()) {
      setError('Please provide an article to analyze.');
      return;
    }

    if (articleText.trim().split(/\s+/).length < 10) {
      setError('Your article is too brief. Please enter at least 10-15 words so we can extract meaningful SEO keywords.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleText,
          targetPlatform: platform,
          goal,
          engine,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract viral & SEO keywords.');
      }

      setResult(data);
      saveToHistory(data, articleText);

      // Scroll down to results smoothly
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'An unexpected error occurred while communicating with the analysis engine.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Header */}
      <Header
        platform={platform}
        setPlatform={setPlatform}
        goal={goal}
        setGoal={setGoal}
        engine={engine}
        setEngine={setEngine}
        groqConfigured={groqConfigured}
        onSelectSample={handleSelectSample}
        historyCount={history.length}
        onToggleHistory={() => setIsHistoryOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Groq notice banner if user selected Groq and it's not configured */}
        {engine === 'groq' && !groqConfigured && (
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200 flex items-center justify-between gap-3 max-w-4xl mx-auto shadow-md">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase">
                Groq Setup
              </span>
              <span>
                To use Groq with Llama-3.3 70B, configure your <code className="px-1 py-0.5 rounded bg-slate-900 border border-amber-500/30 text-amber-300 font-mono text-[11px]">GROQ_API_KEY</code> in the <strong>Settings &gt; Secrets</strong> panel. Google Gemini will serve as the automatic fallback if unavailable.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setEngine('auto')}
              className="px-2.5 py-1 rounded bg-slate-900 text-xs font-semibold text-slate-200 hover:text-white border border-slate-700 whitespace-nowrap cursor-pointer"
            >
              Switch to Auto
            </button>
          </div>
        )}
        {/* Hero Banner / Instructions */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 text-amber-300 border border-amber-500/20">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Search Engine Optimization & Virality Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Give Your Article, Get{' '}
            <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">
              Viral & SEO-Dominant Keywords
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Extract high-volume ranking search phrases, viral curiosity hooks, keyword difficulty scores, and snippet previews calibrated for Page 1 Google visibility.
          </p>
        </div>

        {/* Article Input Component */}
        <ArticleInput
          articleText={articleText}
          setArticleText={setArticleText}
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          onSelectSampleId={handleSelectSampleById}
        />

        {/* Error notification */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Analysis notice: </span>
              {error}
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-xs text-rose-300 hover:text-white underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading Progress State */}
        {isLoading && (
          <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-8 shadow-2xl text-center space-y-4 max-w-xl mx-auto">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-amber-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Flame className="w-6 h-6 text-rose-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                Engineering Viral & SEO Keywords
              </h3>
              <p className="text-xs text-indigo-300 animate-pulse font-mono">
                {loadingSteps[loadingStep] || loadingSteps[loadingSteps.length - 1]}
              </p>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center gap-1.5 pt-2">
              {loadingSteps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i <= loadingStep
                      ? 'w-6 bg-gradient-to-r from-amber-400 to-indigo-500'
                      : 'w-2 bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Analysis Results View */}
        {result && (
          <div ref={resultsRef} className="space-y-6 pt-4">
            {/* 1. Executive Scorecard & Topic Overview */}
            <OverviewCards result={result} />

            {/* 2. Interactive Results Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2 gap-3">
              <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('keywords')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
                    activeTab === 'keywords'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Flame className="w-4 h-4 text-amber-300" />
                  <span>Keyword Intelligence ({result.keywords.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('serp_titles')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
                    activeTab === 'serp_titles'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Search className="w-4 h-4 text-sky-300" />
                  <span>SERP Preview & Titles</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('heatmap')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
                    activeTab === 'heatmap'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Eye className="w-4 h-4 text-emerald-300" />
                  <span>In-Article Heatmap</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('gaps')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
                    activeTab === 'gaps'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Lightbulb className="w-4 h-4 text-amber-300" />
                  <span>Content Gaps & Density</span>
                </button>
              </div>

              <div className="text-xs text-slate-400">
                Identified Niche: <span className="text-white font-semibold">{result.overview.primaryTopic}</span>
              </div>
            </div>

            {/* Tab Views */}
            {activeTab === 'keywords' && <KeywordsTable keywords={result.keywords} />}

            {activeTab === 'serp_titles' && (
              <ViralHooksAndSERP
                seoTitles={result.seoTitles}
                metaDescriptions={result.metaDescriptions}
                viralHooks={result.topViralHooks}
                primaryTopic={result.overview.primaryTopic}
              />
            )}

            {activeTab === 'heatmap' && (
              <ArticleHighlighter
                articleText={articleText}
                keywords={result.keywords}
              />
            )}

            {activeTab === 'gaps' && (
              <ContentGapAudit
                contentGaps={result.contentGapsAndOpportunities}
                densityAudit={result.densityAudit}
              />
            )}
          </div>
        )}
      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={handleSelectHistoryItem}
        onDelete={handleDeleteHistory}
        onClearAll={handleClearAllHistory}
      />

      {/* Standalone Code Export Modal (HTML, CSS & JS) */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 mt-12 bg-slate-950/60 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">RankViral SEO Engine</span>
            <span>—</span>
            <span>Algorithmic Virality & Search Intent Analytics</span>
          </div>
          <div>
            Built with modern Google Gemini AI & 2026 SERP algorithm models
          </div>
        </div>
      </footer>
    </div>
  );
}
