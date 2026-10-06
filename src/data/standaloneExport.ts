export const STANDALONE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RankViral - SEO & Viral Keyword Intelligence Engine</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body class="bg-[#090d16] text-slate-100 min-h-screen font-sans selection:bg-indigo-500/30 selection:text-indigo-200">

  <!-- Header -->
  <header class="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 shadow-lg text-white font-black text-xl">
          ⚡
        </div>
        <div>
          <h1 class="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            RankViral <span class="text-amber-400 text-sm font-semibold">SEO Engine</span>
          </h1>
          <p class="text-xs text-slate-400">Extract high-intent search terms & viral click-magnet keywords from articles</p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button id="sampleBtn" class="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 hover:border-slate-500 transition-all">
          📄 Load Sample Article
        </button>
        <select id="platformSelect" class="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none">
          <option value="google">Google SERP</option>
          <option value="ai_search">AI Search (Perplexity/ChatGPT)</option>
          <option value="youtube">YouTube Search</option>
          <option value="social">Viral Social</option>
        </select>
        <select id="goalSelect" class="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none">
          <option value="balanced">Balanced (SEO + Viral)</option>
          <option value="viral_traffic">Max Virality & CTR</option>
          <option value="high_intent_seo">High-Intent SEO</option>
        </select>
      </div>
    </div>
  </header>

  <!-- Main Container -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <div class="text-center max-w-3xl mx-auto space-y-2">
      <div class="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
        🔥 2026 Algorithmic Search Intelligence
      </div>
      <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
        Give Your Article, Get <span class="bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">Viral & SEO-Dominant Keywords</span>
      </h2>
      <p class="text-sm text-slate-400">Extract high-volume ranking terms, viral curiosity hooks, keyword difficulty scores, and SERP snippets.</p>
    </div>

    <!-- Article Input Card -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl relative">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          Source Article Content <span id="wordCountBadge" class="text-xs font-normal text-slate-400">(0 words)</span>
        </h3>
        <div class="flex items-center gap-2">
          <button id="pasteBtn" class="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700">Paste</button>
          <button id="clearBtn" class="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 bg-slate-800/50 border border-slate-700">Clear</button>
        </div>
      </div>

      <textarea id="articleInput" placeholder="Paste your article, blog post draft, or newsletter content here..." class="w-full h-56 p-4 mt-4 text-sm bg-slate-950/70 text-slate-100 placeholder-slate-500 border border-slate-800 focus:border-indigo-500 rounded-xl resize-y font-sans leading-relaxed"></textarea>

      <div class="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-4 text-xs text-slate-400">
          <span><strong id="statWords" class="text-white">0</strong> words</span>
          <span><strong id="statChars" class="text-white">0</strong> chars</span>
          <span>~<strong id="statTime" class="text-white">0</strong> min read</span>
        </div>
        <button id="analyzeBtn" class="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:opacity-95 shadow-lg shadow-indigo-600/30 cursor-pointer">
          ⚡ Extract Viral & SEO Keywords
        </button>
      </div>
    </div>

    <!-- Results Area (Hidden Initially) -->
    <div id="resultsSection" class="hidden space-y-6">
      <!-- Scorecards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-slate-900 border border-amber-500/20 rounded-2xl p-4 shadow-lg">
          <span class="text-xs font-semibold text-slate-400 uppercase">🔥 Virality Potential</span>
          <div class="mt-2 text-3xl font-black text-white" id="viralityScore">--</div>
          <div class="w-full bg-slate-800 rounded-full h-1.5 mt-2">
            <div id="viralityBar" class="bg-amber-500 h-1.5 rounded-full" style="width: 0%"></div>
          </div>
        </div>
        <div class="bg-slate-900 border border-emerald-500/20 rounded-2xl p-4 shadow-lg">
          <span class="text-xs font-semibold text-slate-400 uppercase">🎯 SEO Readiness</span>
          <div class="mt-2 text-3xl font-black text-white" id="seoScore">--</div>
          <div class="w-full bg-slate-800 rounded-full h-1.5 mt-2">
            <div id="seoBar" class="bg-emerald-500 h-1.5 rounded-full" style="width: 0%"></div>
          </div>
        </div>
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <span class="text-xs font-semibold text-slate-400 uppercase">🧭 Target Niche</span>
          <div class="mt-2 text-sm font-bold text-slate-100" id="primaryTopic">--</div>
        </div>
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <span class="text-xs font-semibold text-slate-400 uppercase">👥 Search Persona</span>
          <div class="mt-2 text-sm font-bold text-slate-100" id="targetAudience">--</div>
        </div>
      </div>

      <!-- Keyword Table -->
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div class="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <h3 class="text-base font-bold text-white">Extracted Viral & SEO Keywords</h3>
          <div class="flex items-center gap-2">
            <button id="copyTagsBtn" class="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">Copy Tags</button>
            <button id="copyCsvBtn" class="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white">Copy CSV</button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950/80 text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th class="py-3 px-4">Keyword</th>
                <th class="py-3 px-3">Type</th>
                <th class="py-3 px-3">Search Intent</th>
                <th class="py-3 px-3">Viral Score</th>
                <th class="py-3 px-3">SEO Difficulty</th>
                <th class="py-3 px-3">Volume</th>
              </tr>
            </thead>
            <tbody id="keywordsTbody" class="divide-y divide-slate-800 text-slate-200"></tbody>
          </table>
        </div>
      </div>
    </div>
  </main>

  <script src="app.js"></script>
