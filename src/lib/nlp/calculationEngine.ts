import { Dataset, DatasetKPIs, CategorySummary, CitySummary, TimeSeriesPoint, DataAnomaly, DataQualityReport } from '../../types';
import { IntentResolution } from './types';
import { formatCompactToman, formatPercent, formatToman, toPersianDigits } from '../persianUtils';

export interface CalculatedIntentResult {
  headline: string;
  evidencePoints: string[];
  cautiousInterpretation: string;
  actionableRecommendation: string;
  dataLimitations: string;
  suggestedQuestions: string[];
  metrics: Record<string, any>;
}

/**
 * Deterministic calculation engine for the Persian NLP assistant.
 * Computes exact numbers strictly from the dataset with zero fabrication.
 */
export function calculateIntentMetrics(
  resolution: IntentResolution,
  dataset: Dataset
): CalculatedIntentResult {
  const { kpis, categoryBreakdown, cityBreakdown, timeSeries, anomalies, qualityReport, rows } = dataset;
  const { intent, parameters } = resolution;

  switch (intent) {
    case 'SALES_SUMMARY': {
      const gross = kpis.totalRevenue;
      const net = kpis.netRevenue;
      const orders = kpis.totalOrders;
      const aov = kpis.averageOrderValue;
      const customers = kpis.uniqueCustomers;

      return {
        headline: `بر اساس فایل «${dataset.name}»، کل فروش ناخالص کسب‌وکار ${formatToman(gross)} و درآمد خالص محقق‌شده ${formatToman(net)} بوده است.`,
        evidencePoints: [
          `تعداد کل فاکتورهای ثبت‌شده: ${toPersianDigits(orders)} سفارش`,
          `درآمد ناخالص کل: ${formatToman(gross)}`,
          `درآمد خالص (پس از کسر مرجوعی و کنسلی): ${formatToman(net)}`,
          `میانگین ارزش هر سفارش (AOV): ${formatToman(aov)}`,
          `تعداد خریداران یکتا: ${toPersianDigits(customers)} مشتری`,
          `برترین گروه کالا: «${kpis.topCategory.name}» با ${formatPercent(kpis.topCategory.percentage)} سهم فروش`,
          `برترین کانون جغرافیایی: «${kpis.topCity.name}» با ${formatPercent(kpis.topCity.percentage)} سهم بازار`,
        ],
        cautiousInterpretation: `جریان مالی کسب‌وکار نشان‌دهنده فعالیت مستمر در دوره ثبت‌شده است. تفاوت بین ناخالص و خالص ناشی از مرجوعی‌ها (${toPersianDigits(kpis.returnRate)}٪) و لغو سفارشات (${toPersianDigits(kpis.cancellationRate)}٪) است که نیاز به مدیریت لجستیک دارد.`,
        actionableRecommendation: `تمرکز بر دسته‌بندی پرچم‌دار «${kpis.topCategory.name}» و بهبود زیرساخت ارسال در کانون اصلی «${kpis.topCity.name}» جهت افزایش ارزش سفارشات بعدی توصیه می‌شود.`,
        dataLimitations: `محاسبات مستقیماً از ${toPersianDigits(rows.length)} سطر ثبت‌شده استخراج شده و تراکنش‌های پیش یا پس از این بازه زمانی را شامل نمی‌شود.`,
        suggestedQuestions: [
          'پرسودترین دسته محصولات کدام است و چه سهمی از کل فروش دارد؟',
          'وضعیت تمرکز جغرافیایی سفارش‌ها در شهرهای مختلف چگونه است؟',
          'نرخ مرجوعی و کنسلی سفارشات چقدر است و چه توصیه‌ای دارید؟',
        ],
        metrics: { gross, net, orders, aov, customers },
      };
    }

    case 'GROSS_NET_REVENUE': {
      const gross = kpis.totalRevenue;
      const net = kpis.netRevenue;
      const lostRevenue = Math.max(0, gross - net);
      const lostPercentage = gross > 0 ? Number(((lostRevenue / gross) * 100).toFixed(1)) : 0;

      return {
        headline: `فروش ناخالص کل ${formatToman(gross)} و درآمد خالص ثبت‌شده ${formatToman(net)} است؛ مابه‌التفاوت به مبلغ ${formatToman(lostRevenue)} (${toPersianDigits(lostPercentage)}٪) ناشی از مرجوعی و انصراف خریداران است.`,
        evidencePoints: [
          `درآمد ناخالص: ${formatToman(gross)}`,
          `درآمد خالص محقق‌شده: ${formatToman(net)}`,
          `مبلغ از دست‌رفته به دلیل کنسلی/مرجوعی: ${formatToman(lostRevenue)}`,
          `درصد کاهش درآمد: ${toPersianDigits(lostPercentage)}٪ از کل گردش مالی`,
          `نرخ فاکتورهای مرجوعی: ${toPersianDigits(kpis.returnRate)}٪`,
          `نرخ فاکتورهای لغو شده: ${toPersianDigits(kpis.cancellationRate)}٪`,
        ],
        cautiousInterpretation: `فاصله ناخالص و خالص نشان‌دهنده اصطکاک پس از ثبت سفارش است؛ یعنی بخشی از سفارش‌ها نهایی نمی‌شوند یا پس از تحویل بازگردانده شده‌اند.`,
        actionableRecommendation: `کاهش نرخ لغو و مرجوعی حتی به میزان ۲٪ می‌تواند مستقیماً حدود ${formatToman(Math.round(gross * 0.02))} نقدینگی آزاد به کسب‌وکار تزریق کند.`,
        dataLimitations: `محاسبه بر اساس وضعیت ستون‌های سفارشات در داده‌های موجود است. در صورتی که فاکتورهای در راه هنوز تسویه نشده باشند ممکن است پس از تسویه این عدد تغییر کند.`,
        suggestedQuestions: [
          'نرخ مرجوعی و کنسلی سفارشات چقدر است و چه توصیه‌ای دارید؟',
          'میانگین ارزش سفارش (AOV) چقدر است؟',
        ],
        metrics: { gross, net, lostRevenue, lostPercentage },
      };
    }

    case 'ORDER_COUNT': {
      const totalOrders = kpis.totalOrders;
      const daysCount = Math.max(1, timeSeries.length);
      const dailyAverage = Number((totalOrders / daysCount).toFixed(1));

      return {
        headline: `در مجموع ${toPersianDigits(totalOrders)} سفارش در دیتابیس ثبت شده که به طور میانگین برابر با ${toPersianDigits(dailyAverage)} فاکتور در هر روز ثبت سفارش است.`,
        evidencePoints: [
          `تعداد کل سفارش‌های فاکتور شده: ${toPersianDigits(totalOrders)} عدد`,
          `تعداد روزهای فعال در دوره: ${toPersianDigits(daysCount)} روز`,
          `میانگین سفارش روزانه: ${toPersianDigits(dailyAverage)} سفارش در روز`,
          `تعداد مشتریان ثبت‌کننده سفارش: ${toPersianDigits(kpis.uniqueCustomers)} نفر`,
        ],
        cautiousInterpretation: `تعداد فاکتورها نشان‌دهنده ظرفیت پردازش و سفارش‌گیری عملیات شماست. نسبت سفارش به خریدار نشان می‌دهد مشتریان به طور متوسط چقدر تکرار خرید داشته‌اند.`,
        actionableRecommendation: `جهت افزایش تعداد سفارش‌ها بدون بالابردن هزینه جذب، پیاده‌سازی کمپین یادآوری به مشتریان قبلی پیشنهاد می‌شود.`,
        dataLimitations: `تنها سفارش‌هایی که سطر مجزا در فایل داشته‌اند شمارش شده‌اند.`,
        suggestedQuestions: [
          'چند مشتری یکتا در داده‌ها داریم؟',
          'میانگین ارزش هر سفارش (AOV) چقدر است؟',
        ],
        metrics: { totalOrders, daysCount, dailyAverage },
      };
    }

    case 'AOV': {
      const aov = kpis.averageOrderValue;
      const gross = kpis.totalRevenue;
      const orders = kpis.totalOrders;

      return {
        headline: `میانگین ارزش هر سفارش (AOV) در این مجموعه داده ${formatToman(aov)} است.`,
        evidencePoints: [
          `میانگین ارزش سبد خرید (AOV): ${formatToman(aov)}`,
          `مبنای محاسبه: کل فروش (${formatToman(gross)}) تقسیم بر تعداد سفارشات (${toPersianDigits(orders)})`,
          `سهم برترین گروه کالایی در افزایش میانگین: ${kpis.topCategory.name}`,
        ],
        cautiousInterpretation: `AOV نشان‌دهنده تمایل مشتریان به خرید اقلام گران‌تر یا اضافه کردن اقلام مکمل در هر سبد خرید است.`,
        actionableRecommendation: `با تعیین سقف ارسال رایگان در مبلغی حدود ۱۰٪ بالاتر از میانگین فعلی (${formatToman(Math.round(aov * 1.1))}) و پیشنهاد مکمل کالا (Cross-Sell)، میانگین سبد را تقویت نمایید.`,
        dataLimitations: `AOV ممکن است تحت تاثیر تراکنش‌های عمده یا ناهنجار چند سطر خاص قرار گرفته باشد.`,
        suggestedQuestions: [
          'آیا ناهنجاری قیمتی یا خرید مشکوکی در داده‌ها شناسایی شده است؟',
          'پرسودترین دسته محصولات کدام است؟',
        ],
        metrics: { aov, gross, orders },
      };
    }

    case 'UNIQUE_CUSTOMERS': {
      const customers = kpis.uniqueCustomers;
      const orders = kpis.totalOrders;
      const ordersPerCustomer = customers > 0 ? Number((orders / customers).toFixed(2)) : 0;

      return {
        headline: `تعداد خریداران یکتای شناسایی‌شده در این دیتاست ${toPersianDigits(customers)} مشتری است و به طور متوسط هر مشتری ${toPersianDigits(ordersPerCustomer)} سفارش ثبت نموده است.`,
        evidencePoints: [
          `تعداد خریداران یکتا: ${toPersianDigits(customers)} نفر`,
          `کل سفارشات: ${toPersianDigits(orders)} عدد`,
          `نسبت سفارش به مشتری: ${toPersianDigits(ordersPerCustomer)} فاکتور به ازای هر مشتری`,
          `میانگین آورده هر مشتری: ${formatToman(customers > 0 ? Math.round(kpis.totalRevenue / customers) : 0)}`,
        ],
        cautiousInterpretation: `هرچه نرخ سفارش به مشتری بالاتر از ۱ باشد، نشان‌دهنده وفاداری مشتری و خریدهای تکرارشونده است.`,
        actionableRecommendation: `ایجاد باشگاه مشتریان و برنامه‌های تشویقی برای دومین خرید، سودآوری را نسبت به هزینه جذب اولیه دوچندان می‌کند.`,
        dataLimitations: `شناسایی خریداران منوط به صحت نام/کد مشتری در فایل ورودی است و حساب‌های با املای متفاوت ممکن است جداگانه شمرده شده باشند.`,
        suggestedQuestions: [
          'کل فروش و خلاصه عملکرد چقدر است؟',
          'وضعیت تمرکز جغرافیایی سفارش‌ها چگونه است؟',
        ],
        metrics: { customers, orders, ordersPerCustomer },
      };
    }

    case 'RETURN_CANCEL_RATE': {
      const returnRate = kpis.returnRate;
      const cancellationRate = kpis.cancellationRate;
      const totalLostRate = Number((returnRate + cancellationRate).toFixed(1));
      const estimatedLostOrders = Math.round((kpis.totalOrders * totalLostRate) / 100);

      return {
        headline: `نرخ مرجوعی کالا ${toPersianDigits(returnRate)}٪ و نرخ لغو سفارش ${toPersianDigits(cancellationRate)}٪ است؛ مجموعاً ${toPersianDigits(totalLostRate)}٪ از سفارش‌ها (حدود ${toPersianDigits(estimatedLostOrders)} سفارش) محقق نشده‌اند.`,
        evidencePoints: [
          `نرخ سفارشات مرجوعی: ${toPersianDigits(returnRate)}٪`,
          `نرخ سفارشات انصرافی و لغوی: ${toPersianDigits(cancellationRate)}٪`,
          `مجموع عدم تحقق سفارش: ${toPersianDigits(totalLostRate)}٪`,
          `زیان ریالی مابه‌التفاوت ناخالص و خالص: ${formatToman(Math.max(0, kpis.totalRevenue - kpis.netRevenue))}`,
        ],
        cautiousInterpretation: `نرخ مرجوعی معمولاً نشانه عدم تطابق عکس و مشخصات کالا در سایت یا آسیب حین حمل است؛ در حالی که لغو سفارش پیش از ارسال معمولاً به علت تاخیر در آماده‌سازی یا نقص در درگاه پرداخت رخ می‌دهد.`,
        actionableRecommendation: `۱. بازبینی کیفیت بسته‌بندی برای کاهش مرجوعی اقلام حساس\n۲. ارسال پیامک پیگیری بلافاصله پس از ثبت سفارش جهت کاهش لغو\n۳. ممیزی کالاهای با بیشترین برگشتی و توقف موقت فروش آنها.`,
        dataLimitations: `ستون علت مرجوعی در داده‌های پایه ثبت نشده و تحلیل بر مبنای برچسب وضعیت فاکتور است.`,
        suggestedQuestions: [
          'درآمد ناخالص و درآمد خالص چه تفاوتی دارند؟',
          'آیا ناهنجاری قیمتی یا سفارش مشکوکی ثبت شده است؟',
        ],
        metrics: { returnRate, cancellationRate, totalLostRate, estimatedLostOrders },
      };
    }

    case 'TOP_BOTTOM_PRODUCTS_CATEGORIES': {
      const topCat = kpis.topCategory;
      const sorted = [...categoryBreakdown].sort((a, b) => b.revenue - a.revenue);
      const runnerUp = sorted[1];
      const lowestCat = sorted[sorted.length - 1];

      return {
        headline: `پرسودترین دسته‌بندی محصولات «${topCat.name}» با فروش ${formatToman(topCat.revenue)} و سهم ${formatPercent(topCat.percentage)} از کل درآمد است.`,
        evidencePoints: [
          `رتبه اول درآمد: «${topCat.name}» با ${formatToman(topCat.revenue)} (${formatPercent(topCat.percentage)})`,
          runnerUp ? `رتبه دوم: «${runnerUp.category}» با ${formatToman(runnerUp.revenue)} (${formatPercent(runnerUp.percentage)})` : 'تنها یک دسته‌بندی اصلی در داده‌ها موجود است.',
          lowestCat && lowestCat.category !== topCat.name ? `کم‌فروش‌ترین دسته: «${lowestCat.category}» با ${formatToman(lowestCat.revenue)} (${formatPercent(lowestCat.percentage)})` : '',
        ].filter(Boolean),
        cautiousInterpretation: `اتکای بیش از ${toPersianDigits(topCat.percentage)}٪ به یک دسته می‌تواند نشان‌دهنده ریسک تمرکز سبد باشد. هرگونه اخلال در تامین این دسته می‌تواند درآمد کلی را با شوک مواجه کند.`,
        actionableRecommendation: `ضمن حفظ رشد در دسته پرفروش «${topCat.name}»، ایجاد پروموشن‌های بسته‌ای (Bundle) با دسته «${runnerUp?.category || 'سایر دسته‌ها'}» برای تنوع‌بخشی درآمدی توصیه می‌شود.`,
        dataLimitations: `رتبه‌بندی بر مبنای تجمیع ستون دسته‌بندی در داده‌های ورودی انجام گرفته است.`,
        suggestedQuestions: [
          'سهم هر کدام از دسته‌بندی‌ها از کل فروش چقدر است؟',
          'وضعیت تمرکز جغرافیایی سفارش‌ها در شهرهای مختلف چگونه است؟',
        ],
        metrics: { topCat, runnerUp, lowestCat },
      };
    }

    case 'CATEGORY_ANALYSIS': {
      // Check if user asked about a specific category
      if (parameters.category) {
        const target = categoryBreakdown.find(
          (c) => c.category.toLowerCase().includes(parameters.category!.toLowerCase()) || parameters.category!.toLowerCase().includes(c.category.toLowerCase())
        );

        if (target) {
          return {
            headline: `در دسته‌بندی «${target.category}»، مجموع فروش ${formatToman(target.revenue)} و تعداد سفارش‌ها ${toPersianDigits(target.orderCount)} عدد بوده است (${formatPercent(target.percentage)} از کل فروش).`,
            evidencePoints: [
              `دسته انتخابی: «${target.category}»`,
              `فروش کل در این دسته: ${formatToman(target.revenue)}`,
              `سهم از کل گردش مالی: ${formatPercent(target.percentage)}`,
              `تعداد سفارش‌های ثبت‌شده: ${toPersianDigits(target.orderCount)} سفارش`,
              `میانگین ارزش سفارش در این دسته: ${formatToman(Math.round(target.revenue / Math.max(1, target.orderCount)))}`,
            ],
            cautiousInterpretation: `عملکرد این دسته نشان‌دهنده جایگاه آن در ترکیب درآمدی است.`,
            actionableRecommendation: `ارزیابی تامین‌کنندگان این دسته برای کاهش بهای تمام‌شده و پیشنهاد اقلام جانبی برای افزایش سبد خرید پیشنهاد می‌شود.`,
            dataLimitations: `آمار فقط مربوط به ردیف‌های نام‌گذاری شده تحت عنوان «${target.category}» است.`,
            suggestedQuestions: [
              'پرسودترین دسته محصولات کدام است؟',
              'خلاصه کلی فروش چقدر است؟',
            ],
            metrics: { target },
          };
        } else {
          const available = categoryBreakdown.map((c) => `«${c.category}»`).join('، ');
          return {
            headline: `دسته‌بندی «${parameters.category}» در مجموعه داده‌های این فایل یافت نشد.`,
            evidencePoints: [
              `دسته استعلام شده: «${parameters.category}»`,
              `دسته‌بندی‌های موجود در فایل: ${available || 'هیچ دسته‌ای ثبت نشده است.'}`,
            ],
            cautiousInterpretation: 'تنها اقلامی که نام دسته‌بندی آن‌ها دقیقاً در ستون مربوطه فایل آمده باشد قابل استخراج هستند.',
            actionableRecommendation: 'لطفاً نام دسته‌بندی را با املای دقیق ثبت‌شده در فایل بررسی کرده یا از دسته‌های موجود انتخاب کنید.',
            dataLimitations: 'دستیار هیچ داده‌ای را جعل یا حدس نمی‌زند و صرفاً بر اساس سطرهای واقعی فایل پاسخ می‌دهد.',
            suggestedQuestions: [
              'پرسودترین دسته محصولات کدام است؟',
              'خلاصه کلی فروش چقدر است؟',
            ],
            metrics: { searchedCategory: parameters.category, found: false },
          };
        }
      }

      // General category analysis
      const points = categoryBreakdown.map(
        (c) => `«${c.category}»: ${formatToman(c.revenue)} (${formatPercent(c.percentage)} از کل، ${toPersianDigits(c.orderCount)} سفارش)`
      );

      return {
        headline: `سبد فروش شامل ${toPersianDigits(categoryBreakdown.length)} دسته‌بندی مختلف است که پیشتاز آن «${kpis.topCategory.name}» می‌باشد.`,
        evidencePoints: points,
        cautiousInterpretation: `ترکیب دسته‌ها تنوع تقاضای مشتریان را نشان می‌دهد. دسته‌های با سهم زیر ۱۰٪ نیازمند بازنگری در شیوه بازاریابی یا تامین هستند.`,
        actionableRecommendation: `تخصیص بودجه تبلیغات بر اساس سودآورترین دسته‌ها و حذف اقلام کم‌تیراژ دسته‌های ضعیف.`,
        dataLimitations: `دسته‌بندی‌ها مستقیماً از داده‌های ثبت‌شده در فایل استخراج شده‌اند.`,
        suggestedQuestions: [
          'پرسودترین دسته محصولات کدام است؟',
          'وضعیت تمرکز جغرافیایی چگونه است؟',
        ],
        metrics: { count: categoryBreakdown.length },
      };
    }

    case 'CITY_ANALYSIS': {
      // Check if user asked about a specific city
      if (parameters.city) {
        const target = cityBreakdown.find(
          (c) => c.city.toLowerCase().includes(parameters.city!.toLowerCase()) || parameters.city!.toLowerCase().includes(c.city.toLowerCase())
        );

        if (target) {
          return {
            headline: `در شهر «${target.city}»، مجموع فروش ${formatToman(target.revenue)} و تعداد سفارش‌ها ${toPersianDigits(target.orderCount)} عدد بوده است (${formatPercent(target.percentage)} از کل درآمد).`,
            evidencePoints: [
              `شهر انتخابی: «${target.city}»`,
              `فروش ثبت‌شده: ${formatToman(target.revenue)}`,
              `سهم از کل درآمد کسب‌وکار: ${formatPercent(target.percentage)}`,
              `تعداد فاکتورهای ارسال شده به این شهر: ${toPersianDigits(target.orderCount)} عدد`,
              `میانگین ارزش فاکتور در این شهر: ${formatToman(Math.round(target.revenue / Math.max(1, target.orderCount)))}`,
            ],
            cautiousInterpretation: `حضور مشتریان در این شهر نشان‌دهنده نفوذ منطقه‌ای برند شماست.`,
            actionableRecommendation: `ارائه خدمات ارسال سریع‌تر یا تخفیف ویژه پستی برای مشتریان «${target.city}» جهت افزایش سهم بازار منطقه‌ای.`,
            dataLimitations: `صحت داده‌ها وابسته به استاندارد بودن نام شهر در ستون مربوطه فایل است.`,
            suggestedQuestions: [
              'وضعیت کلی تمرکز جغرافیایی در سایر شهرها چگونه است؟',
              'بیشترین فروش در کدام شهر است؟',
            ],
            metrics: { target },
          };
        } else {
          const available = cityBreakdown.map((c) => `«${c.city}»`).join('، ');
          return {
            headline: `شهر «${parameters.city}» در داده‌های سفارشات این مجموعه داده یافت نشد.`,
            evidencePoints: [
              `شهر استعلام شده: «${parameters.city}»`,
              `شهرهای ثبت‌شده در فایل: ${available || 'هیچ شهری ثبت نشده است.'}`,
            ],
            cautiousInterpretation: 'سفارشی برای این شهر در فایل بارگذاری‌شده ثبت نشده یا نام شهر متفاوت ثبت شده است.',
            actionableRecommendation: 'بررسی کنید آیا نام شهر با املای دیگری (مثلاً استان به جای شهر) در داده‌ها ذخیره شده است یا خیر.',
            dataLimitations: 'دستیار از فرضیه‌سازی و ابداع داده خودداری می‌کند و فقط حقایق فایل را بازتاب می‌دهد.',
            suggestedQuestions: [
              'بیشترین فروش در کدام شهر است؟',
              'وضعیت کلی تمرکز جغرافیایی چگونه است؟',
            ],
            metrics: { searchedCity: parameters.city, found: false },
          };
        }
      }

      // General city breakdown
      const top3 = cityBreakdown.slice(0, 3);
      const top3Share = top3.reduce((acc, c) => acc + c.percentage, 0);

      return {
        headline: `سفارشات در ${toPersianDigits(cityBreakdown.length)} شهر ثبت شده که برترین شهر «${kpis.topCity.name}» با سهم ${formatPercent(kpis.topCity.percentage)} است.`,
        evidencePoints: [
          `شهر رتبه اول: «${kpis.topCity.name}» با فروش ${formatToman(kpis.topCity.revenue)} (${formatPercent(kpis.topCity.percentage)})`,
          ...cityBreakdown.slice(1, 5).map(
            (c, i) => `رتبه ${toPersianDigits(i + 2)}: «${c.city}» با ${formatToman(c.revenue)} (${formatPercent(c.percentage)})`
          ),
          `مجموع سهم ۳ شهر برتر: ${toPersianDigits(top3Share.toFixed(1))}٪ از کل فروش`,
        ],
        cautiousInterpretation: `اگر سهم ۳ شهر اول بالای ۶۰٪ باشد، تمرکز بالای جغرافیایی وجود دارد و بازارهای سایر استان‌ها هنوز دست‌نخورده باقی مانده‌اند.`,
        actionableRecommendation: `برنامه‌ریزی تبلیغات هدفمند در شهرهای رده دوم (نظیر ${cityBreakdown[1]?.city || 'شهرهای بزرگ'}) برای کاهش وابستگی تک‌شهری و توسعه کانال‌های توزیع استانی.`,
        dataLimitations: `شهرهای فاقد سفارش در این گزارش ظاهر نمی‌شوند و تنها مبادلات ثبت‌شده لحاظ شده‌اند.`,
        suggestedQuestions: [
          'پرسودترین دسته محصولات کدام است؟',
          'آیا ناهنجاری قیمتی یا سفارش مشکوکی ثبت شده است؟',
        ],
        metrics: { topCity: kpis.topCity, top3Share },
      };
    }

    case 'SALES_TREND_DROP_GROWTH': {
      const points = timeSeries;
      if (points.length === 0) {
        return {
          headline: 'اطلاعات زمانی کافی برای ترسیم روند در این فایل وجود ندارد.',
          evidencePoints: ['ستون تاریخ در این فایل پیدا نشد یا فاقد مقادیر معتبر است.'],
          cautiousInterpretation: 'بدون ستون تاریخ، امکان تحلیل نوسان زمانی میسر نیست.',
          actionableRecommendation: 'اضافه کردن ستون تاریخ به فایل بارگذاری‌شده جهت فعال‌سازی نمودارهای روند.',
          dataLimitations: 'داده‌ها فاقد متغیر زمانی یکپارچه هستند.',
          suggestedQuestions: ['خلاصه فروش و کل درآمد چقدر است؟'],
          metrics: {},
        };
      }

      const highestDay = [...points].sort((a, b) => b.revenue - a.revenue)[0];
      const lowestDay = [...points].sort((a, b) => a.revenue - b.revenue)[0];
      const firstHalf = points.slice(0, Math.floor(points.length / 2));
      const secondHalf = points.slice(Math.floor(points.length / 2));

      const firstRevenue = firstHalf.reduce((sum, p) => sum + p.revenue, 0);
      const secondRevenue = secondHalf.reduce((sum, p) => sum + p.revenue, 0);
      const growthRate = firstRevenue > 0 ? Number((((secondRevenue - firstRevenue) / firstRevenue) * 100).toFixed(1)) : 0;
      const isPositive = growthRate >= 0;

      return {
        headline: `روند فروش در دوره ${toPersianDigits(points.length)} روزه ثبت‌شده دارای ${isPositive ? 'رشد مثبت' : 'کاهش'} به میزان ${toPersianDigits(Math.abs(growthRate))}٪ در نیمه دوم دوره نسبت به نیمه اول بوده است.`,
        evidencePoints: [
          `بیشترین روز فروش: تاریخ ${highestDay.jalaliDate || highestDay.date} با مبلغ ${formatToman(highestDay.revenue)} (${toPersianDigits(highestDay.orderCount)} سفارش)`,
          `کمترین روز فروش: تاریخ ${lowestDay.jalaliDate || lowestDay.date} با مبلغ ${formatToman(lowestDay.revenue)} (${toPersianDigits(lowestDay.orderCount)} سفارش)`,
          `مجموع درآمد نیمه اول دوره: ${formatToman(firstRevenue)}`,
          `مجموع درآمد نیمه دوم دوره: ${formatToman(secondRevenue)}`,
          `درصد تغییر روند: ${toPersianDigits(growthRate)}٪`,
        ],
        cautiousInterpretation: `نوسانات روزانه ممکن است ناشی از تعطیلات تقویمی، اجرای کمپین تخفیف مقطعی یا اتمام موجودی انبار در روزهای خاص باشد.`,
        actionableRecommendation: `ریشه‌یابی روز اوج فروش (${highestDay.jalaliDate || highestDay.date}) و تکرار شیوه‌های تبلیغاتی یا پیشنهادات اعمال شده در آن روز برای سایر ایام هفته.`,
        dataLimitations: `تحلیل صرفاً بر اساس روزهای ثبت‌شده در دیتاست است و روزهای بدون هیچ سفارشی محاسبه نشده‌اند.`,
        suggestedQuestions: [
          'پرسودترین دسته محصولات کدام است؟',
          'آیا ناهنجاری قیمتی در سفارشات وجود دارد؟',
        ],
        metrics: { highestDay, lowestDay, growthRate },
      };
    }

    case 'TIME_COMPARISON': {
      const points = timeSeries;
      if (points.length < 2) {
        return {
          headline: 'تعداد روزهای ثبت‌شده برای مقایسه دوره‌ای کافی نیست.',
          evidencePoints: ['حداقل دو دوره یا تاریخ متمایز برای مقایسه مورد نیاز است.'],
          cautiousInterpretation: 'داده‌ها محدود به یک بازه بسیار کوتاه هستند.',
          actionableRecommendation: 'بارگذاری فایل جامع‌تر با بازه زمانی حداقل یک‌ماهه.',
          dataLimitations: 'کمبود نقاط زمانی در دیتاست.',
          suggestedQuestions: ['خلاصه کلی فروش چقدر است؟'],
          metrics: {},
        };
      }

      const mid = Math.floor(points.length / 2);
      const period1 = points.slice(0, mid);
      const period2 = points.slice(mid);

      const rev1 = period1.reduce((sum, p) => sum + p.revenue, 0);
      const rev2 = period2.reduce((sum, p) => sum + p.revenue, 0);
      const ord1 = period1.reduce((sum, p) => sum + p.orderCount, 0);
      const ord2 = period2.reduce((sum, p) => sum + p.orderCount, 0);

      const revChange = rev1 > 0 ? Number((((rev2 - rev1) / rev1) * 100).toFixed(1)) : 0;
      const ordChange = ord1 > 0 ? Number((((ord2 - ord1) / ord1) * 100).toFixed(1)) : 0;

      return {
        headline: `در مقایسه دو نیمه زمانی، درآمد فروش ${revChange >= 0 ? 'رشد' : 'افت'} ${toPersianDigits(Math.abs(revChange))}٪ و تعداد سفارش‌ها ${ordChange >= 0 ? 'افزایش' : 'کاهش'} ${toPersianDigits(Math.abs(ordChange))}٪ داشته است.`,
        evidencePoints: [
          `درآمد دوره اول (${toPersianDigits(period1.length)} روز): ${formatToman(rev1)} با ${toPersianDigits(ord1)} سفارش`,
          `درآمد دوره دوم (${toPersianDigits(period2.length)} روز): ${formatToman(rev2)} با ${toPersianDigits(ord2)} سفارش`,
          `تغییر درصد درآمد: ${toPersianDigits(revChange)}٪`,
          `تغییر درصد تعداد سفارش: ${toPersianDigits(ordChange)}٪`,
        ],
        cautiousInterpretation: `تغییرات دوره دوم نشان‌دهنده شتاب تقاضا در کسب‌وکار است. در صورت افت، باید تغییرات قیمتی یا رقابتی بررسی شود.`,
        actionableRecommendation: `حفظ شتاب مثبت با فعال‌سازی تخفیف‌های هدفمند روی کالاهای با حاشیه سود بالا در پایان هر دوره.`,
        dataLimitations: `تقسیم دوره به دو نیمه مساوی بر اساس تعداد رکوردهای روزانه موجود انجام شده است.`,
        suggestedQuestions: [
          'روند زمانی فروش چگونه است؟',
          'نرخ مرجوعی و کنسلی چقدر است؟',
        ],
        metrics: { rev1, rev2, revChange, ord1, ord2, ordChange },
      };
    }

    case 'ANOMALIES': {
      const count = anomalies.length;
      if (count === 0) {
        return {
          headline: 'با الگوریتم آماری Z-Score و چارک‌های IQR هیچ ناهنجاری آماری شدیدی در داده‌های شما کشف نشد.',
          evidencePoints: [
            'کلیه تراکنش‌ها در محدوده استاندارد نرمال قرار دارند.',
            'نمره Z تمام ردیف‌ها کمتر از آستانه بحرانی ۲.۵ است.',
          ],
          cautiousInterpretation: 'سلامت ساختار مبالغ حاکی از انضباط در ثبت فاکتورهاست.',
          actionableRecommendation: 'ادامه نظارت دوره‌ای در هنگام آپلود فایل‌های فصول آینده.',
          dataLimitations: 'تنها متغیرهای عددی موجود مورد آزمون آماری انحراف معیار قرار گرفته‌اند.',
          suggestedQuestions: ['کیفیت داده‌ها و سلامت فایل چگونه است؟'],
          metrics: { count: 0 },
        };
      }

      const highSeverity = anomalies.filter((a) => a.severity === 'high');
      const maxAnomaly = [...anomalies].sort((a, b) => (b.zScore || 0) - (a.zScore || 0))[0];

      return {
        headline: `در مجموع ${toPersianDigits(count)} ناهنجاری آماری شناسایی شده است که ${toPersianDigits(highSeverity.length)} مورد آن دارای شدت بالا (انحراف بحرانی از میانگین) است.`,
        evidencePoints: [
          `تعداد کل موارد نامتعارف: ${toPersianDigits(count)} مورد`,
          `موارد با شدت بحرانی (High): ${toPersianDigits(highSeverity.length)} تراکنش`,
          maxAnomaly ? `شدیدترین ناهنجاری در سطر ${toPersianDigits(maxAnomaly.rowIndex + 1)}: ستون «${maxAnomaly.columnName}» با مقدار ${typeof maxAnomaly.value === 'number' ? formatToman(maxAnomaly.value) : maxAnomaly.value} (نمره Z: ${toPersianDigits(maxAnomaly.zScore || 0)})` : '',
        ].filter(Boolean),
        cautiousInterpretation: `ناهنجاری‌های با Z-Score بالا معمولاً یا ناشی از خریدهای عمده شرکتی (B2B) هستند یا خطای ورود دستی داده (مانند اضافه درج شدن یک صفر در مبلغ).`,
        actionableRecommendation: `ممیزی دقیق سطر ${toPersianDigits((maxAnomaly?.rowIndex || 0) + 1)} توسط حسابداری جهت اطمینان از عدم خطای سهوی در فاکتور.`,
        dataLimitations: `تشخیص آماری نشان‌دهنده فاصله از رفتار عمومی داده است و لزوماً به معنی تخلف یا کلاهبرداری نیست.`,
        suggestedQuestions: [
          'چگونه ناهنجاری‌ها را اصلاح کنیم؟',
          'کیفیت کل داده‌ها چقدر است؟',
        ],
        metrics: { count, highSeverityCount: highSeverity.length, maxAnomaly },
      };
    }

    case 'DATA_QUALITY': {
      const q = qualityReport;
      return {
        headline: `نمره سلامت و کیفیت این مجموعه داده ${toPersianDigits(q.cleanlinessScore)} از ۱۰۰ ارزیابی شده و وضعیت کلی آن «${q.healthStatus}» است.`,
        evidencePoints: [
          `نمره پاکسازی داده: ${toPersianDigits(q.cleanlinessScore)} / ۱۰۰`,
          `وضعیت سلامت کلی: «${q.healthStatus}»`,
          `سطرهای تکراری کشف‌شده: ${toPersianDigits(q.duplicateRowsCount)} سطر`,
          `سلول‌های فاقد مقدار (Null یا خالی): ${toPersianDigits(q.missingValuesTotal)} سلول`,
          `سطرهای ناقص یا مخدوش: ${toPersianDigits(q.malformedRowsCount)} سطر`,
          `درصد مقادیر گمشده: ${toPersianDigits(Number(q.missingValuesPercentage.toFixed(1)))}٪`,
        ],
        cautiousInterpretation: `نمره سلامت به شما نشان می‌دهد چقدر می‌توانید به محاسبات تحلیلی اعتماد کنید. وجود سطرهای تکراری می‌تواند درآمد را به صورت کاذب بالا ببرد.`,
        actionableRecommendation: q.duplicateRowsCount > 0
          ? `حذف ${toPersianDigits(q.duplicateRowsCount)} سطر تکراری کشف‌شده پیش از نهایی‌سازی گزارش‌های مالی فصلی.`
          : 'داده‌ها از سطح پاکیزگی مناسبی برخوردارند؛ جهت حفظ کیفیت، اعتبارسنجی مقادیر را در سیستم ثبت فاکتور فعال نگه دارید.',
        dataLimitations: `ممیزی صرفاً خطاهای ساختاری فیلدها را می‌سنجد و صحت واقعی هویت افراد را اعتبارسنجی نمی‌کند.`,
        suggestedQuestions: [
          'خلاصه کلی عملکرد فروش چقدر است؟',
          'آیا ناهنجاری قیمتی شناسایی شده است؟',
        ],
        metrics: { cleanlinessScore: q.cleanlinessScore, health: q.healthStatus },
      };
    }

    case 'RECOMMENDATIONS': {
      // Dynamic tailored recommendation summary based on actual metrics
      const recs: string[] = [];

      if (kpis.returnRate + kpis.cancellationRate > 15) {
        recs.push(`کاهش نرخ مرجوعی/کنسلی (${toPersianDigits(kpis.returnRate + kpis.cancellationRate)}٪) با تماس پیش از ارسال و بازرسی بسته‌بندی`);
      }

      if (kpis.topCategory.percentage > 50) {
        recs.push(`کاهش ریسک تمرکز بر دسته «${kpis.topCategory.name}» (${formatPercent(kpis.topCategory.percentage)}) از طریق عرضه محصولات جانبی`);
      }

      if (kpis.topCity.percentage > 40) {
        recs.push(`توسعه سهم بازار در سایر استان‌ها برای کاهش وابستگی به شهر «${kpis.topCity.name}»`);
      }

      recs.push(`افزایش میانگین سفارش (${formatToman(kpis.averageOrderValue)}) با بسته‌های تشویقی بالای ${formatToman(Math.round(kpis.averageOrderValue * 1.15))}`);

      return {
        headline: `بر مبنای تحلیل شاخص‌های مالی و عملیاتی فعلی، ۴ اقدام کلیدی برای بهبود سودآوری پیشنهاد می‌شود.`,
        evidencePoints: recs.map((r, i) => `اقدام ${toPersianDigits(i + 1)}: ${r}`),
        cautiousInterpretation: `این توصیه‌ها مستقیماً حاصل فرمول‌های مقایسه با استانداردهای خرده‌فروشی آنلاین و توزیع فعلی شاخص‌های شماست.`,
        actionableRecommendation: `اجرای اولویت اول (مدیریت لغوی و مرجوعی‌ها) سریع‌ترین اثر را بر نقدینگی ماه جاری خواهد داشت.`,
        dataLimitations: `توصیه‌ها بدون آگاهی از هزینه‌های تبلیغات و حاشیه سود خرید کالا صادر شده‌اند.`,
        suggestedQuestions: [
          'نرخ مرجوعی و کنسلی چقدر است؟',
          'پرسودترین دسته محصولات کدام است؟',
        ],
        metrics: { recsCount: recs.length },
      };
    }

    case 'METRIC_DEFINITIONS': {
      return {
        headline: 'تعاریف و فرمول‌های محاسباتی شاخص‌های کلیدی در پلتفرم دیتاپایلوت:',
        evidencePoints: [
          '۱. درآمد ناخالص (Gross Revenue): مجموع ریالی تمام فاکتورهای صادرشده بدون در نظر گرفتن وضعیت لغو یا مرجوعی.',
          '۲. درآمد خالص (Net Revenue): درآمد ناخالص منهای ارزش سفارش‌های لغو شده، انصرافی یا مرجوع شده.',
          '۳. میانگین ارزش سفارش (AOV): کل فروش ناخالص تقسیم بر تعداد کل فاکتورها (Gross Revenue / Orders).',
          '۴. نرخ مرجوعی (Return Rate): تعداد فاکتورهای برگشت‌خورده تقسیم بر کل فاکتورها ضربدر ۱۰۰.',
          '۵. نمره Z ناهنجاری (Z-Score): فاصله هر تراکنش از میانگین بخشیده بر انحراف معیار کل (X - μ) / σ.',
        ],
        cautiousInterpretation: 'تمامی این فرمول‌ها استاندارد حسابداری مدیریت و هوش تجاری مدرن هستند.',
        actionableRecommendation: 'برای تحلیل هفتگی، تمرکز اصلی را بر روی دو شاخص درآمد خالص و AOV قرار دهید.',
        dataLimitations: 'فرمول‌ها قطعی هستند و بسته به استانداردهای خاص سازمان شما قابل شخصی‌سازی خواهند بود.',
        suggestedQuestions: [
          'میانگین ارزش سفارش ما چقدر است؟',
          'تفاوت ناخالص و خالص چقدر است؟',
        ],
        metrics: {},
      };
    }

    case 'LIMITATIONS_AND_SCOPE': {
      return {
        headline: `این گزارش و پاسخ‌های تحلیلی صرفاً بر مبنای محتویات فایل «${dataset.name}» با ${toPersianDigits(rows.length)} ردیف داده تنظیم شده است.`,
        evidencePoints: [
          `تعداد ردیف‌های بررسی‌شده: ${toPersianDigits(rows.length)} سطر`,
          `تعداد ستون‌های استخراج‌شده: ${toPersianDigits(dataset.columns.length)} ستون`,
          `وضعیت سلامت فایل: ${toPersianDigits(qualityReport.cleanlinessScore)} از ۱۰۰`,
          'پوشش داده: محدود به فاکتورهای ثبت‌شده در این فایل مشخص.',
        ],
        cautiousInterpretation: 'دیتاپایلوت هیچ‌گونه عدد یا فرضیه‌ای خارج از این دیتاست تولید نمی‌کند و هیچ داده‌ای به مدل‌های خارجی ارسال نمی‌شود.',
        actionableRecommendation: 'جهت دریافت پاسخ‌های دقیق‌تر، ستون‌های تاریخ شمسی، کد محصول و وضعیت فاکتور را در فایل‌های اکسل خود استاندارد کنید.',
        dataLimitations: 'در صورت عدم ثبت برخی هزینه‌ها یا تخفیف‌ها در فایل، محاسبات صرفاً بر اقلام موجود متمرکز خواهد بود.',
        suggestedQuestions: [
          'خلاصه عملکرد فروش چقدر است؟',
          'کیفیت داده‌ها چگونه است؟',
        ],
        metrics: {},
      };
    }

    case 'UNKNOWN':
    default: {
      return {
        headline: 'بر اساس داده‌های موجود در فایل بارگذاری‌شده، شواهد کافی برای پاسخ قطعی به این پرسش وجود ندارد.',
        evidencePoints: [
          'پرسش مطرح‌شده با الگوهای شاخص‌های فروش، مبالغ، دسته‌بندی‌ها، شهرها یا ناهنجاری‌های موجود در فایل مطابقت ندارد.',
          `داده‌های در دسترس شما شامل ${toPersianDigits(rows.length)} سطر و ستون‌های (${dataset.columns.map((c) => c.name).slice(0, 5).join('، ')}) است.`,
        ],
        cautiousInterpretation: 'دیتاپایلوت به عنوان دستیار متعهد به عدم جعل داده، در صورتی که داده‌های موجود برای پاسخ دقیق ناکافی باشد، از گمانه‌زنی بی‌مبنا خودداری می‌کند.',
        actionableRecommendation: 'می‌توانید پرسش خود را درباره درآمد، میانگین سفارش، پرفروش‌ترین دسته، نرخ مرجوعی، توزیع شهرها یا ناهنجاری‌ها بپرسید.',
        dataLimitations: 'عدم تطابق با داده‌های ثبتی در فایل.',
        suggestedQuestions: [
          'پرسودترین دسته محصولات کدام است؟',
          'کل درآمد ناخالص و درآمد خالص چقدر است؟',
          'وضعیت تمرکز جغرافیایی سفارش‌ها در شهرهای مختلف چگونه است؟',
          'آیا ناهنجاری قیمتی یا خرید مشکوکی ثبت شده است؟',
          'نرخ مرجوعی و کنسلی سفارشات چقدر است؟',
        ],
        metrics: {},
      };
    }
  }
}
