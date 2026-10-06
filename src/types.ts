export interface KeywordItem {
  keyword: string;
  type: 'viral' | 'primary' | 'secondary' | 'long_tail' | 'question';
  searchIntent: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
  viralScore: number; // 1-100
  difficulty: 'Easy' | 'Medium' | 'Hard';
  difficultyScore: number; // 1-100
  estimatedVolume: 'Very High (100k+)' | 'High (20k - 100k)' | 'Medium (5k - 20k)' | 'Niche (500 - 5k)';
  viralTrigger?: string;
  placementSuggestion?: string;
  frequencyInArticle: number;
}

export interface AnalysisOverview {
  viralityScore: number;
  seoReadinessScore: number;
  primaryTopic: string;
  targetAudience: string;
  readingTimeMinutes: number;
  wordCount: number;
  executiveSummary: string;
}

export interface ViralHook {
  hook: string;
  platform: string;
  viralPower: number;
  whyItWorks: string;
}

export interface SeoTitle {
  title: string;
  characterCount: number;
  clickThroughPotential: 'Maximum' | 'High' | 'Good';
  formula: string;
}

export interface MetaDescription {
  description: string;
  characterCount: number;
  includedKeywords: string[];
}

export interface ContentGap {
  title: string;
  actionableTip: string;
  impact: 'High' | 'Medium';
}

export interface DensityAudit {
  recommendedDensityRange: string;
  currentDensityAssessment: string;
  underusedHighImpactTerms: string[];
  overusedTerms: string[];
}

export interface AnalysisResult {
  engineUsed?: string;
  engineNote?: string;
  overview: AnalysisOverview;
  keywords: KeywordItem[];
  topViralHooks: ViralHook[];
  seoTitles: SeoTitle[];
  metaDescriptions: MetaDescription[];
  contentGapsAndOpportunities: ContentGap[];
  densityAudit: DensityAudit;
}

export interface SavedAnalysis {
  id: string;
  timestamp: number;
  articleTitleSnippet: string;
  wordCount: number;
  viralityScore: number;
  seoScore: number;
  articleText: string;
  result: AnalysisResult;
}
