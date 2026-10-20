import { normalizePersianText, tokenizePersianText, stemPersianWord } from '../lib/nlp/normalizer';
import { classifyIntent, extractEntities } from '../lib/nlp/intentClassifier';
import { answerDataQuestion, formatAnswerAsPersianText } from '../lib/nlp/persianAssistant';
import { generateStrategicRecommendations } from '../lib/nlp/recommendationEngine';
import { explainAnomalies } from '../lib/nlp/anomalyExplainer';
import { Dataset, DataAnomaly } from '../types';
import { formatToman } from '../lib/persianUtils';

export function runPersianNlpAssistantTests(): { passed: number; failed: number } {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  console.log('\n======================================================');
  console.log('🧠 آزمون جامع پردازش زبان طبیعی فارسی، موتور استنتاج و دستیار قانون‌محور');
  console.log('======================================================');

  // --- Suite 1: Persian Normalizer ---
  console.log('\n--- Test Suite 1: Persian Text Normalization ---');
  {
    const rawArabic = 'فروشگاهِ كالاهاي ديجيتال';
    const normalized = normalizePersianText(rawArabic);
    assert(normalized.includes('کالاهای دیجیتال'), 'Unifies Arabic kaf (ك) and ya (ي) to Persian (ک، ی)');

    const withDigits = 'فروش ۱۲۳ دستگاه با قیمت ۴۵۰ ریال';
    const normalizedDigits = normalizePersianText(withDigits);
    assert(normalizedDigits.includes('123') && normalizedDigits.includes('450'), 'Converts Persian digits to standard Arabic/Latin numbers');

    const withArabicDigits = 'طلب مبلغ ٥٠٠٠ تومان';
    const normalizedArabicDigits = normalizePersianText(withArabicDigits);
    assert(normalizedArabicDigits.includes('5000'), 'Converts Eastern Arabic digits to standard numbers');

    const halfSpaceText = 'می\u200cخواهم گزارش\u200cها را ببینم';
    const normalizedHalfSpace = normalizePersianText(halfSpaceText);
    assert(!normalizedHalfSpace.includes('\u200c'), 'Normalizes zero-width non-joiner cleanly');

    const stemmed = stemPersianWord('فروشگاه‌هایمان');
    assert(stemmed.startsWith('فروشگاه'), 'Strips Persian plural/possessive suffix');
  }

  // --- Suite 2: Intent Classification & Entity Extraction ---
  console.log('\n--- Test Suite 2: Intent Classification Accuracy ---');
  {
    const categories = ['کالای دیجیتال', 'پوشاک و مد', 'لوازم خانگی'];
    const cities = ['تهران', 'مشهد', 'اصفهان'];

    // 1. SALES_SUMMARY
    const resSummary = classifyIntent('خلاصه فروش و کل درآمد چقدر است؟', categories, cities);
    assert(resSummary.intent === 'SALES_SUMMARY', `Classifies summary intent (got ${resSummary.intent})`);

    // 2. GROSS_NET_REVENUE
    const resGrossNet = classifyIntent('درآمد ناخالص با درآمد خالص چه تفاوتی دارد و میزان سود چقدره؟', categories, cities);
    assert(resGrossNet.intent === 'GROSS_NET_REVENUE', `Classifies gross vs net revenue intent (got ${resGrossNet.intent})`);

    // 3. ORDER_COUNT
    const resOrders = classifyIntent('چند تا فاکتور یا سفارش ثبت شده است؟', categories, cities);
    assert(resOrders.intent === 'ORDER_COUNT', `Classifies order count intent (got ${resOrders.intent})`);

    // 4. AOV
    const resAov = classifyIntent('میانگین ارزش سفارش یا ارزش سبد خرید (AOV) چقدر است؟', categories, cities);
    assert(resAov.intent === 'AOV', `Classifies AOV intent (got ${resAov.intent})`);

    // 5. UNIQUE_CUSTOMERS
    const resCustomers = classifyIntent('تعداد کل مشتریان و خریداران یکتا چند نفر است؟', categories, cities);
    assert(resCustomers.intent === 'UNIQUE_CUSTOMERS', `Classifies unique customers intent (got ${resCustomers.intent})`);

    // 6. RETURN_CANCEL_RATE
    const resReturns = classifyIntent('نرخ مرجوعی و سفارشات لغو شده چقدر است؟', categories, cities);
    assert(resReturns.intent === 'RETURN_CANCEL_RATE', `Classifies return & cancellation intent (got ${resReturns.intent})`);

    // 7. TOP_BOTTOM_PRODUCTS_CATEGORIES
    const resTop = classifyIntent('پرسودترین دسته محصولات کدام است و چه سهمی دارد؟', categories, cities);
    assert(resTop.intent === 'TOP_BOTTOM_PRODUCTS_CATEGORIES', `Classifies top categories intent (got ${resTop.intent})`);

    // 8. CITY_ANALYSIS
    const resCity = classifyIntent('وضعیت تمرکز جغرافیایی و فروش در شهر تهران چطور است؟', categories, cities);
    assert(resCity.intent === 'CITY_ANALYSIS', `Classifies city analysis intent (got ${resCity.intent})`);
    assert(resCity.parameters.city === 'تهران', 'Extracts target city entity');

    // 9. CATEGORY_ANALYSIS
    const resCategory = classifyIntent('میزان فروش و سهم دسته کالای دیجیتال چقدر است؟', categories, cities);
    assert(resCategory.intent === 'CATEGORY_ANALYSIS', `Classifies category analysis intent (got ${resCategory.intent})`);
    assert(resCategory.parameters.category === 'کالای دیجیتال', 'Extracts target category entity');

    // 10. SALES_TREND_DROP_GROWTH
    const resTrend = classifyIntent('روند زمانی فروش در طول روزها چگونه بوده است؟', categories, cities);
    assert(resTrend.intent === 'SALES_TREND_DROP_GROWTH', `Classifies sales trend intent (got ${resTrend.intent})`);

    // 11. ANOMALIES
    const resAnom = classifyIntent('آیا خرید مشکوک یا ناهنجاری قیمتی ثبت شده است؟', categories, cities);
    assert(resAnom.intent === 'ANOMALIES', `Classifies anomalies intent (got ${resAnom.intent})`);

    // 12. DATA_QUALITY
    const resQuality = classifyIntent('کیفیت داده‌ها و سطرهای تکراری یا خالی فایل چطور است؟', categories, cities);
    assert(resQuality.intent === 'DATA_QUALITY', `Classifies data quality intent (got ${resQuality.intent})`);

    // 13. RECOMMENDATIONS
    const resRecs = classifyIntent('چه توصیه و راهکاری برای افزایش فروش دارید؟', categories, cities);
    assert(resRecs.intent === 'RECOMMENDATIONS', `Classifies recommendations intent (got ${resRecs.intent})`);

    // 14. METRIC_DEFINITIONS
    const resDef = classifyIntent('فرمول محاسبه درآمد خالص چیست؟', categories, cities);
    assert(resDef.intent === 'METRIC_DEFINITIONS', `Classifies metric definitions intent (got ${resDef.intent})`);

    // 15. LIMITATIONS_AND_SCOPE
    const resLimit = classifyIntent('فرضیات و محدودیت‌های داده‌های این فایل چیست؟', categories, cities);
    assert(resLimit.intent === 'LIMITATIONS_AND_SCOPE', `Classifies limitations intent (got ${resLimit.intent})`);

    // 16. UNKNOWN (Out-of-scope question)
    const resUnknown = classifyIntent('وضعیت ترافیک خیابان ولیعصر چطوره؟', categories, cities);
    assert(resUnknown.intent === 'UNKNOWN', `Detects out-of-scope question as UNKNOWN (got ${resUnknown.intent})`);
  }

  // --- Suite 3: Deterministic Calculations & Grounding ---
  console.log('\n--- Test Suite 3: Deterministic Assistant Math Verification ---');
  {
    const mockDataset: Dataset = {
      id: 'test-ds-1',
      name: 'فروش بهار ۱۴۰۳',
      fileName: 'spring_sales.csv',
      fileSize: 4096,
      uploadedAt: '2026-03-20T10:00:00Z',
      rows: [
        { id: 1, amount: 1000000, category: 'کالای دیجیتال', city: 'تهران', status: 'تکمیل شده' },
        { id: 2, amount: 2000000, category: 'کالای دیجیتال', city: 'تهران', status: 'تکمیل شده' },
        { id: 3, amount: 500000, category: 'پوشاک و مد', city: 'مشهد', status: 'مرجوع شده' },
        { id: 4, amount: 1500000, category: 'لوازم خانگی', city: 'اصفهان', status: 'تکمیل شده' },
      ],
      columns: [],
      qualityReport: {
        totalRows: 4,
        totalColumns: 5,
        duplicateRowsCount: 0,
        missingValuesTotal: 0,
        missingValuesPercentage: 0,
        cleanlinessScore: 98,
        columnDetails: [],
        malformedRowsCount: 0,
        healthStatus: 'عالی',
        recommendations: [],
      },
      kpis: {
        totalRevenue: 5000000,
        netRevenue: 4500000,
        totalOrders: 4,
        uniqueCustomers: 3,
        averageOrderValue: 1250000,
        returnRate: 25.0,
        cancellationRate: 0.0,
        grossProfitMarginEstimate: 20,
        topCategory: { name: 'کالای دیجیتال', revenue: 3000000, percentage: 60.0 },
        topCity: { name: 'تهران', revenue: 3000000, percentage: 60.0 },
      },
      timeSeries: [
        { date: '2026-03-21', jalaliDate: '۱۴۰۳/۰۱/۰۱', revenue: 3000000, orderCount: 2, avgOrderValue: 1500000 },
        { date: '2026-03-22', jalaliDate: '۱۴۰۳/۰۱/۰۲', revenue: 2000000, orderCount: 2, avgOrderValue: 1000000 },
      ],
      categoryBreakdown: [
        { category: 'کالای دیجیتال', revenue: 3000000, orderCount: 2, percentage: 60.0 },
        { category: 'لوازم خانگی', revenue: 1500000, orderCount: 1, percentage: 30.0 },
        { category: 'پوشاک و مد', revenue: 500000, orderCount: 1, percentage: 10.0 },
      ],
      cityBreakdown: [
        { city: 'تهران', revenue: 3000000, orderCount: 2, percentage: 60.0 },
        { city: 'اصفهان', revenue: 1500000, orderCount: 1, percentage: 30.0 },
        { city: 'مشهد', revenue: 500000, orderCount: 1, percentage: 10.0 },
      ],
      anomalies: [
        {
          id: 'anom-1',
          rowIndex: 1,
          columnName: 'amount',
          value: 2000000,
          expectedRange: '۵۰۰٬۰۰۰ تا ۱٬۵۰۰٬۰۰۰',
          zScore: 2.1,
          severity: 'medium',
          type: 'outlier_high',
          reasonPersian: 'سفارش با نمره Z بالاتر از ۲.۰ نسبت به میانگین',
          affectedRowData: { id: 2, amount: 2000000 },
        },
      ],
    };

    // Test Question 1: Sales summary
    const ansSummary = answerDataQuestion('خلاصه فروش و درآمد کل چقدر است؟', mockDataset);
    assert(ansSummary.intent === 'SALES_SUMMARY', 'Returns correct intent in answer');
    assert(ansSummary.calculatedMetrics?.gross === 5000000, 'Calculates exact gross revenue (5,000,000)');
    assert(ansSummary.calculatedMetrics?.net === 4500000, 'Calculates exact net revenue (4,500,000)');
    assert(ansSummary.calculatedMetrics?.aov === 1250000, 'Calculates exact AOV (1,250,000)');

    const textOutput = formatAnswerAsPersianText(ansSummary);
    assert(textOutput.includes(formatToman(5000000)), 'Persian formatted text contains exact gross figure');
    assert(textOutput.includes(formatToman(4500000)), 'Persian formatted text contains exact net figure');
    assert(textOutput.includes('📊 پاسخ تحلیلی مستقیم'), 'Formats direct answer header');
    assert(textOutput.includes('🔍 شواهد و ارقام پشتیبان از داده'), 'Formats evidence header');

    // Test Question 2: Specific category breakdown
    const ansCat = answerDataQuestion('میزان فروش دسته کالای دیجیتال چقدر است؟', mockDataset);
    assert(ansCat.intent === 'CATEGORY_ANALYSIS', 'Understands category analysis question');
    assert(ansCat.directAnswer.includes(formatToman(3000000)), 'Contains exact category revenue in direct answer');

    // Test Question 3: Specific city breakdown
    const ansCity = answerDataQuestion('در شهر اصفهان چقدر فروش داشتیم؟', mockDataset);
    assert(ansCity.intent === 'CITY_ANALYSIS', 'Understands city analysis question');
    assert(ansCity.directAnswer.includes(formatToman(1500000)), 'Contains exact city revenue');

    // Test Question 4: Return rate
    const ansReturn = answerDataQuestion('نرخ مرجوعی چقدر است؟', mockDataset);
    assert(ansReturn.directAnswer.includes('۲۵٪') || ansReturn.directAnswer.includes('۲۵٫۰٪'), 'Reflects exact 25% return rate');

    // Test Question 5: Out of scope (Honesty test)
    const ansUnknown = answerDataQuestion('نرخ تورم سال آینده چقدر خواهد بود؟', mockDataset);
    assert(ansUnknown.intent === 'UNKNOWN', 'Out-of-scope triggers UNKNOWN intent');
    assert(ansUnknown.directAnswer.includes('شواهد کافی برای پاسخ قطعی به این پرسش وجود ندارد'), 'Refuses to fabricate non-existent numbers');
  }

  // --- Suite 4: Recommendation Engine Rules ---
  console.log('\n--- Test Suite 4: Rule-Based Business Recommendation Engine ---');
  {
    const kpis = {
      totalRevenue: 10000000,
      netRevenue: 8500000,
      totalOrders: 100,
      uniqueCustomers: 70,
      averageOrderValue: 100000,
      returnRate: 10.0,
      cancellationRate: 5.0,
      grossProfitMarginEstimate: 25,
      topCategory: { name: 'لوازم دیجیتال', revenue: 6000000, percentage: 60.0 },
      topCity: { name: 'تهران', revenue: 5500000, percentage: 55.0 },
    };

    const topCats = [
      { category: 'لوازم دیجیتال', revenue: 6000000, orderCount: 60, percentage: 60.0 },
      { category: 'پوشاک', revenue: 4000000, orderCount: 40, percentage: 40.0 },
    ];

    const topCities = [
      { city: 'تهران', revenue: 5500000, orderCount: 55, percentage: 55.0 },
      { city: 'مشهد', revenue: 4500000, orderCount: 45, percentage: 45.0 },
    ];

    const recsResult = generateStrategicRecommendations(kpis, topCats, topCities);
    assert(recsResult.list.length >= 4, 'Generates 4 strategic recommendations');
    assert(recsResult.list.some((r) => r.id === 'rec-returns'), 'Triggers return/cancellation risk rule due to 15% combined rate');
    assert(recsResult.list.some((r) => r.id === 'rec-category-risk'), 'Triggers category concentration rule due to 60% top category share');
    assert(recsResult.list.some((r) => r.id === 'rec-geo-expansion'), 'Triggers geographic expansion rule due to 55% top city share');
    assert(recsResult.list.some((r) => r.id === 'rec-aov-growth'), 'Triggers AOV expansion rule');
  }

  // --- Suite 5: Anomaly Explainer Evaluation ---
  console.log('\n--- Test Suite 5: Anomaly Root-Cause Explainer ---');
  {
    const anomalies: DataAnomaly[] = [
      {
        id: 'anom-1',
        rowIndex: 5,
        columnName: 'مبلغ کل',
        value: 12000000,
        expectedRange: '۱٬۰۰۰٬۰۰۰ تا ۳٬۰۰۰٬۰۰۰',
        zScore: 3.8,
        severity: 'high',
        type: 'outlier_high',
        reasonPersian: 'انحراف شدید از میانگین',
        affectedRowData: { customerName: 'سازمان توسعه', amount: 12000000 },
      },
    ];

    const expl = explainAnomalies(anomalies, { aov: 2000000 });
    assert(expl.summary.totalAnomalies === 1, 'Counts total anomalies correctly');
    assert(expl.summary.highSeverityCount === 1, 'Counts high severity anomalies');
    assert(expl.fullReport.includes('ارزیابی ریسک و فرصت'), 'Contains risk and opportunity assessment section');
    assert(expl.fullReport.includes('اقدام عملی و اصلاحی'), 'Contains actionable corrective steps');
  }

  // --- Suite 6: Advanced NLP Stress Testing (Typos, Ambiguity, Unknown Entities, Persian Digits, Partial Intervals) ---
  console.log('\n--- Test Suite 6: Advanced NLP Stress & Edge-Case Testing ---');
  {
    const categories = ['کالای دیجیتال', 'پوشاک و مد', 'لوازم خانگی'];
    const cities = ['تهران', 'مشهد', 'اصفهان'];

    // 1. Typos & Arabic character variants
    const typoGrossNet = classifyIntent('درامد ناخالص و درامد خالص چقدره و سودمون چیه؟', categories, cities);
    assert(typoGrossNet.intent === 'GROSS_NET_REVENUE', 'Handles typo "درامد" without hamza for GROSS_NET_REVENUE');

    const typoReturns = classifyIntent('سفارشات مرجوعى و كنسلى چقدر بوده؟', categories, cities);
    assert(typoReturns.intent === 'RETURN_CANCEL_RATE', 'Handles Arabic ya/kaf (مرجوعى، كنسلى) for RETURN_CANCEL_RATE');

    const typoAov = classifyIntent('aov سبد خريد چقدره؟', categories, cities);
    assert(typoAov.intent === 'AOV', 'Handles mixed casing and Arabic ya in "خريد" for AOV');

    // 2. Persian digits & Partial time intervals
    const persian10Days = classifyIntent('فروش در ۱۰ روز اخیر چطور بود؟', categories, cities);
    assert(persian10Days.parameters.timeRange === 'last_10_days', 'Extracts 10 days interval from Persian digits (۱۰ روز)');

    const persian30Days = classifyIntent('روند فروش در ۳۰ روز گذشته', categories, cities);
    assert(persian30Days.parameters.timeRange === 'last_30_days', 'Extracts 30 days interval from Persian digits (۳۰ روز)');

    const persianYear = classifyIntent('آمار فاکتورهای سال ۱۴۰۲', categories, cities);
    assert(persianYear.parameters.timeRange === 'year_1402', 'Extracts year 1402 from Persian digits (۱۴۰۲)');

    const partialYesterday = classifyIntent('فروش دیروز چطور بود؟', categories, cities);
    assert(partialYesterday.parameters.timeRange === 'yesterday', 'Extracts partial interval "دیروز" (yesterday)');

    const partialSeason = classifyIntent('عملکرد سه ماهه یا فصل گذشته', categories, cities);
    assert(partialSeason.parameters.timeRange === 'last_quarter', 'Extracts partial interval "فصل گذشته" / "سه ماهه"');

    // 3. Ambiguity & Combined intent resolution
    const combinedCity = classifyIntent('فروش و سفارشات در شهر مشهد چقدر بوده؟', categories, cities);
    assert(combinedCity.intent === 'CITY_ANALYSIS' && combinedCity.parameters.city === 'مشهد', 'Resolves combined query to CITY_ANALYSIS with target city مشهد');

    const combinedCategory = classifyIntent('وضعیت فروش و سهم دسته پوشاک و مد', categories, cities);
    assert(combinedCategory.intent === 'CATEGORY_ANALYSIS' && combinedCategory.parameters.category === 'پوشاک و مد', 'Resolves combined query to CATEGORY_ANALYSIS with target category');

    // 4. Unknown entity resilience (Zero hallucination)
    const mockDataset: Dataset = {
      id: 'mock-stress-1',
      name: 'فروشگاه تستی',
      fileName: 'test.csv',
      fileSize: 1024,
      uploadedAt: new Date().toISOString(),
      rows: [
        { id: 1, amount: 2000000, category: 'کالای دیجیتال', city: 'تهران', status: 'تکمیل شده' },
        { id: 2, amount: 1000000, category: 'پوشاک و مد', city: 'مشهد', status: 'تکمیل شده' },
      ],
      columns: [],
      qualityReport: {
        totalRows: 2,
        totalColumns: 5,
        duplicateRowsCount: 0,
        missingValuesTotal: 0,
        missingValuesPercentage: 0,
        cleanlinessScore: 100,
        columnDetails: [],
        malformedRowsCount: 0,
        healthStatus: 'عالی',
        recommendations: [],
      },
      kpis: {
        totalRevenue: 3000000,
        netRevenue: 3000000,
        totalOrders: 2,
        uniqueCustomers: 2,
        averageOrderValue: 1500000,
        returnRate: 0,
        cancellationRate: 0,
        grossProfitMarginEstimate: 25,
        topCategory: { name: 'کالای دیجیتال', revenue: 2000000, percentage: 66.7 },
        topCity: { name: 'تهران', revenue: 2000000, percentage: 66.7 },
      },
      timeSeries: [],
      categoryBreakdown: [
        { category: 'کالای دیجیتال', revenue: 2000000, orderCount: 1, percentage: 66.7 },
        { category: 'پوشاک و مد', revenue: 1000000, orderCount: 1, percentage: 33.3 },
      ],
      cityBreakdown: [
        { city: 'تهران', revenue: 2000000, orderCount: 1, percentage: 66.7 },
        { city: 'مشهد', revenue: 1000000, orderCount: 1, percentage: 33.3 },
      ],
      anomalies: [],
    };

    // Unknown category query
    const unknownCatAnswer = answerDataQuestion('فروش دسته ساعت مچی چقدر است؟', mockDataset);
    assert(unknownCatAnswer.directAnswer.includes('یافت نشد'), 'Explicitly states unknown category "ساعت مچی" was not found');
    assert(unknownCatAnswer.directAnswer.includes('ساعت مچی'), 'Mentions the requested category name in headline');
    assert(unknownCatAnswer.numericalEvidence[1].includes('کالای دیجیتال'), 'Lists actual available categories to guide the user');

    // Unknown city query
    const unknownCityAnswer = answerDataQuestion('وضعیت فروش در شهر بندرعباس چطور است؟', mockDataset);
    assert(unknownCityAnswer.directAnswer.includes('یافت نشد'), 'Explicitly states unknown city "بندرعباس" was not found');
    assert(unknownCityAnswer.directAnswer.includes('بندرعباس'), 'Mentions the requested city name in headline');
    assert(unknownCityAnswer.numericalEvidence[1].includes('تهران'), 'Lists actual available cities in the file');
  }

  return { passed, failed };
}
