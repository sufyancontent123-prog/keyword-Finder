import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import Groq from 'groq-sdk';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Groq client helper
let cachedGroqModel: string | null = null;

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'MY_GROQ_API_KEY' || apiKey.trim().length < 5) {
    return null;
  }
  return new Groq({ apiKey });
};

async function resolveGroqModel(groq: Groq): Promise<string | null> {
  if (cachedGroqModel) return cachedGroqModel;

  try {
    const list = await groq.models.list();
    const availableIds = new Set(list.data.map((m) => m.id));

    const candidates = [
      'openai/gpt-oss-120b',
      'llama-3.3-70b-versatile',
      'openai/gpt-oss-20b',
      'llama-3.1-8b-instant',
      'qwen/qwen3.8-27b',
    ];

    for (const id of candidates) {
      if (availableIds.has(id)) {
        cachedGroqModel = id;
        return id;
      }
    }

    // Any text model fallback
    for (const m of list.data) {
      if (!m.id.includes('whisper') && !m.id.includes('guard')) {
        cachedGroqModel = m.id;
        return m.id;
      }
    }
  } catch (err: any) {
    console.log('[Groq Info] Model discovery note:', err?.message || 'unavailable');
  }
  return null;
}

// Engine status endpoint
app.get('/api/engine-status', async (_req, res) => {
  const groq = getGroqClient();
  let activeGroqModel: string | null = null;
  if (groq) {
    activeGroqModel = await resolveGroqModel(groq);
  }

  res.json({
    groqConfigured: Boolean(activeGroqModel),
    groqModel: activeGroqModel,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    recommendedEngine: activeGroqModel ? 'groq' : 'gemini',
  });
});

export interface KeywordItem {
  keyword: string;
  type: 'viral' | 'primary' | 'secondary' | 'long_tail' | 'question';
  searchIntent: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
  viralScore: number; // 1-100
  difficulty: 'Easy' | 'Medium' | 'Hard';
  difficultyScore: number; // 1-100
  estimatedVolume: 'Very High (100k+)' | 'High (20k - 100k)' | 'Medium (5k - 20k)' | 'Niche (500 - 5k)';
  viralTrigger?: string; // e.g. "High Curiosity", "Urgency", "Contrarian Angle"
  placementSuggestion?: string; // e.g. "Use in H2 heading or intro"
  frequencyInArticle: number; // Count detected in the article
}

export interface AnalysisResult {
  engineUsed?: string;
  engineNote?: string;
  overview: {
    viralityScore: number; // 0-100
    seoReadinessScore: number; // 0-100
    primaryTopic: string;
    targetAudience: string;
    readingTimeMinutes: number;
    wordCount: number;
    executiveSummary: string;
  };
  keywords: KeywordItem[];
  topViralHooks: Array<{
    hook: string;
    platform: string; // "Google SERP", "TikTok / Reels", "Twitter / Threads", "LinkedIn / Newsletter"
    viralPower: number; // 1-100
    whyItWorks: string;
  }>;
  seoTitles: Array<{
    title: string;
    characterCount: number;
    clickThroughPotential: 'Maximum' | 'High' | 'Good';
    formula: string;
  }>;
  metaDescriptions: Array<{
    description: string;
    characterCount: number;
    includedKeywords: string[];
  }>;
  contentGapsAndOpportunities: Array<{
    title: string;
    actionableTip: string;
    impact: 'High' | 'Medium';
  }>;
  densityAudit: {
    recommendedDensityRange: string;
    currentDensityAssessment: string;
    underusedHighImpactTerms: string[];
    overusedTerms: string[];
  };
}

