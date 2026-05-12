/**
 * IELTS Daily Digest Bot
 * Fetches articles from 4 RSS sources, selects 3 per day by band level,
 * extracts vocabulary and practice tasks, and emails a formatted digest.
 */

require('dotenv').config();
const RSSParser = require('rss-parser');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

// ─── Configuration ────────────────────────────────────────────────────────────

const RSS_SOURCES = [
  {
    name: 'VOA Learning English',
    url: 'https://learningenglish.voanews.com/api/zpoqiio-pq',
    band: 6.0,
    section: 'Section 1',
    badge: '#4CAF50',
    description: 'Simple English – ideal for Section 1 practice',
  },
  {
    name: 'BBC News World',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    band: 6.5,
    section: 'Section 2',
    badge: '#BB1919',
    description: 'Journalistic English – great for Section 2–3',
  },
  {
    name: 'NPR News',
    url: 'https://feeds.npr.org/1001/rss.xml',
    band: 7.0,
    section: 'Section 3',
    badge: '#0066CC',
    description: 'Formal American English – editorial style',
  },
  {
    name: 'The Guardian',
    url: 'https://www.theguardian.com/world/rss',
    band: 7.5,
    section: 'Section 3',
    badge: '#005689',
    description: 'Advanced English – essay prep level',
  },
];

const HISTORY_FILE = path.join(__dirname, 'sent-articles.json');
const DIGEST_TIME = process.env.DIGEST_TIME || '0 7 * * *'; // Default: 7:00 AM daily

// IELTS practice question types (rotated by day of week)
const PRACTICE_QUESTIONS = [
  'True / False / Not Given: Read the article and write T, F, or NG for 3 key claims.',
  'Matching Headings: Write a suitable heading for each paragraph (2–3 paragraphs).',
  'Summary Completion: Fill in the blanks using words from the article.',
  'Multiple Choice: Write one MCQ question with 4 options based on the article.',
  'Short-Answer Questions: Write 2 factual questions answerable in ≤4 words.',
];

// High-frequency IELTS vocabulary bank (words mapped to bands)
const IELTS_VOCAB_BANK = {
  6.0: [
    'access', 'affect', 'benefit', 'cause', 'challenge', 'change', 'common',
    'community', 'compare', 'complete', 'concern', 'consider', 'control',
    'create', 'culture', 'develop', 'different', 'effect', 'effort', 'enable',
    'environment', 'establish', 'evidence', 'example', 'experience', 'factor',
    'feature', 'focus', 'follow', 'global', 'group', 'growth', 'health',
    'however', 'impact', 'improve', 'include', 'increase', 'indicate',
    'individual', 'industry', 'involve', 'issue', 'knowledge', 'lead', 'level',
    'likely', 'major', 'method', 'modern', 'natural', 'necessary', 'network',
    'occur', 'option', 'organization', 'particular', 'period', 'policy',
    'population', 'positive', 'potential', 'prevent', 'primary', 'process',
    'produce', 'program', 'provide', 'public', 'purpose', 'quality', 'recent',
    'reduce', 'region', 'relationship', 'report', 'require', 'research',
    'resource', 'result', 'role', 'section', 'sector', 'significant', 'similar',
    'situation', 'society', 'solution', 'source', 'specific', 'structure',
    'support', 'system', 'technology', 'traditional', 'value', 'various',
  ],
  6.5: [
    'acknowledge', 'acquire', 'advocate', 'allocate', 'alleviate', 'analyze',
    'anticipate', 'assess', 'attribute', 'capacity', 'circumstances',
    'collaborate', 'comprehensive', 'consequence', 'constitute', 'constrain',
    'contribute', 'controversial', 'crucial', 'demonstrate', 'derive',
    'determine', 'diminish', 'distribute', 'dominate', 'emphasize', 'ensure',
    'evaluate', 'evident', 'evolve', 'expand', 'facilitate', 'framework',
    'fundamental', 'generate', 'highlight', 'hypothesis', 'identify',
    'implications', 'implement', 'incorporate', 'initiative', 'integration',
    'maintain', 'mechanism', 'minimize', 'motivate', 'numerous', 'objective',
    'obtain', 'perspective', 'phenomena', 'predominant', 'preliminary',
    'primarily', 'priority', 'prominent', 'pursue', 'regardless', 'reinforce',
    'relevant', 'revise', 'reveal', 'sector', 'stability', 'stimulate',
    'substantial', 'sufficient', 'sustain', 'transition', 'undermine',
    'utilize', 'variable', 'widespread',
  ],
  7.0: [
    'abstract', 'albeit', 'ambiguous', 'ameliorate', 'analogous', 'anomaly',
    'arbitrary', 'articulate', 'assertion', 'augment', 'autonomous',
    'benchmark', 'bias', 'catalyst', 'coherent', 'coincide', 'compelling',
    'complement', 'complexity', 'conceptual', 'concurrent', 'consolidate',
    'correlation', 'credibility', 'critique', 'cumulative', 'deficit',
    'deliberate', 'differentiate', 'discourse', 'diverse', 'documentation',
    'dynamic', 'elaborate', 'empirical', 'equivalent', 'explicit', 'feasible',
    'fluctuate', 'formulate', 'hierarchy', 'holistic', 'ideology',
    'indispensable', 'inference', 'inherent', 'initiative', 'innovation',
    'integral', 'intermediate', 'leverage', 'manifest', 'methodology',
    'mitigate', 'notion', 'optimize', 'paradigm', 'perception', 'phenomenon',
    'prerequisite', 'profound', 'proliferate', 'rationale', 'reconcile',
    'regime', 'reiterate', 'resilience', 'rhetoric', 'scrutinize', 'spectrum',
    'subsequent', 'synthesis', 'terminology', 'transparency', 'undergo',
    'unprecedented', 'validate', 'viable',
  ],
  7.5: [
    'aberrant', 'abstruse', 'accentuate', 'acrimony', 'admonish', 'adroit',
    'adulterate', 'ambivalent', 'ameliorative', 'anachronistic', 'antithetical',
    'articulation', 'ascertain', 'assiduous', 'attenuate', 'burgeoning',
    'categorical', 'causal', 'circumscribe', 'cogent', 'commensurate',
    'compendium', 'conciliatory', 'conjecture', 'connotation', 'conspicuous',
    'contention', 'contingent', 'contravene', 'corroborate', 'cynicism',
    'delineate', 'dichotomy', 'didactic', 'disproportionate', 'dogmatic',
    'efficacious', 'egalitarian', 'elucidation', 'emblematic', 'endemic',
    'equivocal', 'exacerbate', 'expedient', 'extrapolate', 'fallacious',
    'hegemony', 'immutable', 'imperialism', 'impervious', 'incongruent',
    'indigenous', 'inimical', 'innocuous', 'insidious', 'intransigent',
    'juxtapose', 'laudable', 'magnanimous', 'manifestation', 'meritocratic',
    'nuanced', 'obfuscate', 'omnipresent', 'ostensibly', 'paradigmatic',
    'perfunctory', 'polarization', 'pragmatic', 'preeminent', 'propagate',
    'propensity', 'prudent', 'recalcitrant', 'reciprocal', 'reductionist',
    'reify', 'reprehensible', 'rhetoric', 'salient', 'solipsistic',
    'sycophantic', 'tacit', 'tenuous', 'ubiquitous', 'unequivocal',
    'vicarious', 'xenophobic', 'zeitgeist',
  ],
};

