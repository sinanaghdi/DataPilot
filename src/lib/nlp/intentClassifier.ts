import { AssistantIntent, ExtractedParameters, IntentResolution } from './types';
import { normalizePersianText, tokenizePersianText, stemPersianWord } from './normalizer';

interface IntentRule {
  intent: AssistantIntent;
  priority: number; // Higher number gets checked first if equal
  exactPhrases: string[]; // High-weight exact matches (+4.0)
  strongKeywords: string[]; // Key intent markers (+2.0)
  contextKeywords: string[]; // Supporting context (+1.0)
  negativeKeywords?: string[]; // Anti-patterns (-3.0)
}

const INTENT_RULES: IntentRule[] = [
  // 1. ANOMALIES
  {
    intent: 'ANOMALIES',
    priority: 15,
    exactPhrases: [
      'ناهنجاری قیمتی',
      'خرید مشکوک',
      'تراکنش مشکوک',
      'داده های پرت',
      'موارد نامتعارف',
      'خطای ورود داده',
      'نمره z',
    ],
    strongKeywords: ['ناهنجاری', 'مشکوک', 'نامتعارف', 'پرت', 'outlier', 'anomaly', 'zscore', 'انحراف'],
    contextKeywords: ['خطا', 'اشتباه', 'عجیب', 'غیرعادی', 'بحرانی', 'ریسک', 'تخلف'],
  },

  // 2. DATA QUALITY
  {
    intent: 'DATA_QUALITY',
    priority: 14,
    exactPhrases: [
      'کیفیت داده',
      'سلامت داده',
      'نمره پاکسازی',
      'سطرهای تکراری',
      'مقادیر خالی',
      'داده های ناقص',
    ],
    strongKeywords: ['کیفیت', 'سلامت', 'پاکسازی', 'تکراری', 'خالی', 'نال', 'null', 'ستون'],
    contextKeywords: ['ممیزی', 'اعتبارسنجی', 'نقص', 'درستی', 'فایل'],
  },

  // 3. RECOMMENDATIONS & STRATEGY
  {
    intent: 'RECOMMENDATIONS',
    priority: 13,
    exactPhrases: [
      'توصیه استراتژیک',
      'چه کار کنیم',
      'راهکار بهبود',
      'پیشنهاد برای افزایش فروش',
      'توصیه های مدیریتی',
    ],
    strongKeywords: ['توصیه', 'پیشنهاد', 'راهکار', 'استراتژی', 'اقدام', 'بهبود'],
    contextKeywords: ['افزایش', 'رشد', 'پیشنهادات', 'برنامه', 'مدیریتی', 'بهینه'],
    negativeKeywords: ['فرمول', 'چیست', 'تعریف'],
  },

  // 4. METRIC DEFINITIONS & FORMULAS
  {
    intent: 'METRIC_DEFINITIONS',
    priority: 12,
    exactPhrases: [
      'فرمول aov',
      'فرمول محاسبه',
      'درآمد خالص یعنی چی',
      'تعریف شاخص',
      'معنی aov',
      'چیست',
    ],
    strongKeywords: ['فرمول', 'تعریف', 'معنی', 'مفهوم', 'چیست', 'چگونه محاسبه'],
    contextKeywords: ['شاخص', 'متریک', 'محاسبه'],
  },

  // 5. RETURN & CANCELLATION RATE
  {
    intent: 'RETURN_CANCEL_RATE',
    priority: 11,
    exactPhrases: [
      'نرخ مرجوعی',
      'نرخ کنسلی',
      'میزان مرجوعی',
      'کالاهای برگشتی',
      'سفارشات لغو شده',
      'درصد مرجوعی',
    ],
    strongKeywords: ['مرجوع', 'مرجوعی', 'کنسل', 'کنسلی', 'لغو', 'برگشت', 'انصراف'],
    contextKeywords: ['درصد', 'نرخ', 'خسارت', 'عودت', 'علت'],
  },

  // 6. AOV (AVERAGE ORDER VALUE)
  {
    intent: 'AOV',
    priority: 10,
    exactPhrases: [
      'میانگین ارزش سفارش',
      'ارزش سبد خرید',
      'میانگین فاکتور',
      'میانگین هر سفارش',
      'متوسط هر خرید',
    ],
    strongKeywords: ['aov', 'سبد', 'میانگین سفارش', 'متوسط سفارش', 'میانگین هر خرید'],
    contextKeywords: ['میانگین', 'متوسط', 'فاکتور', 'خرید'],
    negativeKeywords: ['شهر', 'دسته', 'مرجوع'],
  },

  // 7. UNIQUE CUSTOMERS
  {
    intent: 'UNIQUE_CUSTOMERS',
    priority: 9,
    exactPhrases: [
      'تعداد مشتریان',
      'مشتریان یکتا',
      'چند نفر خرید کردند',
      'خریداران منحصر به فرد',
      'پایگاه مشتریان',
    ],
    strongKeywords: ['مشتری', 'مشتریان', 'خریدار', 'خریداران', 'یکتا'],
    contextKeywords: ['تعداد', 'نفر', 'وفادار', 'جدید'],
  },

  // 8. ORDER COUNT
  {
    intent: 'ORDER_COUNT',
    priority: 8,
    exactPhrases: [
      'تعداد کل سفارش ها',
      'چند سفارش ثبت شده',
      'تعداد فاکتورها',
      'چند تا فاکتور',
      'حجم سفارشات',
    ],
    strongKeywords: ['تعداد سفارش', 'چند سفارش', 'تعداد فاکتور', 'تعداد خرید', 'حجم سفارش'],
    contextKeywords: ['فاکتور', 'سفارشات', 'تراکنش', 'تعداد'],
    negativeKeywords: ['درآمد', 'مبلغ', 'پول', 'ریال', 'تومان'],
  },

  // 9. GROSS VS NET REVENUE
  {
    intent: 'GROSS_NET_REVENUE',
    priority: 7,
    exactPhrases: [
      'درآمد ناخالص',
      'درآمد خالص',
      'تفاوت ناخالص و خالص',
      'سود خالص',
      'فروش خالص',
      'میزان سود',
    ],
    strongKeywords: ['خالص', 'ناخالص', 'تفاضل', 'کسر', 'درامد خالص', 'درامد ناخالص'],
    contextKeywords: ['سود', 'درآمد', 'فروش', 'دریافتی'],
  },

  // 10. TOP / BOTTOM PRODUCTS & CATEGORIES
  {
    intent: 'TOP_BOTTOM_PRODUCTS_CATEGORIES',
    priority: 6,
    exactPhrases: [
      'پرسودترین دسته',
      'پرفروش ترین دسته',
      'پرفروش ترین محصول',
      'بهترین دسته کالا',
      'ضعیف ترین دسته',
      'کم فروش ترین',
      'رتبه بندی محصولات',
      'سهم محصولات',
    ],
    strongKeywords: ['پرفروش', 'پرسود', 'کم فروش', 'بهترین', 'بدترین', 'برترین', 'رتبه', 'سهم'],
    contextKeywords: ['دسته', 'محصول', 'کالا', 'فروش', 'درصد'],
  },

  // 11. CITY / GEOGRAPHICAL ANALYSIS
  {
    intent: 'CITY_ANALYSIS',
    priority: 5,
    exactPhrases: [
      'تمرکز جغرافیایی',
      'وضعیت شهرها',
      'فروش در تهران',
      'توزیع جغرافیایی',
      'کدام شهرها',
      'بیشترین فروش در کدام شهر',
    ],
    strongKeywords: ['شهر', 'شهرها', 'استان', 'جغرافیا', 'جغرافیایی', 'ارسال', 'مقصد'],
    contextKeywords: ['تهران', 'مشهد', 'اصفهان', 'شیراز', 'تبریز', 'کرج', 'اهواز', 'قم'],
  },

  // 12. CATEGORY ANALYSIS
  {
    intent: 'CATEGORY_ANALYSIS',
    priority: 4,
    exactPhrases: [
      'تحلیل دسته ها',
      'دسته بندی محصولات',
      'وضعیت گروه کالا',
      'گروه کالایی',
    ],
    strongKeywords: ['دسته', 'دسته‌بندی', 'گروه کالا', 'دسته بندی'],
    contextKeywords: ['دیجیتال', 'پوشاک', 'خانه', 'زیبایی', 'ابزار', 'کتاب', 'محصول'],
  },

  // 13. SALES TREND & GROWTH/DROP
  {
    intent: 'SALES_TREND_DROP_GROWTH',
    priority: 3,
    exactPhrases: [
      'روند زمانی فروش',
      'افت فروش',
      'نوسان فروش',
      'روند صعودی یا نزولی',
      'رشد درآمد',
    ],
    strongKeywords: ['روند', 'نوسان', 'افت', 'کاهش', 'افزایش', 'جهش', 'صعودی', 'نزولی'],
    contextKeywords: ['زمان', 'تاریخ', 'روزانه', 'نمودار', 'ماهانه'],
  },

  // 14. TIME COMPARISON
  {
    intent: 'TIME_COMPARISON',
    priority: 2,
    exactPhrases: [
      'مقایسه با دوره قبل',
      'تغییر نسبت به هفته قبل',
      'رشد ماهانه',
      'مقایسه این ماه',
    ],
    strongKeywords: ['مقایسه', 'نسبت به قبل', 'دوره قبل', 'ماه قبل', 'هفته قبل'],
    contextKeywords: ['رشد', 'تغییر', 'قبلی', 'گذشته'],
  },

  // 15. SALES SUMMARY (GENERAL)
  {
    intent: 'SALES_SUMMARY',
    priority: 1,
    exactPhrases: [
      'خلاصه فروش',
      'گزارش کلی',
      'وضعیت کلی کسب و کار',
      'چقدر فروختیم',
      'کل درامد چقدر است',
      'جمع کل فروش',
      'امار کلی فروش',
      'وضعیت فروش',
    ],
    strongKeywords: ['فروش', 'درآمد', 'درامد', 'فروختیم', 'گردش مالی'],
    contextKeywords: ['خلاصه', 'عملکرد', 'کسب و کار', 'گزارش', 'مجموع', 'چقدر', 'وضعیت', 'امار', 'کل'],
  },

  // 16. LIMITATIONS AND SCOPE
  {
    intent: 'LIMITATIONS_AND_SCOPE',
    priority: 0,
    exactPhrases: [
      'محدودیت های داده',
      'فرضیات تحلیل',
      'ایا داده ها کافی است',
      'شواهد چقدر است',
    ],
    strongKeywords: ['محدودیت', 'فرضیات', 'فرضیه', 'اعتبار', 'شواهد'],
    contextKeywords: ['کافی', 'ناقص', 'داده'],
  },
];