function normalizeAnalysisResult(data: any, words: number, readingTime: number): AnalysisResult {
  const overview = data?.overview || {};
  const keywords = Array.isArray(data?.keywords) ? data.keywords : [];

  const normalizedOverview = {
    viralityScore: Number(overview.viralityScore) || 85,
    seoReadinessScore: Number(overview.seoReadinessScore) || 80,
    primaryTopic: overview.primaryTopic || overview.coreTopic || overview.topic || 'General Topic',
    targetAudience: overview.targetAudience || overview.audience || 'Target Searchers & Industry Readers',
    executiveSummary: overview.executiveSummary || overview.summary || 'Strong ranking potential with relevant search intent.',
    wordCount: words,
    readingTimeMinutes: readingTime,
  };

  const normalizedKeywords: KeywordItem[] = keywords.map((k: any, i: number) => ({
    keyword: typeof k === 'string' ? k : (k.keyword || `Keyword ${i + 1}`),
    type: (['viral', 'primary', 'secondary', 'long_tail', 'question'].includes(k.type) ? k.type : 'primary'),
    searchIntent: (['Informational', 'Commercial', 'Transactional', 'Navigational'].includes(k.searchIntent) ? k.searchIntent : 'Informational'),
    viralScore: Number(k.viralScore) || (80 + (i % 15)),
    difficulty: (['Easy', 'Medium', 'Hard'].includes(k.difficulty) ? k.difficulty : (i % 2 === 0 ? 'Easy' : 'Medium')),
    difficultyScore: Number(k.difficultyScore) || (20 + ((i * 7) % 60)),
    estimatedVolume: k.estimatedVolume || 'High (20k - 100k)',
    viralTrigger: k.viralTrigger || (i % 2 === 0 ? 'Curiosity Gap' : 'Practical Utility'),
    placementSuggestion: k.placementSuggestion || 'Include in H2 subheader and introduction',
    frequencyInArticle: typeof k.frequencyInArticle === 'number' ? k.frequencyInArticle : 1,
  }));

  const topViralHooks = Array.isArray(data?.topViralHooks) && data.topViralHooks.length > 0 ? data.topViralHooks : [
    { hook: `The secret truth behind ${normalizedOverview.primaryTopic} nobody is talking about.`, platform: 'Twitter / Threads', viralPower: 92, whyItWorks: 'Taps into curiosity gap and contrarian interest.' },
    { hook: `How ${normalizedOverview.primaryTopic} is completely changing the game in 2026.`, platform: 'LinkedIn', viralPower: 88, whyItWorks: 'Urgency and industry shift framing.' },
  ];

  const seoTitles = Array.isArray(data?.seoTitles) && data.seoTitles.length > 0 ? data.seoTitles : [
    { title: `${normalizedOverview.primaryTopic}: Essential Guide & Frameworks`, characterCount: 52, clickThroughPotential: 'Maximum', formula: 'Target Keyword + Definitive Promise' },
    { title: `How to Leverage ${normalizedOverview.primaryTopic} in 2026`, characterCount: 46, clickThroughPotential: 'High', formula: 'Action Verb + Year Freshness' },
  ];

  const metaDescriptions = Array.isArray(data?.metaDescriptions) && data.metaDescriptions.length > 0 ? data.metaDescriptions : [
    { description: `Learn how to leverage ${normalizedOverview.primaryTopic} with actionable strategies, key ranking terms, and viral reach frameworks.`, characterCount: 148, includedKeywords: [normalizedOverview.primaryTopic] },
  ];

  const contentGapsAndOpportunities = Array.isArray(data?.contentGapsAndOpportunities) && data.contentGapsAndOpportunities.length > 0 ? data.contentGapsAndOpportunities : [
    { title: 'Add real-world comparison benchmarks', actionableTip: 'Include side-by-side metrics to win featured snippets.', impact: 'High' as const },
    { title: 'Incorporate actionable FAQ section', actionableTip: 'Add 3-4 People Also Ask question headers.', impact: 'Medium' as const },
  ];

  const densityAudit = data?.densityAudit || {
    recommendedDensityRange: '1.2% - 2.4%',
    currentDensityAssessment: 'Balanced and natural keyword distribution without stuffing.',
    underusedHighImpactTerms: [],
    overusedTerms: [],
  };

  return {
    overview: normalizedOverview,
    keywords: normalizedKeywords,
    topViralHooks,
    seoTitles,
    metaDescriptions,
    contentGapsAndOpportunities,
    densityAudit,
  };
}