</body>
</html>`;

export const STANDALONE_CSS = `/* style.css - Custom enhancements */
body {
  font-family: 'Plus Jakarta Sans', sans-serif;
}

code, pre {
  font-family: 'JetBrains Mono', monospace;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #0f172a;
}

::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #475569;
}`;

export const STANDALONE_JS = `// app.js - Standalone Keyword Engine Driver
const articleInput = document.getElementById('articleInput');
const statWords = document.getElementById('statWords');
const statChars = document.getElementById('statChars');
const statTime = document.getElementById('statTime');
const wordCountBadge = document.getElementById('wordCountBadge');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultsSection = document.getElementById('resultsSection');
const keywordsTbody = document.getElementById('keywordsTbody');

const SAMPLE_TEXT = "Why Autonomous AI Agents Are Replacing Traditional Prompt Engineering in 2026. For the past three years, developers focused on formulaic prompt engineering. Today, self-directed agents take high-level objectives, deconstruct them into recursive subtasks, automate workflows, and deliver finalized outputs.";

document.getElementById('sampleBtn').addEventListener('click', () => {
  articleInput.value = SAMPLE_TEXT;
  updateStats();
});

document.getElementById('clearBtn').addEventListener('click', () => {
  articleInput.value = '';
  updateStats();
});

document.getElementById('pasteBtn').addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    articleInput.value = text;
    updateStats();
  } catch (err) {
    alert('Please paste manually using Ctrl+V or Cmd+V.');
  }
});

articleInput.addEventListener('input', updateStats);

function updateStats() {
  const text = articleInput.value.trim();
  const words = text ? text.split(/\\s+/).length : 0;
  statWords.innerText = words;
  statChars.innerText = articleInput.value.length;
  statTime.innerText = Math.max(1, Math.ceil(words / 220));
  wordCountBadge.innerText = '(' + words + ' words)';
}

analyzeBtn.addEventListener('click', async () => {
  const text = articleInput.value.trim();
  if (text.length < 30) {
    alert('Please enter at least 30 characters for keyword extraction.');
    return;
  }

  analyzeBtn.innerText = 'Analyzing...';
  analyzeBtn.disabled = true;

  try {
    const response = await fetch('/api/analyze-keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        articleText: text,
        targetPlatform: document.getElementById('platformSelect').value,
        goal: document.getElementById('goalSelect').value,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to extract keywords.');

    renderResults(data);
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    analyzeBtn.innerText = '⚡ Extract Viral & SEO Keywords';
    analyzeBtn.disabled = false;
  }
});

function renderResults(data) {
  resultsSection.classList.remove('hidden');
  document.getElementById('viralityScore').innerText = data.overview.viralityScore + '/100';
  document.getElementById('viralityBar').style.width = data.overview.viralityScore + '%';
  document.getElementById('seoScore').innerText = data.overview.seoReadinessScore + '/100';
  document.getElementById('seoBar').style.width = data.overview.seoReadinessScore + '%';
  document.getElementById('primaryTopic').innerText = data.overview.primaryTopic;
  document.getElementById('targetAudience').innerText = data.overview.targetAudience;

  keywordsTbody.innerHTML = '';
  data.keywords.forEach((k) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-800/40 transition-colors';
    tr.innerHTML = \`
      <td class="py-3 px-4 font-bold text-white">\${k.keyword}</td>
      <td class="py-3 px-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300">\${k.type}</span></td>
      <td class="py-3 px-3 text-slate-400">\${k.searchIntent}</td>
      <td class="py-3 px-3 font-bold text-amber-400">🔥 \${k.viralScore}/100</td>
      <td class="py-3 px-3 text-emerald-400">\${k.difficulty} (\${k.difficultyScore}%)</td>
      <td class="py-3 px-3">\${k.estimatedVolume}</td>
    \`;
    keywordsTbody.appendChild(tr);
  });

  resultsSection.scrollIntoView({ behavior: 'smooth' });
}
`;