/**
 * Extracts entities (categories, cities, target metric) from the query and available dataset
 */
export function extractEntities(
  normalizedQuery: string,
  availableCategories: string[] = [],
  availableCities: string[] = []
): ExtractedParameters {
  const params: ExtractedParameters = {
    rawMatchedKeywords: [],
  };

  // Match available categories from dataset
  for (const cat of availableCategories) {
    const normCat = normalizePersianText(cat);
    if (normCat && normalizedQuery.includes(normCat)) {
      params.category = cat;
      params.rawMatchedKeywords.push(cat);
      break;
    }
  }

  // If no category matched yet, attempt regex extraction for unknown category mentions (e.g., "دسته ساعت مچی")
  if (!params.category) {
    const catMatch = normalizedQuery.match(/(?:دسته بندی|دسته|گروه کالایی|گروه)\s+([آ-یa-z0-9\s]+?)(?:\s+(?:چقدر|چند|چگونه|را|رو|است|هست|چیست|چطوره|داریم)|$)/);
    if (catMatch && catMatch[1]) {
      const candidate = catMatch[1].trim();
      if (candidate.length > 1 && !['بندی', 'کالا', 'محصولات', 'محصول'].includes(candidate)) {
        params.category = candidate;
        params.rawMatchedKeywords.push(candidate);
      }
    }
  }

  // Match available cities from dataset
  for (const city of availableCities) {
    const normCity = normalizePersianText(city);
    if (normCity && normalizedQuery.includes(normCity)) {
      params.city = city;
      params.rawMatchedKeywords.push(city);
      break;
    }
  }

  // Common Iranian major cities fallback
  const commonCities = [
    'تهران', 'مشهد', 'اصفهان', 'شیراز', 'تبریز', 'کرج', 'اهواز', 'قم', 'رشت', 'یزد',
    'بندرعباس', 'کرمان', 'ارومیه', 'زاهدان', 'همدان', 'قزوین', 'ساری', 'گرگان', 'اراک'
  ];
  if (!params.city) {
    for (const c of commonCities) {
      if (normalizedQuery.includes(c)) {
        params.city = c;
        params.rawMatchedKeywords.push(c);
        break;
      }
    }
  }

  // Regex fallback for unknown city mentions (e.g. "شهر بوشهر")
  if (!params.city) {
    const cityMatch = normalizedQuery.match(/(?:شهر|استان|منطقه)\s+([آ-یa-z0-9]+)/);
    if (cityMatch && cityMatch[1]) {
      const candidate = cityMatch[1].trim();
      if (candidate.length > 1) {
        params.city = candidate;
        params.rawMatchedKeywords.push(candidate);
      }
    }
  }

  // Target metric extraction
  if (normalizedQuery.includes('مرجوع') || normalizedQuery.includes('کنسل')) {
    params.targetMetric = 'returns';
  } else if (normalizedQuery.includes('مشتری') || normalizedQuery.includes('خریدار')) {
    params.targetMetric = 'customers';
  } else if (normalizedQuery.includes('تعداد') || normalizedQuery.includes('فاکتور')) {
    params.targetMetric = 'orders';
  } else if (normalizedQuery.includes('سبد') || normalizedQuery.includes('aov') || normalizedQuery.includes('میانگین')) {
    params.targetMetric = 'aov';
  } else if (normalizedQuery.includes('درآمد') || normalizedQuery.includes('فروش') || normalizedQuery.includes('سود')) {
    params.targetMetric = 'revenue';
  }

  // Time range extraction with Persian digits (already converted to latin) & intervals
  const daysMatch = normalizedQuery.match(/(\d+)\s*(?:روز|روزه)/);
  const yearMatch = normalizedQuery.match(/\b(13\d{2}|14\d{2}|20\d{2})\b/);

  if (daysMatch) {
    params.timeRange = `last_${daysMatch[1]}_days`;
  } else if (yearMatch) {
    params.timeRange = `year_${yearMatch[1]}`;
  } else if (normalizedQuery.includes('امسال') || normalizedQuery.includes('سال جاری')) {
    params.timeRange = 'this_year';
  } else if (normalizedQuery.includes('سال قبل') || normalizedQuery.includes('سال گذشته')) {
    params.timeRange = 'last_year';
  } else if (normalizedQuery.includes('فصل گذشته') || normalizedQuery.includes('سه ماهه')) {
    params.timeRange = 'last_quarter';
  } else if (normalizedQuery.includes('هفته')) {
    params.timeRange = 'last_7_days';
  } else if (normalizedQuery.includes('ماه قبل') || normalizedQuery.includes('ماه گذشته')) {
    params.timeRange = 'last_month';
  } else if (normalizedQuery.includes('این ماه')) {
    params.timeRange = 'this_month';
  } else if (normalizedQuery.includes('امروز')) {
    params.timeRange = 'today';
  } else if (normalizedQuery.includes('دیروز')) {
    params.timeRange = 'yesterday';
  } else {
    params.timeRange = 'all';
  }

  return params;
}