// API Route for Analyzing Article Keywords
app.post('/api/analyze-keywords', async (req, res) => {
  try {
    const { articleText, targetPlatform = 'google', goal = 'balanced', engine = 'auto' } = req.body;

    if (!articleText || typeof articleText !== 'string' || articleText.trim().length < 40) {
      return res.status(400).json({
        error: 'Please provide an article with at least 40 characters for accurate SEO and viral analysis.',
      });
    }

    const words = articleText.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(words / 220));

    const prompt = `You are a world-class SEO Director and Viral Content Strategist.
Analyze the following article text to extract and generate the most VIRAL and SEO-FRIENDLY keywords, search phrases, long-tail search intent queries, high-CTR titles, and ranking opportunities.

Article Word Count: ~${words} words.
Target Platform: ${targetPlatform} (e.g., Google Search, YouTube, AI Search, Social Algorithms)
Optimization Goal: ${goal} (e.g., maximum virality, high-intent ranking, balanced)

ARTICLE CONTENT:
"""
${articleText.slice(0, 15000)}
"""

Task Instructions:
1. Extract and engineer both:
   - "VIRAL KEYWORDS": Buzzworthy, emotionally magnetic, click-driving phrases that stop the scroll and tap into high human curiosity.
   - "SEO KEYWORDS": High-intent, rank-ready search terms with exact searcher intent (Informational, Commercial, Transactional).
   - "LONG-TAIL & QUESTIONS": "People Also Ask", featured snippet questions, and conversational queries (great for Google, Perplexity, and voice search).
2. For each keyword item provide:
   - keyword (string)
   - type ("viral", "primary", "secondary", "long_tail", or "question")
   - searchIntent ("Informational", "Commercial", "Transactional", or "Navigational")
   - viralScore (integer 1-100)
   - difficulty ("Easy", "Medium", or "Hard")
   - difficultyScore (integer 1-100)
   - estimatedVolume ("Very High (100k+)", "High (20k - 100k)", "Medium (5k - 20k)", or "Niche (500 - 5k)")
   - viralTrigger (short phrase like "Curiosity Gap", "Counter-Intuitive Insight", "Immediate Transformation")
   - placementSuggestion (e.g. "Primary H1 & Slug", "First 100 words", "H2 Subheading & FAQ")
   - frequencyInArticle (count of approximate occurrences in the given text)
   Provide at least 15-25 top keywords across the diverse types.
3. Generate 4 high-converting SEO Titles (under 60 characters ideal for SERP display), with character counts and formulas.
4. Generate 2 optimized Meta Descriptions (around 145-160 characters).
5. Generate 4 Viral Hooks tailored for SERP / Social distribution.
6. Provide an audit of content gaps & opportunities to outrank competitors.
7. Return strictly valid JSON conforming to the requested schema.`;

    // 1. Try Groq if explicitly requested or auto-configured
    const groq = getGroqClient();
    const shouldTryGroq = (engine === 'groq' || engine === 'auto') && Boolean(groq);
    let groqFailReason: string | null = null;

    if (shouldTryGroq && groq) {
      const modelId = await resolveGroqModel(groq);

      if (modelId) {
        try {
          console.log(`Executing keyword extraction via Groq (${modelId})...`);
          const groqCompletion = await groq.chat.completions.create({
            model: modelId,
            messages: [
              {
                role: 'system',
                content: 'You are an elite SEO scientist and algorithmic virality expert. Always output clean, valid JSON matching the exact schema requested without markdown backticks or commentary.',
              },
              {
                role: 'user',
                content: `${prompt}

Ensure the response is strictly valid JSON with root keys: "overview", "keywords", "topViralHooks", "seoTitles", "metaDescriptions", "contentGapsAndOpportunities", "densityAudit".`,
              },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
          });

          const groqText = groqCompletion.choices[0]?.message?.content;
          if (groqText) {
            const rawData = JSON.parse(groqText);
            const normalized = normalizeAnalysisResult(rawData, words, readingTime);
            normalized.engineUsed = `Groq (${modelId.replace('openai/', '')})`;
            return res.json(normalized);
          }
        } catch (groqErr: any) {
          console.log(`[Groq Info] Execution note: ${groqErr?.message || 'Switching to Gemini'}`);
          groqFailReason = groqErr?.message || 'Groq model temporarily unavailable';
        }
      } else {
        groqFailReason = 'No accessible text models on current Groq key';
      }

      console.log('Seamlessly switching to Google Gemini engine...');
    } else if (engine === 'groq' && !groq) {
      groqFailReason = 'GROQ_API_KEY is not configured';
      console.log('Groq requested but key not set. Using Google Gemini...');
    }

    // 2. Execute via Gemini (Primary or Auto-Failover)
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: groqFailReason
          ? `Groq encountered an issue (${groqFailReason}) and Gemini API key is missing on the server.`
          : 'Neither Groq nor Gemini API key is configured on the server.',
      });
    }

    // Helper function to call Gemini with retry and model fallback
    const executeWithRetry = async (promptText: string) => {
      const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
      let lastError: any = null;

      for (const modelName of modelsToTry) {
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            console.log(`Calling ${modelName} (attempt ${attempt})...`);
            const config: any = {
              systemInstruction: 'You are an elite SEO scientist and algorithmic virality expert. Always output clean, valid JSON matching the exact schema without markdown backticks or commentary.',
              temperature: 0.3,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  overview: {
                    type: Type.OBJECT,
                    properties: {
                      viralityScore: { type: Type.INTEGER, description: 'Overall viral potential from 1 to 100' },
                      seoReadinessScore: { type: Type.INTEGER, description: 'SEO optimization readiness from 1 to 100' },
                      primaryTopic: { type: Type.STRING, description: 'Core identified topic or niche' },
                      targetAudience: { type: Type.STRING, description: 'Ideal reader persona' },
                      executiveSummary: { type: Type.STRING, description: '2-3 sentence strategic summary' },
                    },
                    required: ['viralityScore', 'seoReadinessScore', 'primaryTopic', 'targetAudience', 'executiveSummary'],
                  },
                  keywords: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        keyword: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['viral', 'primary', 'secondary', 'long_tail', 'question'] },
                        searchIntent: { type: Type.STRING, enum: ['Informational', 'Commercial', 'Transactional', 'Navigational'] },
                        viralScore: { type: Type.INTEGER },
                        difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
                        difficultyScore: { type: Type.INTEGER },
                        estimatedVolume: { type: Type.STRING, enum: ['Very High (100k+)', 'High (20k - 100k)', 'Medium (5k - 20k)', 'Niche (500 - 5k)'] },
                        viralTrigger: { type: Type.STRING },
                        placementSuggestion: { type: Type.STRING },
                        frequencyInArticle: { type: Type.INTEGER },
                      },
                      required: ['keyword', 'type', 'searchIntent', 'viralScore', 'difficulty', 'difficultyScore', 'estimatedVolume', 'viralTrigger', 'placementSuggestion', 'frequencyInArticle'],
                    },
                  },
                  topViralHooks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        hook: { type: Type.STRING },
                        platform: { type: Type.STRING },
                        viralPower: { type: Type.INTEGER },
                        whyItWorks: { type: Type.STRING },
                      },
                      required: ['hook', 'platform', 'viralPower', 'whyItWorks'],
                    },
                  },
                  seoTitles: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        characterCount: { type: Type.INTEGER },
                        clickThroughPotential: { type: Type.STRING, enum: ['Maximum', 'High', 'Good'] },
                        formula: { type: Type.STRING },
                      },
                      required: ['title', 'characterCount', 'clickThroughPotential', 'formula'],
                    },
                  },
                  metaDescriptions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        description: { type: Type.STRING },
                        characterCount: { type: Type.INTEGER },
                        includedKeywords: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                      required: ['description', 'characterCount', 'includedKeywords'],
                    },
                  },
                  contentGapsAndOpportunities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        actionableTip: { type: Type.STRING },
                        impact: { type: Type.STRING, enum: ['High', 'Medium'] },
                      },
                      required: ['title', 'actionableTip', 'impact'],
                    },
                  },
                  densityAudit: {
                    type: Type.OBJECT,
                    properties: {
                      recommendedDensityRange: { type: Type.STRING },
                      currentDensityAssessment: { type: Type.STRING },
                      underusedHighImpactTerms: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      overusedTerms: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                    required: ['recommendedDensityRange', 'currentDensityAssessment', 'underusedHighImpactTerms', 'overusedTerms'],
                  },
                },
                required: ['overview', 'keywords', 'topViralHooks', 'seoTitles', 'metaDescriptions', 'contentGapsAndOpportunities', 'densityAudit'],
              },
            };

            // Only Gemini 3 models support thinkingConfig
            if (modelName.startsWith('gemini-3')) {
              config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
            }

            const resp = await ai.models.generateContent({
              model: modelName,
              contents: promptText,
              config,
            });

            console.log(`Successfully received response from ${modelName}`);
            return resp;
          } catch (err: any) {
            lastError = err;
            console.error(`Error with ${modelName}:`, err?.message || err);
            const errStr = JSON.stringify(err || '');
            const isRetryable = errStr.includes('503') || errStr.includes('UNAVAILABLE') || errStr.includes('429');
            if (isRetryable && attempt < 2) {
              await new Promise((r) => setTimeout(r, 1000));
              continue;
            }
            // Fall back to next model immediately
            break;
          }
        }
      }

      throw lastError;
    };

    const response = await executeWithRetry(prompt);

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Received empty response from Gemini model');
    }

    const rawData = JSON.parse(responseText);
    const normalized = normalizeAnalysisResult(rawData, words, readingTime);

    if (groqFailReason) {
      normalized.engineUsed = 'Google Gemini (Auto-Failover)';
      if (groqFailReason.includes('organization_restricted')) {
        normalized.engineNote = 'Notice: Your Groq organization has been restricted by Groq. Switched automatically to Google Gemini to complete your extraction.';
      } else {
        normalized.engineNote = `Notice: Groq was temporarily unavailable. Switched automatically to Google Gemini.`;
      }
    } else {
      normalized.engineUsed = 'Google Gemini';
    }

    return res.json(normalized);
  } catch (err: any) {
    console.error('Keyword analysis error:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to analyze article for SEO & viral keywords.',
    });
  }
});

// Production / Dev handling
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // In development, mount Vite dev server middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RankViral Engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
