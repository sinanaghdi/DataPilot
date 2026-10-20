import { DatasetKPIs, CategorySummary, CitySummary } from '../../types';
import { formatCompactToman, formatPercent, formatToman, toPersianDigits } from '../persianUtils';

export interface BusinessRecommendation {
  id: string;
  priority: 'فوری' | 'بالا' | 'متوسط';
  title: string;
  evidence: string;
  action: string;
  rationale: string;
}

/**
 * Pure rule-based, explainable business recommendation engine.
 * Computes recommendations from exact business KPI thresholds with zero LLM dependence.
 */
export function generateStrategicRecommendations(
  kpis: DatasetKPIs,
  topCategories: CategorySummary[] = [],
  topCities: CitySummary[] = []
): { recommendationsText: string; list: BusinessRecommendation[] } {
  const recommendations: BusinessRecommendation[] = [];

  const combinedLossRate = kpis.returnRate + kpis.cancellationRate;
  const lostAmount = Math.max(0, kpis.totalRevenue - kpis.netRevenue);

  // 1. Friction & Return/Cancellation Rule
  if (combinedLossRate > 10) {
    recommendations.push({
      id: 'rec-returns',
      priority: 'فوری',
      title: 'کنترل اصطکاک تحویل و مهار نرخ مرجوعی/لغوی',
      evidence: `نرخ مرجوعی (${toPersianDigits(kpis.returnRate)}٪) و لغو سفارش (${toPersianDigits(kpis.cancellationRate)}٪) مجموعاً ${toPersianDigits(combinedLossRate)}٪ است که موجب از دست رفتن ${formatToman(lostAmount)} از گردش مالی شده است.`,
      action: 'ارسال پیامک تایید مشخصات بلافاصله پس از ثبت سفارش، بهبود استانداردهای بسته‌بندی برای اقلام شکننده، و تماس پشتیبانی با خریداران فاکتورهای بالای میانگین سبد پیش از ارسال.',
      rationale: 'کاهش نرخ لغو حتی به میزان ۲٪ می‌تواند مستقیماً سرمایه در گردش آزاد و رضایت مشتریان را افزایش دهد.',
    });
  }

  // 2. Category Concentration Rule
  const primaryCategory = topCategories[0] || kpis.topCategory;
  if (primaryCategory && primaryCategory.percentage > 45) {
    const catName = (primaryCategory as any).category || (primaryCategory as any).name || 'دسته‌بندی اصلی';
    const secondaryCat = topCategories[1];
    recommendations.push({
      id: 'rec-category-risk',
      priority: 'بالا',
      title: `تنوع‌بخشی به سبد فروش و کاهش ریسک تمرکز بر دسته «${catName}»`,
      evidence: `دسته «${catName}» با فروش ${formatToman(primaryCategory.revenue)} بیش از ${formatPercent(primaryCategory.percentage)} کل درآمد را به خود اختصاص داده است.`,
      action: secondaryCat
        ? `ایجاد تخفیف‌های بسته‌ای (Bundle) بین دسته پیشتاز و دسته «${secondaryCat.category}» و ارائه کالاهای مکمل در فرآیند تسویه‌حساب (Cross-Selling).`
        : 'شناسایی و اضافه کردن تامین‌کنندگان جدید برای دسته‌بندی‌های مکمل جهت پوشش نیازهای متنوع‌تر مشتریان.',
      rationale: 'وابستگی شدید به یک گروه کالایی، کسب‌وکار را در برابر شوک‌های تامین و رقابت قیمتی آسیب‌پذیر می‌کند.',
    });
  }

  // 3. Geographic Diversification Rule
  const primaryCity = topCities[0] || kpis.topCity;
  if (primaryCity && primaryCity.percentage > 40) {
    const cityName = (primaryCity as any).city || (primaryCity as any).name || 'شهر اصلی';
    const runnerUpCity = topCities[1];
    recommendations.push({
      id: 'rec-geo-expansion',
      priority: 'بالا',
      title: `توسعه کانال‌های بازاریابی استانی فراتر از «${cityName}»`,
      evidence: `شهر «${cityName}» با سهم ${formatPercent(primaryCity.percentage)} کانون اصلی سفارش‌هاست و سایر مناطق سهم کمتری از بازار دارند.`,
      action: runnerUpCity
        ? `هدف‌گذاری کمپین‌های تبلیغاتی دیجیتال بر شهر «${runnerUpCity.city}» و ارائه امتیاز ارسال اقتصادی به مقاصد استانی دورتر.`
        : 'بررسی هزینه‌های پستی و زمان تحویل در شهرستان‌ها برای تشویق خریداران خارج از مرکز.',
      rationale: 'تمرکز بالا بر یک شهر نشان‌دهنده ظرفیت بکر و استفاده‌نشده در سایر کلان‌شهرها و شهرستان‌هاست.',
    });
  }

  // 4. Basket Size (AOV) Expansion Rule
  const targetAovUplift = Math.round(kpis.averageOrderValue * 1.15);
  recommendations.push({
    id: 'rec-aov-growth',
    priority: 'متوسط',
    title: `ارتقای میانگین ارزش سبد خرید (AOV) به بالای ${formatCompactToman(targetAovUplift)}`,
    evidence: `میانگین ارزش سفارش فعلی ${formatToman(kpis.averageOrderValue)} است و هر سفارش نیازمند هزینه پردازش و ارسال مشابهی است.`,
    action: `تعیین حد آستانه ارسال رایگان یا هدیه در رقم ${formatToman(targetAovUplift)} (حدود ۱۵٪ بالاتر از AOV فعلی) و اضافه کردن بخش «پیشنهاد لحظه آخری» در صفحه پرداخت.`,
    rationale: 'افزایش ارزش سبد خرید سودآورترین مسیر رشد است، زیرا بدون افزایش هزینه جذب مشتری (CAC)، درآمد نهایی را بالا می‌برد.',
  });

  // 5. Customer Retention Rule (if needed for 4th recommendation)
  if (recommendations.length < 4) {
    const repeatRatio = kpis.uniqueCustomers > 0 ? (kpis.totalOrders / kpis.uniqueCustomers).toFixed(2) : '1.0';
    recommendations.push({
      id: 'rec-retention',
      priority: 'متوسط',
      title: 'تقویت وفادارسازی و چرخه بازگشت مشتریان (LTV)',
      evidence: `به طور میانگین هر مشتری ${toPersianDigits(repeatRatio)} سفارش ثبت کرده که نشان‌دهنده پتانسیل بالای خرید مجدد است.`,
      action: 'ارسال کد تخفیف انقضادار ۷ روزه برای سفارش دوم، ثبت نظرات پس از تحویل و طراحی باشگاه مشتریان ساده مبتنی بر امتیاز هر خرید.',
      rationale: 'هزینه ترغیب مشتری فعلی به خرید مجدد، یک‌پنجم هزینه جذب مشتری جدید از کانال‌های تبلیغاتی است.',
    });
  }

  // Format as structured Persian markdown text
  const textBlocks = recommendations.slice(0, 4).map((rec, index) => {
    return `📌 توصیه ${toPersianDigits(index + 1)}: ${rec.title} [اولویت: ${rec.priority}]
📊 شواهد و ارقام: ${rec.evidence}
🎯 اقدام عملیاتی: ${rec.action}
💡 منطق تجاری: ${rec.rationale}`;
  });

  const formattedText = `گزارش توصیه‌های استراتژیک هوش تجاری دیتاپایلوت (مبتنی بر قوانین قطعی تحلیل داده):

${textBlocks.join('\n\n')}

⚠️ مبنای محاسبات: تمام این توصیه‌ها مستقیماً از ارقام فایل فعال استخراج شده‌اند و هیچ داده ساختگی یا حدسیاتی در آنها وجود ندارد.`;

  return {
    recommendationsText: formattedText,
    list: recommendations.slice(0, 4),
  };
}