/**
 * Resolves the user intent with scoring, rules, and parameter extraction
 */
export function classifyIntent(
  rawQuery: string,
  availableCategories: string[] = [],
  availableCities: string[] = []
): IntentResolution {
  const normalized = normalizePersianText(rawQuery);
  const tokens = tokenizePersianText(rawQuery);
  const stems = tokens.map(stemPersianWord);

  const params = extractEntities(normalized, availableCategories, availableCities);

  // Score each intent rule
  const scoredIntents = INTENT_RULES.map((rule) => {
    let score = 0;

    // 1. Exact phrase matches (+4.0)
    for (const phrase of rule.exactPhrases) {
      const normPhrase = normalizePersianText(phrase);
      if (normalized.includes(normPhrase)) {
        score += 4.0;
        params.rawMatchedKeywords.push(phrase);
      }
    }

    // 2. Strong keywords (+2.0)
    for (const kw of rule.strongKeywords) {
      const normKw = normalizePersianText(kw);
      if (normalized.includes(normKw) || tokens.includes(normKw) || stems.includes(normKw)) {
        score += 2.0;
        params.rawMatchedKeywords.push(kw);
      }
    }

    // 3. Context keywords (+0.75)
    for (const kw of rule.contextKeywords) {
      const normKw = normalizePersianText(kw);
      if (normalized.includes(normKw) || tokens.includes(normKw) || stems.includes(normKw)) {
        score += 0.75;
      }
    }

    // 4. Negative keywords (-3.0)
    if (rule.negativeKeywords) {
      for (const neg of rule.negativeKeywords) {
        const normNeg = normalizePersianText(neg);
        if (normalized.includes(normNeg)) {
          score -= 3.0;
        }
      }
    }

    // Slight bias from priority
    score += rule.priority * 0.05;

    return {
      intent: rule.intent,
      score,
    };
  });

  // Sort descending by score
  scoredIntents.sort((a, b) => b.score - a.score);
  const best = scoredIntents[0];

  // Specific context overrides based on extracted parameters
  let resolvedIntent: AssistantIntent = best && best.score >= 1.5 ? best.intent : 'UNKNOWN';

  // If a specific city was found and score is generic, bias toward CITY_ANALYSIS
  if (params.city && resolvedIntent === 'SALES_SUMMARY') {
    resolvedIntent = 'CITY_ANALYSIS';
  }

  // If a specific category was found, disambiguate between CATEGORY_ANALYSIS and TOP_BOTTOM
  if (params.category) {
    if (resolvedIntent === 'SALES_SUMMARY' || resolvedIntent === 'UNKNOWN') {
      resolvedIntent = 'CATEGORY_ANALYSIS';
    } else if (resolvedIntent === 'TOP_BOTTOM_PRODUCTS_CATEGORIES') {
      const isSuperlative = normalized.includes('ترین') || normalized.includes('بهترین') || normalized.includes('بدترین') || normalized.includes('رتبه');
      if (!isSuperlative) {
        resolvedIntent = 'CATEGORY_ANALYSIS';
      }
    }
  }

  // Guard against generic false positive SALES_SUMMARY
  if (resolvedIntent === 'SALES_SUMMARY') {
    const hasSalesKeyword = ['فروش', 'درآمد', 'درامد', 'فروختیم', 'گردش مالی', 'مالی', 'سود'].some((kw) => normalized.includes(kw));
    if (!hasSalesKeyword) {
      resolvedIntent = 'UNKNOWN';
    }
  }

  // Calculate normalized confidence (0.0 to 1.0)
  const confidence = best ? Math.min(1.0, Math.max(0.1, Number((best.score / 6.0).toFixed(2)))) : 0.0;

  let confidenceLabel: 'قطعی' | 'بالا' | 'متوسط' | 'پایین' = 'پایین';
  if (confidence >= 0.85) confidenceLabel = 'قطعی';
  else if (confidence >= 0.65) confidenceLabel = 'بالا';
  else if (confidence >= 0.40) confidenceLabel = 'متوسط';

  // Data requirements based on intent
  const dataRequirements: string[] = [];
  switch (resolvedIntent) {
    case 'GROSS_NET_REVENUE':
    case 'SALES_SUMMARY':
      dataRequirements.push('ستون مبلغ فروش یا قیمت کل', 'وضعیت سفارشات');
      break;
    case 'RETURN_CANCEL_RATE':
      dataRequirements.push('ستون وضعیت سفارش (مرجوعی/لغوی)');
      break;
    case 'AOV':
      dataRequirements.push('ستون مبلغ فروش', 'ستون شناسه فاکتور');
      break;
    case 'UNIQUE_CUSTOMERS':
      dataRequirements.push('ستون نام یا کد مشتری');
      break;
    case 'TOP_BOTTOM_PRODUCTS_CATEGORIES':
    case 'CATEGORY_ANALYSIS':
      dataRequirements.push('ستون دسته بندی یا نام کالا');
      break;
    case 'CITY_ANALYSIS':
      dataRequirements.push('ستون شهر یا استان');
      break;
    case 'ANOMALIES':
      dataRequirements.push('ستون عددی مبالغ یا مقادیر');
      break;
    default:
      dataRequirements.push('داده های فروش معتبر');
  }

  return {
    intent: resolvedIntent,
    confidence: resolvedIntent === 'UNKNOWN' ? 0.1 : confidence,
    confidenceLabel: resolvedIntent === 'UNKNOWN' ? 'پایین' : confidenceLabel,
    parameters: params,
    dataRequirements,
    isSupported: resolvedIntent !== 'UNKNOWN',
  };
}