// ─── History Management ───────────────────────────────────────────────────────

function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    }
  } catch (err) {
    console.warn('Could not load history file, starting fresh:', err.message);
  }
  return { sentArticles: [] };
}

function saveHistory(history) {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save history:', err.message);
  }
}

function isArticleSent(history, url) {
  return history.sentArticles.includes(url);
}

function markArticleSent(history, url) {
  history.sentArticles.push(url);
  // Keep only the last 500 entries to prevent unbounded growth
  if (history.sentArticles.length > 500) {
    history.sentArticles = history.sentArticles.slice(-500);
  }
}

// ─── RSS Fetching ─────────────────────────────────────────────────────────────

async function fetchFeed(source) {
  const parser = new RSSParser({
    timeout: 15000,
    headers: { 'User-Agent': 'IELTS-Digest-Bot/1.0' },
  });

  try {
    console.log(`Fetching: ${source.name} ...`);
    const feed = await parser.parseURL(source.url);
    return feed.items.map((item) => ({
      title: item.title || 'No title',
      link: item.link || item.guid || '',
      description: stripHtml(item.contentSnippet || item.content || item.summary || ''),
      content: stripHtml(item.content || item.contentSnippet || ''),
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      source,
    }));
  } catch (err) {
    console.error(`Failed to fetch ${source.name}: ${err.message}`);
    return []; // Graceful degradation
  }
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Article Selection ────────────────────────────────────────────────────────

async function selectArticles() {
  const history = loadHistory();
  const selectedArticles = [];

  // Fetch all feeds in parallel
  const feedResults = await Promise.all(RSS_SOURCES.map(fetchFeed));

  for (let i = 0; i < RSS_SOURCES.length; i++) {
    const source = RSS_SOURCES[i];
    const items = feedResults[i];

    if (items.length === 0) {
      console.warn(`No articles available from ${source.name}, skipping.`);
      continue;
    }

    // Pick the first unsent article
    const freshArticle = items.find((item) => item.link && !isArticleSent(history, item.link));

    if (freshArticle) {
      selectedArticles.push(freshArticle);
      markArticleSent(history, freshArticle.link);
    } else {
      // All articles from this source have been sent – reuse the latest one
      console.warn(`All articles from ${source.name} already sent. Reusing latest.`);
      selectedArticles.push(items[0]);
    }
  }

  saveHistory(history);

  // Return exactly 3: one each from Band 6.0, 6.5, 7.0 (drop 7.5 if needed to hit 3)
  // If we have all 4, drop the 7.5 entry to keep 3 articles
  if (selectedArticles.length > 3) {
    return selectedArticles.slice(0, 3);
  }
  return selectedArticles;
}

// ─── Vocabulary Extraction ────────────────────────────────────────────────────

function extractVocabulary(article) {
  const band = article.source.band;
  const text = `${article.title} ${article.description} ${article.content}`.toLowerCase();
  const vocabBank = IELTS_VOCAB_BANK[band] || IELTS_VOCAB_BANK[7.0];

  const found = vocabBank.filter((word) => {
    const regex = new RegExp(`\\b${word}(s|ed|ing|ly|tion|al)?\\b`, 'i');
    return regex.test(text);
  });

  // Return up to 5 unique vocabulary words; pad from bank if fewer found
  const result = found.slice(0, 5);
  if (result.length < 5) {
    const extras = vocabBank.filter((w) => !result.includes(w)).slice(0, 5 - result.length);
    result.push(...extras);
  }
  return result.slice(0, 5);
}

// ─── Practice Question Selection ─────────────────────────────────────────────

function getPracticeQuestion() {
  const dayOfWeek = new Date().getDay(); // 0 = Sunday … 6 = Saturday
  return PRACTICE_QUESTIONS[dayOfWeek % PRACTICE_QUESTIONS.length];
}

// ─── Email HTML Generation ────────────────────────────────────────────────────

function buildEmailHtml(articles) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const practiceQuestion = getPracticeQuestion();

  const routineRows = [
    ['0–5 min', 'Warm-up Skim', 'Quickly read all 3 article titles and descriptions.'],
    ['5–15 min', 'Band 6.0 Article', `Read slowly. Note vocabulary. Answer: ${PRACTICE_QUESTIONS[0]}`],
    ['15–22 min', 'Band 6.5 Article', 'Focus on paragraph structure. Identify topic sentences.'],
    ['22–28 min', 'Band 7.0 Article', 'Note complex sentence structures and cohesive devices.'],
    ['28–30 min', 'Reflection', "Write one 3-sentence summary per article and send to Claude."],
  ];

  const routineHtml = routineRows
    .map(
      ([time, task, note]) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e0e0e0;white-space:nowrap;font-weight:600;color:#555;">${time}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e0e0e0;font-weight:600;color:#333;">${task}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e0e0e0;color:#666;">${note}</td>
      </tr>`
    )
    .join('');

  const articleCards = articles
    .map((article) => {
      const vocab = extractVocabulary(article);
      const vocabPills = vocab
        .map(
          (w) =>
            `<span style="display:inline-block;background:#f0f4ff;border:1px solid #c0cce8;color:#2c4a8e;border-radius:4px;padding:3px 10px;margin:3px 3px 3px 0;font-size:13px;font-family:monospace;">${w}</span>`
        )
        .join('');

      const snippet =
        article.description.length > 280
          ? article.description.substring(0, 280) + '…'
          : article.description || 'No description available.';

      return `
      <div style="background:#ffffff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);margin:0 0 28px 0;overflow:hidden;">
        <!-- Card Header -->
        <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:18px 24px;">
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
            <span style="background:${article.source.badge};color:#fff;border-radius:5px;padding:4px 12px;font-size:12px;font-weight:700;letter-spacing:0.5px;white-space:nowrap;">${article.source.name}</span>
            <span style="background:rgba(255,255,255,0.15);color:#fff;border-radius:5px;padding:4px 12px;font-size:12px;font-weight:700;">Band ${article.source.band}</span>
            <span style="background:rgba(255,255,255,0.10);color:#ddd;border-radius:5px;padding:4px 12px;font-size:12px;">${article.source.section}</span>
          </div>
          <h2 style="color:#ffffff;margin:12px 0 0 0;font-size:17px;line-height:1.4;font-family:Georgia,serif;">${escapeHtml(article.title)}</h2>
        </div>

        <!-- Card Body -->
        <div style="padding:20px 24px;">
          <p style="color:#555;font-size:14px;line-height:1.7;margin:0 0 16px 0;">${escapeHtml(snippet)}</p>

          <div style="margin-bottom:16px;">
            <p style="margin:0 0 8px 0;font-size:13px;font-weight:700;color:#333;text-transform:uppercase;letter-spacing:0.5px;">📚 IELTS Vocabulary (5 words)</p>
            <div>${vocabPills}</div>
          </div>

          <div style="background:#fffbf0;border-left:4px solid #f0a500;border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:20px;">
            <p style="margin:0;font-size:13px;font-weight:700;color:#b07800;">✏️ Today's Practice Task</p>
            <p style="margin:6px 0 0 0;font-size:14px;color:#555;">${practiceQuestion}</p>
          </div>

          <a href="${article.link}" style="display:inline-block;background:#2c4a8e;color:#ffffff;text-decoration:none;padding:10px 22px;border-radius:6px;font-size:14px;font-weight:600;">Read Full Article →</a>
        </div>
      </div>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>IELTS Daily Digest – ${today}</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:680px;margin:0 auto;padding:24px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0f3460 0%,#16213e 100%);border-radius:12px;padding:32px;margin-bottom:24px;text-align:center;">
      <div style="font-size:36px;margin-bottom:8px;">📖</div>
      <h1 style="color:#ffffff;margin:0 0 8px 0;font-size:26px;font-family:Georgia,serif;">IELTS Daily Digest</h1>
      <p style="color:#a0c4ff;margin:0 0 4px 0;font-size:15px;">${today}</p>
      <p style="color:#7fa8d4;margin:0;font-size:13px;">${articles.length} articles selected · Progressive Band Levels</p>
    </div>

    <!-- 30-Minute Routine -->
    <div style="background:#ffffff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);margin-bottom:28px;overflow:hidden;">
      <div style="background:#e8f0fe;padding:14px 24px;border-bottom:1px solid #d0ddf8;">
        <h2 style="margin:0;font-size:16px;color:#1a3a6b;">⏱️ Your 30-Minute Reading Routine</h2>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#f5f7ff;">
            <th style="padding:10px 12px;text-align:left;color:#333;border-bottom:2px solid #d0ddf8;">Time</th>
            <th style="padding:10px 12px;text-align:left;color:#333;border-bottom:2px solid #d0ddf8;">Task</th>
            <th style="padding:10px 12px;text-align:left;color:#333;border-bottom:2px solid #d0ddf8;">Notes</th>
          </tr>
        </thead>
        <tbody>${routineHtml}</tbody>
      </table>
    </div>

    <!-- Article Cards -->
    ${articleCards}

    <!-- Footer -->
    <div style="background:linear-gradient(135deg,#1a1a2e 0%,#0f3460 100%);border-radius:12px;padding:24px;text-align:center;">
      <p style="color:#a0c4ff;margin:0 0 12px 0;font-size:15px;font-weight:600;">📝 Daily Writing Challenge</p>
      <p style="color:#cdd8f0;margin:0 0 12px 0;font-size:14px;line-height:1.6;">
        After reading, write a <strong style="color:#ffffff;">3-sentence summary</strong> for each article.<br>
        Then send your summaries to <strong style="color:#7fc8f8;">Claude</strong> for instant feedback!
      </p>
      <p style="color:#5a7a9a;margin:0;font-size:12px;">
        IELTS Daily Digest Bot · Unsubscribe by stopping the cron job
      </p>
    </div>

  </div>
</body>
</html>`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Email Sending ────────────────────────────────────────────────────────────

async function sendDigestEmail(articles) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASS;
  const recipient = process.env.RECIPIENT_EMAIL || gmailUser;

  if (!gmailUser || !gmailPass) {
    throw new Error('GMAIL_USER and GMAIL_APP_PASS must be set in .env');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const htmlBody = buildEmailHtml(articles);

  const info = await transporter.sendMail({
    from: `"IELTS Digest Bot" <${gmailUser}>`,
    to: recipient,
    subject: `📖 IELTS Daily Digest – ${today} (${articles.length} Articles)`,
    html: htmlBody,
  });

  console.log(`Email sent! Message ID: ${info.messageId}`);
  return info;
}

// ─── Main Digest Runner ───────────────────────────────────────────────────────

async function runDigest() {
  console.log(`\n[${new Date().toISOString()}] Running IELTS Digest Bot...`);

  const articles = await selectArticles();

  if (articles.length === 0) {
    console.error('No articles fetched from any source. Aborting email send.');
    return;
  }

  console.log(`Selected ${articles.length} article(s):`);
  articles.forEach((a) => console.log(`  - [Band ${a.source.band}] ${a.title}`));

  await sendDigestEmail(articles);
  console.log('Digest complete.\n');
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

const runNow = process.argv.includes('--now');

if (runNow) {
  // Immediate test run
  runDigest().catch((err) => {
    console.error('Digest failed:', err.message);
    process.exit(1);
  });
} else {
  // Schedule via cron
  console.log(`IELTS Digest Bot scheduled. Cron: "${DIGEST_TIME}"`);
  console.log('Run with --now to send immediately.\n');

  cron.schedule(DIGEST_TIME, () => {
    runDigest().catch((err) => console.error('Scheduled digest failed:', err.message));
  });
}
