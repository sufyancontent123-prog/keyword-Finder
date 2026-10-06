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
const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'MY_GROQ_API_KEY') {
    return null;
  }
  return new Groq({ apiKey });
};

// Engine status endpoint
app.get('/api/engine-status', (_req, res) => {
  const groqKey = process.env.GROQ_API_KEY;
  const isGroqConfigured = Boolean(groqKey && groqKey !== 'MY_GROQ_API_KEY' && groqKey.trim().length > 5);
  res.json({
    groqConfigured: isGroqConfigured,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    recommendedEngine: isGroqConfigured ? 'groq' : 'gemini',
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
    const shouldTryGroq = engine === 'groq' || (engine === 'auto' && Boolean(groq));

    if (engine === 'groq' && !groq) {
      return res.status(400).json({
        error: 'GROQ_API_KEY is not configured in your server environment. Please set GROQ_API_KEY in the Secrets panel, or switch to the Google Gemini engine.',
      });
    }

    if (shouldTryGroq && groq) {
      try {
        console.log('Executing keyword extraction via Groq (llama-3.3-70b-versatile)...');
        const groqCompletion = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
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
          const parsedData = JSON.parse(groqText);
          parsedData.engineUsed = 'Groq (Llama-3.3 70B)';
          parsedData.overview.wordCount = words;
          parsedData.overview.readingTimeMinutes = readingTime;
          return res.json(parsedData);
        }
      } catch (groqErr: any) {
        console.error('Groq execution failed:', groqErr?.message || groqErr);
        if (engine === 'groq') {
          return res.status(500).json({
            error: `Groq API Error: ${groqErr?.message || 'Failed to analyze with Groq'}. Please check your GROQ_API_KEY.`,
          });
        }
        console.log('Falling back from Groq to Gemini engine...');
      }
    }

    // 2. Execute via Gemini if Groq is not used or fell back
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Neither Groq nor Gemini API key is configured on the server.',
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

    const parsedData = JSON.parse(responseText);

    parsedData.engineUsed = 'Google Gemini';
    // Augment with word count and reading time
    parsedData.overview.wordCount = words;
    parsedData.overview.readingTimeMinutes = readingTime;

    return res.json(parsedData);
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
