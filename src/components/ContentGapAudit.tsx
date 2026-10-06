import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Lightbulb, TrendingUp, BarChart2, PlusCircle } from 'lucide-react';
import { ContentGap, DensityAudit } from '../types';

interface ContentGapAuditProps {
  contentGaps: ContentGap[];
  densityAudit: DensityAudit;
}

export const ContentGapAudit: React.FC<ContentGapAuditProps> = ({
  contentGaps,
  densityAudit,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Keyword Density & Stuffing Audit */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Algorithmic Keyword Density & Placement Audit
            </h3>
            <p className="text-xs text-slate-400">
              Protects against Google keyword stuffing penalties while maximizing semantic coverage
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Density status */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
              <span>Current Density Health</span>
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Healthy
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {densityAudit.currentDensityAssessment}
            </p>
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Target Benchmark:</span>
              <span className="font-mono text-indigo-300 font-semibold">
                {densityAudit.recommendedDensityRange}
              </span>
            </div>
          </div>

          {/* Underused Opportunity Terms */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-2">
              <PlusCircle className="w-3.5 h-3.5" /> High-Impact Terms to Weave In:
            </div>
            <p className="text-xs text-slate-400 mb-2">
              High search intent terms that have 0 or low occurrences in your draft:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {densityAudit.underusedHighImpactTerms && densityAudit.underusedHighImpactTerms.length > 0 ? (
                densityAudit.underusedHighImpactTerms.map((term, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20"
                  >
                    + {term}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">None detected — great coverage!</span>
              )}
            </div>

            {/* Overused terms warning if any */}
            {densityAudit.overusedTerms && densityAudit.overusedTerms.length > 0 && (
              <div className="mt-3 pt-2 border-t border-slate-800/60">
                <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Overused (watch out):
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {densityAudit.overusedTerms.map((term, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/20"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Competitor Content Gaps & Virality Boosters */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Lightbulb className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Competitor Search Gaps & Ranking Accelerators
            </h3>
            <p className="text-xs text-slate-400">
              Strategic additions needed to leapfrog competing articles on Google Page 1
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {contentGaps.map((gap, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-500 font-mono">
                    STRATEGY #{idx + 1}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      gap.impact === 'High'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}
                  >
                    {gap.impact} Impact
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-100 mb-2">
                  {gap.title}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {gap.actionableTip}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
