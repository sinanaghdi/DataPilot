import { DataAnomaly } from '../../types';
import { formatToman, toPersianDigits } from '../persianUtils';

export interface AnomalyExplanationResult {
  fullReport: string;
  summary: {
    totalAnomalies: number;
    highSeverityCount: number;
    primaryCause: string;
    riskLevel: 'پایین' | 'متوسط' | 'بالا' | 'بحرانی';
  };
}

/**
 * Deterministic root-cause analyzer for statistical anomalies.
 * Inspects anomaly characteristics (Z-Score magnitude, column, value, context)
 * and produces structured, traceable explanations without external LLMs.
 */
export function explainAnomalies(
  anomalies: DataAnomaly[],
  datasetSummary?: {
    name?: string;
    totalRows?: number;
    totalRevenue?: number;
    aov?: number;
    returnRate?: number;
  }
): AnomalyExplanationResult {
  if (!anomalies || anomalies.length === 0) {
    return {
      fullReport: `ممیزی آماری ناهنجاری‌ها:
هیچ ناهنجاری یا داده پرتی فراتر از آستانه استاندارد (نمره Z > 2.5 یا چارک‌های IQR) در فایل شناسایی نشد.
کلیه داده‌ها توزیع نرمال داشته و نیازمند اقدام اصلاحی فوری نیستند.`,
      summary: {
        totalAnomalies: 0,
        highSeverityCount: 0,
        primaryCause: 'عدم وجود ناهنجاری آماری',
        riskLevel: 'پایین',
      },
    };
  }

  const highSeverity = anomalies.filter((a) => a.severity === 'high');
  const mediumSeverity = anomalies.filter((a) => a.severity === 'medium');

  // Identify categories of anomalies
  const priceAnomalies = anomalies.filter(
    (a) => a.columnName.includes('مبلغ') || a.columnName.includes('قیمت') || a.columnName.toLowerCase().includes('amount') || a.columnName.toLowerCase().includes('price')
  );
  const quantityAnomalies = anomalies.filter(
    (a) => a.columnName.includes('تعداد') || a.columnName.toLowerCase().includes('quantity')
  );

  const highestZAnomaly = [...anomalies].sort((a, b) => (b.zScore || 0) - (a.zScore || 0))[0];

  // Primary cause inference
  let primaryCause = 'تراکنش‌های حجیم یا سفارشات عمده تجاری';
  if (highestZAnomaly && (highestZAnomaly.zScore || 0) > 4.0) {
    primaryCause = 'احتمال بالای خطای سهوی ورود داده (افزودن صفر اضافی یا اشتباه در واحد پولی)';
  } else if (quantityAnomalies.length > 0) {
    primaryCause = 'سفارشات عمده همکار یا ثبت نادرست تعداد به جای بسته';
  }

  const riskLevel: 'پایین' | 'متوسط' | 'بالا' | 'بحرانی' =
    highSeverity.length > 3 ? 'بحرانی' : highSeverity.length > 0 ? 'بالا' : 'متوسط';

  // Specific row breakdowns
  const details = anomalies.slice(0, 5).map((a, i) => {
    const rowNum = toPersianDigits(a.rowIndex + 1);
    const valStr = typeof a.value === 'number' ? formatToman(a.value) : a.value;
    const zStr = a.zScore ? `نمره Z: ${toPersianDigits(a.zScore)}` : 'شناسایی شده با IQR';
    const isExtreme = (a.zScore || 0) > 3.0;

    let rowExplanation = '';
    if (typeof a.value === 'number' && datasetSummary?.aov && a.value > datasetSummary.aov * 5) {
      rowExplanation = `مبلغ این سطر بیش از ۵ برابر میانگین سبد خرید است. در صورت صحت، این یک سفارش ارزشمند سازمانی (B2B) محسوب می‌شود؛ در غیر این صورت، احتمال ثبت اشتباه ریال به جای تومان یا درج صفر اضافی وجود دارد.`;
    } else {
      rowExplanation = a.reasonPersian;
    }

    return `📌 مورد ${toPersianDigits(i + 1)} (سطر ${rowNum}):
ستون: «${a.columnName}» | مقدار: ${valStr} | ${zStr}
تفسیر: ${rowExplanation}`;
  });

  const fullReport = `گزارش موشکافانه علل ناهنجاری‌های آماری دیتاپایلوت (بر مبنای Z-Score و فاصله بین چارکی IQR):

📊 خلاصه وضعیت:
• کل موارد نامتعارف کشف‌شده: ${toPersianDigits(anomalies.length)} مورد
• موارد با شدت بحرانی (High Severity): ${toPersianDigits(highSeverity.length)} مورد
• سطح ریسک برآوردشده: ${riskLevel}
• علت محتمل اصلی: ${primaryCause}

🔍 تحلیل تفصیلی ردیف‌های دارای بیشترین انحراف:
${details.join('\n\n')}

⚖️ ارزیابی ریسک و فرصت برای مدیر کسب‌وکار:
۱. بعد فرصت: در صورتی که سفارش‌های با مبالغ درشت واقعی باشند، این مشتریان جزو دارایی‌های طلایی و کلیدی کسب‌وکار هستند و باید در کانال پشتیبانی VIP قرار گیرند.
۲. بعد ریسک مالی: ارقام نامتعارف بسیار بزرگ می‌توانند میانگین فروش (AOV) و درآمد پیش‌بینی‌شده را دچار انحراف کاذب کنند و در صورت لغو یا عدم تسویه، به جریان نقدینگی ضربه بزنند.

🎯 سه اقدام عملی و اصلاحی مشخص:
۱. تطبیق فاکتور سطر ${toPersianDigits(highestZAnomaly.rowIndex + 1)} با رسید بانکی یا بارنامه جهت تایید صحت فاکتور.
۲. برقراری تماس تشکر و پیگیری اختصاصی با مشتریان فاکتورهای عمده جهت اطمینان از رضایت و جلوگیری از مرجوعی.
۳. افزودن قانون اعتبارسنجی (Data Validation) در اکسل و سامانه ثبت سفارش برای هشدار در صورت ثبت سفارشات خارج از بازه نرمال (${highestZAnomaly.expectedRange}).`;

  return {
    fullReport,
    summary: {
      totalAnomalies: anomalies.length,
      highSeverityCount: highSeverity.length,
      primaryCause,
      riskLevel,
    },
  };
}
