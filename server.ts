import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { 
  answerDataQuestion, 
  formatAnswerAsPersianText, 
  explainAnomalies, 
  generateStrategicRecommendations, 
  classifyIntent, 
  calculateIntentMetrics 
} from './src/lib/nlp/index';
import { Dataset } from './src/types/index';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory sliding-window rate limiter for server API endpoints
interface RateLimitRecord {
  timestamps: number[];
}
const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 60; // generous for local rule-based requests

const rateLimiterMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  const record = rateLimitMap.get(clientIp) || { timestamps: [] };
  record.timestamps = record.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (record.timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: 'تعداد درخواست‌های ارسالی شما بیش از سقف مجاز است. لطفاً کمی صبر کنید.',
    });
  }

  record.timestamps.push(now);
  rateLimitMap.set(clientIp, record);
  next();
};

app.use('/api', rateLimiterMiddleware);

// API: Health Check (Reporting fully local rule-based Persian engine)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    engine: 'persian-rule-based-nlp',
    llmDependent: false,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Reconstructs a Dataset instance from datasetSummary payload if needed
 */
function reconstructDatasetFromSummary(summary: any): Dataset {
  const totalRevenue = Number(summary?.totalRevenue || 0);
  const netRevenue = Number(summary?.netRevenue || totalRevenue);
  const totalOrders = Number(summary?.totalOrders || (summary?.totalRows || 0));
  const aov = Number(summary?.aov || (totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0));
  const returnRate = Number(summary?.returnRate || 0);
  const cancellationRate = Number(summary?.cancellationRate || 0);
  const uniqueCustomers = Number(summary?.uniqueCustomers || Math.round(totalOrders * 0.8));

  const categoryBreakdown = Array.isArray(summary?.categoryBreakdown) ? summary.categoryBreakdown : [];
  const cityBreakdown = Array.isArray(summary?.cityBreakdown) ? summary.cityBreakdown : [];

  const topCategory = summary?.topCategory || (categoryBreakdown[0]
    ? { name: categoryBreakdown[0].category, revenue: categoryBreakdown[0].revenue, percentage: categoryBreakdown[0].percentage }
    : { name: 'نامشخص', revenue: 0, percentage: 0 });

  const topCity = summary?.topCity || (cityBreakdown[0]
    ? { name: cityBreakdown[0].city, revenue: cityBreakdown[0].revenue, percentage: cityBreakdown[0].percentage }
    : { name: 'نامشخص', revenue: 0, percentage: 0 });

  return {
    id: summary?.id || 'dataset-summary',
    name: summary?.datasetName || summary?.name || 'فایل بارگذاری‌شده',
    fileName: summary?.fileName || 'data.csv',
    fileSize: summary?.fileSize || 1024,
    uploadedAt: new Date().toISOString(),
    rows: Array.isArray(summary?.rows) ? summary.rows : new Array(summary?.totalRows || 10).fill({}),
    columns: Array.isArray(summary?.columns) ? summary.columns : [],
    qualityReport: summary?.qualityReport || {
      totalRows: summary?.totalRows || 10,
      totalColumns: 5,
      duplicateRowsCount: 0,
      missingValuesTotal: 0,
      missingValuesPercentage: 0,
      cleanlinessScore: 95,
      columnDetails: [],
      malformedRowsCount: 0,
      healthStatus: 'عالی',
      recommendations: [],
    },
    kpis: {
      totalRevenue,
      netRevenue,
      totalOrders,
      uniqueCustomers,
      averageOrderValue: aov,
      returnRate,
      cancellationRate,
      grossProfitMarginEstimate: 25,
      topCategory,
      topCity,
    },
    timeSeries: Array.isArray(summary?.timeSeries) ? summary.timeSeries : [],
    categoryBreakdown,
    cityBreakdown,
    anomalies: Array.isArray(summary?.anomalies) ? summary.anomalies : [],
  };
}

// API: Persian Data Assistant Chat (100% Rule-Based, Deterministic NLP)
app.post('/api/chat', (req, res) => {
  try {
    const question = (req.body.question || req.body.message || '').trim();
    const datasetSummary = req.body.datasetSummary;

    if (!question || typeof question !== 'string' || question.length === 0) {
      return res.status(400).json({ error: 'پرسش معتبر ارسال نشده است.' });
    }

    if (question.length > 2000) {
      return res.status(400).json({ error: 'طول پرسش بیش از حد مجاز (۲۰۰۰ کاراکتر) است.' });
    }

    const dataset = reconstructDatasetFromSummary(datasetSummary || {});
    const structuredAnswer = answerDataQuestion(question, dataset);
    const formattedText = formatAnswerAsPersianText(structuredAnswer);

    res.json({
      answer: formattedText,
      structuredAnswer,
      intent: structuredAnswer.intent,
      suggestedQuestions: structuredAnswer.suggestedQuestions,
    });
  } catch (error: any) {
    console.error('NLP Assistant Server Error:', error);
    res.status(500).json({
      error: 'خطا در پردازش پرسش تحلیلی با موتور پردازش زبان طبیعی فارسی',
    });
  }
});

// API: Anomaly & Trend Root-Cause Explanation (100% Deterministic Statistical Audit)
app.post('/api/anomalies', (req, res) => {
  try {
    const { anomalies, datasetSummary } = req.body;

    if (!anomalies || !Array.isArray(anomalies)) {
      return res.status(400).json({ error: 'اطلاعات ناهنجاری‌ها معتبر ارسال نشده است.' });
    }

    if (anomalies.length > 1000) {
      return res.status(400).json({ error: 'تعداد ناهنجاری‌ها بیش از حد مجاز است.' });
    }

    const explanation = explainAnomalies(anomalies, datasetSummary);
    res.json({
      analysis: explanation.fullReport,
      summary: explanation.summary,
    });
  } catch (error: any) {
    console.error('Anomaly Explainer Server Error:', error);
    res.status(500).json({
      error: 'خطا در ارزیابی ریشه‌ای ناهنجاری‌های آماری',
    });
  }
});

// API: Strategic Business Recommendations (100% Rule-Based Business Intelligence)
app.post('/api/recommendations', (req, res) => {
  try {
    const { kpis, topCategories, topCities } = req.body;

    if (!kpis || typeof kpis !== 'object') {
      return res.status(400).json({ error: 'شاخص‌های کلیدی عملکرد معتبر ارسال نشده است.' });
    }

    const result = generateStrategicRecommendations(kpis, topCategories || [], topCities || []);
    res.json({
      recommendations: result.recommendationsText,
      list: result.list,
    });
  } catch (error: any) {
    console.error('Recommendations Server Error:', error);
    res.status(500).json({
      error: 'خطا در صدور توصیه‌های استراتژیک قانون‌محور',
    });
  }
});

// Setup Vite Dev server or static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`DataPilot server running on http://localhost:${port} [Rule-Based Persian NLP Engine Active]`);
  });
}

startServer();
